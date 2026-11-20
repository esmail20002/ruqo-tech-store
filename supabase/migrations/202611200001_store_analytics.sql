begin;

create table if not exists public.store_analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (
    event_type in (
      'page_view',
      'product_view',
      'product_share',
      'add_to_cart',
      'add_to_wishlist'
    )
  ),
  product_slug text null,
  page_path text not null default '/',
  session_id text not null,
  referrer text null,
  created_at timestamptz not null default now()
);

create index if not exists store_analytics_events_created_type_idx
  on public.store_analytics_events (created_at desc, event_type);

create index if not exists store_analytics_events_product_idx
  on public.store_analytics_events (product_slug, event_type, created_at desc)
  where product_slug is not null;

create index if not exists store_analytics_events_page_idx
  on public.store_analytics_events (page_path, created_at desc)
  where event_type = 'page_view';

alter table public.store_analytics_events enable row level security;

revoke all on public.store_analytics_events from anon, authenticated;
grant select on public.store_analytics_events to authenticated;

drop policy if exists store_analytics_events_read_staff on public.store_analytics_events;
create policy store_analytics_events_read_staff
  on public.store_analytics_events for select to authenticated
  using (
    public.has_store_role(
      array['owner', 'admin', 'catalog_manager', 'order_manager', 'marketing_manager']::public.store_role[]
    )
  );

create or replace function public.record_store_event(
  p_event_type text,
  p_product_slug text default null,
  p_page_path text default '/',
  p_session_id text default null,
  p_referrer text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event_type text := lower(btrim(coalesce(p_event_type, '')));
  v_product_slug text := nullif(left(btrim(coalesce(p_product_slug, '')), 120), '');
  v_page_path text := left(btrim(coalesce(p_page_path, '/')), 200);
  v_session_id text := nullif(left(btrim(coalesce(p_session_id, '')), 80), '');
  v_referrer text := nullif(left(btrim(coalesce(p_referrer, '')), 300), '');
begin
  if v_event_type not in (
    'page_view',
    'product_view',
    'product_share',
    'add_to_cart',
    'add_to_wishlist'
  ) then
    return;
  end if;

  if v_event_type <> 'page_view' and v_product_slug is null then
    return;
  end if;

  if v_page_path = '' then
    v_page_path := '/';
  elsif left(v_page_path, 1) <> '/' then
    v_page_path := '/' || v_page_path;
  end if;

  if v_session_id is null then
    v_session_id := gen_random_uuid()::text;
  end if;

  insert into public.store_analytics_events (
    event_type,
    product_slug,
    page_path,
    session_id,
    referrer
  )
  values (
    v_event_type,
    v_product_slug,
    v_page_path,
    v_session_id,
    v_referrer
  );
end;
$function$;

revoke all on function public.record_store_event(text, text, text, text, text) from public;
grant execute on function public.record_store_event(text, text, text, text, text) to anon, authenticated;

create or replace function public.get_store_analytics_summary(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_cutoff timestamptz;
  v_chart_days integer;
  v_result jsonb;
begin
  if not public.has_store_role(
    array['owner', 'admin', 'catalog_manager', 'order_manager', 'marketing_manager']::public.store_role[]
  ) then
    raise exception 'Insufficient permissions to view store analytics.'
      using errcode = '42501';
  end if;

  if p_days is not null and p_days > 0 then
    v_cutoff := now() - make_interval(days => p_days);
    v_chart_days := least(greatest(p_days, 1), 30);
  else
    v_cutoff := null;
    v_chart_days := 30;
  end if;

  with filtered_events as (
    select
      e.event_type,
      e.product_slug,
      e.page_path,
      e.session_id,
      e.created_at
    from public.store_analytics_events e
    where v_cutoff is null or e.created_at >= v_cutoff
  ),
  filtered_orders as (
    select
      o.id,
      o.total,
      o.created_at
    from public.orders o
    where v_cutoff is null or o.created_at >= v_cutoff
  ),
  filtered_order_items as (
    select
      oi.order_id,
      oi.product_slug,
      oi.quantity,
      oi.line_total
    from public.order_items oi
    join filtered_orders o on o.id = oi.order_id
    where oi.product_slug is not null and btrim(oi.product_slug) <> ''
  ),
  event_kpis as (
    select
      count(*) filter (where event_type = 'page_view') as site_visits,
      count(distinct session_id) filter (where event_type = 'page_view') as unique_visitors,
      count(*) filter (where event_type = 'product_view') as product_views,
      count(distinct session_id) filter (where event_type = 'product_view') as unique_product_viewers,
      count(*) filter (where event_type = 'product_share') as product_shares,
      count(*) filter (where event_type = 'add_to_cart') as cart_adds,
      count(*) filter (where event_type = 'add_to_wishlist') as wishlist_adds
    from filtered_events
  ),
  order_kpis as (
    select
      count(*) as total_orders,
      coalesce(sum(total), 0)::numeric(14,2) as total_revenue
    from filtered_orders
  ),
  unit_kpis as (
    select
      coalesce(sum(quantity), 0) as total_units_ordered
    from filtered_order_items
  ),
  product_events as (
    select
      product_slug,
      count(*) filter (where event_type = 'product_view') as product_views,
      count(distinct session_id) filter (where event_type = 'product_view') as unique_viewers,
      count(*) filter (where event_type = 'add_to_cart') as cart_adds,
      count(*) filter (where event_type = 'add_to_wishlist') as wishlist_adds,
      count(*) filter (where event_type = 'product_share') as product_shares
    from filtered_events
    where product_slug is not null
    group by product_slug
  ),
  product_orders as (
    select
      product_slug,
      count(distinct order_id) as orders_count,
      coalesce(sum(quantity), 0) as units_ordered,
      coalesce(sum(line_total), 0)::numeric(14,2) as revenue
    from filtered_order_items
    group by product_slug
  ),
  product_combined as (
    select
      coalesce(pe.product_slug, po.product_slug) as product_slug,
      coalesce(pe.product_views, 0) as product_views,
      coalesce(pe.unique_viewers, 0) as unique_viewers,
      coalesce(pe.cart_adds, 0) as cart_adds,
      coalesce(pe.wishlist_adds, 0) as wishlist_adds,
      coalesce(pe.product_shares, 0) as product_shares,
      coalesce(po.orders_count, 0) as orders_count,
      coalesce(po.units_ordered, 0) as units_ordered,
      coalesce(po.revenue, 0)::numeric(14,2) as revenue,
      (
        coalesce(po.units_ordered, 0) * 10
        + coalesce(pe.cart_adds, 0) * 4
        + coalesce(pe.product_shares, 0) * 3
        + coalesce(pe.wishlist_adds, 0) * 3
        + coalesce(pe.product_views, 0)
      ) as demand_score,
      case
        when coalesce(pe.product_views, 0) > 0 then
          round((coalesce(po.orders_count, 0)::numeric / pe.product_views::numeric) * 100, 1)
        else 0
      end as conversion_rate
    from product_events pe
    full outer join product_orders po on po.product_slug = pe.product_slug
  ),
  day_series as (
    select generate_series(
      (current_date - (v_chart_days - 1)),
      current_date,
      interval '1 day'
    )::date as day
  ),
  daily_events as (
    select
      created_at::date as day,
      count(*) filter (where event_type = 'page_view') as site_visits,
      count(*) filter (where event_type = 'product_view') as product_views
    from filtered_events
    where created_at >= (current_date - (v_chart_days - 1))::timestamptz
    group by created_at::date
  ),
  daily_orders as (
    select
      created_at::date as day,
      count(*) as orders
    from filtered_orders
    where created_at >= (current_date - (v_chart_days - 1))::timestamptz
    group by created_at::date
  ),
  daily_combined as (
    select
      to_char(ds.day, 'YYYY-MM-DD') as day,
      coalesce(de.site_visits, 0) as site_visits,
      coalesce(de.product_views, 0) as product_views,
      coalesce(do_.orders, 0) as orders
    from day_series ds
    left join daily_events de on de.day = ds.day
    left join daily_orders do_ on do_.day = ds.day
    order by ds.day asc
  ),
  top_pages as (
    select
      page_path,
      count(*) as visits,
      count(distinct session_id) as unique_visitors
    from filtered_events
    where event_type = 'page_view'
    group by page_path
    order by visits desc, page_path asc
    limit 8
  )
  select jsonb_build_object(
    'days', p_days,
    'generated_at', now(),
    'kpis', jsonb_build_object(
      'site_visits', ek.site_visits,
      'unique_visitors', ek.unique_visitors,
      'product_views', ek.product_views,
      'unique_product_viewers', ek.unique_product_viewers,
      'product_shares', ek.product_shares,
      'cart_adds', ek.cart_adds,
      'wishlist_adds', ek.wishlist_adds,
      'total_orders', ok.total_orders,
      'total_units_ordered', uk.total_units_ordered,
      'total_revenue', ok.total_revenue,
      'conversion_rate', case
        when ek.product_views > 0 then round((ok.total_orders::numeric / ek.product_views::numeric) * 100, 1)
        else 0
      end
    ),
    'daily', coalesce((select jsonb_agg(to_jsonb(d)) from daily_combined d), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(to_jsonb(tp)) from top_pages tp), '[]'::jsonb),
    'products', coalesce((select jsonb_agg(to_jsonb(pc) order by pc.demand_score desc, pc.units_ordered desc, pc.product_views desc) from product_combined pc), '[]'::jsonb)
  )
  into v_result
  from event_kpis ek
  cross join order_kpis ok
  cross join unit_kpis uk;

  return v_result;
end;
$function$;

revoke all on function public.get_store_analytics_summary(integer) from public;
grant execute on function public.get_store_analytics_summary(integer) to authenticated;

commit;
