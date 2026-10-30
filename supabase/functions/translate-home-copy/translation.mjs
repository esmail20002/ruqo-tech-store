export const languages = ["ar", "fr", "es", "zh"];
export const fields = ["eyebrow", "title", "text"];
const azureLanguages = { ar: "ar", fr: "fr", es: "es", zh: "zh-Hans" };
const protectedTerms = /\b(?:WEEXEY(?: TECH)?|Apple|Samsung|Sony|Microsoft|MacBook|iPhone|iPad|AirPods|Galaxy|USB-C|Wi-Fi|Bluetooth|[A-Z]+\d[A-Z\d-]*|\d+(?:[.,]\d+)?(?:\s?(?:GB|TB|MB|GHz|MHz|mAh|Hz|mm|cm|kg|W))?)\b/gi;

const escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function protectText(text) {
  let end = 0;
  let html = "";
  const protectedValues = [];
  for (const match of text.matchAll(protectedTerms)) {
    html += escapeHtml(text.slice(end, match.index));
    html += `<span class="notranslate">${escapeHtml(match[0])}</span>`;
    protectedValues.push(match[0]);
    end = match.index + match[0].length;
  }
  return { html: html + escapeHtml(text.slice(end)), protectedValues };
}

export function decodeTranslation(html, protectedValues = []) {
  if (typeof html !== "string" || !html.trim()) throw new Error("Azure returned an empty translation.");
  const plain = html.replace(/<\/?span\b[^>]*>/gi, "");
  if (/<[^>]*>/.test(plain)) throw new Error("Azure returned unexpected HTML.");
  const text = plain.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
    const normalized = entity.toLowerCase();
    if (normalized in named) return named[normalized];
    const point = normalized.startsWith("#x")
      ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
    if (!Number.isInteger(point) || point < 0 || point > 0x10ffff) throw new Error("Invalid translation encoding.");
    return String.fromCodePoint(point);
  }).trim();
  if (!text) throw new Error("Azure returned an empty translation.");
  for (const value of new Set(protectedValues)) {
    if (!text.includes(value)) throw new Error("Azure changed a protected brand, model, or number.");
  }
  return text;
}

export function planTranslation(source, saved = {}) {
  /** @type {Record<string, Record<string, string>>} */
  const translations = {};
  /** @type {Array<{language: string, field: string, segment: number, html: string, protectedValues: string[]}>} */
  const requests = [];
  for (const language of languages) {
    translations[language] = {};
    for (const field of fields) {
      if (typeof source?.[field] !== "string") throw new Error("Invalid English source.");
      const text = source[field];
      if (!text.trim()) translations[language][field] = "";
      else if (typeof saved[language]?.[field] === "string" && saved[language][field].trim()) {
        translations[language][field] = saved[language][field];
      } else {
        const parts = [];
        let part = "";
        for (const word of text.match(/\S+\s*/g) || []) {
          if (part && part.length + word.length > 300) {
            parts.push(part.trim());
            part = "";
          }
          part += word;
        }
        if (part.trim()) parts.push(part.trim());
        parts.forEach((value, segment) => requests.push({
          language, field, segment, ...protectText(value),
        }));
      }
    }
  }
  return {
    translations,
    requests,
    // Include HTML markup in the reservation so the application errs on the safe side.
    characters: requests.reduce((sum, item) => sum + [...item.html].length, 0),
  };
}

export function applyAzureResult(requests, result, translations) {
  if (!Array.isArray(result) || result.length !== requests.length) throw new Error("Azure returned an incomplete response.");
  const assembled = new Map();
  requests.forEach((request, index) => {
    const items = result[index]?.translations;
    const translated = Array.isArray(items)
      ? items.find((item) => item?.to === azureLanguages[request.language]) : null;
    if (!translated) throw new Error("Azure did not return the requested language.");
    const key = `${request.language}:${request.field}`;
    if (!assembled.has(key)) assembled.set(key, []);
    assembled.get(key).push(decodeTranslation(translated.text, request.protectedValues));
  });
  for (const [key, parts] of assembled) {
    const [language, field] = key.split(":");
    translations[language][field] = [translations[language][field], ...parts].filter(Boolean).join(" ");
  }
  return translations;
}

export function translationUrl(endpoint, language) {
  const url = new URL(endpoint);
  const allowedHosts = ["api.cognitive.microsofttranslator.com", "api-eur.cognitive.microsofttranslator.com", "api-nam.cognitive.microsofttranslator.com", "api-apc.cognitive.microsofttranslator.com"];
  if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname) || url.username || url.password || url.port || !["", "/"].includes(url.pathname) || url.search || url.hash) {
    throw new Error("Configure an approved Azure text translation endpoint.");
  }
  url.pathname = "/translate";
  url.search = new URLSearchParams({ "api-version": "3.0", from: "en", to: azureLanguages[language], textType: "html" }).toString();
  return url;
}
