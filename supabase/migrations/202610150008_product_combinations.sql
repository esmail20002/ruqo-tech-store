begin;

alter table public.products
  add column product_option_values jsonb not null default '{}'::jsonb
  check (jsonb_typeof(product_option_values) = 'object');

alter table public.product_variants
  add column option_values jsonb not null default '{}'::jsonb
  check (jsonb_typeof(option_values) = 'object');

alter table public.product_variants
  drop constraint product_variants_option_group_check;

alter table public.product_variants
  add constraint product_variants_option_group_check
  check (option_group in ('storage', 'size', 'color', 'material', 'combination'));

update public.product_variants
set option_values = jsonb_build_object(option_group, option_value)
where option_values = '{}'::jsonb;

with distinct_values as (
  select product_slug, option_group, option_value, min(sort_order) as first_order
  from public.product_variants
  group by product_slug, option_group, option_value
), group_values as (
  select product_slug, option_group, jsonb_agg(option_value order by first_order, option_value) as values
  from distinct_values
  group by product_slug, option_group
), product_groups as (
  select product_slug, jsonb_object_agg(option_group, values) as option_values
  from group_values
  group by product_slug
)
update public.products product
set product_option_values = product_groups.option_values
from product_groups
where product.slug = product_groups.product_slug;

commit;
