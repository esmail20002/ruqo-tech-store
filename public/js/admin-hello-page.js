(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const TARGET_LANGUAGES = ["ar", "fr", "es", "zh"];
  const SECTION_KEY = "hello_page";
  const STORAGE_KEY = "ruqo-home-hello-page-v1";
  const CACHE_KEY = "ruqo-home-hello-page-cache-v1";

  const DEFAULT_DATA = () => ({
    enabled: true,
    display_mode: "first_visit",
    default_currency: "USD",
    default_language: "en",
    show_currency_picker: true,
    show_language_picker: true,
    show_logo: true,
    logo_url: "/images/new/li.png",
    copy: {
      title: {
        en: "Intelligent technology for modern flagship experiences",
        ar: "تقنيات ذكية لتجارب رائدة وعصرية",
        fr: "Technologie intelligente pour des expériences phares modernes",
        es: "Tecnología inteligente para experiencias insignia modernas",
        zh: "智能科技，成就现代旗舰体验",
      },
      subtitle: {
        en: "WEEXEY curates flagship performance, precision optics, and neural audio. Choose your language to begin a seamless cinematic experience.",
        ar: "تجمع WEEXEY بين الأداء الرائد والبصريات الدقيقة والصوت العصبي. اختر لغتك لبدء تجربة سينمائية سلسة.",
        fr: "WEEXEY réunit performances de pointe, optique de précision et audio neuronal. Choisissez votre langue pour commencer.",
        es: "WEEXEY combina rendimiento insignia, óptica de precisión y audio neuronal. Elige tu idioma para comenzar.",
        zh: "WEEXEY 荟萃旗舰性能、精密光学与神经音频。选择您的语言，开启沉浸式光影体验。",
      },
      slide_btn_text: {
        en: "Get Started",
        ar: "ابدأ الآن",
        fr: "Commencer",
        es: "Comenzar",
        zh: "立即开启",
      },
    },
    mobile: {
      model_image_url:
        "https://images.unsplash.com/photo-1625786682948-2168238883d2?auto=format&fit=crop&w=900&q=85",
      show_outline_word: true,
      outline_line1: "WEE",
      outline_line2: "XEY",
      outline_scale: 100,
      outline_pos_x: 50,
      outline_pos_y: 72,
      show_stripes: true,
    },
    desktop: {
      crystal_video_url: "/images/new/gate-crystal-motion.mp4?v=2",
      crystal_poster_url: "/images/new/gate-crystal.webp?v=3",
      cards: {
        card1: {
          visible: true,
          num1: "$13,592.00",
          label1: {
            en: "Flagship Index",
            ar: "مؤشر الفلاجشيب",
            fr: "Indice Flagship",
            es: "Índice Flagship",
            zh: "旗舰指数",
          },
          badge1: "▼ 14.4%",
          num2: "$12,167.00",
          label2: {
            en: "Smart Devices",
            ar: "الأجهزة الذكية",
            fr: "Appareils intelligents",
            es: "Dispositivos inteligentes",
            zh: "智能设备",
          },
          badge2: "▲ 8.3%",
          vs_text: {
            en: "vs prev. period",
            ar: "مقارنة بالفترة السابقة",
            fr: "vs période préc.",
            es: "vs período ant.",
            zh: "对比上期",
          },
        },
        card2: {
          visible: true,
          label: {
            en: "Goal",
            ar: "الهدف",
            fr: "Objectif",
            es: "Meta",
            zh: "目标",
          },
          value: "56K",
          badge: "▼ 14.6%",
        },
        card3: {
          visible: true,
          pill: {
            en: "Flagship speed",
            ar: "سرعة رائدة",
            fr: "Vitesse Flagship",
            es: "Velocidad Flagship",
            zh: "旗舰速度",
          },
          bars: [
            { pct: "42%", num: "242,925" },
            { pct: "24%", num: "90,188" },
            { pct: "20%", num: "64,193" },
            { pct: "14%", num: "48,210" },
          ],
        },
        card4: {
          visible: true,
          title: {
            en: "Customer rating",
            ar: "تقييم العملاء",
            fr: "Avis clients",
            es: "Valoración",
            zh: "客户评分",
          },
          value: "$24,345.00",
          sub: {
            en: "Verified analytics",
            ar: "تحليلات موثقة",
            fr: "Analyses vérifiées",
            es: "Analítica verificada",
            zh: "官方认证数据",
          },
        },
      },
    },
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
    const mobile = src.mobile && typeof src.mobile === "object" ? src.mobile : {};
    const desktop = src.desktop && typeof src.desktop === "object" ? src.desktop : {};
    const cards = desktop.cards && typeof desktop.cards === "object" ? desktop.cards : {};
    const c1 = cards.card1 && typeof cards.card1 === "object" ? cards.card1 : {};
    const c2 = cards.card2 && typeof cards.card2 === "object" ? cards.card2 : {};
    const c3 = cards.card3 && typeof cards.card3 === "object" ? cards.card3 : {};
    const c4 = cards.card4 && typeof cards.card4 === "object" ? cards.card4 : {};
    const rawBars = Array.isArray(c3.bars) ? c3.bars : base.desktop.cards.card3.bars;

    const mode = ["first_visit", "always", "disabled"].includes(src.display_mode)
      ? src.display_mode
      : src.enabled === false
        ? "disabled"
        : base.display_mode;

    return {
      enabled: mode !== "disabled",
      display_mode: mode,
      default_currency: ["USD", "EUR", "SAR"].includes(src.default_currency)
        ? src.default_currency
        : base.default_currency,
      default_language: LANGUAGES.includes(src.default_language)
        ? src.default_language
        : base.default_language,
      show_currency_picker: src.show_currency_picker !== false,
      show_language_picker: src.show_language_picker !== false,
      show_logo: src.show_logo !== false,
      logo_url: String(src.logo_url || base.logo_url).trim() || base.logo_url,
      copy: {
        title: asMap(copy.title, base.copy.title),
        subtitle: asMap(copy.subtitle, base.copy.subtitle),
        slide_btn_text: asMap(copy.slide_btn_text, base.copy.slide_btn_text),
      },
      mobile: {
        model_image_url:
          String(mobile.model_image_url || base.mobile.model_image_url).trim() ||
          base.mobile.model_image_url,
        show_outline_word: mobile.show_outline_word !== false,
        outline_line1: String(mobile.outline_line1 ?? base.mobile.outline_line1).slice(0, 20),
        outline_line2: String(mobile.outline_line2 ?? base.mobile.outline_line2).slice(0, 20),
        outline_scale: Number.isFinite(Number(mobile.outline_scale))
          ? Math.min(180, Math.max(40, Number(mobile.outline_scale)))
          : base.mobile.outline_scale,
        outline_pos_x: Number.isFinite(Number(mobile.outline_pos_x))
          ? Math.min(90, Math.max(10, Number(mobile.outline_pos_x)))
          : base.mobile.outline_pos_x,
        outline_pos_y: Number.isFinite(Number(mobile.outline_pos_y))
          ? Math.min(92, Math.max(10, Number(mobile.outline_pos_y)))
          : base.mobile.outline_pos_y,
        show_stripes: mobile.show_stripes !== false,
      },
      desktop: {
        crystal_video_url:
          String(desktop.crystal_video_url || base.desktop.crystal_video_url).trim() ||
          base.desktop.crystal_video_url,
        crystal_poster_url:
          String(desktop.crystal_poster_url || base.desktop.crystal_poster_url).trim() ||
          base.desktop.crystal_poster_url,
        cards: {
          card1: {
            visible: c1.visible !== false,
            num1: String(c1.num1 ?? base.desktop.cards.card1.num1).slice(0, 40),
            label1: asMap(c1.label1, base.desktop.cards.card1.label1),
            badge1: String(c1.badge1 ?? base.desktop.cards.card1.badge1).slice(0, 30),
            num2: String(c1.num2 ?? base.desktop.cards.card1.num2).slice(0, 40),
            label2: asMap(c1.label2, base.desktop.cards.card1.label2),
            badge2: String(c1.badge2 ?? base.desktop.cards.card1.badge2).slice(0, 30),
            vs_text: asMap(c1.vs_text, base.desktop.cards.card1.vs_text),
          },
          card2: {
            visible: c2.visible !== false,
            label: asMap(c2.label, base.desktop.cards.card2.label),
            value: String(c2.value ?? base.desktop.cards.card2.value).slice(0, 40),
            badge: String(c2.badge ?? base.desktop.cards.card2.badge).slice(0, 30),
          },
          card3: {
            visible: c3.visible !== false,
            pill: asMap(c3.pill, base.desktop.cards.card3.pill),
            bars: [0, 1, 2, 3].map((i) => ({
              pct: String(rawBars[i]?.pct ?? base.desktop.cards.card3.bars[i].pct).slice(0, 20),
              num: String(rawBars[i]?.num ?? base.desktop.cards.card3.bars[i].num).slice(0, 30),
            })),
          },
          card4: {
            visible: c4.visible !== false,
            title: asMap(c4.title, base.desktop.cards.card4.title),
            value: String(c4.value ?? base.desktop.cards.card4.value).slice(0, 40),
            sub: asMap(c4.sub, base.desktop.cards.card4.sub),
          },
        },
      },
    };
  };

  const LANG_NAMES = {
    en: "English",
    fr: "French",
    es: "Spanish",
    zh: "Chinese",
    ar: "Arabic",
  };

  let initialized = false;
  window.RUQO_INIT_HELLO_PAGE_EDITOR = (client) => {
    if (initialized) return;
    const panel = document.querySelector('[data-admin-panel="hello-page"]');
    const form = document.querySelector("#hello-page-form");
    if (!panel || !form) return;
    initialized = true;

    const reloadBtn = panel.querySelector("[data-hp-reload]");
    const liveNode = panel.querySelector("[data-hp-live]");
    const stateNode = panel.querySelector("[data-hp-state]");
    const feedbackNode = panel.querySelector("[data-hp-feedback]");
    const copyFields = panel.querySelector("[data-hp-copy-fields]");
    const c1Fields = panel.querySelector("[data-hp-c1-fields]");
    const c2Fields = panel.querySelector("[data-hp-c2-fields]");
    const c3Fields = panel.querySelector("[data-hp-c3-fields]");
    const c4Fields = panel.querySelector("[data-hp-c4-fields]");

    // Live preview nodes
    const prevStripes = panel.querySelector("[data-hp-prev-stripes]");
    const prevModel = panel.querySelector("[data-hp-prev-model]");
    const prevOutline = panel.querySelector("[data-hp-prev-outline]");
    const prevOutline1 = panel.querySelector("[data-hp-prev-outline1]");
    const prevOutline2 = panel.querySelector("[data-hp-prev-outline2]");
    const outlineScaleLabel = panel.querySelector("[data-hp-outline-scale-label]");
    const outlineXLabel = panel.querySelector("[data-hp-outline-x-label]");
    const outlineYLabel = panel.querySelector("[data-hp-outline-y-label]");
    const prevMobLogoWrap = panel.querySelector("[data-hp-prev-mobile-logo-wrap]");
    const prevMobLogo = panel.querySelector("[data-hp-prev-logo-mob]");
    const prevMobTitle = panel.querySelector("[data-hp-prev-title-mob]");
    const prevMobSub = panel.querySelector("[data-hp-prev-sub-mob]");
    const prevMobPickers = panel.querySelector("[data-hp-prev-pickers-mob]");
    const prevMobCurr = panel.querySelector("[data-hp-prev-curr-mob]");
    const prevMobLang = panel.querySelector("[data-hp-prev-lang-mob]");
    const prevMobSlide = panel.querySelector("[data-hp-prev-slide-mob]");
    const prevMobSheet = panel.querySelector("[data-hp-prev-mobile-sheet]");

    const prevDeskWrap = panel.querySelector("[data-hp-prev-desktop]");
    const prevDeskLogoWrap = panel.querySelector("[data-hp-prev-desk-logo-wrap]");
    const prevDeskLogo = panel.querySelector("[data-hp-prev-logo-desk]");
    const prevDeskTitle = panel.querySelector("[data-hp-prev-title-desk]");
    const prevDeskSub = panel.querySelector("[data-hp-prev-sub-desk]");
    const prevDeskPickers = panel.querySelector("[data-hp-prev-pickers-desk]");
    const prevDeskCurr = panel.querySelector("[data-hp-prev-curr-desk]");
    const prevDeskLang = panel.querySelector("[data-hp-prev-lang-desk]");
    const prevDeskStart = panel.querySelector("[data-hp-prev-start-desk]");
    const prevC1 = panel.querySelector("[data-hp-prev-c1]");
    const prevC1Num = panel.querySelector("[data-hp-prev-c1-num]");
    const prevC1Lbl = panel.querySelector("[data-hp-prev-c1-lbl]");
    const prevC2 = panel.querySelector("[data-hp-prev-c2]");
    const prevC2Lbl = panel.querySelector("[data-hp-prev-c2-lbl]");
    const prevC2Val = panel.querySelector("[data-hp-prev-c2-val]");
    const prevC3 = panel.querySelector("[data-hp-prev-c3]");
    const prevC3Pill = panel.querySelector("[data-hp-prev-c3-pill]");
    const prevC3Top = panel.querySelector("[data-hp-prev-c3-top]");
    const prevC4 = panel.querySelector("[data-hp-prev-c4]");
    const prevC4Title = panel.querySelector("[data-hp-prev-c4-title]");
    const prevC4Val = panel.querySelector("[data-hp-prev-c4-val]");
    const prevCrystal = panel.querySelector("[data-hp-prev-crystal]");

    const saveBtn = panel.querySelector('[data-hp-action="save"]');
    const translateBtn = panel.querySelector('[data-hp-action="translate"]');
    const resetBtn = panel.querySelector('[data-hp-action="reset"]');

    let data = normalize();
    let language = "en";
    let loaded = false;
    let busy = false;
    let dirty = false;
    let usingDefaults = true;
    const pendingFiles = new Map();

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

    const fileToDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read the selected image file."));
        reader.readAsDataURL(file);
      });

    const updatePreview = () => {
      if (!data) return;
      const dir = language === "ar" ? "rtl" : "ltr";
      if (prevMobSheet) prevMobSheet.dir = dir;
      if (prevDeskWrap) prevDeskWrap.dir = dir;

      const logoSrc = data.logo_url || "/images/new/li.png";
      if (prevMobLogo) prevMobLogo.src = logoSrc;
      if (prevDeskLogo) prevDeskLogo.src = logoSrc;
      if (prevMobLogoWrap) prevMobLogoWrap.hidden = !data.show_logo;
      if (prevDeskLogoWrap) prevDeskLogoWrap.hidden = !data.show_logo;

      const titleText = pick(data.copy.title) || "Intelligent technology for modern flagship experiences";
      const subText = pick(data.copy.subtitle);
      const slideText = pick(data.copy.slide_btn_text) || "Get Started";

      if (prevMobTitle) prevMobTitle.textContent = titleText;
      if (prevDeskTitle) prevDeskTitle.textContent = titleText;
      if (prevMobSub) prevMobSub.textContent = subText;
      if (prevDeskSub) prevDeskSub.textContent = subText;
      if (prevMobSlide) prevMobSlide.textContent = slideText;
      if (prevDeskStart) prevDeskStart.textContent = `${slideText} →`;

      const currLabel = `${data.default_currency} ▾`;
      const langLabel = `${LANG_NAMES[language] || "English"} ▾`;
      if (prevMobCurr) {
        prevMobCurr.textContent = currLabel;
        prevMobCurr.hidden = !data.show_currency_picker;
      }
      if (prevDeskCurr) {
        prevDeskCurr.textContent = currLabel;
        prevDeskCurr.hidden = !data.show_currency_picker;
      }
      if (prevMobLang) {
        prevMobLang.textContent = langLabel;
        prevMobLang.hidden = !data.show_language_picker;
      }
      if (prevDeskLang) {
        prevDeskLang.textContent = langLabel;
        prevDeskLang.hidden = !data.show_language_picker;
      }
      const anyPicker = data.show_currency_picker || data.show_language_picker;
      if (prevMobPickers) prevMobPickers.hidden = !anyPicker;

      // Mobile stage preview
      if (prevModel) prevModel.src = data.mobile.model_image_url;
      if (prevStripes) prevStripes.hidden = !data.mobile.show_stripes;
      const posX = Number.isFinite(Number(data.mobile.outline_pos_x)) ? Number(data.mobile.outline_pos_x) : 50;
      const posY = Number.isFinite(Number(data.mobile.outline_pos_y)) ? Number(data.mobile.outline_pos_y) : 72;
      if (prevOutline) {
        prevOutline.hidden = !data.mobile.show_outline_word;
        const scaleRatio = (Number(data.mobile.outline_scale) || 100) / 100;
        prevOutline.style.setProperty("--hp-outline-scale", String(scaleRatio));
        prevOutline.style.setProperty("--hp-outline-x", `${posX}%`);
        prevOutline.style.setProperty("--hp-outline-y", `${posY}%`);
      }
      if (outlineScaleLabel) {
        outlineScaleLabel.textContent = `${Number(data.mobile.outline_scale) || 100}%`;
      }
      if (outlineXLabel) {
        outlineXLabel.textContent = `${posX}%`;
      }
      if (outlineYLabel) {
        outlineYLabel.textContent = `${posY}%`;
      }
      if (prevOutline1) prevOutline1.textContent = data.mobile.outline_line1;
      if (prevOutline2) prevOutline2.textContent = data.mobile.outline_line2;

      // Desktop stage preview
      if (prevCrystal) prevCrystal.src = data.desktop.crystal_poster_url || "/images/new/gate-crystal.webp?v=3";
      const cards = data.desktop.cards;
      if (prevC1) prevC1.hidden = !cards.card1.visible;
      if (prevC1Num) prevC1Num.textContent = cards.card1.num1;
      if (prevC1Lbl) prevC1Lbl.textContent = pick(cards.card1.label1);

      if (prevC2) prevC2.hidden = !cards.card2.visible;
      if (prevC2Lbl) prevC2Lbl.textContent = pick(cards.card2.label);
      if (prevC2Val) prevC2Val.textContent = cards.card2.value;

      if (prevC3) prevC3.hidden = !cards.card3.visible;
      if (prevC3Pill) prevC3Pill.textContent = pick(cards.card3.pill);
      if (prevC3Top && cards.card3.bars[0]) {
        prevC3Top.textContent = `${cards.card3.bars[0].pct} · ${cards.card3.bars[0].num}`;
      }

      if (prevC4) prevC4.hidden = !cards.card4.visible;
      if (prevC4Title) prevC4Title.textContent = pick(cards.card4.title);
      if (prevC4Val) prevC4Val.textContent = cards.card4.value;
    };

    const render = () => {
      if (!data) return;
      const dir = language === "ar" ? "rtl" : "ltr";
      [copyFields, c1Fields, c2Fields, c3Fields, c4Fields].forEach((node) => {
        if (node) node.dir = dir;
      });

      form.elements.language.value = language;
      form.elements.display_mode.value = data.display_mode;
      form.elements.default_currency.value = data.default_currency;
      form.elements.default_language.value = data.default_language;
      form.elements.show_currency_picker.checked = data.show_currency_picker !== false;
      form.elements.show_language_picker.checked = data.show_language_picker !== false;
      form.elements.show_logo.checked = data.show_logo !== false;
      form.elements.logo_url.value = data.logo_url.startsWith("data:") ? "" : data.logo_url;

      form.elements.title.value = data.copy.title[language] || "";
      form.elements.subtitle.value = data.copy.subtitle[language] || "";
      form.elements.slide_btn_text.value = data.copy.slide_btn_text[language] || "";

      form.elements.mobile_model_url.value = data.mobile.model_image_url.startsWith("data:")
        ? ""
        : data.mobile.model_image_url;
      form.elements.show_outline_word.checked = data.mobile.show_outline_word !== false;
      form.elements.show_stripes.checked = data.mobile.show_stripes !== false;
      form.elements.outline_line1.value = data.mobile.outline_line1;
      form.elements.outline_line2.value = data.mobile.outline_line2;
      if (form.elements.outline_scale) {
        form.elements.outline_scale.value = String(data.mobile.outline_scale || 100);
      }
      if (form.elements.outline_pos_x) {
        form.elements.outline_pos_x.value = String(data.mobile.outline_pos_x ?? 50);
      }
      if (form.elements.outline_pos_y) {
        form.elements.outline_pos_y.value = String(data.mobile.outline_pos_y ?? 72);
      }

      form.elements.crystal_video_url.value = data.desktop.crystal_video_url;
      form.elements.crystal_poster_url.value = data.desktop.crystal_poster_url.startsWith("data:")
        ? ""
        : data.desktop.crystal_poster_url;

      const c1 = data.desktop.cards.card1;
      form.elements.c1_visible.checked = c1.visible !== false;
      form.elements.c1_num1.value = c1.num1;
      form.elements.c1_label1.value = c1.label1[language] || "";
      form.elements.c1_badge1.value = c1.badge1;
      form.elements.c1_num2.value = c1.num2;
      form.elements.c1_label2.value = c1.label2[language] || "";
      form.elements.c1_badge2.value = c1.badge2;
      form.elements.c1_vs.value = c1.vs_text[language] || "";

      const c2 = data.desktop.cards.card2;
      form.elements.c2_visible.checked = c2.visible !== false;
      form.elements.c2_label.value = c2.label[language] || "";
      form.elements.c2_value.value = c2.value;
      form.elements.c2_badge.value = c2.badge;

      const c3 = data.desktop.cards.card3;
      form.elements.c3_visible.checked = c3.visible !== false;
      form.elements.c3_pill.value = c3.pill[language] || "";
      [0, 1, 2, 3].forEach((i) => {
        const idx = i + 1;
        form.elements[`c3_b${idx}_pct`].value = c3.bars[i].pct;
        form.elements[`c3_b${idx}_num`].value = c3.bars[i].num;
      });

      const c4 = data.desktop.cards.card4;
      form.elements.c4_visible.checked = c4.visible !== false;
      form.elements.c4_title.value = c4.title[language] || "";
      form.elements.c4_value.value = c4.value;
      form.elements.c4_sub.value = c4.sub[language] || "";

      updatePreview();

      if (liveNode) {
        liveNode.textContent = usingDefaults
          ? "Live on storefront: built-in default hello page configuration (save below to publish your customized hello page)."
          : `Live on storefront: customized hello page · Mode: ${data.display_mode} · Default: ${data.default_currency} / ${data.default_language.toUpperCase()}.`;
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
      data.display_mode = form.elements.display_mode.value;
      data.enabled = data.display_mode !== "disabled";
      data.default_currency = form.elements.default_currency.value;
      data.default_language = form.elements.default_language.value;
      data.show_currency_picker = form.elements.show_currency_picker.checked;
      data.show_language_picker = form.elements.show_language_picker.checked;
      data.show_logo = form.elements.show_logo.checked;
      if (form.elements.logo_url.value.trim()) {
        data.logo_url = form.elements.logo_url.value.trim();
        pendingFiles.delete("logo");
      }

      data.copy.title[language] = form.elements.title.value;
      data.copy.subtitle[language] = form.elements.subtitle.value;
      data.copy.slide_btn_text[language] = form.elements.slide_btn_text.value;

      if (form.elements.mobile_model_url.value.trim()) {
        data.mobile.model_image_url = form.elements.mobile_model_url.value.trim();
        pendingFiles.delete("mobile_model");
      }
      data.mobile.show_outline_word = form.elements.show_outline_word.checked;
      data.mobile.show_stripes = form.elements.show_stripes.checked;
      data.mobile.outline_line1 = form.elements.outline_line1.value;
      data.mobile.outline_line2 = form.elements.outline_line2.value;
      if (form.elements.outline_scale) {
        data.mobile.outline_scale = Math.min(
          180,
          Math.max(40, Number(form.elements.outline_scale.value) || 100),
        );
      }
      if (form.elements.outline_pos_x) {
        data.mobile.outline_pos_x = Math.min(
          90,
          Math.max(10, Number(form.elements.outline_pos_x.value) || 50),
        );
      }
      if (form.elements.outline_pos_y) {
        data.mobile.outline_pos_y = Math.min(
          92,
          Math.max(10, Number(form.elements.outline_pos_y.value) || 72),
        );
      }

      data.desktop.crystal_video_url =
        form.elements.crystal_video_url.value.trim() || "/images/new/gate-crystal-motion.mp4?v=2";
      if (form.elements.crystal_poster_url.value.trim()) {
        data.desktop.crystal_poster_url = form.elements.crystal_poster_url.value.trim();
        pendingFiles.delete("crystal_poster");
      }

      const c1 = data.desktop.cards.card1;
      c1.visible = form.elements.c1_visible.checked;
      c1.num1 = form.elements.c1_num1.value;
      c1.label1[language] = form.elements.c1_label1.value;
      c1.badge1 = form.elements.c1_badge1.value;
      c1.num2 = form.elements.c1_num2.value;
      c1.label2[language] = form.elements.c1_label2.value;
      c1.badge2 = form.elements.c1_badge2.value;
      c1.vs_text[language] = form.elements.c1_vs.value;

      const c2 = data.desktop.cards.card2;
      c2.visible = form.elements.c2_visible.checked;
      c2.label[language] = form.elements.c2_label.value;
      c2.value = form.elements.c2_value.value;
      c2.badge = form.elements.c2_badge.value;

      const c3 = data.desktop.cards.card3;
      c3.visible = form.elements.c3_visible.checked;
      c3.pill[language] = form.elements.c3_pill.value;
      [0, 1, 2, 3].forEach((i) => {
        const idx = i + 1;
        c3.bars[i].pct = form.elements[`c3_b${idx}_pct`].value;
        c3.bars[i].num = form.elements[`c3_b${idx}_num`].value;
      });

      const c4 = data.desktop.cards.card4;
      c4.visible = form.elements.c4_visible.checked;
      c4.title[language] = form.elements.c4_title.value;
      c4.value = form.elements.c4_value.value;
      c4.sub[language] = form.elements.c4_sub.value;

      dirty = true;
      updatePreview();
      if (stateNode) {
        stateNode.textContent = `Editing language: ${language.toUpperCase()} · Unsaved changes`;
      }
    };

    const handleFileUploadInput = async (inputEl, key, applyUrl) => {
      const file = inputEl.files?.[0];
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
        inputEl.value = "";
        setMessage("Please choose a PNG, JPEG, or WebP image under 10 MB.");
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        pendingFiles.set(key, file);
        applyUrl(dataUrl);
        dirty = true;
        setMessage("Image ready for preview. Click Save & publish hello page to apply.", true);
        updatePreview();
      } catch (err) {
        setMessage(err.message || "Could not load image file.");
      }
    };

    form.elements.logo_file?.addEventListener("change", () => {
      handleFileUploadInput(form.elements.logo_file, "logo", (url) => {
        data.logo_url = url;
        form.elements.logo_url.value = "";
      });
    });

    form.elements.mobile_model_file?.addEventListener("change", () => {
      handleFileUploadInput(form.elements.mobile_model_file, "mobile_model", (url) => {
        data.mobile.model_image_url = url;
        form.elements.mobile_model_url.value = "";
      });
    });

    form.elements.crystal_poster_file?.addEventListener("change", () => {
      handleFileUploadInput(form.elements.crystal_poster_file, "crystal_poster", (url) => {
        data.desktop.crystal_poster_url = url;
        form.elements.crystal_poster_url.value = "";
      });
    });

    const publishLocal = (payload) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (_) {}
      window.RUQO_HOME_HELLO_PAGE = payload;
      window.dispatchEvent(new CustomEvent("ruqo:home-hello-page-updated", { detail: payload }));
    };

    document.querySelector('[data-admin-view="hello-page"]')?.addEventListener("click", () => {
      if (!loaded) loadSection();
    });

    reloadBtn?.addEventListener("click", () => {
      if (!busy) {
        pendingFiles.clear();
        loadSection();
      }
    });

    form.addEventListener("submit", (e) => e.preventDefault());

    form.elements.language.addEventListener("change", () => {
      language = form.elements.language.value;
      setMessage("");
      render();
    });

    form.addEventListener("input", (e) => {
      if (e.target.name === "language" || e.target.type === "file") return;
      syncFromInputs();
    });

    form.addEventListener("change", (e) => {
      if (e.target.name === "language" || e.target.type === "file") return;
      syncFromInputs();
    });

    saveBtn?.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      setMessage("Saving & publishing hello page configuration…");
      render();
      try {
        // Upload any selected files to Supabase storage if available; otherwise keep data URLs
        if (client?.storage && pendingFiles.size > 0) {
          for (const [key, file] of pendingFiles.entries()) {
            try {
              const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
              const path = `hello-page/${key}-${crypto.randomUUID()}.${ext}`;
              const { error: upErr } = await client.storage.from("banner-images").upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
              });
              if (!upErr) {
                const publicUrl = client.storage.from("banner-images").getPublicUrl(path).data.publicUrl;
                if (key === "logo") data.logo_url = publicUrl;
                if (key === "mobile_model") data.mobile.model_image_url = publicUrl;
                if (key === "crystal_poster") data.desktop.crystal_poster_url = publicUrl;
              }
            } catch (_) {}
          }
        }
        pendingFiles.clear();

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
        setMessage("hello page configuration saved and published to the storefront!", true);
      } catch (err) {
        setMessage(err.message || "Could not save hello page configuration.");
      } finally {
        busy = false;
        render();
      }
    });

    resetBtn?.addEventListener("click", async () => {
      if (busy) return;
      if (!window.confirm("Reset hello page texts, mobile portrait, and desktop cards to built-in defaults?")) return;
      busy = true;
      setMessage("");
      try {
        pendingFiles.clear();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_KEY);
        window.RUQO_HOME_HELLO_PAGE = null;
        window.dispatchEvent(new CustomEvent("ruqo:home-hello-page-updated", { detail: null }));
        if (client) {
          await client.from("homepage_sections").delete().eq("key", SECTION_KEY);
        }
        data = DEFAULT_DATA();
        usingDefaults = true;
        dirty = false;
        setMessage("hello page reset to built-in defaults.", true);
      } catch (err) {
        setMessage(err.message || "Could not reset hello page.");
      } finally {
        busy = false;
        render();
      }
    });

    translateBtn?.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      setMessage("Translating hello page content into all 5 languages…");
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
                  title: data.copy.title.en,
                  text: data.copy.subtitle.en,
                  button: data.copy.slide_btn_text.en,
                  eyebrow: data.desktop.cards.card3.pill.en,
                },
                translations: {},
              },
            });
            if (!error && resp?.translations) {
              for (const lang of TARGET_LANGUAGES) {
                const tr = resp.translations[lang];
                if (!tr) continue;
                if (tr.title) data.copy.title[lang] = tr.title;
                if (tr.text) data.copy.subtitle[lang] = tr.text;
                if (tr.button) data.copy.slide_btn_text[lang] = tr.button;
                if (tr.eyebrow) data.desktop.cards.card3.pill[lang] = tr.eyebrow;
              }
            }
          } catch (_) {}
        }

        copyTranslateField(data.copy.title, defaults.copy.title);
        copyTranslateField(data.copy.subtitle, defaults.copy.subtitle);
        copyTranslateField(data.copy.slide_btn_text, defaults.copy.slide_btn_text);
        copyTranslateField(data.desktop.cards.card1.label1, defaults.desktop.cards.card1.label1);
        copyTranslateField(data.desktop.cards.card1.label2, defaults.desktop.cards.card1.label2);
        copyTranslateField(data.desktop.cards.card1.vs_text, defaults.desktop.cards.card1.vs_text);
        copyTranslateField(data.desktop.cards.card2.label, defaults.desktop.cards.card2.label);
        copyTranslateField(data.desktop.cards.card3.pill, defaults.desktop.cards.card3.pill);
        copyTranslateField(data.desktop.cards.card4.title, defaults.desktop.cards.card4.title);
        copyTranslateField(data.desktop.cards.card4.sub, defaults.desktop.cards.card4.sub);

        dirty = true;
        setMessage("All 5 languages populated! Switch language to review or click Save & publish hello page.", true);
      } finally {
        busy = false;
        render();
      }
    });

    loadSection();
  };
})();
