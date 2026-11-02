(() => {
  const section = document.querySelector("#reviews.testimonials");
  if (!section) return;

  const eyebrow = section.querySelector(".section-head .eyebrow");
  const title = section.querySelector(".section-head h2");
  const grid = section.querySelector(".testimonial-grid");
  if (!eyebrow || !title || !grid) return;

  const original = {
    eyebrowKey: eyebrow.getAttribute("data-i18n"),
    titleKey: title.getAttribute("data-i18n"),
    gridHtml: grid.innerHTML,
  };
  let customActive = false;

  const language = () => String(window.NoursStore?.getLanguage?.() || document.documentElement.lang || "en")
    .toLowerCase().split("-")[0];
  const textFor = (translations, lang) => {
    const values = translations && typeof translations === "object" ? translations : {};
    return String(values[lang] || values.en || "").trim();
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
  const translateStatic = () => {
    const dictionary = window.NoursHomeTranslations?.[language()] || window.NoursHomeTranslations?.en || {};
    section.querySelectorAll("[data-i18n]").forEach((element) => {
      const text = dictionary[element.getAttribute("data-i18n")];
      if (text) element.textContent = text;
    });
  };

  const restoreStatic = () => {
    section.style.display = "";
    if (!customActive) return;
    customActive = false;
    if (original.eyebrowKey) eyebrow.setAttribute("data-i18n", original.eyebrowKey);
    if (original.titleKey) title.setAttribute("data-i18n", original.titleKey);
    grid.innerHTML = original.gridHtml;
    translateStatic();
    window.bindHomeSpotlightMotion?.();
  };

  const renderCustom = (data) => {
    const lang = language();
    customActive = true;
    section.style.display = data.visible === false ? "none" : "";
    if (data.visible === false) return;

    eyebrow.removeAttribute("data-i18n");
    title.removeAttribute("data-i18n");
    eyebrow.textContent = textFor(data.eyebrow_translations, lang);
    eyebrow.hidden = !eyebrow.textContent;
    title.textContent = textFor(data.title_translations, lang);
    title.hidden = !title.textContent;

    const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
      .filter((review) => review && review.is_active !== false);
    const ratingLabel = {
      en: (rating) => `${rating} out of 5 stars`,
      ar: (rating) => `${rating} من 5 نجوم`,
      fr: (rating) => `${rating} étoiles sur 5`,
      es: (rating) => `${rating} de 5 estrellas`,
      zh: (rating) => `满分 5 星，${rating} 星`,
    }[lang] || ((rating) => `${rating} out of 5 stars`);

    grid.replaceChildren(...reviews.map((review) => {
      const card = document.createElement("article");
      card.className = "testimonial-card";

      const stars = document.createElement("div");
      stars.className = "stars";
      stars.setAttribute("role", "img");
      const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));
      stars.setAttribute("aria-label", ratingLabel(rating));
      stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;

      const quote = document.createElement("p");
      quote.textContent = textFor(review.quote_translations, lang);
      quote.hidden = !quote.textContent;

      const author = document.createElement("div");
      author.className = "author";
      const imageUrl = safeImageUrl(review.avatar_url);
      if (imageUrl) {
        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = imageUrl;
        avatar.alt = "";
        avatar.loading = "lazy";
        author.append(avatar);
      }

      const identity = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = String(review.name || "").trim();
      const role = document.createElement("span");
      role.textContent = textFor(review.role_translations, lang);
      role.hidden = !role.textContent;
      identity.append(name, role);
      author.append(identity);
      card.append(stars, quote, author);
      return card;
    }));
    window.bindHomeSpotlightMotion?.();
  };

  const render = () => {
    const data = window.RUQO_HOME_REVIEWS;
    if (data && typeof data === "object" && !Array.isArray(data) && Array.isArray(data.reviews)) {
      renderCustom(data);
    } else {
      restoreStatic();
    }
  };

  render();
  window.addEventListener("ruqo:home-reviews-updated", render);
  window.addEventListener("ruqo:language-updated", render);
})();
