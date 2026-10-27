(() => {
  const page = document.body;
  if (page.dataset.page === "experiments") return;

  const main = document.querySelector("main");
  if (!main) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  if (reducedMotion.matches || coarsePointer.matches) return;

  const cardsSelector = ".product-card, .catalog-product, .commerce-product-card";
  const frames = new WeakMap();

  main.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    const card = event.target.closest(cardsSelector);
    if (!card || !main.contains(card)) return;

    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    cancelAnimationFrame(frames.get(card));
    frames.set(card, requestAnimationFrame(() => {
      card.style.setProperty("--card-pointer-x", `${(x * 100).toFixed(2)}%`);
      card.style.setProperty("--card-pointer-y", `${(y * 100).toFixed(2)}%`);
      card.style.setProperty("--card-tilt-x", `${((0.5 - y) * 7).toFixed(2)}deg`);
      card.style.setProperty("--card-tilt-y", `${((x - 0.5) * 8).toFixed(2)}deg`);
    }));
  });

  main.addEventListener("pointerout", (event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(cardsSelector);
    if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;

    cancelAnimationFrame(frames.get(card));
    card.style.setProperty("--card-tilt-x", "0deg");
    card.style.setProperty("--card-tilt-y", "0deg");
  });

  const hero = main.querySelector(".hero-visual");
  const highlight = hero?.querySelector(".highlight-card");
  if (hero && highlight) {
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

  if (!("IntersectionObserver" in window)) return;

  const revealSelector = [
    ".catalog-product",
    ".commerce-product-card",
    ".commerce-panel",
    ".checkout-step-panel",
    ".summary-panel",
    ".cart-line",
    ".faq-list details",
    ".about-service-card",
    ".about-premium-service-card",
    ".about-review-card",
    ".about-premium-review-card",
    ".about-premium-purpose article",
    ".about-premium-contact",
    ".about-stat",
    ".support-trust-grid article",
    ".support-policy-grid article",
    ".catalog-desktop-banner",
    ".product-detail-gallery",
    ".product-detail-copy",
  ].join(", ");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

  const observeRevealItems = (scope) => {
    if (!(scope instanceof Element)) return;
    if (scope.matches(revealSelector)) markReveal(scope);
    scope.querySelectorAll(revealSelector).forEach(markReveal);
  };

  const markReveal = (element) => {
    if (element.classList.contains("premium-reveal") || !element.getClientRects().length) return;
    element.classList.add("premium-reveal");
    revealObserver.observe(element);
  };

  observeRevealItems(main);

  const contentObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => observeRevealItems(node));
    });
  });
  contentObserver.observe(main, { childList: true, subtree: true });
})();
