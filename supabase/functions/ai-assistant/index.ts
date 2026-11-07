const allowedOrigins = new Set(
  (
    Deno.env.get("RUQO_ALLOWED_ORIGINS") ||
    "https://ruqo.pro,https://www.ruqo.pro,https://ruqo-tech-store-ruqo.vercel.app,https://esmail20002.github.io,http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

function respond(origin: string, body: unknown, status = 200) {
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://www.ruqo.pro";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Vary": "Origin",
      "Cache-Control": "no-store",
    },
  });
}

function extractJsonObject(rawText: string) {
  const cleaned = String(rawText || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
  if (!cleaned) return null;
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : cleaned;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return respond(origin, { ok: true });
  if (request.method !== "POST") return respond(origin, { error: "Method not allowed." }, 405);

  const apiKey = Deno.env.get("NVIDIA_API_KEY");
  if (!apiKey) {
    return respond(origin, { error: "NVIDIA_API_KEY not configured." }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return respond(origin, { error: "Invalid JSON body." }, 400);
  }

  const message = String(body.message || "").trim();
  const imageDataUrl = typeof body.imageDataUrl === "string" && body.imageDataUrl.startsWith("data:image/")
    ? body.imageDataUrl
    : null;
  const language = String(body.language || "en").slice(0, 5);
  const catalog = Array.isArray(body.catalog) ? body.catalog : [];
  const history = Array.isArray(body.history) ? body.history : [];

  const catalogSummary = catalog.map((p: Record<string, unknown>) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    priceSAR: p.price,
    oldPriceSAR: p.oldPrice || null,
    discountSAR:
      typeof p.oldPrice === "number" && typeof p.price === "number" && p.oldPrice > p.price
        ? p.oldPrice - p.price
        : 0,
    rating: p.rating,
    features: p.features,
  }));

  const systemPrompt = [
    "detailed thinking off",
    "You are WEEXEY AI, a warm, intelligent, natural-sounding human-like assistant and tech advisor for the WEEXEY luxury electronics store.",
    `Always respond in the user's language (current page language: "${language}", or match the language the user writes in—such as fluent, friendly Arabic or English).`,
    "You can hold completely natural conversations on ANY topic (greetings, casual chat, general questions, tech advice, daily life) just like a helpful friend.",
    "You also have access to the live WEEXEY store catalog JSON below:",
    JSON.stringify(catalogSummary),
    "Return ONLY a valid JSON object matching this schema (no markdown outside JSON):",
    JSON.stringify({
      mode: "chat | general | comparison | room_analysis | budget_bundle",
      reply: "Your natural, warm, human-like response text",
      roomAnalysis: {
        detected: "What you see in the uploaded photo (only when mode is room_analysis)",
        missing: ["Missing tech upgrade 1", "Missing tech upgrade 2"],
        upgradeImpact: "How the recommended products elevate the space",
      },
      comparison: {
        title: "Product A vs Product B (only when mode is comparison)",
        productIds: ["id1", "id2"],
        rows: [
          { label: "Spec name", values: ["Product 1 spec", "Product 2 spec"], winnerIndex: 0 },
        ],
        verdict: "Clear recommendation on which one to choose and why",
      },
      budgetSummary: {
        targetBudget: 7500,
        totalPrice: 6399,
        totalSaved: 4500,
        note: "Summary of total price and savings (only when mode is budget_bundle)",
      },
      productIds: [],
    }),
    "Rules for choosing `mode` and `productIds`:",
    "1. If the user is greeting you, chatting casually, asking who you are, or asking a general question that does NOT ask for store products, set mode=\"chat\", productIds=[], and omit roomAnalysis/comparison/budgetSummary. Just reply naturally and warmly!",
    "2. If the user uploads a room/desk/setup image, set mode=\"room_analysis\", fill roomAnalysis based on the visual photo, and set productIds to 2-3 matching catalog IDs.",
    "3. If the user asks to compare products, set mode=\"comparison\", fill comparison with 2 catalog productIds and 4-5 spec rows, and set productIds to those 2 IDs.",
    "4. If the user asks for a setup/bundle within a budget, set mode=\"budget_bundle\", fill budgetSummary, and set productIds to matching catalog IDs.",
    "5. If the user asks for product recommendations or deals, set mode=\"general\" and set productIds to the best 1-3 catalog IDs.",
  ].join("\n");

  const recentHistory = history.slice(-6).map((h: Record<string, unknown>) => ({
    role: h.role === "assistant" ? "assistant" : "user",
    content: String(h.text || "").slice(0, 600),
  }));

  const userContent = imageDataUrl
    ? [
        {
          type: "text",
          text:
            message ||
            (language === "ar"
              ? "حلل صورة هذه الغرفة أو السيت-أب واذكر ما ينقصها من أجهزة المتجر مع العروض الحالية."
              : "Analyze this room or desk setup image, identify what tech is missing, and recommend matching store products and deals."),
        },
        {
          type: "image_url",
          image_url: { url: imageDataUrl },
        },
      ]
    : message;

  const models = [
    "nvidia/nemotron-3.5-super-vl-120b-a12b",
    "deepseek-ai/deepseek-v4.1-flash",
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    try {
      const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...recentHistory,
            { role: "user", content: userContent },
          ],
          temperature: 0.45,
          max_tokens: 900,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!nvidiaRes.ok) continue;
      const data = await nvidiaRes.json();
      const rawContent = data?.choices?.[0]?.message?.content || "";
      const extracted = extractJsonObject(rawContent);
      if (extracted && typeof extracted.reply === "string") {
        if (!Array.isArray(extracted.productIds)) extracted.productIds = [];
        return respond(origin, { ...extracted, source: `nvidia:${model}` });
      }
      if (rawContent.trim()) {
        return respond(origin, {
          mode: "chat",
          reply: rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim(),
          productIds: [],
          source: `nvidia-raw:${model}`,
        });
      }
    } catch {
      clearTimeout(timer);
    }
  }

  return respond(origin, { error: "Upstream AI timeout" }, 504);
});
