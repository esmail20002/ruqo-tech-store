import test from "node:test";
import assert from "node:assert/strict";
import { applyAzureResult, decodeTranslation, languages, planTranslation, protectText, translationUrl } from "../supabase/functions/translate-home-copy/translation.mjs";

test("empty optional fields stay empty in every language", () => {
  const plan = planTranslation({ eyebrow: "", title: "Future devices", text: "" });
  assert.equal(plan.requests.length, 4);
  for (const language of languages) {
    assert.equal(plan.translations[language].eyebrow, "");
    assert.equal(plan.translations[language].text, "");
  }
});

test("saved corrections are reused and only missing fields cost usage", () => {
  const source = { eyebrow: "Tech", title: "Devices", text: "Fast devices" };
  const saved = Object.fromEntries(languages.map((lang) => [lang, { ...source }]));
  assert.equal(planTranslation(source, saved).characters, 0);
  delete saved.ar.text;
  const plan = planTranslation(source, saved);
  assert.equal(plan.requests.length, 1);
  assert.equal(plan.requests[0].language, "ar");
  assert.equal(plan.translations.fr.title, "Devices");
});

test("brands, models and capacities are protected and source HTML escaped", () => {
  const input = "WEEXEY: Apple iPhone 16 Pro, 256 GB & <great>";
  const protectedText = protectText(input);
  assert.match(protectedText.html, /class="notranslate">Apple/);
  assert.match(protectedText.html, /&amp; &lt;great&gt;/);
  assert.equal(decodeTranslation(protectedText.html, protectedText.protectedValues), input);
  assert.throws(() => decodeTranslation("Changed", ["WEEXEY"]), /protected/);
  assert.throws(() => decodeTranslation("<script>bad</script>"), /HTML/);
});

test("Azure response language and shape must match the request", () => {
  const plan = planTranslation({ eyebrow: "", title: "Future", text: "" });
  assert.throws(() => applyAzureResult(plan.requests, [], plan.translations), /incomplete/);
  const result = languages.map((lang) => ({
    translations: [{ to: lang === "zh" ? "zh-Hans" : lang, text: `translated-${lang}` }],
  }));
  const output = applyAzureResult(plan.requests, result, plan.translations);
  assert.equal(output.zh.title, "translated-zh");
  assert.throws(() => applyAzureResult([plan.requests[0]], [{ translations: [{ to: "de", text: "wrong" }] }], {}), /language/);
});

test("encoded whitespace is not accepted as a translation", () => {
  for (const value of ["", "   ", "&nbsp;", "&#32;", "<span>&#x20;</span>"]) {
    assert.throws(() => decodeTranslation(value), /empty/);
  }
});

test("multiple Azure batches assemble a field without replacing saved corrections", () => {
  const source = { eyebrow: "Tech", title: "Future devices", text: "Long description. ".repeat(100).trim() };
  const plan = planTranslation(source, { ar: { title: "Reviewed title" } });
  for (let index = 0; index < plan.requests.length; index += 2) {
    const batch = plan.requests.slice(index, index + 2);
    applyAzureResult(batch, batch.map((item) => ({
      translations: [{ to: item.language === "zh" ? "zh-Hans" : item.language, text: item.html }],
    })), plan.translations);
  }
  assert.equal(plan.translations.ar.title, "Reviewed title");
  assert.equal(plan.translations.ar.text, source.text);
  assert.deepEqual(plan.translations.fr, source);
});

test("long descriptions are segmented without losing protected values", () => {
  const source = { eyebrow: "1 ".repeat(100).trim(), title: "1 ".repeat(300).trim(), text: "1 ".repeat(2000).trim() };
  const plan = planTranslation(source);
  assert.ok(plan.characters < 800000);
  assert.ok(plan.requests.every((item) => item.html.length < 45000));
  const azure = plan.requests.map((item) => ({
    translations: [{ to: item.language === "zh" ? "zh-Hans" : item.language, text: item.html }],
  }));
  const translated = applyAzureResult(plan.requests, azure, plan.translations);
  assert.deepEqual(translated.ar, source);
});

test("API keys cannot be sent to arbitrary or credential-bearing endpoints", () => {
  assert.equal(translationUrl("https://api.cognitive.microsofttranslator.com/", "zh").searchParams.get("to"), "zh-Hans");
  for (const endpoint of [
    "https://example.com/", "http://api.cognitive.microsofttranslator.com/",
    "https://user:password@api.cognitive.microsofttranslator.com/",
    "https://api.cognitive.microsofttranslator.com/translate?key=secret",
  ]) assert.throws(() => translationUrl(endpoint, "ar"));
});
