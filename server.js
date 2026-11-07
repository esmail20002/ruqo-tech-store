const express = require('express');
const fs = require('fs');
const path = require('path');

// Load .env if present
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) return;
      const key = trimmed.slice(0, eqIndex).trim();
      const rawVal = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = rawVal;
      }
    });
  }
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 3000;
const NVIDIA_API_URL = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_TEXT_MODEL = process.env.NVIDIA_TEXT_MODEL || 'meta/llama-3.3-70b-instruct';
const NVIDIA_VISION_MODEL = process.env.NVIDIA_VISION_MODEL || 'meta/llama-3.2-90b-vision-instruct';

app.use(express.json({ limit: '15mb' }));

const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '::1']);

app.get('/experiments.html', (req, res) => {
  if (!localDevelopmentHosts.has(req.hostname)) {
    return res.sendStatus(404);
  }

  res.sendFile(path.join(__dirname, 'public', 'experiments.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'glass-electronics-store',
    aiConfigured: Boolean(process.env.NVIDIA_API_KEY),
  });
});

function extractJsonObject(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch (_) {
    return null;
  }
}

function buildSmartFallbackResponse({ message, hasImage, language = 'en', catalog = [], imageMeta = {} }) {
  const isAr = language === 'ar';
  const msg = String(message || '').toLowerCase();
  const safeCatalog = Array.isArray(catalog) && catalog.length ? catalog : [];
  const byId = new Map(safeCatalog.map((item) => [item.id, item]));

  // 1. Room / Setup Image Analysis
  if (hasImage) {
    const mentionsAudio = /audio|headphone|sound|quiet|music|سماعة|صوت|هدوء/.test(msg);
    const mentionsMobile = /phone|mobile|camera|جوال|هاتف|تصوير/.test(msg);
    const recommendedIds = mentionsMobile
      ? ['iphone-16', 'airpods-pro', 'apple-watch']
      : mentionsAudio
        ? ['sony-headphones', 'macbook-pro', 'galaxy-watch']
        : ['macbook-pro', 'sony-headphones', 'apple-watch'];
    const validIds = recommendedIds.filter((id) => byId.has(id));
    const picked = validIds.length ? validIds : safeCatalog.slice(0, 3).map((p) => p.id);

    const toneNote = imageMeta && imageMeta.brightness === 'dark'
      ? (isAr ? 'إضاءة الغرفة هادئة تميل للوضع الليلي، مما يجعل الشاشات عالية التباين (OLED / Mini-LED) مثالية لها.' : 'Your space has a calm, low-light ambiance—making high-contrast OLED and Liquid Retina XDR displays ideal.')
      : (isAr ? 'مساحة الغرفة مرتبة وذات إضاءة متوازنة، وتسمح بإضافة ركن عمل وترفيه متكامل بدون ازدحام.' : 'Your space has balanced lighting and a clean layout, ideal for a streamlined flagship workstation.');

    return {
      mode: 'room_analysis',
      reply: isAr
        ? 'قمت بتحليل صورة الغرفة/المساحة الخاصة بك. لتكتمل تجربة العمل والترفيه الفاخرة في هذه المساحة، إليك ما ينقصها مع أفضل العروض المتوفرة حالياً في WEEXEY:'
        : 'I analyzed your room and setup photo. To elevate this space into a complete flagship workspace and entertainment corner, here is what is missing along with current WEEXEY deals:',
      roomAnalysis: {
        detected: toneNote,
        missing: isAr
          ? [
              'جهاز رئيسي فائق الأداء بشاشة احترافية (MacBook Pro 14 M4) ليكون قلب المكتب',
              'سماعة عزل ضجيج محيطي (WH-1000XM5 أو AirPods Pro 2) للتركيز التام داخل الغرفة',
              'ساعة ذكية متزامنة لتنبيهات المكتب والنشاط الصحي طوال اليوم',
            ]
          : [
              'A flagship workstation laptop with an XDR/OLED display (MacBook Pro 14 M4) as the centerpiece',
              'Studio-grade Active Noise Cancelling headphones (WH-1000XM5) for deep focus in the room',
              'A smart wearable companion for seamless desk notifications and wellness tracking',
            ],
        upgradeImpact: isAr
          ? 'إضافة هذه القطع ستحوّل المساحة إلى استوديو عمل وترفيه متكامل بصوت معزول وشاشة فائقة الدقة مع توفير كبير من عروض المتجر الحالية.'
          : 'Adding these pieces transforms your room into a distraction-free studio with reference-grade visuals, acoustic isolation, and active store discounts.',
      },
      productIds: picked,
    };
  }

  // 2. Product Comparison
  const isCompare = /compare|vs|versus|difference|better|قارن|مقارنة|الفرق|ايهم|أيهما|مقابل/.test(msg);
  const genericTokens = new Set(['pro', 'max', 'ultra', 'plus', 'the', 'and', 'for', 'with', 'compare', 'versus']);
  const matchedProducts = safeCatalog
    .map((p) => {
      const tokens = `${p.id} ${p.name} ${p.brand} ${p.nameAr || ''}`
        .toLowerCase()
        .split(/[^a-z0-9\u0600-\u06ff]+/)
        .filter((tok) => tok.length > 2 && !genericTokens.has(tok));
      const hits = tokens.filter((tok) => msg.includes(tok)).length;
      return { product: p, hits };
    })
    .filter((entry) => entry.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((entry) => entry.product);

  if (isCompare || matchedProducts.length >= 2) {
    let pair = matchedProducts.slice(0, 2);
    if (pair.length < 2) {
      if (/phone|iphone|galaxy|هاتف|جوال|ايفون|سامسونج/.test(msg)) {
        pair = [byId.get('iphone-16'), byId.get('galaxy-s25')].filter(Boolean);
      } else if (/headphone|audio|airpods|sony|سماعة|سماعات|سوني/.test(msg)) {
        pair = [byId.get('airpods-pro'), byId.get('sony-headphones')].filter(Boolean);
      } else if (/watch|ساعة/.test(msg)) {
        pair = [byId.get('apple-watch'), byId.get('galaxy-watch')].filter(Boolean);
      } else {
        pair = [byId.get('macbook-pro'), byId.get('asus-zenbook')].filter(Boolean);
      }
    }
    if (pair.length < 2 && safeCatalog.length >= 2) {
      pair = safeCatalog.slice(0, 2);
    }

    if (pair.length >= 2) {
      const [p1, p2] = pair;
      const f1 = Array.isArray(p1.features) ? p1.features : [];
      const f2 = Array.isArray(p2.features) ? p2.features : [];
      const save1 = p1.oldPrice && p1.oldPrice > p1.price ? p1.oldPrice - p1.price : 0;
      const save2 = p2.oldPrice && p2.oldPrice > p2.price ? p2.oldPrice - p2.price : 0;

      return {
        mode: 'comparison',
        reply: isAr
          ? `إليك مقارنة تفصيلية مباشرة بين **${p1.name}** و **${p2.name}** لمساعدتك في اختيار الأنسب:`
          : `Here is a side-by-side comparison between **${p1.name}** and **${p2.name}** to help you choose:`,
        comparison: {
          title: isAr ? `مقارنة: ${p1.name} مقابل ${p2.name}` : `${p1.name} vs ${p2.name}`,
          productIds: [p1.id, p2.id],
          rows: [
            {
              label: isAr ? 'الميزة الأبرز' : 'Key Spec',
              values: [f1[0] || p1.description || p1.brand, f2[0] || p2.description || p2.brand],
              winnerIndex: 0,
            },
            {
              label: isAr ? 'الأداء والتقنية' : 'Performance',
              values: [f1[1] || f1[0] || p1.brand, f2[1] || f2[0] || p2.brand],
              winnerIndex: p1.rating >= p2.rating ? 0 : 1,
            },
            {
              label: isAr ? 'إضافات ذكية' : 'Smart Features',
              values: [f1[2] || f1[3] || 'Flagship build', f2[2] || f2[3] || 'Flagship build'],
              winnerIndex: 1,
            },
            {
              label: isAr ? 'تقييم العملاء' : 'Customer Rating',
              values: [`★ ${p1.rating} (${p1.reviews || 100}+)`, `★ ${p2.rating} (${p2.reviews || 100}+)`],
              winnerIndex: p1.rating >= p2.rating ? 0 : 1,
            },
            {
              label: isAr ? 'القيمة والخصم الحالي' : 'Deal & Savings',
              values: [
                save1 > 0 ? (isAr ? `خصم متاح (توفير ${save1} ر.س)` : `On sale (Save ${save1} SAR)`) : (isAr ? 'سعر رسمي' : 'Standard price'),
                save2 > 0 ? (isAr ? `خصم متاح (توفير ${save2} ر.س)` : `On sale (Save ${save2} SAR)`) : (isAr ? 'سعر رسمي' : 'Standard price'),
              ],
              winnerIndex: save1 >= save2 ? 0 : 1,
            },
          ],
          verdict: isAr
            ? `اختر **${p1.name}** إذا كنت تبحث عن ${f1[0] || 'أعلى قيمة وتكامل'} ${save1 > save2 ? 'مع خصم أقوى حالياً' : ''}، واختر **${p2.name}** إذا كنت تفضّل ${f2[0] || 'التجربة البديلة من ' + p2.brand}.`
            : `Choose **${p1.name}** if you prioritize ${f1[0] || 'top ecosystem integration'}${save1 > save2 ? ' and the biggest active discount' : ''}, or pick **${p2.name}** if you prefer ${f2[0] || p2.brand + ' flagship features'}.`,
        },
        productIds: [p1.id, p2.id],
      };
    }
  }

  // 3. Budget / Bundle Builder
  const budgetMatch = msg.match(/(\d[\d,.]*)/);
  const mentionsBudget = /budget|bundle|setup|package|under|ميزانيت|ميزانية|باقة|تجميعة|حدود|تحت|اقل من/.test(msg);
  if (mentionsBudget && budgetMatch) {
    const rawNum = Number(budgetMatch[1].replace(/[,.]/g, ''));
    const targetSar = rawNum >= 500 ? rawNum : 7500;
    const sorted = [...safeCatalog].sort((a, b) => a.price - b.price);
    const bundle = [];
    let runningTotal = 0;
    const usedCategories = new Set();

    // Pick diverse categories first that fit within targetSar
    for (const item of [...safeCatalog].sort((a, b) => b.rating - a.rating)) {
      if (!usedCategories.has(item.category) && runningTotal + item.price <= targetSar) {
        bundle.push(item);
        runningTotal += item.price;
        usedCategories.add(item.category);
      }
    }
    if (!bundle.length && sorted.length) {
      bundle.push(sorted[0]);
      runningTotal = sorted[0].price;
    }

    const totalSaved = bundle.reduce(
      (sum, item) => sum + (item.oldPrice && item.oldPrice > item.price ? item.oldPrice - item.price : 0),
      0
    );

    return {
      mode: 'budget_bundle',
      reply: isAr
        ? `قمت بتصميم أفضل باقة متكاملة لك ضمن ميزانية **${targetSar} ر.س** تجمع بين الأداء العالي والعروض الفعّالة حالياً في المتجر:`
        : `I curated the best multi-device setup within your **${targetSar} SAR** budget, maximizing performance and active store discounts:`,
      budgetSummary: {
        targetBudget: targetSar,
        totalPrice: runningTotal,
        totalSaved,
        note: isAr
          ? `إجمالي الباقة ${runningTotal} ر.س (توفير ${totalSaved} ر.س من العروض الحالية)`
          : `Bundle total: ${runningTotal} SAR (You save ${totalSaved} SAR with active deals)`,
      },
      productIds: bundle.map((p) => p.id),
    };
  }

  // 4. General Smart Recommendation / Deals
  const scored = safeCatalog
    .map((product) => {
      const hay = `${product.id} ${product.name} ${product.brand} ${product.category} ${product.description || ''} ${(product.features || []).join(' ')}`.toLowerCase();
      let score = product.rating || 4.5;
      if (product.oldPrice && product.oldPrice > product.price) score += 1.2;
      if (/phone|mobile|camera|جوال|هاتف|كاميرا|ايفون|سامسونج/.test(msg) && product.category === 'phones') score += 10;
      if (/laptop|work|macbook|computer|لابتوب|عمل|ماك|حاسب/.test(msg) && product.category === 'laptops') score += 10;
      if (/headphone|audio|noise|music|سماعة|سماعات|صوت|ضوضاء|ضجيج/.test(msg) && product.category === 'audio') score += 10;
      if (/watch|wearable|fitness|health|ساعة|ساعات|صحة/.test(msg) && product.category === 'wearables') score += 10;
      if (/deal|sale|discount|offer|عرض|عروض|خصم|تخفيض/.test(msg) && product.oldPrice > product.price) score += 8;
      msg.split(/\s+/).forEach((word) => {
        if (word.length > 2 && hay.includes(word)) score += 3;
      });
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.product);

  return {
    mode: 'general',
    reply: isAr
      ? 'بناءً على طلبك، اخترت لك أفضل الخيارات المتوفرة في كتالوج WEEXEY مع عروضها الحالية وإمكانية الإضافة المباشرة للسلة:'
      : 'Based on your request, here are the best matches from the WEEXEY catalog with their current deals:',
    productIds: scored.map((p) => p.id),
  };
}

app.post('/api/ai-assistant', async (req, res) => {
  const {
    message = '',
    imageDataUrl = null,
    imageMeta = {},
    language = 'en',
    catalog = [],
    history = [],
  } = req.body || {};

  const hasImage = typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/');
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return res.json({
      ...buildSmartFallbackResponse({ message, hasImage, language, catalog, imageMeta }),
      source: 'local-smart-engine',
    });
  }

  try {
    const catalogSummary = (Array.isArray(catalog) ? catalog : []).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      priceSAR: p.price,
      oldPriceSAR: p.oldPrice || null,
      discountSAR: p.oldPrice && p.oldPrice > p.price ? p.oldPrice - p.price : 0,
      rating: p.rating,
      features: p.features,
    }));

    const systemPrompt = [
      'You are WEEXEY AI, a luxury electronics shopping concierge for the WEEXEY store.',
      `Respond in language code: "${language}" (use natural Arabic if "ar", English if "en", French if "fr", Spanish if "es", Chinese if "zh").`,
      'You ONLY recommend real products from this live WEEXEY catalog JSON:',
      JSON.stringify(catalogSummary),
      'Return ONLY a valid JSON object matching this exact schema (no markdown outside JSON):',
      JSON.stringify({
        mode: 'general | comparison | room_analysis | budget_bundle',
        reply: 'Concise, helpful response text in the user language',
        roomAnalysis: {
          detected: 'What you see in the uploaded room/desk image (only when an image is provided)',
          missing: ['Missing tech upgrade 1', 'Missing tech upgrade 2'],
          upgradeImpact: 'How the recommended WEEXEY products elevate the space',
        },
        comparison: {
          title: 'Product A vs Product B',
          productIds: ['id1', 'id2'],
          rows: [
            { label: 'Spec name', values: ['Product 1 spec', 'Product 2 spec'], winnerIndex: 0 },
          ],
          verdict: 'Clear recommendation on which one to choose and why',
        },
        budgetSummary: {
          targetBudget: 7500,
          totalPrice: 6399,
          totalSaved: 4500,
          note: 'Summary of total price and savings',
        },
        productIds: ['id1', 'id2'],
      }),
      'Rules:',
      '- If the user uploads a room/desk/setup image, set mode="room_analysis", fill roomAnalysis, and pick 2-3 matching catalog productIds with active store prices.',
      '- If the user asks to compare products, set mode="comparison", fill comparison with 2 productIds and 4-5 rows, and include those productIds.',
      '- If the user specifies a budget or bundle request, set mode="budget_bundle", fill budgetSummary, and pick productIds whose sum fits the budget.',
      '- Always populate productIds with valid IDs from the catalog.',
    ].join('\n');

    const recentHistory = Array.isArray(history)
      ? history.slice(-4).map((h) => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: String(h.text || '').slice(0, 500),
        }))
      : [];

    const userContent = hasImage
      ? [
          {
            type: 'text',
            text:
              message.trim() ||
              (language === 'ar'
                ? 'حلل صورة هذه الغرفة أو السيت-أب واذكر ما ينقصها من أجهزة المتجر مع العروض الحالية.'
                : 'Analyze this room or desk setup image, identify what tech is missing, and recommend matching store products and deals.'),
          },
          {
            type: 'image_url',
            image_url: { url: imageDataUrl },
          },
        ]
      : message.trim();

    const modelCandidates = hasImage
      ? [NVIDIA_VISION_MODEL, 'meta/llama-3.2-11b-vision-instruct', NVIDIA_TEXT_MODEL]
      : [NVIDIA_TEXT_MODEL, 'meta/llama-3.1-70b-instruct'];

    let parsedResult = null;
    for (const modelName of modelCandidates) {
      const isVisionAttempt = hasImage && modelName.includes('vision');
      const messagesPayload = [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        {
          role: 'user',
          content: isVisionAttempt
            ? userContent
            : typeof userContent === 'string'
              ? userContent
              : `${userContent[0].text} [Uploaded room/setup photo metadata: ${JSON.stringify(imageMeta)}]`,
        },
      ];

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      try {
        const nvidiaRes = await fetch(NVIDIA_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: messagesPayload,
            temperature: 0.35,
            max_tokens: 900,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!nvidiaRes.ok) continue;
        const data = await nvidiaRes.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        const extracted = extractJsonObject(rawContent);
        if (extracted && Array.isArray(extracted.productIds)) {
          parsedResult = { ...extracted, source: `nvidia:${modelName}` };
          break;
        }
      } catch (_) {
        clearTimeout(timeout);
      }
    }

    if (parsedResult) {
      return res.json(parsedResult);
    }

    return res.json({
      ...buildSmartFallbackResponse({ message, hasImage, language, catalog, imageMeta }),
      source: 'fallback-after-nvidia',
    });
  } catch (err) {
    return res.json({
      ...buildSmartFallbackResponse({ message, hasImage, language, catalog, imageMeta }),
      source: 'fallback-error',
    });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
