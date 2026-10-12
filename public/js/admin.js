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
  const promotionForm = $("#promotion-form");
  const promotionDialog = $("#promotion-dialog");
  const bannerForm = $("#banner-form");
  const bannerDialog = $("#banner-dialog");
  const productSearch = $("#product-search");
  const productsBody = $("#products-body");
  const recentProductsBody = $("#recent-products-body");
  const productsEmpty = $("#products-empty");
  let client;
  let currentUser;
  let products = [];
  let currentRoles = [];
  let categories = [];
  let orders = [];
  let promotions = [];
  let banners = [];
  let editingSlug = null;
  let editingPromotionId = null;
  let editingBannerId = null;
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
    const allowedViews = new Set(["overview"]);
    if (currentRoles.some((role) => ["owner", "admin", "catalog_manager"].includes(role))) allowedViews.add("products");
    if (currentRoles.some((role) => ["owner", "admin", "order_manager"].includes(role))) allowedViews.add("orders");
    if (currentRoles.some((role) => ["owner", "admin", "marketing_manager"].includes(role))) {
      allowedViews.add("promotions");
      allowedViews.add("banners");
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
      orders: "Orders",
      promotions: "Offers",
      banners: "Banners",
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

  function canManage(roles) {
    return roles.some((role) => currentRoles.includes(role));
  }

  async function loadAdminData() {
    const tasks = [];
    if (canManage(["owner", "admin", "catalog_manager"])) tasks.push(loadCatalog());
    if (canManage(["owner", "admin", "order_manager"])) tasks.push(loadOrders());
    if (canManage(["owner", "admin", "marketing_manager"])) {
      tasks.push(loadPromotions(), loadBanners());
    }
    const results = await Promise.allSettled(tasks);
    results.filter((result) => result.status === "rejected").forEach((result) => {
      showToast(`Could not load a section: ${result.reason?.message || "Unknown error"}`);
    });
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
    $("#refresh-orders").addEventListener("click", loadOrders);
    $("#add-promotion").addEventListener("click", openNewPromotion);
    $("#add-banner").addEventListener("click", openNewBanner);
    productSearch.addEventListener("input", renderCatalog);
    $$('[data-locale-tab]').forEach((button) =>
      button.addEventListener("click", () => setLocale(button.dataset.localeTab)),
    );
    $$('[data-close-dialog]').forEach((button) =>
      button.addEventListener("click", () => button.closest("dialog")?.close()),
    );
    [productDialog, promotionDialog, bannerDialog].forEach((dialog) =>
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
