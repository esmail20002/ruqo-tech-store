begin;

alter table public.products
  add constraint products_currency_supported
  check (currency in ('SAR', 'USD', 'EUR'));

create or replace function public.product_price_to_sar(p_amount numeric, p_currency text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_amount is null then
    return null;
  end if;

  case upper(coalesce(trim(p_currency), 'SAR'))
    when 'SAR' then return round(p_amount, 2);
    when 'USD' then return round(p_amount * 3.75, 2);
    when 'EUR' then return round(p_amount / 0.245, 2);
    else raise exception 'Unsupported product currency.' using errcode = '22023';
  end case;
end;
$$;

revoke all on function public.product_price_to_sar(numeric, text) from public, anon, authenticated;
grant execute on function public.product_price_to_sar(numeric, text) to service_role;

create or replace function public.create_guest_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_name text;
  v_email text;
  v_phone text;
  v_city text;
  v_street text;
  v_postal text;
  v_note text;
  v_language text;
  v_item jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_variant_key text;
  v_quantity integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2);
  v_total numeric(12,2);
  v_settings jsonb;
  v_free_threshold numeric(12,2) := 299;
  v_shipping_fee numeric(12,2) := 25;
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_line jsonb;
begin
  if jsonb_typeof(p_customer) <> 'object' or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid checkout payload' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'Order must contain between 1 and 20 distinct items' using errcode = '22023';
  end if;

  v_customer_name := nullif(trim(p_customer->>'name'), '');
  v_email := nullif(lower(trim(p_customer->>'email')), '');
  v_phone := nullif(trim(p_customer->>'phone'), '');
  v_city := nullif(trim(p_customer->>'city'), '');
  v_street := nullif(trim(p_customer->>'address'), '');
  v_postal := nullif(trim(p_customer->>'postal'), '');
  v_note := nullif(trim(p_customer->>'notes'), '');
  v_language := coalesce(p_customer->>'language', 'en');

  if v_customer_name is null or length(v_customer_name) > 120
     or v_phone is null or length(v_phone) < 6 or length(v_phone) > 30
     or v_city is null or length(v_city) > 100
     or v_street is null or length(v_street) < 5 or length(v_street) > 300
     or v_postal is null or length(v_postal) > 20
     or (v_email is not null and (length(v_email) > 254 or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
     or (v_note is not null and length(v_note) > 500)
     or v_language not in ('en', 'fr', 'es', 'zh', 'ar') then
    raise exception 'Please check the customer and delivery details' using errcode = '22023';
  end if;

  select s.setting_value into v_settings
  from public.store_settings s
  where s.setting_key = 'storefront';
  if v_settings is not null then
    v_free_threshold := coalesce((v_settings->>'free_shipping_threshold')::numeric, v_free_threshold);
    v_shipping_fee := coalesce((v_settings->>'standard_shipping_fee')::numeric, v_shipping_fee);
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object'
       or jsonb_typeof(v_item->'quantity') <> 'number'
       or (v_item->>'quantity')::numeric <> trunc((v_item->>'quantity')::numeric) then
      raise exception 'Invalid order item' using errcode = '22023';
    end if;

    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 99 then
      raise exception 'Item quantity must be between 1 and 99' using errcode = '22023';
    end if;

    select p.* into v_product
    from public.products p
    where p.slug = nullif(trim(v_item->>'product_slug'), '')
      and p.is_active = true
      and p.in_stock = true
    for update;
    if not found then
      raise exception 'An item is unavailable: %', v_item->>'product_slug' using errcode = '22023';
    end if;

    v_unit_price := public.product_price_to_sar(v_product.price, v_product.currency::text);
    v_variant_key := nullif(trim(v_item->>'variant_key'), '');
    if v_variant_key is not null then
      select pv.* into v_variant
      from public.product_variants pv
      where pv.variant_key = v_variant_key
        and pv.product_slug = v_product.slug
        and pv.is_active = true
      for update;
      if not found then
        raise exception 'An item option is unavailable' using errcode = '22023';
      end if;
      v_unit_price := public.product_price_to_sar(v_product.price + v_variant.price_adjustment, v_product.currency::text);
      if v_variant.stock_quantity is not null and v_variant.stock_quantity < v_quantity then
        raise exception 'Insufficient stock for an item option' using errcode = '22023';
      end if;
      if v_variant.stock_quantity is not null then
        update public.product_variants
        set stock_quantity = stock_quantity - v_quantity
        where id = v_variant.id;
      end if;
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_slug', v_product.slug,
      'product_name_translations', v_product.name_translations,
      'variant_label_translations', case when v_variant_key is null then '{}'::jsonb else v_variant.option_label_translations end,
      'sku', case when v_variant_key is null then null else v_variant.sku end,
      'quantity', v_quantity,
      'unit_price', v_unit_price,
      'line_total', v_line_total
    ));
  end loop;

  v_shipping := case when v_subtotal = 0 or v_subtotal >= v_free_threshold then 0 else v_shipping_fee end;
  v_total := v_subtotal + v_shipping;
  v_order_number := 'RUQ-' || to_char(now() at time zone 'UTC', 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    id, order_number, user_id, customer_name, customer_email, customer_phone,
    status, payment_method, payment_status, currency, subtotal, discount_total,
    shipping_total, total, shipping_address, customer_note
  ) values (
    v_order_id, v_order_number, null, v_customer_name, v_email, v_phone,
    'pending', 'cash_on_delivery', 'pending', 'SAR', v_subtotal, 0,
    v_shipping, v_total,
    jsonb_build_object('city', v_city, 'street', v_street, 'postal_code', v_postal),
    v_note
  );

  for v_line in select value from jsonb_array_elements(v_lines)
  loop
    insert into public.order_items (
      order_id, product_slug, product_name_translations,
      variant_label_translations, sku, quantity, unit_price, line_total
    ) values (
      v_order_id,
      v_line->>'product_slug',
      v_line->'product_name_translations',
      v_line->'variant_label_translations',
      v_line->>'sku',
      (v_line->>'quantity')::integer,
      (v_line->>'unit_price')::numeric,
      (v_line->>'line_total')::numeric
    );
  end loop;

  insert into public.order_events (order_id, from_status, to_status, note)
  values (v_order_id, null, 'pending', 'Guest checkout order created');

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'currency', 'SAR',
    'subtotal', v_subtotal,
    'shipping_total', v_shipping,
    'total', v_total,
    'status', 'pending'
  );
end;
$$;

revoke all on function public.create_guest_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_guest_order(jsonb, jsonb) to service_role;

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
