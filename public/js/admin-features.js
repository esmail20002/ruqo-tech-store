(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const TARGET_LANGUAGES = ["ar", "fr", "es", "zh"];
  const SECTION_KEY = "features";
  const MAX_FEATURES = 8;
  const MAX_STATS = 6;

  const DEFAULT_DATA = () => ({
    visible: true,
    eyebrow_translations: {
      en: "Why us",
      ar: "لماذا نحن",
      fr: "Pourquoi nous choisir",
      es: "Por qué elegirnos",
      zh: "选择我们的理由",
    },
    title_translations: {
      en: "Service built for you",
      ar: "خدمة تلبي احتياجاتك",
      fr: "Un service pensé pour vous",
      es: "Un servicio pensado para ti",
      zh: "为你打造的服务",
    },
    features: [
      {
        id: "f-delivery",
        title_translations: { en: "Fast delivery", ar: "توصيل سريع", fr: "Livraison rapide", es: "Entrega rápida", zh: "快速配送" },
        text_translations: {
          en: "Delivery across all cities within 48 hours with live updates.",
          ar: "توصيل إلى جميع المدن خلال 48 ساعة مع تحديثات فورية.",
          fr: "Livraison dans toutes les villes sous 48 heures, avec suivi en direct.",
          es: "Envíos a todas las ciudades en 48 horas con seguimiento en tiempo real.",
          zh: "覆盖各城市，48 小时内送达并提供实时更新。",
        },
      },
      {
        id: "f-warranty",
        title_translations: { en: "Reliable warranty", ar: "ضمان موثوق", fr: "Garantie fiable", es: "Garantía fiable", zh: "可靠保修" },
        text_translations: {
          en: "Original coverage for two years with specialist after-sales support.",
          ar: "ضمان أصلي لمدة عامين مع خدمات ما بعد البيع المتخصصة.",
          fr: "Garantie constructeur de deux ans et service après-vente spécialisé.",
          es: "Dos años de garantía original y asistencia posventa especializada.",
          zh: "两年原厂保修与专业售后服务。",
        },
      },
      {
        id: "f-payment",
        title_translations: { en: "Secure payment", ar: "دفع آمن", fr: "Paiement sécurisé", es: "Pago seguro", zh: "安全支付" },
        text_translations: {
          en: "Convenient and safe transactions through reliable payment options.",
          ar: "دفع مريح وآمن مع خيارات متعددة وموثوقة.",
          fr: "Des transactions simples et sûres grâce à des moyens de paiement fiables.",
          es: "Transacciones cómodas y seguras con opciones de pago fiables.",
          zh: "通过可靠的支付方式轻松、安全地完成交易。",
        },
      },
      {
        id: "f-consulting",
        title_translations: { en: "Expert guidance", ar: "استشارات الخبراء", fr: "Conseils d’experts", es: "Asesoramiento experto", zh: "专家建议" },
        text_translations: {
          en: "The perfect choice by our experts based on your unique needs.",
          ar: "اختيار مثالي من خبرائنا حسب احتياجك ومميزتك.",
          fr: "Nos experts vous aident à choisir selon vos besoins.",
          es: "Nuestros expertos te ayudan a elegir según tus necesidades.",
          zh: "专家根据你的需求为你推荐合适的产品。",
        },
      },
    ],
    stats: [
      {
        id: "s-experience",
        value: "12+",
        label_translations: { en: "years of experience", ar: "سنوات خبرة", fr: "années d’expérience", es: "años de experiencia", zh: "年经验" },
      },
      {
        id: "s-sold",
        value: "320K",
        label_translations: { en: "products sold", ar: "منتج تم بيعه", fr: "produits vendus", es: "productos vendidos", zh: "件商品已售" },
      },
      {
        id: "s-satisfaction",
        value: "97%",
        label_translations: { en: "customer satisfaction", ar: "رضا العملاء", fr: "satisfaction client", es: "satisfacción del cliente", zh: "客户满意度" },
      },
      {
        id: "s-support",
        value: "24/7",
        label_translations: { en: "customer support", ar: "خدمة عملاء", fr: "service client", es: "atención al cliente", zh: "客户服务" },
      },
    ],
  });

  window.RUQO_INIT_FEATURES_EDITOR = (client) => {
    const panel = document.querySelector('[data-admin-panel="features-stats"]');
    const form = document.querySelector("#features-section-form");
    if (!panel || !form || !form.elements.visible || !form.elements.language) return;

    const listFeatures = panel.querySelector("[data-fs-list-features]");
    const listStats = panel.querySelector("[data-fs-list-stats]");
    const addFeatureBtn = panel.querySelector("[data-fs-add-feature]");
    const addStatBtn = panel.querySelector("[data-fs-add-stat]");
    const reloadBtn = panel.querySelector("[data-fs-reload]");
    const liveNode = panel.querySelector("[data-fs-live]");
    const stateNode = panel.querySelector("[data-fs-state]");
    const feedbackNode = panel.querySelector("[data-fs-feedback]");
    const headingFields = panel.querySelector("[data-fs-heading-fields]");
    const itemEditorTitle = panel.querySelector("[data-fs-item-editor-title]");
    const featureFields = panel.querySelector("[data-fs-feature-fields]");
    const statFields = panel.querySelector("[data-fs-stat-fields]");
    const previewWrap = panel.querySelector("[data-fs-preview]");
    const previewEyebrow = panel.querySelector("[data-fs-preview-eyebrow]");
    const previewTitle = panel.querySelector("[data-fs-preview-title]");
    const previewGrid = panel.querySelector("[data-fs-preview-grid]");
    const previewStats = panel.querySelector("[data-fs-preview-stats]");
    const saveBtn = panel.querySelector('[data-fs-action="save"]');
    const resetBtn = panel.querySelector('[data-fs-action="reset"]');
    const moveUpBtn = panel.querySelector('[data-fs-action="move-up"]');
    const moveDownBtn = panel.querySelector('[data-fs-action="move-down"]');
    const deleteItemBtn = panel.querySelector('[data-fs-action="delete-item"]');
    const translateBtn = panel.querySelector('[data-fs-action="translate"]');
    if (!listFeatures || !listStats || !previewWrap || !previewGrid || !previewStats) return;

    let data = null;
    let language = "en";
    let selection = { kind: "feature", index: 0 };
    let loaded = false;
    let busy = false;
    let dirty = false;
    let usingDefaults = true;

    const setMessage = (text, success = false) => {
      feedbackNode.textContent = text;
      feedbackNode.hidden = !text;
      feedbackNode.classList.toggle("is-success", success);
    };

    const readLocal = () => {
      try {
        const raw = localStorage.getItem("ruqo-home-features-v1");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length ? parsed : null;
      } catch (_) {}
      return null;
    };

    const asMap = (value) => {
      const map = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      const out = {};
      for (const lang of LANGUAGES) out[lang] = String(map[lang] ?? "");
      return out;
    };

    const normalize = (raw) => {
      const base = DEFAULT_DATA();
      const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
      const features = (Array.isArray(source.features) ? source.features : base.features)
        .slice(0, MAX_FEATURES)
        .map((feature) => ({
          id: typeof feature?.id === "string" && feature.id ? feature.id : crypto.randomUUID(),
          title_translations: asMap(feature?.title_translations),
          text_translations: asMap(feature?.text_translations),
        }));
      const stats = (Array.isArray(source.stats) ? source.stats : base.stats)
        .slice(0, MAX_STATS)
        .map((stat) => ({
          id: typeof stat?.id === "string" && stat.id ? stat.id : crypto.randomUUID(),
          value: String(stat?.value ?? "").slice(0, 20),
          label_translations: asMap(stat?.label_translations),
        }));
      return {
        visible: source.visible !== false,
        eyebrow_translations: asMap(source.eyebrow_translations ?? base.eyebrow_translations),
        title_translations: asMap(source.title_translations ?? base.title_translations),
        features,
        stats,
      };
    };

    const pick = (map) => String(map?.[language] || map?.en || "").trim();
    const currentList = () => (selection.kind === "stat" ? data.stats : data.features);
    const currentItem = () => currentList()[selection.index] || null;

    const clampSelection = () => {
      if (!data) return;
      if (selection.kind === "stat" && !data.stats.length && data.features.length) selection = { kind: "feature", index: 0 };
      if (selection.kind === "feature" && !data.features.length && data.stats.length) selection = { kind: "stat", index: 0 };
      const list = currentList();
      selection.index = Math.max(0, Math.min(selection.index, Math.max(0, list.length - 1)));
    };

    const moveItem = (kind, from, delta) => {
      if (!data || busy) return;
      const list = kind === "stat" ? data.stats : data.features;
      const to = from + delta;
      if (to < 0 || to >= list.length) return;
      [list[from], list[to]] = [list[to], list[from]];
      selection = { kind, index: to };
      dirty = true;
      render();
    };

    const renderList = (node, items, kind, describe) => {
      node.replaceChildren();
      items.forEach((item, itemIndex) => {
        const li = document.createElement("li");
        const selected = selection.kind === kind && selection.index === itemIndex;
        li.classList.toggle("is-selected", selected);

        const badge = document.createElement("span");
        badge.className = "fs-list-index";
        badge.textContent = String(itemIndex + 1).padStart(2, "0");

        const meta = document.createElement("div");
        meta.className = "hr-slide-meta";
        const strong = document.createElement("strong");
        strong.textContent = describe(item) || (kind === "stat" ? "Untitled stat" : "Untitled card");
        const small = document.createElement("small");
        small.textContent = kind === "stat"
          ? `Value: ${item.value || "—"}`
          : pick(item.text_translations) || "No description yet";
        meta.append(strong, small);

        const controls = document.createElement("div");
        controls.className = "fs-list-controls";

        const up = document.createElement("button");
        up.type = "button";
        up.className = "admin-text-button";
        up.textContent = "↑";
        up.title = "Move up";
        up.disabled = busy || itemIndex === 0;
        up.addEventListener("click", () => moveItem(kind, itemIndex, -1));

        const down = document.createElement("button");
        down.type = "button";
        down.className = "admin-text-button";
        down.textContent = "↓";
        down.title = "Move down";
        down.disabled = busy || itemIndex === items.length - 1;
        down.addEventListener("click", () => moveItem(kind, itemIndex, 1));

        const select = document.createElement("button");
        select.type = "button";
        select.className = "admin-text-button";
        select.textContent = selected ? "Editing" : "Edit";
        select.disabled = selected || busy;
        select.addEventListener("click", () => {
          selection = { kind, index: itemIndex };
          render();
        });

        controls.append(up, down, select);
        li.append(badge, meta, controls);
        node.append(li);
      });
    };

    const updatePreview = () => {
      if (!data) return;
      previewWrap.dir = language === "ar" ? "rtl" : "ltr";
      previewWrap.classList.toggle("is-hidden-section", data.visible === false);

      const eyebrow = pick(data.eyebrow_translations);
      const title = pick(data.title_translations);
      previewEyebrow.textContent = eyebrow;
      previewEyebrow.hidden = !eyebrow;
      previewTitle.textContent = title || "Section title";
      previewTitle.classList.toggle("fs-preview-placeholder", !title);

      previewGrid.replaceChildren(...data.features.map((feature, featureIndex) => {
        const card = document.createElement("div");
        card.className = "fs-preview-card";
        const index = document.createElement("span");
        index.className = "fs-preview-index";
        index.textContent = String(featureIndex + 1).padStart(2, "0");
        const heading = document.createElement("h4");
        heading.textContent = pick(feature.title_translations) || "Card title";
        const text = document.createElement("p");
        text.textContent = pick(feature.text_translations);
        text.hidden = !text.textContent;
        card.append(index, heading, text);
        return card;
      }));

      previewStats.replaceChildren(...data.stats.map((stat) => {
        const item = document.createElement("div");
        item.className = "fs-preview-stat";
        const value = document.createElement("strong");
        value.textContent = stat.value || "—";
        const label = document.createElement("span");
        label.textContent = pick(stat.label_translations) || "Label";
        item.append(value, label);
        return item;
      }));
    };

    const render = () => {
      if (!data) return;
      clampSelection();
      form.querySelectorAll("input, textarea, select, button").forEach((el) => {
        el.disabled = busy || !loaded;
      });
      reloadBtn.disabled = busy;
      addFeatureBtn.disabled = busy || !loaded || data.features.length >= MAX_FEATURES;
      addStatBtn.disabled = busy || !loaded || data.stats.length >= MAX_STATS;

      form.elements.visible.checked = data.visible !== false;
      form.elements.language.value = language;
      form.elements.heading_eyebrow.value = data.eyebrow_translations[language] || "";
      form.elements.heading_title.value = data.title_translations[language] || "";
      headingFields.dir = language === "ar" ? "rtl" : "ltr";

      const item = currentItem();
      const isStat = selection.kind === "stat";
      itemEditorTitle.textContent = item
        ? isStat
          ? `Stat ${String(selection.index + 1).padStart(2, "0")}`
          : `Feature card ${String(selection.index + 1).padStart(2, "0")}`
        : "Nothing selected — add an item from the lists";
      featureFields.hidden = isStat || !item;
      statFields.hidden = !isStat || !item;
      featureFields.dir = language === "ar" ? "rtl" : "ltr";
      statFields.dir = language === "ar" ? "rtl" : "ltr";
      form.elements.item_title.value = !isStat && item ? item.title_translations[language] || "" : "";
      form.elements.item_text.value = !isStat && item ? item.text_translations[language] || "" : "";
      form.elements.item_value.value = isStat && item ? item.value : "";
      form.elements.item_label.value = isStat && item ? item.label_translations[language] || "" : "";
      moveUpBtn.disabled = busy || !loaded || !item || selection.index === 0;
      moveDownBtn.disabled = busy || !loaded || !item || selection.index >= currentList().length - 1;
      deleteItemBtn.disabled = busy || !loaded || !item;

      renderList(listFeatures, data.features, "feature", (feature) => pick(feature.title_translations));
      renderList(listStats, data.stats, "stat", (stat) => pick(stat.label_translations));
      updatePreview();

      liveNode.textContent = usingDefaults
        ? "Live on homepage: built-in default content (save below to publish your customized section)."
        : `Live on homepage: customized section · ${data.features.length} card(s), ${data.stats.length} stat(s)${data.visible === false ? " · currently hidden" : ""}.`;
      stateNode.textContent = busy
        ? "Working…"
        : `${data.features.length} card(s) · ${data.stats.length} stat(s) · Editing language: ${language.toUpperCase()}${dirty ? " · Unsaved changes" : ""}`;
    };

    const loadSection = async () => {
      if (busy) return;
      busy = true;
      setMessage("");
      render();
      try {
        const { data: row, error } = await client
          .from("homepage_sections")
          .select("data")
          .eq("key", SECTION_KEY)
          .maybeSingle();
        if (error) throw error;
        const remote = row?.data && typeof row.data === "object" && !Array.isArray(row.data) && Object.keys(row.data).length
          ? row.data
          : null;
        const local = remote ? null : readLocal();
        const source = remote || local;
        data = normalize(source || undefined);
        usingDefaults = !source;
        dirty = false;
        loaded = true;
      } catch {
        const local = readLocal();
        data = normalize(local || undefined);
        usingDefaults = !local;
        dirty = false;
        loaded = true;
        setMessage(local
          ? "Loaded your locally saved section (database table is unavailable)."
          : "Loaded the built-in defaults. Save to publish your customized section.");
      } finally {
        busy = false;
        render();
      }
    };

    const sanitize = () => ({
      visible: data.visible !== false,
      eyebrow_translations: asMap(data.eyebrow_translations),
      title_translations: asMap(data.title_translations),
      features: data.features
        .map((feature) => ({
          id: feature.id,
          title_translations: asMap(feature.title_translations),
          text_translations: asMap(feature.text_translations),
        }))
        .filter((feature) =>
          LANGUAGES.some((lang) => feature.title_translations[lang].trim() || feature.text_translations[lang].trim())),
      stats: data.stats
        .map((stat) => ({
          id: stat.id,
          value: String(stat.value || "").trim().slice(0, 20),
          label_translations: asMap(stat.label_translations),
        }))
        .filter((stat) => stat.value || LANGUAGES.some((lang) => stat.label_translations[lang].trim())),
    });

    const publishLocal = (payload) => {
      try {
        localStorage.setItem("ruqo-home-features-v1", JSON.stringify(payload));
        localStorage.setItem("ruqo-home-features-cache-v1", JSON.stringify(payload));
      } catch (_) {}
      window.RUQO_HOME_FEATURES = payload;
      window.dispatchEvent(new CustomEvent("ruqo:home-features-updated", { detail: payload }));
    };

    document.querySelector('[data-admin-view="features-stats"]')?.addEventListener("click", () => {
      if (!loaded) loadSection();
    });

    reloadBtn.addEventListener("click", () => {
      if (!busy) loadSection();
    });

    addFeatureBtn.addEventListener("click", () => {
      if (busy || !loaded || data.features.length >= MAX_FEATURES) return;
      data.features.push({ id: crypto.randomUUID(), title_translations: asMap(), text_translations: asMap() });
      selection = { kind: "feature", index: data.features.length - 1 };
      dirty = true;
      setMessage("New feature card added. Fill its content, then click Save & publish section.", true);
      render();
    });

    addStatBtn.addEventListener("click", () => {
      if (busy || !loaded || data.stats.length >= MAX_STATS) return;
      data.stats.push({ id: crypto.randomUUID(), value: "", label_translations: asMap() });
      selection = { kind: "stat", index: data.stats.length - 1 };
      dirty = true;
      setMessage("New stat added. Fill its value and label, then click Save & publish section.", true);
      render();
    });

    form.elements.language.addEventListener("change", () => {
      language = form.elements.language.value;
      render();
    });

    form.elements.visible.addEventListener("change", () => {
      data.visible = form.elements.visible.checked;
      dirty = true;
      render();
    });

    form.elements.heading_eyebrow.addEventListener("input", () => {
      data.eyebrow_translations[language] = form.elements.heading_eyebrow.value;
      dirty = true;
      updatePreview();
    });

    form.elements.heading_title.addEventListener("input", () => {
      data.title_translations[language] = form.elements.heading_title.value;
      dirty = true;
      updatePreview();
    });

    form.elements.item_title.addEventListener("input", () => {
      const item = currentItem();
      if (!item || selection.kind !== "feature") return;
      item.title_translations[language] = form.elements.item_title.value;
      dirty = true;
      updatePreview();
      renderList(listFeatures, data.features, "feature", (feature) => pick(feature.title_translations));
    });

    form.elements.item_text.addEventListener("input", () => {
      const item = currentItem();
      if (!item || selection.kind !== "feature") return;
      item.text_translations[language] = form.elements.item_text.value;
      dirty = true;
      updatePreview();
      renderList(listFeatures, data.features, "feature", (feature) => pick(feature.title_translations));
    });

    form.elements.item_value.addEventListener("input", () => {
      const item = currentItem();
      if (!item || selection.kind !== "stat") return;
      item.value = form.elements.item_value.value.slice(0, 20);
      dirty = true;
      updatePreview();
      renderList(listStats, data.stats, "stat", (stat) => pick(stat.label_translations));
    });

    form.elements.item_label.addEventListener("input", () => {
      const item = currentItem();
      if (!item || selection.kind !== "stat") return;
      item.label_translations[language] = form.elements.item_label.value;
      dirty = true;
      updatePreview();
      renderList(listStats, data.stats, "stat", (stat) => pick(stat.label_translations));
    });

    moveUpBtn.addEventListener("click", () => moveItem(selection.kind, selection.index, -1));
    moveDownBtn.addEventListener("click", () => moveItem(selection.kind, selection.index, 1));

    deleteItemBtn.addEventListener("click", () => {
      const item = currentItem();
      if (!item || busy || !loaded) return;
      const label = selection.kind === "stat" ? "stat" : "feature card";
      if (!window.confirm(`Delete this ${label}?`)) return;
      currentList().splice(selection.index, 1);
      dirty = true;
      setMessage(`The ${label} was removed. Click Save & publish section to apply.`, true);
      render();
    });

    saveBtn.addEventListener("click", async () => {
      if (!data || busy || !loaded) return;
      if (!String(data.title_translations.en || "").trim() && data.features.length) {
        language = "en";
        setMessage("Enter an English section title before saving.");
        render();
        return;
      }
      busy = true;
      setMessage("Saving & publishing the features section…");
      render();
      try {
        const payload = sanitize();
        publishLocal(payload);
        const { error } = await client
          .from("homepage_sections")
          .upsert({ key: SECTION_KEY, data: payload }, { onConflict: "key" });
        if (error) {
          if (/homepage_sections|schema cache|relation|404/i.test(error.message || "")) {
            setMessage("Saved locally and published to this browser. Apply the homepage_sections migration to publish for all visitors.", true);
          } else {
            throw error;
          }
        } else {
          setMessage("Features section saved and published to the homepage.", true);
        }
        data = normalize(payload);
        usingDefaults = false;
        dirty = false;
      } catch (error) {
        setMessage(error.message || "Could not save the features section.");
      } finally {
        busy = false;
        render();
      }
    });

    resetBtn.addEventListener("click", async () => {
      if (!data || busy || !loaded) return;
      if (!window.confirm("Reset the section to the built-in defaults? Your customized content will be removed.")) return;
      busy = true;
      setMessage("");
      render();
      try {
        localStorage.removeItem("ruqo-home-features-v1");
        localStorage.removeItem("ruqo-home-features-cache-v1");
        window.RUQO_HOME_FEATURES = null;
        window.dispatchEvent(new CustomEvent("ruqo:home-features-updated", { detail: null }));
        const { error } = await client.from("homepage_sections").delete().eq("key", SECTION_KEY);
        if (error && !/homepage_sections|schema cache|relation|404/i.test(error.message || "")) throw error;
        data = DEFAULT_DATA();
        usingDefaults = true;
        dirty = false;
        selection = { kind: "feature", index: 0 };
        setMessage("Section reset to the built-in defaults.", true);
      } catch (error) {
        setMessage(error.message || "Could not reset the section.");
      } finally {
        busy = false;
        render();
      }
    });

    translateBtn.addEventListener("click", async () => {
      if (!data || busy || !loaded) return;
      const enOf = (map) => String(map?.en || "").trim();
      const tasks = [];
      const headingBadge = enOf(data.eyebrow_translations);
      const headingTitle = enOf(data.title_translations);
      if (headingBadge || headingTitle) {
        tasks.push({
          label: "section heading",
          source: { badge: headingBadge, title: headingTitle, text: "", eyebrow: "" },
          apply: (translations, lang) => {
            if (headingBadge) data.eyebrow_translations[lang] = translations.badge || headingBadge;
            if (headingTitle) data.title_translations[lang] = translations.title || headingTitle;
          },
        });
      }
      data.features.forEach((feature, featureIndex) => {
        const title = enOf(feature.title_translations);
        const text = enOf(feature.text_translations);
        if (!title && !text) return;
        tasks.push({
          label: `feature card ${featureIndex + 1}`,
          source: { badge: "", title, text, eyebrow: "" },
          apply: (translations, lang) => {
            if (title) feature.title_translations[lang] = translations.title || title;
            if (text) feature.text_translations[lang] = translations.text || text;
          },
        });
      });
      data.stats.forEach((stat, statIndex) => {
        const statLabel = enOf(stat.label_translations);
        if (!statLabel) return;
        tasks.push({
          label: `stat ${statIndex + 1}`,
          source: { badge: statLabel, title: "", text: "", eyebrow: "" },
          apply: (translations, lang) => {
            stat.label_translations[lang] = translations.badge || statLabel;
          },
        });
      });
      if (!tasks.length) {
        setMessage("Enter English text first before generating translations.");
        return;
      }
      busy = true;
      render();
      let done = 0;
      let failures = 0;
      for (const task of tasks) {
        setMessage(`Translating ${done + 1} of ${tasks.length} (${task.label})…`);
        try {
          const { data: response, error } = await client.functions.invoke("translate-high-refresh", {
            body: { source: task.source, translations: {} },
          });
          if (error) throw error;
          if (!response?.translations) throw new Error("Translation service returned an empty response.");
          for (const lang of TARGET_LANGUAGES) task.apply(response.translations[lang] || {}, lang);
          dirty = true;
        } catch {
          failures += 1;
        }
        done += 1;
      }
      busy = false;
      setMessage(
        failures
          ? `Translated ${tasks.length - failures} of ${tasks.length} item(s); ${failures} failed — edit manually or retry.`
          : "Translated into all 5 languages (EN / AR / FR / ES / ZH). Switch language to preview, then Save & publish section.",
        !failures,
      );
      render();
    });

    render();
  };
})();
