import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultAllowedOrigins = [
  "https://ruqo.pro",
  "https://www.ruqo.pro",
  "https://ruqo-tech-store-ruqo.vercel.app",
  "https://esmail20002.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = new Set(
  (Deno.env.get("RUQO_ALLOWED_ORIGINS")
    ? Deno.env.get("RUQO_ALLOWED_ORIGINS")!.split(",")
    : defaultAllowedOrigins
  ).map((origin) => origin.trim()).filter(Boolean),
);

function response(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Vary": "Origin",
      "Cache-Control": "no-store",
    },
  });
}

async function fingerprint(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Vary": "Origin",
      },
    });
  }
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405, origin);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) return response({ error: "Request is too large" }, 413, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Checkout function is missing its Supabase service environment.");
    return response({ error: "Checkout is temporarily unavailable." }, 503, origin);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return response({ error: "Invalid request body." }, 400, origin);
  }

  const customer = payload.customer;
  const rawItems = payload.items;
  if (!customer || typeof customer !== "object" || Array.isArray(customer) || !Array.isArray(rawItems)) {
    return response({ error: "Please check your checkout details." }, 400, origin);
  }
  if (rawItems.length < 1 || rawItems.length > 20) {
    return response({ error: "Your bag must contain between 1 and 20 products." }, 400, origin);
  }

  const items = rawItems.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    return {
      product_slug: String(item.product_slug || "").trim(),
      variant_key: item.variant_key ? String(item.variant_key).trim() : null,
      quantity: Number(item.quantity),
    };
  });
  if (items.some((item) => !item?.product_slug || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    return response({ error: "One or more products in your bag are invalid." }, 400, origin);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const connectingIp = request.headers.get("cf-connecting-ip") || forwardedFor;
  const clientFingerprint = await fingerprint(`${connectingIp}|${request.headers.get("user-agent") || "unknown"}`);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: allowed, error: rateError } = await serviceClient.rpc(
    "consume_guest_order_rate_limit",
    { p_fingerprint: clientFingerprint },
  );
  if (rateError) {
    console.error("Guest checkout rate limit could not be checked:", rateError.code);
    return response({ error: "Checkout is temporarily unavailable." }, 503, origin);
  }
  if (!allowed) return response({ error: "Too many attempts. Please wait a few minutes and try again." }, 429, origin);

  const customerDetails = {
    name: String(customer.name || "").trim(),
    email: customer.email ? String(customer.email).trim().slice(0, 254) : null,
    phone: String(customer.phone || "").trim(),
    city: String(customer.city || "").trim(),
    address: String(customer.address || "").trim(),
    postal: String(customer.postal || "").trim(),
    notes: customer.notes ? String(customer.notes).trim().slice(0, 500) : null,
    language: ["en", "fr", "es", "zh", "ar"].includes(String(customer.language)) ? customer.language : "en",
  };

  const { data: order, error: orderError } = await serviceClient.rpc(
    "create_guest_order",
    { p_customer: customerDetails, p_items: items },
  );
  if (orderError) {
    console.error("Guest checkout rejected:", orderError.code);
    const status = ["22023", "23503", "23514"].includes(orderError.code || "") ? 400 : 503;
    return response({ error: status === 400 ? "Some checkout details or products are invalid. Refresh your bag and try again." : "Checkout is temporarily unavailable." }, status, origin);
  }

  return response({ order }, 201, origin);
});
