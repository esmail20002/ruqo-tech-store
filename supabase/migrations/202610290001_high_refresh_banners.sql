begin;

alter table public.high_refresh_drafts
  add column if not exists slides jsonb not null default '[]'::jsonb
    check (jsonb_typeof(slides) = 'array');

alter table public.high_refresh_publications
  add column if not exists slides jsonb not null default '[]'::jsonb
    check (jsonb_typeof(slides) = 'array');

create or replace function public.valid_high_refresh_slides(p_slides jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  v_slide jsonb;
  v_source jsonb;
  v_translations jsonb;
  v_lang text;
  v_copy jsonb;
  v_field text;
  v_limit integer;
  v_starts timestamptz;
  v_ends timestamptz;
begin
  if jsonb_typeof(p_slides) is distinct from 'array' or jsonb_array_length(p_slides) > 12 then
    return false;
  end if;
  for v_slide in select * from jsonb_array_elements(p_slides) loop
    if jsonb_typeof(v_slide) is distinct from 'object' then return false; end if;
    if jsonb_typeof(v_slide->'id') is distinct from 'string'
       or btrim(v_slide->>'id') = ''
       or char_length(v_slide->>'id') > 120 then
      return false;
    end if;
    if jsonb_typeof(v_slide->'image_url') is distinct from 'string'
       or btrim(v_slide->>'image_url') = ''
       or char_length(v_slide->>'image_url') > 2048
       or (v_slide->>'image_url' !~ '^https://[^[:space:]<>]+$' and v_slide->>'image_url' !~ '^/[^[:space:]<>]*$') then
      return false;
    end if;
    if v_slide ? 'image_path' and (
       jsonb_typeof(v_slide->'image_path') is distinct from 'string'
       or char_length(v_slide->>'image_path') > 500
    ) then
      return false;
    end if;
    if v_slide ? 'mobile_image_url' and (
       jsonb_typeof(v_slide->'mobile_image_url') is distinct from 'string'
       or char_length(v_slide->>'mobile_image_url') > 2048
       or (v_slide->>'mobile_image_url' <> '' and v_slide->>'mobile_image_url' !~ '^https://[^[:space:]<>]+$' and v_slide->>'mobile_image_url' !~ '^/[^[:space:]<>]*$')
    ) then
      return false;
    end if;
    if v_slide ? 'mobile_image_path' and (
       jsonb_typeof(v_slide->'mobile_image_path') is distinct from 'string'
       or char_length(v_slide->>'mobile_image_path') > 500
    ) then
      return false;
    end if;
    if v_slide ? 'destination_url' and (
       jsonb_typeof(v_slide->'destination_url') is distinct from 'string'
       or char_length(v_slide->>'destination_url') > 2048
       or (v_slide->>'destination_url' <> '' and v_slide->>'destination_url' !~ '^https://[^[:space:]<>]+$' and v_slide->>'destination_url' !~ '^/[^[:space:]<>]*$')
    ) then
      return false;
    end if;
    if v_slide ? 'is_active' and jsonb_typeof(v_slide->'is_active') is distinct from 'boolean' then
      return false;
    end if;
    v_starts := null;
    v_ends := null;
    if v_slide ? 'starts_at' and jsonb_typeof(v_slide->'starts_at') = 'string' and btrim(v_slide->>'starts_at') <> '' then
      begin
        v_starts := (v_slide->>'starts_at')::timestamptz;
      exception when others then
        return false;
      end;
    end if;
    if v_slide ? 'ends_at' and jsonb_typeof(v_slide->'ends_at') = 'string' and btrim(v_slide->>'ends_at') <> '' then
      begin
        v_ends := (v_slide->>'ends_at')::timestamptz;
      exception when others then
        return false;
      end;
    end if;
    if v_starts is not null and v_ends is not null and v_ends <= v_starts then
      return false;
    end if;
    v_source := coalesce(v_slide->'source', '{"title":"","text":"","eyebrow":"","badge":""}'::jsonb);
    if jsonb_typeof(v_source) is distinct from 'object' then return false; end if;
    foreach v_field in array array['title','text','eyebrow','badge'] loop
      v_limit := case v_field when 'title' then 600 when 'text' then 4000 else 200 end;
      if v_source ? v_field and (
         jsonb_typeof(v_source->v_field) is distinct from 'string'
         or char_length(v_source->>v_field) > v_limit
      ) then
        return false;
      end if;
    end loop;
    v_translations := coalesce(v_slide->'translations', '{}'::jsonb);
    if jsonb_typeof(v_translations) is distinct from 'object'
       or (v_translations - array['ar','fr','es','zh']) <> '{}'::jsonb then
      return false;
    end if;
    foreach v_lang in array array['ar','fr','es','zh'] loop
      if v_translations ? v_lang then
        v_copy := v_translations->v_lang;
        if jsonb_typeof(v_copy) is distinct from 'object'
           or (v_copy - array['title','text','eyebrow','badge']) <> '{}'::jsonb then
          return false;
        end if;
        foreach v_field in array array['title','text','eyebrow','badge'] loop
          v_limit := case v_field when 'title' then 600 when 'text' then 4000 else 200 end;
          if v_copy ? v_field and (
             jsonb_typeof(v_copy->v_field) is distinct from 'string'
             or char_length(v_copy->>v_field) > v_limit
          ) then
            return false;
          end if;
        end loop;
      end if;
    end loop;
  end loop;
  return true;
end;
$$;

create or replace function public.save_high_refresh_banners(
  p_expected_revision integer, p_slides jsonb
)
returns public.high_refresh_drafts language plpgsql security definer set search_path = '' as $$
declare
  v_old public.high_refresh_drafts;
  v_result public.high_refresh_drafts;
  v_default_source jsonb := '{"title":"WEEXEY Banner","text":"","eyebrow":"Shop now"}'::jsonb;
begin
  if not public.has_store_role(array['owner','admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can edit high refresh banners.' using errcode = '42501';
  end if;
  if not public.valid_high_refresh_slides(p_slides) then
    raise exception 'Check banner slides, image URLs, schedule dates, and text lengths.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(280003);
  select * into v_old from public.high_refresh_drafts where id = 'homepage' for update;
  if p_expected_revision is distinct from coalesce(v_old.revision, 0) then
    raise exception 'Another editor changed these banners. Reload before saving.' using errcode = '40001';
  end if;
  insert into public.high_refresh_drafts(id, revision, source, translations, product_slugs, image_url, slides, updated_by)
  values (
    'homepage',
    coalesce(v_old.revision, 0) + 1,
    coalesce(v_old.source, v_default_source),
    coalesce(v_old.translations, '{}'::jsonb),
    coalesce(v_old.product_slugs, '{}'::text[]),
    coalesce(v_old.image_url, ''),
    p_slides,
    auth.uid()
  )
  on conflict (id) do update set
    revision = excluded.revision,
    slides = excluded.slides,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.publish_high_refresh_banners(
  p_expected_revision integer
)
returns public.high_refresh_publications language plpgsql security definer set search_path = '' as $$
declare
  v_draft public.high_refresh_drafts;
  v_result public.high_refresh_publications;
begin
  if not public.has_store_role(array['owner','admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can publish high refresh banners.' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(280003);
  select * into v_draft from public.high_refresh_drafts where id = 'homepage' for update;
  if not found or p_expected_revision is distinct from v_draft.revision then
    raise exception 'The draft changed. Save or reload before publishing.' using errcode = '40001';
  end if;
  if not public.valid_high_refresh_slides(v_draft.slides) then
    raise exception 'Invalid banner slides in draft.' using errcode = '22023';
  end if;
  insert into public.high_refresh_publications(id, revision, translations, product_slugs, image_url, slides, published_by)
  values (
    'homepage',
    v_draft.revision,
    coalesce(v_draft.translations, '{}'::jsonb),
    '{}'::text[],
    '',
    v_draft.slides,
    auth.uid()
  )
  on conflict (id) do update set
    revision = excluded.revision,
    translations = excluded.translations,
    product_slugs = excluded.product_slugs,
    image_url = excluded.image_url,
    slides = excluded.slides,
    published_at = now(),
    published_by = excluded.published_by
  returning * into v_result;
  return v_result;
end;
$$;

revoke all on function public.save_high_refresh_banners(integer, jsonb),
  public.publish_high_refresh_banners(integer) from public, anon, authenticated;
grant execute on function public.save_high_refresh_banners(integer, jsonb),
  public.publish_high_refresh_banners(integer) to authenticated;

commit;
