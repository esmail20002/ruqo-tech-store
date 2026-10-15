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
  const applyPublicStoreSettings = () => {
    const settings = window.RUQO_STORE_SETTINGS;
    if (!settings) return;
    const logoUrl = window.RUQO_BRAND_LOGO_URL;
    const storeName = settings.store_name || "RUQO TECH";
    document.title = document.title.replace("RUQO TECH", storeName);
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
      if (logoUrl) image.src = logoUrl;
    });
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && logoUrl) favicon.href = logoUrl;
  };
  window.addEventListener("ruqo:language-updated", applyPublicStoreSettings);
  window.addEventListener("ruqo:store-settings-updated", applyPublicStoreSettings);
  window.RUQO_STORE_SETTINGS_READY = client
    .from("store_settings")
    .select("setting_value")
      .eq("setting_key", "storefront")
    .eq("is_public", true)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw error;
      const settings = data?.setting_value || {};
      window.RUQO_STORE_SETTINGS = settings;
      window.RUQO_BRAND_LOGO_URL = settings.logo_path
        ? client.storage.from("store-assets").getPublicUrl(settings.logo_path).data.publicUrl
        : null;
      applyPublicStoreSettings();
      window.dispatchEvent(new CustomEvent("ruqo:store-settings-updated", { detail: settings }));
      return settings;
    })
    .catch((error) => {
      console.warn("Could not load public store settings; using built-in defaults.", error.message);
      return {};
    });
  window.RUQO_STORE_BANNERS_READY = client
    .from("banners")
    .select("id, name, placement, title_translations, description_translations, button_translations, image_path, mobile_image_path, destination_url, starts_at, ends_at, sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .then(({ data, error }) => {
      if (error) throw error;
      const now = Date.now();
      window.RUQO_STORE_BANNERS = (data || []).filter((banner) => {
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
      window.dispatchEvent(new CustomEvent("ruqo:store-banners-updated", { detail: window.RUQO_STORE_BANNERS }));
      return window.RUQO_STORE_BANNERS;
    })
    .catch((error) => {
      console.warn("Could not load public banners; using built-in content.", error.message);
      window.RUQO_STORE_BANNERS = [];
      return [];
    });
  window.RUQO_SUPABASE_READY = window.NoursData?.loadFromSupabase(client)
    .then((loaded) => {
      if (!loaded) return false;
      window.dispatchEvent(new CustomEvent("ruqo:catalog-updated"));
      return true;
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
      window.RUQO_HOME_SPOTLIGHTS = (data || []).map((item) => ({
        ...item,
        product: products.find((product) => product.slug === item.product_slug || product.id === item.product_slug),
      })).filter((item) => item.product?.is_active !== false);
      window.dispatchEvent(new CustomEvent("ruqo:home-spotlights-updated", { detail: window.RUQO_HOME_SPOTLIGHTS }));
      return window.RUQO_HOME_SPOTLIGHTS;
    })
    .catch((error) => {
      console.warn("Could not load homepage spotlight products.", error.message);
      window.RUQO_HOME_SPOTLIGHTS = [];
      return [];
    });
})();
