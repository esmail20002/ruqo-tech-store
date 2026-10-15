begin;

alter table public.products
  add column if not exists sale_price numeric(12,2),
  add column if not exists sale_starts_at timestamptz,
  add column if not exists sale_ends_at timestamptz;

alter table public.products
  add constraint products_sale_price_valid
    check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  add constraint products_sale_schedule_valid
    check (sale_price is null or (sale_ends_at is not null and (sale_starts_at is null or sale_ends_at > sale_starts_at)));

create index products_active_sale_idx on public.products (sale_ends_at, sale_starts_at)
  where sale_price is not null;

create function public.save_homepage_showcase(
  p_product_slug text,
  p_sale_enabled boolean default false,
  p_sale_price numeric default null,
  p_sale_starts_at timestamptz default null,
  p_sale_ends_at timestamptz default null,
  p_bottom_detail text default 'description'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings jsonb;
  v_previous jsonb;
  v_previous_slug text;
  v_product public.products%rowtype;
  v_product_slug text := nullif(trim(p_product_slug), '');
  v_showcase jsonb;
begin
  if not public.has_store_role(array['owner', 'admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can manage the homepage showcase.' using errcode = '42501';
  end if;

  select setting_value into v_settings
  from public.store_settings
  where setting_key = 'storefront'
  for update;
  v_previous := coalesce(v_settings->'home_showcase', '{}'::jsonb);
  v_previous_slug := nullif(v_previous->>'product_slug', '');

  if v_previous_slug is not null
     and (v_previous_slug is distinct from v_product_slug or not coalesce(p_sale_enabled, false)) then
    update public.products
    set sale_price = null, sale_starts_at = null, sale_ends_at = null
    where slug = v_previous_slug;
  end if;

  if v_product_slug is null then
    v_showcase := null;
  else
    select * into v_product
    from public.products
    where slug = v_product_slug and is_active
    for update;
    if not found then
      raise exception 'Choose a published product for the homepage showcase.' using errcode = '22023';
    end if;

    if coalesce(p_sale_enabled, false) then
      if p_sale_price is null or p_sale_price < 0 or p_sale_price >= v_product.price then
        raise exception 'The offer price must be lower than the product regular price.' using errcode = '22023';
      end if;
      if p_sale_ends_at is null or p_sale_ends_at <= coalesce(p_sale_starts_at, now()) then
        raise exception 'Choose an offer end time later than its start time.' using errcode = '22023';
      end if;
      update public.products
      set sale_price = p_sale_price,
          sale_starts_at = p_sale_starts_at,
          sale_ends_at = p_sale_ends_at
      where slug = v_product_slug;
    else
      update public.products
      set sale_price = null, sale_starts_at = null, sale_ends_at = null
      where slug = v_product_slug;
      p_sale_price := null;
      p_sale_starts_at := null;
      p_sale_ends_at := null;
    end if;

    if p_bottom_detail not in ('description', 'brand', 'rating', 'feature') then
      raise exception 'Choose a supported product detail for the lower card.' using errcode = '22023';
    end if;
    v_showcase := jsonb_build_object(
      'product_slug', v_product_slug,
      'sale_enabled', coalesce(p_sale_enabled, false),
      'sale_price', p_sale_price,
      'sale_starts_at', p_sale_starts_at,
      'sale_ends_at', p_sale_ends_at,
      'bottom_detail', p_bottom_detail
    );
  end if;

  if v_settings is null then
    insert into public.store_settings (setting_key, setting_value, description, is_public, updated_by)
    values ('storefront', jsonb_build_object('home_showcase', v_showcase), 'Public storefront settings', true, auth.uid());
  else
    update public.store_settings
    set setting_value = setting_value || jsonb_build_object('home_showcase', v_showcase),
        is_public = true,
        updated_by = auth.uid()
    where setting_key = 'storefront';
  end if;

  return coalesce(v_showcase, jsonb_build_object('cleared', true));
end;
$$;

revoke all on function public.save_homepage_showcase(text, boolean, numeric, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.save_homepage_showcase(text, boolean, numeric, timestamptz, timestamptz, text) to authenticated;

create or replace function public.create_guest_order_with_coupon(
  p_customer jsonb,
  p_items jsonb,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order jsonb;
  v_order_id uuid;
  v_coupon_code text := nullif(upper(trim(p_coupon_code)), '');
  v_promotion public.promotions%rowtype;
  v_settings jsonb;
  v_subtotal numeric(12,2);
  v_shipping numeric(12,2);
  v_shipping_fee numeric(12,2) := 25;
  v_free_threshold numeric(12,2) := 299;
  v_discount numeric(12,2) := 0;
begin
  v_order := public.create_guest_order(p_customer, p_items);
  v_order_id := (v_order->>'id')::uuid;

  update public.order_items oi
  set unit_price = p.sale_price + (oi.unit_price - p.price),
      line_total = (p.sale_price + (oi.unit_price - p.price)) * oi.quantity
  from public.products p
  where p.slug = oi.product_slug
    and oi.order_id = v_order_id
    and p.sale_price is not null
    and (p.sale_starts_at is null or p.sale_starts_at <= now())
    and p.sale_ends_at > now();

  select coalesce(sum(line_total), 0) into v_subtotal
  from public.order_items
  where order_id = v_order_id;

  select setting_value into v_settings
  from public.store_settings
  where setting_key = 'storefront';
  if v_settings is not null then
    v_free_threshold := coalesce((v_settings->>'free_shipping_threshold')::numeric, v_free_threshold);
    v_shipping_fee := coalesce((v_settings->>'standard_shipping_fee')::numeric, v_shipping_fee);
  end if;
  v_shipping := case when v_subtotal = 0 or v_subtotal >= v_free_threshold then 0 else v_shipping_fee end;

  update public.orders
  set subtotal = v_subtotal,
      discount_total = 0,
      coupon_code = null,
      promotion_id = null,
      shipping_total = v_shipping,
      total = v_subtotal + v_shipping
  where id = v_order_id;

  if v_coupon_code is not null then
    select p.* into v_promotion
    from public.promotions p
    where upper(p.coupon_code) = v_coupon_code
      and p.is_active
      and (p.starts_at is null or p.starts_at <= now())
      and (p.ends_at is null or p.ends_at > now())
    for share;
    if not found then
      raise exception 'This promotion code is invalid or expired.' using errcode = '22023';
    end if;
    if v_subtotal < v_promotion.minimum_order then
      raise exception 'The order does not meet this promotion minimum.' using errcode = '22023';
    end if;
    if v_promotion.discount_type = 'percentage' then
      v_discount := round(v_subtotal * v_promotion.discount_value / 100, 2);
    else
      v_discount := least(v_promotion.discount_value, v_subtotal);
    end if;
    update public.orders
    set promotion_id = v_promotion.id,
        coupon_code = v_coupon_code,
        discount_total = v_discount,
        total = greatest(subtotal - v_discount, 0) + shipping_total
    where id = v_order_id;
  end if;

  select jsonb_build_object(
    'id', id,
    'order_number', order_number,
    'currency', currency,
    'subtotal', subtotal,
    'discount_total', discount_total,
    'coupon_code', coupon_code,
    'shipping_total', shipping_total,
    'total', total,
    'status', status
  ) into v_order
  from public.orders
  where id = v_order_id;

  return v_order;
end;
$$;

revoke all on function public.create_guest_order_with_coupon(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_guest_order_with_coupon(jsonb, jsonb, text) to service_role;

commit;
