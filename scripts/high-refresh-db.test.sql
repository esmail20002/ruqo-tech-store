begin;
do $$
declare
  v_user uuid;
  v_product text;
  v_draft public.high_refresh_drafts;
  v_live public.high_refresh_publications;
  v_source jsonb := '{"title":"Transaction-only promotion","text":"Never published outside rollback","eyebrow":"View product"}';
  v_translations jsonb;
  v_lang text;
  v_job uuid;
begin
  select user_id into v_user from public.staff_roles where role in ('owner','admin') limit 1;
  select slug into v_product from public.products where is_active limit 1;
  if v_user is null or v_product is null then raise exception 'An admin and active product are required.'; end if;
  perform set_config('request.jwt.claim.sub', v_user::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  if has_table_privilege('anon','public.high_refresh_drafts','select') then
    raise exception 'Drafts must not be public.';
  end if;
  if has_function_privilege('anon','public.publish_high_refresh(integer,boolean)','execute')
    or has_function_privilege('authenticated','public.reserve_high_refresh_translation(uuid,integer)','execute') then
    raise exception 'Invalid function privileges.';
  end if;
  delete from public.high_refresh_drafts;
  delete from public.high_refresh_publications;
  v_draft := public.save_high_refresh_draft(0, v_source, '{}', array[v_product], '');
  if exists (select 1 from public.high_refresh_publications) then raise exception 'Draft leaked to live.'; end if;
  begin
    perform public.publish_high_refresh(v_draft.revision);
    raise exception 'Missing translations were published.';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_high_refresh_draft(0, v_source, '{}', array[v_product], '');
    raise exception 'A stale draft overwrote new content.';
  exception when serialization_failure then null;
  end;
  v_translations := '{}'::jsonb;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    v_translations := v_translations || jsonb_build_object(v_lang, v_source);
  end loop;
  v_draft := public.save_high_refresh_draft(v_draft.revision, v_source, v_translations, array[v_product], '');
  v_live := public.publish_high_refresh(v_draft.revision);
  if v_live.product_slugs <> array[v_product] or v_live.translations->'en' <> v_source then
    raise exception 'Manual content was not published atomically.';
  end if;
  v_draft := public.save_high_refresh_draft(v_draft.revision, jsonb_set(v_source,'{title}','"Changed title"'), v_translations, array[v_product], '');
  if v_draft.translations->'fr' ? 'title' or v_draft.translations->'fr'->>'eyebrow' <> 'View product' then
    raise exception 'Source invalidation removed corrections or retained stale text.';
  end if;
  if (select translations->'en' from public.high_refresh_publications) <> v_source then
    raise exception 'Source draft edit changed live content.';
  end if;
  v_live := public.publish_high_refresh(v_draft.revision, true);
  if cardinality(v_live.product_slugs) <> 0 or cardinality(v_draft.product_slugs) <> 1
    or v_live.translations <> '{}'::jsonb or v_live.image_url <> '' then
    raise exception 'Automatic reset did not preserve the manual draft.';
  end if;
  begin
    perform public.save_high_refresh_draft(v_draft.revision, v_source, '{}', array[v_product,v_product], '');
    raise exception 'Duplicate products accepted.';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_high_refresh_draft(v_draft.revision, v_source, '{}', array[v_product], 'javascript:alert(1)');
    raise exception 'Unsafe cover URL accepted.';
  exception when invalid_parameter_value then null;
  end;
  v_job := public.reserve_high_refresh_translation(v_user, 100);
  if not exists (select 1 from public.store_translation_jobs where id = v_job and document_type = 'high_refresh') then
    raise exception 'Translation usage not reserved.';
  end if;
  v_draft := public.save_high_refresh_banners(
    v_draft.revision,
    '[{"id":"slide-1","image_url":"https://images.unsplash.com/photo-1496181133206-80ce9b88a853","destination_url":"/products.html","is_active":true,"source":{"title":"","text":"","eyebrow":"","badge":"Featured"},"translations":{}}]'::jsonb
  );
  v_live := public.publish_high_refresh_banners(v_draft.revision);
  if jsonb_array_length(v_live.slides) <> 1 or v_live.slides->0->>'id' <> 'slide-1' then
    raise exception 'Banner slides were not published.';
  end if;
  begin
    perform public.save_high_refresh_banners(
      v_draft.revision,
      '[{"id":"bad","image_url":"javascript:alert(1)","is_active":true}]'::jsonb
    );
    raise exception 'Unsafe banner slide URL accepted.';
  exception when invalid_parameter_value then null;
  end;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000000',true);
  begin
    perform public.publish_high_refresh(v_draft.revision, true);
    raise exception 'Unauthorized user published content.';
  exception when insufficient_privilege then null;
  end;
end;
$$;
rollback;
