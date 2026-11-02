(() => {
  const section = document.querySelector("#deals.promo-banner");
  const store = window.NoursStore;
  if (!section || !store) return;

  const DEFAULT_CONSOLE_IMAGE =
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85";

  const ui = {
    copy: section.querySelector(".promo-copy"),
    eyebrow: section.querySelector(".promo-copy .eyebrow"),
    title: section.querySelector(".promo-copy h2"),
    description: section.querySelector(".promo-copy p"),
    button: section.querySelector(".promo-copy a"),
    image: section.querySelector("[data-promo-image]"),
    consoleImg: section.querySelector(".console-visual img"),
    controls: section.querySelector("[data-promo-controls]"),
    previous: section.querySelector("[data-promo-prev]"),
    next: section.querySelector("[data-promo-next]"),
    dots: section.querySelector("[data-promo-dots]"),
  };
  if (Object.values(ui).some((node) => !node)) return;

  const fallbackSettings = { interval_seconds: 5, transition_style: "fade" };
  const labels = {
    en: { previous: "Previous offer", next: "Next offer", slide: "Offer", banner: "Promotional offers" },
    ar: { previous: "العرض السابق", next: "العرض التالي", slide: "العرض", banner: "العروض الترويجية" },
    fr: { previous: "Offre précédente", next: "Offre suivante", slide: "Offre", banner: "Offres promotionnelles" },
    es: { previous: "Oferta anterior", next: "Oferta siguiente", slide: "Oferta", banner: "Ofertas promocionales" },
    zh: { previous: "上一项优惠", next: "下一项优惠", slide: "优惠", banner: "促销优惠" },
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let slides = [];
  let settings = { ...fallbackSettings };
  let index = 0;
  let timer = 0;
  let changeTimer = 0;
  let paused = false;
  let hasRenderedCustomSlide = false;

  const language = () => String(store.getLanguage?.() || document.documentElement.lang || "en")
    .toLowerCase().split("-")[0];
  const textFor = (translations, lang) => {
    const values = translations && typeof translations === "object" ? translations : {};
    return String(values[lang] || values.en || "").trim();
  };
  const validDestination = (value) => {
    const url = String(value || "").trim();
    if (!url || url.length > 2048 || url.startsWith("//")) return "";
    if (url.startsWith("/")) return url;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : "";
    } catch {
      return "";
    }
  };
  const activeSlides = () => (Array.isArray(window.RUQO_STORE_BANNERS) ? window.RUQO_STORE_BANNERS : [])
    .filter((banner) => banner?.placement === "home_promo" && banner.is_active !== false &&
      String(banner.image_url || "").trim())
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

  function restoreBuiltInBanner() {
    const copy = window.NoursHomeTranslations?.[language()] || window.NoursHomeTranslations?.en || {};
    section.classList.remove("has-custom-slide", "has-custom-color");
    section.style.removeProperty("--promo-custom-gradient");
    ui.eyebrow.textContent = copy["promo.eyebrow"] || "";
    ui.eyebrow.hidden = !ui.eyebrow.textContent;
    ui.title.textContent = copy["promo.title"] || "";
    ui.description.textContent = copy["promo.text"] || "";
    ui.description.hidden = !ui.description.textContent;
    ui.button.textContent = copy["promo.button"] || "";
    ui.button.href = "/products.html?filter=deals";
    ui.button.hidden = false;
    ui.image.removeAttribute("src");
    ui.image.alt = "";
    ui.image.hidden = true;
    ui.consoleImg.src = DEFAULT_CONSOLE_IMAGE;
    ui.consoleImg.alt = "";
    hasRenderedCustomSlide = false;
  }

  function drawDots() {
    const locale = labels[language()] || labels.en;
    ui.dots.replaceChildren(...slides.map((slide, dotIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "promo-dot";
      dot.setAttribute("aria-label", `${locale.slide} ${dotIndex + 1}`);
      dot.setAttribute("aria-current", String(dotIndex === index));
      dot.classList.toggle("is-active", dotIndex === index);
      dot.addEventListener("click", () => move(0, dotIndex));
      return dot;
    }));
  }

  function applySlide(slide) {
    const lang = language();
    const copy = window.NoursHomeTranslations?.[lang] || window.NoursHomeTranslations?.en || {};
    const eyebrowRaw = textFor(slide.eyebrow_translations, lang);
    const hasEyebrowTranslations =
      slide.eyebrow_translations &&
      typeof slide.eyebrow_translations === "object" &&
      Object.values(slide.eyebrow_translations).some((v) => String(v || "").trim());
    const eyebrow = eyebrowRaw || (!hasEyebrowTranslations ? copy["promo.eyebrow"] || "" : "");
    const title = textFor(slide.title_translations, lang);
    const description = textFor(slide.description_translations, lang);
    const button = textFor(slide.button_translations, lang);
    const destination = validDestination(slide.destination_url);

    section.classList.add("has-custom-slide");
    const background = /^#[0-9a-f]{6}$/i.test(slide.background_color || "")
      ? slide.background_color.toLowerCase()
      : "#6931a9";
    if (background === "#6931a9") {
      section.classList.remove("has-custom-color");
      section.style.removeProperty("--promo-custom-gradient");
    } else {
      section.classList.add("has-custom-color");
      section.style.setProperty(
        "--promo-custom-gradient",
        `linear-gradient(120deg, color-mix(in srgb, ${background} 45%, #160a28) 0%, ${background} 52%, color-mix(in srgb, ${background} 58%, #d5459b) 100%)`,
      );
    }

    ui.eyebrow.textContent = eyebrow;
    ui.eyebrow.hidden = !eyebrow;
    ui.title.textContent = title;
    ui.description.textContent = description;
    ui.description.hidden = !description;
    ui.button.textContent = button;
    ui.button.hidden = !button || !destination;
    if (destination) ui.button.href = destination;
    else ui.button.removeAttribute("href");
    ui.image.hidden = true;
    ui.consoleImg.src = slide.image_url || DEFAULT_CONSOLE_IMAGE;
    ui.consoleImg.alt = title || eyebrow;
  }

  function updateControls() {
    const locale = labels[language()] || labels.en;
    section.setAttribute("aria-label", locale.banner);
    const multiple = slides.length > 1;
    ui.controls.hidden = !multiple;
    ui.previous.setAttribute("aria-label", locale.previous);
    ui.next.setAttribute("aria-label", locale.next);
    if (multiple) drawDots();
  }

  function render(animate = false) {
    slides = activeSlides();
    if (!slides.length) {
      stopRotation();
      ui.controls.hidden = true;
      restoreBuiltInBanner();
      return;
    }
    index = Math.min(index, slides.length - 1);
    const slide = slides[index];
    window.clearTimeout(changeTimer);
    ui.copy.classList.remove("is-changing");
    ui.consoleImg.classList.remove("is-changing");
    if (animate && hasRenderedCustomSlide && !reducedMotion.matches) {
      ui.copy.classList.add("is-changing");
      ui.consoleImg.classList.add("is-changing");
      changeTimer = window.setTimeout(() => {
        applySlide(slide);
        updateControls();
        requestAnimationFrame(() => {
          ui.copy.classList.remove("is-changing");
          ui.consoleImg.classList.remove("is-changing");
        });
      }, 150);
    } else {
      applySlide(slide);
      updateControls();
    }
    hasRenderedCustomSlide = true;
    syncRotation();
  }

  function stopRotation() {
    window.clearInterval(timer);
    timer = 0;
  }

  function syncRotation() {
    stopRotation();
    if (slides.length < 2 || paused || reducedMotion.matches || document.visibilityState !== "visible") return;
    timer = window.setInterval(() => move(1), settings.interval_seconds * 1000);
  }

  function move(delta, targetIndex = null) {
    if (slides.length < 2) return;
    index = targetIndex === null
      ? (index + delta + slides.length) % slides.length
      : ((targetIndex % slides.length) + slides.length) % slides.length;
    render(true);
  }

  ui.previous.addEventListener("click", () => move(-1));
  ui.next.addEventListener("click", () => move(1));
  section.addEventListener("pointerenter", () => { paused = true; syncRotation(); });
  section.addEventListener("pointerleave", () => { paused = false; syncRotation(); });
  section.addEventListener("focusin", () => { paused = true; syncRotation(); });
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      paused = false;
      syncRotation();
    }
  });
  document.addEventListener("visibilitychange", syncRotation);
  reducedMotion.addEventListener?.("change", syncRotation);
  window.addEventListener("ruqo:store-banners-updated", () => {
    index = 0;
    render(false);
  });
  window.addEventListener("ruqo:language-updated", () => {
    if (slides.length) {
      applySlide(slides[index]);
      updateControls();
    }
  });
  window.addEventListener("ruqo:home-promo-settings-updated", (event) => {
    const value = event.detail || {};
    settings = {
      interval_seconds: [3, 5, 7, 10, 15].includes(Number(value.interval_seconds))
        ? Number(value.interval_seconds)
        : fallbackSettings.interval_seconds,
      transition_style: ["fade", "slide"].includes(value.transition_style)
        ? value.transition_style
        : fallbackSettings.transition_style,
    };
    section.dataset.promoTransition = settings.transition_style;
    syncRotation();
  });

  if (window.RUQO_STORE_BANNERS) render(false);
  if (window.RUQO_HOME_PROMO_SETTINGS) {
    window.dispatchEvent(new CustomEvent("ruqo:home-promo-settings-updated", {
      detail: window.RUQO_HOME_PROMO_SETTINGS,
    }));
  }
})();
