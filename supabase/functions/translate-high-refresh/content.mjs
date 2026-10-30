import { fields, languages, planTranslation, protectText } from "../translate-home-copy/translation.mjs";

const limits = { eyebrow: 200, title: 600, text: 4000, badge: 200 };
const allFields = [...fields, "badge"];
function checkCopy(copy, partial = false) {
  if (!copy || typeof copy !== "object" || Array.isArray(copy) ||
      Object.keys(copy).some((field) => !allFields.includes(field))) throw new Error("Invalid content fields.");
  for (const field of fields) {
    if (partial && copy[field] === undefined) continue;
    if (typeof copy[field] !== "string" || copy[field].length > limits[field]) {
      throw new Error("Check content lengths.");
    }
  }
  if (copy.badge !== undefined && (typeof copy.badge !== "string" || copy.badge.length > limits.badge)) {
    throw new Error("Check content lengths.");
  }
}
export function highRefreshPlan(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).some((key) => !["source", "translations"].includes(key))) throw new Error("Invalid preview request.");
  checkCopy(body.source);
  if (!allFields.some((field) => typeof body.source[field] === "string" && body.source[field].trim())) {
    throw new Error("Enter at least one English text field to translate.");
  }
  const saved = body.translations ?? {};
  if (!saved || typeof saved !== "object" || Array.isArray(saved) ||
      Object.keys(saved).some((lang) => !languages.includes(lang))) throw new Error("Invalid translation languages.");
  for (const copy of Object.values(saved)) checkCopy(copy, true);
  const { badge, ...baseSource } = body.source;
  const baseSaved = Object.fromEntries(Object.entries(saved).map(([lang, copy]) => {
    const { badge: _badge, ...rest } = copy || {};
    return [lang, rest];
  }));
  const plan = planTranslation(baseSource, baseSaved);
  plan.source = { ...baseSource, ...(badge !== undefined ? { badge } : {}) };
  if (badge !== undefined) {
    for (const lang of languages) {
      const savedBadge = saved[lang]?.badge;
      if (!badge.trim()) {
        plan.translations[lang].badge = "";
      } else if (typeof savedBadge === "string" && savedBadge.trim()) {
        plan.translations[lang].badge = savedBadge;
      } else {
        plan.translations[lang].badge = "";
        const item = { language: lang, field: "badge", segment: 0, ...protectText(badge.trim()) };
        plan.requests.push(item);
        plan.characters += [...item.html].length;
      }
    }
  }
  return plan;
}
export function highRefreshResult(plan) {
  const activeFields = plan.source?.badge !== undefined ? allFields : fields;
  for (const lang of languages) {
    checkCopy(plan.translations[lang]);
    for (const field of activeFields) {
      const sourceHasText = Boolean(plan.source ? plan.source[field]?.trim() : true);
      if (plan.source && Boolean(plan.translations[lang][field]?.trim()) !== sourceHasText) {
        throw new Error("The translation response is incomplete.");
      }
      if (!plan.source && (field === "title" || field === "eyebrow") && !plan.translations[lang][field]?.trim()) {
        throw new Error("The translation response is incomplete.");
      }
    }
  }
  return plan.translations;
}
