begin;

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
  set unit_price = public.product_price_to_sar(p.sale_price, p.currency::text)
      + (oi.unit_price - public.product_price_to_sar(p.price, p.currency::text)),
      line_total = (
        public.product_price_to_sar(p.sale_price, p.currency::text)
        + (oi.unit_price - public.product_price_to_sar(p.price, p.currency::text))
      ) * oi.quantity
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
      shipping_address = shipping_address || jsonb_build_object('language', coalesce(p_customer->>'language', 'en')),
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
