-- Run inside a transaction and roll back. Never publish persistent test content.
do $$
declare
  v_user uuid;
  v_draft public.home_copy_drafts;
  v_source jsonb := '{"eyebrow":"","title":"Test title","text":"Test description"}';
  v_translations jsonb;
  v_job uuid;
  v_lang text;
  v_result boolean;
begin
  select user_id into v_user from public.staff_roles where role in ('owner', 'admin') limit 1;
  if v_user is null then raise exception 'An owner/admin is required to exercise authenticated draft operations.'; end if;
  perform set_config('request.jwt.claim.sub', v_user::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_user, 'role', 'authenticated')::text, true);
  if has_table_privilege('anon', 'public.home_copy_drafts', 'SELECT') then
    raise exception 'Anonymous users can read drafts.';
  end if;
  if has_function_privilege('authenticated', 'public.reserve_home_translation(integer,uuid,integer)', 'EXECUTE') then
    raise exception 'Authenticated browsers can reserve translation usage.';
  end if;
  if has_table_privilege('authenticated', 'public.home_copy_publications', 'UPDATE') then
    raise exception 'Browsers can bypass the publication validation.';
  end if;
  v_draft := public.save_home_copy_draft(0, v_source);
  if v_draft.revision <> 1 then raise exception 'Expected initial draft revision 1.'; end if;
  begin
    perform public.save_home_copy_draft(0, v_source);
    raise exception 'Stale save unexpectedly succeeded.';
  exception when serialization_failure then null;
  end;
  begin
    perform public.publish_home_copy(1);
    raise exception 'Incomplete translations unexpectedly published.';
  exception when invalid_parameter_value then null;
  end;
  v_translations := '{}'::jsonb;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    v_translations := v_translations || jsonb_build_object(v_lang, v_source);
  end loop;
  v_job := public.reserve_home_translation(1, v_user, 100);
  begin
    perform public.reserve_home_translation(1, v_user, 100);
    raise exception 'Concurrent translation unexpectedly succeeded.';
  exception when raise_exception then
    if sqlerrm <> 'This draft is already being translated.' then raise; end if;
  end;
  v_result := public.complete_home_translation(v_job, v_translations);
  if not v_result then raise exception 'Valid translation did not complete.'; end if;
  select * into v_draft from public.home_copy_drafts where id = 'homepage';
  if v_draft.revision <> 2 then raise exception 'Translation did not advance revision.'; end if;
  perform public.publish_home_copy(2);
  if (select translations->'en' from public.home_copy_publications where id = 'homepage') <> v_source then
    raise exception 'Published English source differs.';
  end if;
  v_translations := jsonb_set(v_translations, '{fr,title}', '"Manually corrected"');
  v_draft := public.save_home_copy_draft(2, v_source, v_translations);
  v_source := jsonb_set(v_source, '{text}', '"Changed description"');
  v_draft := public.save_home_copy_draft(3, v_source);
  if v_draft.translations->'fr'->>'title' <> 'Manually corrected' or
     (v_draft.translations->'fr') ? 'text' then
    raise exception 'Manual correction lost or stale translated description retained.';
  end if;
  v_job := public.reserve_home_translation(4, v_user, 100);
  v_draft := public.save_home_copy_draft(4, jsonb_set(v_source, '{title}', '"Newer title"'));
  if public.complete_home_translation(v_job, v_translations) then
    raise exception 'Old translation overwrote a newer draft.';
  end if;
  if (select revision from public.home_copy_publications where id = 'homepage') <> 2 then
    raise exception 'Draft writes modified published content.';
  end if;
  if public.valid_home_copy(null) or public.valid_home_copy('{"eyebrow":"","title":"","text":""}') then
    raise exception 'Invalid copy passed validation.';
  end if;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}', true);
  begin
    perform public.publish_home_copy(5);
    raise exception 'Anonymous publishing succeeded.';
  exception when insufficient_privilege then null;
  end;
end;
$$;
select 'PASS: revision checks, role boundaries, draft/public isolation, usage reservations, stale translation protection, and manual corrections' as result;
