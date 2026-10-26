(() => {
  const page = document.body;
  const isHomeExperiment = page.dataset.page === "experiments";
  const isProductExperiment = page.dataset.experimentProduct === "true";
  if (!isHomeExperiment && !isProductExperiment) return;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  const labels = {
    ar: { home: "تجربة الرئيسية", product: "تجربة صفحة المنتج" },
    en: { home: "Homepage experiment", product: "Product page experiment" },
    fr: { home: "Expérience de la page d’accueil", product: "Expérience de la page produit" },
    es: { home: "Experimento de inicio", product: "Experimento de página de producto" },
    zh: { home: "首页实验", product: "商品页实验" },
  };
  const updateSwitcherLabels = () => {
    const language = document.documentElement.lang.toLowerCase().split("-")[0];
    const copy = labels[language] || labels.en;
    document.querySelectorAll("[data-experiment-label]").forEach((link) => {
      link.textContent = copy[link.dataset.experimentLabel] || copy.home;
    });
  };
  updateSwitcherLabels();
  new MutationObserver(updateSwitcherLabels).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  if (isProductExperiment) {
    const productLink = document.querySelector('[data-experiment-label="product"]');
    const productId = new URLSearchParams(location.search).get("id") || "macbook-pro";
    if (productLink) {
      productLink.href = `/experiments-product.html?id=${encodeURIComponent(productId)}`;
    }

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link) return;

      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin) return;
      if (destination.pathname === "/") {
        destination.pathname = "/experiments.html";
      } else if (destination.pathname === "/product.html") {
        destination.pathname = "/experiments-product.html";
      } else {
        return;
      }

      event.preventDefault();
      location.assign(destination.href);
    }, true);
    return;
  }

  const hero = document.querySelector("[data-experiment-hero]");
  const highlight = hero?.querySelector(".highlight-card");

  if (hero && highlight && !motionPreference.matches) {
    let frame = 0;

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = hero.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.style.setProperty("--pointer-x", `${(x * 100).toFixed(2)}%`);
        hero.style.setProperty("--pointer-y", `${(y * 100).toFixed(2)}%`);
        highlight.style.setProperty("--tilt-x", `${((0.5 - y) * 4).toFixed(2)}deg`);
        highlight.style.setProperty("--tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
      });
    });

    hero.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      hero.style.setProperty("--pointer-x", "72%");
      hero.style.setProperty("--pointer-y", "26%");
      highlight.style.setProperty("--tilt-x", "0deg");
      highlight.style.setProperty("--tilt-y", "0deg");
    });
  }

  const cardMotionRoot = document.querySelector("main");
  if (cardMotionRoot && !motionPreference.matches) {
    const cardFrames = new WeakMap();

    cardMotionRoot.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const card = event.target.closest(".product-card");
      if (!card || !cardMotionRoot.contains(card)) return;

      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      cancelAnimationFrame(cardFrames.get(card));
      cardFrames.set(card, requestAnimationFrame(() => {
        card.style.setProperty("--card-pointer-x", `${(x * 100).toFixed(2)}%`);
        card.style.setProperty("--card-pointer-y", `${(y * 100).toFixed(2)}%`);
        card.style.setProperty("--card-tilt-x", `${((0.5 - y) * 9).toFixed(2)}deg`);
        card.style.setProperty("--card-tilt-y", `${((x - 0.5) * 10).toFixed(2)}deg`);
      }));
    });

    cardMotionRoot.addEventListener("pointerout", (event) => {
      const card = event.target.closest(".product-card");
      if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
      cancelAnimationFrame(cardFrames.get(card));
      card.style.setProperty("--card-tilt-x", "0deg");
      card.style.setProperty("--card-tilt-y", "0deg");
    });
  }
})();
