(() => {
  const config = window.RUQO_SUPABASE_CONFIG;
  const createClient = window.supabase?.createClient;
  if (!config?.url || !config?.publishableKey || !createClient) {
    console.warn("RUQO Supabase client is not configured; using the local catalog.");
    return;
  }

  const client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  window.RUQO_SUPABASE = client;
  const scriptUrl = document.currentScript?.src || location.href;
  const defaultLogoUrls = {
    light: new URL("../images/new/li.png", scriptUrl).href,
    dark: new URL("../images/new/dark.png", scriptUrl).href,
  };
  const applyPublicStoreSettings = () => {
    const settings = window.RUQO_STORE_SETTINGS;
    if (!settings) return;
    const logoUrl = window.RUQO_BRAND_LOGO_URL;
    const displayLogoUrl = document.documentElement.dataset.theme === "dark"
      ? defaultLogoUrls.dark
      : logoUrl || defaultLogoUrls.light;
    const storeName = settings.store_name || "WEEXEY";
    document.title = document.title.replace(/\b(?:RUQO|WEEXEY)(?:\s+TECH)?\b/gi, () => storeName);
    const brandColor = /^#[0-9a-f]{6}$/i.test(settings.brand_color || "")
      ? settings.brand_color
      : null;
    if (brandColor) {
      document.documentElement.style.setProperty("--primary", brandColor);
      document.documentElement.style.setProperty("--primary-deep", `color-mix(in srgb, ${brandColor} 72%, #101918)`);
    }
    for (const link of document.querySelectorAll('a[href^="tel:"]')) {
      if (!settings.support_phone) continue;
      link.href = `tel:${settings.support_phone.replace(/[^+\d]/g, "")}`;
      link.textContent = settings.support_phone;
    }
    for (const link of document.querySelectorAll('a[href^="mailto:"]')) {
      if (!settings.support_email) continue;
      link.href = `mailto:${settings.support_email}`;
      link.textContent = settings.support_email;
    }
    for (const node of document.querySelectorAll("[data-store-shipping]")) {
      const threshold = Number(settings.free_shipping_threshold);
      if (!Number.isFinite(threshold)) continue;
      const language = document.documentElement.lang || "en";
      const thresholdText = new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(threshold);
      const copy = {
        en: `Free delivery over ${thresholdText} SAR`,
        ar: `توصيل مجاني فوق ${thresholdText} ر.س`,
        fr: `Livraison offerte dès ${thresholdText} SAR`,
        es: `Envío gratis a partir de ${thresholdText} SAR`,
        zh: `订单满 ${thresholdText} SAR 免运费`,
      };
      node.textContent = copy[language.split("-")[0]] || copy.en;
    }
    document.querySelectorAll("img.brand-logo").forEach((image) => {
      image.alt = storeName;
      image.src = displayLogoUrl;
    });
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = displayLogoUrl;
    window.RUQO_APPLY_FOOTER_SETTINGS?.(
      document.querySelector(".site-footer"),
      (document.documentElement.lang || "en").split("-")[0],
    );
  };
  window.RUQO_APPLY_FOOTER_SETTINGS = (footerRoot, language) => {
    if (!footerRoot) return;
    const footerSettings = window.RUQO_STORE_SETTINGS?.footer || {};
    const localizedText = footerSettings.translations?.[language] || {};
    const storeName = window.RUQO_STORE_SETTINGS?.store_name || "WEEXEY";
    footerRoot.querySelectorAll("[data-footer-label]").forEach((node) => {
      const text = localizedText[node.dataset.footerLabel];
      if (typeof text === "string" && text.trim()) {
        node.textContent = text.replace(/\b(?:RUQO|WEEXEY)(?:\s+TECH)?\b/gi, () => storeName);
      }
    });
    footerRoot.querySelectorAll("[data-footer-link]").forEach((node) => {
      const href = String(footerSettings.links?.[node.dataset.footerLink] || "").trim();
      if (!href) return;
      if (href.startsWith("//")) {
        console.warn("Ignoring an invalid protocol-relative footer URL.");
        return;
      }
      if (!/^[a-z][a-z\d+.-]*:/i.test(href)) {
        node.href = href;
        return;
      }
      try {
        const url = new URL(href);
        if (["https:", "mailto:", "tel:"].includes(url.protocol)) node.href = href;
        else console.warn("Ignoring an unsupported footer URL protocol.");
      } catch (error) {
        console.warn("Ignoring an invalid footer URL.", error.message);
      }
    });
  };
  window.addEventListener("ruqo:language-updated", applyPublicStoreSettings);
  window.addEventListener("ruqo:store-settings-updated", applyPublicStoreSettings);
  const readCache = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  };
  const writeCache = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  if (window.RUQO_STORE_SETTINGS !== undefined) {
    applyPublicStoreSettings();
  }
  window.RUQO_STORE_SETTINGS_READY = client
    .from("store_settings")
    .select("setting_value")
      .eq("setting_key", "storefront")
    .eq("is_public", true)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw error;
      const settings = data?.setting_value || {};
      if (/^\s*RUQO(?:\s+TECH)?\s*$/i.test(settings.store_name || "")) {
        settings.store_name = "WEEXEY";
      }
      window.RUQO_STORE_SETTINGS = settings;
      window.RUQO_BRAND_LOGO_URL = settings.logo_path
        ? client.storage.from("store-assets").getPublicUrl(settings.logo_path).data.publicUrl
        : null;
      writeCache("ruqo-store-settings-cache-v1", { settings, logoUrl: window.RUQO_BRAND_LOGO_URL });
      applyPublicStoreSettings();
      window.dispatchEvent(new CustomEvent("ruqo:store-settings-updated", { detail: settings }));
      return settings;
    })
    .catch((error) => {
      console.warn("Could not load public store settings; using built-in defaults.", error.message);
      return {};
    });
  if (["home", "experiments"].includes(document.body.dataset.page)) {
    window.RUQO_HIGH_REFRESH_READY = client.from("high_refresh_publications")
      .select("revision,translations,product_slugs,image_url,slides").eq("id", "homepage").maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        const next = data || null;
        const changed = JSON.stringify(window.RUQO_HIGH_REFRESH) !== JSON.stringify(next);
        window.RUQO_HIGH_REFRESH = next;
        writeCache("ruqo-high-refresh-cache-v1", next);
        if (changed) window.dispatchEvent(new CustomEvent("ruqo:high-refresh-updated"));
        return next;
      }).catch((error) => {
        console.warn("Could not load high refresh; showing automatic recommendations.", error.message);
        if (window.RUQO_HIGH_REFRESH === undefined) {
          window.RUQO_HIGH_REFRESH = null;
          window.dispatchEvent(new CustomEvent("ruqo:high-refresh-updated"));
        }
        return window.RUQO_HIGH_REFRESH;
      });
    window.RUQO_HOME_COPY_READY = client.from("home_copy_publications")
      .select("revision, translations").eq("id", "homepage").maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        const next = data || null;
        const changed = JSON.stringify(window.RUQO_HOME_COPY) !== JSON.stringify(next);
        window.RUQO_HOME_COPY = next;
        writeCache("ruqo-home-copy-cache-v1", next);
        if (changed) window.dispatchEvent(new CustomEvent("ruqo:home-copy-updated"));
        return next;
      })
      .catch((error) => {
        console.warn("Could not load published homepage copy; retaining existing homepage content.", error.message);
        return window.RUQO_HOME_COPY || null;
      });
  }
  window.RUQO_STORE_BANNERS_READY = client
    .from("banners")
    .select("id, name, placement, title_translations, description_translations, button_translations, image_path, mobile_image_path, destination_url, starts_at, ends_at, sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .then(({ data, error }) => {
      if (error) throw error;
      const now = Date.now();
      const next = (data || []).filter((banner) => {
        const startsAt = banner.starts_at ? Date.parse(banner.starts_at) : null;
        const endsAt = banner.ends_at ? Date.parse(banner.ends_at) : null;
        return (startsAt === null || startsAt <= now) && (endsAt === null || endsAt > now);
      }).map((banner) => ({
        ...banner,
        image_url: banner.image_path?.startsWith("http")
          ? banner.image_path
          : banner.image_path
            ? client.storage.from("banner-images").getPublicUrl(banner.image_path).data.publicUrl
            : "",
        mobile_image_url: banner.mobile_image_path?.startsWith("http")
          ? banner.mobile_image_path
          : banner.mobile_image_path
            ? client.storage.from("banner-images").getPublicUrl(banner.mobile_image_path).data.publicUrl
            : "",
      }));
      const changed = JSON.stringify(window.RUQO_STORE_BANNERS) !== JSON.stringify(next);
      window.RUQO_STORE_BANNERS = next;
      writeCache("ruqo-store-banners-cache-v1", next);
      if (changed) window.dispatchEvent(new CustomEvent("ruqo:store-banners-updated", { detail: window.RUQO_STORE_BANNERS }));
      return window.RUQO_STORE_BANNERS;
    })
    .catch((error) => {
      console.warn("Could not load public banners; using built-in content.", error.message);
      if (!Array.isArray(window.RUQO_STORE_BANNERS)) window.RUQO_STORE_BANNERS = [];
      return window.RUQO_STORE_BANNERS;
    });
  window.RUQO_SUPABASE_READY = window.NoursData?.loadFromSupabase(client)
    .then((loaded) => {
      return Boolean(loaded);
    })
    .catch((error) => {
      console.warn("Could not load the RUQO catalog from Supabase; using the local catalog.", error.message);
      return false;
    });
  window.RUQO_HOME_SPOTLIGHTS_READY = client
    .from("homepage_spotlight_items")
    .select("id, product_slug, sort_order, bottom_detail, sale_enabled, sale_price, sale_starts_at, sale_ends_at, is_active")
    .eq("is_active", true)
    .order("sort_order")
    .then(async ({ data, error }) => {
      if (error) throw error;
      await window.RUQO_SUPABASE_READY;
      const products = window.NoursData?.products || [];
      const next = (data || []).map((item) => ({
        ...item,
        product: products.find((product) => product.slug === item.product_slug || product.id === item.product_slug),
      })).filter((item) => item.product?.is_active !== false);
      const changed = JSON.stringify(window.RUQO_HOME_SPOTLIGHTS) !== JSON.stringify(next);
      window.RUQO_HOME_SPOTLIGHTS = next;
      writeCache("ruqo-home-spotlights-cache-v1", next);
      if (changed) window.dispatchEvent(new CustomEvent("ruqo:home-spotlights-updated", { detail: window.RUQO_HOME_SPOTLIGHTS }));
      return window.RUQO_HOME_SPOTLIGHTS;
    })
    .catch((error) => {
      console.warn("Could not load homepage spotlight products.", error.message);
      if (!Array.isArray(window.RUQO_HOME_SPOTLIGHTS)) window.RUQO_HOME_SPOTLIGHTS = [];
      return window.RUQO_HOME_SPOTLIGHTS;
    });
})();
