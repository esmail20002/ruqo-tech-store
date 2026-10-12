# RUQO TECH database

This folder is the database source of truth for the store. The existing `carfix` project is separate and must not be linked or modified.

## Layout

- `config.toml`: local Supabase CLI settings for `ruqo-tech-store`.
- `migrations/`: versioned schema, access policies, storage, and baseline settings.
- `seed.sql`: repeatable category/settings seed for local database resets.
- `seeds/catalog.sql`: generated, repeatable import of the current catalog.
- `../scripts/seed-supabase.js`: regenerates the catalog seed from `public/js/catalog-data.js`.

## Main tables

- Catalog: `categories`, `products`, `product_features`, `product_variants`, `product_images`.
- Merchandising: `promotions`, `banners`.
- Customers and staff: `profiles`, `staff_roles`.
- Sales: `orders`, `order_items`, `order_events`.
- Configuration: `store_settings`.

All public catalog reads are limited to active records. Write access is controlled by RLS and staff roles: `owner`, `admin`, `catalog_manager`, `order_manager`, and `marketing_manager`. Guest orders must be created by a trusted Edge Function; the browser is deliberately not allowed to insert orders or set prices.

## RUQO cloud project

The new `RUQO` cloud project is created in the existing Supabase organization, located in West EU (Ireland), and linked to this workspace by project reference `stjoknjzmdopxzifixja`. The other project `carfix` is separate and must remain untouched.

```powershell
supabase db push
```

The applied migrations create the schema, RLS policies, `product-images` bucket, four categories, and public storefront defaults. Run `supabase migration list` to compare local and remote migration versions.

## Import the current storefront catalog

Generate the SQL seed from the storefront catalog, then execute it through the authenticated Supabase CLI session. No service-role key is needed for this local import command:

```powershell
npm run supabase:catalog:seed
supabase db query --linked --file supabase/seeds/catalog.sql
```

The seed is idempotent and includes all 13 products, five-language descriptions and features, variants, and current external product images. After changing the catalog source, regenerate the seed, review its diff, and apply it with the CLI command above.

## First admin user

Create/sign in the intended admin user through Supabase Auth. Then, in the new project's SQL Editor, grant the owner role to that user's UUID:

```sql
insert into public.staff_roles (user_id, role)
select id, 'owner'::public.store_role
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id, role) do nothing;
```

Use a real admin email in the dashboard editor, not in a committed SQL file. Do not create a public sign-up path for staff roles.

## Current boundary

The public storefront is still a local demo until its product reads and checkout flow are explicitly switched to Supabase. This foundation protects orders and customer data by default; catalog import alone does not enable public checkout or real payment processing.
