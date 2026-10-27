# RUQO TECH database

This folder is the database source of truth for the store. The existing `carfix` project is separate and must not be linked or modified.

## Layout

- `config.toml`: local Supabase CLI settings for `ruqo-tech-store`.
- `migrations/`: versioned schema, access policies, storage, and baseline settings.
- `seed.sql`: repeatable category/settings seed for local database resets.
- `seeds/catalog.sql`: generated, repeatable import of the current catalog.
- `../scripts/seed-supabase.js`: regenerates the catalog seed from `public/js/catalog-data.js`.

## Main tables

- Catalog: `categories`, `products`, `product_features`, `product_variants`, `product_images`, `product_detail_images`.
- Merchandising: `promotions`, `banners`.
- Customers and staff: `profiles`, `staff_roles`.
- Sales: `orders`, `order_items`, `order_events`.
- Configuration: `store_settings`.

All public catalog reads are limited to active records. Write access is controlled by RLS and staff roles: `owner`, `admin`, `catalog_manager`, `order_manager`, and `marketing_manager`. Guest orders must be created by a trusted Edge Function; the browser is deliberately not allowed to insert orders or set prices.

### Storefront branding

Built-in page titles, metadata, translations, image labels, and admin copy use WEEXEY. Public settings with the legacy store name RUQO or RUQO TECH are displayed as WEEXEY, and legacy names in configured footer copy use the current store name. Other configured store names remain supported. Internal `RUQO_*` APIs, `ruqo:*` events, storage keys, and cloud identifiers remain unchanged for compatibility; this display update does not write to remote settings.

### Homepage mobile product grid

The shared shopping assistant uses a centered desktop dialog and a mobile bottom sheet with a branded header, scrollable welcome/conversation area, category starter cards, and an anchored composer. Conversation cards show catalog images, brands, localized names, currency-aware prices, and product links. The new-conversation button clears messages and restores the welcome state; closing/reopening retains the current conversation. All five languages, RTL, themes, focus trapping, Escape, backdrop dismissal, and focus restoration remain supported. Recommendations still use the existing local catalog matcher, not an external AI service; the footer makes their catalog source explicit. Dialog padding is explicitly reset so generic storefront section rules do not add empty space.

Same-language menu rebuilds rebind the assistant trigger without recreating its dialog or losing the conversation, including when remote settings arrive after opening. Changing the language still resets the conversation with translated copy. The drawer captures the page's inert state when opened rather than during initialization, so a background rebuild while the assistant is open cannot leave the page inert after closing.

On phones and compact touch layouts, opening or resetting the assistant focuses the dialog rather than the input; suggestion buttons also do not summon the software keyboard. Explicit message submission retains input focus. While open, `visualViewport` resize/scroll events keep the dialog inside the visible height and offset above the keyboard, with `window.resize` as the fallback. A focused input plus more than 80px of vertical viewport loss enables compact spacing and a scrollable suggestions area, without changing fonts or removing content. Listeners are removed on close, normal dimensions return when the keyboard closes, and desktop input autofocus remains unchanged.

The homepage and experiments load their shared language dictionary in the head. A short-lived parser observer applies the saved language (including raw and JSON storage values) before the main script takes over, without hiding the page or adding a loading screen. The legacy navigation is suppressed during drawer initialization, with a normal-navigation fallback if initialization fails. Local storefront scripts run before deferred Lucide/Supabase scripts, so external CDN delays no longer postpone translation or menu setup; Lucide refreshes icons when it finishes loading.

The mobile promotional banner uses a full-bleed image, directional text gradient, prominent untruncated headline, and a 180px minimum height that grows with content. Sibling dot buttons select local offers without nesting buttons inside the offer link. A pause control, focus/hover suspension, visibility checks, and reduced-motion support govern auto-rotation. A single managed `mobile_promo` keeps its existing content/destination and hides multi-offer controls. Desktop remains unaffected.

The shared premium product specifications table uses 0.75rem labels and 0.8rem values with 1.5 line height on phones (`max-width: 650px`). Both product pages retain the existing column layout and full text; desktop typography is unchanged.

Main-image hover zoom responds to actual mouse pointer movement, including hybrid touch/mouse devices regardless of their primary-pointer media classification. It still requires a viewport of at least 800px and at least 220px of available zoom-pane width. Touch/pen input, pointer leave, and pointer cancellation dismiss hover zoom; touch gallery gestures and click-to-open viewing remain unchanged.

Premium product pages hide the main-image previous/next arrows on desktop as well as mobile. Thumbnail navigation, swipe gestures, and the enlarged viewer's arrows remain available.

The shared site drawer on phones (`max-width: 650px`) uses `min(350px, 85vw)` width, stays flush with the top edge, and leaves 12px below with rounded bottom corners. Its existing content order and seven-column tools row are preserved with compact horizontal spacing; desktop sizing is unchanged.

The homepage and experiments brand and top announcement strips retain their lightweight CSS marquees on touch devices. With `prefers-reduced-motion: reduce`, animation stops and their content wraps into static lists without duplicate groups. Other touch-device motion reductions remain unchanged.

The homepage and experiments share the premium storefront stylesheet. Their **New this week**, category, service, testimonial, and statistics grids keep two columns at mobile widths, including screens at or below 390px. Statistics remain visible on mobile. At narrow widths, square product images, compact category covers, reduced card spacing, and stacked testimonial author details preserve room for text. Banners, editorial sections, newsletter, other pages, and desktop layouts retain their existing behavior.

### Storefront category catalogs

The homepage's **Product Categories → View all** link opens [the category catalogs page](../public/categories.html). Its cards, the homepage categories, and the product-list category filters use the same `NoursData.getCategories()` model. Active categories retain their database ordering and translated names/descriptions; card images come from their products, and counts reflect the loaded active products. Selecting a card opens the product list filtered by its category slug, including custom categories. Categories with no products remain visible with a zero count; an empty active-category list displays an empty state. Without a remote category list, categories are derived from the local product catalog.

The catalog explorer supports category/product search, brand, minimum/maximum budget, stock, and sorting by name, matching-product count, or starting price. Prices are entered in the selected display currency and converted to SAR for matching and navigation. Active filters hide categories with no matching products. Quick previews show up to four matching products; category links transfer filters using `catalog=1`, `q`, `brand`, `min`, `max`, and `stock=1` (URL prices are SAR). An explorer entry overrides saved brand selections for that visit. `NoursData.matchesCatalogProduct()` shares search matching between the explorer and product list. Mobile filters and previews use native modal dialogs with keyboard dismissal.

The catalog introduction uses up to three real product images from distinct active categories on desktop only (`min-width: 1001px` picture sources). Compact catalog cards display an edge-to-edge cover image (cropped to fit without distortion), category name and matching count, and a list of brands with their matching-product counts. Brand links open that category with the selected brand while preserving the search, budget, and stock filters. A small footer retains starting price and quick preview. Preview summaries show the full matching count and starting price, while their product grids remain capped at four.

Catalog previews close with Escape, the accessible top-right close icon, or a click/tap that both starts and ends outside the dialog. The heading and close control remain visible while preview content scrolls; clicks inside the dialog and drags starting inside do not dismiss it. Closing restores focus to the preview trigger without scrolling the underlying page.

On phones at or below 550px, category cards retain two columns with compact spacing and headings, wrapping brand names, and a vertically stacked starting-price/preview footer. Brand rows have a 32px minimum height and compact vertical padding without reducing text size; longer names can expand the rows. Cover images remain edge-to-edge. Preview product grids, filters, and desktop card layouts are unchanged.

## RUQO cloud project

The new `RUQO` cloud project is created in the existing Supabase organization, located in West EU (Ireland), and linked to this workspace by project reference `stjoknjzmdopxzifixja`. The other project `carfix` is separate and must remain untouched.

```powershell
supabase db push
```

The applied migrations create the schema, RLS policies, `product-images` bucket, four categories, and public storefront defaults. The latest migration adds ordered product-detail images, separate from the primary gallery. Run `supabase migration list` to compare local and remote migration versions.

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
