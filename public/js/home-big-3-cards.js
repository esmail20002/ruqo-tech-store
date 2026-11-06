(() => {
  const LANGUAGES = ["en", "ar", "fr", "es", "zh"];
  const CARD_IDS = ["main", "top", "bottom"];
  const TEXT_FIELDS = ["eyebrow", "badge", "title", "description", "button", "alt"];
  const ORIGINAL_I18N = new WeakMap();
  const section = document.querySelector(".wx-promo-bento");
  const grid = section?.querySelector(".wx-promo-bento__grid");
  if (!section || !grid) return;
  const builtInCards = new Map(
    [...grid.querySelectorAll("[data-b3-slot]")].map((card) => {
      const image = card.querySelector(".wx-bento-card__bg");
      const text = {};
      TEXT_FIELDS.forEach((field) => {
        const element = field === "eyebrow" ? card.querySelector(".wx-bento-card__eyebrow")
          : field === "badge" ? card.querySelector(".wx-bento-card__offer-pill")
          : field === "title" ? card.querySelector(".wx-bento-card__title, .wx-bento-card__side-title")
          : field === "description" ? card.querySelector("[data-b3-description]")
          : field === "button" ? card.querySelector(".wx-bento-card__btn, [data-b3-button]")
          : null;
        text[field] = element?.textContent || "";
        if (element?.hasAttribute("data-i18n")) ORIGINAL_I18N.set(element, element.getAttribute("data-i18n"));
      });
      return [card.dataset.b3Slot, {
        src: image.getAttribute("src"),
        alt: image.alt,
        href: card.matches("a") ? card.getAttribute("href") : card.querySelector(".wx-bento-card__btn")?.getAttribute("href"),
        text,
      }];
    }),
  );
  let customApplied = false;

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
  const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
  const getCopy = (card) => {
    const locale = (document.documentElement.lang || "en").split("-")[0];
    return card.translations?.[locale] || card.translations?.en || {};
  };
  const restoreI18n = (element) => {
    if (!ORIGINAL_I18N.has(element)) return;
    element.setAttribute("data-i18n", ORIGINAL_I18N.get(element));
  };
  const setCustomText = (element, value) => {
    if (!element) return;
    if (element.hasAttribute("data-i18n")) {
      ORIGINAL_I18N.set(element, element.getAttribute("data-i18n"));
      element.removeAttribute("data-i18n");
    }
    element.textContent = value || "";
  };
  const resetBuiltInText = () => {
    if (!customApplied) return;
    section.hidden = false;
    grid.classList.remove("has-no-main", "has-no-side", "has-one-card");
    grid.style.removeProperty("--b3-side-count");
    grid.querySelectorAll("[data-b3-slot]").forEach((card) => {
      const original = builtInCards.get(card.dataset.b3Slot);
      card.hidden = false;
      card.style.removeProperty("--b3-color-start");
      card.style.removeProperty("--b3-color-end");
      card.style.removeProperty("--b3-text-color");
      card.style.removeProperty("--b3-text-scale");
      card.style.removeProperty("color");
      const image = card.querySelector(".wx-bento-card__bg");
      image.setAttribute("src", original.src);
      image.alt = original.alt;
      image.style.removeProperty("object-position");
      const elements = {
        eyebrow: card.querySelector(".wx-bento-card__eyebrow"),
        badge: card.querySelector(".wx-bento-card__offer-pill"),
        title: card.querySelector(".wx-bento-card__title, .wx-bento-card__side-title"),
        description: card.querySelector("[data-b3-description]"),
        button: card.querySelector(".wx-bento-card__btn, [data-b3-button]"),
      };
      TEXT_FIELDS.forEach((field) => {
        const element = elements[field];
        if (!element) return;
        restoreI18n(element);
        element.textContent = original.text[field];
        element.hidden = false;
        element.style.removeProperty("color");
      });
      card.querySelector(".wx-bento-card__link")?.removeAttribute("hidden");
      if (card.matches("a")) card.setAttribute("href", original.href);
      else card.querySelector(".wx-bento-card__btn")?.setAttribute("href", original.href);
    });
    customApplied = false;
  };
  const renderCard = (element, card) => {
    const copy = getCopy(card);
    const image = element.querySelector(".wx-bento-card__bg");
    const imageUrl = safeUrl(card.image_url);
    if (imageUrl) image.src = imageUrl;
    image.alt = copy.alt || "";
    image.style.objectPosition = ["center", "center top", "center bottom", "left center", "right center"].includes(card.image_position)
      ? card.image_position
      : "center";
    element.style.setProperty("--b3-color-start", safeColor(card.background_start, "#0077d4"));
    element.style.setProperty("--b3-color-end", safeColor(card.background_end, "#031b38"));
    element.style.setProperty("--b3-text-color", safeColor(card.text_color, "#ffffff"));
    element.style.setProperty("--b3-text-scale", ["0.85", "1", "1.15"].includes(String(card.text_scale)) ? String(card.text_scale) : "1");
    element.style.color = safeColor(card.text_color, "#ffffff");
    const eyebrow = element.querySelector(".wx-bento-card__eyebrow");
    const badge = element.querySelector(".wx-bento-card__offer-pill");
    const title = element.querySelector(".wx-bento-card__title, .wx-bento-card__side-title");
    const description = element.querySelector("[data-b3-description]");
    const button = element.querySelector(".wx-bento-card__btn, [data-b3-button]");
    setCustomText(eyebrow, copy.eyebrow);
    setCustomText(badge, copy.badge);
    setCustomText(title, copy.title);
    setCustomText(description, copy.description);
    setCustomText(button, copy.button);
    if (description) description.hidden = !copy.description;
    if (button) {
      button.hidden = !copy.button && button.matches(".wx-bento-card__btn");
      const linkLabel = element.querySelector(".wx-bento-card__link");
      if (linkLabel) linkLabel.hidden = !copy.button;
    }
    if (element.matches("a")) {
      const href = safeUrl(card.href);
      if (href) element.href = href;
    } else {
      const buttonHref = safeUrl(card.href);
      if (buttonHref && button) button.href = buttonHref;
    }
    [eyebrow, badge, title, description, button].filter(Boolean).forEach((node) => {
      node.style.color = safeColor(card.text_color, "#ffffff");
    });
    element.hidden = card.visible === false;
  };
  const apply = (source) => {
    if (!source) {
      resetBuiltInText();
      return;
    }
    customApplied = true;
    if (!Array.isArray(source.cards) || !CARD_IDS.every((id) => source.cards.some((card) => card?.id === id))) {
      console.warn("The homepage BIG 3 CARDS data is invalid; keeping the built-in cards.");
      return;
    }
    const cards = CARD_IDS.map((id) => source.cards.find((card) => card.id === id))
      .sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));
    const slots = [
      [document.querySelector("#wx-bento-main"), cards[0]],
      [document.querySelector("#wx-bento-top"), cards[1]],
      [document.querySelector("#wx-bento-bottom"), cards[2]],
    ];
    slots.forEach(([element, card]) => renderCard(element, card));
    const visibleMain = !slots[0][0].hidden;
    const visibleSides = slots.slice(1).filter(([element]) => !element.hidden).length;
    const visibleCount = Number(visibleMain) + visibleSides;
    section.hidden = source.visible === false || visibleCount === 0;
    grid.classList.toggle("has-no-main", !visibleMain);
    grid.classList.toggle("has-no-side", visibleSides === 0);
    grid.classList.toggle("has-one-card", visibleCount === 1);
    grid.style.setProperty("--b3-side-count", String(Math.max(1, visibleSides)));
  };

  apply(window.RUQO_HOME_BIG_3_CARDS);
  window.addEventListener("ruqo:home-big-3-cards-updated", (event) => apply(event.detail));
  window.addEventListener("ruqo:language-updated", () => apply(window.RUQO_HOME_BIG_3_CARDS));
  new MutationObserver(() => apply(window.RUQO_HOME_BIG_3_CARDS))
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
