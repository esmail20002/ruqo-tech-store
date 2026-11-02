(() => {
  const featuresSection = document.querySelector("section.features");
  const statsSection = document.querySelector("section.stats");
  const store = window.NoursStore;
  if (!featuresSection || !statsSection) return;

  const eyebrowNode = featuresSection.querySelector(".section-head .eyebrow");
  const titleNode = featuresSection.querySelector(".section-head h2");
  const grid = featuresSection.querySelector(".feature-grid");
  if (!eyebrowNode || !titleNode || !grid) return;

  const language = () => String(store?.getLanguage?.() || document.documentElement.lang || "en")
    .toLowerCase().split("-")[0];
  const textFor = (translations, lang) => {
    const values = translations && typeof translations === "object" ? translations : {};
    return String(values[lang] || values.en || "").trim();
  };

  const original = {
    eyebrowKey: eyebrowNode.getAttribute("data-i18n"),
    titleKey: titleNode.getAttribute("data-i18n"),
    gridHtml: grid.innerHTML,
    statsHtml: statsSection.innerHTML,
  };
  let customActive = false;

  const retranslate = (scope) => {
    const dictionary = window.NoursHomeTranslations?.[language()] || window.NoursHomeTranslations?.en || {};
    scope.querySelectorAll("[data-i18n]").forEach((element) => {
      const text = dictionary[element.getAttribute("data-i18n")];
      if (text) element.textContent = text;
    });
  };

  const setHidden = (node, hide) => {
    node.style.display = hide ? "none" : "";
  };

  const restoreStatic = () => {
    setHidden(featuresSection, false);
    setHidden(statsSection, false);
    if (!customActive) return;
    customActive = false;
    if (original.eyebrowKey) eyebrowNode.setAttribute("data-i18n", original.eyebrowKey);
    if (original.titleKey) titleNode.setAttribute("data-i18n", original.titleKey);
    eyebrowNode.hidden = false;
    titleNode.hidden = false;
    grid.innerHTML = original.gridHtml;
    statsSection.innerHTML = original.statsHtml;
    retranslate(featuresSection);
    retranslate(statsSection);
  };

  const renderCustom = (data) => {
    const lang = language();
    const visible = data.visible !== false;
    setHidden(featuresSection, !visible);
    setHidden(statsSection, !visible);
    customActive = true;
    if (!visible) return;

    // Detach from the static i18n observer so custom copy is never overwritten.
    eyebrowNode.removeAttribute("data-i18n");
    titleNode.removeAttribute("data-i18n");
    const eyebrow = textFor(data.eyebrow_translations, lang);
    const title = textFor(data.title_translations, lang);
    eyebrowNode.textContent = eyebrow;
    eyebrowNode.hidden = !eyebrow;
    titleNode.textContent = title;
    titleNode.hidden = !title;

    const features = Array.isArray(data.features) ? data.features : [];
    grid.replaceChildren(...features.map((feature, featureIndex) => {
      const article = document.createElement("article");
      article.className = "feature-box";
      const top = document.createElement("div");
      top.className = "feature-top";
      const index = document.createElement("span");
      index.className = "feature-index";
      index.textContent = String(featureIndex + 1).padStart(2, "0");
      top.append(index);
      const heading = document.createElement("h3");
      heading.textContent = textFor(feature?.title_translations, lang);
      const text = document.createElement("p");
      text.textContent = textFor(feature?.text_translations, lang);
      text.hidden = !text.textContent;
      article.append(top, heading, text);
      return article;
    }));

    const stats = Array.isArray(data.stats) ? data.stats : [];
    statsSection.replaceChildren(...stats.map((stat) => {
      const item = document.createElement("div");
      item.className = "stat-item";
      const value = document.createElement("strong");
      value.textContent = String(stat?.value || "").trim();
      const label = document.createElement("span");
      label.textContent = textFor(stat?.label_translations, lang);
      item.append(value, label);
      return item;
    }));
  };

  const render = () => {
    const data = window.RUQO_HOME_FEATURES;
    if (data && typeof data === "object" && !Array.isArray(data) &&
        (Array.isArray(data.features) || Array.isArray(data.stats))) {
      renderCustom(data);
    } else {
      restoreStatic();
    }
  };

  render();
  window.addEventListener("ruqo:home-features-updated", render);
  window.addEventListener("ruqo:language-updated", render);
})();
