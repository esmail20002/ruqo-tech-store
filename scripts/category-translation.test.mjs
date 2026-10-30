import test from "node:test";
import assert from "node:assert/strict";
import { categoryTranslationPlan, categoryTranslationResult } from "../supabase/functions/translate-category/category.mjs";
import { applyAzureResult, languages } from "../supabase/functions/translate-home-copy/translation.mjs";

test("category preview translates missing fields and retains manual corrections", () => {
  const plan = categoryTranslationPlan({
    source: { name: "WEEXEY devices", description: "Apple iPhone 16 with 256 GB" },
    translations: { ar: { name: "Reviewed name" }, fr: { description: "Reviewed description" } },
  });
  assert.equal(plan.requests.length, 6);
  applyAzureResult(plan.requests, plan.requests.map((request) => ({
    translations: [{ to: request.language === "zh" ? "zh-Hans" : request.language, text: request.html }],
  })), plan.translations);
  const output = categoryTranslationResult(plan);
  assert.equal(output.ar.name, "Reviewed name");
  assert.equal(output.fr.description, "Reviewed description");
  assert.equal(output.zh.description, "Apple iPhone 16 with 256 GB");
  assert.deepEqual(Object.keys(output), languages);
});

test("empty descriptions do not generate Azure requests", () => {
  const plan = categoryTranslationPlan({ source: { name: "Devices", description: "" } });
  assert.equal(plan.requests.length, 4);
  assert.ok(plan.requests.every((request) => request.field === "title"));
});

test("fully reviewed category content makes no Azure request", () => {
  const translations = Object.fromEntries(languages.map((lang) => [lang, { name: "Reviewed", description: "" }]));
  const plan = categoryTranslationPlan({ source: { name: "Devices", description: "" }, translations });
  assert.equal(plan.characters, 0);
  assert.equal(categoryTranslationResult(plan).ar.name, "Reviewed");
});

test("category previews reject invalid shape, fields, sizes and arbitrary languages", () => {
  const source = { name: "Devices", description: "" };
  for (const payload of [
    null, [], {}, { source: { ...source, extra: true } }, { source: { name: "", description: "" } },
    { source: { name: "x".repeat(201), description: "" } }, { source: { name: "x", description: "x".repeat(4001) } },
    { source, endpoint: "https://example.com" }, { source, translations: { de: {} } },
    { source, translations: { ar: { name: 12 } } }, { source, translations: [] },
    { source, translations: { ar: { description: "x".repeat(4001) } } },
  ]) assert.throws(() => categoryTranslationPlan(payload));
});

test("oversized or incomplete translated names are not returned", () => {
  assert.throws(() => categoryTranslationResult({ translations: { ar: { title: "x".repeat(201), text: "" } } }));
  assert.throws(() => categoryTranslationResult({ translations: { ar: { title: "", text: "" } } }));
});
