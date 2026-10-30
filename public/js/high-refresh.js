(() => {
  const core = window.RuqoHighRefresh;
  const store = window.NoursStore;
  const section = document.querySelector(".experiment-editorial");
  try {
    localStorage.removeItem("ruqo-interest-history-v1");
    localStorage.removeItem("ruqo-personalization-disabled");
  } catch {}
  if (!section || !core || !store || !window.NoursData) return;

  const copy = {
    en: { featured: "Featured", previous: "Previous banner", next: "Next banner", banner: "Promotional banner", slide: "Banner slide" },
    ar: { featured: "إعلان مميز", previous: "الإعلان السابق", next: "الإعلان التالي", banner: "مساحة إعلانية", slide: "شريحة الإعلان" },
    fr: { featured: "À la une", previous: "Bannière précédente", next: "Bannière suivante", banner: "Bannière promotionnelle", slide: "Diapositive" },
    es: { featured: "Destacado", previous: "Banner anterior", next: "Banner siguiente", banner: "Banner promocional", slide: "Diapositiva" },
    zh: { featured: "精选活动", previous: "上一张横幅", next: "下一张横幅", banner: "精选横幅", slide: "横幅" },
  };
  const scene = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`;
  const sceneImages = {
    laptops: scene("photo-1496181133206-80ce9b88a853"),
    phones: scene("photo-1511707171634-5f897ff02aa9"),
    audio: scene("photo-1546435770-a3e426bf472b"),
    wearables: scene("photo-1523275335684-37898b6baf30"),
  };

  const mobileQuery = window.matchMedia("(max-width: 650px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let signature = "";
  let autoplayTimer = 0;
  let scheduleTimer = 0;
  let pausedByInteraction = false;

  const language = () => store.getLanguage();
  const words = () => copy[language()] || copy.en;

  section.id = "high-refresh";
  section.classList.add("high-refresh-banner-section");
  section.setAttribute("aria-label", words().banner);
  section.innerHTML = `
    <div class="experiment-editorial-visual high-refresh-banner">
      <div class="high-refresh-stage">
        <a class="high-refresh-banner-link" data-hr-link>
          <img class="high-refresh-banner-img" data-hr-image alt="" loading="lazy" />
          <div class="high-refresh-overlay" data-hr-overlay hidden>
            <div class="high-refresh-overlay-copy">
              <h2 id="high-refresh-title" data-hr-title hidden></h2>
              <p data-hr-description hidden></p>
              <span class="primary-btn high-refresh-cta" data-hr-cta hidden></span>
            </div>
          </div>
        </a>
      </div>
      <div class="high-refresh-controls" data-hr-controls role="group" hidden>
        <button type="button" class="high-refresh-arrow" data-hr-prev>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="high-refresh-dots" data-hr-dots></div>
        <button type="button" class="high-refresh-arrow" data-hr-next>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <span class="experiment-editorial-orbit" aria-hidden="true"></span>
    </div>`;

  const find = (selector) => section.querySelector(selector);
  const ui = {
    visual: find(".experiment-editorial-visual"),
    stage: find(".high-refresh-stage"),
    link: find("[data-hr-link]"),
    image: find("[data-hr-image]"),
    overlay: find("[data-hr-overlay]"),
    title: find("[data-hr-title]"),
    description: find("[data-hr-description]"),
    cta: find("[data-hr-cta]"),
    controls: find("[data-hr-controls]"),
    prev: find("[data-hr-prev]"),
    next: find("[data-hr-next]"),
    dots: find("[data-hr-dots]"),
  };

  function defaultSlides() {
    const categories = window.NoursData.getCategories();
    const order = ["laptops", "phones", "audio", "wearables"];
    const sorted = [
      ...order.map((slug) => categories.find((item) => item.slug === slug)).filter(Boolean),
      ...categories.filter((item) => !order.includes(item.slug)),
    ];
    return sorted.slice(0, 6).map((category) => {
      const image = category.coverImage || sceneImages[category.slug] || category.image;
      if (!image) return null;
      const names = category.name_translations || {};
      return {
        id: `default-${category.slug}`,
        image_url: image,
        mobile_image_url: "",
        destination_url: `/products.html?category=${encodeURIComponent(category.slug)}`,
        is_active: true,
        source: { title: "", text: "", eyebrow: "", badge: names.en || category.slug },
        translations: Object.fromEntries(["ar", "fr", "es", "zh"].map((lang) => [
          lang,
          { title: "", text: "", eyebrow: "", badge: names[lang] || names.en || category.slug },
        ])),
      };
    }).filter(Boolean);
  }

  function currentSelection() {
    if (window.RUQO_HIGH_REFRESH === undefined && window.RUQO_SUPABASE_CONFIG?.url) {
      return { mode: "pending", slides: [] };
    }
    return core.activeBannerSlides(window.RUQO_HIGH_REFRESH, defaultSlides(), Date.now());
  }

  function scheduleNextBoundary() {
    window.clearTimeout(scheduleTimer);
    const raw = Array.isArray(window.RUQO_HIGH_REFRESH?.slides) ? window.RUQO_HIGH_REFRESH.slides : [];
    const now = Date.now();
    let next = Infinity;
    for (const slide of raw) {
      for (const value of [slide?.starts_at, slide?.ends_at]) {
        if (!value) continue;
        const timestamp = Date.parse(value);
        if (Number.isFinite(timestamp) && timestamp > now) {
          next = Math.min(next, timestamp - now + 50);
        }
      }
    }
    if (Number.isFinite(next)) {
      scheduleTimer = window.setTimeout(() => {
        render(true);
        scheduleNextBoundary();
      }, Math.min(next, 2147483647));
    }
  }

  function syncAutoplay() {
    window.clearInterval(autoplayTimer);
    const { slides } = currentSelection();
    if (slides.length < 2 || pausedByInteraction || reducedMotionQuery.matches || document.visibilityState !== "visible") {
      return;
    }
    autoplayTimer = window.setInterval(() => {
      move(1);
    }, 4000);
  }

  function move(delta, targetIndex = null) {
    const { slides } = currentSelection();
    if (slides.length < 2) return;
    index = targetIndex !== null
      ? ((targetIndex % slides.length) + slides.length) % slides.length
      : (index + delta + slides.length) % slides.length;
    render(true);
  }

  function renderDots(total) {
    const text = words();
    if (ui.dots.childElementCount !== total) {
      ui.dots.replaceChildren(...Array.from({ length: total }, (_, dotIndex) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "high-refresh-dot";
        dot.addEventListener("click", () => {
          move(0, dotIndex);
          syncAutoplay();
        });
        return dot;
      }));
    }
    [...ui.dots.children].forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-label", `${text.slide} ${dotIndex + 1}`);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function render(animate = false) {
    const text = words();
    const lang = language();
    const selected = currentSelection();
    if (selected.mode === "pending") {
      section.dataset.mode = "pending";
      return;
    }
    const nextSignature = `${selected.mode}:${selected.slides.map((slide) => slide.id).join(",")}`;
    if (signature !== nextSignature) {
      signature = nextSignature;
      index = 0;
    }
    if (!selected.slides.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    index = Math.min(index, selected.slides.length - 1);
    const slide = selected.slides[index];
    const localized = core.localizeSlide(slide, lang);

    section.dataset.mode = selected.mode;
    section.setAttribute("aria-label", text.banner);

    const useMobile = mobileQuery.matches && slide.mobile_image_url && String(slide.mobile_image_url).trim();
    const imageSrc = String(useMobile ? slide.mobile_image_url : slide.image_url).trim();
    const imageChanged = ui.image.getAttribute("src") !== imageSrc;
    if (imageChanged) {
      ui.image.hidden = false;
      ui.image.src = imageSrc;
    }
    ui.image.alt = localized.title || localized.badge || text.banner;

    ui.overlay.hidden = !localized.hasOverlay;
    ui.title.textContent = localized.title;
    ui.title.hidden = !localized.title;
    ui.description.textContent = localized.text;
    ui.description.hidden = !localized.text;
    ui.cta.textContent = localized.eyebrow;
    ui.cta.hidden = !localized.eyebrow;

    if (localized.destinationUrl) {
      ui.link.href = localized.destinationUrl;
      ui.link.classList.add("is-clickable");
    } else {
      ui.link.removeAttribute("href");
      ui.link.classList.remove("is-clickable");
    }

    const multiple = selected.slides.length > 1;
    ui.controls.hidden = !multiple;
    ui.prev.setAttribute("aria-label", text.previous);
    ui.next.setAttribute("aria-label", text.next);
    ui.controls.setAttribute("aria-label", text.banner);
    if (multiple) renderDots(selected.slides.length);

    if (animate && imageChanged && !reducedMotionQuery.matches) {
      ui.image.animate(
        [{ opacity: 0.45, transform: "scale(1.02)" }, { opacity: 1, transform: "scale(1)" }],
        { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
    syncAutoplay();
  }

  ui.prev.addEventListener("click", () => {
    move(-1);
    syncAutoplay();
  });
  ui.next.addEventListener("click", () => {
    move(1);
    syncAutoplay();
  });
  ui.image.addEventListener("error", () => {
    const slide = currentSelection().slides[index];
    if (slide?.image_url && ui.image.getAttribute("src") !== slide.image_url) {
      ui.image.src = slide.image_url;
    } else {
      console.warn("High refresh banner image failed to load.");
    }
  });

  section.addEventListener("pointerenter", () => { pausedByInteraction = true; syncAutoplay(); });
  section.addEventListener("pointerleave", () => { pausedByInteraction = false; syncAutoplay(); });
  section.addEventListener("focusin", () => { pausedByInteraction = true; syncAutoplay(); });
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      pausedByInteraction = false;
      syncAutoplay();
    }
  });
  document.addEventListener("visibilitychange", syncAutoplay);
  mobileQuery.addEventListener?.("change", () => render(false));
  reducedMotionQuery.addEventListener?.("change", syncAutoplay);

  ["ruqo:catalog-updated", "ruqo:language-updated", "ruqo:high-refresh-updated"].forEach((name) => {
    window.addEventListener(name, () => {
      render(false);
      scheduleNextBoundary();
    });
  });

  render(false);
  scheduleNextBoundary();
})();

