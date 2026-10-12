begin;

create table public.guest_order_rate_limits (
  fingerprint text primary key,
  window_started_at timestamptz not null,
  request_count smallint not null check (request_count >= 1)
);

alter table public.guest_order_rate_limits enable row level security;
revoke all on public.guest_order_rate_limits from anon, authenticated;
grant all on public.guest_order_rate_limits to service_role;
create index guest_order_rate_limits_window_idx on public.guest_order_rate_limits (window_started_at);

create function public.consume_guest_order_rate_limit(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_started timestamptz;
  v_count smallint;
begin
  if p_fingerprint is null or length(p_fingerprint) < 32 then
    raise exception 'Invalid rate-limit fingerprint';
  end if;

  insert into public.guest_order_rate_limits (fingerprint, window_started_at, request_count)
  values (p_fingerprint, v_now, 1)
  on conflict (fingerprint) do update
    set window_started_at = case
          when public.guest_order_rate_limits.window_started_at <= v_now - interval '10 minutes' then v_now
          else public.guest_order_rate_limits.window_started_at
        end,
        request_count = case
          when public.guest_order_rate_limits.window_started_at <= v_now - interval '10 minutes' then 1
          else public.guest_order_rate_limits.request_count + 1
        end
  returning window_started_at, request_count into v_started, v_count;

  delete from public.guest_order_rate_limits
  where window_started_at <= v_now - interval '1 day';

  return v_count <= 5;
end;
$$;

revoke all on function public.consume_guest_order_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_guest_order_rate_limit(text) to service_role;

create function public.create_guest_order(p_customer jsonb, p_items jsonb)
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

    v_unit_price := v_product.price;
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
      v_unit_price := v_unit_price + v_variant.price_adjustment;
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

commit;
