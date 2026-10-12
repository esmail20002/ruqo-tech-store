begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banner-images', 'banner-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy banner_images_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'banner-images');
create policy banner_images_marketing_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'banner-images' and public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));
create policy banner_images_marketing_update on storage.objects for update to authenticated
  using (bucket_id = 'banner-images' and public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]))
  with check (bucket_id = 'banner-images' and public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));
create policy banner_images_marketing_delete on storage.objects for delete to authenticated
  using (bucket_id = 'banner-images' and public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

commit;
