begin;

alter table public.product_variants
  add column final_price numeric(12, 2)
  check (final_price is null or final_price >= 0);

update public.product_variants variant
set final_price = product.price + variant.price_adjustment
from public.products product
where product.slug = variant.product_slug;

create function public.sync_product_variant_final_prices()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.price is distinct from old.price then
    update public.product_variants variant
    set price_adjustment = variant.final_price - new.price
    where variant.product_slug = new.slug
      and variant.final_price is not null;
  end if;
  return new;
end;
$$;

create trigger products_sync_variant_final_prices
  after update of price on public.products
  for each row execute function public.sync_product_variant_final_prices();

commit;
