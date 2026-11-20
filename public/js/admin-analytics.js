(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const numberFormatter = new Intl.NumberFormat("en-US");
  const percentFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const formatInt = (value) => numberFormatter.format(Math.max(0, Math.round(Number(value) || 0)));
  const pluralize = (value, singular, plural) => `${formatInt(value)} ${Number(value) === 1 ? singular : plural}`;
  const formatPercent = (value) => `${percentFormatter.format(Math.max(0, Number(value) || 0))}%`;
  const formatMoney = (value, currency = "SAR") => {
    const amount = Number(value) || 0;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const pageLabels = {
    "/": "Home",
    "/products.html": "All Products",
    "/product.html": "Product Detail",
    "/categories.html": "Categories",
    "/cart.html": "Shopping Cart",
    "/checkout.html": "Checkout",
    "/orders.html": "My Orders",
    "/wishlist.html": "Wishlist",
    "/account.html": "My Account",
    "/about.html": "About Us",
    "/support.html": "Help & Policies",
    "/invoice-verify.html": "Invoice Verification",
  };

  const formatPageLabel = (path) => {
    const clean = String(path || "/").trim() || "/";
    return pageLabels[clean] || clean;
  };

  const formatShortDate = (isoDate) => {
    if (!isoDate) return "";
    const parts = String(isoDate).split("-");
    if (parts.length !== 3) return isoDate;
    const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  let supabaseClient = null;
  let getProductsFn = () => [];
  let getOrdersFn = () => [];
  let getProductImageFn = () => "/images/new/li.png";
  let getProductNameFn = (product) => product?.name_translations?.en || product?.slug || "";
  let isLocalDemo = false;
  let selectedDays = 30;
  let selectedDate = "";
  let summaryData = null;
  let loading = false;
  let bound = false;

  function buildLocalDemoSummary(days, dateStr = "") {
    const catalog = getProductsFn();
    const orderList = getOrdersFn();
    const factor = dateStr ? 0.16 : days === 1 ? 0.14 : days === 7 ? 0.35 : days === 30 ? 1 : 1.8;
    const baseProducts = catalog.length
      ? catalog.slice(0, 6)
      : [
          { slug: "macbook-pro", brand: "Apple", name_translations: { en: "MacBook Pro 16" }, price: 5499 },
          { slug: "galaxy-s25", brand: "Samsung", name_translations: { en: "Galaxy S25 Ultra" }, price: 4499 },
          { slug: "sony-xm6", brand: "Sony", name_translations: { en: "WH-1000XM6 Headphones" }, price: 1499 },
        ];

    const orderMap = new Map();
    for (const order of orderList) {
      for (const item of order.order_items || []) {
        const slug = item.product_slug;
        if (!slug) continue;
        const entry = orderMap.get(slug) || { orders_count: 0, units_ordered: 0, revenue: 0 };
        entry.orders_count += 1;
        entry.units_ordered += Number(item.quantity) || 1;
        entry.revenue += Number(item.line_total) || 0;
        orderMap.set(slug, entry);
      }
    }

    const demoWeights = [1, 0.82, 0.64, 0.48, 0.36, 0.25];
    const products = baseProducts.map((product, index) => {
      const w = demoWeights[index] ?? 0.2;
      const fromOrders = orderMap.get(product.slug);
      const product_views = Math.max(4, Math.round(145 * w * factor));
      const unique_viewers = Math.max(2, Math.round(product_views * 0.72));
      const cart_adds = Math.max(1, Math.round(28 * w * factor));
      const wishlist_adds = Math.max(1, Math.round(19 * w * factor));
      const product_shares = Math.max(1, Math.round(14 * w * factor));
      const units_ordered = fromOrders ? Math.max(fromOrders.units_ordered, Math.round(12 * w * factor)) : Math.max(1, Math.round(11 * w * factor));
      const orders_count = fromOrders ? Math.max(fromOrders.orders_count, Math.round(9 * w * factor)) : Math.max(1, Math.round(9 * w * factor));
      const revenue = fromOrders ? Math.max(fromOrders.revenue, units_ordered * (Number(product.price) || 999)) : units_ordered * (Number(product.price) || 999);
      const demand_score = units_ordered * 10 + cart_adds * 4 + product_shares * 3 + wishlist_adds * 3 + product_views;
      const conversion_rate = product_views > 0 ? Number(((orders_count / product_views) * 100).toFixed(1)) : 0;
      return {
        product_slug: product.slug,
        product_views,
        unique_viewers,
        cart_adds,
        wishlist_adds,
        product_shares,
        orders_count,
        units_ordered,
        revenue,
        demand_score,
        conversion_rate,
      };
    });

    const totalProductViews = products.reduce((sum, p) => sum + p.product_views, 0);
    const totalUniqueProductViewers = products.reduce((sum, p) => sum + p.unique_viewers, 0);
    const totalShares = products.reduce((sum, p) => sum + p.product_shares, 0);
    const totalCartAdds = products.reduce((sum, p) => sum + p.cart_adds, 0);
    const totalWishlistAdds = products.reduce((sum, p) => sum + p.wishlist_adds, 0);
    const totalOrders = products.reduce((sum, p) => sum + p.orders_count, 0);
    const totalUnits = products.reduce((sum, p) => sum + p.units_ordered, 0);
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const siteVisits = Math.round(totalProductViews * 2.4);
    const uniqueVisitors = Math.round(siteVisits * 0.62);

    const daily = [];
    if (dateStr) {
      daily.push({
        day: dateStr,
        site_visits: siteVisits,
        product_views: totalProductViews,
        orders: totalOrders,
      });
    } else {
      const chartDays = days === 1 ? 1 : days === 7 ? 7 : 14;
      const now = new Date();
      for (let offset = chartDays - 1; offset >= 0; offset -= 1) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
        const wave = 0.72 + ((Math.sin(offset * 1.1) + 1) * 0.28);
        const dayVisits = Math.max(4, Math.round((siteVisits / chartDays) * wave));
        const dayViews = Math.max(2, Math.round((totalProductViews / chartDays) * wave));
        const dayOrders = Math.max(0, Math.round((totalOrders / chartDays) * wave));
        daily.push({
          day: d.toISOString().slice(0, 10),
          site_visits: dayVisits,
          product_views: dayViews,
          orders: dayOrders,
        });
      }
    }

    const top_pages = [
      { page_path: "/", visits: Math.round(siteVisits * 0.34), unique_visitors: Math.round(uniqueVisitors * 0.54) },
      { page_path: "/product.html", visits: Math.round(siteVisits * 0.28), unique_visitors: Math.round(uniqueVisitors * 0.42) },
      { page_path: "/products.html", visits: Math.round(siteVisits * 0.16), unique_visitors: Math.round(uniqueVisitors * 0.28) },
      { page_path: "/cart.html", visits: Math.round(siteVisits * 0.09), unique_visitors: Math.round(uniqueVisitors * 0.17) },
      { page_path: "/checkout.html", visits: Math.round(siteVisits * 0.06), unique_visitors: Math.round(uniqueVisitors * 0.11) },
      { page_path: "/support.html", visits: Math.round(siteVisits * 0.04), unique_visitors: Math.round(uniqueVisitors * 0.08) },
    ];

    return {
      days,
      generated_at: new Date().toISOString(),
      kpis: {
        site_visits: siteVisits,
        unique_visitors: uniqueVisitors,
        product_views: totalProductViews,
        unique_product_viewers: totalUniqueProductViewers,
        product_shares: totalShares,
        cart_adds: totalCartAdds,
        wishlist_adds: totalWishlistAdds,
        total_orders: totalOrders,
        total_units_ordered: totalUnits,
        total_revenue: totalRevenue,
        conversion_rate: totalProductViews > 0 ? Number(((totalOrders / totalProductViews) * 100).toFixed(1)) : 0,
      },
      daily,
      top_pages,
      products,
    };
  }

  function buildOrdersFallbackSummary(days, dateStr = "") {
    const orderList = getOrdersFn();
    const cutoff = !dateStr && days > 0 ? Date.now() - days * 86400000 : 0;
    const filteredOrders = orderList.filter((order) => {
      if (dateStr) {
        return String(order.created_at || "").slice(0, 10) === dateStr;
      }
      if (!cutoff) return true;
      const ts = new Date(order.created_at).getTime();
      return Number.isFinite(ts) && ts >= cutoff;
    });

    const byProduct = new Map();
    let totalUnits = 0;
    let totalRevenue = 0;
    for (const order of filteredOrders) {
      totalRevenue += Number(order.total) || 0;
      for (const item of order.order_items || []) {
        const slug = item.product_slug;
        if (!slug) continue;
        const qty = Number(item.quantity) || 0;
        const lineTotal = Number(item.line_total) || 0;
        totalUnits += qty;
        const row = byProduct.get(slug) || {
          product_slug: slug,
          product_views: 0,
          unique_viewers: 0,
          cart_adds: 0,
          wishlist_adds: 0,
          product_shares: 0,
          orders_count: 0,
          units_ordered: 0,
          revenue: 0,
          demand_score: 0,
          conversion_rate: 0,
        };
        row.orders_count += 1;
        row.units_ordered += qty;
        row.revenue += lineTotal;
        row.demand_score = row.units_ordered * 10;
        byProduct.set(slug, row);
      }
    }

    return {
      days,
      generated_at: new Date().toISOString(),
      fallback: true,
      kpis: {
        site_visits: 0,
        unique_visitors: 0,
        product_views: 0,
        unique_product_viewers: 0,
        product_shares: 0,
        cart_adds: 0,
        wishlist_adds: 0,
        total_orders: filteredOrders.length,
        total_units_ordered: totalUnits,
        total_revenue: totalRevenue,
        conversion_rate: 0,
      },
      daily: [],
      top_pages: [],
      products: [...byProduct.values()].sort((a, b) => b.units_ordered - a.units_ordered),
    };
  }

  function resolveProductMeta(slug) {
    const product = getProductsFn().find((item) => item.slug === slug);
    if (product) {
      return {
        slug,
        name: getProductNameFn(product),
        brand: product.brand || "",
        image: getProductImageFn(product),
        inStock: product.in_stock !== false,
        currency: product.currency || "SAR",
      };
    }
    return {
      slug,
      name: slug
        .split("-")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
        .join(" "),
      brand: "Catalog item",
      image: "/images/new/li.png",
      inStock: true,
      currency: "SAR",
    };
  }

  function setStatusNotice(message, isError = false) {
    const notice = $("#analytics-status");
    if (!notice) return;
    if (!message) {
      notice.hidden = true;
      notice.textContent = "";
      notice.classList.remove("is-error");
      return;
    }
    notice.hidden = false;
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
  }

  function renderKpis(kpis) {
    const setText = (selector, value) => {
      const node = $(selector);
      if (node) node.textContent = value;
    };
    setText("#analytics-kpi-visits", formatInt(kpis.site_visits));
    setText("#analytics-kpi-visits-sub", `${formatInt(kpis.unique_visitors)} unique sessions`);

    setText("#analytics-kpi-product-views", formatInt(kpis.product_views));
    setText("#analytics-kpi-product-views-sub", `${formatInt(kpis.unique_product_viewers)} unique viewers`);

    const interestTotal = (Number(kpis.cart_adds) || 0) + (Number(kpis.wishlist_adds) || 0);
    setText("#analytics-kpi-interest", formatInt(interestTotal));
    setText("#analytics-kpi-interest-sub", `${formatInt(kpis.cart_adds)} cart · ${formatInt(kpis.wishlist_adds)} wishlist`);

    setText("#analytics-kpi-shares", formatInt(kpis.product_shares));
    setText("#analytics-kpi-shares-sub", "Shared product links");

    setText("#analytics-kpi-orders", formatInt(kpis.total_orders));
    setText(
      "#analytics-kpi-orders-sub",
      `${formatInt(kpis.total_units_ordered)} units · ${formatPercent(kpis.conversion_rate)} view-to-order`,
    );
  }

  function renderTopList(containerSelector, items, mode) {
    const container = $(containerSelector);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<div class="analytics-empty-inline"><i data-lucide="bar-chart-3" aria-hidden="true"></i><span>No activity recorded in this period yet.</span></div>`;
      window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
      return;
    }

    const maxValue = Math.max(
      1,
      ...items.map((item) => (mode === "ordered" ? Number(item.units_ordered) || 0 : Number(item.demand_score) || 0)),
    );

    container.innerHTML = items
      .map((item, index) => {
        const meta = resolveProductMeta(item.product_slug);
        const value = mode === "ordered" ? Number(item.units_ordered) || 0 : Number(item.demand_score) || 0;
        const pct = Math.max(6, Math.round((value / maxValue) * 100));
        const primaryMetric =
          mode === "ordered"
            ? pluralize(item.units_ordered, "unit", "units")
            : `${formatInt(item.demand_score)} pts`;
        const secondaryMetrics =
          mode === "ordered"
            ? `${pluralize(item.orders_count, "order", "orders")} · ${formatMoney(item.revenue, meta.currency)}`
            : `${formatInt(item.product_views)} views · ${formatInt(item.cart_adds)} cart · ${formatInt(item.product_shares)} shares · ${formatInt(item.units_ordered)} ordered`;

        return `
          <article class="analytics-rank-item">
            <span class="analytics-rank-badge${index === 0 ? " is-top" : ""}">#${index + 1}</span>
            <img class="analytics-rank-thumb" src="${escapeHtml(meta.image)}" alt="" loading="lazy" />
            <div class="analytics-rank-body">
              <div class="analytics-rank-row">
                <strong title="${escapeHtml(meta.name)}">${escapeHtml(meta.name)}</strong>
                <span class="analytics-rank-value">${primaryMetric}</span>
              </div>
              <div class="analytics-rank-meta">
                <span>${secondaryMetrics}</span>
                ${!meta.inStock ? `<span class="admin-status is-out">Out of stock</span>` : ""}
              </div>
              <div class="analytics-bar-track" aria-hidden="true">
                <span class="analytics-bar-fill${mode === "demand" ? " is-demand" : ""}" style="width:${pct}%"></span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderDailyChart(daily) {
    const container = $("#analytics-daily-chart");
    if (!container) return;
    if (!Array.isArray(daily) || !daily.length) {
      container.innerHTML = `<div class="analytics-empty-inline"><i data-lucide="activity" aria-hidden="true"></i><span>Daily traffic will appear here as visitors browse your store.</span></div>`;
      window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
      return;
    }

    const maxCount = Math.max(
      1,
      ...daily.map((entry) => Math.max(Number(entry.site_visits) || 0, Number(entry.product_views) || 0, Number(entry.orders) || 0)),
    );
    const labelStride = daily.length > 16 ? 3 : daily.length > 10 ? 2 : 1;

    container.innerHTML = `
      <div class="analytics-chart-bars" style="--analytics-days:${daily.length}">
        ${daily
          .map((entry, index) => {
            const visits = Number(entry.site_visits) || 0;
            const views = Number(entry.product_views) || 0;
            const orders = Number(entry.orders) || 0;
            const visitsH = visits > 0 ? Math.max(5, Math.round((visits / maxCount) * 100)) : 0;
            const viewsH = views > 0 ? Math.max(5, Math.round((views / maxCount) * 100)) : 0;
            const ordersH = orders > 0 ? Math.max(5, Math.round((orders / maxCount) * 100)) : 0;
            const label = formatShortDate(entry.day);
            const showLabel = index === 0 || index === daily.length - 1 || index % labelStride === 0;
            const tooltip = `${label} — ${formatInt(visits)} visits · ${formatInt(views)} product views · ${formatInt(orders)} orders`;
            return `
              <div class="analytics-chart-col" title="${escapeHtml(tooltip)}">
                <div class="analytics-chart-group">
                  <span class="analytics-chart-bar is-visits" style="height:${visitsH}%"></span>
                  <span class="analytics-chart-bar is-views" style="height:${viewsH}%"></span>
                  <span class="analytics-chart-bar is-orders" style="height:${ordersH}%"></span>
                </div>
                <span class="analytics-chart-label">${showLabel ? escapeHtml(label) : ""}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderTopPages(pages) {
    const container = $("#analytics-top-pages");
    if (!container) return;
    if (!Array.isArray(pages) || !pages.length) {
      container.innerHTML = `<div class="analytics-empty-inline"><i data-lucide="globe" aria-hidden="true"></i><span>No page visits recorded in this period yet.</span></div>`;
      window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
      return;
    }

    const maxVisits = Math.max(1, ...pages.map((page) => Number(page.visits) || 0));
    container.innerHTML = pages
      .map((page) => {
        const visits = Number(page.visits) || 0;
        const unique = Number(page.unique_visitors) || 0;
        const pct = Math.max(6, Math.round((visits / maxVisits) * 100));
        return `
          <div class="analytics-page-row">
            <div class="analytics-page-head">
              <div>
                <strong>${escapeHtml(formatPageLabel(page.page_path))}</strong>
                <small>${escapeHtml(page.page_path)}</small>
              </div>
              <div class="analytics-page-counts">
                <strong>${formatInt(visits)}</strong>
                <small>${formatInt(unique)} sessions</small>
              </div>
            </div>
            <div class="analytics-bar-track" aria-hidden="true">
              <span class="analytics-bar-fill is-page" style="width:${pct}%"></span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderProductsTable() {
    const tbody = $("#analytics-products-body");
    const empty = $("#analytics-products-empty");
    if (!tbody || !empty) return;

    const rawProducts = Array.isArray(summaryData?.products) ? summaryData.products : [];
    const query = ($("#analytics-product-search")?.value || "").trim().toLowerCase();
    const sortBy = $("#analytics-product-sort")?.value || "demand_score";

    const enriched = rawProducts.map((row) => ({
      ...row,
      meta: resolveProductMeta(row.product_slug),
    }));

    const filtered = enriched.filter((row) => {
      if (!query) return true;
      return (
        row.meta.name.toLowerCase().includes(query) ||
        row.meta.brand.toLowerCase().includes(query) ||
        row.product_slug.toLowerCase().includes(query)
      );
    });

    filtered.sort((a, b) => {
      const diff = (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0);
      if (diff !== 0) return diff;
      return (Number(b.demand_score) || 0) - (Number(a.demand_score) || 0);
    });

    empty.hidden = filtered.length > 0;
    tbody.innerHTML = filtered
      .map((row) => `
        <tr>
          <td>
            <div class="admin-product-cell analytics-product-cell">
              <img src="${escapeHtml(row.meta.image)}" alt="" loading="lazy" />
              <div>
                <strong>${escapeHtml(row.meta.name)}</strong>
                <small>${escapeHtml(row.meta.brand || row.product_slug)}</small>
              </div>
            </div>
          </td>
          <td>
            <strong>${formatInt(row.product_views)}</strong>
            <small class="analytics-cell-sub">${formatInt(row.unique_viewers)} unique</small>
          </td>
          <td><strong>${formatInt(row.cart_adds)}</strong></td>
          <td><strong>${formatInt(row.wishlist_adds)}</strong></td>
          <td><strong>${formatInt(row.product_shares)}</strong></td>
          <td>
            <strong>${formatInt(row.units_ordered)}</strong>
            <small class="analytics-cell-sub">${pluralize(row.orders_count, "order", "orders")}</small>
          </td>
          <td><span class="analytics-pill">${formatPercent(row.conversion_rate)}</span></td>
          <td><span class="analytics-demand-pill">${formatInt(row.demand_score)}</span></td>
        </tr>
      `)
      .join("");
  }

  function renderAll() {
    if (!summaryData) return;
    renderKpis(summaryData.kpis || {});

    const products = Array.isArray(summaryData.products) ? summaryData.products : [];
    const topOrdered = [...products]
      .filter((item) => (Number(item.units_ordered) || 0) > 0)
      .sort((a, b) => (Number(b.units_ordered) || 0) - (Number(a.units_ordered) || 0) || (Number(b.revenue) || 0) - (Number(a.revenue) || 0))
      .slice(0, 5);
    const highDemand = [...products]
      .filter((item) => (Number(item.demand_score) || 0) > 0)
      .sort((a, b) => (Number(b.demand_score) || 0) - (Number(a.demand_score) || 0))
      .slice(0, 5);

    renderTopList("#analytics-top-ordered", topOrdered, "ordered");
    renderTopList("#analytics-high-demand", highDemand, "demand");
    renderDailyChart(summaryData.daily || []);
    renderTopPages(summaryData.top_pages || []);
    renderProductsTable();
  }

  async function load(days = selectedDays, dateStr = selectedDate) {
    selectedDate = String(dateStr || "").trim();
    if (!selectedDate) {
      selectedDays = Number(days);
    }
    $$("[data-analytics-range]").forEach((button) => {
      const active = !selectedDate && Number(button.dataset.analyticsRange) === selectedDays;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const dayPicker = $("#analytics-day-picker");
    const dayInput = $("#analytics-day-input");
    if (dayPicker) dayPicker.classList.toggle("is-active", Boolean(selectedDate));
    if (dayInput && dayInput.value !== selectedDate) dayInput.value = selectedDate;

    if (isLocalDemo || !supabaseClient) {
      summaryData = buildLocalDemoSummary(selectedDays, selectedDate);
      setStatusNotice("Showing sample analytics data in local preview mode.");
      renderAll();
      return summaryData;
    }

    if (loading) return summaryData;
    loading = true;
    const refreshButton = $("#refresh-analytics");
    if (refreshButton) refreshButton.disabled = true;

    try {
      const rpcParams = selectedDate
        ? { p_days: null, p_date: selectedDate }
        : { p_days: selectedDays > 0 ? selectedDays : null, p_date: null };
      const { data, error } = await supabaseClient.rpc("get_store_analytics_summary", rpcParams);
      if (error) throw error;
      summaryData = data;
      setStatusNotice("");
      renderAll();
      return summaryData;
    } catch (error) {
      console.warn("Could not load analytics RPC; falling back to order metrics.", error);
      summaryData = buildOrdersFallbackSummary(selectedDays, selectedDate);
      setStatusNotice(
        "Visit & share tracking is ready after applying the latest Supabase analytics migration. Showing order demand from existing orders.",
        false,
      );
      renderAll();
      return summaryData;
    } finally {
      loading = false;
      if (refreshButton) refreshButton.disabled = false;
    }
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    const dayInput = $("#analytics-day-input");
    if (dayInput) {
      dayInput.max = new Date().toISOString().slice(0, 10);
      dayInput.addEventListener("change", () => {
        const picked = dayInput.value.trim();
        if (picked) load(selectedDays, picked);
        else load(selectedDays, "");
      });
    }
    $$("[data-analytics-range]").forEach((button) => {
      button.addEventListener("click", () => {
        const days = Number(button.dataset.analyticsRange);
        load(days, "");
      });
    });
    $("#refresh-analytics")?.addEventListener("click", () => load(selectedDays, selectedDate));
    $("#analytics-product-search")?.addEventListener("input", renderProductsTable);
    $("#analytics-product-sort")?.addEventListener("change", renderProductsTable);
  }

  window.RUQO_ADMIN_ANALYTICS = {
    init({ client, getProducts, getOrders, getProductImage, getProductName, localDemo = false }) {
      supabaseClient = client || null;
      if (typeof getProducts === "function") getProductsFn = getProducts;
      if (typeof getOrders === "function") getOrdersFn = getOrders;
      if (typeof getProductImage === "function") getProductImageFn = getProductImage;
      if (typeof getProductName === "function") getProductNameFn = getProductName;
      isLocalDemo = Boolean(localDemo);
      bindEvents();
      return load(selectedDays);
    },
    reload() {
      return load(selectedDays);
    },
    rerender() {
      renderAll();
    },
  };
})();
