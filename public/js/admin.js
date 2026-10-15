(() => {
  const config = window.RUQO_SUPABASE_CONFIG;
  const clientFactory = window.supabase?.createClient;
  const isLocalDevHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const isLocalDevMode = isLocalDevHost && new URLSearchParams(window.location.search).get("dev") === "1";
  let localDevCredentials = null;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const languages = ["en", "fr", "es", "zh", "ar"];
  const productBenefitIconOptions = [
    ["truck", "Delivery truck"],
    ["shield-check", "Protection"],
    ["rotate-ccw", "Returns"],
    ["package-check", "Package"],
    ["badge-check", "Verified"],
    ["headphones", "Support"],
    ["credit-card", "Payment"],
    ["lock-keyhole", "Security"],
    ["circle-check", "Check"],
    ["wrench", "Service"],
    ["heart", "Care"],
    ["clock-3", "Time"],
  ];
  const defaultProductBenefits = [
    {
      icon: "truck",
      title_translations: { en: "Estimated delivery", fr: "Livraison estimée", es: "Entrega estimada", zh: "预计送达", ar: "موعد التوصيل المتوقع" },
      description_translations: { en: "1–2 business days", fr: "1 à 2 jours ouvrés", es: "1–2 días laborables", zh: "1 至 2 个工作日", ar: "خلال يوم إلى يومي عمل" },
    },
    {
      icon: "shield-check",
      title_translations: { en: "2-year warranty", fr: "Garantie de 2 ans", es: "Garantía de 2 años", zh: "两年保修", ar: "ضمان سنتين" },
      description_translations: { en: "Secure checkout", fr: "Paiement sécurisé", es: "Pago seguro", zh: "安全结账", ar: "إتمام شراء آمن" },
    },
    {
      icon: "rotate-ccw",
      title_translations: { en: "7-day return window", fr: "Retours sous 7 jours", es: "Devoluciones en 7 días", zh: "七天退货期限", ar: "استرجاع خلال 7 أيام" },
      description_translations: { en: "7-day returns", fr: "Retours sous 7 jours", es: "Devoluciones en 7 días", zh: "七天退货", ar: "استرجاع خلال 7 أيام" },
    },
  ];
  const currency = new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  });
  const categoryLabels = {
    phones: "Phones",
    laptops: "Laptops",
    audio: "Audio",
    wearables: "Wearables",
  };
  const loginScreen = $("#login-screen");
  const adminApp = $("#admin-app");
  const loginForm = $("#login-form");
  const loginError = $("#login-error");
  const localDevLoginNote = $("#local-dev-login-note");
  const localDevNotice = $("#local-dev-notice");
  const forgotPasswordButton = $("#forgot-password");
  const passwordRecoveryForm = $("#password-recovery-form");
  const passwordRecoveryFeedback = $("#password-recovery-feedback");
  const productForm = $("#product-form");
  const productDialog = $("#product-dialog");
  const productError = $("#product-form-error");
  const categoryForm = $("#category-form");
  const categoryDialog = $("#category-dialog");
  const categoryError = $("#category-form-error");
  const promotionForm = $("#promotion-form");
  const promotionDialog = $("#promotion-dialog");
  const bannerForm = $("#banner-form");
  const bannerDialog = $("#banner-dialog");
  const brandSettingsForm = $("#brand-settings-form");
  const brandSettingsError = $("#brand-settings-error");
  const homepageShowcaseForm = $("#homepage-showcase-form");
  const homepageShowcaseError = $("#home-showcase-error");
  const homepageShowcaseDialog = $("#homepage-showcase-dialog");
  const homeSpotlightsBody = $("#home-spotlights-body");
  const productSearch = $("#product-search");
  const productsBody = $("#products-body");
  const recentProductsBody = $("#recent-products-body");
  const productBenefitRows = $("#product-benefit-rows");
  const productsEmpty = $("#products-empty");
  let client;
  let currentUser;
  let localDemoMode = false;
  let products = [];
  let currentRoles = [];
  let categories = [];
  let orders = [];
  let contactMessages = [];
  let promotions = [];
  let banners = [];
  let newsletterSubscribers = [];
  let homepageSpotlights = [];
  let brandSettings = {};
  let editingSlug = null;
  let editingCategorySlug = null;
  let editingSpotlightSlug = null;
  let editingPromotionId = null;
  let editingBannerId = null;
  let toastTimer;

  function setTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("nours-theme", JSON.stringify(nextTheme));
      document.cookie = `nours-theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    const button = $("#admin-theme-toggle");
    if (button) {
      button.setAttribute("aria-pressed", String(nextTheme === "dark"));
      button.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
      button.innerHTML = `<i data-lucide="${nextTheme === "dark" ? "sun" : "moon"}" aria-hidden="true"></i>`;
      window.lucide?.createIcons();
    }
  }

  function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = !message;
  }

  function showPasswordRecovery(message, isError = false) {
    passwordRecoveryFeedback.textContent = message;
    passwordRecoveryFeedback.hidden = !message;
    passwordRecoveryFeedback.classList.toggle("is-success", Boolean(message) && !isError);
  }

  function showProductError(message) {
    productError.textContent = message;
    productError.hidden = !message;
  }

  function toast(message) {
    const node = $("#admin-toast");
    node.textContent = message;
    node.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
  }

  function formatPrice(value) {
    return currency.format(Number(value) || 0);
  }

  function translateName(product) {
    return product.name_translations?.en || product.slug;
  }

  function categoryName(slug) {
    return categories.find((category) => category.slug === slug)?.name_translations?.en || categoryLabels[slug] || slug;
  }

  function productIsAvailable(product) {
    if (!product.in_stock) return false;
    const activeVariants = (product.variants || []).filter((variant) => variant.is_active);
    if (!activeVariants.length || activeVariants.some((variant) => variant.stock_quantity === null || variant.stock_quantity === undefined)) return true;
    return activeVariants.some((variant) => Number(variant.stock_quantity) > 0);
  }

  function setView(view) {
    const allowedViews = new Set(["overview"]);
    if (currentRoles.some((role) => ["owner", "admin", "catalog_manager"].includes(role))) {
      allowedViews.add("products");
      allowedViews.add("categories");
    }
    if (currentRoles.some((role) => ["owner", "admin", "order_manager"].includes(role))) allowedViews.add("orders");
    if (currentRoles.some((role) => ["owner", "admin", "order_manager"].includes(role))) allowedViews.add("messages");
    if (currentRoles.some((role) => ["owner", "admin", "marketing_manager"].includes(role))) {
      allowedViews.add("promotions");
      allowedViews.add("banners");
      allowedViews.add("audience");
    }
    if (currentRoles.some((role) => ["owner", "admin"].includes(role))) {
      allowedViews.add("settings");
      allowedViews.add("homepage-showcase");
    }
    const selectedView = allowedViews.has(view) ? view : "overview";
    $$('[data-admin-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.adminPanel !== selectedView;
    });
    $$('[data-admin-view]').forEach((button) => {
      const active = button.dataset.adminView === selectedView;
      button.hidden = !allowedViews.has(button.dataset.adminView);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    $("#breadcrumb-current").textContent = {
      overview: "Overview",
      products: "Products",
      categories: "Categories",
      orders: "Orders",
      messages: "Messages",
      promotions: "Offers",
      banners: "Banners",
      audience: "Newsletter audience",
      settings: "Store settings",
      "homepage-showcase": "Homepage spotlight",
    }[selectedView];
  }

  async function requireCatalogRole(user) {
    const { data, error } = await client
      .from("staff_roles")
      .select("role")
      .eq("user_id", user.id);
    if (error) throw error;
    const allowedRoles = new Set([
      "owner",
      "admin",
      "catalog_manager",
      "order_manager",
      "marketing_manager",
    ]);
    const roles = (data || []).map((entry) => entry.role);
    if (!roles.some((role) => allowedRoles.has(role))) {
      await client.auth.signOut();
      throw new Error("This account does not have catalog-management access.");
    }
    return roles;
  }

  async function authorizeUser(user) {
    loginError.hidden = true;
    try {
      const roles = await requireCatalogRole(user);
      currentUser = user;
      currentRoles = roles;
      loginScreen.hidden = true;
      adminApp.hidden = false;
      $("#admin-user").textContent = user.email || "RUQO staff";
      $(".connection-indicator").title = `Authenticated as ${roles.join(", ")}`;
      setView("overview");
      await loadAdminData();
    } catch (error) {
      adminApp.hidden = true;
      loginScreen.hidden = false;
      showLoginError(
        error.message?.includes("catalog-management access")
          ? error.message
          : "Could not verify this account's store role. Check your connection and try again.",
      );
    }
  }

  function renderProductRow(product, recent = false) {
    const row = document.createElement("tr");
    const productCell = document.createElement("td");
    const productWrap = document.createElement("div");
    productWrap.className = "admin-product-cell";
    const image = document.createElement("img");
    image.src = product.external_image_url || "/images/ruqo-logo.png";
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => {
      image.src = "/images/ruqo-logo.png";
    };
    const meta = document.createElement("div");
    meta.className = "admin-product-meta";
    const name = document.createElement("strong");
    name.textContent = translateName(product);
    const slug = document.createElement("small");
    slug.textContent = product.slug;
    meta.append(name, slug);
    productWrap.append(image, meta);
    productCell.append(productWrap);
    row.append(productCell);

    const category = document.createElement("td");
    category.textContent = categoryName(product.category_slug);
    row.append(category);
    const price = document.createElement("td");
    price.textContent = formatPrice(product.price);
    row.append(price);

    if (!recent) {
      const badge = document.createElement("td");
      badge.textContent = product.badge || "—";
      row.append(badge);
    }

    const status = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `admin-status ${product.is_active ? "is-published" : "is-draft"}`;
    statusBadge.textContent = product.is_active ? "Published" : "Draft";
    status.append(statusBadge);
    row.append(status);
    const stock = document.createElement("td");
    const stockBadge = document.createElement("span");
    const activeVariants = (product.variants || []).filter((variant) => variant.is_active);
    const trackedVariants = activeVariants.filter((variant) => variant.stock_quantity !== null && variant.stock_quantity !== undefined);
    const exactStock = activeVariants.length > 0 && trackedVariants.length === activeVariants.length
      ? trackedVariants.reduce((sum, variant) => sum + Number(variant.stock_quantity), 0)
      : null;
    const isAvailable = productIsAvailable(product);
    stockBadge.className = `admin-status ${isAvailable ? "is-published" : "is-out"}`;
    stockBadge.textContent = !isAvailable
      ? "Out of stock"
      : exactStock === null
        ? "In stock"
        : `${exactStock} units`;
    stock.append(stockBadge);
    row.append(stock);

    if (!recent) {
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-row-action";
      edit.setAttribute("aria-label", `Edit ${translateName(product)}`);
      edit.title = "Edit product";
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.addEventListener("click", () => openProduct(product.slug));
      actions.append(edit);
      row.append(actions);
    }
    return row;
  }

  function renderCatalog() {
    const query = productSearch.value.trim().toLocaleLowerCase();
    const filtered = products.filter((product) =>
      `${product.slug} ${product.brand} ${translateName(product)}`
        .toLocaleLowerCase()
        .includes(query),
    );
    productsBody.replaceChildren(...filtered.map((product) => renderProductRow(product)));
    recentProductsBody.replaceChildren(...products.slice(0, 5).map((product) => renderProductRow(product, true)));
    productsEmpty.hidden = filtered.length > 0;
    $("#stat-products").textContent = String(products.length);
    $("#stat-published").textContent = String(products.filter((product) => product.is_active).length);
    $("#stat-out-of-stock").textContent = String(products.filter((product) => !productIsAvailable(product)).length);
    window.lucide?.createIcons();
  }

  function renderCategories() {
    const rows = categories.map((category) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      name.textContent = category.name_translations?.en || category.slug;
      row.append(name);
      appendTextCell(row, category.slug);
      appendTextCell(row, category.sort_order);
      const status = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `admin-status ${category.is_active ? "is-published" : "is-draft"}`;
      badge.textContent = category.is_active ? "Published" : "Draft";
      status.append(badge);
      row.append(status);
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-row-action";
      edit.title = "Edit category";
      edit.setAttribute("aria-label", `Edit ${name.textContent}`);
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.addEventListener("click", () => openCategory(category.slug));
      actions.append(edit);
      row.append(actions);
      return row;
    });
    $("#categories-body").replaceChildren(...rows);
    $("#categories-empty").hidden = categories.length > 0;
    window.lucide?.createIcons();
  }

  async function loadCatalog() {
    const [
      { data: categoryRows, error: categoryError },
      { data: productRows, error: productError },
      { data: variantRows, error: variantError },
    ] = await Promise.all([
      client.from("categories").select("slug, name_translations, description_translations, sort_order, is_active").order("sort_order"),
      client.from("products").select("slug, category_slug, brand, name_translations, description_name_translations, description_translations, product_benefits, price, compare_at_price, sale_price, sale_starts_at, sale_ends_at, currency, badge, in_stock, is_active, is_featured, sort_order, external_image_url").order("sort_order", { ascending: false }),
      client.from("product_variants").select("variant_key, product_slug, option_group, option_value, option_label_translations, sku, price_adjustment, stock_quantity, is_active, sort_order").order("sort_order"),
    ]);
    if (categoryError) throw categoryError;
    if (productError) throw productError;
    if (variantError) throw variantError;
    categories = categoryRows || [];
    const variantsByProduct = new Map();
    for (const variant of variantRows || []) {
      if (!variantsByProduct.has(variant.product_slug)) variantsByProduct.set(variant.product_slug, []);
      variantsByProduct.get(variant.product_slug).push(variant);
    }
    products = (productRows || []).map((product) => ({
      ...product,
      variants: variantsByProduct.get(product.slug) || [],
    }));
    renderCatalog();
    renderCategories();
    renderHomepageSpotlights();
  }

  function canManage(roles) {
    return roles.some((role) => currentRoles.includes(role));
  }

  async function loadAdminData() {
    const tasks = [];
    if (canManage(["owner", "admin", "catalog_manager"])) tasks.push(loadCatalog());
    if (canManage(["owner", "admin", "order_manager"])) tasks.push(loadOrders());
    if (canManage(["owner", "admin", "order_manager"])) tasks.push(loadContactMessages());
    if (canManage(["owner", "admin", "marketing_manager"])) {
      tasks.push(loadPromotions(), loadBanners(), loadNewsletterSubscribers());
    }
    if (canManage(["owner", "admin"])) tasks.push(loadBrandSettings(), loadHomepageSpotlights());
    const results = await Promise.allSettled(tasks);
    results.filter((result) => result.status === "rejected").forEach((result) => {
      showToast(`Could not load a section: ${result.reason?.message || "Unknown error"}`);
    });
  }

  async function loadHomepageSpotlights() {
    const { data, error } = await client
      .from("homepage_spotlight_items")
      .select("id, product_slug, sort_order, bottom_detail, sale_enabled, sale_price, sale_starts_at, sale_ends_at, is_active, products(slug, brand, name_translations, price, sale_price, sale_starts_at, sale_ends_at, external_image_url)")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    homepageSpotlights = data || [];
    renderHomepageSpotlights();
  }

  function renderHomepageSpotlights() {
    if (!homeSpotlightsBody) return;
    const rows = homepageSpotlights.map((item) => {
      const product = item.products || products.find((entry) => entry.slug === item.product_slug);
      const row = document.createElement("tr");
      const productCell = document.createElement("td");
      const productName = document.createElement("strong");
      productName.textContent = product?.name_translations?.en || item.product_slug;
      const slug = document.createElement("small");
      slug.textContent = `${product?.brand || ""} · ${item.product_slug}`;
      slug.style.display = "block";
      productCell.append(productName, slug);
      row.append(productCell);
      appendTextCell(row, formatPrice(product?.price));
      appendTextCell(row, item.sale_enabled ? `${formatPrice(item.sale_price)} offer` : "No discount");
      appendTextCell(row, item.sale_enabled ? `${formatDateTime(item.sale_starts_at)} – ${formatDateTime(item.sale_ends_at)}` : "—");
      appendTextCell(row, item.sort_order);
      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `admin-status ${item.is_active ? "is-published" : "is-draft"}`;
      status.textContent = item.is_active ? "Published" : "Paused";
      statusCell.append(status);
      row.append(statusCell);
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-row-action";
      edit.title = "Edit spotlight product";
      edit.setAttribute("aria-label", `Edit ${productName.textContent}`);
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.addEventListener("click", () => openHomepageSpotlight(item.product_slug));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "admin-row-action is-danger";
      remove.title = "Remove from homepage spotlight";
      remove.setAttribute("aria-label", `Remove ${productName.textContent} from homepage spotlight`);
      remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
      remove.addEventListener("click", () => deleteHomepageSpotlight(item.product_slug));
      actions.append(edit, remove);
      row.append(actions);
      return row;
    });
    homeSpotlightsBody.replaceChildren(...rows);
    $("#home-spotlights-empty").hidden = homepageSpotlights.length > 0;
    window.lucide?.createIcons();
  }

  function enterLocalDemo() {
    localDemoMode = true;
    currentUser = { id: "local-demo", email: "admin@localhost" };
    currentRoles = ["owner", "admin", "catalog_manager", "order_manager", "marketing_manager"];
    categories = [
      { slug: "phones", name_translations: { en: "Phones" }, sort_order: 1, is_active: true },
      { slug: "laptops", name_translations: { en: "Laptops" }, sort_order: 2, is_active: true },
      { slug: "audio", name_translations: { en: "Audio" }, sort_order: 3, is_active: true },
      { slug: "wearables", name_translations: { en: "Wearables" }, sort_order: 4, is_active: true },
    ];
    products = [
      { slug: "macbook-pro", brand: "Apple", category_slug: "laptops", name_translations: { en: "MacBook Pro 14 M4" }, price: 5700, compare_at_price: 9999, badge: "popular", in_stock: true, is_active: true, is_featured: true, sort_order: 4, external_image_url: "/images/ruqo-logo.png", variants: [{ variant_key: "macbook-pro-storage-1tb", option_group: "storage", option_value: "1TB", sku: "MBP-1TB", price_adjustment: 0, stock_quantity: 3, is_active: true }] },
      { slug: "galaxy-s25", brand: "Samsung", category_slug: "phones", name_translations: { en: "Galaxy S25 Ultra" }, price: 4499, compare_at_price: null, badge: "new", in_stock: true, is_active: true, is_featured: false, sort_order: 3, external_image_url: "/images/ruqo-logo.png", variants: [] },
      { slug: "airpods-pro", brand: "Apple", category_slug: "audio", name_translations: { en: "AirPods Pro" }, price: 899, compare_at_price: null, badge: "sale", in_stock: true, is_active: false, is_featured: false, sort_order: 2, external_image_url: "/images/ruqo-logo.png", variants: [] },
      { slug: "apple-watch", brand: "Apple", category_slug: "wearables", name_translations: { en: "Apple Watch" }, price: 1299, compare_at_price: null, badge: null, in_stock: false, is_active: true, is_featured: false, sort_order: 1, external_image_url: "/images/ruqo-logo.png", variants: [] },
    ];
    orders = [
      { id: "local-order-1", order_number: "RUQ-DEMO-001", customer_name: "Demo Customer", customer_email: "customer@example.com", customer_phone: "+966500000000", status: "pending", payment_method: "cash_on_delivery", payment_status: "pending", currency: "SAR", total: 5700, created_at: new Date().toISOString() },
    ];
    promotions = [{ id: "local-promo-1", name: "Demo weekend offer", title_translations: { en: "Weekend offer" }, coupon_code: "DEMO15", discount_type: "percentage", discount_value: 15, minimum_order: 500, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), is_active: true }];
    banners = [{ id: "local-banner-1", name: "Demo campaign", placement: "home_promo", title_translations: { en: "Demo campaign" }, image_path: null, starts_at: null, ends_at: null, is_active: true }];
    contactMessages = [{ id: "local-message-1", customer_name: "Demo Customer", customer_email: "customer@example.com", message: "Sample support message for local preview.", language_code: "en", status: "new", created_at: new Date().toISOString() }];
    newsletterSubscribers = [{ email: "subscriber@example.com", is_active: true, subscribed_at: new Date().toISOString() }];
    brandSettings = {
      store_name: "RUQO TECH",
      logo_path: null,
      support_email: "hello@example.com",
      support_phone: "+966500000000",
      free_shipping_threshold: 299,
      standard_shipping_fee: 25,
      brand_color: "#167c72",
    };
    homepageSpotlights = [
      { id: "local-spotlight-1", product_slug: "macbook-pro", sort_order: 1, bottom_detail: "feature", sale_enabled: true, sale_price: 4999, sale_starts_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), sale_ends_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), is_active: true },
      { id: "local-spotlight-2", product_slug: "galaxy-s25", sort_order: 2, bottom_detail: "rating", sale_enabled: false, sale_price: null, sale_starts_at: null, sale_ends_at: null, is_active: true },
    ];
    for (const field of ["store_name", "support_email", "support_phone", "free_shipping_threshold", "brand_color"]) {
      brandSettingsForm.elements[field].value = brandSettings[field];
    }
    brandSettingsForm.elements.delivery_fee.value = brandSettings.standard_shipping_fee;
    $("#brand-logo-preview").src = "/images/ruqo-logo.png";
    renderHomepageSpotlights();
    loginScreen.hidden = true;
    adminApp.hidden = false;
    localDevNotice.hidden = false;
    $("#admin-user").textContent = "Local demo · read only";
    $(".connection-indicator").innerHTML = "<i></i> Local demo · no Supabase writes";
    setView("overview");
    renderCatalog();
    renderCategories();
    renderOrders();
    renderPromotions();
    renderBanners();
    renderContactMessages();
    renderNewsletterSubscribers();
    $$("#admin-app button, #admin-app input, #admin-app select, #admin-app textarea, dialog button, dialog input, dialog select, dialog textarea")
      .filter((element) => !element.matches("[data-admin-view], #admin-theme-toggle, #sign-out"))
      .forEach((element) => { element.disabled = true; });
    window.lucide?.createIcons();
  }

  function bindLocalDevEvents() {
    localDevLoginNote.textContent = `Local development only · username: ${localDevCredentials.username} · password: ${localDevCredentials.password}`;
    localDevLoginNote.hidden = false;
    forgotPasswordButton.hidden = true;
    $$('[data-admin-view]').forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.adminView));
    });
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showLoginError("");
      const username = String(loginForm.elements.email.value || "").trim().toLowerCase();
      const password = String(loginForm.elements.password.value || "");
      if (username !== localDevCredentials.username || password !== localDevCredentials.password) {
        showLoginError("Local preview sign-in failed. Check the local demo credentials.");
        return;
      }
      enterLocalDemo();
    });
    $("#sign-out").addEventListener("click", () => {
      localDemoMode = false;
      adminApp.hidden = true;
      localDevNotice.hidden = true;
      loginScreen.hidden = false;
      loginForm.reset();
    });
    $("#admin-theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  function getBrandLogoUrl(logoPath) {
    return logoPath
      ? client.storage.from("store-assets").getPublicUrl(logoPath).data.publicUrl
      : "/images/ruqo-logo.png";
  }

  async function loadBrandSettings() {
    const { data, error } = await client
      .from("store_settings")
      .select("setting_value")
      .eq("setting_key", "storefront")
      .maybeSingle();
    if (error) throw error;
    brandSettings = data?.setting_value || {
      store_name: "RUQO TECH",
      logo_path: null,
      support_email: "",
      support_phone: "",
      free_shipping_threshold: 299,
      standard_shipping_fee: 25,
      brand_color: "#167c72",
    };
    for (const field of ["store_name", "support_email", "support_phone", "free_shipping_threshold", "brand_color"]) {
      brandSettingsForm.elements[field].value = brandSettings[field] ?? "";
    }
    brandSettingsForm.elements.delivery_fee.value = brandSettings.standard_shipping_fee ?? 25;
    $("#brand-logo-preview").src = getBrandLogoUrl(brandSettings.logo_path);
    brandSettingsForm.dataset.resetLogo = "false";
  }

  function populateHomepageSpotlightOptions(selectedSlug = "") {
    const select = homepageShowcaseForm.elements.product_slug;
    const options = [new Option("Choose a published product", "")];
    const existingSlugs = new Set(homepageSpotlights.map((item) => item.product_slug));
    for (const product of products.filter((item) => item.is_active)) {
      if (existingSlugs.has(product.slug) && product.slug !== selectedSlug) continue;
      options.push(new Option(`${translateName(product)} · ${product.slug}`, product.slug));
    }
    select.replaceChildren(...options);
    select.value = selectedSlug;
    updateHomepageShowcasePreview();
  }

  function openNewHomepageSpotlight() {
    editingSpotlightSlug = null;
    homepageShowcaseForm.reset();
    homepageShowcaseForm.elements.sort_order.value = String(homepageSpotlights.length + 1);
    homepageShowcaseForm.elements.is_active.checked = true;
    homepageShowcaseForm.elements.is_active.checked = true;
    populateHomepageSpotlightOptions();
    $("#home-showcase-dialog-title").textContent = "Add product to spotlight";
    $("#delete-home-showcase-item").hidden = true;
    homepageShowcaseError.hidden = true;
    homepageShowcaseDialog.showModal();
  }

  function openHomepageSpotlight(productSlug) {
    const item = homepageSpotlights.find((entry) => entry.product_slug === productSlug);
    if (!item) return;
    editingSpotlightSlug = productSlug;
    homepageShowcaseForm.reset();
    homepageShowcaseForm.elements.sort_order.value = item.sort_order;
    homepageShowcaseForm.elements.bottom_detail.value = item.bottom_detail || "description";
    homepageShowcaseForm.elements.is_active.checked = item.is_active;
    homepageShowcaseForm.elements.sale_enabled.checked = item.sale_enabled;
    homepageShowcaseForm.elements.sale_price.value = item.sale_price ?? "";
    homepageShowcaseForm.elements.sale_starts_at.value = toLocalDateTime(item.sale_starts_at);
    homepageShowcaseForm.elements.sale_ends_at.value = toLocalDateTime(item.sale_ends_at);
    homepageShowcaseForm.elements.is_active.checked = item.is_active;
    populateHomepageSpotlightOptions(productSlug);
    $("#home-showcase-dialog-title").textContent = "Edit spotlight product";
    $("#delete-home-showcase-item").hidden = false;
    homepageShowcaseError.hidden = true;
    homepageShowcaseDialog.showModal();
  }

  function updateHomepageShowcasePreview() {
    const saleEnabled = homepageShowcaseForm.elements.sale_enabled.checked;
    $$(".showcase-sale-field").forEach((field) => field.classList.toggle("is-hidden", !saleEnabled));
    const product = products.find((item) => item.slug === homepageShowcaseForm.elements.product_slug.value);
    const preview = $("#home-showcase-preview");
    preview.src = product?.external_image_url || "/images/ruqo-logo.png";
    const details = $("#home-showcase-price-preview");
    if (!product) {
      details.textContent = "Choose a product to preview its current price.";
      return;
    }
    const salePrice = Number(homepageShowcaseForm.elements.sale_price.value);
    details.textContent = saleEnabled && Number.isFinite(salePrice) && salePrice >= 0
      ? `${translateName(product)} · ${formatPrice(product.price)} → ${formatPrice(salePrice)}`
      : `${translateName(product)} · ${formatPrice(product.price)}`;
  }

  async function saveBrandSettings(event) {
    event.preventDefault();
    brandSettingsError.hidden = true;
    const formData = new FormData(brandSettingsForm);
    const imageFile = formData.get("logo_file");
    if (imageFile instanceof File && imageFile.size > 10 * 1024 * 1024) {
      brandSettingsError.textContent = "Logo must be 10 MB or smaller.";
      brandSettingsError.hidden = false;
      return;
    }
    if (imageFile instanceof File && imageFile.size > 0 && !/^image\/(jpeg|png|webp)$/.test(imageFile.type)) {
      brandSettingsError.textContent = "Choose a PNG, JPEG, or WebP logo.";
      brandSettingsError.hidden = false;
      return;
    }
    const threshold = Number(formData.get("free_shipping_threshold"));
    const deliveryFee = Number(formData.get("delivery_fee"));
    if (!Number.isFinite(threshold) || threshold < 0 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
      brandSettingsError.textContent = "Enter valid non-negative delivery amounts.";
      brandSettingsError.hidden = false;
      return;
    }

    const submit = brandSettingsForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Saving…";
    let uploadedPath = null;
    const previousLogoPath = brandSettings.logo_path || null;
    try {
      let logoPath = brandSettingsForm.dataset.resetLogo === "true" ? null : previousLogoPath;
      if (imageFile instanceof File && imageFile.size > 0) {
        const safeName = imageFile.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
        uploadedPath = `logos/${currentUser.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await client.storage
          .from("store-assets")
          .upload(uploadedPath, imageFile, { cacheControl: "3600", upsert: false, contentType: imageFile.type });
        if (uploadError) throw uploadError;
        logoPath = uploadedPath;
      }

      const settings = {
        ...brandSettings,
        store_name: String(formData.get("store_name") || "").trim(),
        logo_path: logoPath,
        support_email: String(formData.get("support_email") || "").trim(),
        support_phone: String(formData.get("support_phone") || "").trim(),
        free_shipping_threshold: threshold,
        standard_shipping_fee: deliveryFee,
        brand_color: String(formData.get("brand_color") || "#167c72"),
      };
      if (!settings.store_name) throw new Error("Enter a store name.");
      const { error } = await client.from("store_settings").upsert({
        setting_key: "storefront",
        setting_value: settings,
        description: "Public storefront identity, contact, delivery, and appearance settings",
        is_public: true,
        updated_by: currentUser.id,
      }, { onConflict: "setting_key" });
      if (error) throw error;

      brandSettings = settings;
      const logoUrl = getBrandLogoUrl(settings.logo_path);
      window.RUQO_STORE_SETTINGS = settings;
      window.RUQO_BRAND_LOGO_URL = settings.logo_path ? logoUrl : null;
      $("#brand-logo-preview").src = logoUrl;
      document.querySelectorAll("[data-admin-brand-logo]").forEach((image) => {
        image.src = logoUrl;
        image.alt = settings.store_name;
      });
      document.documentElement.style.setProperty("--primary", settings.brand_color);
      document.documentElement.style.setProperty("--primary-deep", `color-mix(in srgb, ${settings.brand_color} 72%, #101918)`);
      window.dispatchEvent(new CustomEvent("ruqo:store-settings-updated", { detail: settings }));
      if (previousLogoPath && previousLogoPath !== settings.logo_path) {
        await client.storage.from("store-assets").remove([previousLogoPath]);
      }
      brandSettingsForm.dataset.resetLogo = "false";
      brandSettingsForm.elements.logo_file.value = "";
      showToast("Store settings saved.");
    } catch (error) {
      if (uploadedPath) await client.storage.from("store-assets").remove([uploadedPath]);
      brandSettingsError.textContent = error.message || "Could not save store settings.";
      brandSettingsError.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = "Save store settings";
    }
  }

  async function saveHomepageShowcase(event) {
    event.preventDefault();
    homepageShowcaseError.hidden = true;
    const formData = new FormData(homepageShowcaseForm);
    const productSlug = String(formData.get("product_slug") || "").trim();
    const saleEnabled = formData.get("sale_enabled") === "on";
    const selectedProduct = products.find((product) => product.slug === productSlug);
    const salePriceValue = String(formData.get("sale_price") || "").trim();
    const salePrice = salePriceValue ? Number(salePriceValue) : null;
    const startsAt = fromLocalDateTime(String(formData.get("sale_starts_at") || ""));
    const endsAt = fromLocalDateTime(String(formData.get("sale_ends_at") || ""));
    if (!productSlug || !selectedProduct) {
      homepageShowcaseError.textContent = "Choose a published product.";
      homepageShowcaseError.hidden = false;
      return;
    }
    if (saleEnabled) {
      if (!productSlug || !selectedProduct || salePrice === null || !Number.isFinite(salePrice) || salePrice < 0 || salePrice >= Number(selectedProduct.price)) {
        homepageShowcaseError.textContent = "The offer price must be lower than the selected product's regular price.";
        homepageShowcaseError.hidden = false;
        return;
      }
      if (!endsAt || new Date(endsAt) <= new Date(startsAt || Date.now())) {
        homepageShowcaseError.textContent = "Choose an offer end time later than its start time.";
        homepageShowcaseError.hidden = false;
        return;
      }
    }

    const submit = homepageShowcaseForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Saving…";
    try {
      const { error } = await client.rpc("save_homepage_spotlight_item", {
        p_product_slug: productSlug,
        p_sort_order: Number(formData.get("sort_order")) || 0,
        p_bottom_detail: String(formData.get("bottom_detail") || "description"),
        p_sale_enabled: saleEnabled,
        p_sale_price: saleEnabled ? salePrice : null,
        p_sale_starts_at: saleEnabled ? startsAt : null,
        p_sale_ends_at: saleEnabled ? endsAt : null,
        p_is_active: formData.get("is_active") === "on",
      });
      if (error) throw error;
      await loadCatalog();
      await loadHomepageSpotlights();
      homepageShowcaseDialog.close();
      editingSpotlightSlug = null;
      showToast("Homepage spotlight product saved.");
    } catch (error) {
      homepageShowcaseError.textContent = error.message || "Could not save the homepage spotlight.";
      homepageShowcaseError.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = "Save spotlight product";
      updateHomepageShowcasePreview();
    }
  }

  async function deleteHomepageSpotlight(productSlug = editingSpotlightSlug) {
    if (!productSlug || !window.confirm("Remove this product from the homepage spotlight?")) return;
    const { error } = await client.rpc("delete_homepage_spotlight_item", { p_product_slug: productSlug });
    if (error) {
      homepageShowcaseError.textContent = error.message || "Could not remove this spotlight product.";
      homepageShowcaseError.hidden = false;
      return;
    }
    if (homepageShowcaseDialog.open) homepageShowcaseDialog.close();
    editingSpotlightSlug = null;
    await loadCatalog();
    await loadHomepageSpotlights();
    showToast("Product removed from homepage spotlight.");
  }

  function appendTextCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value || "—";
    row.append(cell);
    return cell;
  }

  function formatDateTime(value) {
    if (!value) return "No schedule";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  async function loadOrders() {
    const { data, error } = await client
      .from("orders")
      .select("id, order_number, customer_name, customer_email, customer_phone, status, payment_method, payment_status, currency, total, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    orders = data || [];
    renderOrders();
  }

  async function loadContactMessages() {
    const { data, error } = await client
      .from("contact_messages")
      .select("id, customer_name, customer_email, message, language_code, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    contactMessages = data || [];
    renderContactMessages();
  }

  function renderContactMessages() {
    const rows = contactMessages.map((message) => {
      const row = document.createElement("tr");
      appendTextCell(row, formatDateTime(message.created_at));
      const customerCell = document.createElement("td");
      const name = document.createElement("strong");
      name.textContent = message.customer_name;
      const email = document.createElement("a");
      email.href = `mailto:${message.customer_email}`;
      email.textContent = message.customer_email;
      email.style.display = "block";
      customerCell.append(name, email);
      row.append(customerCell);
      const body = document.createElement("td");
      body.textContent = message.message;
      body.dir = message.language_code === "ar" ? "rtl" : "auto";
      row.append(body);
      const statusCell = document.createElement("td");
      const status = document.createElement("select");
      status.setAttribute("aria-label", `Status for message from ${message.customer_name}`);
      for (const value of ["new", "read", "resolved"]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value[0].toUpperCase() + value.slice(1);
        option.selected = message.status === value;
        status.append(option);
      }
      status.addEventListener("change", () => updateContactMessageStatus(message, status.value, status));
      statusCell.append(status);
      row.append(statusCell);
      return row;
    });
    $("#messages-body").replaceChildren(...rows);
    $("#messages-empty").hidden = contactMessages.length > 0;
  }

  async function updateContactMessageStatus(message, nextStatus, control) {
    const previousStatus = message.status;
    control.disabled = true;
    const { error } = await client.from("contact_messages").update({ status: nextStatus }).eq("id", message.id);
    if (error) {
      control.value = previousStatus;
      showToast(`Could not update message: ${error.message}`);
    } else {
      message.status = nextStatus;
      showToast("Message status updated.");
    }
    control.disabled = false;
  }

  async function loadNewsletterSubscribers() {
    const { data, error } = await client
      .from("newsletter_subscriptions")
      .select("email, is_active, subscribed_at")
      .order("subscribed_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    newsletterSubscribers = data || [];
    renderNewsletterSubscribers();
  }

  function renderNewsletterSubscribers() {
    const rows = newsletterSubscribers.map((subscriber) => {
      const row = document.createElement("tr");
      const email = document.createElement("td");
      const link = document.createElement("a");
      link.href = `mailto:${subscriber.email}`;
      link.textContent = subscriber.email;
      email.append(link);
      row.append(email);
      appendTextCell(row, formatDateTime(subscriber.subscribed_at));
      const statusCell = document.createElement("td");
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = subscriber.is_active;
      toggle.setAttribute("aria-label", `Newsletter active for ${subscriber.email}`);
      toggle.addEventListener("change", async () => {
        toggle.disabled = true;
        const { error } = await client.from("newsletter_subscriptions")
          .update({ is_active: toggle.checked })
          .eq("email", subscriber.email);
        if (error) {
          toggle.checked = subscriber.is_active;
          showToast(`Could not update subscription: ${error.message}`);
        } else {
          subscriber.is_active = toggle.checked;
        }
        toggle.disabled = false;
      });
      statusCell.append(toggle);
      row.append(statusCell);
      return row;
    });
    $("#subscribers-body").replaceChildren(...rows);
    $("#subscribers-empty").hidden = newsletterSubscribers.length > 0;
  }

  function renderOrders() {
    const rows = orders.map((order) => {
      const row = document.createElement("tr");
      const number = document.createElement("td");
      const numberStrong = document.createElement("strong");
      numberStrong.textContent = order.order_number;
      const customerRef = document.createElement("small");
      customerRef.style.display = "block";
      customerRef.style.color = "var(--admin-muted)";
      customerRef.textContent = order.customer_phone;
      number.append(numberStrong, customerRef);
      row.append(number);
      appendTextCell(row, order.customer_name);
      appendTextCell(row, formatDateTime(order.created_at));
      appendTextCell(row, new Intl.NumberFormat("en-SA", { style: "currency", currency: order.currency || "SAR" }).format(order.total));
      appendTextCell(row, `${order.payment_method.replaceAll("_", " ")} · ${order.payment_status}`);
      const statusCell = document.createElement("td");
      const status = document.createElement("select");
      status.setAttribute("aria-label", `Status for ${order.order_number}`);
      for (const value of ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value[0].toUpperCase() + value.slice(1);
        option.selected = order.status === value;
        status.append(option);
      }
      status.addEventListener("change", () => updateOrderStatus(order, status.value, status));
      statusCell.append(status);
      row.append(statusCell);
      return row;
    });
    $("#orders-body").replaceChildren(...rows);
    $("#orders-empty").hidden = orders.length > 0;
  }

  async function updateOrderStatus(order, nextStatus, control) {
    if (nextStatus === order.status) return;
    control.disabled = true;
    const { error } = await client.from("orders").update({ status: nextStatus }).eq("id", order.id);
    if (error) {
      control.value = order.status;
      control.disabled = false;
      showToast(`Could not update order: ${error.message}`);
      return;
    }
    const { error: eventError } = await client.from("order_events").insert({
      order_id: order.id,
      from_status: order.status,
      to_status: nextStatus,
      changed_by: currentUser.id,
    });
    if (eventError) showToast(`Status updated, but its history note failed: ${eventError.message}`);
    else showToast(`Order ${order.order_number} updated.`);
    await loadOrders();
  }

  async function loadPromotions() {
    const { data, error } = await client
      .from("promotions")
      .select("id, name, title_translations, coupon_code, discount_type, discount_value, minimum_order, starts_at, ends_at, is_active")
      .order("created_at", { ascending: false });
    if (error) throw error;
    promotions = data || [];
    renderPromotions();
  }

  function renderPromotions() {
    const rows = promotions.map((promotion) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const strong = document.createElement("strong");
      strong.textContent = promotion.title_translations?.en || promotion.name;
      const internal = document.createElement("small");
      internal.style.display = "block";
      internal.style.color = "var(--admin-muted)";
      internal.textContent = promotion.name;
      name.append(strong, internal);
      row.append(name);
      appendTextCell(row, promotion.coupon_code || "Automatic");
      appendTextCell(row, promotion.discount_type === "percentage" ? `${promotion.discount_value}%` : formatPrice(promotion.discount_value));
      appendTextCell(row, `${formatDateTime(promotion.starts_at)} – ${formatDateTime(promotion.ends_at)}`);
      const state = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `admin-status ${promotion.is_active ? "is-published" : "is-draft"}`;
      badge.textContent = promotion.is_active ? "Active" : "Paused";
      state.append(badge);
      row.append(state);
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-row-action";
      edit.title = "Edit offer";
      edit.setAttribute("aria-label", `Edit ${promotion.name}`);
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.addEventListener("click", () => openPromotion(promotion.id));
      actions.append(edit);
      row.append(actions);
      return row;
    });
    $("#promotions-body").replaceChildren(...rows);
    $("#promotions-empty").hidden = promotions.length > 0;
    window.lucide?.createIcons();
  }

  async function loadBanners() {
    const { data, error } = await client
      .from("banners")
      .select("id, name, placement, title_translations, image_path, starts_at, ends_at, is_active")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw error;
    banners = data || [];
    renderBanners();
  }

  function renderBanners() {
    const rows = banners.map((banner) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const strong = document.createElement("strong");
      strong.textContent = banner.title_translations?.en || banner.name;
      const internal = document.createElement("small");
      internal.style.display = "block";
      internal.style.color = "var(--admin-muted)";
      internal.textContent = banner.name;
      name.append(strong, internal);
      row.append(name);
      appendTextCell(row, banner.placement.replaceAll("_", " "));
      appendTextCell(row, `${formatDateTime(banner.starts_at)} – ${formatDateTime(banner.ends_at)}`);
      const state = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `admin-status ${banner.is_active ? "is-published" : "is-draft"}`;
      badge.textContent = banner.is_active ? "Active" : "Paused";
      state.append(badge);
      row.append(state);
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-row-action";
      edit.title = "Edit banner";
      edit.setAttribute("aria-label", `Edit ${banner.name}`);
      edit.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
      edit.addEventListener("click", () => openBanner(banner.id));
      actions.append(edit);
      row.append(actions);
      return row;
    });
    $("#banners-body").replaceChildren(...rows);
    $("#banners-empty").hidden = banners.length > 0;
    window.lucide?.createIcons();
  }

  function populateCategoryOptions(selected = "") {
    const select = $("#product-category");
    select.replaceChildren();
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category.slug;
      option.textContent = category.name_translations?.en || category.slug;
      option.selected = category.slug === selected;
      select.append(option);
    }
  }

  function createProductSpecificationRow(language, specification = {}, position = 0) {
    const row = document.createElement("fieldset");
    row.className = "product-specification-row";
    row.dataset.specificationIndex = String(position);
    const fields = document.createElement("div");
    fields.className = "product-specification-fields";
    const createField = (labelText, value, attribute, multiline = false) => {
      const label = document.createElement("label");
      label.textContent = labelText;
      const field = multiline ? document.createElement("textarea") : document.createElement("input");
      if (multiline) field.rows = 2;
      field.maxLength = multiline ? 500 : 120;
      field.value = value || "";
      field.dataset[attribute] = "";
      label.append(field);
      return label;
    };
    fields.append(
      createField("Detail title", specification.title, "specificationTitle"),
      createField("Description", specification.description, "specificationDescription", true),
    );
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-danger-button variant-remove-button";
    remove.setAttribute("aria-label", `Remove ${language} detail`);
    remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
    remove.addEventListener("click", () => {
      $$(`[data-specification-index="${position}"]`).forEach((matchingRow) => matchingRow.remove());
    });
    row.append(fields, remove);
    return row;
  }

  function renderProductSpecifications(specifications = []) {
    const byLanguage = Object.fromEntries(languages.map((language) => [
      language,
      specifications
        .filter((specification) => specification.language_code === language)
        .sort((left, right) => left.position - right.position),
    ]));
    const rowCount = Math.max(0, ...Object.values(byLanguage).map((rows) => rows.length));
    for (const language of languages) {
      const panel = $(`[data-specification-locale="${language}"]`);
      panel.replaceChildren();
      for (let position = 0; position < rowCount; position += 1) {
        panel.append(createProductSpecificationRow(language, byLanguage[language][position], position));
      }
    }
    window.lucide?.createIcons();
  }

  function createProductBenefitRow(benefit, index) {
    const row = document.createElement("fieldset");
    row.className = "product-benefit-row";
    row.dataset.productBenefitIndex = String(index);
    const legend = document.createElement("legend");
    legend.textContent = `Benefit ${index + 1}`;
    const iconLabel = document.createElement("label");
    iconLabel.className = "product-benefit-icon-field";
    iconLabel.textContent = "Lucide icon";
    const iconSelect = document.createElement("select");
    iconSelect.dataset.productBenefitIcon = "";
    for (const [iconName, iconLabelText] of productBenefitIconOptions) {
      const option = document.createElement("option");
      option.value = iconName;
      option.textContent = `${iconLabelText} (${iconName})`;
      option.selected = benefit.icon === iconName;
      iconSelect.append(option);
    }
    iconLabel.append(iconSelect);
    const locales = document.createElement("div");
    locales.className = "product-benefit-locales";
    for (const language of languages) {
      const localePanel = document.createElement("div");
      localePanel.className = "product-benefit-locale";
      localePanel.dataset.benefitLocale = language;
      localePanel.hidden = language !== "en";
      if (language === "ar") localePanel.dir = "rtl";
      const titleLabel = document.createElement("label");
      titleLabel.textContent = "Title";
      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.maxLength = 120;
      titleInput.required = language === "en";
      titleInput.dataset.productBenefitTitle = "";
      titleInput.value = benefit.title_translations?.[language] || benefit.title_translations?.en || "";
      titleLabel.append(titleInput);
      const descriptionLabel = document.createElement("label");
      descriptionLabel.textContent = "Description";
      const descriptionInput = document.createElement("textarea");
      descriptionInput.rows = 2;
      descriptionInput.maxLength = 240;
      descriptionInput.required = language === "en";
      descriptionInput.dataset.productBenefitDescription = "";
      descriptionInput.value = benefit.description_translations?.[language] || benefit.description_translations?.en || "";
      descriptionLabel.append(descriptionInput);
      localePanel.append(titleLabel, descriptionLabel);
      locales.append(localePanel);
    }
    row.append(legend, iconLabel, locales);
    return row;
  }

  function renderProductBenefits(benefits = []) {
    const values = Array.from({ length: 3 }, (_, index) => {
      const benefit = benefits[index] || defaultProductBenefits[index];
      return {
        ...defaultProductBenefits[index],
        ...benefit,
        title_translations: {
          ...defaultProductBenefits[index].title_translations,
          ...(benefit.title_translations || {}),
        },
        description_translations: {
          ...defaultProductBenefits[index].description_translations,
          ...(benefit.description_translations || {}),
        },
      };
    });
    productBenefitRows.replaceChildren(...values.map(createProductBenefitRow));
    window.lucide?.createIcons();
  }

  function addProductSpecification() {
    const englishPanel = $('[data-specification-locale="en"]');
    const positions = [...englishPanel.querySelectorAll("[data-specification-index]")]
      .map((row) => Number(row.dataset.specificationIndex));
    const nextPosition = Math.max(-1, ...positions) + 1;
    for (const language of languages) {
      $(`[data-specification-locale="${language}"]`).append(createProductSpecificationRow(language, {}, nextPosition));
    }
    window.lucide?.createIcons();
    $(`[data-specification-locale="en"] [data-specification-index="${nextPosition}"] [data-specification-title]`)?.focus();
  }

  function setProductTranslations(product, features = [], specifications = [], benefits = []) {
    for (const language of ["en", "fr", "es", "zh", "ar"]) {
      productForm.elements[`name_${language}`].value = product?.name_translations?.[language] || "";
      productForm.elements[`description_name_${language}`].value = product?.description_name_translations?.[language] || "";
      productForm.elements[`description_${language}`].value = product?.description_translations?.[language] || "";
      productForm.elements[`features_${language}`].value = features
        .filter((feature) => feature.language_code === language)
        .sort((a, b) => a.position - b.position)
        .map((feature) => feature.content)
        .join("\n");
    }
    renderProductSpecifications(specifications);
    renderProductBenefits(benefits.length ? benefits : product?.product_benefits || []);
  }

  function translationInputName(column, language) {
    return `${column.replace(/_translations$/, "")}_${language}`;
  }

  function setLocale(locale) {
    $$('[data-locale-tab]').forEach((button) => {
      const active = button.dataset.localeTab === locale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    $$('[data-locale-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.localePanel !== locale;
      panel.classList.toggle("is-active", !panel.hidden);
    });
    $$('[data-specification-locale]').forEach((panel) => {
      panel.hidden = panel.dataset.specificationLocale !== locale;
    });
    $$('[data-benefit-locale]').forEach((panel) => {
      panel.hidden = panel.dataset.benefitLocale !== locale;
    });
  }

  function openNewCategory() {
    editingCategorySlug = null;
    categoryForm.reset();
    categoryForm.elements.slug.readOnly = false;
    categoryForm.elements.sort_order.value = String(categories.length + 1);
    categoryForm.elements.is_active.checked = true;
    $("#category-dialog-title").textContent = "Add category";
    $("#delete-category").hidden = true;
    clearFormError(categoryError);
    fillLocalizedFields(categoryForm, null, ["name_translations", "description_translations"]);
    setLocale("en");
    categoryDialog.showModal();
  }

  function openCategory(slug) {
    const category = categories.find((item) => item.slug === slug);
    if (!category) return;
    editingCategorySlug = slug;
    categoryForm.reset();
    categoryForm.elements.slug.value = category.slug;
    categoryForm.elements.slug.readOnly = true;
    categoryForm.elements.sort_order.value = category.sort_order;
    categoryForm.elements.is_active.checked = category.is_active;
    $("#category-dialog-title").textContent = "Edit category";
    $("#delete-category").hidden = false;
    clearFormError(categoryError);
    fillLocalizedFields(categoryForm, {
      name_translations: category.name_translations,
      description_translations: category.description_translations,
    }, ["name_translations", "description_translations"]);
    setLocale("en");
    categoryDialog.showModal();
  }

  async function saveCategory(event) {
    event.preventDefault();
    clearFormError(categoryError);
    const formData = new FormData(categoryForm);
    const slug = String(formData.get("slug") || "").trim().toLowerCase();
    const englishName = String(formData.get("name_en") || "").trim();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !englishName) {
      categoryError.textContent = "Enter a valid slug and an English category name.";
      categoryError.hidden = false;
      setLocale("en");
      return;
    }
    const translations = readLocalizedFields(categoryForm, ["name_translations", "description_translations"]);
    for (const language of languages) {
      translations.name_translations[language] ||= translations.name_translations.en;
      translations.description_translations[language] ||= translations.description_translations.en;
    }
    const submit = categoryForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const { error } = await client.from("categories").upsert({
        slug,
        ...translations,
        sort_order: Number(formData.get("sort_order")) || 0,
        is_active: formData.get("is_active") === "on",
      }, { onConflict: "slug" });
      if (error) throw error;
      categoryDialog.close();
      await loadCatalog();
      showToast("Category saved.");
    } catch (error) {
      categoryError.textContent = error.message || "Could not save this category.";
      categoryError.hidden = false;
    } finally {
      submit.disabled = false;
    }
  }

  async function deleteCategory() {
    if (!editingCategorySlug || !window.confirm("Delete this category? Products assigned to it must be moved first.")) return;
    const { error } = await client.from("categories").delete().eq("slug", editingCategorySlug);
    if (error) {
      categoryError.textContent = error.message || "Could not delete this category.";
      categoryError.hidden = false;
      return;
    }
    categoryDialog.close();
    editingCategorySlug = null;
    await loadCatalog();
    showToast("Category deleted.");
  }

  function openNewProduct() {
    editingSlug = null;
    productForm.reset();
    productForm.elements.slug.readOnly = false;
    productForm.elements.is_active.checked = true;
    productForm.elements.in_stock.checked = true;
    $("#product-dialog-title").textContent = "Add product";
    $("#save-product").textContent = "Save product";
    $("#delete-product").hidden = true;
    $("#product-form-error").hidden = true;
    populateCategoryOptions(categories[0]?.slug || "");
    setProductTranslations(null);
    setLocale("en");
    productDialog.showModal();
  }

  async function openProduct(slug) {
    const product = products.find((item) => item.slug === slug);
    if (!product) return;
    const { data: features, error } = await client
      .from("product_features")
      .select("language_code, position, content")
      .eq("product_slug", slug)
      .order("position");
    if (error) {
      showToast("Could not load product translations.");
      return;
    }
    const { data: specifications, error: specificationsError } = await client
      .from("product_specifications")
      .select("language_code, position, title, description")
      .eq("product_slug", slug)
      .order("position");
    if (specificationsError) {
      showToast("Could not load product specifications.");
      return;
    }
    editingSlug = slug;
    productForm.reset();
    productForm.elements.slug.value = product.slug;
    productForm.elements.slug.readOnly = true;
    productForm.elements.brand.value = product.brand;
    productForm.elements.badge.value = product.badge || "";
    productForm.elements.price.value = product.price;
    productForm.elements.compare_at_price.value = product.compare_at_price ?? "";
    productForm.elements.external_image_url.value = product.external_image_url || "";
    productForm.elements.is_active.checked = product.is_active;
    productForm.elements.in_stock.checked = product.in_stock;
    productForm.elements.is_featured.checked = product.is_featured;
    $("#product-dialog-title").textContent = "Edit product";
    $("#save-product").textContent = "Save changes";
    $("#delete-product").hidden = false;
    $("#product-form-error").hidden = true;
    populateCategoryOptions(product.category_slug);
    setProductTranslations(product, features || [], specifications || [], product.product_benefits || []);
    window.lucide?.createIcons();
    setLocale("en");
    productDialog.showModal();
  }

  function fillLocalizedFields(form, record, keys) {
    for (const language of languages) {
      for (const key of keys) {
        form.elements[translationInputName(key, language)].value =
          record?.[key]?.[language] || record?.[key]?.en || "";
      }
    }
  }

  function readLocalizedFields(form, keys) {
    return Object.fromEntries(
      keys.map((key) => [
        key,
        Object.fromEntries(
          languages.map((language) => [
            language,
            String(form.elements[translationInputName(key, language)].value || "").trim(),
          ]),
        ),
      ]),
    );
  }

  function toLocalDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  function fromLocalDateTime(value) {
    return value ? new Date(value).toISOString() : null;
  }

  function clearFormError(node) {
    node.textContent = "";
    node.hidden = true;
  }

  function openNewPromotion() {
    editingPromotionId = null;
    promotionForm.reset();
    promotionForm.elements.minimum_order.value = "0";
    $("#promotion-dialog-title").textContent = "Add offer";
    $("#save-promotion").textContent = "Save offer";
    $("#delete-promotion").hidden = true;
    clearFormError($("#promotion-form-error"));
    fillLocalizedFields(promotionForm, null, ["title_translations", "description_translations"]);
    setLocale("en");
    promotionDialog.showModal();
  }

  function openPromotion(id) {
    const promotion = promotions.find((item) => item.id === id);
    if (!promotion) return;
    editingPromotionId = id;
    promotionForm.reset();
    for (const field of ["name", "coupon_code", "discount_type", "discount_value", "minimum_order"]) {
      promotionForm.elements[field].value = promotion[field] ?? (field === "minimum_order" ? 0 : "");
    }
    promotionForm.elements.starts_at.value = toLocalDateTime(promotion.starts_at);
    promotionForm.elements.ends_at.value = toLocalDateTime(promotion.ends_at);
    promotionForm.elements.is_active.checked = promotion.is_active;
    $("#promotion-dialog-title").textContent = "Edit offer";
    $("#save-promotion").textContent = "Save changes";
    $("#delete-promotion").hidden = false;
    clearFormError($("#promotion-form-error"));
    fillLocalizedFields(promotionForm, {
      title_translations: promotion.title_translations,
      description_translations: promotion.description_translations,
    }, ["title_translations", "description_translations"]);
    setLocale("en");
    promotionDialog.showModal();
  }

  async function savePromotion(event) {
    event.preventDefault();
    const errorNode = $("#promotion-form-error");
    clearFormError(errorNode);
    const formData = new FormData(promotionForm);
    const name = String(formData.get("name") || "").trim();
    const discountType = String(formData.get("discount_type"));
    const discountValue = Number(formData.get("discount_value"));
    const startValue = String(formData.get("starts_at") || "");
    const endValue = String(formData.get("ends_at") || "");
    const startsAt = fromLocalDateTime(startValue);
    const endsAt = fromLocalDateTime(endValue);
    if (!name || !String(formData.get("title_en") || "").trim() || !Number.isFinite(discountValue) || discountValue <= 0) {
      errorNode.textContent = "Enter an internal name, English offer title, and positive discount value.";
      errorNode.hidden = false;
      setLocale("en");
      return;
    }
    if (discountType === "percentage" && discountValue > 100) {
      errorNode.textContent = "Percentage discount cannot exceed 100%.";
      errorNode.hidden = false;
      return;
    }
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      errorNode.textContent = "The end date must be later than the start date.";
      errorNode.hidden = false;
      return;
    }
    const submit = $("#save-promotion");
    submit.disabled = true;
    submit.textContent = "Saving…";
    try {
      const translations = readLocalizedFields(promotionForm, ["title_translations", "description_translations"]);
      const titleTranslations = translations.title_translations;
      const descriptionTranslations = translations.description_translations;
      for (const language of languages) {
        titleTranslations[language] ||= titleTranslations.en;
        descriptionTranslations[language] ||= descriptionTranslations.en;
      }
      const payload = {
        name,
        ...translations,
        discount_type: discountType,
        discount_value: discountValue,
        coupon_code: String(formData.get("coupon_code") || "").trim().toUpperCase() || null,
        minimum_order: Number(formData.get("minimum_order")) || 0,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: formData.get("is_active") === "on",
        created_by: currentUser.id,
      };
      const query = editingPromotionId
        ? client.from("promotions").update(payload).eq("id", editingPromotionId)
        : client.from("promotions").insert(payload);
      const { error } = await query;
      if (error) throw error;
      promotionDialog.close();
      await loadPromotions();
      showToast(editingPromotionId ? "Offer updated." : "Offer created.");
      editingPromotionId = null;
    } catch (error) {
      errorNode.textContent = error.message || "Could not save this offer.";
      errorNode.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = editingPromotionId ? "Save changes" : "Save offer";
    }
  }

  async function deletePromotion() {
    if (!editingPromotionId || !window.confirm("Delete this offer?")) return;
    const { error } = await client.from("promotions").delete().eq("id", editingPromotionId);
    if (error) {
      const errorNode = $("#promotion-form-error");
      errorNode.textContent = error.message;
      errorNode.hidden = false;
      return;
    }
    promotionDialog.close();
    editingPromotionId = null;
    await loadPromotions();
    showToast("Offer deleted.");
  }

  function openNewBanner() {
    editingBannerId = null;
    bannerForm.reset();
    $("#banner-dialog-title").textContent = "Add banner";
    $("#save-banner").textContent = "Save banner";
    $("#delete-banner").hidden = true;
    clearFormError($("#banner-form-error"));
    fillLocalizedFields(bannerForm, null, ["title_translations", "description_translations", "button_translations"]);
    setLocale("en");
    bannerDialog.showModal();
  }

  function openBanner(id) {
    const banner = banners.find((item) => item.id === id);
    if (!banner) return;
    editingBannerId = id;
    bannerForm.reset();
    bannerForm.elements.name.value = banner.name;
    bannerForm.elements.placement.value = banner.placement;
    bannerForm.elements.destination_url.value = banner.destination_url || "";
    bannerForm.elements.image_url.value = banner.image_path?.startsWith("http") ? banner.image_path : "";
    bannerForm.elements.starts_at.value = toLocalDateTime(banner.starts_at);
    bannerForm.elements.ends_at.value = toLocalDateTime(banner.ends_at);
    bannerForm.elements.is_active.checked = banner.is_active;
    $("#banner-dialog-title").textContent = "Edit banner";
    $("#save-banner").textContent = "Save changes";
    $("#delete-banner").hidden = false;
    clearFormError($("#banner-form-error"));
    fillLocalizedFields(bannerForm, {
      title_translations: banner.title_translations,
      description_translations: banner.description_translations,
      button_translations: banner.button_translations,
    }, ["title_translations", "description_translations", "button_translations"]);
    setLocale("en");
    bannerDialog.showModal();
  }

  async function saveBanner(event) {
    event.preventDefault();
    const errorNode = $("#banner-form-error");
    clearFormError(errorNode);
    const formData = new FormData(bannerForm);
    const name = String(formData.get("name") || "").trim();
    const imageUrl = String(formData.get("image_url") || "").trim();
    const imageFile = formData.get("image_file");
    const startValue = String(formData.get("starts_at") || "");
    const endValue = String(formData.get("ends_at") || "");
    const startsAt = fromLocalDateTime(startValue);
    const endsAt = fromLocalDateTime(endValue);
    if (!name || !String(formData.get("title_en") || "").trim()) {
      errorNode.textContent = "Enter an internal name and an English banner title.";
      errorNode.hidden = false;
      setLocale("en");
      return;
    }
    if (!imageUrl && !(imageFile instanceof File && imageFile.size > 0) && !editingBannerId) {
      errorNode.textContent = "Add an image URL or upload a banner image.";
      errorNode.hidden = false;
      return;
    }
    if (imageFile instanceof File && imageFile.size > 10 * 1024 * 1024) {
      errorNode.textContent = "Image must be 10 MB or smaller.";
      errorNode.hidden = false;
      return;
    }
    if (imageFile instanceof File && imageFile.size > 0 && !/^image\/(jpeg|png|webp)$/.test(imageFile.type)) {
      errorNode.textContent = "Choose a PNG, JPEG, or WebP image.";
      errorNode.hidden = false;
      return;
    }
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      errorNode.textContent = "The end date must be later than the start date.";
      errorNode.hidden = false;
      return;
    }
    const submit = $("#save-banner");
    submit.disabled = true;
    submit.textContent = "Saving…";
    let uploadedPath = null;
    try {
      const translations = readLocalizedFields(bannerForm, ["title_translations", "description_translations", "button_translations"]);
      for (const group of Object.values(translations)) {
        for (const language of languages) group[language] ||= group.en;
      }
      const bannerId = editingBannerId || crypto.randomUUID();
      let imagePath = imageUrl || banners.find((item) => item.id === editingBannerId)?.image_path || null;
      const previousPath = banners.find((item) => item.id === editingBannerId)?.image_path;
      if (imageFile instanceof File && imageFile.size > 0) {
        const safeName = imageFile.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
        uploadedPath = `banners/${bannerId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await client.storage
          .from("banner-images")
          .upload(uploadedPath, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        imagePath = uploadedPath;
      }
      const payload = {
        id: bannerId,
        name,
        placement: String(formData.get("placement")),
        ...translations,
        image_path: imagePath,
        destination_url: String(formData.get("destination_url") || "").trim() || null,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: formData.get("is_active") === "on",
        created_by: currentUser.id,
      };
      const { error } = await client.from("banners").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      if (previousPath && previousPath.startsWith("banners/") && previousPath !== uploadedPath) {
        await client.storage.from("banner-images").remove([previousPath]);
      }
      bannerDialog.close();
      editingBannerId = null;
      await loadBanners();
      showToast("Banner saved.");
    } catch (error) {
      if (uploadedPath) await client.storage.from("banner-images").remove([uploadedPath]);
      errorNode.textContent = error.message || "Could not save this banner.";
      errorNode.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = editingBannerId ? "Save changes" : "Save banner";
    }
  }

  async function deleteBanner() {
    if (!editingBannerId || !window.confirm("Delete this banner?")) return;
    const banner = banners.find((item) => item.id === editingBannerId);
    const { error } = await client.from("banners").delete().eq("id", editingBannerId);
    if (error) {
      const errorNode = $("#banner-form-error");
      errorNode.textContent = error.message;
      errorNode.hidden = false;
      return;
    }
    if (banner?.image_path?.startsWith("banners/")) {
      await client.storage.from("banner-images").remove([banner.image_path]);
    }
    bannerDialog.close();
    editingBannerId = null;
    await loadBanners();
    showToast("Banner deleted.");
  }

  async function saveProduct(event) {
    event.preventDefault();
    showProductError("");
    const formData = new FormData(productForm);
    const slug = String(formData.get("slug") || "").trim().toLowerCase();
    const englishName = String(formData.get("name_en") || "").trim();
    const englishDescriptionName = String(formData.get("description_name_en") || "").trim();
    const price = Number(formData.get("price"));
    const compareValue = String(formData.get("compare_at_price") || "").trim();
    const compareAtPrice = compareValue ? Number(compareValue) : null;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      showProductError("Use a lowercase slug with letters, numbers, and hyphens.");
      setLocale("en");
      productForm.elements.slug.focus();
      return;
    }
    if (!englishName || !Number.isFinite(price) || price < 0) {
      showProductError("Enter an English product name and a valid price.");
      setLocale("en");
      return;
    }
    if (!englishDescriptionName) {
      showProductError("Enter an English description name.");
      setLocale("en");
      productForm.elements.description_name_en.focus();
      return;
    }
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < price)) {
      showProductError("Compare-at price must be greater than or equal to the price.");
      return;
    }
    const readSpecifications = (language) => [...$(`[data-specification-locale="${language}"]`).querySelectorAll(".product-specification-row")]
      .map((row) => ({
        title: row.querySelector("[data-specification-title]").value.trim(),
        description: row.querySelector("[data-specification-description]").value.trim(),
      }));
    const englishSpecifications = readSpecifications("en");
    const incompleteSpecificationIndex = englishSpecifications.findIndex((specification) => !specification.title || !specification.description);
    if (incompleteSpecificationIndex !== -1) {
      showProductError("Each specification needs an English detail title and description.");
      setLocale("en");
      const incompleteSpecification = $('[data-specification-locale="en"]')
        .querySelectorAll(".product-specification-row")[incompleteSpecificationIndex];
      incompleteSpecification?.querySelector(
        englishSpecifications[incompleteSpecificationIndex].title ? "[data-specification-description]" : "[data-specification-title]",
      ).focus();
      return;
    }
    const specificationsByLanguage = Object.fromEntries(languages.map((language) => {
      const translatedSpecifications = readSpecifications(language);
      return [language, englishSpecifications.map((englishSpecification, position) => ({
        title: translatedSpecifications[position]?.title || englishSpecification.title,
        description: translatedSpecifications[position]?.description || englishSpecification.description,
      }))];
    }));
    const productBenefits = [...productBenefitRows.querySelectorAll(".product-benefit-row")].map((row) => {
      const titleTranslations = {};
      const descriptionTranslations = {};
      const englishTitle = row.querySelector('[data-benefit-locale="en"] [data-product-benefit-title]').value.trim();
      const englishDescription = row.querySelector('[data-benefit-locale="en"] [data-product-benefit-description]').value.trim();
      for (const language of languages) {
        titleTranslations[language] = row.querySelector(`[data-benefit-locale="${language}"] [data-product-benefit-title]`).value.trim() || englishTitle;
        descriptionTranslations[language] = row.querySelector(`[data-benefit-locale="${language}"] [data-product-benefit-description]`).value.trim() || englishDescription;
      }
      return {
        icon: row.querySelector("[data-product-benefit-icon]").value,
        title_translations: titleTranslations,
        description_translations: descriptionTranslations,
      };
    });
    const incompleteBenefit = productBenefits.findIndex((benefit) => !benefit.title_translations.en || !benefit.description_translations.en);
    if (productBenefits.length !== 3 || incompleteBenefit !== -1) {
      showProductError("Add an English title and description to each of the three product benefits.");
      setLocale("en");
      const row = productBenefitRows.querySelectorAll(".product-benefit-row")[Math.max(0, incompleteBenefit)];
      row?.querySelector(
        row.querySelector('[data-benefit-locale="en"] [data-product-benefit-title]').value.trim()
          ? '[data-benefit-locale="en"] [data-product-benefit-description]'
          : '[data-benefit-locale="en"] [data-product-benefit-title]',
      ).focus();
      return;
    }

    const saveButton = $("#save-product");
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    try {
      const nameTranslations = {};
      const descriptionNameTranslations = {};
      const descriptionTranslations = {};
      const featuresByLanguage = {};
      for (const language of ["en", "fr", "es", "zh", "ar"]) {
        nameTranslations[language] = String(formData.get(`name_${language}`) || "").trim() || englishName;
        descriptionNameTranslations[language] = String(formData.get(`description_name_${language}`) || "").trim() || englishDescriptionName;
        descriptionTranslations[language] = String(formData.get(`description_${language}`) || "").trim() || String(formData.get("description_en") || "").trim();
        featuresByLanguage[language] = String(formData.get(`features_${language}`) || "").split("\n").map((line) => line.trim()).filter(Boolean);
        if (!featuresByLanguage[language].length) featuresByLanguage[language] = String(formData.get("features_en") || "").split("\n").map((line) => line.trim()).filter(Boolean);
      }

      let imageUrl = String(formData.get("external_image_url") || "").trim() || null;
      const imageFile = formData.get("image_file");
      let storagePath = null;
      if (imageFile instanceof File && imageFile.size > 0) {
        if (imageFile.size > 10 * 1024 * 1024) throw new Error("Image must be 10 MB or smaller.");
        if (!/^image\/(jpeg|png|webp)$/.test(imageFile.type)) throw new Error("Choose a PNG, JPEG, or WebP image.");
        const safeName = imageFile.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
        storagePath = `products/${slug}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await client.storage
          .from("product-images")
          .upload(storagePath, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = client.storage.from("product-images").getPublicUrl(storagePath).data.publicUrl;
      }

      const { error: productError } = await client.from("products").upsert({
        slug,
        category_slug: String(formData.get("category_slug")),
        brand: String(formData.get("brand") || "").trim(),
        name_translations: nameTranslations,
        description_name_translations: descriptionNameTranslations,
        description_translations: descriptionTranslations,
        product_benefits: productBenefits,
        price,
        compare_at_price: compareAtPrice,
        currency: "SAR",
        badge: String(formData.get("badge") || "") || null,
        in_stock: formData.get("in_stock") === "on",
        is_active: formData.get("is_active") === "on",
        is_featured: formData.get("is_featured") === "on",
        sort_order: products.find((item) => item.slug === slug)?.sort_order ?? products.length + 1,
        external_image_url: imageUrl,
      }, { onConflict: "slug" });
      if (productError) throw productError;

      const { error: deleteFeaturesError } = await client.from("product_features").delete().eq("product_slug", slug);
      if (deleteFeaturesError) throw deleteFeaturesError;
      const featureRows = Object.entries(featuresByLanguage).flatMap(([language, lines]) =>
        lines.map((content, position) => ({ product_slug: slug, language_code: language, position, content })),
      );
      if (featureRows.length) {
        const { error: featuresError } = await client.from("product_features").insert(featureRows);
        if (featuresError) throw featuresError;
      }

      const { error: deleteSpecificationsError } = await client.from("product_specifications").delete().eq("product_slug", slug);
      if (deleteSpecificationsError) throw deleteSpecificationsError;
      const specificationRows = Object.entries(specificationsByLanguage).flatMap(([language, specifications]) =>
        specifications.map((specification, position) => ({
          product_slug: slug,
          language_code: language,
          position,
          title: specification.title,
          description: specification.description,
        })),
      );
      if (specificationRows.length) {
        const { error: specificationsError } = await client.from("product_specifications").insert(specificationRows);
        if (specificationsError) throw specificationsError;
      }

      if (imageUrl) {
        const imageRecord = {
          product_slug: slug,
          image_url: storagePath ? null : imageUrl,
          storage_path: storagePath,
          alt_translations: Object.fromEntries(["en", "fr", "es", "zh", "ar"].map((language) => [language, `${brandFor(slug, formData)} ${nameTranslations[language]}`.trim()])),
          is_primary: true,
          sort_order: 0,
        };
        const { error: imageError } = await client.from("product_images").upsert(imageRecord, { onConflict: "product_slug,sort_order" });
        if (imageError) throw imageError;
      }

      productDialog.close();
      await loadCatalog();
      showToast(editingSlug ? "Product changes saved." : "Product added to catalog.");
      editingSlug = slug;
    } catch (error) {
      showProductError(error.message || "Could not save this product.");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = editingSlug ? "Save changes" : "Save product";
    }
  }

  function brandFor(slug, formData) {
    return String(formData.get("brand") || products.find((item) => item.slug === slug)?.brand || "RUQO TECH").trim();
  }

  async function deleteProduct() {
    if (!editingSlug || !window.confirm("Delete this product from the catalog?")) return;
    const { error } = await client.from("products").delete().eq("slug", editingSlug);
    if (error) {
      showProductError(error.message);
      return;
    }
    productDialog.close();
    await loadCatalog();
    showToast("Product deleted.");
  }

  function showToast(message) {
    const node = $("#admin-toast");
    node.textContent = message;
    node.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => node.classList.remove("is-visible"), 2400);
  }

  function bindEvents() {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showLoginError("");
      const submit = loginForm.querySelector("button[type=submit]");
      submit.disabled = true;
      submit.textContent = "Signing in…";
      const values = new FormData(loginForm);
      const enteredUsername = String(values.get("email") || "").trim().toLowerCase();
      const enteredPassword = String(values.get("password") || "");
      const { data, error } = await client.auth.signInWithPassword({
        email: enteredUsername,
        password: enteredPassword,
      });
      submit.disabled = false;
      submit.innerHTML = 'Sign in <i data-lucide="arrow-up-right" aria-hidden="true"></i>';
      window.lucide?.createIcons();
      if (error) {
        showLoginError("Sign-in failed. Check your credentials and try again.");
        return;
      }
      await authorizeUser(data.user);
    });

    forgotPasswordButton.addEventListener("click", async () => {
      const email = String(loginForm.elements.email.value || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showLoginError("Enter the account email address to receive a reset link.");
        return;
      }
      forgotPasswordButton.disabled = true;
      showLoginError("");
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: "https://ruqo.pro/admin/",
      });
      showLoginError(error
        ? "We couldn't start password recovery. Check your email address and try again."
        : "If this account exists, a password reset link will arrive by email.");
      forgotPasswordButton.disabled = false;
    });

    passwordRecoveryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showPasswordRecovery("");
      const password = String(passwordRecoveryForm.elements.password.value || "");
      const confirmation = String(passwordRecoveryForm.elements.confirm_password.value || "");
      if (password.length < 10) {
        showPasswordRecovery("Use at least 10 characters for the new password.", true);
        return;
      }
      if (password !== confirmation) {
        showPasswordRecovery("The passwords do not match.", true);
        return;
      }
      const submit = passwordRecoveryForm.querySelector('[type="submit"]');
      submit.disabled = true;
      const { error } = await client.auth.updateUser({ password });
      submit.disabled = false;
      if (error) {
        showPasswordRecovery("The password could not be updated. Request a new recovery link.", true);
        return;
      }
      await client.auth.signOut();
      passwordRecoveryForm.hidden = true;
      loginForm.hidden = false;
      forgotPasswordButton.hidden = false;
      passwordRecoveryForm.reset();
      showLoginError("Password updated. Sign in with your new password.");
    });

    client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        adminApp.hidden = true;
        loginScreen.hidden = false;
        loginForm.hidden = true;
        forgotPasswordButton.hidden = true;
        passwordRecoveryForm.hidden = false;
        showPasswordRecovery("");
      }
      if (event === "SIGNED_OUT") {
        adminApp.hidden = true;
        loginScreen.hidden = false;
        currentUser = null;
        loginForm.hidden = false;
        forgotPasswordButton.hidden = false;
        passwordRecoveryForm.hidden = true;
      }
    });

    $("#sign-out").addEventListener("click", async () => {
      if (localDemoMode) {
        localDemoMode = false;
        adminApp.hidden = true;
        localDevNotice.hidden = true;
        loginScreen.hidden = false;
        loginForm.reset();
        return;
      }
      const { error } = await client.auth.signOut();
      if (error) showToast("Sign out could not be completed.");
    });

    $("#admin-theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });

    $$('[data-admin-view]').forEach((button) =>
      button.addEventListener("click", () => setView(button.dataset.adminView)),
    );
    $("#add-category").addEventListener("click", openNewCategory);
    categoryForm.addEventListener("submit", saveCategory);
    $("#delete-category").addEventListener("click", deleteCategory);
    $$('[data-open-product]').forEach((button) => button.addEventListener("click", openNewProduct));
    $("#add-product-specification").addEventListener("click", addProductSpecification);
    $("#refresh-products").addEventListener("click", loadCatalog);
    $("#refresh-orders").addEventListener("click", loadOrders);
    $("#refresh-messages").addEventListener("click", loadContactMessages);
    $("#refresh-subscribers").addEventListener("click", loadNewsletterSubscribers);
    $("#add-home-spotlight").addEventListener("click", openNewHomepageSpotlight);
    $("#add-promotion").addEventListener("click", openNewPromotion);
    $("#add-banner").addEventListener("click", openNewBanner);
    brandSettingsForm.addEventListener("submit", saveBrandSettings);
    homepageShowcaseForm.addEventListener("submit", saveHomepageShowcase);
    $("#delete-home-showcase-item").addEventListener("click", () => deleteHomepageSpotlight());
    homepageShowcaseForm.elements.product_slug.addEventListener("change", updateHomepageShowcasePreview);
    homepageShowcaseForm.elements.sale_enabled.addEventListener("change", updateHomepageShowcasePreview);
    homepageShowcaseForm.elements.sale_price.addEventListener("input", updateHomepageShowcasePreview);
    brandSettingsForm.elements.logo_file.addEventListener("change", () => {
      const preview = $("#brand-logo-preview");
      if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
      const file = brandSettingsForm.elements.logo_file.files?.[0];
      brandSettingsForm.dataset.resetLogo = "false";
      if (file) {
        preview.dataset.objectUrl = URL.createObjectURL(file);
        preview.src = preview.dataset.objectUrl;
      } else {
        preview.src = getBrandLogoUrl(brandSettings.logo_path);
      }
    });
    $("#reset-brand-logo").addEventListener("click", () => {
      brandSettingsForm.elements.logo_file.value = "";
      brandSettingsForm.dataset.resetLogo = "true";
      $("#brand-logo-preview").src = "/images/ruqo-logo.png";
    });
    productSearch.addEventListener("input", renderCatalog);
    $$('[data-locale-tab]').forEach((button) =>
      button.addEventListener("click", () => setLocale(button.dataset.localeTab)),
    );
    $$('[data-close-dialog]').forEach((button) =>
      button.addEventListener("click", () => button.closest("dialog")?.close()),
    );
    [productDialog, categoryDialog, promotionDialog, bannerDialog, homepageShowcaseDialog].forEach((dialog) =>
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      }),
    );
    productForm.addEventListener("submit", saveProduct);
    promotionForm.addEventListener("submit", savePromotion);
    bannerForm.addEventListener("submit", saveBanner);
    $("#delete-product").addEventListener("click", deleteProduct);
    $("#delete-promotion").addEventListener("click", deletePromotion);
    $("#delete-banner").addEventListener("click", deleteBanner);
  }

  async function start() {
    setTheme(readSavedTheme());
    if (isLocalDevMode) {
      try {
        const localDev = await import("/js/admin-local-dev.js");
        localDevCredentials = localDev.credentials;
        if (!localDevCredentials?.username || !localDevCredentials?.password) {
          throw new Error("Local development credentials are not configured.");
        }
        bindLocalDevEvents();
        window.lucide?.createIcons();
      } catch {
        showLoginError("Local preview credentials are not installed in this workspace.");
      }
      return;
    }
    if (!config?.url || !config?.publishableKey || !clientFactory) {
      showLoginError("Supabase client configuration is not available.");
      return;
    }
    client = clientFactory(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    bindEvents();
    const { data, error } = await client.auth.getSession();
    if (error) {
      showLoginError("Could not check the current session. Refresh and try again.");
      return;
    }
    if (data.session?.user) await authorizeUser(data.session.user);
  }

  function readSavedTheme() {
    try {
      const raw = localStorage.getItem("nours-theme");
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
  }

  window.addEventListener("pageshow", () => {
    setTheme(readSavedTheme());
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "nours-theme" || !event.key) {
      setTheme(readSavedTheme());
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      setTheme(readSavedTheme());
    }
  });

  setTheme(readSavedTheme());
  window.lucide?.createIcons();
  start();
})();
