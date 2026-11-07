(() => {
  // Lucide keeps data-lucide on generated SVGs, so every global createIcons() call would redraw
  // every icon on the page. Marking rendered SVGs limits later calls to new placeholders only.
  const guardLucide = () => {
    const lucide = window.lucide;
    if (!lucide?.createIcons) return false;
    if (lucide.createIcons.ruqoGuarded) return true;
    const original = lucide.createIcons;
    const markRendered = () => document.querySelectorAll("svg[data-lucide]").forEach((svg) => {
      svg.dataset.renderedIcon = svg.getAttribute("data-lucide");
      svg.removeAttribute("data-lucide");
    });
    const guarded = (options) => {
      markRendered();
      const result = original(options);
      markRendered();
      return result;
    };
    guarded.ruqoGuarded = true;
    lucide.createIcons = guarded;
    return true;
  };
  if (!guardLucide()) {
    document.addEventListener("DOMContentLoaded", guardLucide, { once: true });
    window.addEventListener("load", guardLucide, { once: true });
  }
  const supportedLanguages = ["en", "fr", "es", "zh", "ar"];
  const isLocalDevelopment = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname,
  );
  document.documentElement.classList.toggle(
    "is-local-development",
    isLocalDevelopment,
  );
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
    document.querySelectorAll(".commerce-cart-count, .wx-mobile-nav-badge").forEach((node) => {
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
    brand.textContent = product.brand || "WEEXEY";
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
    const storeName = window.RUQO_STORE_SETTINGS?.store_name || "WEEXEY";
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
  const currencyRates = Object.freeze({ SAR: 1, USD: 1 / 3.75, EUR: 0.245 });
  const convertCurrencyExact = (amount, fromCurrency = "SAR", toCurrency = getCurrency()) => {
    const value = Number(amount) || 0;
    const sourceRate = currencyRates[fromCurrency] || currencyRates.SAR;
    const targetRate = currencyRates[toCurrency] || currencyRates.SAR;
    return value * targetRate / sourceRate;
  };
  const convertCurrency = (amount, fromCurrency = "SAR", toCurrency = getCurrency()) =>
    Math.round((convertCurrencyExact(amount, fromCurrency, toCurrency) + Number.EPSILON) * 100) / 100;
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
    EUR: { symbol: "€", label: "EUR", subtitle: "اليورو الأوروبي" },
    SAR: { symbol: "ر.س", label: "SAR", subtitle: "الريال السعودي" },
  };

  const languageMeta = {
    en: { code: "EN", flag: "🇺🇸", label: "English", subtitle: "United States" },
    fr: { code: "FR", flag: "🇫🇷", label: "Français", subtitle: "France" },
    es: { code: "ES", flag: "🇪🇸", label: "Español", subtitle: "España" },
    zh: { code: "ZH", flag: "🇨🇳", label: "中文", subtitle: "简体中文" },
    ar: { code: "عربي", flag: "🇸🇦", label: "العربية", subtitle: "المملكة العربية السعودية" },
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
    const orderSelectOptions = (select, values) => {
      const selectedValue = select.value;
      const order = new Map(values.map((value, index) => [value, index]));
      const options = [...select.options].sort(
        (a, b) => (order.get(a.value) ?? Infinity) - (order.get(b.value) ?? Infinity),
      );
      select.replaceChildren(...options);
      select.value = selectedValue;
    };

    // 1. Currency selects
    document.querySelectorAll("select[data-currency-select]").forEach((select) => {
      orderSelectOptions(select, ["USD", "EUR", "SAR"]);
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
      orderSelectOptions(select, ["en", "fr", "es", "zh", "ar"]);
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

  let searchPanel;
  let searchTrigger;
  const searchCopy = () => ({
    en: { label: "Search products", empty: "No matching products", loading: "Loading products...", results: "Search results" },
    ar: { label: "البحث عن منتجات", empty: "لا توجد منتجات مطابقة", loading: "جار تحميل المنتجات...", results: "نتائج البحث" },
    fr: { label: "Rechercher des produits", empty: "Aucun produit correspondant", loading: "Chargement des produits...", results: "Résultats" },
    es: { label: "Buscar productos", empty: "No hay productos coincidentes", loading: "Cargando productos...", results: "Resultados" },
    zh: { label: "搜索商品", empty: "没有匹配的商品", loading: "正在加载商品...", results: "搜索结果" },
  }[getLanguage()]);
  const closeSearch = (restoreFocus = false) => {
    if (!searchPanel || searchPanel.hidden) return;
    searchPanel.hidden = true;
    searchTrigger?.setAttribute("aria-expanded", "false");
    if (restoreFocus && searchTrigger?.isConnected) searchTrigger.focus({ preventScroll: true });
  };
  const positionSearch = () => {
    if (!searchPanel || searchPanel.hidden) return;
    if (!searchTrigger?.isConnected) return closeSearch();
    const bounds = searchTrigger.getBoundingClientRect();
    const width = Math.min(360, document.documentElement.clientWidth - 24);
    searchPanel.style.width = `${width}px`;
    searchPanel.style.left = `${Math.max(12, Math.min(bounds.left, document.documentElement.clientWidth - width - 12))}px`;
    searchPanel.style.top = `${bounds.bottom + 8}px`;
    searchPanel.style.maxHeight = `${Math.max(100, window.innerHeight - bounds.bottom - 20)}px`;
  };
  const normalizeSearchText = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();
  const renderSearch = () => {
    if (!searchPanel || searchPanel.hidden) return;
    const input = searchPanel.querySelector("input");
    const results = searchPanel.querySelector(".site-search-results");
    const status = searchPanel.querySelector(".site-search-status");
    const copy = searchCopy();
    const language = getLanguage();
    const terms = normalizeSearchText(input.value).split(/\s+/).filter(Boolean);
    results.replaceChildren();
    status.textContent = "";
    status.hidden = true;
    if (!terms.length) return;
    const catalog = window.NoursData;
    if (!catalog) {
      status.hidden = false;
      status.textContent = copy.loading;
      return;
    }
    const matches = catalog.products.filter((product) => {
      const localized = catalog.localizeProduct(product, language);
      const haystack = normalizeSearchText([localized.name, product.name, product.brand, product.id, localized.category].join(" "));
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 5);
    if (!matches.length) {
      status.hidden = false;
      status.textContent = copy.empty;
    }
    for (const product of matches) {
      const localized = catalog.localizeProduct(product, language);
      const link = document.createElement("a");
      link.className = "site-search-result";
      link.href = `/product.html?id=${encodeURIComponent(product.id)}`;
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = "";
      const name = document.createElement("strong");
      name.textContent = localized.name;
      const price = document.createElement("span");
      const currency = getCurrency();
      price.textContent = new Intl.NumberFormat(language === "zh" ? "zh-CN" : language, {
        style: "currency", currency, maximumFractionDigits: currency === "SAR" ? 0 : 2,
      }).format(convertCurrency(product.price, "SAR", currency));
      const copyNode = document.createElement("span");
      copyNode.append(name, price);
      link.append(image, copyNode);
      results.append(link);
    }
    positionSearch();
  };
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-site-search]");
    if (!button) {
      if (!searchPanel?.contains(event.target) || event.target.closest(".site-search-result")) closeSearch();
      return;
    }
    event.preventDefault();
    if (button === searchTrigger && searchPanel && !searchPanel.hidden) return closeSearch(true);
    closeSearch();
    closeAllMenus();
    searchTrigger = button;
    const copy = searchCopy();
    if (!searchPanel) {
      searchPanel = document.createElement("section");
      searchPanel.id = "site-search-panel";
      searchPanel.className = "site-search-panel";
      searchPanel.setAttribute("role", "search");
      searchPanel.innerHTML = '<input type="search" autocomplete="off" maxlength="160" /><p class="site-search-status" role="status" hidden></p><nav class="site-search-results"></nav>';
      searchPanel.querySelector("input").addEventListener("input", renderSearch);
      document.body.append(searchPanel);
    }
    const input = searchPanel.querySelector("input");
    searchPanel.hidden = false;
    searchPanel.dir = getLanguage() === "ar" ? "rtl" : "ltr";
    input.placeholder = copy.label;
    input.setAttribute("aria-label", copy.label);
    searchPanel.querySelector("nav").setAttribute("aria-label", copy.results);
    button.setAttribute("aria-controls", searchPanel.id);
    button.setAttribute("aria-expanded", "true");
    positionSearch();
    renderSearch();
    input.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", (event) => {
    if (!searchPanel || searchPanel.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch(true);
    } else if (searchPanel.contains(event.target) && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const items = [...searchPanel.querySelectorAll("input, a")];
      const index = items.indexOf(document.activeElement);
      items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
    }
  });
  document.addEventListener("focusin", (event) => {
    if (searchPanel && !searchPanel.hidden && event.target !== searchTrigger && !searchPanel.contains(event.target)) closeSearch();
  });
  window.addEventListener("resize", positionSearch);
  document.addEventListener("scroll", positionSearch, true);
  ["ruqo:catalog-updated", "ruqo:currency-updated"].forEach((name) => window.addEventListener(name, renderSearch));
  window.addEventListener("ruqo:language-updated", () => closeSearch());

  const currencyDropdownPositions = new WeakMap();
  const drawerMovedControls = new Set();
  const restoreDrawerMovedControls = () => {
    const headerActions = document.querySelector(".site-header .nav-actions, .commerce-header .commerce-actions");
    drawerMovedControls.forEach((control) => {
      if (!control.isConnected || !headerActions) return;
      control.classList.remove("store-menu-theme");
      headerActions.append(control);
    });
    drawerMovedControls.clear();
  };
  const restoreCurrencyDropdowns = () => {
    document.querySelectorAll(".ruqo-currency-dropdown").forEach((dropdown) => {
      const placeholder = currencyDropdownPositions.get(dropdown);
      if (placeholder?.isConnected && dropdown.parentNode !== placeholder.parentNode) {
        placeholder.after(dropdown);
      }
    });
  };

  const shopAssistantCopy = {
    en: {
      trigger: "Shop with AI",
      title: "Your shopping assistant",
      subtitle: "Tell me what you need and I’ll find a match in our catalog.",
      welcome: "Compare flagship devices, upload a photo of your room or desk setup to spot what’s missing, or share your budget for tailored store deals.",
      placeholder: "Ask to compare, build a budget setup, or upload a room photo...",
      send: "Send message",
      matches: "Here are a few options that match:",
      noMatches: "I couldn’t find a close match. Try another product type, feature, or budget.",
      view: "View product",
      addToCart: "Add to cart",
      addedToCart: "Added ✓",
      uploadImage: "Upload room or setup photo",
      removeImage: "Remove photo",
      imageReady: "Room / setup photo attached",
      analyzing: "WEEXEY AI is analyzing...",
      expand: "Expand view",
      collapse: "Compact view",
      roomDetectedTitle: "Space & Setup Reading",
      roomMissingTitle: "What’s Missing in Your Space",
      roomImpactTitle: "Upgrade Impact",
      verdictTitle: "AI Verdict",
      saleBadge: "Deal",
      suggestions: [
        "Compare MacBook Pro 14 M4 vs Zenbook 14 OLED",
        "Analyze my room setup & show missing tech deals",
        "Build a complete setup under 7,500 SAR",
      ],
      close: "Close shopping assistant",
      intro: "Your next great find starts here.",
      starters: "A little inspiration",
      note: "Powered by NVIDIA AI · Live prices & deals from the WEEXEY catalog.",
      restart: "Start a new conversation",
      you: "You",
      assistant: "WEEXEY assistant",
    },
    ar: {
      trigger: "تسوّق مع AI",
      title: "مساعد التسوق الذكي",
      subtitle: "أخبرني بما تحتاجه وسأبحث لك في منتجات المتجر.",
      welcome: "قارن بين الأجهزة، أو ارفع صورة غرفتك/مكتبك لاكتشاف ما ينقصها مع العروض، أو حدّد ميزانيتك لتجميع أفضل باقة.",
      placeholder: "اطلب مقارنة، أو ارفع صورة غرفتك، أو اكتب ميزانيتك...",
      send: "إرسال الرسالة",
      matches: "هذه بعض الخيارات المناسبة:",
      noMatches: "لم أجد تطابقاً قريباً. جرّب وصف نوع المنتج أو ميزته أو ميزانيتك.",
      view: "عرض المنتج",
      addToCart: "أضف للسلة",
      addedToCart: "تمت الإضافة ✓",
      uploadImage: "إرفاق صورة غرفة أو سيت-أب",
      removeImage: "إزالة الصورة",
      imageReady: "صورة الغرفة جاهزة للتحليل",
      analyzing: "يقوم مساعد WEEXEY بالتحليل...",
      expand: "توسيع النافذة",
      collapse: "الحجم العادي",
      roomDetectedTitle: "قراءة المساحة الحالية",
      roomMissingTitle: "ما ينقص الغرفة / السيت-أب",
      roomImpactTitle: "تأثير الترقية",
      verdictTitle: "الحكم النهائي",
      saleBadge: "عرض خاص",
      suggestions: [
        "قارن بين MacBook Pro 14 M4 و Zenbook 14 OLED",
        "حلّل صورة غرفتي واذكر الناقص مع العروض",
        "رشّح لي باقة متكاملة بميزانية 7500 ريال",
      ],
      close: "إغلاق مساعد التسوق",
      intro: "اختيارك القادم يبدأ من هنا.",
      starters: "بماذا نبدأ؟",
      note: "مدعوم بذكاء NVIDIA · أسعار وعروض حية من كتالوج WEEXEY.",
      restart: "بدء محادثة جديدة",
      you: "أنت",
      assistant: "مساعد WEEXEY",
    },
    fr: {
      trigger: "Shop with AI",
      title: "Votre assistant shopping",
      subtitle: "Dites-moi ce qu’il vous faut et je chercherai dans notre catalogue.",
      welcome: "Comparez nos appareils, importez une photo de votre pièce/bureau ou indiquez votre budget.",
      placeholder: "Comparez, importez une photo ou indiquez votre budget...",
      send: "Envoyer",
      matches: "Voici quelques options correspondantes :",
      noMatches: "Aucun résultat proche. Essayez un autre produit, une caractéristique ou un budget.",
      view: "Voir le produit",
      addToCart: "Ajouter",
      addedToCart: "Ajouté ✓",
      uploadImage: "Importer une photo de pièce/bureau",
      removeImage: "Retirer la photo",
      imageReady: "Photo prête pour l’analyse",
      analyzing: "WEEXEY AI analyse...",
      expand: "Agrandir",
      collapse: "Réduire",
      roomDetectedTitle: "Analyse de l’espace",
      roomMissingTitle: "Ce qui manque à votre espace",
      roomImpactTitle: "Impact de l’amélioration",
      verdictTitle: "Verdict IA",
      saleBadge: "Offre",
      suggestions: [
        "Comparer MacBook Pro 14 M4 et Zenbook 14 OLED",
        "Analyser la photo de ma pièce et les offres",
        "Configuration complète sous 7 500 SAR",
      ],
      close: "Fermer l’assistant shopping",
      intro: "Votre prochaine découverte commence ici.",
      starters: "Un peu d’inspiration",
      note: "Propulsé par NVIDIA AI · Suggestions du catalogue WEEXEY.",
      restart: "Nouvelle conversation",
      you: "Vous",
      assistant: "Assistant WEEXEY",
    },
    es: {
      trigger: "Shop with AI",
      title: "Tu asistente de compras",
      subtitle: "Cuéntame qué necesitas y buscaré opciones en nuestro catálogo.",
      welcome: "Compara dispositivos, sube una foto de tu habitación/escritorio o comparte tu presupuesto.",
      placeholder: "Compara, sube una foto o indica tu presupuesto...",
      send: "Enviar mensaje",
      matches: "Estas opciones podrían encajarte:",
      noMatches: "No encontré una coincidencia cercana. Prueba con otro producto, característica o presupuesto.",
      view: "Ver producto",
      addToCart: "Añadir",
      addedToCart: "Añadido ✓",
      uploadImage: "Subir foto de habitación/setup",
      removeImage: "Quitar foto",
      imageReady: "Foto lista para analizar",
      analyzing: "WEEXEY AI analizando...",
      expand: "Ampliar",
      collapse: "Compactar",
      roomDetectedTitle: "Lectura del espacio",
      roomMissingTitle: "Qué falta en tu espacio",
      roomImpactTitle: "Impacto de la mejora",
      verdictTitle: "Veredicto IA",
      saleBadge: "Oferta",
      suggestions: [
        "Comparar MacBook Pro 14 M4 vs Zenbook 14 OLED",
        "Analizar foto de mi habitación y ofertas",
        "Setup completo por menos de 7.500 SAR",
      ],
      close: "Cerrar asistente de compras",
      intro: "Tu próximo descubrimiento empieza aquí.",
      starters: "Un poco de inspiración",
      note: "Impulsado por NVIDIA AI · Sugerencias del catálogo WEEXEY.",
      restart: "Iniciar una nueva conversación",
      you: "Tú",
      assistant: "Asistente WEEXEY",
    },
    zh: {
      trigger: "AI 选购",
      title: "智能购物助手",
      subtitle: "告诉我你的需求，我会在商店目录中为你查找。",
      welcome: "对比旗舰设备、上传房间/桌面照片分析缺失装备，或输入预算获取专属优惠套装。",
      placeholder: "输入对比需求、预算，或上传房间照片...",
      send: "发送消息",
      matches: "这些商品可能适合你：",
      noMatches: "没有找到相近商品。试试描述其他类型、功能或预算。",
      view: "查看商品",
      addToCart: "加入购物车",
      addedToCart: "已加入 ✓",
      uploadImage: "上传房间或桌面照片",
      removeImage: "移除照片",
      imageReady: "房间照片已就绪",
      analyzing: "WEEXEY AI 正在分析...",
      expand: "展开视图",
      collapse: "紧凑视图",
      roomDetectedTitle: "空间与桌面识别",
      roomMissingTitle: "建议补充的科技装备",
      roomImpactTitle: "升级效果",
      verdictTitle: "AI 选购建议",
      saleBadge: "特惠",
      suggestions: [
        "对比 MacBook Pro 14 M4 与 Zenbook 14 OLED",
        "分析我的房间照片并推荐优惠好物",
        "7500 SAR 预算内的全套装备推荐",
      ],
      close: "关闭购物助手",
      intro: "从这里发现你的下一件好物。",
      starters: "从这些灵感开始",
      note: "由 NVIDIA AI 驱动 · 推荐来自 WEEXEY 商品目录。",
      restart: "开始新对话",
      you: "你",
      assistant: "WEEXEY 助手",
    },
  };

  const normalizeAssistantText = (value) =>
    String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .toLocaleLowerCase();

  function setupShopAssistant(trigger, language, listen, store) {
    const existingOverlay = document.querySelector(".shop-ai-overlay");
    if (existingOverlay?.dataset.language === language) {
      existingOverlay.bindAssistantTrigger(trigger, listen);
      return;
    }
    existingOverlay?.closeAssistant?.(false);
    existingOverlay?.remove();
    const copy = shopAssistantCopy[language] || shopAssistantCopy.en;
    const overlay = document.createElement("div");
    overlay.className = "shop-ai-overlay";
    overlay.dataset.language = language;
    overlay.hidden = true;
    overlay.dir = language === "ar" ? "rtl" : "ltr";
    overlay.innerHTML = `
      <section class="shop-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="shop-ai-title" tabindex="-1">
        <header class="shop-ai-header">
          <div class="shop-ai-heading">
            <span class="shop-ai-mark"><i data-lucide="sparkles" aria-hidden="true"></i></span>
            <div><span class="shop-ai-brand" dir="ltr">WEEXEY AI</span><h2 id="shop-ai-title">${copy.title}</h2></div>
          </div>
          <div class="shop-ai-header-actions">
            <button class="shop-ai-expand" type="button" aria-label="${copy.expand}" title="${copy.expand}" aria-pressed="false"><i data-lucide="maximize-2" aria-hidden="true"></i></button>
            <button class="shop-ai-restart" type="button" aria-label="${copy.restart}" title="${copy.restart}"><i data-lucide="square-pen" aria-hidden="true"></i></button>
            <button class="shop-ai-close" type="button" aria-label="${copy.close}"><i data-lucide="x" aria-hidden="true"></i></button>
          </div>
        </header>
        <div class="shop-ai-thread" role="log" aria-live="polite" aria-relevant="additions text" aria-label="${copy.title}">
          <div class="shop-ai-welcome">
            <div class="shop-ai-orb" aria-hidden="true"><i data-lucide="sparkles"></i></div>
            <span class="shop-ai-eyebrow">${copy.assistant}</span>
            <h3>${copy.intro}</h3>
            <p>${copy.welcome}</p>
          </div>
        </div>
        <div class="shop-ai-starters">
          <p>${copy.starters}</p>
          <div class="shop-ai-suggestions"></div>
        </div>
        <form class="shop-ai-form">
          <div class="shop-ai-attachment-preview" hidden>
            <img class="shop-ai-attachment-thumb" alt="" />
            <span class="shop-ai-attachment-name">${copy.imageReady}</span>
            <button class="shop-ai-attachment-remove" type="button" aria-label="${copy.removeImage}" title="${copy.removeImage}">
              <i data-lucide="x" aria-hidden="true"></i>
            </button>
          </div>
          <div class="shop-ai-composer">
            <input class="shop-ai-file-input" type="file" accept="image/*" hidden />
            <button class="shop-ai-upload-btn" type="button" aria-label="${copy.uploadImage}" title="${copy.uploadImage}">
              <i data-lucide="image-plus" aria-hidden="true"></i>
            </button>
            <label class="shop-ai-input-wrap"><input name="message" aria-label="${copy.placeholder}" autocomplete="off" maxlength="500" placeholder="${copy.placeholder}" /></label>
            <button class="shop-ai-send" type="submit" aria-label="${copy.send}"><i data-lucide="arrow-up" aria-hidden="true"></i></button>
          </div>
          <p class="shop-ai-note"><i data-lucide="info" aria-hidden="true"></i><span>${copy.note}</span></p>
        </form>
      </section>
    `;
    document.body.append(overlay);

    const dialog = overlay.querySelector(".shop-ai-dialog");
    const thread = overlay.querySelector(".shop-ai-thread");
    const form = overlay.querySelector(".shop-ai-form");
    const input = form.elements.message;
    const fileInput = overlay.querySelector(".shop-ai-file-input");
    const uploadBtn = overlay.querySelector(".shop-ai-upload-btn");
    const attachmentPreview = overlay.querySelector(".shop-ai-attachment-preview");
    const attachmentThumb = overlay.querySelector(".shop-ai-attachment-thumb");
    const attachmentRemove = overlay.querySelector(".shop-ai-attachment-remove");
    const expandBtn = overlay.querySelector(".shop-ai-expand");
    const welcome = overlay.querySelector(".shop-ai-welcome");
    const shell = document.querySelector(".page-shell");
    let previousInert = false;
    let previousOverflow = "";
    let viewportController;
    let fullViewportHeight = 0;
    let viewportWidth = 0;
    let pendingImageDataUrl = null;
    let pendingImageMeta = {};
    let isSubmitting = false;
    const chatHistory = [];

    const setExpanded = (expanded) => {
      dialog.classList.toggle("is-expanded", Boolean(expanded));
      if (expandBtn) {
        expandBtn.setAttribute("aria-pressed", String(Boolean(expanded)));
        const label = expanded ? copy.collapse : copy.expand;
        expandBtn.setAttribute("aria-label", label);
        expandBtn.setAttribute("title", label);
        expandBtn.innerHTML = `<i data-lucide="${expanded ? "minimize-2" : "maximize-2"}" aria-hidden="true"></i>`;
        window.lucide?.createIcons();
      }
    };

    expandBtn?.addEventListener("click", () => {
      setExpanded(!dialog.classList.contains("is-expanded"));
    });

    const clearPendingImage = () => {
      pendingImageDataUrl = null;
      pendingImageMeta = {};
      if (fileInput) fileInput.value = "";
      if (attachmentPreview) attachmentPreview.hidden = true;
      if (attachmentThumb) attachmentThumb.removeAttribute("src");
    };

    const processImageFile = (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 960;
          const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          let brightness = "balanced";
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            try {
              const sample = ctx.getImageData(0, 0, Math.min(w, 64), Math.min(h, 64)).data;
              let sum = 0;
              let count = 0;
              for (let i = 0; i < sample.length; i += 16) {
                sum += (sample[i] * 0.299 + sample[i + 1] * 0.587 + sample[i + 2] * 0.114);
                count += 1;
              }
              const avg = count ? sum / count : 128;
              brightness = avg < 95 ? "dark" : avg > 175 ? "bright" : "balanced";
            } catch (_) {}
          }
          pendingImageDataUrl = canvas.toDataURL("image/jpeg", 0.84);
          pendingImageMeta = { width: w, height: h, brightness, name: file.name };
          if (attachmentThumb) attachmentThumb.src = pendingImageDataUrl;
          if (attachmentPreview) attachmentPreview.hidden = false;
          window.lucide?.createIcons();
        };
        img.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    };

    uploadBtn?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) processImageFile(file);
    });
    attachmentRemove?.addEventListener("click", clearPendingImage);

    dialog.addEventListener("dragover", (event) => {
      event.preventDefault();
      dialog.classList.add("is-dragover");
    });
    dialog.addEventListener("dragleave", (event) => {
      if (!dialog.contains(event.relatedTarget)) dialog.classList.remove("is-dragover");
    });
    dialog.addEventListener("drop", (event) => {
      event.preventDefault();
      dialog.classList.remove("is-dragover");
      const file = event.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processImageFile(file);
      }
    });

    const mobileAssistantQuery = window.matchMedia("(max-width: 650px), (max-width: 1000px) and (pointer: coarse)");
    const focusAssistant = () => {
      (mobileAssistantQuery.matches ? dialog : input).focus({ preventScroll: true });
    };
    const syncAssistantViewport = () => {
      if (overlay.hidden) return;
      const viewport = window.visualViewport;
      const height = viewport?.height || window.innerHeight;
      if (viewportWidth !== window.innerWidth) fullViewportHeight = 0;
      viewportWidth = window.innerWidth;
      fullViewportHeight = Math.max(fullViewportHeight, height, window.innerHeight);
      overlay.classList.toggle("is-mobile-viewport", mobileAssistantQuery.matches);
      overlay.classList.toggle("is-keyboard-open",
        mobileAssistantQuery.matches && document.activeElement === input && fullViewportHeight - height > 80);
      overlay.style.setProperty("--shop-ai-viewport-height", `${height}px`);
      overlay.style.setProperty("--shop-ai-viewport-top", `${viewport?.offsetTop || 0}px`);
    };

    const formatStorePrice = (amountSar) => {
      const currency = store.getCurrency();
      return new Intl.NumberFormat(
        language === "zh" ? "zh-CN" : ({ ar: "ar-SA", fr: "fr-FR", es: "es-ES" }[language] || "en-US"),
        { style: "currency", currency, maximumFractionDigits: currency === "SAR" ? 0 : 2 },
      ).format(store.convertCurrency(amountSar, "SAR", currency));
    };

    const appendFormattedText = (container, rawText) => {
      const text = String(rawText || "");
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      parts.forEach((part) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          const strong = document.createElement("strong");
          strong.textContent = part.slice(2, -2);
          container.append(strong);
        } else if (part) {
          container.append(document.createTextNode(part));
        }
      });
    };

    const buildProductCardElement = (product) => {
      const localized = window.NoursData?.localizeProduct?.(product, language) || product;
      const card = document.createElement("div");
      card.className = "shop-ai-product";

      const imageLink = document.createElement("a");
      imageLink.className = "shop-ai-product-media";
      imageLink.href = `/product.html?id=${encodeURIComponent(product.id)}`;
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = localized.name || product.name;
      image.loading = "lazy";
      imageLink.append(image);

      const details = document.createElement("div");
      details.className = "shop-ai-product-details";

      const topMeta = document.createElement("div");
      topMeta.className = "shop-ai-product-meta";
      const brand = document.createElement("small");
      brand.textContent = product.brand;
      topMeta.append(brand);

      const hasDiscount = Number.isFinite(product.oldPrice) && product.oldPrice > product.price;
      if (hasDiscount) {
        const pct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        const badge = document.createElement("span");
        badge.className = "shop-ai-discount-pill";
        badge.textContent = `${copy.saleBadge} -${pct}%`;
        topMeta.append(badge);
      }

      const nameLink = document.createElement("a");
      nameLink.className = "shop-ai-product-title";
      nameLink.href = `/product.html?id=${encodeURIComponent(product.id)}`;
      const name = document.createElement("strong");
      name.textContent = localized.name || product.name;
      nameLink.append(name);

      const priceRow = document.createElement("div");
      priceRow.className = "shop-ai-product-price-row";
      const price = document.createElement("span");
      price.className = "shop-ai-product-price";
      price.textContent = formatStorePrice(product.price);
      priceRow.append(price);

      if (hasDiscount) {
        const oldPrice = document.createElement("del");
        oldPrice.className = "shop-ai-product-oldprice";
        oldPrice.textContent = formatStorePrice(product.oldPrice);
        priceRow.append(oldPrice);
      }

      details.append(topMeta, nameLink, priceRow);

      const actions = document.createElement("div");
      actions.className = "shop-ai-product-actions";

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "shop-ai-add-cart";
      addBtn.textContent = copy.addToCart;
      addBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        store.addToCart(product.id, 1);
        addBtn.textContent = copy.addedToCart;
        addBtn.classList.add("is-added");
        setTimeout(() => {
          addBtn.textContent = copy.addToCart;
          addBtn.classList.remove("is-added");
        }, 1800);
      });

      const viewLink = document.createElement("a");
      viewLink.className = "shop-ai-product-action";
      viewLink.href = `/product.html?id=${encodeURIComponent(product.id)}`;
      viewLink.textContent = copy.view;

      actions.append(addBtn, viewLink);
      card.append(imageLink, details, actions);
      return card;
    };

    const addMessage = (text, role, products = [], extra = {}) => {
      const message = document.createElement("article");
      message.className = `shop-ai-message is-${role}`;
      const author = document.createElement("span");
      author.className = "shop-ai-author";
      author.textContent = role === "user" ? copy.you : copy.assistant;
      message.append(author);

      if (extra.userImage) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "shop-ai-user-image";
        const img = document.createElement("img");
        img.src = extra.userImage;
        img.alt = "";
        imgWrap.append(img);
        message.append(imgWrap);
      }

      if (text) {
        const paragraph = document.createElement("p");
        appendFormattedText(paragraph, text);
        message.append(paragraph);
      }

      // Room / Setup Vision Card
      if (extra.roomAnalysis && typeof extra.roomAnalysis === "object") {
        const roomCard = document.createElement("div");
        roomCard.className = "shop-ai-room-card";

        if (extra.roomAnalysis.detected) {
          const sec = document.createElement("div");
          sec.className = "shop-ai-room-section";
          sec.innerHTML = `<div class="shop-ai-room-heading"><i data-lucide="scan-eye" aria-hidden="true"></i><strong>${copy.roomDetectedTitle}</strong></div>`;
          const p = document.createElement("p");
          p.textContent = extra.roomAnalysis.detected;
          sec.append(p);
          roomCard.append(sec);
        }

        if (Array.isArray(extra.roomAnalysis.missing) && extra.roomAnalysis.missing.length) {
          const sec = document.createElement("div");
          sec.className = "shop-ai-room-section";
          sec.innerHTML = `<div class="shop-ai-room-heading"><i data-lucide="sparkles" aria-hidden="true"></i><strong>${copy.roomMissingTitle}</strong></div>`;
          const list = document.createElement("ul");
          list.className = "shop-ai-room-list";
          extra.roomAnalysis.missing.forEach((itemText) => {
            const li = document.createElement("li");
            li.textContent = itemText;
            list.append(li);
          });
          sec.append(list);
          roomCard.append(sec);
        }

        if (extra.roomAnalysis.upgradeImpact) {
          const sec = document.createElement("div");
          sec.className = "shop-ai-room-section is-impact";
          sec.innerHTML = `<div class="shop-ai-room-heading"><i data-lucide="zap" aria-hidden="true"></i><strong>${copy.roomImpactTitle}</strong></div>`;
          const p = document.createElement("p");
          p.textContent = extra.roomAnalysis.upgradeImpact;
          sec.append(p);
          roomCard.append(sec);
        }

        message.append(roomCard);
      }

      // Interactive Comparison Studio Card
      if (extra.comparison && Array.isArray(extra.comparison.rows) && products.length >= 2) {
        const [p1, p2] = products;
        const loc1 = window.NoursData?.localizeProduct?.(p1, language) || p1;
        const loc2 = window.NoursData?.localizeProduct?.(p2, language) || p2;

        const compWrap = document.createElement("div");
        compWrap.className = "shop-ai-comparison";

        const headGrid = document.createElement("div");
        headGrid.className = "shop-ai-comp-devices";
        [
          { prod: p1, loc: loc1 },
          { prod: p2, loc: loc2 },
        ].forEach(({ prod, loc }) => {
          const col = document.createElement("div");
          col.className = "shop-ai-comp-device";
          const img = document.createElement("img");
          img.src = prod.image;
          img.alt = loc.name || prod.name;
          const title = document.createElement("strong");
          title.textContent = loc.name || prod.name;
          const price = document.createElement("span");
          price.className = "shop-ai-comp-price";
          price.textContent = formatStorePrice(prod.price);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "shop-ai-add-cart";
          btn.textContent = copy.addToCart;
          btn.addEventListener("click", () => {
            store.addToCart(prod.id, 1);
            btn.textContent = copy.addedToCart;
            btn.classList.add("is-added");
            setTimeout(() => {
              btn.textContent = copy.addToCart;
              btn.classList.remove("is-added");
            }, 1800);
          });
          col.append(img, title, price, btn);
          headGrid.append(col);
        });
        compWrap.append(headGrid);

        const table = document.createElement("div");
        table.className = "shop-ai-comp-rows";
        extra.comparison.rows.forEach((row) => {
          const rowEl = document.createElement("div");
          rowEl.className = "shop-ai-comp-row";
          const labelEl = document.createElement("span");
          labelEl.className = "shop-ai-comp-label";
          labelEl.textContent = row.label;

          const valsEl = document.createElement("div");
          valsEl.className = "shop-ai-comp-values";
          const v0 = document.createElement("span");
          v0.className = `shop-ai-comp-val${row.winnerIndex === 0 ? " is-winner" : ""}`;
          v0.textContent = row.values?.[0] || "—";
          const v1 = document.createElement("span");
          v1.className = `shop-ai-comp-val${row.winnerIndex === 1 ? " is-winner" : ""}`;
          v1.textContent = row.values?.[1] || "—";
          valsEl.append(v0, v1);

          rowEl.append(labelEl, valsEl);
          table.append(rowEl);
        });
        compWrap.append(table);

        if (extra.comparison.verdict) {
          const verdict = document.createElement("div");
          verdict.className = "shop-ai-verdict";
          const vTitle = document.createElement("strong");
          vTitle.textContent = `${copy.verdictTitle}: `;
          const vText = document.createElement("span");
          appendFormattedText(vText, extra.comparison.verdict);
          verdict.append(vTitle, vText);
          compWrap.append(verdict);
        }

        message.append(compWrap);
      }

      // Budget Summary Banner
      if (extra.budgetSummary && typeof extra.budgetSummary === "object") {
        const budgetCard = document.createElement("div");
        budgetCard.className = "shop-ai-budget-card";
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "CheckCircle2");
        const textSpan = document.createElement("span");
        const totalFormatted = Number.isFinite(extra.budgetSummary.totalPrice)
          ? formatStorePrice(extra.budgetSummary.totalPrice)
          : "";
        const savedFormatted = Number.isFinite(extra.budgetSummary.totalSaved) && extra.budgetSummary.totalSaved > 0
          ? formatStorePrice(extra.budgetSummary.totalSaved)
          : "";
        textSpan.textContent = extra.budgetSummary.note || `${totalFormatted}${savedFormatted ? ` (-${savedFormatted})` : ""}`;
        budgetCard.append(textSpan);
        message.append(budgetCard);
      }

      if (products.length) {
        const results = document.createElement("div");
        results.className = "shop-ai-results";
        products.forEach((product) => {
          results.append(buildProductCardElement(product));
        });
        message.append(results);
      }

      thread.append(message);
      if (role === "assistant" && (extra.comparison || extra.roomAnalysis)) {
        message.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        thread.scrollTop = thread.scrollHeight;
      }
      window.lucide?.createIcons();
      return message;
    };

    const recommend = (message) => {
      const products = window.NoursData?.products || [];
      const query = normalizeAssistantText(message);
      const categories = [
        { value: "phones", terms: ["phone", "mobile", "smartphone", "هاتف", "جوال", "موبايل", "téléphone", "telefono", "móvil", "手机"] },
        { value: "laptops", terms: ["laptop", "notebook", "computer", "لابتوب", "حاسب", "كمبيوتر", "ordinateur", "portátil", "ordenador", "笔记本", "电脑"] },
        { value: "audio", terms: ["audio", "headphone", "headset", "earbuds", "سماعة", "سماعات", "صوت", "casque", "écouteur", "auricular", "auriculares", "耳机"] },
        { value: "wearables", terms: ["watch", "wearable", "ساعة", "ساعات", "ذكية", "montre", "reloj", "relojes", "手表", "穿戴"] },
      ];
      const category = categories.find((group) => group.terms.some((term) => query.includes(normalizeAssistantText(term))))?.value;
      const budgetMatch = query.match(/(?:under|below|less than|up to|budget(?: of)?|أقل من|اقل من|ميزانية|ميزانيتي|تحت|حتى|moins de|moins|menos de|hasta|低于|预算)\s*[$€]?\s*(\d[\d,.]*)/);
      const currency = store.getCurrency();
      const maxPrice = budgetMatch
        ? store.convertCurrency(Number(budgetMatch[1].replace(/[,.]/g, "")), currency, "SAR")
        : Infinity;
      const terms = query.split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1);
      const stopWords = new Set(["the", "and", "for", "with", "under", "from", "need", "want", "looking", "من", "في", "على", "الى", "إلى", "مع", "اريد", "أريد", "ابحث", "عن", "لدي"]);
      const keywords = terms.filter((term) => !stopWords.has(term));

      return products
        .map((product) => {
          if (product.price > maxPrice || (category && product.category !== category)) return null;
          const localized = window.NoursData?.localizeProduct?.(product, language) || product;
          const searchable = normalizeAssistantText([
            localized.name,
            product.name,
            product.brand,
            localized.description?.[language],
            product.description?.en,
            product.description?.ar,
            ...(localized.features?.[language] || []),
          ].join(" "));
          let score = category ? 8 : 0;
          keywords.forEach((term) => {
            if (searchable.includes(term)) score += term.length > 3 ? 2 : 1;
          });
          if (product.stock) score += 0.5;
          score += product.rating / 10;
          return { product, score };
        })
        .filter((item) => item && (category || keywords.length === 0 || item.score > 1))
        .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
        .slice(0, 3)
        .map((item) => item.product);
    };

    const buildClientSmartResponse = (rawMsg, hasImage, imgMeta = {}) => {
      const isAr = language === "ar";
      const msg = String(rawMsg || "").toLowerCase();
      const allProducts = window.NoursData?.products || [];
      const byId = new Map(allProducts.map((p) => [p.id, p]));

      if (hasImage) {
        const mentionsMobile = /phone|mobile|camera|جوال|هاتف|تصوير/.test(msg);
        const mentionsAudio = /audio|headphone|sound|quiet|music|سماعة|صوت|هدوء/.test(msg);
        const ids = mentionsMobile
          ? ["iphone-16", "airpods-pro", "apple-watch"]
          : mentionsAudio
            ? ["sony-headphones", "macbook-pro", "galaxy-watch"]
            : ["macbook-pro", "sony-headphones", "apple-watch"];
        const matched = ids.map((id) => byId.get(id)).filter(Boolean);
        const toneNote =
          imgMeta.brightness === "dark"
            ? isAr
              ? "إضاءة الغرفة هادئة وتميل للوضع الليلي، مما يجعل الشاشات عالية التباين (Liquid Retina XDR / OLED) مثالية لها."
              : "Your space has a calm, low-light ambiance—making high-contrast Liquid Retina XDR and OLED displays ideal."
            : isAr
              ? "مساحة الغرفة متوازنة الإضاءة ومرتبة، وتسمح بإضافة ركن عمل وترفيه متكامل بأناقة."
              : "Your space has balanced lighting and a clean layout, ideal for a streamlined flagship workstation.";
        return {
          mode: "room_analysis",
          reply: isAr
            ? "قمت بتحليل صورة الغرفة/السيت-أب الخاصة بك. لتكتمل تجربة العمل والترفيه في هذه المساحة، إليك ما ينقصها مع العروض المتوفرة حالياً في WEEXEY:"
            : "I analyzed your room and setup photo. To elevate this space into a complete flagship setup, here is what is missing along with current WEEXEY deals:",
          roomAnalysis: {
            detected: toneNote,
            missing: isAr
              ? [
                  "جهاز رئيسي فائق الأداء بشاشة احترافية (MacBook Pro 14 M4) ليكون قلب المكتب",
                  "سماعة عزل ضجيج محيطي (WH-1000XM5 أو AirPods Pro 2) للتركيز التام داخل الغرفة",
                  "ساعة ذكية متزامنة لتنبيهات المكتب والنشاط اليومي",
                ]
              : [
                  "A flagship workstation laptop with an XDR/OLED display (MacBook Pro 14 M4) as the centerpiece",
                  "Studio-grade Active Noise Cancelling headphones (WH-1000XM5) for deep focus in the room",
                  "A smart wearable companion for seamless desk notifications and wellness tracking",
                ],
            upgradeImpact: isAr
              ? "إضافة هذه القطع ستحوّل المساحة إلى استوديو متكامل بصوت معزول وشاشة فائقة الدقة مع الاستفادة من الخصومات الفعّالة حالياً."
              : "Adding these pieces transforms your room into a distraction-free studio with reference-grade visuals, acoustic isolation, and active store discounts.",
          },
          products: matched.length ? matched : allProducts.slice(0, 3),
        };
      }

      const isCompare = /compare|vs|versus|difference|better|قارن|مقارنة|الفرق|ايهم|أيهما|مقابل/.test(msg);
      const genericTokens = new Set(["pro", "max", "ultra", "plus", "the", "and", "for", "with", "compare", "versus"]);
      const named = allProducts
        .map((p) => {
          const loc = window.NoursData?.localizeProduct?.(p, language) || p;
          const tokens = `${p.id} ${p.name} ${loc.name || ""} ${p.brand}`
            .toLowerCase()
            .split(/[^a-z0-9\u0600-\u06ff]+/)
            .filter((tok) => tok.length > 2 && !genericTokens.has(tok));
          const hits = tokens.filter((tok) => msg.includes(tok)).length;
          return { product: p, hits };
        })
        .filter((entry) => entry.hits > 0)
        .sort((a, b) => b.hits - a.hits)
        .map((entry) => entry.product);

      if (isCompare || named.length >= 2) {
        let pair = named.slice(0, 2);
        if (pair.length < 2) {
          if (/phone|iphone|galaxy|هاتف|جوال|ايفون|سامسونج/.test(msg)) {
            pair = [byId.get("iphone-16"), byId.get("galaxy-s25")].filter(Boolean);
          } else if (/headphone|audio|airpods|sony|سماعة|سماعات|سوني/.test(msg)) {
            pair = [byId.get("airpods-pro"), byId.get("sony-headphones")].filter(Boolean);
          } else if (/watch|ساعة/.test(msg)) {
            pair = [byId.get("apple-watch"), byId.get("galaxy-watch")].filter(Boolean);
          } else {
            pair = [byId.get("macbook-pro"), byId.get("asus-zenbook")].filter(Boolean);
          }
        }
        if (pair.length >= 2) {
          const [p1, p2] = pair;
          const loc1 = window.NoursData?.localizeProduct?.(p1, language) || p1;
          const loc2 = window.NoursData?.localizeProduct?.(p2, language) || p2;
          const f1 = loc1.features?.[language] || p1.features?.en || [];
          const f2 = loc2.features?.[language] || p2.features?.en || [];
          const save1 = p1.oldPrice && p1.oldPrice > p1.price ? p1.oldPrice - p1.price : 0;
          const save2 = p2.oldPrice && p2.oldPrice > p2.price ? p2.oldPrice - p2.price : 0;
          return {
            mode: "comparison",
            reply: isAr
              ? `إليك مقارنة تفصيلية مباشرة بين **${loc1.name || p1.name}** و **${loc2.name || p2.name}**:`
              : `Here is a side-by-side comparison between **${loc1.name || p1.name}** and **${loc2.name || p2.name}**:`,
            comparison: {
              title: `${loc1.name || p1.name} vs ${loc2.name || p2.name}`,
              productIds: [p1.id, p2.id],
              rows: [
                {
                  label: isAr ? "الميزة الأبرز" : "Key Spec",
                  values: [f1[0] || p1.brand, f2[0] || p2.brand],
                  winnerIndex: 0,
                },
                {
                  label: isAr ? "الأداء والتقنية" : "Performance",
                  values: [f1[1] || f1[0] || p1.brand, f2[1] || f2[0] || p2.brand],
                  winnerIndex: p1.rating >= p2.rating ? 0 : 1,
                },
                {
                  label: isAr ? "إضافات ذكية" : "Smart Features",
                  values: [f1[2] || f1[3] || "Flagship", f2[2] || f2[3] || "Flagship"],
                  winnerIndex: 1,
                },
                {
                  label: isAr ? "تقييم العملاء" : "Customer Rating",
                  values: [`★ ${p1.rating} (${p1.reviews}+)`, `★ ${p2.rating} (${p2.reviews}+)`],
                  winnerIndex: p1.rating >= p2.rating ? 0 : 1,
                },
                {
                  label: isAr ? "العرض الحالي" : "Current Deal",
                  values: [
                    save1 > 0 ? `-${Math.round((save1 / p1.oldPrice) * 100)}% (${formatStorePrice(p1.price)})` : formatStorePrice(p1.price),
                    save2 > 0 ? `-${Math.round((save2 / p2.oldPrice) * 100)}% (${formatStorePrice(p2.price)})` : formatStorePrice(p2.price),
                  ],
                  winnerIndex: save1 >= save2 ? 0 : 1,
                },
              ],
              verdict: isAr
                ? `اختر **${loc1.name || p1.name}** إذا كنت تبحث عن ${f1[0] || "أعلى قيمة"} ${save1 > save2 ? "مع خصم أقوى حالياً" : ""}، واختر **${loc2.name || p2.name}** إذا كنت تفضّل ${f2[0] || p2.brand}.`
                : `Choose **${loc1.name || p1.name}** for ${f1[0] || "top performance"}${save1 > save2 ? " and the biggest active discount" : ""}, or pick **${loc2.name || p2.name}** if you prefer ${f2[0] || p2.brand}.`,
            },
            products: [p1, p2],
          };
        }
      }

      const budgetMatch = msg.match(/(\d[\d,.]*)/);
      const mentionsBudget = /budget|bundle|setup|package|under|ميزانيت|ميزانية|باقة|تجميعة|حدود|تحت|اقل من/.test(msg);
      if (mentionsBudget && budgetMatch) {
        const rawNum = Number(budgetMatch[1].replace(/[,.]/g, ""));
        const targetSar = rawNum >= 500 ? rawNum : 7500;
        const bundle = [];
        let runningTotal = 0;
        const usedCategories = new Set();
        for (const item of [...allProducts].sort((a, b) => b.rating - a.rating)) {
          if (!usedCategories.has(item.category) && runningTotal + item.price <= targetSar) {
            bundle.push(item);
            runningTotal += item.price;
            usedCategories.add(item.category);
          }
        }
        if (!bundle.length && allProducts.length) {
          bundle.push(allProducts[0]);
          runningTotal = allProducts[0].price;
        }
        const totalSaved = bundle.reduce(
          (sum, item) => sum + (item.oldPrice && item.oldPrice > item.price ? item.oldPrice - item.price : 0),
          0
        );
        return {
          mode: "budget_bundle",
          reply: isAr
            ? `قمت بتصميم أفضل باقة متكاملة لك ضمن ميزانية **${formatStorePrice(targetSar)}** مع الاستفادة من الخصومات الحالية:`
            : `I curated the best multi-device setup within your **${formatStorePrice(targetSar)}** budget with active store discounts:`,
          budgetSummary: {
            targetBudget: targetSar,
            totalPrice: runningTotal,
            totalSaved,
            note: isAr
              ? `إجمالي الباقة: ${formatStorePrice(runningTotal)} (توفير ${formatStorePrice(totalSaved)} من العروض الحالية)`
              : `Bundle total: ${formatStorePrice(runningTotal)} (Save ${formatStorePrice(totalSaved)} with current deals)`,
          },
          products: bundle,
        };
      }

      const matches = recommend(rawMsg);
      return {
        mode: "general",
        reply: matches.length ? copy.matches : copy.noMatches,
        products: matches,
      };
    };
    const submitMessage = async (text, focusInput = !mobileAssistantQuery.matches) => {
      if (isSubmitting) return;
      const rawMessage = String(text || "").trim();
      const attachedImage = pendingImageDataUrl;
      const attachedMeta = { ...pendingImageMeta };
      if (!rawMessage && !attachedImage) return;

      const displayMessage =
        rawMessage ||
        (language === "ar"
          ? "حلّل صورة هذه الغرفة واذكر ما ينقصها مع العروض المتوفرة"
          : "Analyze this room setup photo and show what is missing with current deals");

      welcome.hidden = true;
      dialog.classList.add("is-chatting");
      addMessage(displayMessage, "user", [], { userImage: attachedImage });
      chatHistory.push({ role: "user", text: displayMessage });

      form.reset();
      clearPendingImage();
      if (focusInput) input.focus({ preventScroll: true });

      isSubmitting = true;
      const loadingBubble = document.createElement("article");
      loadingBubble.className = "shop-ai-message is-assistant is-loading";
      loadingBubble.innerHTML = `<span class="shop-ai-author">${copy.assistant}</span><div class="shop-ai-typing"><span class="shop-ai-typing-dot"></span><span class="shop-ai-typing-dot"></span><span class="shop-ai-typing-dot"></span><span>${copy.analyzing}</span></div>`;
      thread.append(loadingBubble);
      thread.scrollTop = thread.scrollHeight;

      const allProducts = window.NoursData?.products || [];
      const catalogPayload = allProducts.map((p) => {
        const loc = window.NoursData?.localizeProduct?.(p, language) || p;
        return {
          id: p.id,
          name: loc.name || p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          oldPrice: p.oldPrice || null,
          rating: p.rating,
          reviews: p.reviews,
          description: loc.description?.[language] || p.description?.en || "",
          features: loc.features?.[language] || p.features?.en || [],
        };
      });

      try {
        const payloadBody = JSON.stringify({
          message: displayMessage,
          imageDataUrl: attachedImage,
          imageMeta: attachedMeta,
          language,
          catalog: catalogPayload,
          history: chatHistory.slice(-6),
        });
        const endpoints = [];
        const sbConfig = window.RUQO_SUPABASE_CONFIG;
        if (sbConfig?.url) {
          endpoints.push({
            url: `${sbConfig.url}/functions/v1/ai-assistant`,
            headers: {
              "Content-Type": "application/json",
              ...(sbConfig.publishableKey ? { apikey: sbConfig.publishableKey } : {}),
            },
          });
        }
        endpoints.push({
          url: "/api/ai-assistant",
          headers: { "Content-Type": "application/json" },
        });

        let data = null;
        for (const ep of endpoints) {
          try {
            const response = await fetch(ep.url, {
              method: "POST",
              headers: ep.headers,
              body: payloadBody,
            });
            if (!response.ok) continue;
            const parsed = await response.json();
            if (parsed && (parsed.reply || parsed.productIds)) {
              data = parsed;
              break;
            }
          } catch (_) {}
        }
        if (!data) throw new Error("API error");
        loadingBubble.remove();

        const byId = new Map(allProducts.map((p) => [p.id, p]));
        const matchedProducts = (Array.isArray(data.productIds) ? data.productIds : [])
          .map((id) => byId.get(id))
          .filter(Boolean);
        const isPureChat = data.mode === "chat";
        const finalProducts = isPureChat
          ? matchedProducts
          : matchedProducts.length
            ? matchedProducts
            : recommend(displayMessage);

        if (data.mode === "comparison" || data.mode === "room_analysis" || data.comparison || data.roomAnalysis) {
          setExpanded(true);
        }

        addMessage(data.reply || (finalProducts.length ? copy.matches : copy.noMatches), "assistant", finalProducts, {
          roomAnalysis: data.roomAnalysis,
          comparison: data.comparison,
          budgetSummary: data.budgetSummary,
        });
        chatHistory.push({ role: "assistant", text: data.reply || copy.matches });
      } catch (_) {
        loadingBubble.remove();
        const fallback = buildClientSmartResponse(displayMessage, Boolean(attachedImage), attachedMeta);
        if (fallback.mode === "comparison" || fallback.mode === "room_analysis" || fallback.comparison || fallback.roomAnalysis) {
          setExpanded(true);
        }
        addMessage(fallback.reply, "assistant", fallback.products || [], {
          roomAnalysis: fallback.roomAnalysis,
          comparison: fallback.comparison,
          budgetSummary: fallback.budgetSummary,
        });
      } finally {
        isSubmitting = false;
      }
    };

    const suggestions = overlay.querySelector(".shop-ai-suggestions");
    copy.suggestions.forEach((suggestion, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shop-ai-suggestion";
      button.innerHTML = `<i data-lucide="${["scale", "camera", "sparkles"][index] || "sparkles"}" aria-hidden="true"></i><span></span><i data-lucide="arrow-up-right" aria-hidden="true"></i>`;
      button.querySelector("span").textContent = suggestion;
      button.addEventListener("click", () => {
        if (index === 1 && !pendingImageDataUrl) {
          input.value = suggestion;
          fileInput?.click();
          return;
        }
        submitMessage(suggestion);
      });
      suggestions.append(button);
    });

    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file && input.value.trim()) {
        setTimeout(() => {
          if (pendingImageDataUrl) submitMessage(input.value, true);
        }, 120);
      }
    });

    overlay.querySelector(".shop-ai-restart").addEventListener("click", () => {
      thread.querySelectorAll(".shop-ai-message").forEach((message) => message.remove());
      welcome.hidden = false;
      dialog.classList.remove("is-chatting");
      setExpanded(false);
      chatHistory.length = 0;
      clearPendingImage();
      form.reset();
      thread.scrollTop = 0;
      focusAssistant();
    });

    const close = (restoreFocus = true) => {
      if (overlay.hidden) return;
      overlay.hidden = true;
      viewportController?.abort();
      trigger.setAttribute("aria-expanded", "false");
      if (shell) shell.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (restoreFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
    overlay.closeAssistant = close;
    const open = () => {
      if (!overlay.hidden) return;
      closeAllMenus();
      closeSearch();
      previousInert = shell?.inert || false;
      previousOverflow = document.body.style.overflow;
      if (shell) shell.inert = true;
      document.body.style.overflow = "hidden";
      overlay.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      fullViewportHeight = 0;
      viewportWidth = 0;
      viewportController = new AbortController();
      const viewportOptions = { signal: viewportController.signal };
      window.addEventListener("resize", syncAssistantViewport, viewportOptions);
      window.visualViewport?.addEventListener("resize", syncAssistantViewport, viewportOptions);
      window.visualViewport?.addEventListener("scroll", syncAssistantViewport, viewportOptions);
      focusAssistant();
      syncAssistantViewport();
      window.lucide?.createIcons();
    };

    overlay.bindAssistantTrigger = (nextTrigger, bind) => {
      trigger = nextTrigger;
      trigger.setAttribute("aria-expanded", String(!overlay.hidden));
      bind(trigger, "click", open);
    };
    overlay.bindAssistantTrigger(trigger, listen);
    overlay.querySelector(".shop-ai-close").addEventListener("click", () => close());
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitMessage(input.value, true);
    });
    overlay.addEventListener("focusin", syncAssistantViewport);
    overlay.addEventListener("focusout", () => queueMicrotask(syncAssistantViewport));
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        const items = [...dialog.querySelectorAll("button, input, a[href]")].filter((item) => item.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  let disposeSideMenu;
  function setupProductSideMenu() {
    if (location.pathname.includes('/admin/')) return;
    restoreDrawerMovedControls();
    restoreCurrencyDropdowns();
    const language = getLanguage();
    const store = window.NoursStore;
    const defaultLightLogoUrl = new URL('new/li.png', imageDirectory).href;
    const icon = (name) => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
    const escapeHtml = (value) => {
      const node = document.createElement('span');
      node.textContent = String(value ?? '');
      return node.innerHTML;
    };
    const wasOpen = document.querySelector(".product-side-drawer")?.classList.contains("is-open");
    disposeSideMenu?.();
    const controller = new AbortController();
    const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: controller.signal });
    document.body.classList.add("has-store-menu");
    delete document.documentElement.dataset.homeNavigation;
    document.querySelector(".product-side-menu-trigger")?.remove();
    document.querySelector(".product-side-drawer")?.remove();
    document.querySelector(".product-side-drawer-backdrop")?.remove();
    document.querySelector(".wx-mobile-bottom-nav")?.remove();

    const menuTexts = {
      ar: {
        menuLabel: "القائمة",
        sectionsTitle: "أقسام الموقع",
        supportTitle: "الدعم والمساعدة",
        supportNote: "خدمة عملاء ودعم فني على مدار الساعة",
        supportHours: "متاح 24/7",
        home: "الرئيسية",
        products: "كل المنتجات",
        laptops: "اللابتوبات",
        phones: "الهواتف الذكية",
        audio: "الصوتيات",
        wearables: "الساعات الذكية",
        newArrivals: "جديد المتجر",
        deals: "العروض والتخفيضات",
        wishlist: "المفضلة",
        cart: "سلة المشتريات",
        account: "حسابي",
        help: "مركز المساعدة والأسئلة الشائعة",
        shipping: "الشحن والتوصيل السريع",
        warranty: "الضمان والاسترجاع خلال 7 أيام",
        contact: "تواصل مع خدمة العملاء",
        close: "إغلاق القائمة",
      },
      en: {
        menuLabel: "Menu",
        sectionsTitle: "Site Sections",
        supportTitle: "Help & Support",
        supportNote: "24/7 dedicated customer care and assistance",
        supportHours: "Available 24/7",
        home: "Home",
        products: "All Products",
        laptops: "Laptops",
        phones: "Smartphones",
        audio: "Audio",
        wearables: "Wearables",
        newArrivals: "New Arrivals",
        deals: "Exclusive Deals",
        wishlist: "Wishlist",
        cart: "Shopping Bag",
        account: "My Account",
        help: "Help Center & FAQ",
        shipping: "Fast Shipping & Delivery",
        warranty: "2-Year Warranty & 7-Day Returns",
        contact: "Contact Customer Care",
        close: "Close menu",
      },
      fr: {
        menuLabel: "Menu",
        sectionsTitle: "Rubriques du site",
        supportTitle: "Aide & Support",
        supportNote: "Assistance client disponible 24h/24 et 7j/7",
        supportHours: "Disponible 24/7",
        home: "Accueil",
        products: "Tous les produits",
        laptops: "Ordinateurs portables",
        phones: "Smartphones",
        audio: "Audio",
        wearables: "Montres connectées",
        newArrivals: "Nouveautés",
        deals: "Offres exclusives",
        wishlist: "Favoris",
        cart: "Panier",
        account: "Mon compte",
        help: "Centre d'aide et FAQ",
        shipping: "Livraison rapide",
        warranty: "Garantie & Retours",
        contact: "Nous contacter",
        close: "Fermer le menu",
      },
      es: {
        menuLabel: "Menú",
        sectionsTitle: "Secciones del sitio",
        supportTitle: "Ayuda y Soporte",
        supportNote: "Atención al cliente disponible las 24 horas",
        supportHours: "Disponible 24/7",
        home: "Inicio",
        products: "Todos los productos",
        laptops: "Portátiles",
        phones: "Smartphones",
        audio: "Audio",
        wearables: "Relojes inteligentes",
        newArrivals: "Novedades",
        deals: "Ofertas exclusivas",
        wishlist: "Favoritos",
        cart: "Carrito",
        account: "Mi cuenta",
        help: "Centro de ayuda y FAQ",
        shipping: "Envío rápido",
        warranty: "Garantía y devoluciones",
        contact: "Contactar soporte",
        close: "Cerrar menú",
      },
      zh: {
        menuLabel: "菜单",
        sectionsTitle: "网站导航",
        supportTitle: "帮助与支持",
        supportNote: "全天候 24/7 贴心客户服务与支持",
        supportHours: "24/7 在线",
        home: "首页",
        products: "所有商品",
        laptops: "笔记本电脑",
        phones: "智能手机",
        audio: "音频设备",
        wearables: "智能穿戴",
        newArrivals: "新品上市",
        deals: "热销优惠",
        wishlist: "心愿单",
        cart: "购物袋",
        account: "我的账户",
        help: "帮助中心与常见问题",
        shipping: "快速配送",
        warranty: "质保与退换",
        contact: "联系客户支持",
        close: "关闭菜单",
      },
    };

    const mt = menuTexts[language] || menuTexts.en;
    mt.about = { ar: "من نحن", en: "About us", fr: "À propos", es: "Quiénes somos", zh: "关于我们" }[language];
    mt.experiments = {
      ar: "مساحة تجارب",
      en: "Experiment space",
      fr: "Espace d’expérimentation",
      es: "Espacio de experimentación",
      zh: "实验空间",
    }[language] || "Experiment space";
    const storeName = window.RUQO_STORE_SETTINGS?.store_name || "WEEXEY";
    const arrowSymbol = language === "ar" ? "←" : "→";

    const backdrop = document.createElement("div");
    backdrop.className = "product-side-drawer-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "product-side-menu-trigger";
    trigger.setAttribute("aria-label", mt.menuLabel);
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "store-side-menu");
    trigger.title = mt.menuLabel;
    trigger.innerHTML = `
      <span class="side-trigger-handle"></span>
      <span class="side-trigger-icon">${icon("compass")}</span>
      <span class="side-trigger-label">${mt.menuLabel}</span>
      <span class="side-trigger-arrow">‹</span>
    `;

    const drawer = document.createElement("aside");
    drawer.className = "product-side-drawer";
    drawer.id = "store-side-menu";
    drawer.inert = true;
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", mt.sectionsTitle);
    drawer.setAttribute("aria-hidden", "true");
    drawer.dir = language === "ar" ? "rtl" : "ltr";

    drawer.innerHTML = `
      <header class="product-side-drawer-header">
        <a href="/" class="product-side-drawer-brand">
          <img class="brand-logo" src="${defaultLightLogoUrl}" alt="${escapeHtml(storeName)}" />
          <div>
            <strong>${escapeHtml(storeName)}</strong>
            <small>${language === "ar" ? "متجر إلكترونيات فاخر" : "Premium Electronics"}</small>
          </div>
        </a>
        <button type="button" class="product-side-drawer-close" aria-label="${mt.close}">
          ${icon("x")}
        </button>
      </header>

      <div class="product-side-drawer-body">
        <div class="product-side-nav-group">
          <span class="product-side-nav-title">
            <span class="nav-title-icon">${icon("layers")}</span>
            <span>${mt.sectionsTitle}</span>
          </span>
          <nav class="product-side-nav-links">
            <a href="/" class="product-side-link">
              <span class="side-link-icon">${icon("home")}</span>
              <span class="side-link-text">${mt.home}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>
            <a href="/products.html" class="product-side-link">
              <span class="side-link-icon">${icon("grid")}</span>
              <span class="side-link-text">${mt.products}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>
            <div class="product-side-category-pills">
              <a href="/products.html?category=laptops" class="side-cat-pill">
                ${icon("laptop")}<span>${mt.laptops}</span>
              </a>
              <a href="/products.html?category=phones" class="side-cat-pill">
                ${icon("smartphone")}<span>${mt.phones}</span>
              </a>
              <a href="/products.html?category=audio" class="side-cat-pill">
                ${icon("headphones")}<span>${mt.audio}</span>
              </a>
              <a href="/products.html?category=wearables" class="side-cat-pill">
                ${icon("watch")}<span>${mt.wearables}</span>
              </a>
            </div>
            <a href="/#new" class="product-side-link">
              <span class="side-link-icon">${icon("sparkles")}</span>
              <span class="side-link-text">${mt.newArrivals}</span>
              <span class="side-link-badge is-new">${language === "ar" ? "جديد" : "New"}</span>
            </a>
            <a href="/#deals" class="product-side-link">
              <span class="side-link-icon">${icon("tag")}</span>
              <span class="side-link-text">${mt.deals}</span>
              <span class="side-link-badge is-sale">${language === "ar" ? "خصم" : "Sale"}</span>
            </a>
            <a href="/wishlist.html" class="product-side-link">
              <span class="side-link-icon">${icon("heart")}</span>
              <span class="side-link-text">${mt.wishlist}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>
            <a href="/cart.html" class="product-side-link is-cart">
              <span class="side-link-icon">${icon("shopping-bag")}</span>
              <span class="side-link-text">${mt.cart}</span>
              <span class="side-link-badge is-cart" data-cart-count>${store.cartCount()}</span>
            </a>
            <a href="/account.html" class="product-side-link">
              <span class="side-link-icon">${icon("user")}</span>
              <span class="side-link-text">${mt.account}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>
            <a href="/about.html" class="product-side-link">
              <span class="side-link-icon">${icon("info")}</span>
              <span class="side-link-text">${mt.about}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>
            ${store.isLocalDevelopment ? `<a href="/experiments.html" class="product-side-link">
              <span class="side-link-icon">${icon("flask-conical")}</span>
              <span class="side-link-text">${mt.experiments}</span>
              <span class="side-link-arrow">${arrowSymbol}</span>
            </a>` : ""}
          </nav>
        </div>
      </div>

      <footer class="product-side-drawer-footer">
        <div class="product-side-support-head">
          <span class="support-title-icon">${icon("life-buoy")}</span>
          <div>
            <h4>${mt.supportTitle}</h4>
            <small>${mt.supportNote}</small>
          </div>
        </div>
        <div class="product-side-support-links">
          <a href="/support.html" class="support-mini-link">
            ${icon("help-circle")}<span>${mt.help}</span>
          </a>
          <a href="/support.html#delivery" class="support-mini-link">
            ${icon("truck")}<span>${mt.shipping}</span>
          </a>
          <a href="/support.html#warranty" class="support-mini-link">
            ${icon("shield-check")}<span>${mt.warranty}</span>
          </a>
          <a href="/support.html#contact" class="support-mini-link">
            ${icon("phone-call")}<span>${mt.contact}</span>
          </a>
        </div>
        <div class="product-side-support-contact">
          <a href="tel:+966500000000" class="support-contact-chip">
            ${icon("phone")}<span>+966 50 000 0000</span>
          </a>
          <span class="support-hours-badge">
            <span class="pulse-dot"></span>
            <span>${mt.supportHours}</span>
          </span>
        </div>
      </footer>
    `;

    document.body.append(backdrop, trigger, drawer);
    const headerActions = document.querySelector(".site-header .nav-actions, .commerce-header .commerce-actions");
    if (!headerActions) return;
    let experimentsLink = headerActions.querySelector(".dev-experiments-header-link");
    if (store.isLocalDevelopment) {
      if (!experimentsLink) {
        experimentsLink = document.createElement("a");
        experimentsLink.className = "dev-experiments-header-link";
        experimentsLink.href = "/experiments.html";
        headerActions.append(experimentsLink);
      }
      experimentsLink.setAttribute("aria-label", mt.experiments);
      experimentsLink.title = mt.experiments;
      experimentsLink.innerHTML = `${icon("flask-conical")}<span>${mt.experiments}</span>`;
    } else {
      experimentsLink?.remove();
    }
    let assistantTrigger = headerActions.querySelector(".shop-ai-trigger");
    if (!assistantTrigger) {
      assistantTrigger = document.createElement("button");
      assistantTrigger.type = "button";
      assistantTrigger.className = "shop-ai-trigger";
    }
    const assistantLabel = (shopAssistantCopy[language] || shopAssistantCopy.en).trigger;
    assistantTrigger.setAttribute("aria-label", assistantLabel);
    assistantTrigger.setAttribute("aria-expanded", "false");
    assistantTrigger.setAttribute("aria-haspopup", "dialog");
    assistantTrigger.title = assistantLabel;
    assistantTrigger.innerHTML = `${icon("sparkles")}<span class="shop-ai-label">${escapeHtml(assistantLabel)}</span>`;
    const currencyDropdown = headerActions.querySelector(".ruqo-currency-dropdown");
    if (currencyDropdown) {
      let placeholder = currencyDropdownPositions.get(currencyDropdown);
      if (!placeholder?.isConnected) {
        placeholder = document.createComment("currency-dropdown-position");
        currencyDropdown.before(placeholder);
        currencyDropdownPositions.set(currencyDropdown, placeholder);
      }
    }
    const currencyPlaceholder = currencyDropdown && currencyDropdownPositions.get(currencyDropdown);
    const searchButton = headerActions.querySelector("[data-site-search]");
    const cartLink = headerActions.querySelector('.cart-button, a[href*="cart.html"]');
    const wishlistLink = headerActions.querySelector('a[href*="wishlist.html"]');
    const languageDropdown = headerActions.querySelector(".ruqo-lang-dropdown");
    const themeButton = headerActions.querySelector(".theme-toggle:not(.store-menu-theme)");
    const headerControls = [
      searchButton,
      assistantTrigger,
      cartLink,
      wishlistLink,
      currencyPlaceholder,
      currencyDropdown,
      languageDropdown,
      themeButton,
      experimentsLink,
      headerActions.querySelector(".menu-toggle, .commerce-menu"),
    ].filter(Boolean);
    headerControls.forEach((control) => headerActions.append(control));
    const drawerTools = document.createElement("div");
    drawerTools.className = "product-side-drawer-tools";
    const drawerThemeButton = themeButton.cloneNode(false);
    drawerThemeButton.classList.add("store-menu-theme");
    const drawerLanguageSelect = languageDropdown?.querySelector("select[data-language-select]")?.cloneNode(true);
    const drawerCurrencySelect = currencyDropdown?.querySelector("select[data-currency-select]")?.cloneNode(true);
    [drawerLanguageSelect, drawerCurrencySelect].filter(Boolean).forEach((select) => {
      select.removeAttribute("style");
    });
    if (drawerLanguageSelect) drawerLanguageSelect.value = store.getLanguage();
    if (drawerCurrencySelect) drawerCurrencySelect.value = store.getCurrency();
    const drawerWishlist = wishlistLink?.cloneNode(true);
    const drawerCart = cartLink?.cloneNode(true);
    const drawerAssistant = assistantTrigger.cloneNode(false);
    drawerAssistant.innerHTML = icon("sparkles");
    const drawerSearch = searchButton?.cloneNode(false);
    if (drawerSearch) {
      drawerSearch.removeAttribute("data-site-search");
      drawerSearch.innerHTML = icon("search");
    }
    drawer.querySelector(".product-side-drawer-body").prepend(drawerTools);
    drawerTools.append(...[
      drawerThemeButton,
      drawerLanguageSelect,
      drawerCurrencySelect,
      drawerWishlist,
      drawerCart,
      drawerAssistant,
      drawerSearch,
    ].filter(Boolean));
    store.syncDropdowns();
    setupShopAssistant(assistantTrigger, language, listen, store);
    window.lucide?.createIcons();
    const buttons = () => [trigger, ...document.querySelectorAll(".menu-toggle, .commerce-menu")];
    const shell = document.querySelector(".page-shell");
    let previousInert = false;
    let previousOverflow;
    let opener;
    const normalizePath = (path) => path.replace(/index\.html$/, "");
    const currentPath = normalizePath(location.pathname);
    drawer.querySelectorAll(".product-side-link, .side-cat-pill, .support-mini-link").forEach((link) => {
      const target = new URL(link.href);
      const path = normalizePath(target.pathname);
      const active = (path === currentPath && target.search === location.search && target.hash === location.hash)
        || (path === "/products.html" && currentPath === "/product.html" && !target.search)
        || (path === "/cart.html" && currentPath === "/checkout.html");
      if (active) link.setAttribute("aria-current", "page");
    });
    const phone = window.RUQO_STORE_SETTINGS?.support_phone;
    if (phone) {
      const contact = drawer.querySelector(".support-contact-chip");
      contact.href = `tel:${String(phone).replace(/[^+\d]/g, "")}`;
      contact.querySelector("span").textContent = phone;
    }
    buttons().forEach((button) => {
      button.setAttribute("aria-controls", drawer.id);
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", mt.menuLabel);
      button.title = mt.menuLabel;
    });
    const openDrawer = (button = buttons().find((item) => item.getClientRects().length) || trigger) => {
      if (drawer.classList.contains("is-open")) return;
      opener = button;
      closeSearch();
      closeAllMenus();
      previousInert = shell?.inert || false;
      previousOverflow = document.body.style.overflow;
      drawer.inert = false;
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      buttons().forEach((item) => item.setAttribute("aria-expanded", "true"));
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      drawer.querySelector(".product-side-drawer-close").focus({ preventScroll: true });
      if (shell) shell.inert = true;
      store.syncCartCount?.();
    };

    const closeDrawer = (restoreFocus = true) => {
      if (!drawer.classList.contains("is-open")) return;
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      buttons().forEach((item) => item.setAttribute("aria-expanded", "false"));
      if (shell) shell.inert = previousInert;
      if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
      drawer.setAttribute("aria-hidden", "true");
      drawer.inert = true;
      document.body.style.overflow = previousOverflow;
    };

    listen(drawerSearch, "click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeDrawer(false);
      searchButton?.click();
    });
    listen(drawerAssistant, "click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeDrawer(false);
      assistantTrigger.click();
    });
    const syncAssistantExpanded = new MutationObserver(() => {
      const isExpanded = assistantTrigger.getAttribute("aria-expanded") === "true";
      drawerAssistant.setAttribute("aria-expanded", String(isExpanded));
      if (mobileAiButton) {
        mobileAiButton.setAttribute("aria-expanded", String(isExpanded));
        mobileAiButton.classList.toggle("is-active", isExpanded);
        mobileBottomNav.classList.toggle("is-ai-active", isExpanded);
      }
    });
    syncAssistantExpanded.observe(assistantTrigger, { attributes: true, attributeFilter: ["aria-expanded"] });
    controller.signal.addEventListener("abort", () => syncAssistantExpanded.disconnect(), { once: true });

    const bottomNavCopy = {
      en: { home: "Home", shop: "Shop", ai: "AI", cart: "Cart", account: "Account", navLabel: "Mobile navigation" },
      ar: { home: "الرئيسية", shop: "المتجر", ai: "AI", cart: "السلة", account: "حسابي", navLabel: "التنقل السفلي للجوال" },
      fr: { home: "Accueil", shop: "Boutique", ai: "AI", cart: "Panier", account: "Compte", navLabel: "Navigation mobile" },
      es: { home: "Inicio", shop: "Tienda", ai: "AI", cart: "Carrito", account: "Cuenta", navLabel: "Navegación móvil" },
      zh: { home: "首页", shop: "商城", ai: "AI", cart: "购物袋", account: "账户", navLabel: "底部导航" },
    }[language] || { home: "Home", shop: "Shop", ai: "AI", cart: "Cart", account: "Account", navLabel: "Mobile navigation" };

    const isHomeActive = currentPath === "/" || currentPath === "";
    const isShopActive = ["/products.html", "/categories.html", "/product.html"].includes(currentPath);
    const isCartActive = ["/cart.html", "/checkout.html"].includes(currentPath);
    const isAccountActive = ["/account.html", "/wishlist.html"].includes(currentPath);

    const mobileBottomNav = document.createElement("nav");
    mobileBottomNav.className = "wx-mobile-bottom-nav";
    mobileBottomNav.setAttribute("aria-label", bottomNavCopy.navLabel);
    mobileBottomNav.dir = language === "ar" ? "rtl" : "ltr";
    mobileBottomNav.innerHTML = `
      <div class="wx-mobile-bottom-nav__inner">
        <a href="/" class="wx-mobile-bottom-nav__item${isHomeActive ? " is-active" : ""}"${isHomeActive ? ' aria-current="page"' : ""}>
          <span class="wx-mobile-bottom-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.03 2.59a1.5 1.5 0 0 1 1.94 0l7.5 6.36A1.5 1.5 0 0 1 21 10.1v9.4A2.5 2.5 0 0 1 18.5 22h-4a1 1 0 0 1-1-1v-4.5a1.5 1.5 0 0 0-3 0V21a1 1 0 0 1-1 1h-4A2.5 2.5 0 0 1 3 19.5v-9.4a1.5 1.5 0 0 1 .53-1.15l7.5-6.36Z"/>
            </svg>
          </span>
          <span class="wx-mobile-bottom-nav__label">${escapeHtml(bottomNavCopy.home)}</span>
        </a>

        <a href="/products.html" class="wx-mobile-bottom-nav__item${isShopActive ? " is-active" : ""}"${isShopActive ? ' aria-current="page"' : ""}>
          <span class="wx-mobile-bottom-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="2.6"/>
              <rect x="13" y="3" width="8" height="8" rx="2.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2.6"/>
            </svg>
          </span>
          <span class="wx-mobile-bottom-nav__label">${escapeHtml(bottomNavCopy.shop)}</span>
        </a>

        <button type="button" class="wx-mobile-bottom-nav__item wx-mobile-bottom-nav__item--ai" data-mobile-ai-trigger aria-haspopup="dialog" aria-expanded="false" aria-label="${escapeHtml(assistantLabel)}">
          <span class="wx-mobile-bottom-nav__ai-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.5 2.2c.25-.67 1.2-.67 1.45 0l1.48 3.97a3.2 3.2 0 0 0 1.87 1.87l3.97 1.48c.67.25.67 1.2 0 1.45l-3.97 1.48a3.2 3.2 0 0 0-1.87 1.87l-1.48 3.97c-.25.67-1.2.67-1.45 0l-1.48-3.97a3.2 3.2 0 0 0-1.87-1.87L3.18 10.97c-.67-.25-.67-1.2 0-1.45l3.97-1.48a3.2 3.2 0 0 0 1.87-1.87L10.5 2.2Z"/>
              <path d="M18.6 14.4c.15-.4.72-.4.87 0l.64 1.72c.18.48.56.86 1.04 1.04l1.72.64c.4.15.4.72 0 .87l-1.72.64c-.48.18-.86.56-1.04 1.04l-.64 1.72c-.15.4-.72.4-.87 0l-.64-1.72a1.8 1.8 0 0 0-1.04-1.04l-1.72-.64c-.4-.15-.4-.72 0-.87l1.72-.64c.48-.18.86-.56 1.04-1.04l.64-1.72Z"/>
            </svg>
          </span>
          <span class="wx-mobile-bottom-nav__label">${escapeHtml(bottomNavCopy.ai)}</span>
        </button>

        <a href="/cart.html" class="wx-mobile-bottom-nav__item wx-mobile-bottom-nav__item--cart commerce-cart-link${isCartActive ? " is-active" : ""}"${isCartActive ? ' aria-current="page"' : ""}>
          <span class="wx-mobile-bottom-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 6.5a4 4 0 0 1 8 0V7h1.6a2.5 2.5 0 0 1 2.48 2.2l1.12 9A2.5 2.5 0 0 1 18.72 21H5.28a2.5 2.5 0 0 1-2.48-2.8l1.12-9A2.5 2.5 0 0 1 6.4 7H8v-.5Zm2 0V7h4v-.5a2 2 0 1 0-4 0Zm-1.25 4.25a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm8 0a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z"/>
            </svg>
            <span class="wx-mobile-nav-badge" data-cart-count>0</span>
          </span>
          <span class="wx-mobile-bottom-nav__label">${escapeHtml(bottomNavCopy.cart)}</span>
        </a>

        <a href="/account.html" class="wx-mobile-bottom-nav__item${isAccountActive ? " is-active" : ""}"${isAccountActive ? ' aria-current="page"' : ""}>
          <span class="wx-mobile-bottom-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="8" r="4.2"/>
              <path d="M4.2 19.4c0-3.3 3.45-5.6 7.8-5.6s7.8 2.3 7.8 5.6a1.8 1.8 0 0 1-1.8 1.8H6a1.8 1.8 0 0 1-1.8-1.8Z"/>
            </svg>
          </span>
          <span class="wx-mobile-bottom-nav__label">${escapeHtml(bottomNavCopy.account)}</span>
        </a>
      </div>
    `;
    document.body.append(mobileBottomNav);
    const mobileAiButton = mobileBottomNav.querySelector("[data-mobile-ai-trigger]");
    listen(mobileAiButton, "click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeDrawer(false);
      const aiOverlay = document.querySelector(".shop-ai-overlay");
      if (aiOverlay && !aiOverlay.hidden && typeof aiOverlay.closeAssistant === "function") {
        aiOverlay.closeAssistant();
      } else {
        assistantTrigger.click();
      }
    });
    store.syncCartCount?.();

    listen(document, "click", (event) => {
      const button = event.target.closest(".product-side-menu-trigger, .menu-toggle, .commerce-menu");
      if (!button) return;
      event.preventDefault();
      if (drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer(button);
    });

    listen(drawer.querySelector(".product-side-drawer-close"), "click", () => closeDrawer());
    listen(backdrop, "click", () => closeDrawer());
    listen(drawer, "click", (event) => {
      if (event.target.closest("a")) closeDrawer();
    });
    listen(document, "keydown", (event) => {
      if (!drawer.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      } else if (event.key === "Tab") {
        const items = [...drawer.querySelectorAll("a[href], button")].filter((item) => item.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    disposeSideMenu = () => {
      closeDrawer(false);
      controller.abort();
    };
    syncTheme();
    if (wasOpen) openDrawer();
  }

  window.NoursStore = {
    setupProductSideMenu,
    isLocalDevelopment,
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
    convertCurrency,
    convertCurrencyExact,
    productVariants,
    getProductVariant,
    setProductVariant,
    getProductOptionSelections,
    setProductOptionSelections,
    syncDropdowns,
    normalizeSearchText,
  };
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-theme-toggle]")) {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    }
  });
  window.addEventListener("ruqo:currency-updated", syncDropdowns);
  window.addEventListener("ruqo:language-updated", syncDropdowns);
  window.addEventListener("ruqo:store-settings-updated", syncTheme);
  ["ruqo:store-settings-updated", "ruqo:language-updated", "hashchange"].forEach((name) => {
    window.addEventListener(name, () => queueMicrotask(setupProductSideMenu));
  });

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
    document.addEventListener("DOMContentLoaded", setupProductSideMenu);
  } else {
    syncDropdowns();
    setupProductSideMenu();
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
