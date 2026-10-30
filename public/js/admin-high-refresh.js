(() => {
  const fields = ["title", "text", "eyebrow"];
  const languages = ["ar", "fr", "es", "zh"];
  const limits = { title: 600, text: 4000, eyebrow: 200 };

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
  const makeSlide = (overrides = {}) => ({
    id: crypto.randomUUID(),
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=85",
    image_path: "",
    mobile_image_url: "",
    mobile_image_path: "",
    destination_url: "/products.html",
    starts_at: null,
    ends_at: null,
    is_active: true,
    source: { title: "", text: "", eyebrow: "", badge: "" },
    translations: {},
    ...overrides,
  });

  window.RUQO_INIT_HIGH_REFRESH_EDITOR = (client) => {
    const panel = document.querySelector('[data-admin-panel="high-refresh"]');
    if (!panel) return;
    const form = panel.querySelector("form");
    const feedback = panel.querySelector("[data-hr-feedback]");
    const languageSelect = form.elements.language;
    const slideEditor = panel.querySelector("[data-hr-slide-editor]");

    let revision = 0;
    let slides = [];
    let selectedIndex = 0;
    let language = "en";
    let dirty = false;
    let busy = false;
    let loaded = false;
    let publication = null;
    let products = [];
    let categories = [];

    const message = (text, success = false) => {
      feedback.textContent = text;
      feedback.hidden = !text;
      feedback.classList.toggle("is-success", success);
    };

    const currentSlide = () => slides[selectedIndex] || null;
    const slideCopy = (slide, lang = language) => {
      if (!slide) return { title: "", text: "", eyebrow: "", badge: "" };
      if (lang === "en") return (slide.source ||= { title: "", text: "", eyebrow: "", badge: "" });
      slide.translations ||= {};
      return (slide.translations[lang] ||= {});
    };
    const slideTranslationsComplete = (slide) => {
      const source = slide?.source || {};
      const activeFields = fields.filter((field) => {
        const val = String(source[field] || "").trim();
        if (!val) return false;
        if (field === "badge" && val.toLowerCase() === "featured") return false;
        return true;
      });
      if (!activeFields.length) return true;
      return languages.every((lang) => activeFields.every((field) =>
        typeof slide?.translations?.[lang]?.[field] === "string" &&
        Boolean(slide.translations[lang][field].trim())));
    };
    const allTranslationsComplete = () => slides.every(slideTranslationsComplete);

    function revokeSlidePreviews(slide) {
      if (slide?._desktopObjectUrl) {
        URL.revokeObjectURL(slide._desktopObjectUrl);
        delete slide._desktopObjectUrl;
      }
      if (slide?._mobileObjectUrl) {
        URL.revokeObjectURL(slide._mobileObjectUrl);
        delete slide._mobileObjectUrl;
      }
    }

    function populateQuickTargets() {
      const select = form.elements.quick_target;
      select.replaceChildren(
        new Option("Custom or choose target…", ""),
        new Option("All products (/products.html)", "/products.html"),
        new Option("All deals (/products.html?filter=deals)", "/products.html?filter=deals"),
        new Option("All categories (/categories.html)", "/categories.html"),
      );
      if (categories.length) {
        const group = document.createElement("optgroup");
        group.label = "Categories";
        categories.forEach((cat) => {
          group.append(new Option(`Category: ${cat.name_translations?.en || cat.slug}`, `/products.html?category=${cat.slug}`));
        });
        select.append(group);
      }
      if (products.length) {
        const group = document.createElement("optgroup");
        group.label = "Products";
        products.forEach((prod) => {
          group.append(new Option(`Product: ${prod.name_translations?.en || prod.slug}`, `/product.html?id=${prod.slug}`));
        });
        select.append(group);
      }
    }

    function updatePreview() {
      const slide = currentSlide();
      const previewImg = panel.querySelector("[data-hr-preview-img]");
      const overlay = panel.querySelector("[data-hr-preview-overlay]");
      const titleNode = panel.querySelector("[data-hr-preview-title]");
      const textNode = panel.querySelector("[data-hr-preview-text]");
      const buttonNode = panel.querySelector("[data-hr-preview-button]");
      const previewRoot = panel.querySelector("[data-hr-preview]");

      previewRoot.dir = language === "ar" ? "rtl" : "ltr";
      if (!slide) {
        previewImg.hidden = true;
        overlay.hidden = true;
        return;
      }
      const imgSrc = slide._desktopObjectUrl || slide.image_url || "";
      if (imgSrc) {
        previewImg.src = imgSrc;
        previewImg.hidden = false;
      } else {
        previewImg.hidden = true;
      }
      const copy = slideCopy(slide, language);
      const source = slide.source || {};
      const pick = (field) => {
        const base = String(source[field] || "").trim();
        if (!base) return "";
        return String(copy[field] || "").trim() || base;
      };
      const title = pick("title");
      const text = pick("text");
      const eyebrow = pick("eyebrow");

      overlay.hidden = !(title || text || eyebrow);
      titleNode.textContent = title;
      titleNode.hidden = !title;
      textNode.textContent = text;
      textNode.hidden = !text;
      buttonNode.textContent = eyebrow;
      buttonNode.hidden = !eyebrow;
    }

    function update() {
      const slide = currentSlide();
      const hasSlide = Boolean(slide);
      form.querySelectorAll("input,textarea,select,button").forEach((node) => {
        node.disabled = busy || !loaded || node.dataset.boundary === "true";
      });
      slideEditor.hidden = !hasSlide;
      const source = slide?.source || {};
      const hasEnglishText = fields.some((field) => String(source[field] || "").trim());
      form.querySelector('[data-hr-action="translate"]').disabled =
        busy || !loaded || !hasSlide || !hasEnglishText;
      form.querySelector('[data-hr-action="save"]').disabled = busy || !loaded;
      form.querySelector('[data-hr-action="publish"]').disabled = busy || !loaded;
      panel.querySelector("[data-hr-add-slide]").disabled = busy || !loaded || slides.length >= 12;
      panel.querySelector("[data-hr-reload]").disabled = busy;

      if (hasSlide) {
        fields.forEach((field) => {
          form.elements[field].disabled = busy || !loaded || (language !== "en" && !String(source[field] || "").trim());
        });
      }

      const activeCount = slides.filter((item) => item.is_active !== false).length;
      panel.querySelector("[data-hr-state]").textContent = busy
        ? "Working…"
        : !loaded
          ? "Open this section to load its banner slides."
          : `${dirty ? "Unsaved changes" : `Draft revision ${revision}`} · ${slides.length} slide(s) (${activeCount} active) · ${allTranslationsComplete() ? "Translations ready" : "Translations need review"}`;

      const liveSlides = Array.isArray(publication?.slides) ? publication.slides.filter((item) => item?.is_active !== false) : [];
      panel.querySelector("[data-hr-live]").textContent = liveSlides.length
        ? `Live on homepage: ${liveSlides.length} custom banner slide(s) · revision ${publication.revision}`
        : "Live on homepage: default store category banners (publish 1 or more active slides to override)";

      updatePreview();
      form.setAttribute("aria-busy", String(busy));
    }

    function renderSlidesList() {
      const list = panel.querySelector("[data-hr-products]");
      list.replaceChildren();
      slides.forEach((slide, idx) => {
        const row = document.createElement("li");
        row.classList.toggle("is-selected", idx === selectedIndex);
        const thumb = document.createElement("img");
        thumb.className = "hr-slide-thumb";
        thumb.src = slide._desktopObjectUrl || slide.image_url || "/images/new/li.png";
        thumb.alt = "";

        const meta = document.createElement("div");
        meta.className = "hr-slide-meta";
        const heading = document.createElement("strong");
        const titleText = String(slide.source?.title || "").trim() || String(slide.source?.badge || "").trim() || "Image-only banner";
        heading.textContent = `${String(idx + 1).padStart(2, "0")}. ${titleText}`;
        const status = document.createElement("small");
        const now = Date.now();
        const starts = slide.starts_at ? Date.parse(slide.starts_at) : null;
        const ends = slide.ends_at ? Date.parse(slide.ends_at) : null;
        const stateLabel = slide.is_active === false
          ? "Paused"
          : ends && ends <= now
            ? "Expired"
            : starts && starts > now
              ? "Scheduled"
              : "Active";
        status.textContent = `${stateLabel}${slide.destination_url ? ` · ${slide.destination_url}` : ""}`;
        meta.append(heading, status);

        row.append(thumb, meta);
        [
          ["select", idx === selectedIndex ? "Editing" : "Edit", idx === selectedIndex],
          ["up", "Up", idx === 0],
          ["down", "Down", idx === slides.length - 1],
          ["remove", "Remove", false],
        ].forEach(([action, label, disabled]) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = label;
          button.className = "admin-text-button";
          button.disabled = Boolean(disabled);
          button.dataset.boundary = String(disabled);
          button.addEventListener("click", () => {
            if (busy) return;
            if (action === "select") {
              selectedIndex = idx;
              render();
              return;
            }
            if (action === "remove") {
              revokeSlidePreviews(slides[idx]);
              slides.splice(idx, 1);
              selectedIndex = Math.max(0, Math.min(selectedIndex, slides.length - 1));
            } else {
              const target = idx + (action === "up" ? -1 : 1);
              if (target < 0 || target >= slides.length) return;
              [slides[idx], slides[target]] = [slides[target], slides[idx]];
              selectedIndex = target;
            }
            dirty = true;
            render();
          });
          row.append(button);
        });
        list.append(row);
      });
    }

    function render() {
      const slide = currentSlide();
      if (slide) {
        form.elements.is_active.checked = slide.is_active !== false;
        form.elements.image_url.value = slide.image_url || "";
        form.elements.mobile_image_url.value = slide.mobile_image_url || "";
        form.elements.destination_url.value = slide.destination_url || "";
        form.elements.quick_target.value = [...form.elements.quick_target.options].some((opt) => opt.value === slide.destination_url)
          ? slide.destination_url
          : "";
        form.elements.starts_at.value = toLocalDateTime(slide.starts_at);
        form.elements.ends_at.value = toLocalDateTime(slide.ends_at);
        const copy = slideCopy(slide, language);
        fields.forEach((field) => {
          form.elements[field].value = copy[field] || "";
        });
      }
      panel.querySelector("[data-hr-fields]").dir = language === "ar" ? "rtl" : "ltr";
      renderSlidesList();
      update();
    }

    function acceptDraft(draft) {
      slides.forEach(revokeSlidePreviews);
      revision = draft.revision;
      const incoming = Array.isArray(draft.slides) ? structuredClone(draft.slides) : [];
      slides = incoming.length ? incoming : [makeSlide()];
      selectedIndex = Math.min(selectedIndex, Math.max(0, slides.length - 1));
      dirty = false;
    }

    async function perform(action) {
      if (busy) return;
      busy = true;
      message("");
      update();
      try {
        await action();
      } catch (error) {
        console.error("High refresh operation failed:", error.message);
        message(error.message || "Operation failed. Published banners are unchanged.");
      } finally {
        busy = false;
        render();
      }
    }

    async function load() {
      await perform(async () => {
        const [draft, live, prodResult, catResult] = await Promise.all([
          client.from("high_refresh_drafts").select("*").eq("id", "homepage").maybeSingle(),
          client.from("high_refresh_publications").select("*").eq("id", "homepage").maybeSingle(),
          client.from("products").select("slug,name_translations,in_stock").eq("is_active", true).order("sort_order", { ascending: false }),
          client.from("categories").select("slug,name_translations").eq("is_active", true).order("sort_order"),
        ]);
        if (draft.error || live.error || prodResult.error || catResult.error) {
          throw new Error("Could not load high refresh banners. Check your connection and database migration, then reload.");
        }
        products = prodResult.data || [];
        categories = catResult.data || [];
        populateQuickTargets();
        publication = live.data;
        if (draft.data) {
          acceptDraft(draft.data);
        } else {
          revision = 0;
          slides = [makeSlide()];
          selectedIndex = 0;
          dirty = false;
        }
        loaded = true;
      });
    }

    document.querySelector('[data-admin-view="high-refresh"]').addEventListener("click", () => {
      if (!loaded) load();
    });
    panel.querySelector("[data-hr-reload]").addEventListener("click", () => {
      if (!busy && (!dirty || window.confirm("Discard your unsaved high refresh changes and reload?"))) load();
    });
    panel.querySelector("[data-hr-add-slide]").addEventListener("click", () => {
      if (busy || !loaded || slides.length >= 12) return;
      slides.push(makeSlide());
      selectedIndex = slides.length - 1;
      dirty = true;
      render();
    });

    form.addEventListener("submit", (event) => event.preventDefault());
    languageSelect.addEventListener("change", () => {
      language = languageSelect.value;
      render();
    });

    form.elements.is_active.addEventListener("change", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.is_active = form.elements.is_active.checked;
      dirty = true;
      renderSlidesList();
      update();
    });
    form.elements.image_url.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.image_url = form.elements.image_url.value.trim();
      dirty = true;
      renderSlidesList();
      update();
    });
    form.elements.mobile_image_url.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.mobile_image_url = form.elements.mobile_image_url.value.trim();
      dirty = true;
      update();
    });
    form.elements.quick_target.addEventListener("change", () => {
      const slide = currentSlide();
      if (!slide || !form.elements.quick_target.value) return;
      slide.destination_url = form.elements.quick_target.value;
      form.elements.destination_url.value = slide.destination_url;
      dirty = true;
      renderSlidesList();
      update();
    });
    form.elements.destination_url.addEventListener("input", () => {
      const slide = currentSlide();
      if (!slide) return;
      slide.destination_url = form.elements.destination_url.value.trim();
      dirty = true;
      renderSlidesList();
      update();
    });
    ["starts_at", "ends_at"].forEach((field) => {
      form.elements[field].addEventListener("change", () => {
        const slide = currentSlide();
        if (!slide) return;
        slide[field] = fromLocalDateTime(form.elements[field].value);
        dirty = true;
        renderSlidesList();
        update();
      });
    });

    [
      ["desktop_file", "_desktopFile", "_desktopObjectUrl"],
      ["mobile_file", "_mobileFile", "_mobileObjectUrl"],
    ].forEach(([inputName, fileProp, urlProp]) => {
      form.elements[inputName].addEventListener("change", () => {
        const slide = currentSlide();
        const file = form.elements[inputName].files?.[0];
        if (!slide || !file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
          form.elements[inputName].value = "";
          message("Choose a JPEG, PNG, or WebP image of 10 MB or less.");
          return;
        }
        if (slide[urlProp]) URL.revokeObjectURL(slide[urlProp]);
        slide[fileProp] = file;
        slide[urlProp] = URL.createObjectURL(file);
        dirty = true;
        message("");
        renderSlidesList();
        update();
      });
    });

    fields.forEach((field) => {
      form.elements[field].addEventListener("input", () => {
        const slide = currentSlide();
        if (!slide) return;
        const value = form.elements[field].value;
        if (language === "en" && slide.source[field] !== value) {
          languages.forEach((lang) => {
            if (slide.translations?.[lang]) delete slide.translations[lang][field];
          });
        }
        slideCopy(slide, language)[field] = value;
        dirty = true;
        renderSlidesList();
        update();
      });
    });

    form.querySelector('[data-hr-action="translate"]').addEventListener("click", () => perform(async () => {
      const slide = currentSlide();
      if (!slide) return;
      const source = {
        title: String(slide.source?.title || ""),
        text: String(slide.source?.text || ""),
        eyebrow: String(slide.source?.eyebrow || ""),
        badge: String(slide.source?.badge || ""),
      };
      if (!fields.some((field) => source[field].trim())) {
        throw new Error("Enter at least one English text field before generating translations.");
      }
      const { data, error } = await client.functions.invoke("translate-high-refresh", {
        body: { source, translations: slide.translations || {} },
      });
      if (error) {
        let detail = "Translation failed. Your banner slide is unchanged.";
        if (error.context instanceof Response) {
          try {
            const body = await error.context.json();
            if (typeof body.error === "string") detail = body.error;
          } catch (parseError) {
            console.warn("Could not read the translation error:", parseError.message);
          }
        }
        throw new Error(detail);
      }
      if (!languages.every((lang) => fields.every((field) =>
        typeof data?.translations?.[lang]?.[field] === "string" &&
        data.translations[lang][field].length <= limits[field] &&
        Boolean(data.translations[lang][field].trim()) === Boolean(source[field].trim())))) {
        throw new Error("The translation response was incomplete. No text was replaced.");
      }
      slide.translations = data.translations;
      dirty = true;
      message("Translations generated for this slide. Review any language, then save the draft.", true);
    }));

    async function uploadBannerFile(slideId, file, kind) {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type] || "jpg";
      const path = `high-refresh/${slideId}/${kind}-${crypto.randomUUID()}.${ext}`;
      const { error } = await client.storage.from("banner-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const publicUrl = client.storage.from("banner-images").getPublicUrl(path).data.publicUrl;
      return { path, publicUrl };
    }

    async function saveDraftInternal() {
      const uploadedPaths = [];
      try {
        const serializedSlides = [];
        for (const slide of slides) {
          if (slide._desktopFile instanceof File) {
            const uploaded = await uploadBannerFile(slide.id, slide._desktopFile, "desktop");
            uploadedPaths.push(uploaded.path);
            slide.image_path = uploaded.path;
            slide.image_url = uploaded.publicUrl;
            delete slide._desktopFile;
          }
          if (slide._mobileFile instanceof File) {
            const uploaded = await uploadBannerFile(slide.id, slide._mobileFile, "mobile");
            uploadedPaths.push(uploaded.path);
            slide.mobile_image_path = uploaded.path;
            slide.mobile_image_url = uploaded.publicUrl;
            delete slide._mobileFile;
          }
          const imageUrl = String(slide.image_url || "").trim();
          if (!imageUrl || (!imageUrl.startsWith("https://") && !imageUrl.startsWith("/"))) {
            throw new Error("Every banner slide requires an uploaded image or an HTTPS image URL.");
          }
          const mobileUrl = String(slide.mobile_image_url || "").trim();
          if (mobileUrl && !mobileUrl.startsWith("https://") && !mobileUrl.startsWith("/")) {
            throw new Error("Mobile image URL must be an HTTPS URL or left empty.");
          }
          const destUrl = String(slide.destination_url || "").trim();
          if (destUrl && !destUrl.startsWith("https://") && !destUrl.startsWith("/")) {
            throw new Error("Destination URL must start with / or https://.");
          }
          if (slide.starts_at && slide.ends_at && new Date(slide.ends_at) <= new Date(slide.starts_at)) {
            throw new Error("The slide end date must be later than its start date.");
          }
          const source = {
            title: String(slide.source?.title || ""),
            text: String(slide.source?.text || ""),
            eyebrow: String(slide.source?.eyebrow || ""),
            badge: String(slide.source?.badge || ""),
          };
          const cleanTranslations = {};
          for (const lang of languages) {
            const langCopy = slide.translations?.[lang];
            if (!langCopy || typeof langCopy !== "object") continue;
            cleanTranslations[lang] = {};
            for (const field of fields) {
              if (!source[field].trim()) cleanTranslations[lang][field] = "";
              else if (typeof langCopy[field] === "string") cleanTranslations[lang][field] = langCopy[field];
            }
          }
          serializedSlides.push({
            id: String(slide.id || crypto.randomUUID()),
            image_url: imageUrl,
            image_path: String(slide.image_path || ""),
            mobile_image_url: mobileUrl,
            mobile_image_path: String(slide.mobile_image_path || ""),
            destination_url: destUrl,
            starts_at: slide.starts_at || null,
            ends_at: slide.ends_at || null,
            is_active: slide.is_active !== false,
            source,
            translations: cleanTranslations,
          });
        }
        const { data, error } = await client.rpc("save_high_refresh_banners", {
          p_expected_revision: revision,
          p_slides: serializedSlides,
        });
        if (error) throw error;
        form.elements.desktop_file.value = "";
        form.elements.mobile_file.value = "";
        acceptDraft(data);
        return data;
      } catch (error) {
        if (uploadedPaths.length) {
          await client.storage.from("banner-images").remove(uploadedPaths);
        }
        throw error;
      }
    }

    form.querySelector('[data-hr-action="save"]').addEventListener("click", () => perform(async () => {
      await saveDraftInternal();
      message("Banner draft saved. Click Publish banners to update the live homepage.", true);
    }));

    form.querySelector('[data-hr-action="publish"]').addEventListener("click", () => perform(async () => {
      if (dirty || !revision) {
        await saveDraftInternal();
      }
      const { data, error } = await client.rpc("publish_high_refresh_banners", {
        p_expected_revision: revision,
      });
      if (error) throw error;
      publication = data;
      const activeCount = (data.slides || []).filter((item) => item?.is_active !== false).length;
      message(
        activeCount
          ? `Saved and published ${activeCount} banner slide(s) to the live homepage.`
          : "Published with 0 active slides; the homepage will display default category banners.",
        true,
      );
    }));

    window.addEventListener("beforeunload", (event) => {
      if (dirty || busy) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
    render();
  };
})();

