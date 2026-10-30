begin;

alter table public.categories
  add column cover_storage_path text,
  add column translation_sources jsonb not null default '{}'::jsonb
    check (jsonb_typeof(translation_sources) = 'object'),
  add constraint category_cover_path check (
    cover_storage_path is null or
    cover_storage_path ~ '^categories/[a-z0-9]+(-[a-z0-9]+)*/[a-f0-9-]+\.(jpg|png|webp)$'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp']);

create policy category_images_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'category-images');
create policy category_images_catalog_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'category-images' and (storage.foldername(name))[1] = 'categories'
    and public.has_store_role(array['owner','admin','catalog_manager']::public.store_role[]));
create policy category_images_catalog_delete on storage.objects for delete to authenticated
  using (bucket_id = 'category-images'
    and public.has_store_role(array['owner','admin','catalog_manager']::public.store_role[]));

alter table public.store_translation_jobs
  add column document_type text not null default 'homepage'
    check (document_type in ('homepage','category'));

create function public.reserve_category_translation(p_user uuid, p_characters integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_job uuid;
begin
  if p_characters is null or p_characters not between 1 and 800000 then
    raise exception 'Invalid translation size.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.staff_roles where user_id = p_user
    and role in ('owner','admin','catalog_manager')) then
    raise exception 'Not authorized.' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(280002);
  if (select count(*) from public.store_translation_jobs
    where requested_by = p_user and created_at > now() - interval '1 minute') >= 3 then
    raise exception 'Please wait a minute before translating again.' using errcode = 'P0001';
  end if;
  if (select coalesce(sum(character_count), 0) from public.store_translation_jobs
    where created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC') + p_characters > 1800000 then
    raise exception 'The application monthly translation limit has been reached.' using errcode = 'P0001';
  end if;
  insert into public.store_translation_jobs (document_revision, document_type, requested_by, character_count)
  values (0, 'category', p_user, p_characters) returning id into v_job;
  return v_job;
end;
$$;
revoke all on function public.reserve_category_translation(uuid,integer) from public, anon, authenticated;
grant execute on function public.reserve_category_translation(uuid,integer) to service_role;

commit;
