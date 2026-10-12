(() => {
  const config = window.RUQO_SUPABASE_CONFIG;
  const clientFactory = window.supabase?.createClient;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const languages = ["en", "fr", "es", "zh", "ar"];
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
  const productForm = $("#product-form");
  const productDialog = $("#product-dialog");
  const productError = $("#product-form-error");
  const productSearch = $("#product-search");
  const productsBody = $("#products-body");
  const recentProductsBody = $("#recent-products-body");
  const productsEmpty = $("#products-empty");
  let client;
  let currentUser;
  let products = [];
  let categories = [];
  let editingSlug = null;
  let toastTimer;

  function setTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("nours-theme", JSON.stringify(nextTheme));
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

  function setView(view) {
    const selectedView = view === "products" ? "products" : "overview";
    $$('[data-admin-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.adminPanel !== selectedView;
    });
    $$('[data-admin-view]').forEach((button) => {
      const active = button.dataset.adminView === selectedView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    $("#breadcrumb-current").textContent =
      selectedView === "products" ? "Products" : "Overview";
  }

  async function requireCatalogRole(user) {
    const { data, error } = await client
      .from("staff_roles")
      .select("role")
      .eq("user_id", user.id);
    if (error) throw error;
    const allowedRoles = new Set(["owner", "admin", "catalog_manager"]);
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
      loginScreen.hidden = true;
      adminApp.hidden = false;
      $("#admin-user").textContent = user.email || "RUQO staff";
      $(".connection-indicator").title = `Authenticated as ${roles.join(", ")}`;
      setView("overview");
      await loadCatalog();
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
    category.textContent = categoryLabels[product.category_slug] || product.category_slug;
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
    stockBadge.className = `admin-status ${product.in_stock ? "is-published" : "is-out"}`;
    stockBadge.textContent = product.in_stock ? "In stock" : "Out of stock";
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
    $("#stat-out-of-stock").textContent = String(products.filter((product) => !product.in_stock).length);
    window.lucide?.createIcons();
  }

  async function loadCatalog() {
    const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }] = await Promise.all([
      client.from("categories").select("slug, name_translations, sort_order").order("sort_order"),
      client.from("products").select("slug, category_slug, brand, name_translations, description_translations, price, compare_at_price, currency, badge, in_stock, is_active, is_featured, sort_order, external_image_url").order("sort_order", { ascending: false }),
    ]);
    if (categoryError) throw categoryError;
    if (productError) throw productError;
    categories = categoryRows || [];
    products = productRows || [];
    renderCatalog();
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

  function setProductTranslations(product, features = []) {
    for (const language of ["en", "fr", "es", "zh", "ar"]) {
      productForm.elements[`name_${language}`].value = product?.name_translations?.[language] || "";
      productForm.elements[`description_${language}`].value = product?.description_translations?.[language] || "";
      productForm.elements[`features_${language}`].value = features
        .filter((feature) => feature.language_code === language)
        .sort((a, b) => a.position - b.position)
        .map((feature) => feature.content)
        .join("\n");
    }
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
    setProductTranslations(product, features || []);
    setLocale("en");
    productDialog.showModal();
  }

  async function saveProduct(event) {
    event.preventDefault();
    showProductError("");
    const formData = new FormData(productForm);
    const slug = String(formData.get("slug") || "").trim().toLowerCase();
    const englishName = String(formData.get("name_en") || "").trim();
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
    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < price)) {
      showProductError("Compare-at price must be greater than or equal to the price.");
      return;
    }

    const saveButton = $("#save-product");
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    try {
      const nameTranslations = {};
      const descriptionTranslations = {};
      const featuresByLanguage = {};
      for (const language of ["en", "fr", "es", "zh", "ar"]) {
        nameTranslations[language] = String(formData.get(`name_${language}`) || "").trim() || englishName;
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
        description_translations: descriptionTranslations,
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
      const { data, error } = await client.auth.signInWithPassword({
        email: String(values.get("email") || "").trim(),
        password: String(values.get("password") || ""),
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

    client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        adminApp.hidden = true;
        loginScreen.hidden = false;
        currentUser = null;
      }
    });

    $("#sign-out").addEventListener("click", async () => {
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
    $$('[data-open-product]').forEach((button) => button.addEventListener("click", openNewProduct));
    $("#refresh-products").addEventListener("click", loadCatalog);
    productSearch.addEventListener("input", renderCatalog);
    $$('[data-locale-tab]').forEach((button) =>
      button.addEventListener("click", () => setLocale(button.dataset.localeTab)),
    );
    $$('[data-close-dialog]').forEach((button) =>
      button.addEventListener("click", () => productDialog.close()),
    );
    productDialog.addEventListener("click", (event) => {
      if (event.target === productDialog) productDialog.close();
    });
    productForm.addEventListener("submit", saveProduct);
    $("#delete-product").addEventListener("click", deleteProduct);
  }

  async function start() {
    setTheme(readSavedTheme());
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
      return JSON.parse(localStorage.getItem("nours-theme")) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  setTheme(readSavedTheme());
  window.lucide?.createIcons();
  start();
})();
