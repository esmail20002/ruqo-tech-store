begin;

insert into public.store_settings (setting_key, setting_value, description, is_public)
values (
  'storefront',
  jsonb_build_object(
    'store_name', 'RUQO TECH',
    'logo_path', null,
    'support_email', 'hello@noursstore.com',
    'support_phone', '+966500000000',
    'free_shipping_threshold', 299,
    'standard_shipping_fee', 25,
    'brand_color', '#167c72'
  ),
  'Public storefront identity, contact, delivery, and appearance settings',
  true
)
on conflict (setting_key) do update set
  setting_value = excluded.setting_value || public.store_settings.setting_value,
  description = excluded.description,
  is_public = true;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 120),
  customer_email text not null check (char_length(customer_email) <= 254 and customer_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  message text not null check (char_length(trim(message)) between 8 and 3000),
  language_code text not null default 'en' check (language_code in ('en', 'fr', 'es', 'zh', 'ar')),
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscriptions (
  email text primary key check (email = lower(trim(email)) and char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
alter table public.newsletter_subscriptions enable row level security;

create policy contact_messages_public_submit on public.contact_messages
  for insert to anon, authenticated
  with check (status = 'new');

create policy contact_messages_staff_read on public.contact_messages
  for select to authenticated
  using (public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]));

create policy contact_messages_staff_update on public.contact_messages
  for update to authenticated
  using (public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'order_manager']::public.store_role[]));

create policy newsletter_public_subscribe on public.newsletter_subscriptions
  for insert to anon, authenticated
  with check (is_active);

create policy newsletter_marketing_read on public.newsletter_subscriptions
  for select to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

create policy newsletter_marketing_update on public.newsletter_subscriptions
  for update to authenticated
  using (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]))
  with check (public.has_store_role(array['owner', 'admin', 'marketing_manager']::public.store_role[]));

grant insert on public.contact_messages, public.newsletter_subscriptions to anon, authenticated;
grant select, update on public.contact_messages, public.newsletter_subscriptions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-assets', 'store-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy store_assets_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'store-assets');

create policy store_assets_admin_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'store-assets'
    and public.has_store_role(array['owner', 'admin']::public.store_role[])
  );

create policy store_assets_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'store-assets'
    and public.has_store_role(array['owner', 'admin']::public.store_role[])
  )
  with check (
    bucket_id = 'store-assets'
    and public.has_store_role(array['owner', 'admin']::public.store_role[])
  );

create policy store_assets_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'store-assets'
    and public.has_store_role(array['owner', 'admin']::public.store_role[])
  );

commit;