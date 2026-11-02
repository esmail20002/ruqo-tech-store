begin;

alter table public.banners
  add column eyebrow_translations jsonb not null default '{}'::jsonb
    check (jsonb_typeof(eyebrow_translations) = 'object'),
  add column background_color text not null default '#6931a9'
    check (background_color ~ '^#[0-9A-Fa-f]{6}$');

create table public.homepage_promo_settings (
  id text primary key default 'homepage' check (id = 'homepage'),
  interval_seconds integer not null default 5 check (interval_seconds between 3 and 15),
  transition_style text not null default 'fade' check (transition_style in ('fade', 'slide')),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.homepage_promo_settings (id)
values ('homepage')
on conflict (id) do nothing;

create trigger homepage_promo_settings_set_updated_at
  before update on public.homepage_promo_settings
  for each row execute function public.set_updated_at();

alter table public.homepage_promo_settings enable row level security;

create policy homepage_promo_settings_read_public
  on public.homepage_promo_settings for select to anon, authenticated
  using (true);

create policy homepage_promo_settings_manage_marketing
  on public.homepage_promo_settings for all to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

grant select on public.homepage_promo_settings to anon, authenticated;
grant insert, update, delete on public.homepage_promo_settings to authenticated;

commit;
