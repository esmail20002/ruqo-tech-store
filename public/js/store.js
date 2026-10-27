(() => {
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
      welcome: "What are you shopping for? Share a product type, feature, or budget and I’ll suggest a few options.",
      placeholder: "Describe what you need...",
      send: "Send message",
      matches: "Here are a few options that match:",
      noMatches: "I couldn’t find a close match. Try another product type, feature, or budget.",
      view: "View product",
      suggestions: ["A phone with a great camera", "A laptop for work", "Noise-cancelling headphones"],
      close: "Close shopping assistant",
      intro: "Your next great find starts here.",
      starters: "A little inspiration",
      note: "Suggestions from the WEEXEY catalog. Check product details before ordering.",
      restart: "Start a new conversation",
      you: "You",
      assistant: "WEEXEY assistant",
    },
    ar: {
      trigger: "تسوّق مع AI",
      title: "مساعد التسوق الذكي",
      subtitle: "أخبرني بما تحتاجه وسأبحث لك في منتجات المتجر.",
      welcome: "ما المنتج الذي تبحث عنه؟ اذكر نوعه أو ميزة تهمك أو ميزانيتك لأقترح خيارات مناسبة.",
      placeholder: "صف ما تبحث عنه...",
      send: "إرسال الرسالة",
      matches: "هذه بعض الخيارات المناسبة:",
      noMatches: "لم أجد تطابقاً قريباً. جرّب وصف نوع المنتج أو ميزته أو ميزانيتك.",
      view: "عرض المنتج",
      suggestions: ["هاتف بكاميرا ممتازة", "لابتوب للعمل", "سماعة بعزل الضوضاء"],
      close: "إغلاق مساعد التسوق",
      intro: "اختيارك القادم يبدأ من هنا.",
      starters: "بماذا نبدأ؟",
      note: "اقتراحات من كتالوج WEEXEY. راجع تفاصيل المنتج قبل الطلب.",
      restart: "بدء محادثة جديدة",
      you: "أنت",
      assistant: "مساعد WEEXEY",
    },
    fr: {
      trigger: "Shop with AI",
      title: "Votre assistant shopping",
      subtitle: "Dites-moi ce qu’il vous faut et je chercherai dans notre catalogue.",
      welcome: "Que recherchez-vous ? Indiquez un type de produit, une caractéristique ou un budget.",
      placeholder: "Décrivez votre besoin...",
      send: "Envoyer",
      matches: "Voici quelques options correspondantes :",
      noMatches: "Aucun résultat proche. Essayez un autre produit, une caractéristique ou un budget.",
      view: "Voir le produit",
      suggestions: ["Un téléphone avec un bon appareil photo", "Un ordinateur pour travailler", "Un casque antibruit"],
      close: "Fermer l’assistant shopping",
      intro: "Votre prochaine découverte commence ici.",
      starters: "Un peu d’inspiration",
      note: "Suggestions du catalogue WEEXEY. Vérifiez les détails avant de commander.",
      restart: "Nouvelle conversation",
      you: "Vous",
      assistant: "Assistant WEEXEY",
    },
    es: {
      trigger: "Shop with AI",
      title: "Tu asistente de compras",
      subtitle: "Cuéntame qué necesitas y buscaré opciones en nuestro catálogo.",
      welcome: "¿Qué estás buscando? Dime el tipo de producto, una característica o tu presupuesto.",
      placeholder: "Describe lo que necesitas...",
      send: "Enviar mensaje",
      matches: "Estas opciones podrían encajarte:",
      noMatches: "No encontré una coincidencia cercana. Prueba con otro producto, característica o presupuesto.",
      view: "Ver producto",
      suggestions: ["Un móvil con buena cámara", "Un portátil para trabajar", "Auriculares con cancelación de ruido"],
      close: "Cerrar asistente de compras",
      intro: "Tu próximo descubrimiento empieza aquí.",
      starters: "Un poco de inspiración",
      note: "Sugerencias del catálogo WEEXEY. Revisa los detalles antes de comprar.",
      restart: "Iniciar una nueva conversación",
      you: "Tú",
      assistant: "Asistente WEEXEY",
    },
    zh: {
      trigger: "AI 选购",
      title: "智能购物助手",
      subtitle: "告诉我你的需求，我会在商店目录中为你查找。",
      welcome: "你想选购什么？请描述商品类型、功能或预算。",
      placeholder: "描述你的需求...",
      send: "发送消息",
      matches: "这些商品可能适合你：",
      noMatches: "没有找到相近商品。试试描述其他类型、功能或预算。",
      view: "查看商品",
      suggestions: ["拍照效果好的手机", "适合办公的笔记本电脑", "降噪耳机"],
      close: "关闭购物助手",
      intro: "从这里发现你的下一件好物。",
      starters: "从这些灵感开始",
      note: "推荐来自 WEEXEY 商品目录。下单前请查看商品详情。",
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
          <div class="shop-ai-composer">
            <label class="shop-ai-input-wrap"><input name="message" aria-label="${copy.placeholder}" autocomplete="off" maxlength="500" placeholder="${copy.placeholder}" required /></label>
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
    const welcome = overlay.querySelector(".shop-ai-welcome");
    const shell = document.querySelector(".page-shell");
    let previousInert = false;
    let previousOverflow = "";
    let viewportController;
    let fullViewportHeight = 0;
    let viewportWidth = 0;
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

    const addMessage = (text, role, products = []) => {
      const message = document.createElement("article");
      message.className = `shop-ai-message is-${role}`;
      const author = document.createElement("span");
      author.className = "shop-ai-author";
      author.textContent = role === "user" ? copy.you : copy.assistant;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      message.append(author, paragraph);
      if (products.length) {
        const results = document.createElement("div");
        results.className = "shop-ai-results";
        products.forEach((product) => {
          const localized = window.NoursData?.localizeProduct?.(product, language) || product;
          const link = document.createElement("a");
          link.className = "shop-ai-product";
          link.href = `/product.html?id=${encodeURIComponent(product.id)}`;
          const image = document.createElement("img");
          image.src = product.image;
          image.alt = "";
          image.loading = "lazy";
          const details = document.createElement("span");
          details.className = "shop-ai-product-details";
          const name = document.createElement("strong");
          name.textContent = localized.name || product.name;
          const description = document.createElement("small");
          description.textContent = product.brand;
          const price = document.createElement("span");
          price.className = "shop-ai-product-price";
          const currency = store.getCurrency();
          price.textContent = new Intl.NumberFormat(
            language === "zh" ? "zh-CN" : ({ ar: "ar-SA", fr: "fr-FR", es: "es-ES" }[language] || "en-US"),
            { style: "currency", currency, maximumFractionDigits: currency === "SAR" ? 0 : 2 },
          ).format(store.convertCurrency(product.price, "SAR", currency));
          const action = document.createElement("span");
          action.className = "shop-ai-product-action";
          action.textContent = copy.view;
          details.append(description, name, price);
          link.append(image, details, action);
          results.append(link);
        });
        message.append(results);
      }
      thread.append(message);
      thread.scrollTop = thread.scrollHeight;
      window.lucide?.createIcons();
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

    const submitMessage = (text, focusInput = !mobileAssistantQuery.matches) => {
      const message = text.trim();
      if (!message) return;
      welcome.hidden = true;
      dialog.classList.add("is-chatting");
      addMessage(message, "user");
      const matches = recommend(message);
      addMessage(matches.length ? copy.matches : copy.noMatches, "assistant", matches);
      form.reset();
      if (focusInput) input.focus({ preventScroll: true });
    };

    const suggestions = overlay.querySelector(".shop-ai-suggestions");
    copy.suggestions.forEach((suggestion, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shop-ai-suggestion";
      button.innerHTML = `<i data-lucide="${["smartphone", "laptop", "headphones"][index]}" aria-hidden="true"></i><span></span><i data-lucide="arrow-up-right" aria-hidden="true"></i>`;
      button.querySelector("span").textContent = suggestion;
      button.addEventListener("click", () => submitMessage(suggestion));
      suggestions.append(button);
    });
    overlay.querySelector(".shop-ai-restart").addEventListener("click", () => {
      thread.querySelectorAll(".shop-ai-message").forEach((message) => message.remove());
      welcome.hidden = false;
      dialog.classList.remove("is-chatting");
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
      drawerAssistant.setAttribute("aria-expanded", assistantTrigger.getAttribute("aria-expanded") || "false");
    });
    syncAssistantExpanded.observe(assistantTrigger, { attributes: true, attributeFilter: ["aria-expanded"] });
    controller.signal.addEventListener("abort", () => syncAssistantExpanded.disconnect(), { once: true });

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
