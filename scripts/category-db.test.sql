begin;

do $$
declare
  v_user uuid;
  v_slug text := 'cover-test-' || substr(md5(random()::text),1,10);
  v_job uuid;
begin
  if has_function_privilege('anon', 'public.reserve_category_translation(uuid,integer)', 'execute')
    or has_function_privilege('authenticated', 'public.reserve_category_translation(uuid,integer)', 'execute') then
    raise exception 'Browser roles must not reserve Azure usage directly.';
  end if;
  if not exists (select 1 from storage.buckets where id = 'category-images'
    and public and file_size_limit = 5242880
    and allowed_mime_types = array['image/jpeg','image/png','image/webp']) then
    raise exception 'Category cover storage configuration is incorrect.';
  end if;
  insert into public.categories (slug, name_translations, cover_storage_path)
  values (v_slug, '{"en":"Transaction test"}', 'categories/' || v_slug || '/00000000-0000-0000-0000-000000000001.png');
  begin
    update public.categories set cover_storage_path = 'https://example.com/image.svg' where slug = v_slug;
    raise exception 'Invalid cover path was accepted.';
  exception when check_violation then null;
  end;
  begin
    update public.categories set translation_sources = '[]' where slug = v_slug;
    raise exception 'Invalid translation provenance was accepted.';
  exception when check_violation then null;
  end;
  select user_id into v_user from public.staff_roles where role in ('owner','admin') limit 1;
  if v_user is null then raise exception 'An owner/admin is required for translation reservation tests.'; end if;
  v_job := public.reserve_category_translation(v_user, 100);
  if not exists (select 1 from public.store_translation_jobs
    where id = v_job and document_type = 'category' and document_revision = 0 and status = 'reserved') then
    raise exception 'Category usage reservation was not recorded.';
  end if;
  begin
    perform public.reserve_category_translation(v_user, 800001);
    raise exception 'Invalid usage size was accepted.';
  exception when invalid_parameter_value then null;
  end;
  insert into public.store_translation_jobs (document_revision, requested_by, character_count)
  values (1, v_user, 1), (1, v_user, 1);
  begin
    perform public.reserve_category_translation(v_user, 100);
    raise exception 'Shared per-user rate limit was not enforced.';
  exception when raise_exception then
    if sqlerrm not like 'Please wait a minute%' then raise; end if;
  end;
  update public.store_translation_jobs set created_at = now() - interval '2 minutes'
    where requested_by = v_user and created_at > now() - interval '1 minute';
  insert into public.store_translation_jobs (document_revision, requested_by, character_count)
  values (1, v_user, 800000), (1, v_user, 800000);
  begin
    perform public.reserve_category_translation(v_user, 800000);
    raise exception 'Shared monthly budget was not enforced.';
  exception when raise_exception then
    if sqlerrm not like 'The application monthly%' then raise; end if;
  end;
end;
$$;

rollback;
