begin;

alter table public.products
  add column description_name_translations jsonb not null default '{}'::jsonb
  check (jsonb_typeof(description_name_translations) = 'object');

update public.products
set description_name_translations = description_translations
where description_translations <> '{}'::jsonb;

commit;
