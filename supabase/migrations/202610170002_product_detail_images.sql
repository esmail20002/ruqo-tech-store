begin;

create table public.product_detail_images (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on update cascade on delete cascade,
  image_url text,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_detail_images_one_source check (num_nonnulls(image_url, storage_path) = 1)
);

create index product_detail_images_product_order_idx
  on public.product_detail_images (product_slug, sort_order);

alter table public.product_detail_images enable row level security;

create policy product_detail_images_read_active_products
  on public.product_detail_images for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.slug = product_slug and p.is_active
  ));

create policy product_detail_images_manage_catalog
  on public.product_detail_images for all to authenticated
  using (public.has_store_role(array['owner', 'admin', 'catalog_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'catalog_manager']::public.store_role[]));

grant select on public.product_detail_images to anon, authenticated;
grant select, insert, update, delete on public.product_detail_images to authenticated;

commit;