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

### High refresh: recommendations and curated campaigns

The **high refresh** sidebar section is separate from Homepage spotlight and is available to owners/admins. It edits only the large editorial product section on the homepage and experiments page. No curated publication (or an empty published selection) means **Products for you** in all five storefront languages.

- Save draft does not publish. Select/reorder up to 12 active products, edit the English title, optional description, product-button label and optional HTTPS cover image URL. Without a custom cover, each product uses its own photo.
- Save English changes before generating Azure previews. Only missing/current-source fields are generated; reviewed corrections remain. Changing an English field invalidates just that field in all four target languages. Preview translations stay in the editor until Save draft.
- Publish requires saved, complete translations for manual selections and checks the expected draft revision. Drafts are not public and direct browser writes to publication tables are denied. Returning to automatic retains the manual draft but publishes no draft text/image. Empty selections also publish automatic mode.
- Publishing a curated selection replaces personalized recommendations for everyone. Existing live prices, currency conversion and timed discounts are reused; this editor does not create discounts. Out-of-stock/inactive/imageless products are skipped. If no selected product remains eligible, automatic recommendations resume.
- The storefront shows one product with explicit previous/next controls (no automatic rotation). Button destinations always use the selected product; reduced-motion users do not receive navigation animations.
- The large visual uses wide scenes so it keeps the original editorial composition: manual custom cover → the product category's uploaded cover → a built-in landscape scene for phones/laptops/audio/wearables → the product photo on a soft stage. The recommended product's own photo always appears as a thumbnail in the floating card.
- Anonymous browser-local interests use category/product views and matched searches, not an external AI service. Search text is matched against multilingual category/product names and brands, then discarded. Only category, brand, product identifier, event type and timestamp are stored in `ruqo-interest-history-v1`, capped at 80 events for 30 days. Duplicate signals within 30 minutes are ignored; scores decay with a seven-day half-life. New visitors see available featured/highly rated products. No speculative accessory relationship is inferred.
- The storefront personalization disclosure supports clearing history and opting out on that browser. Global Privacy Control / Do Not Track disable recording; storage failures are logged and surfaced in the disclosure, with in-memory recommendations for that session. No interest history is sent to Supabase or Azure.
- `high_refresh_drafts` and `high_refresh_publications` have separate access policies. Save/publish RPCs are revision-checked and serialized. `translate-high-refresh` authenticates the user and verifies owner/admin roles before calling the shared Azure runner. Usage shares the existing three jobs/user/minute and conservative 1,800,000 characters/month budget with homepage/category translation.

Deploy `202610280003_high_refresh.sql` and `supabase functions deploy translate-high-refresh --use-api`. Existing Azure secrets/origin configuration are reused. The function uses explicit token verification with `verify_jwt=false`, like the other translation functions.

Validation:
```powershell
node --test scripts\translation.test.mjs scripts\category-translation.test.mjs scripts\high-refresh.test.mjs
supabase db query --linked --file scripts\high-refresh-db.test.sql --output json
npm run build:pages
```
The SQL tests roll back all changes, including test publications and translation reservations. Browser tests should never overwrite a shared publication to test manual mode; use a page-local fixture or a rolled-back SQL transaction.

### Experiments product page

`experiments-product.html` (local-only) adds `css/experiments-product.css` and `js/experiments-product.js` on top of the shared product renderer, without changing `commerce.js` or the live product page. On desktop the gallery stays in view while the purchase column scrolls; the Highlights/specifications sections are moved after the product hero so the sticky gallery cannot overlap them. Bulleted "Label: value" descriptions become icon fact cards (plain descriptions are left unchanged). Options sit above quantity in one full-width purchase panel with a live selection summary. A compact purchase bar appears after the main Add to bag button scrolls away; it mirrors the current name, selection, price and disabled state, and clicks the real button so cart/variant logic is unchanged. A soft glow uses a colour sampled from the product image, falling back to the brand purple. Supports five languages, RTL, dark mode and reduced motion.

### Site-wide stability notes

- `store.js` guards `lucide.createIcons()`: Lucide keeps `data-lucide` on generated SVGs, so unguarded global calls (from timers such as the mobile offer rotator) redrew every icon on the page every few seconds. Rendered SVGs are now marked `data-rendered-icon`, so later calls only process new `<i data-lucide>` placeholders. Always create a new `<i data-lucide>` element when changing an icon; never rename an existing SVG.
- The homepage keeps its language in sync through the shared `ruqo:language-updated` event, so the mobile drawer and other language controls update the spotlight card (localized category name and review count) as well as the header selector.
- Keep each asset's `?v=` cache version identical on every page and bump it whenever the file changes; mismatched versions let browsers serve stale code on some pages.
- `scripts/build-pages.js` excludes the experiments pages and their assets and the Git-ignored `admin-local-dev.js` from the production build.

### Storefront branding

Built-in page titles, metadata, translations, image labels, and admin copy use WEEXEY. Public settings with the legacy store name RUQO or RUQO TECH are displayed as WEEXEY, and legacy names in configured footer copy use the current store name. Other configured store names remain supported. Internal `RUQO_*` APIs, `ruqo:*` events, storage keys, and cloud identifiers remain unchanged for compatibility; this display update does not write to remote settings.

### Admin color themes

The admin palette in `public/css/admin.css` follows the storefront's purple identity, warm light surfaces, and plum/charcoal dark surfaces. Button fills and accent text have separate tokens so white button labels and lavender dark-mode links retain readable contrast. Published states remain green in both themes. The light sign-in palette is scoped separately to preserve its existing appearance; dark sign-in fields, buttons, and aside use the admin dark palette. Theme persistence and authentication behavior are unchanged.

The desktop sidebar stays expanded, with independently scrolling navigation between a fixed workspace header and account/sign-out footer. Navigation is grouped by management, storefront, and preferences; groups with no role-authorized links are hidden. At 850px and below, the sidebar becomes a modal drawer with background scroll locking, focus containment, Escape/backdrop dismissal, and focus restoration. Choosing a section closes the drawer and focuses its heading. Shared readability improvements exclude the Homepage spotlight content, and the sign-in layout is unchanged.

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

The homepage and experiments share the premium storefront stylesheet. Their **New this week**, service, testimonial, and statistics grids keep two columns at mobile widths, including screens at or below 390px. Statistics remain visible on mobile. At narrow widths, square product images, reduced card spacing, and stacked testimonial author details preserve room for text. Banners, editorial sections, newsletter, other pages, and desktop layouts retain their existing behavior.

The homepage **Product Categories** section displays four equal-width cards in one horizontal row on desktop and two larger cards per row on mobile (`max-width: 650px`). Mobile cards each occupy half the track after the gap, with larger text, padding, and a 240px minimum height. Additional categories scroll horizontally with snapping; catalog order, links, full category text, and **View all** are preserved. Desktop arrows and keyboard left/right navigation support both LTR and RTL; phones use native touch scrolling. Mobile cards retain their names, descriptions, and localized counts. The separate category catalogs page is unchanged.

When the categories overflow the visible track (more than four on desktop or two on mobile), the visible carousel advances one card every four seconds and reverses at its ends. Mouse hover, keyboard focus, a pressed pointer, scrolling, a hidden tab, or leaving the viewport suspend/restart its timer. A localized desktop pause/resume button lets visitors stop automatic movement persistently for the page session. Desktop controls use a compact pill-shaped surface, inline SVG chevrons that mirror for RTL, and a filled purple pause/play action. Icons render without waiting for the external icon library and only update when their state changes. On mobile, the controls and their spacing are hidden; automatic movement and native touch scrolling remain enabled. Reduced-motion mode disables autoplay and hover/reveal motion while retaining manual navigation. Controls hide when the cards fit, and catalog/language refreshes reset navigation without adding duplicate controls or timers.

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

## Category covers and translation previews

**Add / Edit category** supports an optional cover uploaded from the administrator's device. JPEG, PNG, and WebP files up to 5 MB are accepted; previewing/replacing/removing a cover does not write to storage until **Save category**. The `category-images` public bucket permits uploads/deletions only for owners, admins, and catalog managers. Covers use unique paths, and an old cover is removed only after the category save succeeds. Failed saves attempt to remove unused uploads and report cleanup failures explicitly. Existing-category saves use `updated_at` to reject concurrent edits.

The migration `migrations/202610280002_category_covers_translation.sql` adds `cover_storage_path` and `translation_sources` without changing existing text or images. A custom cover takes precedence in both homepage category cards and the separate category catalogs, including filtered catalog views. Without a custom cover, existing product-image fallback behavior is preserved. Product photographs and category ordering are unchanged.

**Generate translations** sends only the English category name/description and current target-language text to `translate-category`. Owners, admins, and catalog managers can generate Arabic, French, Spanish, and Simplified Chinese previews. Generated results remain in the editor: they do not save or publish a category. **Save category** commits the cover choice and reviewed text together; saving an active category updates its live content directly, with no separate publication step. Closing without saving discards preview changes.

Names have a 200-character limit and descriptions a 4000-character limit. Generation fills missing fields while retaining corrections associated with the current English source. English edits mark affected translations for review. Legacy target fields identical to English and without source metadata are also marked as unverified, rather than silently treated as a finished translation. Generation asks before replacing marked fields; declining keeps them and generates only missing fields. Alternatively edit them manually or explicitly choose **Keep existing translations (reviewed)**. Saving is blocked until marked fields are reviewed. Missing translations can still be saved; storefronts retain their normal English fallback instead of writing English duplicates into every language.

The preview service shares the homepage translator's protected brands/numbers, endpoint restrictions, request timeouts, three-requests-per-user-per-minute limit, and conservative 1.8-million-character monthly budget. `store_translation_jobs.document_type` distinguishes category previews from homepage jobs. Category jobs store usage/status only, not category text. Only the server can reserve usage; browser requests authenticate through Supabase Auth and require a catalog editing role. Both translators use the shared `_shared/azure-translator.ts` runner; deploy both when changing that shared implementation.

Configure the same Azure secrets/origin allowlist described below, then:

```powershell
supabase db push --linked --dry-run
supabase db push --linked
supabase functions deploy translate-category --project-ref stjoknjzmdopxzifixja --use-api
supabase functions deploy translate-home-copy --project-ref stjoknjzmdopxzifixja --use-api
node --test scripts\translation.test.mjs scripts\category-translation.test.mjs
supabase db query --linked --file scripts\category-db.test.sql
npm run build:pages
```

The category SQL test wraps all mutations in `BEGIN`/`ROLLBACK`, requires an existing owner/admin, and never calls Azure or commits test categories. Browser verification should test translation previews without pressing Save on test content. Upload smoke tests must use unique unreferenced paths and remove them afterward.

## Homepage copy and Azure translation

This is the first dynamic-content slice of the hybrid translation system, not automatic translation of the entire catalog or site. Existing UI dictionaries and catalog translations remain unchanged. Visitors read saved publications from Supabase; they never call Azure.

Owners and admins can open **Homepage spotlight > Edit homepage text**:

1. Write the small heading, main title, and description in English.
2. **Save draft** without changing the live storefront.
3. **Generate translations** for Arabic, French, Spanish, and Simplified Chinese.
4. Select each language to review, correct, and save its translation.
5. **Publish** only when all four translations are complete.

The title is mandatory. Clearing an optional English heading or description hides that element in every language. Changing an English field invalidates only that field's translations; unchanged fields and manual corrections are retained. Generation fills missing translations rather than overwriting reviewed text. Revision checks reject stale saves and discard translation results for an older draft; reopen the editor to load the latest version.

The additive migration `migrations/202610280001_home_copy_translation.sql` creates:

- `home_copy_drafts`: staff-only English source and target-language drafts.
- `home_copy_publications`: public read-only snapshot, updated atomically by the publish RPC.
- `store_translation_jobs`: server-managed usage reservations and job status.

Browser writes use owner/admin-only RPCs; there are no direct public table writes. The Edge Function verifies the session through Supabase Auth and checks the staff role explicitly. Its `verify_jwt = false` configuration disables only the gateway's JWT check, not handler authentication.

Published copy overrides managed hero-banner text, including after banners load or the language changes. Banner images, buttons, and destinations are preserved. Without a publication, existing built-in or managed-banner text remains in use. All saved copy is rendered as text, never HTML.

### Setup and deployment

Use the store project only (`stjoknjzmdopxzifixja`), not the separate carfix project. Configure these secrets in the Supabase dashboard; never place their values in browser code or Git:

- `AZURE_TRANSLATOR_KEY`
- `AZURE_TRANSLATOR_ENDPOINT`: `https://api.cognitive.microsofttranslator.com/` for the Global resource. The function also permits Azure's standard `api-eur`, `api-nam`, and `api-apc` text-translation hosts.
- `AZURE_TRANSLATOR_REGION`: optional; supply the resource's region if required by its Azure configuration.
- `RUQO_ALLOWED_ORIGINS`: optional comma-separated exact origins. If set, it replaces the defaults; include all intended storefront/admin origins and development origins. No trailing slashes.

The hosted function receives `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase automatically. Default origins match the current ruqo.pro, Vercel, GitHub Pages, and localhost:3000 deployments; update the allowlist when changing domains.

```powershell
supabase db push --linked --dry-run
supabase db push --linked
supabase functions deploy translate-home-copy --project-ref stjoknjzmdopxzifixja --use-api
node --test scripts\translation.test.mjs
npm run build:pages
```

Deploy the frontend separately after applying the migration/function. The site does not embed Azure credentials.

### Usage, limits, and verification

Azure F0 provides 2 million characters per month; target languages each contribute usage. The application conservatively reserves at most **1,800,000 characters per UTC calendar month**, including protected HTML markup and failed/obsolete jobs. This is a local safety limit, not Azure's billing meter: it does not account for other applications sharing the resource and may differ from Azure's billing period. Monitor Azure usage as well. Translation is capped at three requests per user per minute, with duplicate active revisions blocked temporarily. Requests use bounded batches and timeouts with no automatic retries.

Common brand/model tokens and numeric specifications are marked as non-translatable; returned text is checked for those protected values. Review remains necessary for translation quality and product-specific terminology. Azure errors leave published content unchanged and keep the English draft saved. A failed operation may already have consumed Azure quota and its reservation is retained.

Upgrading Azure does not happen automatically. Standalone paid Translator uses **S1**; changing the Azure tier does not remove this application's conservative monthly cap. Review the limit deliberately before increasing it.

`scripts/translation-db.test.sql` exercises the RPC lifecycle and access rules. It requires an existing owner/admin and an initially empty homepage-copy dataset. Run it only in a disposable database or in an explicitly rolled-back transaction with isolated test data; never execute it unwrapped against production. The real-service smoke test is: sign in as owner/admin, save the current English copy as a draft, generate translations, inspect all four languages and the completed job, and verify the publication is unchanged. Do not publish test copy.

## Current boundary

The public storefront is still a local demo until its product reads and checkout flow are explicitly switched to Supabase. This foundation protects orders and customer data by default; catalog import alone does not enable public checkout or real payment processing.
