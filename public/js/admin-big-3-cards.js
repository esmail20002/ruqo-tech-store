(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const CARD_IDS = ["main", "top", "bottom"];
  const SECTION_KEY = "big_3_cards";
  const LOCAL_KEY = "ruqo-home-big-3-cards-v1";
  const CACHE_KEY = "ruqo-home-big-3-cards-cache-v1";
  const DEFAULT_DATA = () => ({
    visible: true,
    cards: [
      {
        id: "main",
        visible: true,
        order: 1,
        image_url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1400&q=85",
        href: "/products.html?filter=deals",
        image_position: "center",
        text_scale: "1",
        background_start: "#0077d4",
        background_end: "#031b38",
        text_color: "#ffffff",
        translations: {
          en: { eyebrow: "GAMING GEAR", badge: "UP TO 30% OFF", title: "GAME CONTROLLER", description: "Controller type: Wireless controller", button: "SHOP NOW", alt: "Wireless Gaming Controller" },
          ar: { eyebrow: "معدات الألعاب", badge: "خصم حتى 30%", title: "يد تحكم لاسلكية احترافية", description: "نوع وحدة التحكم: يد تحكم لاسلكية فائقة الاستجابة", button: "تسوق الآن", alt: "يد تحكم لاسلكية للألعاب" },
          fr: { eyebrow: "ÉQUIPEMENT GAMING", badge: "JUSQU'À -30%", title: "MANETTE SANS FIL", description: "Type : Manette sans fil haute précision", button: "ACHETER", alt: "Manette sans fil" },
          es: { eyebrow: "EQUIPO GAMING", badge: "HASTA -30%", title: "MANDO INALÁMBRICO", description: "Tipo de mando: Controlador inalámbrico", button: "COMPRAR AHORA", alt: "Mando inalámbrico para videojuegos" },
          zh: { eyebrow: "电竞装备", badge: "最高立减 30%", title: "无线游戏手柄", description: "控制器类型：低延迟无线手柄", button: "立即选购", alt: "无线游戏手柄" },
        },
      },
      {
        id: "top",
        visible: true,
        order: 2,
        image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85",
        href: "/products.html?category=audio",
        image_position: "center",
        text_scale: "1",
        background_start: "#9333ea",
        background_end: "#a855f7",
        text_color: "#ffffff",
        translations: {
          en: { eyebrow: "NEW ARRIVALS", badge: "SPECIAL OFFER", title: "BAMBOOBUDS PRO", description: "", button: "Shop Now", alt: "Wireless Earbuds" },
          ar: { eyebrow: "وصل حديثاً", badge: "عرض خاص", title: "سماعات لاسلكية ذكية", description: "", button: "تسوق الآن", alt: "سماعات أذن لاسلكية" },
          fr: { eyebrow: "NOUVEAUTÉS", badge: "OFFRE SPÉCIALE", title: "BAMBOOBUDS PRO", description: "", button: "Acheter", alt: "Écouteurs sans fil" },
          es: { eyebrow: "NOVEDADES", badge: "OFERTA ESPECIAL", title: "BAMBOOBUDS PRO", description: "", button: "Comprar ahora", alt: "Auriculares inalámbricos" },
          zh: { eyebrow: "新品上市", badge: "特惠活动", title: "BAMBOOBUDS PRO", description: "", button: "立即选购", alt: "无线耳机" },
        },
      },
      {
        id: "bottom",
        visible: true,
        order: 3,
        image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85",
        href: "/products.html?category=audio",
        image_position: "center",
        text_scale: "1",
        background_start: "#1b1528",
        background_end: "#2a1842",
        text_color: "#ffffff",
        translations: {
          en: { eyebrow: "NEW ARRIVALS", badge: "LIMITED DEAL", title: "HOMEPOD PRO", description: "", button: "Shop Now", alt: "Smart HomePod Speaker" },
          ar: { eyebrow: "وصل حديثاً", badge: "إصدار محدود", title: "مكبر صوت هوم بود برو", description: "", button: "تسوق الآن", alt: "مكبر صوت هوم بود ذكي" },
          fr: { eyebrow: "NOUVEAUTÉS", badge: "ÉDITION LIMITÉE", title: "HOMEPOD PRO", description: "", button: "Acheter", alt: "Enceinte HomePod intelligente" },
          es: { eyebrow: "NOVEDADES", badge: "EDICIÓN LIMITADA", title: "HOMEPOD PRO", description: "", button: "Comprar ahora", alt: "Altavoz HomePod inteligente" },
          zh: { eyebrow: "新品上市", badge: "限量特惠", title: "HOMEPOD PRO", description: "", button: "立即选购", alt: "智能 HomePod 音箱" },
        },
      },
    ],
  });

  const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
  const safeUrl = (value) => {
    const text = String(value || "").trim();
    if (!text || text.startsWith("//")) return "";
    try {
      const url = new URL(text, window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? text : "";
    } catch {
      return "";
    }
  };

  window.RUQO_INIT_BIG_3_CARDS_EDITOR = (client) => {
    const panel = document.querySelector('[data-admin-panel="big-3-cards"]');
    const form = document.querySelector("#big-3-cards-form");
    if (!client || !panel || !form) return;

    const editors = panel.querySelector("[data-b3-card-editors]");
    const liveNode = panel.querySelector("[data-b3-live]");
    const feedbackNode = panel.querySelector("[data-b3-feedback]");
    const languageSelect = form.elements.language;
    const previewGrid = panel.querySelector(".b3-preview-grid");
    const files = new Map();
    const objectUrls = new Map();
    let data = null;
    let language = "en";
    let loaded = false;
    let busy = false;
    let dirty = false;
    let usingDefaults = false;

    const cardLabels = { main: "Main card", top: "Side card 1", bottom: "Side card 2" };
    const fieldMarkup = (cardId, field, label, type = "text", wide = false, extra = "") => `
      <label${wide ? ' class="form-field-wide"' : ""}>${label}
        <input type="${type}" data-b3-card="${cardId}" data-b3-field="${field}" ${extra} />
      </label>`;
    editors.innerHTML = CARD_IDS.map((cardId) => `
      <fieldset class="b3-card-editor" data-b3-editor="${cardId}">
        <legend>${cardLabels[cardId]}</legend>
        <div class="admin-form-grid">
          <label class="admin-inline-check form-field-wide">
            <input type="checkbox" data-b3-card="${cardId}" data-b3-field="visible" checked />
            <span><strong>Show this card</strong><small>Hide it without deleting its settings.</small></span>
          </label>
          <label>Display order
            <select data-b3-card="${cardId}" data-b3-field="order">
              <option value="1">1 · Large card</option>
              <option value="2">2 · Side card 1</option>
              <option value="3">3 · Side card 2</option>
            </select>
          </label>
          ${fieldMarkup(cardId, "eyebrow", "Small heading")}
          ${fieldMarkup(cardId, "badge", "Offer badge")}
          ${fieldMarkup(cardId, "title", "Title", "text", true, 'maxlength="160"')}
          <label class="form-field-wide">Description
            <textarea data-b3-card="${cardId}" data-b3-field="description" rows="2" maxlength="400"></textarea>
          </label>
          ${fieldMarkup(cardId, "button", "Button text")}
          ${fieldMarkup(cardId, "alt", "Image description")}
          ${fieldMarkup(cardId, "href", "Button / card link", "text", true, 'maxlength="500"')}
          ${fieldMarkup(cardId, "image_url", "Image URL", "url", true, 'maxlength="2000"')}
          <label class="form-field-wide admin-upload">Upload image
            <input type="file" accept="image/png,image/jpeg,image/webp" data-b3-file="${cardId}" />
            <small>PNG, JPEG or WebP · maximum 10 MB. Uploading replaces the image URL.</small>
          </label>
          <label>Image position
            <select data-b3-card="${cardId}" data-b3-field="image_position">
              <option value="center">Center</option><option value="center top">Center top</option>
              <option value="center bottom">Center bottom</option><option value="left center">Left center</option>
              <option value="right center">Right center</option>
            </select>
          </label>
          <label>Text size
            <select data-b3-card="${cardId}" data-b3-field="text_scale">
              <option value="0.85">Small</option><option value="1">Normal</option><option value="1.15">Large</option>
            </select>
          </label>
          <label>Background gradient · start
            <input type="color" data-b3-card="${cardId}" data-b3-field="background_start" />
          </label>
          <label>Background gradient · end
            <input type="color" data-b3-card="${cardId}" data-b3-field="background_end" />
          </label>
          <label>Text color
            <input type="color" data-b3-card="${cardId}" data-b3-field="text_color" />
          </label>
          <div class="b3-image-preview form-field-wide"><img data-b3-image-preview="${cardId}" alt="" /><span>Image preview</span></div>
        </div>
      </fieldset>`).join("");

    const setMessage = (text, success = false) => {
      feedbackNode.textContent = text;
      feedbackNode.hidden = !text;
      feedbackNode.classList.toggle("is-success", success);
    };

    const normalizeCard = (source, fallback, index) => {
      const item = isRecord(source) ? source : {};
      const localized = {};
      LANGUAGES.forEach((locale) => {
        const values = isRecord(item.translations?.[locale]) ? item.translations[locale] : {};
        localized[locale] = Object.fromEntries(
          ["eyebrow", "badge", "title", "description", "button", "alt"].map((field) => [
            field,
            typeof values[field] === "string" ? values[field].slice(0, field === "description" ? 400 : 500) : fallback.translations[locale][field],
          ]),
        );
      });
      return {
        ...fallback,
        id: CARD_IDS.includes(item.id) ? item.id : fallback.id,
        visible: item.visible !== false,
        order: [1, 2, 3].includes(Number(item.order)) ? Number(item.order) : index + 1,
        image_url: typeof item.image_url === "string" ? item.image_url.slice(0, 2000) : fallback.image_url,
        href: typeof item.href === "string" ? item.href.slice(0, 500) : fallback.href,
        image_position: ["center", "center top", "center bottom", "left center", "right center"].includes(item.image_position) ? item.image_position : fallback.image_position,
        text_scale: ["0.85", "1", "1.15"].includes(String(item.text_scale)) ? String(item.text_scale) : fallback.text_scale,
        background_start: /^#[0-9a-f]{6}$/i.test(item.background_start || "") ? item.background_start : fallback.background_start,
        background_end: /^#[0-9a-f]{6}$/i.test(item.background_end || "") ? item.background_end : fallback.background_end,
        text_color: /^#[0-9a-f]{6}$/i.test(item.text_color || "") ? item.text_color : fallback.text_color,
        translations: localized,
      };
    };
    const normalize = (source) => {
      const fallback = DEFAULT_DATA();
      const inputCards = Array.isArray(source?.cards) ? source.cards : [];
      const cards = CARD_IDS.map((id, index) => {
        const saved = inputCards.find((card) => card?.id === id);
        return normalizeCard(saved, fallback.cards[index], index);
      });
      const orders = new Set(cards.map((card) => card.order));
      if (orders.size !== CARD_IDS.length) cards.forEach((card, index) => { card.order = index + 1; });
      return { visible: source?.visible !== false, cards };
    };
    const readLocal = () => {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return isRecord(parsed) ? parsed : null;
      } catch (error) {
        console.warn("Could not read the locally saved BIG 3 CARDS settings.", error?.message);
        return null;
      }
    };
    const publishLocal = (payload, requireStorage = false) => {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (error) {
        if (requireStorage) throw error;
        console.warn("Could not cache the published BIG 3 CARDS settings locally.", error?.message);
      }
      window.RUQO_HOME_BIG_3_CARDS = payload;
      window.dispatchEvent(new CustomEvent("ruqo:home-big-3-cards-updated", { detail: payload }));
    };
    const localized = (card) => card.translations[language] || card.translations.en;
    const allFields = () => form.querySelectorAll("input, textarea, select, button");
    const renderPreviewCard = (node, card) => {
      const copy = localized(card);
      node.hidden = !card.visible;
      node.style.setProperty("--b3-color-start", card.background_start);
      node.style.setProperty("--b3-color-end", card.background_end);
      node.style.setProperty("--b3-text-color", card.text_color);
      node.style.setProperty("--b3-text-scale", card.text_scale);
      node.style.color = card.text_color;
      const image = node.querySelector("[data-preview-image]");
      const imageUrl = safeUrl(objectUrls.get(card.id) || card.image_url);
      image.hidden = !imageUrl;
      if (imageUrl) image.src = imageUrl;
      image.alt = copy.alt;
      image.style.objectPosition = card.image_position;
      node.querySelector("[data-preview-eyebrow]").textContent = copy.eyebrow;
      node.querySelector("[data-preview-badge]").textContent = copy.badge;
      node.querySelector("[data-preview-title]").textContent = copy.title;
      const description = node.querySelector("[data-preview-description]");
      description.textContent = copy.description;
      description.hidden = !copy.description;
      node.querySelector("[data-preview-button]").textContent = copy.button;
    };
    const renderPreview = () => {
      if (!data) return;
      const ordered = [...data.cards].sort((a, b) => a.order - b.order);
      const slots = [
        [panel.querySelector("[data-b3-preview-main]"), ordered[0]],
        [panel.querySelector("[data-b3-preview-top]"), ordered[1]],
        [panel.querySelector("[data-b3-preview-bottom]"), ordered[2]],
      ];
      slots.forEach(([node, card]) => renderPreviewCard(node, card));
      previewGrid.hidden = !data.visible;
    };
    const render = () => {
      if (!data) return;
      allFields().forEach((control) => { control.disabled = busy || !loaded; });
      panel.querySelector("[data-b3-reload]").disabled = busy;
      panel.querySelector('[data-b3-action="save"]').disabled = busy || !loaded || !dirty;
      panel.querySelector('[data-b3-action="reset"]').disabled = busy || !loaded;
      form.elements.visible.checked = data.visible;
      languageSelect.value = language;
      editors.dir = language === "ar" ? "rtl" : "ltr";
      CARD_IDS.forEach((id) => {
        const card = data.cards.find((item) => item.id === id);
        const localizedCopy = card.translations[language];
        editors.querySelectorAll(`[data-b3-card="${id}"][data-b3-field]`).forEach((control) => {
          const field = control.dataset.b3Field;
          if (["eyebrow", "badge", "title", "description", "button", "alt"].includes(field)) {
            control.value = localizedCopy[field] || "";
          } else if (field === "visible") {
            control.checked = card.visible;
          } else {
            control.value = String(card[field] ?? "");
          }
        });
        const preview = editors.querySelector(`[data-b3-image-preview="${id}"]`);
        preview.src = safeUrl(objectUrls.get(id) || card.image_url) || "";
        preview.hidden = !preview.src;
      });
      renderPreview();
      liveNode.textContent = usingDefaults
        ? "Using built-in card content. Save to publish your custom BIG 3 CARDS section."
        : `Section is ${data.visible ? "visible" : "hidden"} · Editing language: ${language.toUpperCase()}${dirty ? " · Unsaved changes" : ""}.`;
      form.setAttribute("aria-busy", String(busy));
      window.lucide?.createIcons();
    };
    const releaseObjectUrls = () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
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
        const source = row?.data && isRecord(row.data) && Object.keys(row.data).length ? row.data : readLocal();
        data = normalize(source || undefined);
        usingDefaults = !source;
        dirty = false;
        loaded = true;
        if (!source) setMessage("Loaded the built-in card settings. Save to publish a customized section.", true);
      } catch (error) {
        const local = readLocal();
        data = normalize(local || undefined);
        usingDefaults = !local;
        dirty = false;
        loaded = true;
        setMessage(local
          ? `Loaded locally saved settings because Supabase could not be reached: ${error.message}`
          : `Loaded built-in settings because Supabase could not be reached: ${error.message}`);
      } finally {
        busy = false;
        render();
      }
    };
    const validate = () => {
      for (const card of data.cards) {
        if (card.visible && !card.translations.en.title.trim()) {
          language = "en";
          setMessage(`${cardLabels[card.id]} needs an English title before publishing.`);
          render();
          return false;
        }
        if (card.visible && !safeUrl(card.image_url) && !files.has(card.id)) {
          setMessage(`${cardLabels[card.id]} needs a valid image URL or an uploaded image.`);
          return false;
        }
        if (card.visible && !safeUrl(card.href)) {
          setMessage(`${cardLabels[card.id]} needs a valid destination URL.`);
          return false;
        }
      }
      return true;
    };

    editors.addEventListener("input", (event) => {
      const control = event.target.closest("[data-b3-card][data-b3-field]");
      if (!control || !data) return;
      const card = data.cards.find((item) => item.id === control.dataset.b3Card);
      if (!card) return;
      const field = control.dataset.b3Field;
      if (["eyebrow", "badge", "title", "description", "button", "alt"].includes(field)) {
        card.translations[language][field] = control.value;
      } else if (field === "visible") {
        card.visible = control.checked;
      } else if (field === "order") {
        const previousOrder = card.order;
        card.order = Number(control.value);
        const displaced = data.cards.find((item) => item.id !== card.id && item.order === card.order);
        if (displaced) displaced.order = previousOrder;
      } else {
        card[field] = control.value;
        if (field === "image_url" && files.has(card.id)) {
          files.delete(card.id);
          if (objectUrls.has(card.id)) URL.revokeObjectURL(objectUrls.get(card.id));
          objectUrls.delete(card.id);
          editors.querySelector(`[data-b3-file="${card.id}"]`).value = "";
        }
      }
      dirty = true;
      setMessage("");
      render();
    });
    editors.addEventListener("change", (event) => {
      const control = event.target.closest("[data-b3-card][data-b3-field]");
      if (!control || !data) return;
      if (control.type === "checkbox") {
        const card = data.cards.find((item) => item.id === control.dataset.b3Card);
        if (card) card.visible = control.checked;
        dirty = true;
        render();
      } else if (control.tagName === "SELECT") {
        control.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    editors.addEventListener("change", (event) => {
      const input = event.target.closest("[data-b3-file]");
      if (!input || !data) return;
      const cardId = input.dataset.b3File;
      const file = input.files?.[0];
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
        input.value = "";
        setMessage("Choose a PNG, JPEG or WebP image smaller than 10 MB.");
        return;
      }
      if (objectUrls.has(cardId)) URL.revokeObjectURL(objectUrls.get(cardId));
      files.set(cardId, file);
      objectUrls.set(cardId, URL.createObjectURL(file));
      const card = data.cards.find((item) => item.id === cardId);
      card.image_url = "";
      dirty = true;
      setMessage("");
      render();
    });
    form.elements.visible.addEventListener("change", () => {
      data.visible = form.elements.visible.checked;
      dirty = true;
      render();
    });
    languageSelect.addEventListener("change", () => {
      language = languageSelect.value;
      render();
    });
    panel.querySelector("[data-b3-reload]").addEventListener("click", async () => {
      if (dirty && !window.confirm("Discard your unsaved BIG 3 CARDS changes and reload?")) return;
      files.clear();
      releaseObjectUrls();
      await loadSection();
    });

    panel.querySelector('[data-b3-action="save"]').addEventListener("click", async () => {
      if (!loaded || busy || !validate()) return;
      busy = true;
      setMessage("Saving and publishing BIG 3 CARDS…");
      render();
      const uploadedPaths = [];
      try {
        for (const [cardId, file] of files) {
          const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
          const path = `big-3-cards/${cardId}-${crypto.randomUUID()}.${extension}`;
          const { error } = await client.storage.from("banner-images").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });
          if (error) throw error;
          uploadedPaths.push(path);
          data.cards.find((card) => card.id === cardId).image_url =
            client.storage.from("banner-images").getPublicUrl(path).data.publicUrl;
        }
        const payload = normalize(data);
        const { error } = await client
          .from("homepage_sections")
          .upsert({ key: SECTION_KEY, data: payload }, { onConflict: "key" });
        if (error && !/homepage_sections|schema cache|relation|404/i.test(error.message || "")) throw error;
        publishLocal(payload, Boolean(error));
        data = payload;
        files.clear();
        releaseObjectUrls();
        usingDefaults = false;
        dirty = false;
        setMessage(error
          ? "Saved in this browser. Apply the homepage_sections migration to publish the changes for all visitors."
          : "BIG 3 CARDS saved and published to the homepage.", true);
      } catch (error) {
        if (uploadedPaths.length) {
          try {
            const { error: cleanupError } = await client.storage.from("banner-images").remove(uploadedPaths);
            if (cleanupError) console.error("Could not clean up uploaded BIG 3 CARDS images:", cleanupError.message);
          } catch (cleanupError) {
            console.error("Could not clean up uploaded BIG 3 CARDS images:", cleanupError.message);
          }
        }
        setMessage(error.message || "Could not save BIG 3 CARDS.");
      } finally {
        busy = false;
        render();
      }
    });
    panel.querySelector('[data-b3-action="reset"]').addEventListener("click", async () => {
      if (!loaded || busy || !window.confirm("Reset BIG 3 CARDS to the original homepage content?")) return;
      busy = true;
      setMessage("");
      render();
      try {
        const { error } = await client.from("homepage_sections").delete().eq("key", SECTION_KEY);
        if (error && !/homepage_sections|schema cache|relation|404/i.test(error.message || "")) throw error;
        localStorage.removeItem(LOCAL_KEY);
        localStorage.removeItem(CACHE_KEY);
        data = DEFAULT_DATA();
        files.clear();
        releaseObjectUrls();
        usingDefaults = true;
        dirty = false;
        window.RUQO_HOME_BIG_3_CARDS = null;
        window.dispatchEvent(new CustomEvent("ruqo:home-big-3-cards-updated", { detail: null }));
        setMessage("BIG 3 CARDS reset to the built-in homepage content.", true);
      } catch (error) {
        setMessage(error.message || "Could not reset BIG 3 CARDS.");
      } finally {
        busy = false;
        render();
      }
    });

    loadSection();
    window.addEventListener("pagehide", releaseObjectUrls, { once: true });
  };
})();
