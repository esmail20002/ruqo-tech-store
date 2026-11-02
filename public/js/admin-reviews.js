(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const TARGET_LANGUAGES = ["ar", "fr", "es", "zh"];
  const SECTION_KEY = "reviews";
  const STORAGE_BUCKET = "banner-images";
  const MAX_REVIEWS = 12;

  const DEFAULT_DATA = () => ({
    visible: true,
    eyebrow_translations: {
      en: "Customer reviews",
      ar: "آراء العملاء",
      fr: "Avis clients",
      es: "Opiniones de clientes",
      zh: "客户评价",
    },
    title_translations: {
      en: "What our customers say",
      ar: "ماذا يقول عملاؤنا",
      fr: "Ce que disent nos clients",
      es: "Lo que dicen nuestros clientes",
      zh: "客户怎么说",
    },
    reviews: [
      {
        id: "review-one",
        name: "علي النجار",
        rating: 5,
        is_active: true,
        quote_translations: {
          en: "Excellent service and fast delivery. The device arrived before the scheduled date and in perfect condition.",
          ar: "خدمة مميزة وسريعة، والتوصيل كان قبل الموعد المحدد، كما أن الجهاز وصل بحالة ممتازة.",
          fr: "Service excellent et livraison rapide. L’appareil est arrivé en parfait état avant la date prévue.",
          es: "Servicio excelente y entrega rápida. El dispositivo llegó en perfecto estado antes de la fecha prevista.",
          zh: "服务出色，配送迅速。设备提前送达，状态完好。",
        },
        role_translations: {
          en: "Graphic designer",
          ar: "مصمم جرافيك",
          fr: "Graphiste",
          es: "Diseñador gráfico",
          zh: "平面设计师",
        },
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        avatar_path: "",
      },
      {
        id: "review-two",
        name: "سارة الحربي",
        rating: 5,
        is_active: true,
        quote_translations: {
          en: "The experience was professional from the first visit to the last delivery. I highly recommend it.",
          ar: "التجربة كانت احترافية من أول زيارة إلى موقع المتجر حتى استلام الطلب. أنصح به بشدة.",
          fr: "Une expérience professionnelle, de la première visite à la livraison. Je recommande vivement.",
          es: "Una experiencia profesional desde la primera visita hasta la entrega. Lo recomiendo totalmente.",
          zh: "从首次浏览到收货，整个体验都很专业，强烈推荐。",
        },
        role_translations: {
          en: "Project manager",
          ar: "مديرة مشاريع",
          fr: "Cheffe de projet",
          es: "Jefa de proyectos",
          zh: "项目经理",
        },
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        avatar_path: "",
      },
      {
        id: "review-three",
        name: "محمد الزهراني",
        rating: 5,
        is_active: true,
        quote_translations: {
          en: "The range is incredibly diverse, and the selection matched our work and comfort needs perfectly.",
          ar: "الأدوات المتاحة متنوعة جدًا، والاختيارات كانت دقيقة جدًا مع احتياجاتنا في العمل والراحة.",
          fr: "Le choix est très varié et répond parfaitement à nos besoins professionnels et quotidiens.",
          es: "La variedad es increíble y la selección se adapta perfectamente a nuestras necesidades.",
          zh: "商品种类丰富，选择非常符合我们的工作与日常需求。",
        },
        role_translations: {
          en: "Digital marketer",
          ar: "مسوق رقمي",
          fr: "Responsable marketing digital",
          es: "Especialista en marketing digital",
          zh: "数字营销专员",
        },
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        avatar_path: "",
      },
    ],
  });

  window.RUQO_INIT_REVIEWS_EDITOR = (client) => {
    const panel = document.querySelector('[data-admin-panel="reviews"]');
    const form = document.querySelector("#reviews-section-form");
    if (!panel || !form || !form.elements.language || !form.elements.visible) return;

    const listNode = panel.querySelector("[data-rv-list]");
    const addButton = panel.querySelector("[data-rv-add]");
    const reloadButton = panel.querySelector("[data-rv-reload]");
    const liveNode = panel.querySelector("[data-rv-live]");
    const stateNode = panel.querySelector("[data-rv-state]");
    const feedbackNode = panel.querySelector("[data-rv-feedback]");
    const headingFields = panel.querySelector("[data-rv-heading-fields]");
    const itemFields = panel.querySelector("[data-rv-item-fields]");
    const itemTitle = panel.querySelector("[data-rv-item-title]");
    const preview = panel.querySelector("[data-rv-preview]");
    const previewEyebrow = panel.querySelector("[data-rv-preview-eyebrow]");
    const previewTitle = panel.querySelector("[data-rv-preview-title]");
    const previewGrid = panel.querySelector("[data-rv-preview-grid]");
    const saveButton = panel.querySelector('[data-rv-action="save"]');
    const resetButton = panel.querySelector('[data-rv-action="reset"]');
    const moveUpButton = panel.querySelector('[data-rv-action="move-up"]');
    const moveDownButton = panel.querySelector('[data-rv-action="move-down"]');
    const deleteButton = panel.querySelector('[data-rv-action="delete"]');
    const translateButton = panel.querySelector('[data-rv-action="translate"]');
    if (!listNode || !previewGrid || !saveButton) return;

    let data = null;
    let persistedData = null;
    let language = "en";
    let selectedIndex = 0;
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
        const raw = localStorage.getItem("ruqo-home-reviews-v1");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length ? parsed : null;
      } catch (_) {}
      return null;
    };

    const asMap = (value) => {
      const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      return Object.fromEntries(LANGUAGES.map((lang) => [lang, String(source[lang] ?? "")]));
    };

    const safeImageUrl = (value) => {
      const url = String(value || "").trim();
      if (!url || url.startsWith("//")) return "";
      if (url.startsWith("/") && !url.startsWith("/\\")) return url;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : "";
      } catch {
        return "";
      }
    };

    const publicImageUrl = (review) => {
      const direct = safeImageUrl(review?.avatar_url);
      if (direct) return direct;
      const path = String(review?.avatar_path || "").trim();
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return safeImageUrl(path);
      return client.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl || "";
    };

    const normalize = (raw) => {
      const defaults = DEFAULT_DATA();
      const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
      const hasReviews = Array.isArray(source.reviews);
      const reviews = (hasReviews ? source.reviews : defaults.reviews)
        .slice(0, MAX_REVIEWS)
        .map((review, index) => ({
          id: typeof review?.id === "string" && review.id ? review.id : crypto.randomUUID(),
          name: String(review?.name ?? "").slice(0, 100),
          rating: Math.min(5, Math.max(1, Math.round(Number(review?.rating) || 5))),
          is_active: review?.is_active !== false,
          quote_translations: asMap(review?.quote_translations),
          role_translations: asMap(review?.role_translations),
          avatar_path: String(review?.avatar_path || ""),
          avatar_url: publicImageUrl(review) || (!hasReviews ? defaults.reviews[index]?.avatar_url : "") || "",
        }));
      return {
        visible: source.visible !== false,
        eyebrow_translations: asMap(source.eyebrow_translations ?? defaults.eyebrow_translations),
        title_translations: asMap(source.title_translations ?? defaults.title_translations),
        reviews,
      };
    };

    const currentReview = () => data?.reviews[selectedIndex] || null;
    const textFor = (map) => String(map?.[language] || map?.en || "").trim();

    const renderList = () => {
      listNode.replaceChildren();
      data.reviews.forEach((review, index) => {
        const row = document.createElement("li");
        row.classList.toggle("is-selected", index === selectedIndex);
        row.classList.toggle("is-paused", review.is_active === false);

        const avatar = document.createElement("img");
        avatar.className = "rv-list-avatar";
        const avatarUrl = review._objectUrl || publicImageUrl(review);
        if (avatarUrl) avatar.src = avatarUrl;
        avatar.alt = "";
        avatar.hidden = !avatarUrl;

        const meta = document.createElement("div");
        meta.className = "hr-slide-meta";
        const name = document.createElement("strong");
        name.textContent = review.name || `Customer review ${String(index + 1).padStart(2, "0")}`;
        const detail = document.createElement("small");
        detail.textContent = `${"★".repeat(review.rating)}${review.is_active === false ? " · Paused" : ""} · ${textFor(review.quote_translations) || "No review text yet"}`;
        meta.append(name, detail);

        const controls = document.createElement("div");
        controls.className = "fs-list-controls";
        const moveUp = document.createElement("button");
        moveUp.type = "button";
        moveUp.className = "admin-text-button";
        moveUp.textContent = "↑";
        moveUp.title = "Move up";
        moveUp.disabled = busy || index === 0;
        moveUp.addEventListener("click", () => moveReview(index, -1));

        const moveDown = document.createElement("button");
        moveDown.type = "button";
        moveDown.className = "admin-text-button";
        moveDown.textContent = "↓";
        moveDown.title = "Move down";
        moveDown.disabled = busy || index === data.reviews.length - 1;
        moveDown.addEventListener("click", () => moveReview(index, 1));

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "admin-text-button";
        edit.textContent = index === selectedIndex ? "Editing" : "Edit";
        edit.disabled = busy || index === selectedIndex;
        edit.addEventListener("click", () => {
          selectedIndex = index;
          render();
        });

        controls.append(moveUp, moveDown, edit);
        row.append(avatar, meta, controls);
        listNode.append(row);
      });
    };

    const renderPreview = () => {
      preview.dir = language === "ar" ? "rtl" : "ltr";
      preview.classList.toggle("is-hidden-section", data.visible === false);
      previewEyebrow.textContent = textFor(data.eyebrow_translations);
      previewEyebrow.hidden = !previewEyebrow.textContent;
      previewTitle.textContent = textFor(data.title_translations) || "What our customers say";
      previewTitle.classList.toggle("rv-preview-placeholder", !textFor(data.title_translations));
      const activeReviews = data.reviews.filter((review) => review.is_active !== false);
      previewGrid.replaceChildren(...activeReviews.map((review) => {
        const card = document.createElement("article");
        card.className = "rv-preview-card";
        const stars = document.createElement("div");
        stars.className = "rv-preview-stars";
        stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
        const quote = document.createElement("p");
        quote.textContent = textFor(review.quote_translations) || "Customer review";
        const author = document.createElement("div");
        author.className = "rv-preview-author";
        const avatarUrl = review._objectUrl || publicImageUrl(review);
        if (avatarUrl) {
          const avatar = document.createElement("img");
          avatar.src = avatarUrl;
          avatar.alt = "";
          author.append(avatar);
        }
        const identity = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = review.name || "Customer name";
        const role = document.createElement("span");
        role.textContent = textFor(review.role_translations) || "Customer role";
        identity.append(name, role);
        author.append(identity);
        card.append(stars, quote, author);
        return card;
      }));
    };

    const render = () => {
      if (!data) return;
      selectedIndex = Math.max(0, Math.min(selectedIndex, Math.max(0, data.reviews.length - 1)));
      form.querySelectorAll("input, textarea, select, button").forEach((control) => {
        control.disabled = busy || !loaded;
      });
      reloadButton.disabled = busy;
      addButton.disabled = busy || !loaded || data.reviews.length >= MAX_REVIEWS;
      form.elements.visible.checked = data.visible !== false;
      form.elements.language.value = language;
      form.elements.eyebrow.value = data.eyebrow_translations[language] || "";
      form.elements.title.value = data.title_translations[language] || "";
      headingFields.dir = language === "ar" ? "rtl" : "ltr";

      const review = currentReview();
      itemFields.hidden = !review;
      itemFields.dir = language === "ar" ? "rtl" : "ltr";
      itemTitle.textContent = review
        ? `Customer review ${String(selectedIndex + 1).padStart(2, "0")}`
        : "No review selected — add one from the list";
      if (review) {
        form.elements.name.value = review.name;
        form.elements.rating.value = String(review.rating);
        form.elements.is_active.checked = review.is_active !== false;
        form.elements.quote.value = review.quote_translations[language] || "";
        form.elements.role.value = review.role_translations[language] || "";
        form.elements.avatar_url.value = review.avatar_url || "";
        const avatarPreview = panel.querySelector("[data-rv-avatar-preview]");
        const avatarUrl = review._objectUrl || publicImageUrl(review);
        avatarPreview.src = avatarUrl;
        avatarPreview.hidden = !avatarUrl;
      }
      moveUpButton.disabled = busy || !loaded || !review || selectedIndex === 0;
      moveDownButton.disabled = busy || !loaded || !review || selectedIndex >= data.reviews.length - 1;
      deleteButton.disabled = busy || !loaded || !review;
      renderList();
      renderPreview();

      liveNode.textContent = usingDefaults
        ? "Live on homepage: built-in customer reviews (save below to customize)."
        : `Live on homepage: customized section · ${data.reviews.length} review(s)${data.visible === false ? " · currently hidden" : ""}.`;
      stateNode.textContent = busy
        ? "Working…"
        : `${data.reviews.length} / ${MAX_REVIEWS} reviews · Editing #${selectedIndex + 1} (${language.toUpperCase()})${dirty ? " · Unsaved changes" : ""}`;
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
        const source = remote || readLocal();
        data = normalize(source || undefined);
        persistedData = normalize(source || undefined);
        usingDefaults = !source;
        loaded = true;
        dirty = false;
      } catch (error) {
        const local = readLocal();
        data = normalize(local || undefined);
        persistedData = normalize(local || undefined);
        usingDefaults = !local;
        loaded = true;
        dirty = false;
        setMessage(local
          ? "Loaded locally saved reviews (the database table is unavailable)."
          : "Loaded built-in reviews. Apply the homepage_sections migration to publish changes for all visitors.");
      } finally {
        busy = false;
        render();
      }
    };

    const sanitize = () => ({
      visible: data.visible !== false,
      eyebrow_translations: asMap(data.eyebrow_translations),
      title_translations: asMap(data.title_translations),
      reviews: data.reviews.map((review) => ({
        id: review.id,
        name: String(review.name || "").trim().slice(0, 100),
        rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
        is_active: review.is_active !== false,
        quote_translations: asMap(review.quote_translations),
        role_translations: asMap(review.role_translations),
        avatar_path: String(review.avatar_path || ""),
        avatar_url: safeImageUrl(review.avatar_url),
      })),
    });

    const publishLocal = (payload) => {
      try {
        localStorage.setItem("ruqo-home-reviews-v1", JSON.stringify(payload));
        localStorage.setItem("ruqo-home-reviews-cache-v1", JSON.stringify(payload));
      } catch (error) {
        throw new Error(`Could not save reviews in this browser: ${error.message}`);
      }
      window.RUQO_HOME_REVIEWS = payload;
      window.dispatchEvent(new CustomEvent("ruqo:home-reviews-updated", { detail: payload }));
    };

    const moveReview = (from, delta) => {
      if (busy) return;
      const to = from + delta;
      if (to < 0 || to >= data.reviews.length) return;
      [data.reviews[from], data.reviews[to]] = [data.reviews[to], data.reviews[from]];
      selectedIndex = to;
      dirty = true;
      render();
    };

    const updateCurrent = (change) => {
      const review = currentReview();
      if (!review) return;
      change(review);
      dirty = true;
      renderList();
      renderPreview();
    };

    document.querySelector('[data-admin-view="reviews"]')?.addEventListener("click", () => {
      if (!loaded) loadSection();
    });
    reloadButton.addEventListener("click", () => {
      if (!busy) loadSection();
    });
    addButton.addEventListener("click", () => {
      if (busy || !loaded || data.reviews.length >= MAX_REVIEWS) return;
      data.reviews.push({
        id: crypto.randomUUID(),
        name: "",
        rating: 5,
        is_active: true,
        quote_translations: asMap(),
        role_translations: asMap(),
        avatar_path: "",
        avatar_url: "",
      });
      selectedIndex = data.reviews.length - 1;
      dirty = true;
      setMessage("New review added. Enter the English review and customer name, then save.", true);
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
    form.elements.eyebrow.addEventListener("input", () => {
      data.eyebrow_translations[language] = form.elements.eyebrow.value;
      dirty = true;
      renderPreview();
    });
    form.elements.title.addEventListener("input", () => {
      data.title_translations[language] = form.elements.title.value;
      dirty = true;
      renderPreview();
    });
    form.elements.name.addEventListener("input", () => {
      updateCurrent((review) => { review.name = form.elements.name.value; });
    });
    form.elements.rating.addEventListener("change", () => {
      updateCurrent((review) => { review.rating = Number(form.elements.rating.value); });
    });
    form.elements.is_active.addEventListener("change", () => {
      updateCurrent((review) => { review.is_active = form.elements.is_active.checked; });
    });
    form.elements.quote.addEventListener("input", () => {
      updateCurrent((review) => { review.quote_translations[language] = form.elements.quote.value; });
    });
    form.elements.role.addEventListener("input", () => {
      updateCurrent((review) => { review.role_translations[language] = form.elements.role.value; });
    });
    form.elements.avatar_url.addEventListener("input", () => {
      const review = currentReview();
      if (!review) return;
      review.avatar_url = form.elements.avatar_url.value.trim();
      review.avatar_path = "";
      if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
      delete review._objectUrl;
      delete review._file;
      dirty = true;
      const avatarPreview = panel.querySelector("[data-rv-avatar-preview]");
      const avatarUrl = safeImageUrl(review.avatar_url);
      if (avatarUrl) avatarPreview.src = avatarUrl;
      else avatarPreview.removeAttribute("src");
      avatarPreview.hidden = !avatarUrl;
      renderList();
      renderPreview();
    });
    form.elements.avatar_file.addEventListener("change", () => {
      const review = currentReview();
      const file = form.elements.avatar_file.files?.[0];
      if (!review || !file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
        form.elements.avatar_file.value = "";
        setMessage("Choose a JPEG, PNG, or WebP image up to 10 MB.");
        return;
      }
      if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
      review._file = file;
      review._objectUrl = URL.createObjectURL(file);
      review.avatar_url = "";
      review.avatar_path = "";
      dirty = true;
      setMessage("");
      render();
    });
    panel.querySelector("[data-rv-avatar-clear]").addEventListener("click", () => {
      const review = currentReview();
      if (!review) return;
      if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
      delete review._objectUrl;
      delete review._file;
      review.avatar_url = "";
      review.avatar_path = "";
      form.elements.avatar_url.value = "";
      form.elements.avatar_file.value = "";
      dirty = true;
      render();
    });
    moveUpButton.addEventListener("click", () => moveReview(selectedIndex, -1));
    moveDownButton.addEventListener("click", () => moveReview(selectedIndex, 1));
    deleteButton.addEventListener("click", () => {
      const review = currentReview();
      if (!review || busy || !window.confirm("Delete this customer review? Save the section to publish the change.")) return;
      if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
      data.reviews.splice(selectedIndex, 1);
      selectedIndex = Math.max(0, Math.min(selectedIndex, data.reviews.length - 1));
      dirty = true;
      setMessage("Review removed. Save & publish to apply the change.", true);
      render();
    });

    saveButton.addEventListener("click", async () => {
      if (!data || busy || !loaded) return;
      const invalid = data.reviews.find((review) =>
        review.is_active !== false && (!String(review.name || "").trim() || !String(review.quote_translations.en || "").trim()));
      if (invalid) {
        selectedIndex = data.reviews.indexOf(invalid);
        language = "en";
        setMessage("Each active review needs a customer name and English review text.");
        render();
        return;
      }
      const invalidImage = data.reviews.find((review) =>
        String(review.avatar_url || "").trim() && !safeImageUrl(review.avatar_url));
      if (invalidImage) {
        selectedIndex = data.reviews.indexOf(invalidImage);
        setMessage("Customer photo must be a secure HTTPS URL or a same-site path.");
        render();
        return;
      }

      busy = true;
      setMessage("Saving and publishing customer reviews…");
      render();
      const uploadedPaths = [];
      try {
        const payload = sanitize();
        for (let index = 0; index < data.reviews.length; index += 1) {
          const review = data.reviews[index];
          if (!(review._file instanceof File)) continue;
          const safeName = review._file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
          const path = `reviews/${review.id}/${Date.now()}-${safeName}`;
          const { error: uploadError } = await client.storage
            .from(STORAGE_BUCKET)
            .upload(path, review._file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;
          uploadedPaths.push(path);
          payload.reviews[index].avatar_path = path;
          payload.reviews[index].avatar_url = client.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
        }

        const { error } = await client
          .from("homepage_sections")
          .upsert({ key: SECTION_KEY, data: payload }, { onConflict: "key" });
        if (error) {
          if (/homepage_sections|schema cache|relation|404/i.test(error.message || "")) {
            publishLocal(payload);
            data = normalize(payload);
            persistedData = normalize(payload);
            usingDefaults = false;
            dirty = false;
            for (const review of data.reviews) {
              if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
              delete review._objectUrl;
              delete review._file;
            }
            setMessage("Saved locally in this browser. Apply the homepage_sections migration to publish for all visitors.", true);
          } else {
            throw error;
          }
        } else {
          publishLocal(payload);
          const retainedPaths = new Set(payload.reviews.map((review) => review.avatar_path).filter(Boolean));
          const obsoletePaths = (persistedData?.reviews || [])
            .map((review) => review.avatar_path)
            .filter((path) => path.startsWith("reviews/") && !retainedPaths.has(path));
          let cleanupWarning = "";
          if (obsoletePaths.length) {
            const { error: cleanupError } = await client.storage.from(STORAGE_BUCKET).remove(obsoletePaths);
            if (cleanupError) cleanupWarning = ` Old profile images could not be removed: ${cleanupError.message}`;
          }
          data = normalize(payload);
          persistedData = normalize(payload);
          usingDefaults = false;
          dirty = false;
          for (const review of data.reviews) {
            if (review._objectUrl) URL.revokeObjectURL(review._objectUrl);
            delete review._objectUrl;
            delete review._file;
          }
          setMessage(`Customer reviews saved and published.${cleanupWarning}`, !cleanupWarning);
        }
      } catch (error) {
        if (uploadedPaths.length) {
          const { error: cleanupError } = await client.storage.from(STORAGE_BUCKET).remove(uploadedPaths);
          if (cleanupError) setMessage(`${error.message || "Could not save customer reviews."} Uploaded image cleanup also failed: ${cleanupError.message}`);
          else setMessage(error.message || "Could not save customer reviews.");
        } else {
          setMessage(error.message || "Could not save customer reviews.");
        }
      } finally {
        busy = false;
        render();
      }
    });

    resetButton.addEventListener("click", async () => {
      if (!data || busy || !loaded ||
          !window.confirm("Reset customer reviews to the built-in defaults? Your custom content will be removed.")) return;
      busy = true;
      setMessage("");
      render();
      try {
        const { error } = await client.from("homepage_sections").delete().eq("key", SECTION_KEY);
        if (error && !/homepage_sections|schema cache|relation|404/i.test(error.message || "")) throw error;
        const oldPaths = (persistedData?.reviews || [])
          .map((review) => review.avatar_path)
          .filter((path) => path.startsWith("reviews/"));
        localStorage.removeItem("ruqo-home-reviews-v1");
        localStorage.removeItem("ruqo-home-reviews-cache-v1");
        window.RUQO_HOME_REVIEWS = null;
        window.dispatchEvent(new CustomEvent("ruqo:home-reviews-updated", { detail: null }));
        let cleanupWarning = "";
        if (oldPaths.length && !error) {
          const { error: cleanupError } = await client.storage.from(STORAGE_BUCKET).remove(oldPaths);
          if (cleanupError) cleanupWarning = ` Profile images could not be removed: ${cleanupError.message}`;
        }
        data = DEFAULT_DATA();
        persistedData = DEFAULT_DATA();
        usingDefaults = true;
        dirty = false;
        selectedIndex = 0;
        setMessage(`Customer reviews reset to built-in defaults.${cleanupWarning}`, !cleanupWarning);
      } catch (error) {
        setMessage(error.message || "Could not reset customer reviews.");
      } finally {
        busy = false;
        render();
      }
    });

    translateButton.addEventListener("click", async () => {
      if (!data || busy || !loaded) return;
      const tasks = [];
      const eyebrowText = String(data.eyebrow_translations.en || "").trim();
      const titleText = String(data.title_translations.en || "").trim();
      if (eyebrowText || titleText) {
        tasks.push({
          label: "section heading",
          source: { badge: eyebrowText, title: titleText, text: "", eyebrow: "" },
          apply: (translations, lang) => {
            if (eyebrowText) data.eyebrow_translations[lang] = translations.badge || eyebrowText;
            if (titleText) data.title_translations[lang] = translations.title || titleText;
          },
        });
      }
      data.reviews.forEach((review, index) => {
        const quote = String(review.quote_translations.en || "").trim();
        const role = String(review.role_translations.en || "").trim();
        if (!quote && !role) return;
        tasks.push({
          label: `review ${index + 1}`,
          source: { badge: "", title: role, text: quote, eyebrow: "" },
          apply: (translations, lang) => {
            if (quote) review.quote_translations[lang] = translations.text || quote;
            if (role) review.role_translations[lang] = translations.title || role;
          },
        });
      });
      if (!tasks.length) {
        setMessage("Enter English text first before generating translations.");
        return;
      }

      busy = true;
      render();
      let completed = 0;
      const failures = [];
      for (const task of tasks) {
        setMessage(`Translating ${completed + 1} of ${tasks.length}: ${task.label}…`);
        try {
          const { data: response, error } = await client.functions.invoke("translate-high-refresh", {
            body: { source: task.source, translations: {} },
          });
          if (error) throw error;
          if (!response?.translations) throw new Error("Translation service returned an empty response.");
          for (const lang of TARGET_LANGUAGES) task.apply(response.translations[lang] || {}, lang);
        } catch (error) {
          failures.push(`${task.label}: ${error.message || "translation failed"}`);
        }
        completed += 1;
      }
      busy = false;
      dirty = true;
      setMessage(
        failures.length
          ? `Translated ${tasks.length - failures.length} of ${tasks.length}. ${failures.join(" · ")}`
          : "Translated into all 5 languages. Review the content, then save & publish.",
        !failures.length,
      );
      render();
    });

    render();
  };
})();
