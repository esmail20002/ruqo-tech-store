(() => {
  const state = { query: "", brand: "", min: null, max: null, stock: false, sort: "name" };
  const dictionaries = {
    en: { filters: "Refine your discovery", search: "Search a category or product", brand: "Brand", any: "All brands", min: "Minimum price", max: "Maximum price", stock: "In stock only", reset: "Reset filters", sort: "Sort catalogs", name: "Name", count: "Most matches", price: "Lowest starting price", from: "From", matches: "Matching products", catalogs: "Catalogs", brands: "Brands", preview: "Quick preview", close: "Close", results: "Explore all results", none: "No matching catalogs", hint: "Try a wider budget or remove a filter.", invalid: "The maximum must be greater than or equal to the minimum.", active: "Active filters", apply: "Show results", available: "In stock", unavailable: "Out of stock", total: "Total products", noProducts: "No products in this catalog yet.", remove: "Remove filter", previewNote: "A selection of up to four matching products.", budget: "Budget" },
    ar: { filters: "خصّص اكتشافك", search: "ابحث عن قسم أو منتج", brand: "العلامة التجارية", any: "كل العلامات", min: "أقل سعر", max: "أعلى سعر", stock: "المتوفر فقط", reset: "مسح الفلاتر", sort: "ترتيب الكتالوجات", name: "الاسم", count: "الأكثر مطابقة", price: "الأقل سعراً", from: "ابتداءً من", matches: "منتجات مطابقة", catalogs: "الكتالوجات", brands: "العلامات", preview: "معاينة الكتالوج", close: "إغلاق", results: "استكشف كل النتائج", none: "لا توجد كتالوجات مطابقة", hint: "جرّب توسيع الميزانية أو إزالة أحد الفلاتر.", invalid: "يجب أن يكون أعلى سعر أكبر من أقل سعر أو مساوياً له.", active: "الفلاتر المختارة", apply: "عرض النتائج", available: "متوفر", unavailable: "غير متوفر", total: "إجمالي المنتجات", noProducts: "لا توجد منتجات في هذا الكتالوج بعد.", remove: "إزالة الفلتر", previewNote: "مجموعة مختارة من أربعة منتجات مطابقة كحد أقصى.", budget: "الميزانية" },
    fr: { filters: "Affinez votre découverte", search: "Rechercher une catégorie ou un produit", brand: "Marque", any: "Toutes les marques", min: "Prix minimum", max: "Prix maximum", stock: "En stock uniquement", reset: "Réinitialiser", sort: "Trier les catalogues", name: "Nom", count: "Plus de résultats", price: "Prix de départ croissant", from: "Dès", matches: "Produits correspondants", catalogs: "Catalogues", brands: "Marques", preview: "Aperçu rapide", close: "Fermer", results: "Voir tous les résultats", none: "Aucun catalogue correspondant", hint: "Élargissez le budget ou retirez un filtre.", invalid: "Le maximum doit être supérieur ou égal au minimum.", active: "Filtres actifs", apply: "Voir les résultats", available: "En stock", unavailable: "Indisponible", total: "Total des produits", noProducts: "Aucun produit dans ce catalogue pour le moment.", remove: "Retirer le filtre", previewNote: "Une sélection de quatre produits correspondants au maximum.", budget: "Budget" },
    es: { filters: "Afina tu búsqueda", search: "Buscar una categoría o producto", brand: "Marca", any: "Todas las marcas", min: "Precio mínimo", max: "Precio máximo", stock: "Solo disponibles", reset: "Restablecer filtros", sort: "Ordenar catálogos", name: "Nombre", count: "Más coincidencias", price: "Menor precio inicial", from: "Desde", matches: "Productos coincidentes", catalogs: "Catálogos", brands: "Marcas", preview: "Vista rápida", close: "Cerrar", results: "Ver todos los resultados", none: "No hay catálogos coincidentes", hint: "Amplía el presupuesto o elimina un filtro.", invalid: "El máximo debe ser mayor o igual al mínimo.", active: "Filtros activos", apply: "Ver resultados", available: "Disponible", unavailable: "Agotado", total: "Total de productos", noProducts: "Este catálogo aún no tiene productos.", remove: "Eliminar filtro", previewNote: "Una selección de hasta cuatro productos coincidentes.", budget: "Presupuesto" },
    zh: { filters: "细化你的探索", search: "搜索分类或产品", brand: "品牌", any: "所有品牌", min: "最低价格", max: "最高价格", stock: "仅显示有货", reset: "重置筛选", sort: "目录排序", name: "名称", count: "最多匹配", price: "最低起价", from: "起价", matches: "匹配产品", catalogs: "目录", brands: "品牌", preview: "快速预览", close: "关闭", results: "查看全部结果", none: "没有匹配的目录", hint: "请扩大预算或移除筛选条件。", invalid: "最高价格不能低于最低价格。", active: "已选筛选", apply: "显示结果", available: "有货", unavailable: "缺货", total: "产品总数", noProducts: "此目录暂无产品。", remove: "移除筛选", previewNote: "最多展示四款匹配产品。", budget: "预算" },
  };

  window.mountCatalogExplorer = (root, base, language) => {
    const copy = dictionaries[language];
    const store = window.NoursStore;
    const data = window.NoursData;
    const currency = store.getCurrency();
    const number = (value) => new Intl.NumberFormat(language).format(value);
    const money = (value) => new Intl.NumberFormat(language, { style: "currency", currency, maximumFractionDigits: 2 }).format(store.convertCurrency(value, "SAR", currency));
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const button = (text, className = "explorer-button") => {
      const node = element("button", className, text);
      node.type = "button";
      return node;
    };
    const categories = data.getCategories();
    const catalogSlugs = new Set(categories.map((category) => category.slug));
    const products = data.products.filter((product) => catalogSlugs.has(product.category));
    const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, language));
    const categoryName = (category) => category.name_translations?.[language] || category.name_translations?.en || category.slug;
    const icon = (name) => {
      const node = element("i");
      node.dataset.lucide = name;
      node.setAttribute("aria-hidden", "true");
      return node;
    };
    const buildUrl = (category, brand = state.brand) => {
      const url = new URL("products.html", location.href);
      url.searchParams.set("category", category.slug);
      url.searchParams.set("catalog", "1");
      if (state.query.trim()) url.searchParams.set("q", state.query.trim());
      if (brand) url.searchParams.set("brand", brand);
      if (state.min !== null) url.searchParams.set("min", String(state.min));
      if (state.max !== null) url.searchParams.set("max", String(state.max));
      if (state.stock) url.searchParams.set("stock", "1");
      return url.href;
    };
    const photo = (source, className, desktopOnly = false) => {
      const frame = element("div", className);
      frame.append(icon("package"));
      if (source) {
        const image = element("img");
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          console.warn("Catalog image failed to load.", image.src);
          image.hidden = true;
          frame.append(element("small", "catalog-category-image-error", base.imageError));
        }, { once: true });
        if (desktopOnly) {
          const picture = element("picture");
          const desktop = element("source");
          desktop.media = "(min-width: 1001px)";
          desktop.srcset = source;
          image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'/%3E";
          picture.append(desktop, image);
          frame.append(picture);
        } else {
          image.src = source;
          frame.append(image);
        }
      }
      return frame;
    };
    const intro = root.parentElement.querySelector(".catalogs-intro");
    const introCopy = intro.firstElementChild;
    introCopy.classList.add("catalogs-intro-copy");
    introCopy.append(intro.querySelector(".catalogs-all-link"));
    const showcaseProducts = categories
      .map((category) => products.find((product) => product.category === category.slug && product.image))
      .filter(Boolean)
      .slice(0, 3);
    if (showcaseProducts.length) {
      const showcase = element("div", "catalogs-showcase");
      showcase.setAttribute("aria-hidden", "true");
      for (const product of showcaseProducts) {
        const tile = photo(product.image, "catalogs-showcase-tile", true);
        tile.append(element("span", "", data.localizeProduct(product, language).name));
        showcase.append(tile);
      }
      intro.append(showcase);
    }
    const stats = element("div", "explorer-stats");
    for (const [label, value, symbol] of [[copy.catalogs, categories.length, "layout-grid"], [base.products, products.length, "package"], [copy.brands, brands.length, "badge-check"]]) {
      const stat = element("div");
      stat.append(icon(symbol), element("strong", "", number(value)), element("span", "", label));
      stats.append(stat);
    }
    root.append(stats);
    const layout = element("div", "explorer-layout");
    const filterDialog = element("dialog", "explorer-filter-dialog");
    filterDialog.setAttribute("aria-labelledby", "explorer-filter-title");
    const filterPanel = element("aside", "explorer-filters");
    const filterHeading = element("div", "explorer-filter-heading");
    const heading = element("h2", "", copy.filters);
    heading.id = "explorer-filter-title";
    const closeFilters = button(copy.close, "explorer-mobile-close");
    const filterTitle = element("div", "explorer-filter-title");
    filterTitle.append(icon("sliders-horizontal"), heading);
    filterHeading.append(filterTitle, closeFilters);
    filterPanel.append(filterHeading);
    const controls = element("form", "explorer-controls");
    controls.noValidate = true;
    const field = (text, input, symbol) => {
      const label = element("label", "explorer-field");
      const caption = element("span", "explorer-field-caption");
      if (symbol) caption.append(icon(symbol));
      caption.append(document.createTextNode(text));
      label.append(caption, input);
      controls.append(label);
      return input;
    };
    const search = element("input");
    search.type = "search";
    search.maxLength = 160;
    search.value = state.query;
    search.placeholder = copy.search;
    field(copy.search, search, "search");
    const brand = element("select");
    for (const value of ["", ...brands]) {
      const option = element("option", "", value || copy.any);
      option.value = value;
      brand.append(option);
    }
    // Retain an explicitly selected brand if a catalog refresh removes its products.
    if (state.brand && !brands.includes(state.brand)) {
      const option = element("option", "", state.brand);
      option.value = state.brand;
      brand.append(option);
    }
    brand.value = state.brand;
    field(copy.brand, brand, "tag");
    const budget = element("fieldset", "explorer-budget");
    const budgetLegend = element("legend");
    budgetLegend.append(icon("wallet"), document.createTextNode(`${copy.budget} · ${currency}`));
    budget.append(budgetLegend);
    controls.append(budget);
    const priceInput = (key, label) => {
      const input = element("input");
      input.type = "number";
      input.min = "0";
      input.step = "any";
      input.inputMode = "decimal";
      input.value = state[key] === null ? "" : String(store.convertCurrencyExact(state[key], "SAR", currency));
      field(label, input);
      budget.append(input.parentElement);
      return input;
    };
    const min = priceInput("min", copy.min);
    const max = priceInput("max", copy.max);
    const stockLabel = element("label", "explorer-stock");
    const stock = element("input");
    stock.type = "checkbox";
    stock.checked = state.stock;
    stockLabel.append(stock, element("span", "", copy.stock));
    controls.append(stockLabel);
    const error = element("p", "explorer-error");
    error.setAttribute("role", "alert");
    const reset = button(copy.reset);
    const apply = button(copy.apply, "explorer-apply");
    controls.append(error, reset, apply);
    filterPanel.append(controls);
    const content = element("section", "explorer-content");
    const toolbar = element("div", "explorer-toolbar");
    const openFilters = button(copy.filters, "explorer-open-filters");
    const status = element("p", "explorer-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const sortLabel = element("label", "explorer-sort");
    const sort = element("select");
    for (const [value, text] of [["name", copy.name], ["count", copy.count], ["price", copy.price]]) {
      const option = element("option", "", text);
      option.value = value;
      sort.append(option);
    }
    sort.value = state.sort;
    sortLabel.append(element("span", "", copy.sort), sort);
    toolbar.append(openFilters, status, sortLabel);
    const chips = element("div", "explorer-chips");
    chips.setAttribute("aria-label", copy.active);
    const grid = element("div", "catalogs-grid");
    content.append(toolbar, chips, grid);
    layout.append(filterPanel, content);
    root.append(layout, filterDialog);
    const previewDialog = element("dialog", "explorer-preview");
    previewDialog.setAttribute("aria-labelledby", "explorer-preview-title");
    root.append(previewDialog);
    for (const dialog of [filterDialog, previewDialog]) {
      dialog.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        dialog.close();
      });
    }
    let previewTrigger = null;
    let previewBackdropPressed = false;
    const closePreview = () => previewDialog.close();
    const isPreviewBackdrop = (event) => {
      const bounds = previewDialog.getBoundingClientRect();
      return event.target === previewDialog && (
        event.clientX < bounds.left || event.clientX >= bounds.right ||
        event.clientY < bounds.top || event.clientY >= bounds.bottom
      );
    };
    previewDialog.addEventListener("pointerdown", (event) => {
      previewBackdropPressed = isPreviewBackdrop(event);
    });
    previewDialog.addEventListener("pointercancel", () => {
      previewBackdropPressed = false;
    });
    previewDialog.addEventListener("click", (event) => {
      const dismiss = previewBackdropPressed && isPreviewBackdrop(event);
      previewBackdropPressed = false;
      if (dismiss) closePreview();
    });
    previewDialog.addEventListener("close", () => {
      previewBackdropPressed = false;
      if (previewTrigger?.isConnected) previewTrigger.focus({ preventScroll: true });
    });
    const openPreview = (category, matches, trigger) => {
      previewTrigger = trigger;
      previewDialog.replaceChildren();
      const top = element("div", "explorer-preview-heading");
      const title = element("h2", "", categoryName(category));
      title.id = "explorer-preview-title";
      const close = button("");
      close.setAttribute("aria-label", copy.close);
      close.title = copy.close;
      close.addEventListener("click", closePreview);
      const titleBlock = element("div");
      titleBlock.append(element("span", "explorer-preview-kicker", base.label), title);
      close.prepend(icon("x"));
      top.append(titleBlock, close);
      const summary = element("div", "explorer-preview-summary");
      summary.append(element("span", "", `${copy.matches}: ${number(matches.length)}`));
      if (matches.length) {
        summary.append(element("strong", "", `${copy.from} ${money(Math.min(...matches.map((product) => product.price)))}`));
      }
      const description = element("p", "explorer-preview-description", category.description_translations?.[language] || category.description_translations?.en || base.description);
      const list = element("div", "explorer-preview-grid");
      for (const product of matches.slice(0, 4)) {
        const localized = data.localizeProduct(product, language);
        const link = element("a", "explorer-product");
        const url = new URL("product.html", location.href);
        url.searchParams.set("id", product.id);
        link.href = url.href;
        const info = element("div", "explorer-product-info");
        const availability = element("span", "explorer-product-stock", product.stock ? copy.available : copy.unavailable);
        availability.dataset.available = String(!!product.stock);
        info.append(element("small", "", product.brand), element("h3", "", localized.name), element("strong", "", money(product.price)), availability);
        link.append(photo(product.image, "explorer-product-media"), info);
        list.append(link);
      }
      const all = element("a", "catalogs-all-link", copy.results);
      all.href = buildUrl(category);
      all.append(icon("arrow-right"));
      const footer = element("div", "explorer-preview-footer");
      footer.append(element("p", "explorer-preview-note", matches.length ? copy.previewNote : copy.noProducts), all);
      const previewContent = element("div", "explorer-preview-content");
      previewContent.append(description, summary, list, footer);
      previewDialog.append(top, previewContent);
      window.lucide?.createIcons();
      previewDialog.showModal();
      close.focus();
    };
    const active = () => !!(state.query.trim() || state.brand || state.min !== null || state.max !== null || state.stock);
    const invalidPrices = () => !min.validity.valid || !max.validity.valid || (state.min !== null && state.max !== null && state.min > state.max);
    const update = () => {
      const invalid = invalidPrices();
      error.textContent = invalid ? copy.invalid : "";
      min.setAttribute("aria-invalid", String(invalid));
      max.setAttribute("aria-invalid", String(invalid));
      chips.replaceChildren();
      const addChip = (text, clear) => {
        const chip = button(`${text} ×`, "explorer-chip");
        chip.setAttribute("aria-label", `${copy.remove}: ${text}`);
        chip.addEventListener("click", () => {
          clear();
          update();
          search.focus();
        });
        chips.append(chip);
      };
      if (state.query.trim()) addChip(state.query.trim(), () => { state.query = ""; search.value = ""; });
      if (state.brand) addChip(`${copy.brand}: ${state.brand}`, () => { state.brand = ""; brand.value = ""; });
      if (state.min !== null || state.max !== null) addChip(`${copy.budget}: ${state.min !== null ? money(state.min) : "—"} – ${state.max !== null ? money(state.max) : "—"}`, () => { state.min = null; state.max = null; min.value = ""; max.value = ""; });
      if (state.stock) addChip(copy.stock, () => { state.stock = false; stock.checked = false; });
      const groups = invalid ? [] : categories.map((category) => ({
        category,
        matches: products.filter((product) => product.category === category.slug && data.matchesCatalogProduct(product, category, state, language)),
      })).filter((group) => !active() || group.matches.length);
      const lowest = (group) => group.matches.length ? Math.min(...group.matches.map((product) => product.price)) : Infinity;
      groups.sort((a, b) => {
        const order = state.sort === "count" ? b.matches.length - a.matches.length : state.sort === "price" ? (lowest(a) === lowest(b) ? 0 : lowest(a) - lowest(b)) : 0;
        return order || categoryName(a.category).localeCompare(categoryName(b.category), language);
      });
      status.textContent = `${copy.catalogs}: ${number(groups.length)} · ${copy.matches}: ${number(groups.reduce((sum, group) => sum + group.matches.length, 0))}`;
      grid.replaceChildren();
      if (!groups.length) {
        const empty = element("section", "catalogs-empty explorer-empty");
        const clear = button(copy.reset);
        clear.addEventListener("click", resetFilters);
        empty.append(icon("search"), element("h2", "", invalid ? copy.invalid : categories.length ? copy.none : base.empty), element("p", "", categories.length ? copy.hint : base.emptyNote), clear);
        grid.append(empty);
      }
      for (const { category, matches } of groups) {
        const card = element("article", "catalog-category-card");
        const name = categoryName(category);
        const mediaLink = element("a", "catalog-category-cover");
        mediaLink.href = buildUrl(category);
        mediaLink.setAttribute("aria-label", `${base.browse}: ${name}`);
        const pictured = matches.filter((product) => product.image);
        const mainImage = category.coverImage || pictured[0]?.image || category.image;
        mediaLink.append(photo(mainImage, "catalog-category-media"));
        const body = element("div", "catalog-category-copy");
        const headingLink = element("a", "catalog-category-heading catalog-category-action");
        headingLink.href = buildUrl(category);
        const title = element("div", "catalog-category-title");
        title.append(element("h2", "", name), element("span", "catalog-category-count", `${active() ? copy.matches : base.products}: ${number(matches.length)}`));
        headingLink.append(title, icon("chevron-right"));
        body.append(headingLink);
        const matchedBrands = [...new Set(matches.map((product) => product.brand).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b, language));
        if (matchedBrands.length) {
          const brandList = element("ul", "explorer-brand-list");
          brandList.setAttribute("aria-label", `${copy.brands}: ${name}`);
          for (const brand of matchedBrands) {
            const count = matches.filter((product) => product.brand === brand).length;
            const item = element("li");
            const link = element("a");
            link.href = buildUrl(category, brand);
            link.setAttribute("aria-label", `${brand} · ${copy.matches}: ${number(count)}`);
            link.append(element("span", "", brand), element("small", "", number(count)));
            item.append(link);
            brandList.append(item);
          }
          body.append(brandList);
        }
        const actions = element("div", "explorer-card-actions");
        if (matches.length) actions.append(element("span", "explorer-from", `${copy.from} ${money(Math.min(...matches.map((product) => product.price)))}`));
        const preview = button(copy.preview);
        preview.prepend(icon("scan-eye"));
        preview.addEventListener("click", () => openPreview(category, matches, preview));
        actions.append(preview);
        body.append(actions);
        card.append(mediaLink, body);
        grid.append(card);
      }
      window.lucide?.createIcons();
    };
    function resetFilters() {
      Object.assign(state, { query: "", brand: "", min: null, max: null, stock: false });
      search.value = ""; brand.value = ""; min.value = ""; max.value = ""; stock.checked = false;
      update();
    }
    controls.addEventListener("input", (event) => {
      state.query = search.value;
      state.brand = brand.value;
      state.stock = stock.checked;
      for (const [key, input] of [["min", min], ["max", max]]) {
        if (event.target !== input) continue;
        state[key] = input.value === "" || !Number.isFinite(input.valueAsNumber) ? null : store.convertCurrencyExact(input.valueAsNumber, currency, "SAR");
      }
      update();
    });
    controls.addEventListener("submit", (event) => { event.preventDefault(); update(); });
    sort.addEventListener("change", () => { state.sort = sort.value; update(); });
    reset.addEventListener("click", resetFilters);
    const finishFilters = () => {
      layout.prepend(filterPanel);
      if (filterDialog.open) filterDialog.close();
      openFilters.focus({ preventScroll: true });
    };
    openFilters.addEventListener("click", () => {
      filterDialog.append(filterPanel);
      filterDialog.showModal();
    });
    closeFilters.addEventListener("click", finishFilters);
    apply.addEventListener("click", () => { if (!invalidPrices()) finishFilters(); else min.focus(); });
    filterDialog.addEventListener("close", () => {
      if (filterPanel.parentElement === filterDialog) layout.prepend(filterPanel);
    });
    update();
  };
})();
