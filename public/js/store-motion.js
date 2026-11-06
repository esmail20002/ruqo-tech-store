(() => {
  const page = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  /* ==========================================================================
     0. ZERO-FLASH PRE-PAINT GATE & HOVER IMAGE/PAGE PREFETCH
     ========================================================================== */
  const setupCinematicPageTransitions = () => {
    const progressBar = document.createElement("div");
    progressBar.className = "wx-nav-progress-bar";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.append(progressBar);

    let readyTriggered = false;
    const revealReadyPage = () => {
      if (readyTriggered) return;
      readyTriggered = true;
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("is-wx-bfcache-restore");
        document.documentElement.classList.add("is-wx-ready");
        document.documentElement.classList.remove("is-wx-preparing");
        progressBar.classList.remove("is-active");
        progressBar.classList.add("is-complete");
      });
    };

    const heroImg = document.querySelector("[data-detail-image]");
    if (heroImg && !heroImg.complete) {
      let doneCalled = false;
      const finish = () => {
        if (doneCalled) return;
        doneCalled = true;
        revealReadyPage();
      };
      heroImg.addEventListener("load", finish, { once: true });
      heroImg.addEventListener("error", finish, { once: true });
      window.setTimeout(finish, 40);
    } else {
      revealReadyPage();
    }

    let isNavigating = false;
    window.addEventListener("pageshow", (event) => {
      isNavigating = false;
      document.documentElement.classList.remove("is-wx-leaving", "is-wx-preparing");
      progressBar.classList.remove("is-active");
      if (event.persisted) {
        document.documentElement.classList.add("is-wx-bfcache-restore", "is-wx-ready");
      } else {
        revealReadyPage();
      }
    });
    // Hover Prefetch & Product Image Prewarm (0ms instant cache hit on click)
    const prewarmedUrls = new Set();
    const prewarmLink = (link) => {
      if (!link?.href) return;
      let url;
      try {
        url = new URL(link.href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || prewarmedUrls.has(url.href)) return;
      prewarmedUrls.add(url.href);

      if (url.pathname.endsWith("/product.html")) {
        const pid = url.searchParams.get("id");
        const product = window.NoursData?.products?.find((item) => item.id === pid);
        if (product?.image) {
          const img = new Image();
          img.decoding = "async";
          img.src = product.image;
        }
      }

      const prefetchTag = document.createElement("link");
      prefetchTag.rel = "prefetch";
      prefetchTag.href = url.pathname + url.search;
      document.head.append(prefetchTag);
    };

    document.addEventListener(
      "pointerover",
      (event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest("a[href]");
        if (link) prewarmLink(link);
      },
      { passive: true },
    );

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest("a[href]");
        if (link) prewarmLink(link);
      },
      { passive: true },
    );

    // Trigger fast optical exit motion (110ms) + top progress bar before navigating
    document.addEventListener(
      "click",
      (event) => {
        if (
          isNavigating ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !(event.target instanceof Element)
        ) {
          return;
        }
        const link = event.target.closest("a[href]");
        if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

        let destUrl;
        try {
          destUrl = new URL(link.href, window.location.origin);
        } catch {
          return;
        }
        if (destUrl.origin !== window.location.origin) return;
        if (destUrl.pathname === window.location.pathname && destUrl.search === window.location.search && destUrl.hash) {
          return;
        }
        if (destUrl.href === window.location.href) return;

        if (reducedMotion.matches) return;

        event.preventDefault();
        isNavigating = true;
        prewarmLink(link);

        progressBar.classList.remove("is-complete");
        progressBar.classList.add("is-active");
        document.documentElement.classList.add("is-wx-leaving");

        window.setTimeout(() => {
          window.location.href = destUrl.href;
        }, 110);
      },
      { capture: true },
    );
  };

  setupCinematicPageTransitions();

  /* ==========================================================================
     1. PHYSICS-BASED INERTIAL SMOOTH SCROLL ENGINE (Apple / Lenis Feel)
     ========================================================================== */
  if (!reducedMotion.matches && !coarsePointer.matches) {
    document.documentElement.classList.add("has-inertial-scroll");

    let targetScroll = window.scrollY || 0;
    let currentScroll = targetScroll;
    let rafId = 0;
    let lastFrameTime = 0;
    let isProgrammaticScroll = false;

    const DAMPING_LAMBDA = 3.6; // Long, velvety 1.3-1.5s cinematic glide tail
    const WHEEL_MULTIPLIER = 1.22;

    const getMaxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const isOverlayOrLockActive = () => {
      if (
        document.body.classList.contains("is-intro-locked") ||
        document.body.classList.contains("is-gate-locked") ||
        document.documentElement.hasAttribute("data-modal-open")
      ) {
        return true;
      }
      if (document.querySelector("dialog[open], .product-side-drawer.is-open, .site-search-backdrop.is-open, .ai-assistant-panel.is-open")) {
        return true;
      }
      return false;
    };

    const hasScrollableAncestor = (target, deltaY) => {
      let node = target instanceof Element ? target : null;
      while (node && node !== document.body && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && node.scrollHeight > node.clientHeight + 2) {
          if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
          if (deltaY < 0 && node.scrollTop > 1) return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    const stepInertialScroll = (now) => {
      const dt = lastFrameTime ? Math.min(0.05, Math.max(0.004, (now - lastFrameTime) / 1000)) : 1 / 60;
      lastFrameTime = now;

      const maxScroll = getMaxScroll();
      if (targetScroll > maxScroll) targetScroll = maxScroll;
      if (targetScroll < 0) targetScroll = 0;

      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) > 0.08) {
        const alpha = 1 - Math.exp(-DAMPING_LAMBDA * dt);
        currentScroll += diff * alpha;
        isProgrammaticScroll = true;
        window.scrollTo(0, currentScroll);
        isProgrammaticScroll = false;
        rafId = window.requestAnimationFrame(stepInertialScroll);
      } else {
        currentScroll = targetScroll;
        isProgrammaticScroll = true;
        window.scrollTo(0, Math.round(currentScroll));
        isProgrammaticScroll = false;
        rafId = 0;
        lastFrameTime = 0;
      }
    };

    const startLoop = () => {
      if (!rafId) {
        lastFrameTime = performance.now();
        rafId = window.requestAnimationFrame(stepInertialScroll);
      }
    };

    const syncTo = (y) => {
      const nextY = typeof y === "number" ? y : window.scrollY;
      targetScroll = nextY;
      currentScroll = nextY;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        lastFrameTime = 0;
      }
    };

    window.WEEXEY_SMOOTH_SCROLL = {
      syncTo,
      scrollTo(y) {
        targetScroll = Math.max(0, Math.min(getMaxScroll(), y));
        startLoop();
      },
    };

    window.addEventListener(
      "wheel",
      (event) => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
        if (isOverlayOrLockActive()) {
          syncTo(window.scrollY);
          return;
        }
        if (hasScrollableAncestor(event.target, event.deltaY)) return;

        let deltaY = event.deltaY;
        if (event.deltaMode === 1) deltaY *= 40;
        else if (event.deltaMode === 2) deltaY *= window.innerHeight * 0.85;

        if (Math.abs(deltaY) < 0.5) return;

        // Keep in sync if native scroll drifted (e.g. scrollbar drag before wheel)
        if (!rafId && Math.abs(window.scrollY - currentScroll) > 4) {
          currentScroll = window.scrollY;
          targetScroll = currentScroll;
        }

        event.preventDefault();
        const clampedDelta = Math.max(-320, Math.min(320, deltaY * WHEEL_MULTIPLIER));
        targetScroll = Math.max(0, Math.min(getMaxScroll(), targetScroll + clampedDelta));
        startLoop();
      },
      { passive: false },
    );

    window.addEventListener(
      "scroll",
      () => {
        if (!isProgrammaticScroll && !rafId) {
          currentScroll = window.scrollY;
          targetScroll = currentScroll;
        }
      },
      { passive: true },
    );

    window.addEventListener("resize", () => {
      const maxScroll = getMaxScroll();
      if (targetScroll > maxScroll) targetScroll = maxScroll;
      if (currentScroll > maxScroll) currentScroll = maxScroll;
    });

    // Smooth inertial glide for in-page anchor links (#new, #deals, #reviews, etc.)
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href*="#"]');
      if (!link) return;
      const url = new URL(link.href, window.location.origin);
      if (url.pathname !== window.location.pathname || !url.hash || url.hash === "#") return;
      const targetEl = document.querySelector(url.hash);
      if (!targetEl) return;
      event.preventDefault();
      const headerOffset = 96;
      const destY = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - headerOffset);
      currentScroll = window.scrollY;
      targetScroll = Math.min(getMaxScroll(), destY);
      startLoop();
      history.pushState(null, "", url.hash);
    });
  }

  /* ==========================================================================
     2. CINEMATIC SECTION & STAGGERED CHILD REVEAL CHOREOGRAPHY (Homepage Only)
     ========================================================================== */
  const setupCinematicSections = () => {
    if (page.dataset.page !== "home") return;
    const sections = document.querySelectorAll("main > section");
    const staggerSelectors = [
      ".wx-bento-card",
      ".hero-copy > *",
      ".hero-visual",
      ".section-head",
      ".editorial-filter-bar",
      ".category-card",
      "#new .product-card",
      ".high-refresh-stage",
      ".promo-copy",
      ".promo-visual",
      ".feature-box",
      ".stat-item",
      ".testimonial-card",
      ".newsletter-box",
    ].join(", ");

    sections.forEach((sec) => {
      if (!sec.classList.contains("reveal") && !sec.classList.contains("lunae-sequence")) {
        sec.classList.add("cinematic-section");
      }
      const children = sec.querySelectorAll(staggerSelectors);
      children.forEach((child, idx) => {
        if (!child.classList.contains("cinematic-stagger-item")) {
          child.classList.add("cinematic-stagger-item");
          child.style.setProperty("--stagger-index", String(Math.min(idx, 10)));
        }
      });
    });

    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            entry.target.querySelectorAll(".cinematic-stagger-item").forEach((el) => {
              el.classList.add("is-stagger-visible");
            });
            sectionObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
      );

      sections.forEach((sec) => {
        if (!sec.classList.contains("lunae-sequence")) {
          sectionObserver.observe(sec);
        }
      });
    }
  };

  setupCinematicSections();

  // Re-apply stagger classes when dynamic grids (#new or #categories) update on homepage
  const mainNode = document.querySelector("main");
  if (page.dataset.page === "home" && mainNode && "MutationObserver" in window) {
    const gridObserver = new MutationObserver(() => {
      document.querySelectorAll("#new .product-card, #categories .category-card").forEach((card, idx) => {
        if (!card.classList.contains("cinematic-stagger-item")) {
          card.classList.add("cinematic-stagger-item");
          card.style.setProperty("--stagger-index", String(idx % 8));
          const parentSec = card.closest("section");
          if (parentSec && parentSec.classList.contains("visible")) {
            requestAnimationFrame(() => card.classList.add("is-stagger-visible"));
          }
        }
      });
    });
    gridObserver.observe(mainNode, { childList: true, subtree: true });
  }

  if (page.dataset.page === "experiments") return;

  const main = document.querySelector("main");
  if (!main) return;

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
})();
