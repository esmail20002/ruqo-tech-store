import { applyAzureResult, languages, translationUrl } from "../translate-home-copy/translation.mjs";

type TranslationRequest = {
  language: string;
  field: string;
  segment: number;
  html: string;
  protectedValues: string[];
};
type TranslationPlan = {
  requests: TranslationRequest[];
  translations: Record<string, Record<string, string>>;
};

export async function translatePlan(plan: TranslationPlan, key: string, endpoint: string, region?: string) {
  const started = Date.now();
  for (const language of languages) {
    const batches: TranslationRequest[][] = [];
    let batch: TranslationRequest[] = [];
    let size = 0;
    for (const item of plan.requests.filter((item) => item.language === language)) {
      const length = [...item.html].length;
      if (size + length > 45000 && batch.length) {
        batches.push(batch);
        batch = [];
        size = 0;
      }
      batch.push(item);
      size += length;
    }
    if (batch.length) batches.push(batch);
    for (const items of batches) {
      const remaining = 45000 - (Date.now() - started);
      if (remaining <= 0) throw new Error("Translation timed out. Published content is unchanged.");
      const headers: Record<string, string> = { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": key };
      if (region) headers["Ocp-Apim-Subscription-Region"] = region;
      const result = await fetch(translationUrl(endpoint, language), {
        method: "POST", headers,
        body: JSON.stringify(items.map((item) => ({ Text: item.html }))),
        signal: AbortSignal.timeout(Math.min(remaining, 15000)),
      });
      if (!result.ok) {
        console.error("Azure translation rejected:", result.status, result.headers.get("x-requestid"));
        throw new Error(result.status === 429
          ? "Azure's translation quota or request limit was reached. Try later; published content is unchanged."
          : "Azure could not translate this content. Check the service configuration and try again.");
      }
      applyAzureResult(items, await result.json(), plan.translations);
    }
  }
}
