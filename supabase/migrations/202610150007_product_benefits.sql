begin;

alter table public.products
  add column product_benefits jsonb not null default '[]'::jsonb
  check (jsonb_typeof(product_benefits) = 'array');

commit;
