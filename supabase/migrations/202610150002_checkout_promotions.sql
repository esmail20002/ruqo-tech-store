begin;

alter table public.orders
  add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
  add column if not exists coupon_code text;

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
  v_subtotal numeric(12,2);
  v_discount numeric(12,2);
begin
  v_order := public.create_guest_order(p_customer, p_items);
  if v_coupon_code is null then
    return v_order;
  end if;

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

  v_order_id := (v_order->>'id')::uuid;
  v_subtotal := (v_order->>'subtotal')::numeric;
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
  where id = v_order_id
  returning jsonb_build_object(
    'id', id,
    'order_number', order_number,
    'currency', currency,
    'subtotal', subtotal,
    'discount_total', discount_total,
    'coupon_code', coupon_code,
    'shipping_total', shipping_total,
    'total', total,
    'status', status
  ) into v_order;

  return v_order;
end;
$$;

revoke all on function public.create_guest_order_with_coupon(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_guest_order_with_coupon(jsonb, jsonb, text) to service_role;

commit;
