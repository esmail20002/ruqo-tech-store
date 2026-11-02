begin;

create policy product_reviews_read_admin
  on public.product_reviews for select to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

drop policy if exists product_reviews_moderate_admin on public.product_reviews;
create policy product_reviews_moderate_admin
  on public.product_reviews for update to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

drop policy if exists product_reviews_delete_admin on public.product_reviews;
create policy product_reviews_delete_admin
  on public.product_reviews for delete to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

drop policy if exists product_review_photos_admin_delete on storage.objects;
create policy product_review_photos_admin_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-review-photos'
    and public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[])
  );

commit;
