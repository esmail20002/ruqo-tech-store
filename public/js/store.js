(() => {
  const supportedLanguages = ["en", "fr", "es", "zh", "ar"];
  const imageDirectory = new URL(
    "../images/",
    document.currentScript?.src || document.baseURI,
  );
  const keys = {
    cart: "nours-cart",
    wishlist: "nours-wishlist",
    language: "nours-language",
    profile: "nours-profile",
    orders: "nours-orders",
    settings: "nours-settings",
    currency: "nours-currency",
    theme: "nours-theme",
    variants: "nours-product-variants",
  };
  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const cart = () => read(keys.cart, {});
  const cartLineKey = (id, variantKey = null) => variantKey ? `${id}::${variantKey}` : id;
  const cartProductId = (lineKey) => String(lineKey).split("::", 1)[0];
  const cartVariantKey = (lineKey) => String(lineKey).includes("::") ? String(lineKey).split("::").slice(1).join("::") : null;
  const setQuantity = (id, quantity) => {
    const next = cart();
    if (quantity > 0) next[id] = Math.min(99, Math.floor(quantity));
    else delete next[id];
    write(keys.cart, next);
    syncCartCount();
    return next;
  };
  const addToCart = (id, quantity = 1, variantKey = null) => {
    const next = cart();
    const lineKey = cartLineKey(id, variantKey);
    next[lineKey] = Math.min(99, (Number(next[lineKey]) || 0) + quantity);
    write(keys.cart, next);
    syncCartCount();
    return next;
  };
  const removeFromCart = (id) => setQuantity(id, 0);
  const cartCount = () =>
    Object.values(cart()).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const cartLabels = {
    en: { cart: "Cart", item: "item", items: "items" },
    fr: { cart: "Panier", item: "article", items: "articles" },
    es: { cart: "Carrito", item: "artículo", items: "artículos" },
    zh: { cart: "购物袋", item: "件商品", items: "件商品" },
    ar: { cart: "السلة", item: "منتج", items: "منتجات" },
  };
  const localeByLanguage = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    zh: "zh-CN",
    ar: "ar-SA",
  };
  const syncCartCount = () => {
    const language = getLanguage();
    const labels = cartLabels[language] || cartLabels.en;
    const count = cartCount();
    const formattedCount = new Intl.NumberFormat(
      localeByLanguage[language] || localeByLanguage.en,
    ).format(count);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = formattedCount;
    });
    document.querySelectorAll(".commerce-cart-count").forEach((node) => {
      node.hidden = count === 0;
    });
    document.querySelectorAll(".commerce-cart-link").forEach((link) => {
      link.setAttribute(
        "aria-label",
        `${labels.cart}, ${formattedCount} ${count === 1 ? labels.item : labels.items}`,
      );
    });
  };
  let bagConfirmationTimer;
  const showAddedToBag = (product, { quantity = 1, price = "" } = {}) => {
    const language = getLanguage();
    const copy = {
      en: { title: "Added to your bag", quantity: "Added", item: "item", items: "items", continue: "Continue shopping", view: "View bag", dismiss: "Dismiss" },
      fr: { title: "Ajouté à votre panier", quantity: "Quantité", item: "article", items: "articles", continue: "Continuer les achats", view: "Voir le panier", dismiss: "Fermer" },
      es: { title: "Añadido a tu carrito", quantity: "Cantidad", item: "artículo", items: "artículos", continue: "Seguir comprando", view: "Ver carrito", dismiss: "Cerrar" },
      zh: { title: "已加入购物袋", quantity: "数量", item: "件商品", items: "件商品", continue: "继续购物", view: "查看购物袋", dismiss: "关闭" },
      ar: { title: "أُضيف إلى حقيبتك", quantity: "الكمية", item: "منتج", items: "منتجات", continue: "متابعة التسوق", view: "عرض الحقيبة", dismiss: "إغلاق" },
    }[language] || {
      title: "Added to your bag",
      quantity: "Added",
      item: "item",
      items: "items",
      continue: "Continue shopping",
      view: "View bag",
      dismiss: "Dismiss",
    };
    document.querySelector(".bag-confirmation")?.remove();
    clearTimeout(bagConfirmationTimer);

    const confirmation = document.createElement("aside");
    confirmation.className = "bag-confirmation";
    confirmation.setAttribute("role", "status");
    confirmation.setAttribute("aria-live", "polite");
    confirmation.setAttribute("aria-atomic", "true");

    const makeIcon = (name) => {
      const element = document.createElement("i");
      element.dataset.lucide = name;
      element.setAttribute("aria-hidden", "true");
      return element;
    };
    const heading = document.createElement("div");
    heading.className = "bag-confirmation-heading";
    const check = document.createElement("span");
    check.className = "bag-confirmation-check";
    check.append(makeIcon("check"));
    const message = document.createElement("div");
    message.className = "bag-confirmation-message";
    const title = document.createElement("strong");
    title.textContent = copy.title;
    const quantityText = document.createElement("span");
    const count = Math.max(1, Number(quantity) || 1);
    quantityText.textContent = `${copy.quantity}: ${count} ${count === 1 ? copy.item : copy.items}`;
    message.append(title, quantityText);
    const close = document.createElement("button");
    close.className = "bag-confirmation-close";
    close.type = "button";
    close.setAttribute("aria-label", copy.dismiss);
    close.append(makeIcon("x"));
    heading.append(check, message, close);

    const productRow = document.createElement("div");
    productRow.className = "bag-confirmation-product";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name || "";
    image.loading = "eager";
    const productInfo = document.createElement("div");
    productInfo.className = "bag-confirmation-product-info";
    const brand = document.createElement("span");
    brand.className = "bag-confirmation-brand";
    brand.textContent = product.brand || "RUQO TECH";
    const name = document.createElement("strong");
    name.className = "bag-confirmation-name";
    name.textContent = product.name || "";
    productInfo.append(brand, name);
    if (price) {
      const priceLabel = document.createElement("span");
      priceLabel.className = "bag-confirmation-price";
      priceLabel.textContent = price;
      productInfo.append(priceLabel);
    }
    productRow.append(image, productInfo);

    const actions = document.createElement("div");
    actions.className = "bag-confirmation-actions";
    const continueButton = document.createElement("button");
    continueButton.className = "bag-confirmation-continue";
    continueButton.type = "button";
    continueButton.textContent = copy.continue;
    const viewBag = document.createElement("a");
    viewBag.className = "bag-confirmation-view";
    viewBag.href = new URL("cart.html", location.href).href;
    viewBag.textContent = copy.view;
    actions.append(continueButton, viewBag);
    confirmation.append(heading, productRow, actions);

    const dismiss = () => {
      clearTimeout(bagConfirmationTimer);
      confirmation.classList.remove("is-visible");
      setTimeout(() => confirmation.remove(), 260);
    };
    close.addEventListener("click", dismiss);
    continueButton.addEventListener("click", dismiss);
    document.body.append(confirmation);
    window.lucide?.createIcons();
    requestAnimationFrame(() => confirmation.classList.add("is-visible"));
    bagConfirmationTimer = setTimeout(dismiss, 6000);
    syncCartCount();
    return confirmation;
  };
  const wishlist = () => read(keys.wishlist, []);
  const toggleWishlist = (id) => {
    const next = new Set(wishlist());
    next.has(id) ? next.delete(id) : next.add(id);
    write(keys.wishlist, [...next]);
    return [...next];
  };
  const setWishlist = (ids) => write(keys.wishlist, [...new Set(ids)]);
  const getLanguage = () => {
    const language = read(keys.language, localStorage.getItem(keys.language));
    return supportedLanguages.includes(language) ? language : "en";
  };
  const setLanguage = (language) => {
    const next = supportedLanguages.includes(language) ? language : "en";
    write(keys.language, next);
    syncTheme();
    syncDropdowns();
    window.dispatchEvent(new CustomEvent("ruqo:language-updated", { detail: { language: next } }));
    return next;
  };
  const readRawTheme = () => {
    try {
      const raw = localStorage.getItem(keys.theme);
      if (raw === "dark" || raw === '"dark"') return "dark";
      if (raw === "light" || raw === '"light"') return "light";
      const match = document.cookie.match(/(?:^|; )nours-theme=([^;]*)/);
      if (match) {
        const val = decodeURIComponent(match[1]);
        if (val === "dark" || val === '"dark"') return "dark";
        if (val === "light" || val === '"light"') return "light";
      }
      return "light";
    } catch {
      return "light";
    }
  };

  const getTheme = () => readRawTheme();

  const syncTheme = () => {
    const theme = getTheme();
    const language = getLanguage();
    const logoFile = theme === "dark" ? "new/dark.png" : "new/li.png";
    const defaultLogoUrl = new URL(logoFile, imageDirectory).href;
    const logoUrl = theme === "dark" ? defaultLogoUrl : window.RUQO_BRAND_LOGO_URL || defaultLogoUrl;
    const storeName = window.RUQO_STORE_SETTINGS?.store_name || "RUQO TECH";
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("img.brand-logo, img[data-admin-brand-logo]").forEach((image) => {
      if (image.src !== logoUrl) image.src = logoUrl;
      image.alt = storeName;
    });
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = logoUrl;
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const isDark = theme === "dark";
      const labels = {
        en: ["Switch to light mode", "Switch to dark mode", "Light mode", "Dark mode"],
        fr: ["Passer en mode clair", "Passer en mode sombre", "Mode clair", "Mode sombre"],
        es: ["Cambiar al modo claro", "Cambiar al modo oscuro", "Modo claro", "Modo oscuro"],
        zh: ["切换到浅色模式", "切换到深色模式", "浅色模式", "深色模式"],
        ar: ["تفعيل الوضع الفاتح", "تفعيل الوضع الداكن", "الوضع الفاتح", "الوضع الداكن"],
      }[language];
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", labels[isDark ? 0 : 1]);
      button.title = labels[isDark ? 2 : 3];
      button.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}" aria-hidden="true"></i>`;
    });
    window.lucide?.createIcons();
  };
  const setTheme = (theme) => {
    const next = theme === "dark" ? "dark" : "light";
    write(keys.theme, next);
    try {
      document.cookie = `nours-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (_) {}
    syncTheme();
    window.dispatchEvent(new CustomEvent("ruqo:theme-updated", { detail: { theme: next } }));
    return next;
  };
  const getProfile = () =>
    read(keys.profile, { name: "", email: "", phone: "", city: "Riyadh" });
  const setProfile = (profile) => write(keys.profile, profile);
  const getOrders = () => read(keys.orders, []);
  const setOrders = (orders) => write(keys.orders, orders);
  const getSettings = () =>
    read(keys.settings, { orderUpdates: true, offers: false });
  const setSettings = (settings) => write(keys.settings, settings);
  const getCurrency = () => {
    const currency = read(keys.currency, "USD");
    return ["USD", "SAR", "EUR"].includes(currency) ? currency : "USD";
  };
  const setCurrency = (currency) => {
    const next = ["USD", "SAR", "EUR"].includes(currency) ? currency : "USD";
    write(keys.currency, next);
    window.dispatchEvent(new CustomEvent("ruqo:currency-updated", { detail: { currency: next } }));
    return next;
  };
  const productVariants = () => read(keys.variants, {});
  const getProductVariant = (id) => productVariants()[id] || "";
  const setProductVariant = (id, variant) => {
    const next = productVariants();
    next[id] = variant;
    write(keys.variants, next);
  };
  const getProductOptionSelections = (id) => {
    const saved = productVariants()[id];
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  };
  const setProductOptionSelections = (id, selections) => {
    const next = productVariants();
    next[id] = selections;
    write(keys.variants, next);
  };

  const currencyMeta = {
    USD: { symbol: "$", label: "USD dollar", subtitle: "الدولار الأمريكي" },
    SAR: { symbol: "ر.س", label: "SAR", subtitle: "الريال السعودي" },
    EUR: { symbol: "€", label: "EUR", subtitle: "اليورو الأوروبي" },
  };

  const languageMeta = {
    en: { code: "EN", flag: "🇺🇸", label: "English", subtitle: "United States" },
    ar: { code: "عربي", flag: "🇸🇦", label: "العربية", subtitle: "المملكة العربية السعودية" },
    fr: { code: "FR", flag: "🇫🇷", label: "Français", subtitle: "France" },
    es: { code: "ES", flag: "🇪🇸", label: "Español", subtitle: "España" },
    zh: { code: "ZH", flag: "🇨🇳", label: "中文", subtitle: "简体中文" },
  };

  const closeAllMenus = () => {
    document.querySelectorAll(".ruqo-dropdown-menu.is-open").forEach((m) => m.classList.remove("is-open"));
    document.querySelectorAll(".ruqo-dropdown-trigger.is-active").forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-expanded", "false");
    });
  };

  const syncDropdowns = () => {
    const currentCurrency = getCurrency();
    const currentLanguage = getLanguage();

    // 1. Currency selects
    document.querySelectorAll("select[data-currency-select]").forEach((select) => {
      let wrapper = select.parentElement?.classList.contains("ruqo-currency-dropdown")
        ? select.parentElement
        : null;

      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "ruqo-dropdown-container ruqo-currency-dropdown";
        select.before(wrapper);
        select.style.display = "none";
        wrapper.append(select);

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "ruqo-dropdown-trigger currency-trigger";
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("title", "Change currency / تغيير العملة");

        const symbolSpan = document.createElement("span");
        symbolSpan.className = "ruqo-symbol-badge";
        trigger.append(symbolSpan);

        const menu = document.createElement("div");
        menu.className = "ruqo-dropdown-menu currency-menu";
        menu.setAttribute("role", "menu");

        const menuHeader = document.createElement("div");
        menuHeader.className = "ruqo-menu-header";
        menuHeader.innerHTML = `<span>العملة · CURRENCY</span>`;
        menu.append(menuHeader);

        const optionsList = document.createElement("div");
        optionsList.className = "ruqo-menu-options";

        Object.entries(currencyMeta).forEach(([code, meta]) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "ruqo-menu-item";
          item.dataset.value = code;
          item.setAttribute("role", "menuitem");
          item.innerHTML = `
            <span class="ruqo-item-badge currency-badge">${meta.symbol}</span>
            <div class="ruqo-item-text">
              <strong class="ruqo-item-name">${meta.label}</strong>
              <small class="ruqo-item-sub">${meta.subtitle}</small>
            </div>
            <span class="ruqo-item-check"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
          `;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            setCurrency(code);
            select.value = code;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            closeAllMenus();
          });
          optionsList.append(item);
        });
        menu.append(optionsList);

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = menu.classList.contains("is-open");
          closeAllMenus();
          if (!isOpen) {
            menu.classList.add("is-open");
            trigger.classList.add("is-active");
            trigger.setAttribute("aria-expanded", "true");
          }
        });

        wrapper.append(trigger, menu);
      }

      const symbolSpan = wrapper.querySelector(".ruqo-symbol-badge");
      if (symbolSpan) {
        symbolSpan.textContent = currencyMeta[currentCurrency]?.symbol || currentCurrency;
      }
      wrapper.querySelectorAll(".ruqo-menu-item").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.value === currentCurrency);
      });
    });

    // 2. Language selects
    document.querySelectorAll("select[data-language-select]").forEach((select) => {
      let wrapper = select.parentElement?.classList.contains("ruqo-lang-dropdown")
        ? select.parentElement
        : null;

      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "ruqo-dropdown-container ruqo-lang-dropdown";
        select.before(wrapper);
        select.style.display = "none";
        wrapper.append(select);

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "ruqo-dropdown-trigger language-trigger";
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("title", "Language / اللغة");

        const labelSpan = document.createElement("span");
        labelSpan.className = "ruqo-lang-badge";
        trigger.append(labelSpan);

        const menu = document.createElement("div");
        menu.className = "ruqo-dropdown-menu language-menu";
        menu.setAttribute("role", "menu");

        const menuHeader = document.createElement("div");
        menuHeader.className = "ruqo-menu-header";
        menuHeader.innerHTML = `<span>اللغة · LANGUAGE</span>`;
        menu.append(menuHeader);

        const optionsList = document.createElement("div");
        optionsList.className = "ruqo-menu-options";

        Object.entries(languageMeta).forEach(([code, meta]) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "ruqo-menu-item";
          item.dataset.value = code;
          item.setAttribute("role", "menuitem");
          item.innerHTML = `
            <span class="ruqo-item-badge lang-flag">${meta.flag}</span>
            <div class="ruqo-item-text">
              <strong class="ruqo-item-name">${meta.label}</strong>
              <small class="ruqo-item-sub">${meta.subtitle}</small>
            </div>
            <span class="ruqo-item-check"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
          `;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            setLanguage(code);
            select.value = code;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            closeAllMenus();
          });
          optionsList.append(item);
        });
        menu.append(optionsList);

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = menu.classList.contains("is-open");
          closeAllMenus();
          if (!isOpen) {
            menu.classList.add("is-open");
            trigger.classList.add("is-active");
            trigger.setAttribute("aria-expanded", "true");
          }
        });

        wrapper.append(trigger, menu);
      }

      const labelSpan = wrapper.querySelector(".ruqo-lang-badge");
      if (labelSpan) {
        labelSpan.textContent = languageMeta[currentLanguage]?.code || currentLanguage.toUpperCase();
      }
      wrapper.querySelectorAll(".ruqo-menu-item").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.value === currentLanguage);
      });
    });
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ruqo-dropdown-container")) {
      closeAllMenus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllMenus();
    }
  });

  window.NoursStore = {
    keys,
    supportedLanguages,
    read,
    write,
    cart,
    cartLineKey,
    cartProductId,
    cartVariantKey,
    setQuantity,
    addToCart,
    removeFromCart,
    cartCount,
    syncCartCount,
    showAddedToBag,
    wishlist,
    toggleWishlist,
    setWishlist,
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    syncTheme,
    getProfile,
    setProfile,
    getOrders,
    setOrders,
    getSettings,
    setSettings,
    getCurrency,
    setCurrency,
    productVariants,
    getProductVariant,
    setProductVariant,
    getProductOptionSelections,
    setProductOptionSelections,
    syncDropdowns,
  };
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-theme-toggle]")) {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    }
  });
  window.addEventListener("ruqo:currency-updated", syncDropdowns);
  window.addEventListener("ruqo:language-updated", syncDropdowns);
  window.addEventListener("ruqo:store-settings-updated", syncTheme);

  window.addEventListener("pageshow", () => {
    syncTheme();
    syncDropdowns();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === keys.theme || !event.key) {
      syncTheme();
    }
    if (event.key === keys.currency || !event.key) {
      syncDropdowns();
    }
    if (event.key === keys.language || !event.key) {
      syncDropdowns();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncTheme();
      syncDropdowns();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncDropdowns);
  } else {
    syncDropdowns();
  }
  syncTheme();

  // -------------------------------------------------------------
  // Ultra-Smooth Instant Navigation Preloader
  // Prefetches HTML documents on hover / touchstart for 0ms transitions
  // -------------------------------------------------------------
  const prefetchedUrls = new Set();
  const prefetchPage = (url) => {
    if (!url || prefetchedUrls.has(url)) return;
    try {
      const target = new URL(url, location.href);
      if (target.origin !== location.origin) return;
      if (target.pathname === location.pathname && target.search === location.search) return;
      if (target.pathname.startsWith("/admin")) return;
      prefetchedUrls.add(url);

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = target.href;
      link.as = "document";
      document.head.append(link);
    } catch (_) {}
  };

  const handleLinkHover = (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    const rawHref = anchor.getAttribute("href");
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      return;
    }
    prefetchPage(anchor.href);
  };

  document.addEventListener("pointerover", handleLinkHover, { passive: true });
  document.addEventListener("touchstart", handleLinkHover, { passive: true });
})();

