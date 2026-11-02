(() => {
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85";
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const TARGET_LANGUAGES = ["ar", "fr", "es", "zh"];
  const FIELDS = ["eyebrow", "title", "description", "button"];

  const toLocalDateTime = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const fromLocalDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const makeDealSlide = (overrides = {}) => ({
    id: crypto.randomUUID(),
    name: "Exclusive deal",
    placement: "home_promo",
    image_path: DEFAULT_IMAGE,
    image_url: DEFAULT_IMAGE,
    destination_url: "/products.html?filter=deals",
    background_color: "#6931a9",
    starts_at: null,
    ends_at: null,
    sort_order: 0,
    is_active: true,
    eyebrow_translations: {
      en: "Exclusive deals",
      ar: "تخفيضات حصرية",
      fr: "Offres exclusives",
      es: "Ofertas exclusivas",
      zh: "独家优惠",
    },
    title_translations: {
      en: "Up to 35% off gaming devices",
      ar: "خصم يصل إلى 35% على أجهزة الألعاب",
      fr: "Jusqu’à 35 % de réduction sur les appareils gaming",
      es: "Hasta un 35 % de descuento en dispositivos gaming",
      zh: "游戏设备最高享 35% 折扣",
    },
    description_translations: {
      en: "Enjoy premium performance with high-refresh displays and powerful gaming hardware.",
      ar: "استمتع بأداء استثنائي مع شاشات عالية التردد وأجهزة قوية للعبة المميزة.",
      fr: "Profitez de performances exceptionnelles avec des écrans haute fréquence et du matériel puissant.",
      es: "Disfruta de un rendimiento superior con pantallas de alta frecuencia y hardware potente.",
      zh: "畅享高刷新率屏幕与强劲游戏硬件带来的卓越性能。",
    },
    button_translations: {
      en: "Claim offer",
      ar: "احصل على العرض",
      fr: "Profiter de l’offre",
      es: "Obtener oferta",
      zh: "立即领取",
    },
    _isNew: true,
    ...overrides,
  });

  window.RUQO_INIT_PROMO_BANNER_SETTINGS = (client) => {
    const panel = document.querySelector('[data-admin-panel="exclusive-deals"]');
    const rotationForm = document.querySelector("#homepage-promo-settings-form");
    const rotationFeedback = document.querySelector("#homepage-promo-settings-feedback");
    const editorForm = document.querySelector("#exclusive-deals-form");
    if (!panel || !rotationForm || !rotationFeedback || !editorForm) return;

    let rotationLoaded = false;
    let rotationBusy = false;

    const readLocalPromoSettings = () => {
      try {
        const raw = localStorage.getItem("ruqo-home-promo-settings-v1");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && [3, 5, 7, 10, 15].includes(Number(parsed.interval_seconds)) && ["fade", "slide"].includes(parsed.transition_style)) {
          return {
            interval_seconds: Number(parsed.interval_seconds),
            transition_style: parsed.transition_style,
          };
        }
      } catch (_) {}
      return null;
    };

    const setRotationMessage = (text, success = false) => {
      rotationFeedback.textContent = text;
      rotationFeedback.hidden = !text;
      rotationFeedback.classList.toggle("is-success", success);
    };

    const setRotationBusy = (value) => {
      rotationBusy = value;
      rotationForm.querySelectorAll("input, select, button").forEach((control) => {
        control.disabled = rotationBusy || !rotationLoaded;
      });
    };

    const loadRotationSettings = async () => {
      if (rotationBusy) return;
      setRotationBusy(true);
      setRotationMessage("");
      try {
        const { data, error } = await client
          .from("homepage_promo_settings")
          .select("interval_seconds, transition_style")
          .eq("id", "homepage")
          .maybeSingle();
        if (error) throw error;
        const local = readLocalPromoSettings();
        rotationForm.elements.interval_seconds.value = String(data?.interval_seconds || local?.interval_seconds || 5);
        rotationForm.elements.transition_style.value = data?.transition_style || local?.transition_style || "fade";
        rotationLoaded = true;
      } catch {
        const local = readLocalPromoSettings();
        rotationForm.elements.interval_seconds.value = String(local?.interval_seconds || 5);
        rotationForm.elements.transition_style.value = local?.transition_style || "fade";
        rotationLoaded = true;
      } finally {
        setRotationBusy(false);
      }
    };

    rotationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!rotationLoaded || rotationBusy) return;
      const intervalSeconds = Number(rotationForm.elements.interval_seconds.value);
      const transitionStyle = rotationForm.elements.transition_style.value;
      if (![3, 5, 7, 10, 15].includes(intervalSeconds) || !["fade", "slide"].includes(transitionStyle)) {
        setRotationMessage("Choose a supported rotation interval and transition.");
        return;
      }

      setRotationBusy(true);
      setRotationMessage("");
      try {
        const nextSettings = {
          interval_seconds: intervalSeconds,
          transition_style: transitionStyle,
        };
        try {
          localStorage.setItem("ruqo-home-promo-settings-v1", JSON.stringify(nextSettings));
        } catch (_) {}
        const { error } = await client.from("homepage_promo_settings").upsert({
          id: "homepage",
          ...nextSettings,
        }, { onConflict: "id" });
        if (error && !/homepage_promo_settings/i.test(error.message || "")) {
          throw error;
        }
        window.RUQO_HOME_PROMO_SETTINGS = nextSettings;
        window.dispatchEvent(new CustomEvent("ruqo:home-promo-settings-updated", {
          detail: window.RUQO_HOME_PROMO_SETTINGS,
        }));
        setRotationMessage("Offer rotation settings saved.", true);
      } catch (error) {
        setRotationMessage(error.message || "Could not save offer rotation settings.");
      } finally {
        setRotationBusy(false);
      }
    });

    // =========================================================================
    // Exclusive Deals Slide Editor + Live Preview + 1-Click 5-Lang Translation
    // =========================================================================
    const listNode = panel.querySelector("[data-ed-list]");
    const stateNode = panel.querySelector("[data-ed-state]");
    const liveNode = panel.querySelector("[data-ed-live]");
    const feedbackNode = panel.querySelector("[data-ed-feedback]");
    const previewWrap = panel.querySelector("[data-ed-preview]");
    const previewBanner = panel.querySelector("[data-ed-preview-banner]");
    const previewEyebrow = panel.querySelector("[data-ed-preview-eyebrow]");
    const previewTitle = panel.querySelector("[data-ed-preview-title]");
    const previewText = panel.querySelector("[data-ed-preview-text]");
    const previewButton = panel.querySelector("[data-ed-preview-button]");
    const previewImg = panel.querySelector("[data-ed-preview-img]");
    const addSlideBtn = panel.querySelector("[data-ed-add-slide]");
    const reloadBtn = panel.querySelector("[data-ed-reload]");
    const saveBtn = editorForm.querySelector('[data-ed-action="save"]');
    const deleteBtn = editorForm.querySelector('[data-ed-action="delete"]');
    const translateBtn = editorForm.querySelector('[data-ed-action="translate"]');

    let slides = [];
    let selectedIndex = 0;
    let language = "en";
    let loaded = false;
    let busy = false;
    let dirty = false;

    const currentSlide = () => slides[selectedIndex] || null;

    const setMessage = (text, success = false) => {
      feedbackNode.textContent = text;
      feedbackNode.hidden = !text;
      feedbackNode.classList.toggle("is-success", success);
    };

    const resolvePublicUrl = (imagePath) => {
      if (!imagePath) return DEFAULT_IMAGE;
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("/")) {
        return imagePath;
      }
      return client.storage.from("banner-images").getPublicUrl(imagePath).data.publicUrl || DEFAULT_IMAGE;
    };

    const readField = (slide, field, lang = language) => {
      if (!slide) return "";
      const map = slide[`${field}_translations`] || {};
      return String(map[lang] ?? map.en ?? "");
    };

    const writeField = (slide, field, value, lang = language) => {
      if (!slide) return;
      const key = `${field}_translations`;
      slide[key] = slide[key] && typeof slide[key] === "object" ? slide[key] : {};
      slide[key][lang] = value;
    };

    const updatePreview = () => {
      const slide = currentSlide();
      previewWrap.dir = language === "ar" ? "rtl" : "ltr";
      if (!slide) return;

      const bgColor = /^#[0-9a-f]{6}$/i.test(slide.background_color || "")
        ? slide.background_color
        : "#6931a9";
      if (bgColor.toLowerCase() === "#6931a9") {
        previewBanner.style.removeProperty("--ed-bg");
      } else {
        previewBanner.style.setProperty(
          "--ed-bg",
          `linear-gradient(120deg, color-mix(in srgb, ${bgColor} 65%, #120924) 0%, ${bgColor} 52%, color-mix(in srgb, ${bgColor} 60%, #d5459b) 100%)`,
        );
      }

      const eyebrow = readField(slide, "eyebrow", language).trim();
      const title = readField(slide, "title", language).trim();
      const description = readField(slide, "description", language).trim();
      const button = readField(slide, "button", language).trim();

      previewEyebrow.textContent = eyebrow || "Exclusive deals";
      previewEyebrow.hidden = !eyebrow && Boolean(title);
      previewTitle.textContent = title || "Up to 35% off gaming devices";
      previewText.textContent = description || "";
      previewText.hidden = !description;
      previewButton.textContent = button || "Claim offer";
      previewButton.hidden = !button;

      const imgSrc = slide._objectUrl || slide.image_url || resolvePublicUrl(slide.image_path);
      previewImg.src = imgSrc || DEFAULT_IMAGE;
    };

    const renderList = () => {
      listNode.replaceChildren();
      slides.forEach((slide, idx) => {
        const li = document.createElement("li");
        li.classList.toggle("is-selected", idx === selectedIndex);

        const thumb = document.createElement("img");
        thumb.className = "hr-slide-thumb";
        thumb.src = slide._objectUrl || slide.image_url || resolvePublicUrl(slide.image_path);
        thumb.alt = "";

        const meta = document.createElement("div");
        meta.className = "hr-slide-meta";
        const strong = document.createElement("strong");
        const titleEn = String(slide.title_translations?.en || "").trim() || "Untitled exclusive deal";
        strong.textContent = `${String(idx + 1).padStart(2, "0")}. ${titleEn}`;

        const small = document.createElement("small");
        const now = Date.now();
        const starts = slide.starts_at ? Date.parse(slide.starts_at) : null;
        const ends = slide.ends_at ? Date.parse(slide.ends_at) : null;
        const statusLabel = slide.is_active === false
          ? "Paused"
          : ends && ends <= now
            ? "Expired"
            : starts && starts > now
              ? "Scheduled"
              : slide._isNew
                ? "Unsaved draft"
                : "Active";
        const scheduleInfo = slide.starts_at || slide.ends_at
          ? ` · ${toLocalDateTime(slide.starts_at) || "Now"} → ${toLocalDateTime(slide.ends_at) || "No end"}`
          : " · Always on";
        small.textContent = `${statusLabel}${scheduleInfo}`;
        meta.append(strong, small);

        const selectBtn = document.createElement("button");
        selectBtn.type = "button";
        selectBtn.className = "admin-text-button";
        selectBtn.textContent = idx === selectedIndex ? "Editing" : "Edit";
        selectBtn.disabled = idx === selectedIndex || busy;
        selectBtn.addEventListener("click", () => {
          selectedIndex = idx;
          render();
        });

        li.append(thumb, meta, selectBtn);
        listNode.append(li);
      });
    };

    const render = () => {
      const slide = currentSlide();
      editorForm.querySelectorAll("input, textarea, select, button").forEach((el) => {
        el.disabled = busy || !loaded;
      });
      addSlideBtn.disabled = busy || !loaded || slides.length >= 12;
      reloadBtn.disabled = busy;

      if (slide) {
        editorForm.elements.is_active.checked = slide.is_active !== false;
        editorForm.elements.image_url.value = slide.image_path?.startsWith("http")
          ? slide.image_path
          : slide.image_url?.startsWith("http") && !slide.image_path?.startsWith("banners/")
            ? slide.image_url
            : "";
        editorForm.elements.destination_url.value = slide.destination_url || "";
        editorForm.elements.quick_target.value = [...editorForm.elements.quick_target.options].some(
          (opt) => opt.value === slide.destination_url,
        )
          ? slide.destination_url
          : "";
        editorForm.elements.starts_at.value = toLocalDateTime(slide.starts_at);
        editorForm.elements.ends_at.value = toLocalDateTime(slide.ends_at);
        editorForm.elements.background_color.value = /^#[0-9a-f]{6}$/i.test(slide.background_color || "")
          ? slide.background_color
          : "#6931a9";
        editorForm.elements.language.value = language;

        for (const field of FIELDS) {
          editorForm.elements[field].value = readField(slide, field, language);
        }
      }

      panel.querySelector("[data-ed-fields]").dir = language === "ar" ? "rtl" : "ltr";
      const activeSaved = slides.filter((s) => !s._isNew && s.is_active !== false).length;
      liveNode.textContent = activeSaved
        ? `Live on homepage: ${activeSaved} active Exclusive deal slide(s).`
        : "Live on homepage: Built-in default Exclusive deals banner (save an active deal below to customize).";
      stateNode.textContent = busy
        ? "Working…"
        : `${slides.length} deal slide(s) · Editing #${selectedIndex + 1} (${language.toUpperCase()})${dirty ? " · Unsaved changes" : ""}`;

      renderList();
      updatePreview();
    };

    const loadDeals = async () => {
      if (busy) return;
      busy = true;
      setMessage("");
      render();
      try {
        let { data, error } = await client
          .from("banners")
          .select("id, name, placement, eyebrow_translations, title_translations, description_translations, button_translations, image_path, destination_url, starts_at, ends_at, is_active, sort_order, background_color")
          .eq("placement", "home_promo")
          .order("sort_order")
          .order("created_at", { ascending: false });
        if (error) {
          const fallback = await client
            .from("banners")
            .select("id, name, placement, title_translations, description_translations, button_translations, image_path, destination_url, starts_at, ends_at, is_active, sort_order")
            .eq("placement", "home_promo")
            .order("sort_order")
            .order("created_at", { ascending: false });
          if (fallback.error) throw fallback.error;
          data = fallback.data || [];
        }
        const incoming = (data || []).map((row) => ({
          ...row,
          eyebrow_translations: row.eyebrow_translations || { en: "Exclusive deals" },
          title_translations: row.title_translations || {},
          description_translations: row.description_translations || {},
          button_translations: row.button_translations || { en: "Claim offer" },
          background_color: row.background_color || "#6931a9",
          image_url: resolvePublicUrl(row.image_path),
          _isNew: false,
        }));
        slides = incoming.length ? incoming : [makeDealSlide()];
        selectedIndex = Math.min(selectedIndex, Math.max(0, slides.length - 1));
        dirty = false;
        loaded = true;
      } catch (error) {
        slides = [makeDealSlide()];
        selectedIndex = 0;
        loaded = true;
        setMessage(error.message || "Loaded default Exclusive deal template.");
      } finally {
        busy = false;
        render();
      }
    };

    document.querySelector('[data-admin-view="exclusive-deals"]')?.addEventListener("click", () => {
      if (!rotationLoaded) loadRotationSettings();
      if (!loaded) loadDeals();
    });

    reloadBtn.addEventListener("click", () => {
      if (!busy) {
        loadRotationSettings();
        loadDeals();
      }
    });

    addSlideBtn.addEventListener("click", () => {
      if (busy || !loaded || slides.length >= 12) return;
      const nextOrder = slides.reduce((max, s) => Math.max(max, Number(s.sort_order) || 0), -1) + 1;
      slides.push(makeDealSlide({ sort_order: nextOrder }));
      selectedIndex = slides.length - 1;
      dirty = true;
      setMessage("New deal slide added. Customize it and click Save & publish deal.", true);
      render();
    });

    editorForm.elements.language.addEventListener("change", () => {
      language = editorForm.elements.language.value;
      render();
    });

    editorForm.elements.is_active.addEventListener("change", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.is_active = editorForm.elements.is_active.checked;
      dirty = true;
      render();
    });

    editorForm.elements.image_file.addEventListener("change", () => {
      const slide = currentSlide();
      const file = editorForm.elements.image_file.files?.[0];
      if (!slide || !file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
        editorForm.elements.image_file.value = "";
        setMessage("Choose a JPEG, PNG, or WebP image up to 10 MB.");
        return;
      }
      if (slide._objectUrl) URL.revokeObjectURL(slide._objectUrl);
      slide._file = file;
      slide._objectUrl = URL.createObjectURL(file);
      dirty = true;
      setMessage("");
      render();
    });

    editorForm.elements.image_url.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      const url = editorForm.elements.image_url.value.trim();
      slide.image_url = url || DEFAULT_IMAGE;
      if (url) slide.image_path = url;
      dirty = true;
      updatePreview();
      renderList();
    });

    editorForm.elements.quick_target.addEventListener("change", () => {
      const slide = currentSlide();
      if (!slide || !editorForm.elements.quick_target.value) return;
      slide.destination_url = editorForm.elements.quick_target.value;
      editorForm.elements.destination_url.value = slide.destination_url;
      dirty = true;
    });

    editorForm.elements.destination_url.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.destination_url = editorForm.elements.destination_url.value.trim();
      dirty = true;
    });

    editorForm.elements.starts_at.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.starts_at = fromLocalDateTime(editorForm.elements.starts_at.value);
      dirty = true;
      renderList();
    });

    editorForm.elements.ends_at.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.ends_at = fromLocalDateTime(editorForm.elements.ends_at.value);
      dirty = true;
      renderList();
    });

    editorForm.elements.background_color.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.background_color = editorForm.elements.background_color.value;
      dirty = true;
      updatePreview();
    });

    for (const field of FIELDS) {
      editorForm.elements[field].addEventListener("input", () => {
        const slide = currentSlide();
        if (!slide) return;
        writeField(slide, field, editorForm.elements[field].value, language);
        dirty = true;
        updatePreview();
        if (field === "title" && language === "en") renderList();
      });
    }

    // One-Click Translate to all 5 languages (EN -> AR, FR, ES, ZH)
    translateBtn.addEventListener("click", async () => {
      const slide = currentSlide();
      if (!slide || busy) return;
      const source = {
        badge: String(slide.eyebrow_translations?.en || "").trim(),
        title: String(slide.title_translations?.en || "").trim(),
        text: String(slide.description_translations?.en || "").trim(),
        eyebrow: String(slide.button_translations?.en || "").trim(),
      };
      if (!source.title && !source.text && !source.badge && !source.eyebrow) {
        setMessage("Enter English text first before generating translations.");
        return;
      }
      busy = true;
      setMessage("Generating translations for all 5 languages (EN, AR, FR, ES, ZH)…");
      render();
      try {
        const { data, error } = await client.functions.invoke("translate-high-refresh", {
          body: { source, translations: {} },
        });
        if (error) throw error;
        if (!data?.translations) throw new Error("Translation service returned an empty response.");
        for (const lang of TARGET_LANGUAGES) {
          const t = data.translations[lang] || {};
          if (source.badge) writeField(slide, "eyebrow", t.badge || source.badge, lang);
          if (source.title) writeField(slide, "title", t.title || source.title, lang);
          if (source.text) writeField(slide, "description", t.text || source.text, lang);
          if (source.eyebrow) writeField(slide, "button", t.eyebrow || source.eyebrow, lang);
        }
        dirty = true;
        setMessage("Translated into all 5 languages (EN / AR / FR / ES / ZH). Switch language to preview or click Save & publish deal.", true);
      } catch (error) {
        setMessage(error.message || "Could not auto-translate via cloud function; you can still edit each language manually.");
      } finally {
        busy = false;
        render();
      }
    });

    // Save & Publish Deal to Supabase `banners` table
    saveBtn.addEventListener("click", async () => {
      const slide = currentSlide();
      if (!slide || busy) return;
      const titleEn = String(slide.title_translations?.en || "").trim();
      if (!titleEn) {
        language = "en";
        setMessage("Enter an English deal headline before saving.");
        render();
        return;
      }
      if (slide.starts_at && slide.ends_at && new Date(slide.ends_at) <= new Date(slide.starts_at)) {
        setMessage("The end date must be later than the start date.");
        return;
      }

      busy = true;
      setMessage("Saving & publishing exclusive deal…");
      render();
      let uploadedPath = null;
      try {
        let imagePath = slide.image_path || slide.image_url || DEFAULT_IMAGE;
        if (slide._file instanceof File && slide._file.size > 0) {
          const safeName = slide._file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
          uploadedPath = `banners/${slide.id}/${Date.now()}-${safeName}`;
          const { error: uploadError } = await client.storage
            .from("banner-images")
            .upload(uploadedPath, slide._file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;
          imagePath = uploadedPath;
          delete slide._file;
        }

        for (const field of FIELDS) {
          const map = slide[`${field}_translations`] || {};
          const fallbackEn = String(map.en || "").trim();
          for (const lang of LANGUAGES) {
            map[lang] = String(map[lang] || fallbackEn).trim();
          }
          slide[`${field}_translations`] = map;
        }

        const payload = {
          id: slide.id,
          name: titleEn.slice(0, 80),
          placement: "home_promo",
          eyebrow_translations: slide.eyebrow_translations,
          title_translations: slide.title_translations,
          description_translations: slide.description_translations,
          button_translations: slide.button_translations,
          image_path: imagePath,
          background_color: slide.background_color || "#6931a9",
          sort_order: Number(slide.sort_order) || selectedIndex,
          destination_url: String(slide.destination_url || "").trim() || "/products.html?filter=deals",
          starts_at: slide.starts_at || null,
          ends_at: slide.ends_at || null,
          is_active: slide.is_active !== false,
        };

        let { error } = await client.from("banners").upsert(payload, { onConflict: "id" });
        if (error && /eyebrow_translations|background_color/i.test(error.message || "")) {
          const { eyebrow_translations, background_color, ...legacyPayload } = payload;
          const retry = await client.from("banners").upsert(legacyPayload, { onConflict: "id" });
          error = retry.error;
        }
        if (error) throw error;

        slide.image_path = imagePath;
        slide.image_url = resolvePublicUrl(imagePath);
        slide._isNew = false;
        dirty = false;
        setMessage("Exclusive deal saved and published to the homepage.", true);
      } catch (error) {
        if (uploadedPath) await client.storage.from("banner-images").remove([uploadedPath]);
        setMessage(error.message || "Could not save this exclusive deal.");
      } finally {
        busy = false;
        render();
      }
    });

    // Delete Deal
    deleteBtn.addEventListener("click", async () => {
      const slide = currentSlide();
      if (!slide || busy) return;
      if (!window.confirm("Delete this Exclusive deal slide?")) return;

      busy = true;
      setMessage("");
      render();
      try {
        if (!slide._isNew) {
          const { error } = await client.from("banners").delete().eq("id", slide.id);
          if (error) throw error;
          if (slide.image_path?.startsWith("banners/")) {
            await client.storage.from("banner-images").remove([slide.image_path]);
          }
        }
        if (slide._objectUrl) URL.revokeObjectURL(slide._objectUrl);
        slides.splice(selectedIndex, 1);
        if (!slides.length) slides = [makeDealSlide()];
        selectedIndex = Math.max(0, Math.min(selectedIndex, slides.length - 1));
        dirty = false;
        setMessage("Exclusive deal deleted.", true);
      } catch (error) {
        setMessage(error.message || "Could not delete this deal.");
      } finally {
        busy = false;
        render();
      }
    });

    render();
  };
})();
