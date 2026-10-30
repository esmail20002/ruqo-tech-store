import test from "node:test";
import assert from "node:assert/strict";
import core from "../public/js/high-refresh-core.js";
import { highRefreshPlan, highRefreshResult } from "../supabase/functions/translate-high-refresh/content.mjs";
import { applyAzureResult } from "../supabase/functions/translate-home-copy/translation.mjs";

const now = Date.UTC(2026, 9, 28);
const products = [
  { slug: "phone", name: "Galaxy", brand: "Samsung", category: "phones", stock: true, image: "phone.png", rating: 5 },
  { slug: "laptop", name: "MacBook", brand: "Apple", category: "laptops", stock: true, image: "laptop.png", rating: 4 },
  { slug: "laptop2", name: "Zenbook", brand: "ASUS", category: "laptops", stock: true, image: "laptop2.png" },
  { slug: "unavailable", category: "laptops", stock: false, image: "empty.png" },
  { slug: "inactive", category: "laptops", stock: true, image: "inactive.png", is_active: false },
];
test("new visitors receive deterministic available products; empty catalogs stay empty", () => {
  const result = core.chooseProducts(products, null, [], now);
  assert.equal(result.mode, "automatic");
  assert.deepEqual(result.products.map((p) => p.slug), ["phone", "laptop", "laptop2"]);
  assert.deepEqual(core.chooseProducts([], null, [], now).products, []);
});
test("recent repeated category interest ranks laptops, while stale events expire", () => {
  const events = [
    { type: "category", category: "laptops", brand: "", product: "", at: now - 86400000 },
    { type: "search", category: "phones", brand: "", product: "", at: now - 31 * 86400000 },
  ];
  assert.equal(core.chooseProducts(products, null, events, now).products[0].category, "laptops");
  assert.equal(core.cleanEvents(events, now).length, 1);
});
test("published manual products override interest, honor order and filter unavailable products", () => {
  const history = [{ type: "search", category: "laptops", brand: "", product: "", at: now }];
  const result = core.chooseProducts(products, { product_slugs: ["unavailable", "phone", "laptop2"] }, history, now);
  assert.equal(result.mode, "manual");
  assert.deepEqual(result.products.map((p) => p.slug), ["phone", "laptop2"]);
  assert.equal(core.chooseProducts(products, { product_slugs: ["unavailable", "inactive"] }, history, now).mode, "automatic");
  assert.equal(core.chooseProducts(products, { product_slugs: [] }, history, now).mode, "automatic");
});
test("event storage is bounded, deduplicated and never contains raw query words", () => {
  const entry = { type: "product", category: "laptops", brand: "Apple", product: "laptop", query: "private search" };
  const first = core.record([], entry, now);
  assert.equal(core.record(first, entry, now + 1000).length, 1);
  assert.equal(core.record(first, entry, now + 1800001).length, 2);
  assert.equal(JSON.stringify(first).includes("private search"), false);
  const entries = Array.from({ length: 200 }, (_, index) => ({ ...first[0], product: String(index) }));
  assert.equal(core.cleanEvents(entries, now).length, 80);
  assert.equal(core.cleanEvents([{ ...first[0], at: now + 1 }], now).length, 0);
});
test("search matching recognizes translated categories and brands without retaining query text", () => {
  const categories = [{ slug: "laptops", name_translations: { en: "Laptops", ar: "لابتوبات" } }];
  assert.equal(core.matchSearch("لابتوبات", products, categories).category, "laptops");
  assert.equal(core.matchSearch("Apple", products, categories).brand, "Apple");
  assert.equal(core.matchSearch("unmatched query", products, categories), null);
  assert.equal(core.matchSearch("", products, categories), null);
});
test("high refresh translates optional fields and badge, protecting numbers and retaining corrections", () => {
  const plan = highRefreshPlan({
    source: { title: "Apple deals 2026", text: "", eyebrow: "", badge: "50% OFF" },
    translations: { fr: { title: "Correction Apple 2026" } },
  });
  assert.equal(plan.requests.some((request) => request.field === "text"), false);
  assert.equal(plan.requests.some((request) => request.field === "eyebrow"), false);
  assert.equal(plan.requests.some((request) => request.field === "badge"), true);
  for (const request of plan.requests) {
    applyAzureResult([request], [{ translations: [{ to: request.language === "zh" ? "zh-Hans" : request.language, text: request.html }] }], plan.translations);
  }
  const result = highRefreshResult(plan);
  assert.equal(result.fr.title, "Correction Apple 2026");
  assert.equal(result.ar.text, "");
  assert.equal(result.ar.eyebrow, "");
  assert.ok(result.zh.title.includes("Apple"));
  assert.ok(result.ar.badge.includes("50"));
});
test("translation requests reject extra fields, invalid languages, empty sources and oversized responses", () => {
  const source = { title: "Title", text: "Text", eyebrow: "View" };
  for (const body of [
    { source, secret: "no" },
    { source: { title: "", text: "", eyebrow: "", badge: "" } },
    { source, translations: { de: {} } },
    { source: { ...source, title: "a".repeat(601) } },
    { source, translations: { ar: { bad: "field" } } },
  ]) assert.throws(() => highRefreshPlan(body));
  const plan = highRefreshPlan({ source });
  plan.translations.ar.title = "a".repeat(601);
  assert.throws(() => highRefreshResult(plan));
});
test("banner slide helpers filter schedule and toggle optional overlay accurately", () => {
  const fallback = [{ id: "default-laptops", image_url: "https://example.com/default.jpg", is_active: true, source: { title: "", text: "", eyebrow: "", badge: "Laptops" } }];
  const pub = {
    slides: [
      { id: "expired", image_url: "https://example.com/1.jpg", is_active: true, ends_at: new Date(now - 1000).toISOString() },
      { id: "future", image_url: "https://example.com/2.jpg", is_active: true, starts_at: new Date(now + 60000).toISOString() },
      { id: "paused", image_url: "https://example.com/3.jpg", is_active: false },
      {
        id: "live-clean",
        image_url: "https://example.com/4.jpg",
        destination_url: "/products.html?filter=deals",
        is_active: true,
        source: { title: "", text: "", eyebrow: "", badge: "Featured" },
        translations: { ar: { title: "", text: "", eyebrow: "", badge: "إعلان مميز" } },
      },
      {
        id: "live-overlay",
        image_url: "https://example.com/5.jpg",
        destination_url: "javascript:alert(1)",
        is_active: true,
        source: { title: "Summer Offer", text: "", eyebrow: "Shop now", badge: "Hot" },
        translations: { ar: { title: "عرض الصيف", text: "", eyebrow: "تسوق الآن", badge: "عرض" } },
      },
    ],
  };
  const selected = core.activeBannerSlides(pub, fallback, now);
  assert.equal(selected.mode, "custom");
  assert.deepEqual(selected.slides.map((s) => s.id), ["live-clean", "live-overlay"]);
  const cleanAr = core.localizeSlide(selected.slides[0], "ar");
  assert.equal(cleanAr.hasOverlay, false);
  assert.equal(cleanAr.badge, "إعلان مميز");
  assert.equal(cleanAr.destinationUrl, "/products.html?filter=deals");
  const overlayAr = core.localizeSlide(selected.slides[1], "ar");
  assert.equal(overlayAr.hasOverlay, true);
  assert.equal(overlayAr.title, "عرض الصيف");
  assert.equal(overlayAr.destinationUrl, "");
  assert.equal(core.activeBannerSlides({ slides: [] }, fallback, now).mode, "default");
});
