import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { translatePlan } from "../_shared/azure-translator.ts";
import { translationUrl } from "../translate-home-copy/translation.mjs";
import { categoryTranslationPlan, categoryTranslationResult } from "./category.mjs";

const origins = new Set((Deno.env.get("RUQO_ALLOWED_ORIGINS") ||
  "https://ruqo.pro,https://www.ruqo.pro,https://ruqo-tech-store-ruqo.vercel.app,https://esmail20002.github.io,http://localhost:3000,http://127.0.0.1:3000"
).split(",").map((value) => value.trim()).filter(Boolean));

function respond(origin: string, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    "Content-Type": "application/json", "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Cache-Control": "no-store", "Vary": "Origin",
  } });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (!origins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (request.method === "OPTIONS") return respond(origin, { ok: true });
  if (request.method !== "POST") return respond(origin, { error: "Method not allowed." }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(origin, { error: "Sign in before translating." }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const key = Deno.env.get("AZURE_TRANSLATOR_KEY");
  const endpoint = Deno.env.get("AZURE_TRANSLATOR_ENDPOINT");
  if (!url || !serviceKey || !key || !endpoint) {
    console.error("Category translation environment is incomplete.");
    return respond(origin, { error: "Translation is not configured. Contact the store administrator." }, 503);
  }
  const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error: authError } = await client.auth.getUser(authorization.slice(7));
  if (authError || !identity.user) return respond(origin, { error: "Your session expired. Sign in again." }, 401);
  const { data: roles, error: roleError } = await client.from("staff_roles").select("role").eq("user_id", identity.user.id);
  if (roleError) {
    console.error("Category translation permissions failed:", roleError.code);
    return respond(origin, { error: "Could not verify catalog permissions." }, 503);
  }
  if (!roles?.some((entry) => ["owner", "admin", "catalog_manager"].includes(entry.role))) {
    return respond(origin, { error: "Catalog editing permission is required." }, 403);
  }
  let plan: ReturnType<typeof categoryTranslationPlan>;
  try {
    if (Number(request.headers.get("content-length")) > 100000) throw new Error("Category content is too large.");
    const body = await request.text();
    if (body.length > 100000) throw new Error("Category content is too large.");
    plan = categoryTranslationPlan(JSON.parse(body));
  } catch (error) {
    return respond(origin, { error: error instanceof SyntaxError ? "Provide valid category content."
      : error instanceof Error ? error.message : "Invalid category content." }, 400);
  }
  let job: string | null = null;
  try {
    translationUrl(endpoint, "ar");
    if (plan.requests.length) {
      const { data, error } = await client.rpc("reserve_category_translation", {
        p_user: identity.user.id, p_characters: plan.characters,
      });
      if (error) {
        console.error("Category translation reservation rejected:", error.code);
        return respond(origin, { error: error.code === "P0001" ? error.message : "Could not reserve translation usage." },
          error.code === "P0001" ? 429 : 503);
      }
      job = data;
      await translatePlan(plan, key, endpoint, Deno.env.get("AZURE_TRANSLATOR_REGION"));
    }
    const translations = categoryTranslationResult(plan);
    if (job) {
      const { error } = await client.from("store_translation_jobs").update({ status: "completed" }).eq("id", job).eq("document_type", "category");
      if (error) throw new Error("Could not record translation completion. Category content has not been saved.");
    }
    return respond(origin, { translations, characters: plan.characters });
  } catch (error) {
    if (job) {
      const { error: statusError } = await client.from("store_translation_jobs").update({ status: "failed" }).eq("id", job).eq("status", "reserved");
      if (statusError) console.error("Category translation failure could not be recorded:", statusError.code);
    }
    console.error("Category translation failed:", error instanceof Error ? error.name : "UnknownError");
    return respond(origin, { error: error instanceof Error && !["TypeError", "AbortError", "TimeoutError"].includes(error.name)
      ? error.message : "Translation service could not be reached. Category content has not been saved." }, 502);
  }
});
