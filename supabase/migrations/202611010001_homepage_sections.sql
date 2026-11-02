begin;

create table public.homepage_sections (
  key text primary key check (key ~ '^[a-z0-9_-]{2,40}$'),
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger homepage_sections_set_updated_at
  before update on public.homepage_sections
  for each row execute function public.set_updated_at();

alter table public.homepage_sections enable row level security;

create policy homepage_sections_read_public
  on public.homepage_sections for select to anon, authenticated
  using (true);

create policy homepage_sections_manage_marketing
  on public.homepage_sections for all to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

grant select on public.homepage_sections to anon, authenticated;
grant insert, update, delete on public.homepage_sections to authenticated;

commit;
