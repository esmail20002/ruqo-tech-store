(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RuqoHighRefresh = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  const lifetime = 30 * 86400000;
  const normalize = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();
  function cleanEvents(events, now = Date.now()) {
    return (Array.isArray(events) ? events : []).filter((event) =>
      event && ["product", "category", "search"].includes(event.type) &&
      typeof event.category === "string" && event.category.length <= 160 &&
      typeof event.brand === "string" && event.brand.length <= 160 &&
      typeof event.product === "string" && event.product.length <= 160 &&
      Number.isFinite(event.at) && event.at <= now && now - event.at < lifetime).slice(-80);
  }
  function record(events, entry, now = Date.now()) {
    const result = cleanEvents(events, now);
    const value = { type: entry.type, category: entry.category || "", brand: entry.brand || "", product: entry.product || "", at: now };
    if (!cleanEvents([value], now).length) return result;
    const duplicate = result.some((old) => old.type === value.type && old.category === value.category &&
      old.brand === value.brand && old.product === value.product && now - old.at < 1800000);
    return duplicate ? result : cleanEvents([...result, value], now);
  }
  function chooseProducts(products, publication, events, now = Date.now()) {
    const available = products.filter((p) => p.is_active !== false && p.stock && p.image);
    const manual = (publication?.product_slugs || []).map((slug) =>
      available.find((p) => (p.slug || p.id) === slug)).filter(Boolean);
    if (manual.length) return { mode: "manual", products: manual };
    const history = cleanEvents(events, now);
    const score = (product) => history.reduce((total, event) => {
      const weight = ({ search: 4, product: 3, category: 2 })[event.type] * Math.pow(0.5, (now - event.at) / (7 * 86400000));
      return total + weight * ((event.category === product.category ? 2 : 0) +
        (event.brand && normalize(event.brand) === normalize(product.brand) ? 0.6 : 0) +
        (event.product === (product.slug || product.id) ? 0.3 : 0));
    }, 0);
    return { mode: "automatic", products: available.map((product, index) => ({ product, index, score: score(product) }))
      .sort((a, b) => b.score - a.score ||
        Number(Boolean(b.product.is_featured)) - Number(Boolean(a.product.is_featured)) ||
        (Number(b.product.rating) || 0) - (Number(a.product.rating) || 0) || a.index - b.index)
      .slice(0, 6).map((entry) => entry.product) };
  }
  function matchSearch(query, products, categories) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length || terms.join("").length < 2) return null;
    const matches = products.filter((product) => {
      const category = categories.find((item) => item.slug === product.category);
      const haystack = normalize([product.name, product.brand, ...Object.values(product.name_translations || {}),
        ...Object.values(category?.name_translations || {})].join(" "));
      return terms.every((term) => haystack.includes(term));
    });
    const counts = new Map();
    matches.forEach((product) => counts.set(product.category, (counts.get(product.category) || 0) + 1));
    const category = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!category) return null;
    const brands = new Set(matches.map((product) => product.brand).filter(Boolean));
    return { type: "search", category, brand: brands.size === 1 ? [...brands][0] : "", product: "" };
  }
  function validDestination(url) {
    const value = String(url || "").trim();
    if (!value || value.length > 2048 || value.startsWith("//")) return "";
    if (value.startsWith("/")) return value;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : "";
    } catch {
      return "";
    }
  }
  function activeBannerSlides(publication, fallbackSlides = [], now = Date.now()) {
    const raw = Array.isArray(publication?.slides) ? publication.slides : [];
    const active = raw.filter((slide) => {
      if (!slide || typeof slide !== "object" || slide.is_active === false) return false;
      const image = String(slide.image_url || "").trim();
      if (!image) return false;
      const starts = slide.starts_at ? Date.parse(slide.starts_at) : null;
      const ends = slide.ends_at ? Date.parse(slide.ends_at) : null;
      if (starts !== null && (!Number.isFinite(starts) || starts > now)) return false;
      if (ends !== null && (!Number.isFinite(ends) || ends <= now)) return false;
      return true;
    });
    if (active.length) return { mode: "custom", slides: active.slice(0, 12) };
    return { mode: "default", slides: Array.isArray(fallbackSlides) ? fallbackSlides : [] };
  }
  function localizeSlide(slide, language = "en") {
    const lang = String(language || "en").toLowerCase().split("-")[0];
    const source = slide?.source && typeof slide.source === "object" ? slide.source : {};
    const localized = lang === "en" ? source : (slide?.translations?.[lang] || {});
    const pick = (field) => {
      const base = typeof source[field] === "string" ? source[field].trim() : "";
      if (!base) return "";
      const trans = typeof localized[field] === "string" ? localized[field].trim() : "";
      return trans || base;
    };
    const title = pick("title");
    const text = pick("text");
    const eyebrow = pick("eyebrow");
    const rawBadge = typeof source.badge === "string" ? source.badge.trim() : "";
    const transBadge = typeof localized.badge === "string" ? localized.badge.trim() : "";
    // If badge is empty or left at the default English "Featured" without a custom translation,
    // return "" so the storefront uses its built-in 5-language "Featured" / "إعلان مميز" label.
    const badge = !rawBadge
      ? ""
      : lang !== "en" && !transBadge && rawBadge.toLowerCase() === "featured"
        ? ""
        : transBadge || rawBadge;
    return {
      title,
      text,
      eyebrow,
      badge,
      hasOverlay: Boolean(title || text || eyebrow),
      destinationUrl: validDestination(slide?.destination_url),
    };
  }
  return { cleanEvents, record, chooseProducts, matchSearch, validDestination, activeBannerSlides, localizeSlide };
});
