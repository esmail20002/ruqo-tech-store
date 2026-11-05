(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const TARGET_LANGUAGES = ["ar", "fr", "es", "zh"];
  const SECTION_KEY = "lunae_hero";
  const STORAGE_KEY = "ruqo-home-lunae-hero-v1";
  const CACHE_KEY = "ruqo-home-lunae-hero-cache-v1";

  const DEFAULT_DATA = () => ({
    intro_mode: "once_per_session",
    show_orb: true,
    show_stats: true,
    copy: {
      pill_badge: {
        en: "AI-Powered Flagship",
        ar: "رائد بالذكاء الاصطناعي",
        fr: "Fleuron propulsé par l’IA",
        es: "Insignia con IA",
        zh: "AI 驱动旗舰",
      },
      eyebrow_sub: {
        en: "Real-time intelligence. Smarter devices.",
        ar: "ذكاء فوري. أجهزة أكثر تطورًا.",
        fr: "Intelligence en temps réel. Appareils plus intelligents.",
        es: "Inteligencia en tiempo real. Dispositivos más inteligentes.",
        zh: "实时智能 · 更聪明的设备。",
      },
      headline_line1: {
        en: "Visualize",
        ar: "تخيّل",
        fr: "Visualisez",
        es: "Visualiza",
        zh: "洞见",
      },
      headline_line2: {
        en: "Your Tech",
        ar: "تقنيتك",
        fr: "Votre Tech",
        es: "Tu Tecnología",
        zh: "未来科技",
      },
      headline_gradient: {
        en: "in Motion",
        ar: "بكل حركة",
        fr: "en Mouvement",
        es: "en Movimiento",
        zh: "灵动呈现",
      },
      description: {
        en: "WEEXEY brings flagship performance, neural audio, and precision optics into a living visual experience — crafted for a smarter tomorrow.",
        ar: "تجمع WEEXEY بين الأداء الرائد والصوت الذكي والبصريات الدقيقة في تجربة بصرية حية — صُممت لغدٍ أذكى.",
        fr: "WEEXEY réunit performances de pointe, audio neuronal et optique de précision dans une expérience visuelle vivante.",
        es: "WEEXEY combina rendimiento insignia, audio neuronal y óptica de precisión en una experiencia visual viva.",
        zh: "WEEXEY 将旗舰性能、神经音频与精密光学融为鲜活的视觉体验，只为更智慧的明天。",
      },
      primary_btn_text: {
        en: "Explore Store",
        ar: "استكشف المتجر",
        fr: "Explorer la boutique",
        es: "Explorar tienda",
        zh: "探索商城",
      },
      primary_btn_href: "/products.html",
      orb_text: {
        en: "Explore The Platform",
        ar: "استكشف المنصة",
        fr: "Explorer la plateforme",
        es: "Explorar plataforma",
        zh: "探索平台",
      },
      orb_href: "/products.html",
    },
    cards: {
      card1: {
        title: {
          en: "Customer Rating",
          ar: "تقييم العملاء",
          fr: "Avis Clients",
          es: "Valoración",
          zh: "客户评分",
        },
        label: {
          en: "Excellent",
          ar: "ممتاز",
          fr: "Excellent",
          es: "Excelente",
          zh: "极佳",
        },
        number: 98,
        suffix: "%",
        sub: {
          en: "4.9 ★ Verified",
          ar: "4.9 ★ موثق",
          fr: "4.9 ★ Vérifié",
          es: "4.9 ★ Verificado",
          zh: "4.9 ★ 官方认证",
        },
        href: "#reviews",
      },
      card2: {
        title: {
          en: "Express & Warranty",
          ar: "التوصيل والضمان",
          fr: "Livraison & Garantie",
          es: "Envío y Garantía",
          zh: "极速配送与保修",
        },
        label: {
          en: "Fast Delivery",
          ar: "توصيل سريع",
          fr: "Livraison rapide",
          es: "Envío rápido",
          zh: "极速送达",
        },
        number: 24,
        suffix: "h",
        sub: {
          en: "2-Year Warranty",
          ar: "ضمان ذهبي سنتين",
          fr: "Garantie 2 ans",
          es: "2 años de garantía",
          zh: "2年官方质保",
        },
        href: "/products.html?filter=deals",
      },
      card3: {
        title: {
          en: "Featured Product",
          ar: "منتج مميز",
          fr: "Produit à la une",
          es: "Producto destacado",
          zh: "精选商品",
        },
        badge: {
          en: "Best Seller",
          ar: "الأكثر مبيعًا",
          fr: "Meilleure vente",
          es: "Más vendido",
          zh: "热销爆款",
        },
        product_slug: "",
      },
    },
    stats: [
      {
        value: 10,
        is_decimal: false,
        suffix: "K+",
        label: {
          en: "Active Users",
          ar: "مستخدم نشط",
          fr: "Utilisateurs actifs",
          es: "Usuarios activos",
          zh: "活跃用户",
        },
      },
      {
        value: 99.9,
        is_decimal: true,
        suffix: "%",
        label: {
          en: "Uptime",
          ar: "جاهزية الخدمة",
          fr: "Disponibilité",
          es: "Disponibilidad",
          zh: "稳定运行",
        },
      },
      {
        value: 150,
        is_decimal: false,
        suffix: "+",
        label: {
          en: "Countries",
          ar: "دولة حول العالم",
          fr: "Pays couverts",
          es: "Países",
          zh: "覆盖国家",
        },
      },
    ],
  });

  const asMap = (val, fallback = {}) => {
    const src = val && typeof val === "object" && !Array.isArray(val) ? val : {};
    const fb = fallback && typeof fallback === "object" ? fallback : {};
    const out = {};
    for (const lang of LANGUAGES) {
      out[lang] = String(src[lang] ?? fb[lang] ?? "");
    }
    return out;
  };

  const normalize = (raw) => {
    const base = DEFAULT_DATA();
    const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const copy = src.copy && typeof src.copy === "object" ? src.copy : {};
    const cards = src.cards && typeof src.cards === "object" ? src.cards : {};
    const c1 = cards.card1 && typeof cards.card1 === "object" ? cards.card1 : {};
    const c2 = cards.card2 && typeof cards.card2 === "object" ? cards.card2 : {};
    const c3 = cards.card3 && typeof cards.card3 === "object" ? cards.card3 : {};
    const rawStats = Array.isArray(src.stats) ? src.stats : base.stats;

    return {
      intro_mode: ["once_per_session", "always", "skip"].includes(src.intro_mode)
        ? src.intro_mode
        : base.intro_mode,
      show_orb: src.show_orb !== false,
      show_stats: src.show_stats !== false,
      copy: {
        pill_badge: asMap(copy.pill_badge, base.copy.pill_badge),
        eyebrow_sub: asMap(copy.eyebrow_sub, base.copy.eyebrow_sub),
        headline_line1: asMap(copy.headline_line1, base.copy.headline_line1),
        headline_line2: asMap(copy.headline_line2, base.copy.headline_line2),
        headline_gradient: asMap(copy.headline_gradient, base.copy.headline_gradient),
        description: asMap(copy.description, base.copy.description),
        primary_btn_text: asMap(copy.primary_btn_text, base.copy.primary_btn_text),
        primary_btn_href: String(copy.primary_btn_href || base.copy.primary_btn_href).trim() || "/products.html",
        orb_text: asMap(copy.orb_text, base.copy.orb_text),
        orb_href: String(copy.orb_href || base.copy.orb_href).trim() || "/products.html",
      },
      cards: {
        card1: {
          title: asMap(c1.title, base.cards.card1.title),
          label: asMap(c1.label, base.cards.card1.label),
          number: Number.isFinite(Number(c1.number)) ? Number(c1.number) : base.cards.card1.number,
          suffix: String(c1.suffix ?? base.cards.card1.suffix).slice(0, 20),
          sub: asMap(c1.sub, base.cards.card1.sub),
          href: String(c1.href || base.cards.card1.href).trim() || "#reviews",
        },
        card2: {
          title: asMap(c2.title, base.cards.card2.title),
          label: asMap(c2.label, base.cards.card2.label),
          number: Number.isFinite(Number(c2.number)) ? Number(c2.number) : base.cards.card2.number,
          suffix: String(c2.suffix ?? base.cards.card2.suffix).slice(0, 20),
          sub: asMap(c2.sub, base.cards.card2.sub),
          href: String(c2.href || base.cards.card2.href).trim() || "/products.html?filter=deals",
        },
        card3: {
          title: asMap(c3.title, base.cards.card3.title),
          badge: asMap(c3.badge, base.cards.card3.badge),
          product_slug: String(c3.product_slug ?? "").trim(),
        },
      },
      stats: [0, 1, 2].map((i) => {
        const s = rawStats[i] || {};
        const b = base.stats[i];
        const num = Number.isFinite(Number(s.value)) ? Number(s.value) : b.value;
        return {
          value: num,
          is_decimal: !Number.isInteger(num),
          suffix: String(s.suffix ?? b.suffix).slice(0, 20),
          label: asMap(s.label, b.label),
        };
      }),
    };
  };

  let initialized = false;
  window.RUQO_INIT_HERO_EDITOR = (client) => {
    if (initialized) return;
    const panel = document.querySelector('[data-admin-panel="hero"]');
    const form = document.querySelector("#hero-section-form");
    if (!panel || !form) return;
    initialized = true;

    const reloadBtn = panel.querySelector("[data-hero-reload]");
    const liveNode = panel.querySelector("[data-hero-live]");
    const stateNode = panel.querySelector("[data-hero-state]");
    const feedbackNode = panel.querySelector("[data-hero-feedback]");
    const copyFields = panel.querySelector("[data-hero-copy-fields]");
    const card1Fields = panel.querySelector("[data-hero-card1-fields]");
    const card2Fields = panel.querySelector("[data-hero-card2-fields]");
    const card3Fields = panel.querySelector("[data-hero-card3-fields]");
    const statsFields = panel.querySelector("[data-hero-stats-fields]");
    const productSelect = panel.querySelector("[data-hero-product-select]");
    const previewWrap = panel.querySelector("[data-hero-preview]");
    const prevPill = panel.querySelector("[data-hero-prev-pill]");
    const prevSub = panel.querySelector("[data-hero-prev-sub]");
    const prevH1 = panel.querySelector("[data-hero-prev-h1]");
    const prevH2 = panel.querySelector("[data-hero-prev-h2]");
    const prevH3 = panel.querySelector("[data-hero-prev-h3]");
    const prevDesc = panel.querySelector("[data-hero-prev-desc]");
    const prevBtn = panel.querySelector("[data-hero-prev-btn]");
    const prevStats = panel.querySelector("[data-hero-prev-stats]");
    const prevCards = panel.querySelector("[data-hero-prev-cards]");
    const saveBtn = panel.querySelector('[data-hero-action="save"]');
    const translateBtn = panel.querySelector('[data-hero-action="translate"]');
    const resetBtn = panel.querySelector('[data-hero-action="reset"]');

    let data = normalize();
    let language = "en";
    let loaded = false;
    let busy = false;
    let dirty = false;
    let usingDefaults = true;

    const setMessage = (text, success = false) => {
      if (!feedbackNode) return;
      feedbackNode.textContent = text;
      feedbackNode.hidden = !text;
      feedbackNode.classList.toggle("is-success", success);
    };

    const readLocal = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
      } catch (_) {
        return null;
      }
    };

    const pick = (map) => String(map?.[language] || map?.en || "").trim();

    const populateProductOptions = async () => {
      if (!productSelect) return;
      const currentVal = data?.cards?.card3?.product_slug || "";
      const items = [];
      if (client) {
        try {
          const { data: rows } = await client
            .from("products")
            .select("slug, name_translations, brand")
            .order("sort_order", { ascending: true });
          if (Array.isArray(rows)) {
            rows.forEach((r) => {
              items.push({
                slug: r.slug,
                label: `${r.brand ? r.brand + " · " : ""}${r.name_translations?.en || r.slug}`,
              });
            });
          }
        } catch (_) {}
      }
      if (!items.length) {
        [
          { slug: "macbook-pro", label: "Apple · MacBook Pro 14 M4" },
          { slug: "galaxy-s25", label: "Samsung · Galaxy S25 Ultra" },
          { slug: "airpods-pro", label: "Apple · AirPods Pro 2" },
          { slug: "watch-ultra", label: "Apple · Watch Ultra 2" },
        ].forEach((p) => items.push(p));
      }
      productSelect.replaceChildren();
      const autoOpt = document.createElement("option");
      autoOpt.value = "";
      autoOpt.textContent = "Automatic (Sync with Homepage Spotlight / Catalog)";
      productSelect.append(autoOpt);
      items.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.slug;
        opt.textContent = item.label;
        productSelect.append(opt);
      });
      productSelect.value = currentVal;
    };

    const updatePreview = () => {
      if (!data || !previewWrap) return;
      previewWrap.dir = language === "ar" ? "rtl" : "ltr";
      prevPill.textContent = pick(data.copy.pill_badge) || "AI-Powered Flagship";
      prevSub.textContent = pick(data.copy.eyebrow_sub);
      prevH1.textContent = pick(data.copy.headline_line1) || "Visualize";
      prevH2.textContent = pick(data.copy.headline_line2) || "Your Tech";
      prevH3.textContent = pick(data.copy.headline_gradient) || "in Motion";
      prevDesc.textContent = pick(data.copy.description);
      prevBtn.textContent = `${pick(data.copy.primary_btn_text) || "Explore Store"} →`;

      prevStats.hidden = !data.show_stats;
      prevStats.replaceChildren(
        ...data.stats.map((st) => {
          const item = document.createElement("div");
          item.className = "hero-preview-stat-item";
          const val = document.createElement("strong");
          val.textContent = `${st.value}${st.suffix}`;
          const lbl = document.createElement("span");
          lbl.textContent = pick(st.label);
          item.append(val, lbl);
          return item;
        }),
      );

      const c1 = data.cards.card1;
      const c2 = data.cards.card2;
      const c3 = data.cards.card3;
      const cardDataList = [
        {
          title: pick(c1.title),
          label: pick(c1.label),
          value: `${c1.number}${c1.suffix}`,
          sub: pick(c1.sub),
        },
        {
          title: pick(c2.title),
          label: pick(c2.label),
          value: `${c2.number}${c2.suffix}`,
          sub: pick(c2.sub),
        },
        {
          title: pick(c3.title),
          label: c3.product_slug ? `Product: ${c3.product_slug}` : "Auto Spotlight Product",
          value: pick(c3.badge),
          sub: "Synced with catalog",
        },
      ];
      prevCards.replaceChildren(
        ...cardDataList.map((c) => {
          const box = document.createElement("div");
          box.className = "hero-preview-glass-card";
          const top = document.createElement("div");
          top.className = "hero-preview-card-head";
          top.textContent = c.title;
          const body = document.createElement("div");
          body.className = "hero-preview-card-body";
          const small = document.createElement("span");
          small.textContent = c.label;
          const strong = document.createElement("strong");
          strong.textContent = c.value;
          const badge = document.createElement("em");
          badge.textContent = c.sub;
          body.append(small, strong, badge);
          box.append(top, body);
          return box;
        }),
      );
    };

    const render = () => {
      if (!data) return;
      const dir = language === "ar" ? "rtl" : "ltr";
      [copyFields, card1Fields, card2Fields, card3Fields, statsFields].forEach((node) => {
        if (node) node.dir = dir;
      });

      form.elements.language.value = language;
      form.elements.intro_mode.value = data.intro_mode;
      form.elements.show_orb.checked = data.show_orb !== false;
      form.elements.show_stats.checked = data.show_stats !== false;

      form.elements.pill_badge.value = data.copy.pill_badge[language] || "";
      form.elements.eyebrow_sub.value = data.copy.eyebrow_sub[language] || "";
      form.elements.headline_line1.value = data.copy.headline_line1[language] || "";
      form.elements.headline_line2.value = data.copy.headline_line2[language] || "";
      form.elements.headline_gradient.value = data.copy.headline_gradient[language] || "";
      form.elements.description.value = data.copy.description[language] || "";
      form.elements.primary_btn_text.value = data.copy.primary_btn_text[language] || "";
      form.elements.primary_btn_href.value = data.copy.primary_btn_href || "/products.html";
      form.elements.orb_text.value = data.copy.orb_text[language] || "";
      form.elements.orb_href.value = data.copy.orb_href || "/products.html";

      form.elements.c1_title.value = data.cards.card1.title[language] || "";
      form.elements.c1_label.value = data.cards.card1.label[language] || "";
      form.elements.c1_number.value = data.cards.card1.number;
      form.elements.c1_suffix.value = data.cards.card1.suffix || "";
      form.elements.c1_sub.value = data.cards.card1.sub[language] || "";
      form.elements.c1_href.value = data.cards.card1.href || "#reviews";

      form.elements.c2_title.value = data.cards.card2.title[language] || "";
      form.elements.c2_label.value = data.cards.card2.label[language] || "";
      form.elements.c2_number.value = data.cards.card2.number;
      form.elements.c2_suffix.value = data.cards.card2.suffix || "";
      form.elements.c2_sub.value = data.cards.card2.sub[language] || "";
      form.elements.c2_href.value = data.cards.card2.href || "/products.html?filter=deals";

      form.elements.c3_title.value = data.cards.card3.title[language] || "";
      form.elements.c3_badge.value = data.cards.card3.badge[language] || "";
      if (productSelect) productSelect.value = data.cards.card3.product_slug || "";

      form.elements.s1_value.value = data.stats[0].value;
      form.elements.s1_suffix.value = data.stats[0].suffix;
      form.elements.s1_label.value = data.stats[0].label[language] || "";

      form.elements.s2_value.value = data.stats[1].value;
      form.elements.s2_suffix.value = data.stats[1].suffix;
      form.elements.s2_label.value = data.stats[1].label[language] || "";

      form.elements.s3_value.value = data.stats[2].value;
      form.elements.s3_suffix.value = data.stats[2].suffix;
      form.elements.s3_label.value = data.stats[2].label[language] || "";

      updatePreview();

      if (liveNode) {
        liveNode.textContent = usingDefaults
          ? "Live on homepage: built-in default HERO configuration (save below to publish your customized HERO)."
          : `Live on homepage: customized HERO · Intro mode: ${data.intro_mode} · 3 Glass Cards · ${data.show_stats ? "3 Bottom Stats" : "Stats hidden"}.`;
      }
      if (stateNode) {
        stateNode.textContent = busy
          ? "Working…"
          : `Editing language: ${language.toUpperCase()}${dirty ? " · Unsaved changes" : " · All changes saved"}`;
      }
    };

    const loadSection = async () => {
      if (busy) return;
      busy = true;
      setMessage("");
      try {
        await populateProductOptions();
        let remote = null;
        if (client) {
          const { data: row, error } = await client
            .from("homepage_sections")
            .select("data")
            .eq("key", SECTION_KEY)
            .maybeSingle();
          if (!error && row?.data && typeof row.data === "object") {
            remote = row.data;
          }
        }
        const local = remote ? null : readLocal();
        const source = remote || local;
        data = normalize(source || undefined);
        usingDefaults = !source;
        dirty = false;
        loaded = true;
      } catch (_) {
        const local = readLocal();
        data = normalize(local || undefined);
        usingDefaults = !local;
        dirty = false;
        loaded = true;
      } finally {
        busy = false;
        render();
      }
    };

    const syncFromInputs = () => {
      data.intro_mode = form.elements.intro_mode.value;
      data.show_orb = form.elements.show_orb.checked;
      data.show_stats = form.elements.show_stats.checked;

      data.copy.pill_badge[language] = form.elements.pill_badge.value;
      data.copy.eyebrow_sub[language] = form.elements.eyebrow_sub.value;
      data.copy.headline_line1[language] = form.elements.headline_line1.value;
      data.copy.headline_line2[language] = form.elements.headline_line2.value;
      data.copy.headline_gradient[language] = form.elements.headline_gradient.value;
      data.copy.description[language] = form.elements.description.value;
      data.copy.primary_btn_text[language] = form.elements.primary_btn_text.value;
      data.copy.primary_btn_href = form.elements.primary_btn_href.value.trim() || "/products.html";
      data.copy.orb_text[language] = form.elements.orb_text.value;
      data.copy.orb_href = form.elements.orb_href.value.trim() || "/products.html";

      data.cards.card1.title[language] = form.elements.c1_title.value;
      data.cards.card1.label[language] = form.elements.c1_label.value;
      data.cards.card1.number = Number(form.elements.c1_number.value) || 0;
      data.cards.card1.suffix = form.elements.c1_suffix.value;
      data.cards.card1.sub[language] = form.elements.c1_sub.value;
      data.cards.card1.href = form.elements.c1_href.value.trim() || "#reviews";

      data.cards.card2.title[language] = form.elements.c2_title.value;
      data.cards.card2.label[language] = form.elements.c2_label.value;
      data.cards.card2.number = Number(form.elements.c2_number.value) || 0;
      data.cards.card2.suffix = form.elements.c2_suffix.value;
      data.cards.card2.sub[language] = form.elements.c2_sub.value;
      data.cards.card2.href = form.elements.c2_href.value.trim() || "/products.html?filter=deals";

      data.cards.card3.title[language] = form.elements.c3_title.value;
      data.cards.card3.badge[language] = form.elements.c3_badge.value;
      data.cards.card3.product_slug = productSelect ? productSelect.value : "";

      [0, 1, 2].forEach((i) => {
        const idx = i + 1;
        const val = Number(form.elements[`s${idx}_value`].value) || 0;
        data.stats[i].value = val;
        data.stats[i].is_decimal = !Number.isInteger(val);
        data.stats[i].suffix = form.elements[`s${idx}_suffix`].value;
        data.stats[i].label[language] = form.elements[`s${idx}_label`].value;
      });

      dirty = true;
      updatePreview();
      if (stateNode) {
        stateNode.textContent = `Editing language: ${language.toUpperCase()} · Unsaved changes`;
      }
    };

    const publishLocal = (payload) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (_) {}
      window.RUQO_HOME_LUNAE_HERO = payload;
      window.dispatchEvent(new CustomEvent("ruqo:home-lunae-hero-updated", { detail: payload }));
    };

    document.querySelector('[data-admin-view="hero"]')?.addEventListener("click", () => {
      if (!loaded) loadSection();
    });

    reloadBtn?.addEventListener("click", () => {
      if (!busy) loadSection();
    });

    form.addEventListener("submit", (e) => e.preventDefault());

    form.elements.language.addEventListener("change", () => {
      language = form.elements.language.value;
      setMessage("");
      render();
    });

    form.addEventListener("input", (e) => {
      if (e.target.name === "language") return;
      syncFromInputs();
    });

    form.addEventListener("change", (e) => {
      if (e.target.name === "language") return;
      syncFromInputs();
    });

    saveBtn?.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      setMessage("Saving & publishing HERO configuration…");
      render();
      try {
        const payload = normalize(data);
        publishLocal(payload);
        if (client) {
          const { error } = await client
            .from("homepage_sections")
            .upsert({ key: SECTION_KEY, data: payload }, { onConflict: "key" });
          if (error && !/homepage_sections|schema cache|relation|404/i.test(error.message || "")) {
            throw error;
          }
        }
        data = payload;
        usingDefaults = false;
        dirty = false;
        setMessage("HERO configuration saved and published to the storefront!", true);
      } catch (err) {
        setMessage(err.message || "Could not save HERO configuration.");
      } finally {
        busy = false;
        render();
      }
    });

    resetBtn?.addEventListener("click", async () => {
      if (busy) return;
      if (!window.confirm("Reset HERO texts, cards, and stats to built-in defaults?")) return;
      busy = true;
      setMessage("");
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_KEY);
        window.RUQO_HOME_LUNAE_HERO = null;
        window.dispatchEvent(new CustomEvent("ruqo:home-lunae-hero-updated", { detail: null }));
        if (client) {
          await client.from("homepage_sections").delete().eq("key", SECTION_KEY);
        }
        data = DEFAULT_DATA();
        usingDefaults = true;
        dirty = false;
        setMessage("HERO reset to built-in defaults.", true);
      } catch (err) {
        setMessage(err.message || "Could not reset HERO.");
      } finally {
        busy = false;
        render();
      }
    });

    translateBtn?.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      setMessage("Translating HERO content into all 5 languages…");
      render();
      try {
        const defaults = DEFAULT_DATA();
        const copyTranslateField = (map, defMap) => {
          const enVal = String(map.en || "").trim();
          const defEn = String(defMap.en || "").trim();
          for (const lang of TARGET_LANGUAGES) {
            if (!String(map[lang] || "").trim() || enVal === defEn) {
              map[lang] = enVal === defEn ? defMap[lang] : enVal;
            }
          }
        };

        if (client?.functions?.invoke) {
          try {
            const { data: resp, error } = await client.functions.invoke("translate-high-refresh", {
              body: {
                source: {
                  badge: data.copy.pill_badge.en,
                  eyebrow: data.copy.eyebrow_sub.en,
                  title: `${data.copy.headline_line1.en} | ${data.copy.headline_line2.en} | ${data.copy.headline_gradient.en}`,
                  text: data.copy.description.en,
                },
                translations: {},
              },
            });
            if (!error && resp?.translations) {
              for (const lang of TARGET_LANGUAGES) {
                const tr = resp.translations[lang];
                if (!tr) continue;
                if (tr.badge) data.copy.pill_badge[lang] = tr.badge;
                if (tr.eyebrow) data.copy.eyebrow_sub[lang] = tr.eyebrow;
                if (tr.text) data.copy.description[lang] = tr.text;
                if (tr.title && tr.title.includes("|")) {
                  const parts = tr.title.split("|").map((s) => s.trim());
                  if (parts[0]) data.copy.headline_line1[lang] = parts[0];
                  if (parts[1]) data.copy.headline_line2[lang] = parts[1];
                  if (parts[2]) data.copy.headline_gradient[lang] = parts[2];
                }
              }
            }
          } catch (_) {}
        }

        copyTranslateField(data.copy.pill_badge, defaults.copy.pill_badge);
        copyTranslateField(data.copy.eyebrow_sub, defaults.copy.eyebrow_sub);
        copyTranslateField(data.copy.headline_line1, defaults.copy.headline_line1);
        copyTranslateField(data.copy.headline_line2, defaults.copy.headline_line2);
        copyTranslateField(data.copy.headline_gradient, defaults.copy.headline_gradient);
        copyTranslateField(data.copy.description, defaults.copy.description);
        copyTranslateField(data.copy.primary_btn_text, defaults.copy.primary_btn_text);
        copyTranslateField(data.copy.orb_text, defaults.copy.orb_text);
        copyTranslateField(data.cards.card1.title, defaults.cards.card1.title);
        copyTranslateField(data.cards.card1.label, defaults.cards.card1.label);
        copyTranslateField(data.cards.card1.sub, defaults.cards.card1.sub);
        copyTranslateField(data.cards.card2.title, defaults.cards.card2.title);
        copyTranslateField(data.cards.card2.label, defaults.cards.card2.label);
        copyTranslateField(data.cards.card2.sub, defaults.cards.card2.sub);
        copyTranslateField(data.cards.card3.title, defaults.cards.card3.title);
        copyTranslateField(data.cards.card3.badge, defaults.cards.card3.badge);
        [0, 1, 2].forEach((i) => {
          copyTranslateField(data.stats[i].label, defaults.stats[i].label);
        });

        dirty = true;
        setMessage("All 5 languages populated! Switch language to review or click Save & publish HERO.", true);
      } finally {
        busy = false;
        render();
      }
    });

    loadSection();
  };
})();
