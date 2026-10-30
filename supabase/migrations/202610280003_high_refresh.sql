begin;

create table public.high_refresh_drafts (
  id text primary key default 'homepage' check (id = 'homepage'),
  revision integer not null,
  source jsonb not null,
  translations jsonb not null default '{}'::jsonb,
  product_slugs text[] not null default '{}',
  image_url text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create table public.high_refresh_publications (
  id text primary key check (id = 'homepage'),
  revision integer not null,
  translations jsonb not null,
  product_slugs text[] not null,
  image_url text not null default '',
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null
);
alter table public.high_refresh_drafts enable row level security;
alter table public.high_refresh_publications enable row level security;
create policy high_refresh_admin_read on public.high_refresh_drafts for select to authenticated
  using (public.has_store_role(array['owner','admin']::public.store_role[]));
create policy high_refresh_public_read on public.high_refresh_publications for select to anon, authenticated using (true);
revoke all on public.high_refresh_drafts, public.high_refresh_publications from anon, authenticated;
grant select on public.high_refresh_drafts to authenticated;
grant select on public.high_refresh_publications to anon, authenticated;
grant all on public.high_refresh_drafts, public.high_refresh_publications to service_role;

create function public.save_high_refresh_draft(
  p_expected_revision integer, p_source jsonb, p_translations jsonb,
  p_product_slugs text[], p_image_url text default ''
)
returns public.high_refresh_drafts language plpgsql security definer set search_path = '' as $$
declare
  v_old public.high_refresh_drafts;
  v_result public.high_refresh_drafts;
  v_translations jsonb := '{}'::jsonb;
  v_copy jsonb;
  v_lang text;
  v_field text;
  v_value jsonb;
begin
  if not public.has_store_role(array['owner','admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can edit high refresh.' using errcode = '42501';
  end if;
  if not public.valid_home_copy(p_source) or btrim(p_source->>'eyebrow') = '' then
    raise exception 'Enter a title, button label and valid text lengths.' using errcode = '22023';
  end if;
  if p_product_slugs is null or cardinality(p_product_slugs) > 12
    or array_ndims(p_product_slugs) > 1
    or exists (select 1 from unnest(p_product_slugs) s where s is null or
      not exists (select 1 from public.products p where p.slug = s and p.is_active))
    or cardinality(p_product_slugs) <> (select count(distinct s) from unnest(p_product_slugs) s) then
    raise exception 'Choose up to 12 different published products.' using errcode = '22023';
  end if;
  if p_image_url is null or char_length(p_image_url) > 2048
    or (p_image_url <> '' and p_image_url !~ '^https://[^[:space:]<>]+$') then
    raise exception 'Use an HTTPS cover URL or leave it empty for product images.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_translations) is distinct from 'object'
    or (p_translations - array['ar','fr','es','zh']) <> '{}'::jsonb then
    raise exception 'Invalid translation languages.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(280003);
  select * into v_old from public.high_refresh_drafts where id = 'homepage' for update;
  if p_expected_revision is distinct from coalesce(v_old.revision, 0) then
    raise exception 'Another editor changed this draft. Reload before saving.' using errcode = '40001';
  end if;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    v_copy := '{}'::jsonb;
    if p_translations ? v_lang and
      (jsonb_typeof(p_translations->v_lang) is distinct from 'object' or
       ((p_translations->v_lang) - array['eyebrow','title','text']) <> '{}'::jsonb) then
      raise exception 'Invalid translation fields.' using errcode = '22023';
    end if;
    foreach v_field in array array['eyebrow','title','text'] loop
      v_value := p_translations->v_lang->v_field;
      if v_value is not null and (jsonb_typeof(v_value) is distinct from 'string' or
        char_length(v_value #>> '{}') > case v_field when 'eyebrow' then 200 when 'title' then 600 else 4000 end) then
        raise exception 'Check translated text lengths.' using errcode = '22023';
      end if;
      if btrim(p_source->>v_field) = '' then
        v_copy := v_copy || jsonb_build_object(v_field, '');
      elsif v_old.source is null or v_old.source->v_field = p_source->v_field then
        if v_value is not null then
          v_copy := v_copy || jsonb_build_object(v_field, v_value);
        end if;
      end if;
    end loop;
    v_translations := v_translations || jsonb_build_object(v_lang, v_copy);
  end loop;
  insert into public.high_refresh_drafts(id, revision, source, translations, product_slugs, image_url, updated_by)
  values ('homepage', coalesce(v_old.revision, 0) + 1, p_source, v_translations, p_product_slugs, p_image_url, auth.uid())
  on conflict (id) do update set revision = excluded.revision, source = excluded.source,
    translations = excluded.translations, product_slugs = excluded.product_slugs, image_url = excluded.image_url,
    updated_by = excluded.updated_by, updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.publish_high_refresh(p_expected_revision integer, p_automatic boolean default false)
returns public.high_refresh_publications language plpgsql security definer set search_path = '' as $$
declare
  v_draft public.high_refresh_drafts;
  v_result public.high_refresh_publications;
  v_lang text;
begin
  if not public.has_store_role(array['owner','admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can publish high refresh.' using errcode = '42501';
  end if;
  if p_automatic is null then raise exception 'Choose a publication mode.' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(280003);
  select * into v_draft from public.high_refresh_drafts where id = 'homepage' for update;
  if not found or p_expected_revision is distinct from v_draft.revision then
    raise exception 'The draft changed. Reload before publishing.' using errcode = '40001';
  end if;
  if not p_automatic and cardinality(v_draft.product_slugs) > 0 then
    if exists (select 1 from unnest(v_draft.product_slugs) s
      where not exists (select 1 from public.products p where p.slug = s and p.is_active)) then
      raise exception 'A selected product is no longer published. Update the selection.' using errcode = '22023';
    end if;
    foreach v_lang in array array['ar','fr','es','zh'] loop
      if not public.valid_home_copy(v_draft.translations->v_lang, v_draft.source) then
        raise exception 'Complete and review all translations before publishing.' using errcode = '22023';
      end if;
    end loop;
  end if;
  insert into public.high_refresh_publications(id, revision, translations, product_slugs, image_url, published_by)
  values ('homepage', v_draft.revision,
    case when p_automatic or cardinality(v_draft.product_slugs) = 0 then '{}'::jsonb
      else v_draft.translations || jsonb_build_object('en', v_draft.source) end,
    case when p_automatic then '{}'::text[] else v_draft.product_slugs end,
    case when p_automatic or cardinality(v_draft.product_slugs) = 0 then '' else v_draft.image_url end, auth.uid())
  on conflict (id) do update set revision = excluded.revision, translations = excluded.translations,
    product_slugs = excluded.product_slugs, image_url = excluded.image_url,
    published_at = now(), published_by = excluded.published_by
  returning * into v_result;
  return v_result;
end;
$$;

alter table public.store_translation_jobs drop constraint store_translation_jobs_document_type_check;
alter table public.store_translation_jobs add constraint store_translation_jobs_document_type_check
  check (document_type in ('homepage','category','high_refresh'));
create function public.reserve_high_refresh_translation(p_user uuid, p_characters integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_job uuid;
begin
  if not exists (select 1 from public.staff_roles where user_id = p_user and role in ('owner','admin')) then
    raise exception 'Not authorized.' using errcode = '42501';
  end if;
  -- Reuse the same advisory lock, rate limit and monthly budget as category and homepage translation.
  v_job := public.reserve_category_translation(p_user, p_characters);
  update public.store_translation_jobs set document_type = 'high_refresh' where id = v_job;
  return v_job;
end;
$$;
revoke all on function public.save_high_refresh_draft(integer,jsonb,jsonb,text[],text),
  public.publish_high_refresh(integer,boolean), public.reserve_high_refresh_translation(uuid,integer) from public, anon, authenticated;
grant execute on function public.save_high_refresh_draft(integer,jsonb,jsonb,text[] ,text),
  public.publish_high_refresh(integer,boolean) to authenticated;
grant execute on function public.reserve_high_refresh_translation(uuid,integer) to service_role;

commit;
