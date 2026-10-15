begin;

create table public.homepage_spotlight_items (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null unique references public.products(slug) on update cascade on delete cascade,
  sort_order integer not null default 0,
  bottom_detail text not null default 'description'
    check (bottom_detail in ('description', 'brand', 'rating', 'feature')),
  sale_enabled boolean not null default false,
  sale_price numeric(12,2),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_spotlight_sale_valid check (
    (sale_enabled and sale_price is not null and sale_ends_at is not null)
    or (not sale_enabled and sale_price is null and sale_starts_at is null and sale_ends_at is null)
  ),
  constraint homepage_spotlight_sale_dates_valid check (
    sale_ends_at is null or sale_starts_at is null or sale_ends_at > sale_starts_at
  )
);

create index homepage_spotlight_active_order_idx
  on public.homepage_spotlight_items (is_active, sort_order, created_at);

create trigger homepage_spotlight_set_updated_at
  before update on public.homepage_spotlight_items
  for each row execute function public.set_updated_at();

alter table public.homepage_spotlight_items enable row level security;

create policy homepage_spotlight_public_read on public.homepage_spotlight_items
  for select to anon, authenticated
  using (is_active and exists (
    select 1 from public.products p
    where p.slug = product_slug and p.is_active
  ));

create policy homepage_spotlight_admin_manage on public.homepage_spotlight_items
  for all to authenticated
  using (public.has_store_role(array['owner', 'admin']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin']::public.store_role[]));

grant select on public.homepage_spotlight_items to anon, authenticated;
grant insert, update, delete on public.homepage_spotlight_items to authenticated;

create function public.save_homepage_spotlight_item(
  p_product_slug text,
  p_sort_order integer default 0,
  p_bottom_detail text default 'description',
  p_sale_enabled boolean default false,
  p_sale_price numeric default null,
  p_sale_starts_at timestamptz default null,
  p_sale_ends_at timestamptz default null,
  p_is_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.products%rowtype;
  v_item public.homepage_spotlight_items%rowtype;
  v_product_slug text := nullif(trim(p_product_slug), '');
begin
  if not public.has_store_role(array['owner', 'admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can manage homepage spotlights.' using errcode = '42501';
  end if;
  if v_product_slug is null then
    raise exception 'Choose a product for the homepage spotlight.' using errcode = '22023';
  end if;
  if p_bottom_detail not in ('description', 'brand', 'rating', 'feature') then
    raise exception 'Choose a supported product detail.' using errcode = '22023';
  end if;

  select * into v_product
  from public.products
  where slug = v_product_slug and is_active
  for update;
  if not found then
    raise exception 'Choose a published product.' using errcode = '22023';
  end if;

  if coalesce(p_sale_enabled, false) then
    if p_sale_price is null or p_sale_price < 0 or p_sale_price >= v_product.price then
      raise exception 'Offer price must be lower than the product regular price.' using errcode = '22023';
    end if;
    if p_sale_ends_at is null or p_sale_ends_at <= coalesce(p_sale_starts_at, now()) then
      raise exception 'Offer end time must be later than its start time.' using errcode = '22023';
    end if;
    update public.products
    set sale_price = p_sale_price,
        sale_starts_at = p_sale_starts_at,
        sale_ends_at = p_sale_ends_at
    where slug = v_product_slug;
  else
    p_sale_price := null;
    p_sale_starts_at := null;
    p_sale_ends_at := null;
    update public.products
    set sale_price = null, sale_starts_at = null, sale_ends_at = null
    where slug = v_product_slug;
  end if;

  insert into public.homepage_spotlight_items (
    product_slug, sort_order, bottom_detail, sale_enabled,
    sale_price, sale_starts_at, sale_ends_at, is_active, updated_by
  ) values (
    v_product_slug, greatest(coalesce(p_sort_order, 0), 0), p_bottom_detail,
    coalesce(p_sale_enabled, false), p_sale_price, p_sale_starts_at,
    p_sale_ends_at, coalesce(p_is_active, true), auth.uid()
  )
  on conflict (product_slug) do update set
    sort_order = excluded.sort_order,
    bottom_detail = excluded.bottom_detail,
    sale_enabled = excluded.sale_enabled,
    sale_price = excluded.sale_price,
    sale_starts_at = excluded.sale_starts_at,
    sale_ends_at = excluded.sale_ends_at,
    is_active = excluded.is_active,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into v_item;

  return to_jsonb(v_item);
end;
$$;

revoke all on function public.save_homepage_spotlight_item(text, integer, text, boolean, numeric, timestamptz, timestamptz, boolean) from public, anon;
grant execute on function public.save_homepage_spotlight_item(text, integer, text, boolean, numeric, timestamptz, timestamptz, boolean) to authenticated;

create function public.delete_homepage_spotlight_item(p_product_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_store_role(array['owner', 'admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can manage homepage spotlights.' using errcode = '42501';
  end if;
  update public.products
  set sale_price = null, sale_starts_at = null, sale_ends_at = null
  where slug = p_product_slug;
  delete from public.homepage_spotlight_items where product_slug = p_product_slug;
end;
$$;

revoke all on function public.delete_homepage_spotlight_item(text) from public, anon;
grant execute on function public.delete_homepage_spotlight_item(text) to authenticated;

update public.store_settings
set setting_value = setting_value - 'home_showcase'
where setting_key = 'storefront' and setting_value ? 'home_showcase';

drop function if exists public.save_homepage_showcase(text, boolean, numeric, timestamptz, timestamptz, text);

commit;
