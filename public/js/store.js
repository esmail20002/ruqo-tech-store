(() => {
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
    return next;
  };
  const addToCart = (id, quantity = 1) => {
    const next = cart();
    next[id] = Math.min(99, (Number(next[id]) || 0) + quantity);
    write(keys.cart, next);
    return next;
  };
  const removeFromCart = (id) => setQuantity(id, 0);
  const cartCount = () =>
    Object.values(cart()).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const wishlist = () => read(keys.wishlist, []);
  const toggleWishlist = (id) => {
    const next = new Set(wishlist());
    next.has(id) ? next.delete(id) : next.add(id);
    write(keys.wishlist, [...next]);
    return [...next];
  };
  const setWishlist = (ids) => write(keys.wishlist, [...new Set(ids)]);
  const getLanguage = () =>
    read(keys.language, localStorage.getItem(keys.language)) === "ar"
      ? "ar"
      : "en";
  const setLanguage = (language) =>
    {
      write(keys.language, language === "ar" ? "ar" : "en");
      syncTheme();
    };
  const getTheme = () =>
    read(keys.theme, localStorage.getItem(keys.theme)) === "dark"
      ? "dark"
      : "light";
  const syncTheme = () => {
    const theme = getTheme();
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const isDark = theme === "dark";
      const language = getLanguage();
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute(
        "aria-label",
        language === "ar"
          ? isDark
            ? "تفعيل الوضع الفاتح"
            : "تفعيل الوضع الداكن"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode",
      );
      button.title =
        language === "ar"
          ? isDark
            ? "الوضع الفاتح"
            : "الوضع الداكن"
          : isDark
            ? "Light mode"
            : "Dark mode";
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
    read,
    write,
    cart,
    setQuantity,
    addToCart,
    removeFromCart,
    cartCount,
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
