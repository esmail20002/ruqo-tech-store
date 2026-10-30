import { languages, planTranslation } from "../translate-home-copy/translation.mjs";

export function categoryTranslationPlan(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      Object.keys(payload).some((key) => !["source", "translations"].includes(key))) {
    throw new Error("Provide category source and translations only.");
  }
  const source = payload.source;
  if (!source || typeof source !== "object" || Array.isArray(source) ||
      Object.keys(source).length !== 2 ||
      typeof source.name !== "string" || !source.name.trim() || source.name.length > 200 ||
      typeof source.description !== "string" || source.description.length > 4000) {
    throw new Error("Enter an English name (up to 200 characters) and description (up to 4000).");
  }
  const saved = payload.translations ?? {};
  if (!saved || typeof saved !== "object" || Array.isArray(saved) ||
      Object.keys(saved).some((key) => !languages.includes(key))) throw new Error("Invalid target languages.");
  const normalized = {};
  for (const language of languages) {
    const copy = saved[language] ?? {};
    if (!copy || typeof copy !== "object" || Array.isArray(copy) ||
        Object.keys(copy).some((key) => !["name", "description"].includes(key))) throw new Error("Invalid category translation.");
    for (const [field, limit] of [["name", 200], ["description", 4000]]) {
      if (copy[field] !== undefined && (typeof copy[field] !== "string" || copy[field].length > limit)) {
        throw new Error("Check translated category text lengths.");
      }
    }
    normalized[language] = { eyebrow: "", title: copy.name || "", text: copy.description || "" };
  }
  return planTranslation({ eyebrow: "", title: source.name, text: source.description }, normalized);
}

export function categoryTranslationResult(plan) {
  return Object.fromEntries(languages.map((language) => {
    const { title, text } = plan.translations[language];
    if (typeof title !== "string" || !title.trim() || title.length > 200 ||
        typeof text !== "string" || text.length > 4000) throw new Error("Translated category text exceeds the field limits.");
    return [language, { name: title, description: text }];
  }));
}
