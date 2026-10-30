begin;

create table public.home_copy_drafts (
  id text primary key check (id = 'homepage'),
  revision integer not null default 1,
  source jsonb not null,
  translations jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.home_copy_publications (
  id text primary key check (id = 'homepage'),
  revision integer not null,
  translations jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null
);

create table public.store_translation_jobs (
  id uuid primary key default gen_random_uuid(),
  document_revision integer not null,
  requested_by uuid not null references auth.users(id),
  character_count integer not null check (character_count between 1 and 800000),
  status text not null default 'reserved' check (status in ('reserved', 'completed', 'failed', 'obsolete')),
  created_at timestamptz not null default now()
);

create index store_translation_jobs_created_idx on public.store_translation_jobs (created_at);
alter table public.home_copy_drafts enable row level security;
alter table public.home_copy_publications enable row level security;
alter table public.store_translation_jobs enable row level security;

create policy home_copy_drafts_admin_read on public.home_copy_drafts for select to authenticated
  using (public.has_store_role(array['owner', 'admin']::public.store_role[]));
create policy home_copy_public_read on public.home_copy_publications for select to anon, authenticated using (true);
create policy store_translation_jobs_admin_read on public.store_translation_jobs for select to authenticated
  using (public.has_store_role(array['owner', 'admin']::public.store_role[]));
revoke all on public.home_copy_drafts, public.home_copy_publications, public.store_translation_jobs from anon, authenticated;
grant all on public.home_copy_drafts, public.home_copy_publications, public.store_translation_jobs to service_role;
grant select on public.home_copy_drafts, public.store_translation_jobs to authenticated;
grant select on public.home_copy_publications to anon, authenticated;

create function public.valid_home_copy(p_copy jsonb, p_source jsonb default null)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  v_field text;
  v_limit integer;
begin
  if jsonb_typeof(p_copy) is distinct from 'object' or
     not (p_copy ?& array['eyebrow', 'title', 'text']) or
     (p_copy - array['eyebrow', 'title', 'text']) <> '{}'::jsonb then return false; end if;
  foreach v_field in array array['eyebrow', 'title', 'text'] loop
    v_limit := case v_field when 'eyebrow' then 200 when 'title' then 600 else 4000 end;
    if jsonb_typeof(p_copy->v_field) is distinct from 'string' or
       char_length(p_copy->>v_field) > v_limit or
       (v_field = 'title' and btrim(p_copy->>v_field) = '') then return false; end if;
    if p_source is not null and
       ((btrim(p_source->>v_field) = '') is distinct from (btrim(p_copy->>v_field) = '')) then return false; end if;
  end loop;
  return true;
end;
$$;

create function public.save_home_copy_draft(
  p_expected_revision integer, p_source jsonb, p_translations jsonb default null
)
returns public.home_copy_drafts language plpgsql security definer set search_path = '' as $$
declare
  v_old public.home_copy_drafts;
  v_result public.home_copy_drafts;
  v_translations jsonb := '{}'::jsonb;
  v_copy jsonb;
  v_lang text;
  v_field text;
begin
  if not public.has_store_role(array['owner', 'admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can edit homepage copy.' using errcode = '42501';
  end if;
  if not public.valid_home_copy(p_source) then
    raise exception 'Enter a title and valid homepage text lengths.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(280001);
  select * into v_old from public.home_copy_drafts where id = 'homepage' for update;
  if p_expected_revision is distinct from coalesce(v_old.revision, 0) then
    raise exception 'Another editor changed this draft. Reopen it before saving.' using errcode = '40001';
  end if;
  if p_translations is not null and p_source is distinct from v_old.source then
    raise exception 'Save the English source before editing its translations.' using errcode = '22023';
  end if;
  if p_translations is not null and
     (jsonb_typeof(p_translations) is distinct from 'object' or
      not (p_translations ?& array['ar','fr','es','zh']) or
      (p_translations - array['ar','fr','es','zh']) <> '{}'::jsonb) then
    raise exception 'Provide all four target languages.' using errcode = '22023';
  end if;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    v_copy := '{}'::jsonb;
    foreach v_field in array array['eyebrow','title','text'] loop
      if btrim(p_source->>v_field) = '' then
        v_copy := v_copy || jsonb_build_object(v_field, '');
      elsif p_translations is null and v_old.source->v_field = p_source->v_field
        and jsonb_typeof(v_old.translations->v_lang->v_field) = 'string' then
        v_copy := v_copy || jsonb_build_object(v_field, v_old.translations->v_lang->v_field);
      end if;
    end loop;
    if p_translations is not null then
      v_copy := p_translations->v_lang;
      if not public.valid_home_copy(v_copy, p_source) then
        raise exception 'Check translated titles, lengths, and hidden fields.' using errcode = '22023';
      end if;
    end if;
    v_translations := v_translations || jsonb_build_object(v_lang, v_copy);
  end loop;
  insert into public.home_copy_drafts (id, revision, source, translations, updated_by)
  values ('homepage', coalesce(v_old.revision, 0) + 1, p_source, v_translations, auth.uid())
  on conflict (id) do update set revision = excluded.revision, source = excluded.source,
    translations = excluded.translations, updated_by = excluded.updated_by, updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create function public.publish_home_copy(p_expected_revision integer)
returns public.home_copy_publications language plpgsql security definer set search_path = '' as $$
declare
  v_draft public.home_copy_drafts;
  v_result public.home_copy_publications;
  v_lang text;
begin
  if not public.has_store_role(array['owner', 'admin']::public.store_role[]) then
    raise exception 'Only store owners or admins can publish homepage copy.' using errcode = '42501';
  end if;
  select * into v_draft from public.home_copy_drafts where id = 'homepage' for update;
  if not found or p_expected_revision is distinct from v_draft.revision then
    raise exception 'The draft changed. Reopen it before publishing.' using errcode = '40001';
  end if;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    if not public.valid_home_copy(v_draft.translations->v_lang, v_draft.source) then
      raise exception 'Complete all translations before publishing.' using errcode = '22023';
    end if;
  end loop;
  insert into public.home_copy_publications (id, revision, translations, published_by)
  values ('homepage', v_draft.revision,
    v_draft.translations || jsonb_build_object('en', v_draft.source), auth.uid())
  on conflict (id) do update set revision = excluded.revision, translations = excluded.translations,
    published_at = now(), published_by = excluded.published_by
  returning * into v_result;
  return v_result;
end;
$$;

-- Reserve usage before contacting Azure; failed attempts remain counted conservatively.
create function public.reserve_home_translation(p_revision integer, p_user uuid, p_characters integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_job uuid;
begin
  if p_characters is null or p_characters not between 1 and 800000 then
    raise exception 'Invalid translation size.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.staff_roles where user_id = p_user and role in ('owner', 'admin')) then
    raise exception 'Not authorized.' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(280002);
  if not exists (select 1 from public.home_copy_drafts where id = 'homepage' and revision = p_revision) then
    raise exception 'The draft changed. Reload before translating.' using errcode = '40001';
  end if;
  if exists (select 1 from public.store_translation_jobs
    where status = 'reserved' and document_revision = p_revision and created_at > now() - interval '2 minutes') then
    raise exception 'This draft is already being translated.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.store_translation_jobs
    where requested_by = p_user and created_at > now() - interval '1 minute') >= 3 then
    raise exception 'Please wait a minute before translating again.' using errcode = 'P0001';
  end if;
  if (select coalesce(sum(character_count), 0) from public.store_translation_jobs
    where created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC') + p_characters > 1800000 then
    raise exception 'The application monthly translation limit has been reached.' using errcode = 'P0001';
  end if;
  insert into public.store_translation_jobs (document_revision, requested_by, character_count)
  values (p_revision, p_user, p_characters) returning id into v_job;
  return v_job;
end;
$$;

create function public.complete_home_translation(p_job uuid, p_translations jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_job public.store_translation_jobs;
  v_draft public.home_copy_drafts;
  v_lang text;
begin
  select * into v_job from public.store_translation_jobs where id = p_job for update;
  if not found or v_job.status <> 'reserved' then
    raise exception 'Translation job is no longer active.' using errcode = '22023';
  end if;
  select * into v_draft from public.home_copy_drafts where id = 'homepage' for update;
  if not found or v_draft.revision <> v_job.document_revision then
    update public.store_translation_jobs set status = 'obsolete' where id = p_job;
    return false;
  end if;
  foreach v_lang in array array['ar','fr','es','zh'] loop
    if not public.valid_home_copy(p_translations->v_lang, v_draft.source) then
      raise exception 'Azure returned incomplete translations.' using errcode = '22023';
    end if;
  end loop;
  update public.home_copy_drafts set translations = p_translations,
    revision = revision + 1, updated_at = now() where id = 'homepage';
  update public.store_translation_jobs set status = 'completed' where id = p_job;
  return true;
end;
$$;

revoke all on function public.save_home_copy_draft(integer,jsonb,jsonb),
  public.publish_home_copy(integer), public.reserve_home_translation(integer,uuid,integer),
  public.complete_home_translation(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.save_home_copy_draft(integer,jsonb,jsonb),
  public.publish_home_copy(integer) to authenticated;
grant execute on function public.reserve_home_translation(integer,uuid,integer),
  public.complete_home_translation(uuid,jsonb) to service_role;

commit;
