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
  const setQuantity = (id, quantity) => {
    const next = cart();
    if (quantity > 0) next[id] = Math.min(99, Math.floor(quantity));
    else delete next[id];
    write(keys.cart, next);
    syncCartCount();
    return next;
  };
  const addToCart = (id, quantity = 1) => {
    const next = cart();
    next[id] = Math.min(99, (Number(next[id]) || 0) + quantity);
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
    write(
      keys.language,
      supportedLanguages.includes(language) ? language : "en",
    );
    syncTheme();
  };
  const getTheme = () =>
    read(keys.theme, localStorage.getItem(keys.theme)) === "dark"
      ? "dark"
      : "light";
  const syncTheme = () => {
    const theme = getTheme();
    const language = getLanguage();
    const logoFile = theme === "dark" ? "dark.png" : "ruqo-logo.png";
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("img.brand-logo").forEach((image) => {
      const logoUrl = new URL(logoFile, imageDirectory).href;
      if (image.src !== logoUrl) image.src = logoUrl;
    });
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
    write(keys.theme, theme === "dark" ? "dark" : "light");
    syncTheme();
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
    const currency = read(keys.currency, "SAR");
    return ["SAR", "USD", "EUR"].includes(currency) ? currency : "SAR";
  };
  const setCurrency = (currency) =>
    write(
      keys.currency,
      ["SAR", "USD", "EUR"].includes(currency) ? currency : "SAR",
    );
  const productVariants = () => read(keys.variants, {});
  const getProductVariant = (id) => productVariants()[id] || "";
  const setProductVariant = (id, variant) => {
    const next = productVariants();
    next[id] = variant;
    write(keys.variants, next);
  };
  window.NoursStore = {
    keys,
    supportedLanguages,
    read,
    write,
    cart,
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
  };
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-theme-toggle]")) {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    }
  });
  syncTheme();
})();
