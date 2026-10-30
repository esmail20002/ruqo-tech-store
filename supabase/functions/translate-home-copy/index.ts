import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { languages, planTranslation, translationUrl } from "./translation.mjs";
import { translatePlan } from "../_shared/azure-translator.ts";

const allowedOrigins = new Set((Deno.env.get("RUQO_ALLOWED_ORIGINS") ||
  "https://ruqo.pro,https://www.ruqo.pro,https://ruqo-tech-store-ruqo.vercel.app,https://esmail20002.github.io,http://localhost:3000,http://127.0.0.1:3000"
).split(",").map((value) => value.trim()).filter(Boolean));

function respond(origin: string, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  } });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (request.method === "OPTIONS") return respond(origin, { ok: true });
  if (request.method !== "POST") return respond(origin, { error: "Method not allowed." }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(origin, { error: "Sign in before translating." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const azureKey = Deno.env.get("AZURE_TRANSLATOR_KEY");
  const endpoint = Deno.env.get("AZURE_TRANSLATOR_ENDPOINT");
  if (!supabaseUrl || !serviceKey || !azureKey || !endpoint) {
    console.error("Homepage translation environment is incomplete.");
    return respond(origin, { error: "Translation is not configured. Contact the store administrator." }, 503);
  }
  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error: authError } = await client.auth.getUser(authorization.slice(7));
  if (authError || !identity.user) return respond(origin, { error: "Your session expired. Sign in again." }, 401);
  const { data: roles, error: roleError } = await client.from("staff_roles").select("role").eq("user_id", identity.user.id);
  if (roleError) {
    console.error("Translation role lookup failed:", roleError.code);
    return respond(origin, { error: "Could not verify store permissions." }, 503);
  }
  if (!roles?.some((entry) => ["owner", "admin"].includes(entry.role))) {
    return respond(origin, { error: "Only store owners or admins can translate homepage copy." }, 403);
  }
  let revision: number;
  try {
    if (Number(request.headers.get("content-length")) > 1024) throw new Error("Request too large.");
    const body = await request.text();
    if (body.length > 1024) throw new Error("Request too large.");
    const payload = JSON.parse(body);
    if (!Number.isSafeInteger(payload?.revision) || payload.revision < 1 ||
        Object.keys(payload).some((key) => key !== "revision")) throw new Error("Invalid revision.");
    revision = payload.revision;
  } catch {
    return respond(origin, { error: "Provide a saved draft revision." }, 400);
  }
  const { data: draft, error: draftError } = await client.from("home_copy_drafts").select("*").eq("id", "homepage").maybeSingle();
  if (draftError) {
    console.error("Translation draft lookup failed:", draftError.code);
    return respond(origin, { error: "Could not load the saved draft." }, 503);
  }
  if (!draft || draft.revision !== revision) return respond(origin, { error: "The draft changed. Reopen it before translating." }, 409);

  let job: string | null = null;
  try {
    const plan = planTranslation(draft.source, draft.translations);
    if (!plan.requests.length) return respond(origin, { draft, message: "All translations are already saved." });
    for (const language of languages) translationUrl(endpoint, language);
    const { data: reservation, error: reserveError } = await client.rpc("reserve_home_translation", {
      p_revision: revision, p_user: identity.user.id, p_characters: plan.characters,
    });
    if (reserveError) {
      console.error("Translation reservation rejected:", reserveError.code);
      const known = ["P0001", "40001"].includes(reserveError.code);
      return respond(origin, { error: known ? reserveError.message : "Could not reserve translation usage." },
        reserveError.code === "40001" ? 409 : known ? 429 : 503);
    }
    job = reservation;
    await translatePlan(plan, azureKey, endpoint, Deno.env.get("AZURE_TRANSLATOR_REGION"));
    const { data: completed, error: completeError } = await client.rpc("complete_home_translation", {
      p_job: job, p_translations: plan.translations,
    });
    if (completeError) {
      console.error("Translation save failed:", completeError.code);
      throw new Error("Translations could not be saved. Check their lengths and try again.");
    }
    if (!completed) return respond(origin, { error: "A newer draft exists. The older translations were not applied." }, 409);
    const { data: updated, error: reloadError } = await client.from("home_copy_drafts").select("*").eq("id", "homepage").single();
    if (reloadError) throw new Error("Translations were saved, but the draft could not reload. Reopen the editor.");
    return respond(origin, { draft: updated, characters: plan.characters });
  } catch (error) {
    if (job) {
      const { error: failureError } = await client.from("store_translation_jobs").update({ status: "failed" }).eq("id", job).eq("status", "reserved");
      if (failureError) console.error("Translation failure status could not be recorded:", failureError.code);
    }
    console.error("Homepage translation failed:", error instanceof Error ? error.name : "UnknownError");
    const message = error instanceof Error && error.name !== "TypeError" ? error.message
      : "Translation service could not be reached. Your draft is saved and published content is unchanged.";
    return respond(origin, { error: message }, 502);
  }
});
