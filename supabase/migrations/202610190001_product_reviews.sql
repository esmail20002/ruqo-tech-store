begin;

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on update cascade on delete cascade,
  reviewer_name text not null check (char_length(btrim(reviewer_name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(btrim(review_text)) between 8 and 600),
  photo_url text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index product_reviews_product_created_idx
  on public.product_reviews (product_slug, created_at desc);

alter table public.product_reviews enable row level security;

create policy product_reviews_read_active_products
  on public.product_reviews for select to anon, authenticated
  using (is_visible and exists (
    select 1 from public.products p
    where p.slug = product_slug and p.is_active
  ));

create policy product_reviews_submit_active_products
  on public.product_reviews for insert to anon, authenticated
  with check (is_visible and exists (
    select 1 from public.products p
    where p.slug = product_slug and p.is_active
  ));

create policy product_reviews_moderate_admin
  on public.product_reviews for update to authenticated
  using (public.has_store_role(array['owner', 'admin']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin']::public.store_role[]));

create policy product_reviews_delete_admin
  on public.product_reviews for delete to authenticated
  using (public.has_store_role(array['owner', 'admin']::public.store_role[]));

grant select, insert on public.product_reviews to anon, authenticated;
grant update, delete on public.product_reviews to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-review-photos', 'product-review-photos', true, 327680, array['image/jpeg'])
on conflict (id) do nothing;

create policy product_review_photos_public_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-review-photos');

create policy product_review_photos_public_upload
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'product-review-photos'
    and name ~ '^reviews/[a-z0-9-]+/[0-9a-f-]+\.jpg$'
  );

create policy product_review_photos_admin_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-review-photos'
    and public.has_store_role(array['owner', 'admin']::public.store_role[])
  );

commit;