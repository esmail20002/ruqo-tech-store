(() => {
  const sequence = document.querySelector("[data-lunae-sequence]");
  const stage = document.querySelector("[data-lunae-stage]");
  const canvas = document.querySelector("[data-lunae-canvas]");
  const frameCount = document.querySelector("[data-lunae-frame-count]");
  const status = document.querySelector("[data-lunae-status]");
  const introCue = document.querySelector("[data-lunae-intro]");
  const introCueText = document.querySelector("[data-lunae-intro-text]");
  const tintLayer = document.querySelector("[data-lunae-tint]");
  const focusRing = document.querySelector("[data-focus-ring]");
  const betaBar = document.querySelector("[data-beta-bar]");
  const waveLine = document.querySelector("[data-wave-line]");
  const waveArea = document.querySelector("[data-wave-area]");
  const replayBtn = document.querySelector("[data-wx-replay]");
  const useMobilePortraitSequence =
    document.body.dataset.page === "home" &&
    window.matchMedia("(max-width: 920px)").matches;
  const connection = navigator.connection;
  const isDataSaver =
    connection?.saveData === true ||
    ["slow-2g", "2g"].includes(connection?.effectiveType);
  const hasLimitedResources =
    (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4);
  const isLowPowerMobile =
    useMobilePortraitSequence && (isDataSaver || hasLimitedResources);
  const mobilePortraitSourceFrameCount = 120;
  const lowPowerFrameCount = isDataSaver ? 24 : 36;

  if (isLowPowerMobile) {
    document.documentElement.classList.add("is-low-power-mobile");
  }

  const revealItems = {
    brand: document.querySelector('[data-reveal-item="brand"]'),
    eyebrow: document.querySelector('[data-reveal-item="eyebrow"]'),
    headline: document.querySelector('[data-reveal-item="headline"]'),
    description: document.querySelector('[data-reveal-item="description"]'),
    actions: document.querySelector('[data-reveal-item="actions"]'),
    stats: document.querySelector('[data-reveal-item="stats"]'),
  };
  const revealCards = Array.from(document.querySelectorAll("[data-reveal-card]"));
  const cardNumbers = Array.from(document.querySelectorAll("[data-card-number]"));
  const statCounters = Array.from(document.querySelectorAll("[data-stat-counter]"));
  const statDecimals = Array.from(document.querySelectorAll("[data-stat-decimal]"));

  if (!(sequence instanceof HTMLElement) || !(stage instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context =
    canvas.getContext("2d", { colorSpace: "srgb" }) ||
    canvas.getContext("2d");
  if (!context) {
    console.error("Lunae sequence: a 2D canvas context could not be created.");
    if (status instanceof HTMLElement) {
      status.textContent = "This browser could not start the visual sequence.";
      status.hidden = false;
    }
    return;
  }

  const firstFrameNumber = useMobilePortraitSequence ? 1 : 7;
  const lastFrameNumber = useMobilePortraitSequence ? mobilePortraitSourceFrameCount : 50;
  const totalFrames = useMobilePortraitSequence
    ? isLowPowerMobile
      ? lowPowerFrameCount
      : mobilePortraitSourceFrameCount
    : lastFrameNumber - firstFrameNumber + 1;
  const images = new Array(totalFrames);
  const pendingLoads = new Array(totalFrames);
  const introRewindCount = 20;
  const introRewindImages = new Array(introRewindCount);
  const introRewindPending = new Array(introRewindCount);
  let targetFrame = 0;
  let currentFrame = 0;
  let lastRenderedFrame = -1;
  let lastAnimTimeMs = 0;
  let scrollNeedsUpdate = true;
  let canvasNeedsResize = true;
  let redrawRequested = true;

  const HERO_SEEN_SESSION_KEY = "weexey-hero-intro-seen-v2";
  const FIRST_VISIT_COMPLETED_KEY = "weexey-first-visit-completed-v1";
  const langGate = document.querySelector("[data-wx-lang-gate]");
  const langGateBar = document.querySelector("[data-wx-gate-bar]");
  const langGateStatus = document.querySelector("[data-wx-gate-status]");
  const langGateButtons = Array.from(document.querySelectorAll("[data-wx-gate-lang]"));
  const langGateLanguageTrigger = document.querySelector("[data-wx-gate-language-trigger]");
  const langGateLanguageMenu = document.querySelector("[data-wx-gate-language-menu]");
  const langGateLanguageLabel = document.querySelector("[data-wx-gate-language-label]");
  const langGateCurrencyTrigger = document.querySelector("[data-wx-gate-currency-trigger]");
  const langGateCurrencyMenu = document.querySelector("[data-wx-gate-currency-menu]");
  const langGateCurrencyLabel = document.querySelector("[data-wx-gate-currency-label]");
  const langGateCurrencyButtons = Array.from(document.querySelectorAll("[data-wx-gate-currency]"));
  const langGateSlider = document.querySelector("[data-wx-gate-slider]");
  const langGateThumb = document.querySelector("[data-wx-gate-thumb]");
  const langGateDesktopStart = document.querySelector("[data-wx-gate-desktop-start]");
  const langGateDesktopStartLabel = document.querySelector("[data-wx-gate-desktop-start-label]");
  let selectedGateLang = window.NoursStore?.getLanguage?.() || "en";

  const readCustomHeroData = () => {
    if (window.RUQO_HOME_LUNAE_HERO && typeof window.RUQO_HOME_LUNAE_HERO === "object") {
      return window.RUQO_HOME_LUNAE_HERO;
    }
    try {
      const raw =
        localStorage.getItem("ruqo-home-lunae-hero-cache-v1") ||
        localStorage.getItem("ruqo-home-lunae-hero-v1");
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const readCustomHelloPageData = () => {
    if (window.RUQO_HOME_HELLO_PAGE && typeof window.RUQO_HOME_HELLO_PAGE === "object") {
      return window.RUQO_HOME_HELLO_PAGE;
    }
    try {
      const raw =
        localStorage.getItem("ruqo-home-hello-page-cache-v1") ||
        localStorage.getItem("ruqo-home-hello-page-v1");
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const initialCustomHero = readCustomHeroData();
  const initialHelloPage = readCustomHelloPageData();
  const introMode = ["once_per_session", "always", "skip"].includes(initialCustomHero?.intro_mode)
    ? initialCustomHero.intro_mode
    : "once_per_session";
  const helloDisplayMode =
    initialHelloPage?.enabled === false || initialHelloPage?.display_mode === "disabled"
      ? "disabled"
      : initialHelloPage?.display_mode === "always"
        ? "always"
        : "first_visit";

  function hasCompletedFirstVisit() {
    try {
      return localStorage.getItem(FIRST_VISIT_COMPLETED_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markFirstVisitCompleted() {
    try {
      localStorage.setItem(FIRST_VISIT_COMPLETED_KEY, "1");
      sessionStorage.setItem(HERO_SEEN_SESSION_KEY, "1");
    } catch (error) {
      console.warn("Lunae sequence: first-visit state could not be saved.", error);
    }
  }

  const isFirstEverVisit = !hasCompletedFirstVisit();
  const shouldOpenHelloGateOnLoad =
    helloDisplayMode === "always" ||
    (helloDisplayMode === "first_visit" && isFirstEverVisit);
  const shouldSkipIntroOnLoad =
    !shouldOpenHelloGateOnLoad &&
    (introMode === "skip" || (!isFirstEverVisit && introMode !== "always"));

  function markHeroSeenInSession() {
    markFirstVisitCompleted();
  }

  // Intro eye-opening video — lazy-loaded only when the intro is scheduled or Replay is triggered.
  const introPoster = new Image();
  introPoster.decoding = "async";
  let introPosterReady = false;
  let introAssetsInitialized = false;
  introPoster.onload = () => {
    introPosterReady = true;
    redrawRequested = true;
    updateGateBufferProgress();
  };

  const introVideo = document.createElement("video");
  introVideo.muted = true;
  introVideo.defaultMuted = true;
  introVideo.loop = false;
  introVideo.playsInline = true;
  introVideo.preload = "none";
  introVideo.setAttribute("muted", "");
  introVideo.setAttribute("playsinline", "");
  let introVideoReady = false;
  let isIntroPlaying = false;
  let isAutoPlayingSequence = false;
  let autoPlayStartTime = 0;
  let autoPlayStartFrame = 0;
  let isGateOpen = false;
  let introVideoEnded = shouldSkipIntroOnLoad;
  let introDismissedByScroll = shouldSkipIntroOnLoad;
  let introBlend = shouldSkipIntroOnLoad ? 0 : 1;

  function ensureIntroAssetsLoaded() {
    if (introAssetsInitialized || useMobilePortraitSequence) return;
    introAssetsInitialized = true;
    introPoster.src = "/images/lunae-sequence/lunae-intro-poster.png";
    introVideo.preload = "auto";
    introVideo.src = "/images/lunae-sequence/lunae-intro-eye.mp4";
    introVideo.load();
  }
  if (!shouldSkipIntroOnLoad) {
    ensureIntroAssetsLoaded();
  }

  function setIntroLockState(locked) {
    isIntroPlaying = locked;
    document.body.classList.toggle("is-intro-locked", locked || isAutoPlayingSequence || isGateOpen);
    if (introCueText instanceof HTMLElement) {
      introCueText.textContent = "AWAKENING WEEXEY VISION...";
    }
  }

  function startAutoPlaySequence(fromFrame = 0) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      isAutoPlayingSequence = false;
      setIntroLockState(false);
      lockHeroAtEnd();
      return;
    }
    isAutoPlayingSequence = true;
    heroLocked = false;
    sequence.classList.add("is-hero-locked");
    autoPlayStartFrame = clamp(fromFrame, 0, totalFrames - 1);
    currentFrame = autoPlayStartFrame;
    targetFrame = autoPlayStartFrame;
    autoPlayStartTime = performance.now();
    document.body.classList.toggle("is-intro-locked", true);
    ensureAmbientVideoLoaded();
    redrawRequested = true;
  }

  function startIntroVideoPlayback() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIntroLockState(false);
      introVideoEnded = true;
      introDismissedByScroll = true;
      introBlend = 0;
      lockHeroAtEnd();
      return;
    }

    if (useMobilePortraitSequence) {
      setIntroLockState(false);
      introVideoEnded = true;
      introDismissedByScroll = true;
      introBlend = 0;
      startAutoPlaySequence(0);
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    ensureIntroAssetsLoaded();
    introVideoEnded = false;
    introDismissedByScroll = false;
    isAutoPlayingSequence = false;
    introBlend = 1;
    setIntroLockState(true);
    introVideo.currentTime = 0;
    const playPromise = introVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIntroLockState(false);
        introVideoEnded = true;
        introDismissedByScroll = true;
        introBlend = 0;
        startAutoPlaySequence(0);
      });
    }
    redrawRequested = true;
  }

  introVideo.addEventListener("loadeddata", () => {
    introVideoReady = true;
    redrawRequested = true;
    updateGateBufferProgress();
  });

  introVideo.addEventListener("ended", () => {
    introVideoEnded = true;
    setIntroLockState(false);
    startAutoPlaySequence(0);
    redrawRequested = true;
  });

  // Ambient hair & wind loop video that takes over seamlessly at the end of the sequence
  const ambientVideo = document.createElement("video");
  ambientVideo.muted = true;
  ambientVideo.defaultMuted = true;
  ambientVideo.loop = true;
  ambientVideo.playsInline = true;
  ambientVideo.preload = "none";
  ambientVideo.setAttribute("muted", "");
  ambientVideo.setAttribute("playsinline", "");
  let ambientVideoInitialized = false;
  let ambientVideoReady = false;
  let ambientBlend = 0;
  let heroLocked = false;
  let isRewinding = false;
  let rewindStartTime = 0;
  let rewindStartFrame = 0;

  function ensureAmbientVideoLoaded() {
    if (ambientVideoInitialized || useMobilePortraitSequence) return;
    ambientVideoInitialized = true;
    ambientVideo.preload = "auto";
    ambientVideo.src = "/images/lunae-sequence/lunae-ambient-hair.mp4";
    ambientVideo.load();
  }

  ambientVideo.addEventListener("loadeddata", () => {
    ambientVideoReady = true;
    redrawRequested = true;
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function setStatus(message) {
    if (!(status instanceof HTMLElement)) return;
    status.textContent = message;
    status.hidden = false;
  }

  function loadFrame(index) {
    if (index < 0 || index >= totalFrames) return Promise.resolve(null);
    if (images[index]) return Promise.resolve(images[index]);
    if (pendingLoads[index]) return pendingLoads[index];

    const frameNumber = useMobilePortraitSequence
      ? 1 +
        Math.round(
          (index * (mobilePortraitSourceFrameCount - 1)) /
            Math.max(1, totalFrames - 1),
        )
      : firstFrameNumber + index;
    const suffix = String(frameNumber).padStart(useMobilePortraitSequence ? 3 : 2, "0");
    const sourceIndex = String(
      frameNumber === 50 ? 242 : Math.round((frameNumber - 1) * ((243 - 1) / (50 - 1))),
    ).padStart(6, "0");
    const image = new Image();
    image.decoding = "async";

    const srcUrl = useMobilePortraitSequence
      ? `/images/lunae-sequence/mobile-portrait/mframe_${suffix}.webp?v=3`
      : `/images/lunae-sequence/ezgif-frame-${suffix}_${sourceIndex}.png`;
    image.src = srcUrl;

    if (image.complete && image.naturalWidth > 0) {
      images[index] = image;
      redrawRequested = true;
      updateGateBufferProgress();
      return Promise.resolve(image);
    }

    pendingLoads[index] = new Promise((resolve, reject) => {
      image.onload = () => {
        images[index] = image;
        pendingLoads[index] = null;
        redrawRequested = true;
        updateGateBufferProgress();
        resolve(image);
      };
      image.onerror = () => {
        pendingLoads[index] = null;
        const error = new Error(`Lunae frame ${suffix}_${sourceIndex} could not be loaded.`);
        console.error(error);
        setStatus(`Frame ${suffix} could not be loaded. Scroll position will remain available.`);
        reject(error);
      };
    });

    return pendingLoads[index];
  }

  function loadIntroRewindFrame(index) {
    if (index < 0 || index >= introRewindCount) return Promise.resolve(null);
    if (introRewindImages[index]) return Promise.resolve(introRewindImages[index]);
    if (introRewindPending[index]) return introRewindPending[index];

    const suffix = String(index).padStart(2, "0");
    const image = new Image();
    image.decoding = "async";

    introRewindPending[index] = new Promise((resolve) => {
      image.onload = () => {
        introRewindImages[index] = image;
        introRewindPending[index] = null;
        redrawRequested = true;
        resolve(image);
      };
      image.onerror = () => {
        introRewindPending[index] = null;
        resolve(null);
      };
      image.src = `/images/lunae-sequence/intro-rewind/intro-rev-${suffix}.jpg`;
    });

    return introRewindPending[index];
  }

  function nearestLoadedIntroRewindFrame(index) {
    const clamped = clamp(index, 0, introRewindCount - 1);
    if (introRewindImages[clamped]) return introRewindImages[clamped];
    for (let distance = 1; distance < introRewindCount; distance += 1) {
      const before = clamped - distance;
      const after = clamped + distance;
      if (before >= 0 && introRewindImages[before]) return introRewindImages[before];
      if (after < introRewindCount && introRewindImages[after]) return introRewindImages[after];
    }
    return introPosterReady ? introPoster : null;
  }

  function resizeCanvas() {
    const bounds = stage.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const maxDpr = isLowPowerMobile ? 1.5 : useMobilePortraitSequence ? 2 : 3;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxDpr);
    const pixelWidth = Math.round(width * pixelRatio);
    const pixelHeight = Math.round(height * pixelRatio);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = isLowPowerMobile ? "medium" : "high";
    canvasNeedsResize = false;
    redrawRequested = true;
  }

  function nearestLoadedFrame(index) {
    if (images[index]) return index;

    for (let distance = 1; distance < totalFrames; distance += 1) {
      const before = index - distance;
      const after = index + distance;
      if (before >= 0 && images[before]) return before;
      if (after < totalFrames && images[after]) return after;
    }

    return -1;
  }

  function drawFrame(index) {
    const image = index >= 0 ? images[index] : null;
    const hasIntroSource =
      !useMobilePortraitSequence &&
      ((introVideoReady && introVideo.readyState >= 2) || introPosterReady);
    if (!image && !hasIntroSource) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = isLowPowerMobile ? "medium" : "high";

    if (image) {
      const safeHeightRatio = useMobilePortraitSequence ? 1 : 1202 / 1280;
      const effectiveScale = Math.max(
        width / image.naturalWidth,
        height / (image.naturalHeight * safeHeightRatio),
      );

      const drawWidth = image.naturalWidth * effectiveScale;
      const drawHeight = image.naturalHeight * effectiveScale;
      const destX = (width - drawWidth) / 2;
      const destY = (height - drawHeight) / 2;

      context.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        destX,
        destY,
        drawWidth,
        drawHeight,
      );

      // Sub-frame crossfade blending on mobile for ultra-smooth scrolling between adjacent frames
      if (useMobilePortraitSequence && !isLowPowerMobile && currentFrame >= 0) {
        const baseIdx = clamp(Math.floor(currentFrame), 0, totalFrames - 1);
        const nextIdx = clamp(baseIdx + 1, 0, totalFrames - 1);
        const frac = clamp(currentFrame - baseIdx, 0, 1);
        const nextImg = images[nextIdx];
        if (baseIdx === index && nextIdx !== baseIdx && nextImg && frac > 0.02 && frac < 0.98) {
          context.save();
          context.globalAlpha = frac;
          context.drawImage(
            nextImg,
            0,
            0,
            nextImg.naturalWidth,
            nextImg.naturalHeight,
            destX,
            destY,
            drawWidth,
            drawHeight,
          );
          context.restore();
        }
      }

      // 3. Seamless ambient hair/wind video overlay when user reaches the end of the scroll
      if (ambientBlend > 0.005 && ambientVideoReady && ambientVideo.readyState >= 2) {
        // Exact spatial alignment: the 1440x608 video corresponds to y=[39..1241] (height 1202) inside the 2848x1280 frame
        const videoDestX = destX;
        const videoDestY = destY + (39 / 1280) * drawHeight;
        const videoDestW = drawWidth;
        const videoDestH = (1202 / 1280) * drawHeight;

        context.save();
        context.globalAlpha = clamp(ambientBlend, 0, 1);
        context.drawImage(
          ambientVideo,
          0,
          0,
          ambientVideo.videoWidth || 1440,
          ambientVideo.videoHeight || 608,
          videoDestX,
          videoDestY,
          videoDestW,
          videoDestH,
        );
        context.restore();
      }
    }

    // 4. Intro closed-to-open eye video overlay at the start of the experience
    if (introBlend > 0.005 && !heroLocked && !introDismissedByScroll && hasIntroSource) {
      const introSource =
        introVideoReady && introVideo.readyState >= 2 ? introVideo : introPoster;
      const srcW =
        introSource === introVideo
          ? introVideo.videoWidth || 1280
          : introPoster.naturalWidth || 1280;
      const srcH =
        introSource === introVideo
          ? introVideo.videoHeight || 570
          : introPoster.naturalHeight || 570;

      const introCoverScale = Math.max(width / srcW, height / srcH);
      const introDrawW = srcW * introCoverScale;
      const introDrawH = srcH * introCoverScale;
      const introDestX = (width - introDrawW) / 2;
      const introDestY = (height - introDrawH) / 2;

      context.save();
      context.globalAlpha = image ? clamp(introBlend, 0, 1) : 1;
      context.drawImage(
        introSource,
        0,
        0,
        srcW,
        srcH,
        introDestX,
        introDestY,
        introDrawW,
        introDrawH,
      );
      context.restore();
    }

    // 5. Reverse intro sequence during Watch Film rewind (smoothly pulls out of the pupil and closes the eye)
    if (isRewinding && currentFrame < 0.85) {
      const rewindAlpha = image ? 1 - smoothstep(-0.75, 0.85, currentFrame) : 1;
      const introIdx = clamp(
        Math.round(currentFrame + introRewindCount),
        0,
        introRewindCount - 1,
      );
      const rewindImg = nearestLoadedIntroRewindFrame(introIdx);
      if (rewindImg && rewindAlpha > 0.005) {
        const srcW = rewindImg.naturalWidth || 1280;
        const srcH = rewindImg.naturalHeight || 570;
        const revScale = Math.max(width / srcW, height / srcH);
        const revW = srcW * revScale;
        const revH = srcH * revScale;
        const revX = (width - revW) / 2;
        const revY = (height - revH) / 2;

        context.save();
        context.globalAlpha = clamp(rewindAlpha, 0, 1);
        context.drawImage(rewindImg, 0, 0, srcW, srcH, revX, revY, revW, revH);
        context.restore();
      }
    }

    if (frameCount instanceof HTMLElement) {
      if (isRewinding && currentFrame < 0) {
        const mappedIntroNum = clamp(
          Math.ceil(((currentFrame + introRewindCount) / introRewindCount) * (firstFrameNumber - 1)),
          1,
          firstFrameNumber - 1,
        );
        frameCount.textContent = `${String(mappedIntroNum).padStart(2, "0")} / ${lastFrameNumber}`;
      } else if (index >= 0) {
        if (useMobilePortraitSequence) {
          const mapped50 = clamp(
            Math.round(50 - (index / Math.max(1, totalFrames - 1)) * 49),
            1,
            50,
          );
          frameCount.textContent = `${String(mapped50).padStart(2, "0")} / 50`;
        } else {
          frameCount.textContent = `${String(firstFrameNumber + index).padStart(2, "0")} / ${lastFrameNumber}`;
        }
      }
    }
    lastRenderedFrame = index;
    redrawRequested = false;
  }

  function applyRevealTransform(element, progress, offsetX = 0, offsetY = 24, scaleFrom = 0.98) {
    if (!(element instanceof HTMLElement)) return;
    const tx = (1 - progress) * offsetX;
    const ty = (1 - progress) * offsetY;
    const sc = scaleFrom + (1 - scaleFrom) * progress;
    element.style.opacity = progress.toFixed(3);
    element.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    element.style.pointerEvents = progress > 0.45 ? "auto" : "none";
  }

  let lastChoreographyProgress = -1;
  let isHeroInViewport = true;
  if ("IntersectionObserver" in window) {
    const heroVisObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroInViewport = entry.isIntersecting;
        });
      },
      { threshold: 0.01 },
    );
    heroVisObserver.observe(sequence);
  }

  function updateChoreography(progress, timeMs, reducedMotion) {
    const p = reducedMotion ? (progress > 0.1 ? 1 : progress) : progress;
    const progressChanged = Math.abs(p - lastChoreographyProgress) > 0.0005;

    if (progressChanged) {
      lastChoreographyProgress = p;

      // 1. Intro cue fades out as camera leaves the eye (0% -> 24%)
      if (introCue instanceof HTMLElement) {
        const cueAlpha = 1 - smoothstep(0.06, 0.24, p);
        introCue.style.opacity = cueAlpha.toFixed(3);
        introCue.style.transform = `translate3d(-50%, ${((1 - cueAlpha) * 14).toFixed(1)}px, 0)`;
      }

      // 2. Soft pastel tint grows only after the bright lilac scene settles (78% -> 92%)
      if (tintLayer instanceof HTMLElement) {
        const tintAlpha = smoothstep(0.78, 0.92, p);
        tintLayer.style.setProperty("--tint-opacity", tintAlpha.toFixed(3));
      }

      // 3. Synchronized ultra-smooth reveal starting once the bright backdrop is completely clear (Frame 40 / 78% -> 92%)
      const syncReveal = smoothstep(0.78, 0.92, p);
      applyRevealTransform(revealItems.brand, syncReveal, -12, -10, 0.985);
      applyRevealTransform(revealItems.eyebrow, syncReveal, -14, 14, 0.985);
      applyRevealTransform(revealItems.headline, syncReveal, -18, 18, 0.98);
      applyRevealTransform(revealItems.description, syncReveal, -14, 16, 0.985);
      applyRevealTransform(revealItems.actions, syncReveal, -12, 16, 0.985);
      applyRevealTransform(revealItems.stats, syncReveal, 0, 18, 0.985);

      // 5. Right column 4 glass cards synchronized reveal + live telemetry (78% -> 92%)
      revealCards.forEach((card) => {
        applyRevealTransform(card, syncReveal, 20, 14, 0.975);
      });

      // Live counters inside cards
      const telemetryProgress = syncReveal;
      cardNumbers.forEach((el) => {
        const target = Number(el.getAttribute("data-card-number") || 0);
        const suffix = el.getAttribute("data-card-suffix") || "";
        const currentVal = Math.round(target * telemetryProgress);
        el.textContent = `${currentVal}${suffix}`;
      });

      // Bottom stats counters
      const statsProgress = syncReveal;
      statCounters.forEach((el) => {
        const target = Number(el.getAttribute("data-stat-counter") || 0);
        const suffix = el.getAttribute("data-stat-suffix") || "";
        el.textContent = `${Math.max(1, Math.round(target * statsProgress))}${suffix}`;
      });
      statDecimals.forEach((el) => {
        const target = Number(el.getAttribute("data-stat-decimal") || 99.9);
        const suffix = el.getAttribute("data-stat-suffix") || "%";
        const val = (target * statsProgress).toFixed(1);
        el.textContent = `${val}${suffix}`;
      });

      // Card 3 Donut ring fill (circumference = 207.35, 78% = dashoffset 45.6)
      if (focusRing instanceof SVGCircleElement) {
        const circumference = 207.35;
        const targetRatio = 0.78 * telemetryProgress;
        const offset = circumference * (1 - targetRatio);
        focusRing.style.strokeDashoffset = offset.toFixed(2);
      }
    }

    const syncReveal = smoothstep(0.78, 0.92, p);
    const telemetryProgress = syncReveal;

    // Card 4 Beta bar fill + subtle live oscillation
    if (betaBar instanceof HTMLElement) {
      const pulse = reducedMotion ? 0 : Math.sin(timeMs * 0.004) * 0.05 * telemetryProgress;
      const scaleX = clamp(telemetryProgress + pulse, 0.08, 1);
      betaBar.style.transform = `scaleX(${scaleX.toFixed(3)})`;
    }

    // Card 2 Wave subtle living motion
    if (!reducedMotion && waveLine instanceof SVGPathElement && waveArea instanceof SVGPathElement && telemetryProgress > 0.05) {
      const phase = timeMs * 0.0032;
      const y1 = (32 + Math.sin(phase) * 4).toFixed(1);
      const y2 = (39 + Math.cos(phase * 0.9) * 4).toFixed(1);
      const y3 = (28 + Math.sin(phase * 1.2 + 1) * 5).toFixed(1);
      const y4 = (14 + Math.cos(phase * 1.1 + 2) * 3.5).toFixed(1);
      const y5 = (34 + Math.sin(phase * 0.85 + 3) * 4).toFixed(1);
      const lineD = `M2 46 C 16 ${y1}, 24 27, 36 33 C 48 ${y2}, 55 43, 66 35 C 76 ${y3}, 82 47, 94 40 C 106 33, 112 12, 122 ${y4} C 132 16, 138 42, 149 ${y5} C 158 27, 165 36, 173 43`;
      waveLine.setAttribute("d", lineD);
      waveArea.setAttribute("d", `${lineD} L 173 64 L 2 64 Z`);
    }
  }

  function lockHeroAtEnd() {
    if (heroLocked || isRewinding) return;
    heroLocked = true;
    isAutoPlayingSequence = false;
    isIntroPlaying = false;
    sequence.classList.add("is-hero-locked");
    document.body.classList.remove("is-intro-locked");
    document.body.classList.remove("is-lunae-header-hidden");
    markHeroSeenInSession();
    ensureAmbientVideoLoaded();
    targetFrame = totalFrames - 1;
    currentFrame = totalFrames - 1;
    redrawRequested = true;
  }

  function startWatchFilmRewind() {
    if (isRewinding || isGateOpen) return;
    ensureIntroAssetsLoaded();
    ensureAmbientVideoLoaded();
    isRewinding = true;
    isAutoPlayingSequence = false;
    heroLocked = false;
    sequence.classList.add("is-hero-locked");
    document.body.classList.add("is-intro-locked");
    if (introCueText instanceof HTMLElement) {
      introCueText.textContent = "REWINDING WEEXEY VISION...";
    }

    for (let i = 0; i < totalFrames; i += 1) {
      loadFrame(i).catch(() => {});
    }
    if (!useMobilePortraitSequence) {
      for (let i = 0; i < introRewindCount; i += 1) {
        loadIntroRewindFrame(i).catch(() => {});
      }
    }

    if (!ambientVideo.paused) {
      ambientVideo.pause();
    }
    rewindStartFrame = currentFrame;
    rewindStartTime = performance.now();
    window.scrollTo({ top: 0, behavior: "instant" });
    redrawRequested = true;
  }

  function updateTargetFromScroll() {
    if (isRewinding || isAutoPlayingSequence || isGateOpen) return;
    if (isIntroPlaying) {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      targetFrame = 0;
      return;
    }
    if (heroLocked) {
      targetFrame = totalFrames - 1;
      return;
    }
  }

  function animate(timeMs = 0) {
    requestAnimationFrame(animate);
    if (
      isLowPowerMobile &&
      lastAnimTimeMs > 0 &&
      timeMs - lastAnimTimeMs < 1000 / 30
    ) {
      return;
    }

    // Pause heavy canvas/video/SVG work when hero is scrolled completely out of view
    if (heroLocked && !isHeroInViewport && !isRewinding && !isIntroPlaying && !isAutoPlayingSequence) {
      if (!ambientVideo.paused) {
        ambientVideo.pause();
      }
      return;
    }

    const dtMs = lastAnimTimeMs > 0 ? clamp(timeMs - lastAnimTimeMs, 4, 50) : 16.67;
    lastAnimTimeMs = timeMs;

    if (canvasNeedsResize) resizeCanvas();
    if (scrollNeedsUpdate) {
      scrollNeedsUpdate = false;
      updateTargetFromScroll();
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isRewinding) {
      const rewindDuration = reducedMotion ? 300 : 1850;
      const closedHoldDuration = reducedMotion ? 100 : 500;
      const rewindEndFrame = useMobilePortraitSequence ? 0 : -introRewindCount;
      const elapsed = Math.max(0, performance.now() - rewindStartTime);
      const t = clamp(elapsed / rewindDuration, 0, 1);
      // Cubic ease-in-out across both scroll frames (50 -> 07) and reverse intro frames (07 -> closed eye)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      currentFrame = rewindStartFrame + (rewindEndFrame - rewindStartFrame) * ease;
      targetFrame = currentFrame;
      redrawRequested = true;

      if (elapsed >= rewindDuration + closedHoldDuration) {
        currentFrame = 0;
        targetFrame = 0;
        isRewinding = false;
        ambientVideo.currentTime = 0;
        window.scrollTo({ top: 0, behavior: "instant" });
        startIntroVideoPlayback();
      }
    } else if (isGateOpen) {
      targetFrame = 0;
      currentFrame = 0;
      redrawRequested = true;
    } else if (isIntroPlaying) {
      targetFrame = 0;
      currentFrame = 0;
      redrawRequested = true;
    } else if (isAutoPlayingSequence) {
      const autoDuration = reducedMotion ? 250 : useMobilePortraitSequence ? 2350 : 2550;
      const elapsed = Math.max(0, performance.now() - autoPlayStartTime);
      const t = clamp(elapsed / autoDuration, 0, 1);
      // Smooth cinematic ease-in-out pull-back through the eye sequence
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const nextFrame = autoPlayStartFrame + (totalFrames - 1 - autoPlayStartFrame) * ease;
      currentFrame = nextFrame;
      targetFrame = nextFrame;
      redrawRequested = true;

      const lookAheadBase = Math.round(nextFrame);
      for (let ahead = 0; ahead <= 4; ahead += 1) {
        loadFrame(lookAheadBase + ahead).catch(() => {});
      }

      if (t >= 1) {
        lockHeroAtEnd();
      }
    } else if (heroLocked) {
      targetFrame = totalFrames - 1;
      currentFrame = totalFrames - 1;
    } else if (reducedMotion) {
      currentFrame = targetFrame;
    } else {
      const smoothingRate = useMobilePortraitSequence ? 0.24 : 0.16;
      const alpha = 1 - Math.pow(1 - smoothingRate, dtMs / 16.667);
      const prevFrame = currentFrame;
      currentFrame += (targetFrame - currentFrame) * alpha;
      if (Math.abs(targetFrame - currentFrame) < 0.008) currentFrame = targetFrame;
      if (useMobilePortraitSequence && Math.abs(currentFrame - prevFrame) > 0.004) {
        redrawRequested = true;
      }
      // Also lock if smoothed frame reaches the ambient video threshold
      if (currentFrame >= (totalFrames - 1) * 0.965 && targetFrame >= (totalFrames - 1) * 0.96) {
        lockHeroAtEnd();
      }
    }

    if (currentFrame > 1.4 && !isIntroPlaying && !isRewinding) {
      introDismissedByScroll = true;
    }

    // Smooth blend from the intro video into the automatic pull-back sequence
    const targetIntroBlend = reducedMotion
      ? 0
      : isIntroPlaying || isGateOpen
        ? 1
        : introDismissedByScroll || isRewinding
          ? 0
          : 1 - smoothstep(0.0, 1.4, currentFrame);
    introBlend += (targetIntroBlend - introBlend) * 0.18;
    if (Math.abs(targetIntroBlend - introBlend) < 0.004) {
      introBlend = targetIntroBlend;
    }
    if (introBlend > 0.005) {
      redrawRequested = true;
    }

    const normalizedProgress = clamp(currentFrame / Math.max(1, totalFrames - 1), 0, 1);
    updateChoreography(normalizedProgress, timeMs, reducedMotion);

    const shouldShowStoreHeader =
      !isGateOpen &&
      !isIntroPlaying &&
      !isRewinding &&
      (heroLocked || normalizedProgress >= 0.82);
    document.body.classList.toggle("is-lunae-header-hidden", !shouldShowStoreHeader);

    // Seamless transition into the living hair/wind video at the end of scroll (96.5% -> 100%)
    const targetAmbientBlend =
      !useMobilePortraitSequence && !reducedMotion && ambientVideoReady && !isRewinding
        ? heroLocked
          ? 1
          : smoothstep(0.965, 0.996, normalizedProgress)
        : 0;
    ambientBlend += (targetAmbientBlend - ambientBlend) * 0.14;
    if (Math.abs(targetAmbientBlend - ambientBlend) < 0.004) {
      ambientBlend = targetAmbientBlend;
    }

    if (ambientBlend > 0.01 && ambientVideoReady && !isRewinding) {
      if (ambientVideo.paused) {
        ambientVideo.play().catch(() => {});
      }
      redrawRequested = true;
    } else if (!ambientVideo.paused && (ambientBlend <= 0.005 || isRewinding)) {
      ambientVideo.pause();
      ambientVideo.currentTime = 0;
    }

    const requestedFrame = clamp(
      useMobilePortraitSequence ? Math.floor(currentFrame) : Math.round(currentFrame),
      0,
      totalFrames - 1,
    );
    const drawableFrame = nearestLoadedFrame(requestedFrame);
    if ((drawableFrame >= 0 || introPosterReady || introVideoReady) && (drawableFrame !== lastRenderedFrame || redrawRequested)) {
      drawFrame(drawableFrame);
    }
  }

  function handleScroll() {
    scrollNeedsUpdate = true;
  }

  if (replayBtn instanceof HTMLElement) {
    replayBtn.addEventListener("click", () => {
      startWatchFilmRewind();
    });
  }

  function scheduleProgressivePreload(index) {
    const maxPreloadCount = useMobilePortraitSequence
      ? isLowPowerMobile
        ? isDataSaver
          ? 0
          : Math.min(6, totalFrames)
        : totalFrames
      : totalFrames + introRewindCount;
    if (index >= maxPreloadCount) return;

    const batchSize = isLowPowerMobile ? 1 : useMobilePortraitSequence ? 4 : 1;
    const delayMs = isLowPowerMobile ? 80 : useMobilePortraitSequence ? 8 : 35;

    const loadNext = () => {
      if (document.hidden) {
        window.setTimeout(() => scheduleProgressivePreload(index), 300);
        return;
      }

      const tasks = [];
      for (let b = 0; b < batchSize && index + b < maxPreloadCount; b += 1) {
        const cur = index + b;
        tasks.push(
          cur < totalFrames
            ? loadFrame(cur)
            : loadIntroRewindFrame(cur - totalFrames),
        );
      }

      Promise.allSettled(tasks).finally(() =>
        window.setTimeout(() => scheduleProgressivePreload(index + batchSize), delayMs),
      );
    };

    if (!useMobilePortraitSequence && "requestIdleCallback" in window) {
      window.requestIdleCallback(loadNext, { timeout: 1000 });
    } else {
      window.setTimeout(loadNext, delayMs);
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    canvasNeedsResize = true;
    scrollNeedsUpdate = true;
  });
  resizeObserver.observe(stage);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => {
    canvasNeedsResize = true;
    scrollNeedsUpdate = true;
  }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      canvasNeedsResize = true;
      scrollNeedsUpdate = true;
    }, { passive: true });
  }

  const DEFAULT_HERO_COPY = {
    show_stats: true,
    copy: {
      pill_badge: {
        en: "AI-Powered Flagship",
        ar: "رائد بالذكاء الاصطناعي",
        fr: "Fleuron propulsé par l’IA",
        es: "Insignia con IA",
        zh: "AI 驱动旗舰",
      },
      eyebrow_sub: {
        en: "Real-time intelligence. Smarter devices.",
        ar: "ذكاء فوري. أجهزة أكثر تطورًا.",
        fr: "Intelligence en temps réel. Appareils plus intelligents.",
        es: "Inteligencia en tiempo real. Dispositivos más inteligentes.",
        zh: "实时智能 · 更聪明的设备。",
      },
      headline_line1: {
        en: "Visualize",
        ar: "تخيّل",
        fr: "Visualisez",
        es: "Visualiza",
        zh: "洞见",
      },
      headline_line2: {
        en: "Your Tech",
        ar: "تقنيتك",
        fr: "Votre Tech",
        es: "Tu Tecnología",
        zh: "未来科技",
      },
      headline_gradient: {
        en: "in Motion",
        ar: "بكل حركة",
        fr: "en Mouvement",
        es: "en Movimiento",
        zh: "灵动呈现",
      },
      description: {
        en: "WEEXEY brings flagship performance, neural audio, and precision optics into a living visual experience — crafted for a smarter tomorrow.",
        ar: "تجمع WEEXEY بين الأداء الرائد والصوت الذكي والبصريات الدقيقة في تجربة بصرية حية — صُممت لغدٍ أذكى.",
        fr: "WEEXEY réunit performances de pointe, audio neuronal et optique de précision dans une expérience visuelle vivante.",
        es: "WEEXEY combina rendimiento insignia, audio neuronal y óptica de precisión en una experiencia visual viva.",
        zh: "WEEXEY 将旗舰性能、神经音频与精密光学融为鲜活的视觉体验，只为更智慧的明天。",
      },
      primary_btn_text: {
        en: "Explore Store",
        ar: "استكشف المتجر",
        fr: "Explorer la boutique",
        es: "Explorar tienda",
        zh: "探索商城",
      },
      primary_btn_href: "/products.html",
    },
    stats: [
      {
        value: 10,
        suffix: "K+",
        label: {
          en: "Active Users",
          ar: "مستخدم نشط",
          fr: "Utilisateurs actifs",
          es: "Usuarios activos",
          zh: "活跃用户",
        },
      },
      {
        value: 99.9,
        suffix: "%",
        label: {
          en: "Uptime",
          ar: "جاهزية الخدمة",
          fr: "Disponibilité",
          es: "Disponibilidad",
          zh: "稳定运行",
        },
      },
      {
        value: 150,
        suffix: "+",
        label: {
          en: "Countries",
          ar: "دولة حول العالم",
          fr: "Pays couverts",
          es: "Países",
          zh: "覆盖国家",
        },
      },
    ],
  };

  function applyCustomHeroConfig() {
    const customCfg = readCustomHeroData();
    const cfg = customCfg && typeof customCfg === "object" ? customCfg : DEFAULT_HERO_COPY;
    const lang = String(
      window.NoursStore?.getLanguage?.() || document.documentElement.lang || "en",
    )
      .toLowerCase()
      .split("-")[0];
    const pick = (map, fallbackMap) =>
      String(map?.[lang] || map?.en || fallbackMap?.[lang] || fallbackMap?.en || "").trim();

    const copySource = cfg.copy && typeof cfg.copy === "object" ? cfg.copy : DEFAULT_HERO_COPY.copy;
    if (copySource) {
      const pillBadgeNode = sequence.querySelector(".wx-pill-badge");
      if (pillBadgeNode) {
        const dot = pillBadgeNode.querySelector(".wx-pill-dot");
        const val = pick(copySource.pill_badge, DEFAULT_HERO_COPY.copy.pill_badge);
        if (val) {
          pillBadgeNode.replaceChildren();
          if (dot) pillBadgeNode.append(dot, document.createTextNode(` ${val}`));
          else pillBadgeNode.textContent = val;
        }
      }
      const subNode = sequence.querySelector(".wx-eyebrow-sub");
      if (subNode && pick(copySource.eyebrow_sub, DEFAULT_HERO_COPY.copy.eyebrow_sub)) {
        subNode.textContent = pick(copySource.eyebrow_sub, DEFAULT_HERO_COPY.copy.eyebrow_sub);
      }
      const darkSpans = sequence.querySelectorAll(".wx-headline .wx-headline__dark");
      if (darkSpans[0] && pick(copySource.headline_line1, DEFAULT_HERO_COPY.copy.headline_line1)) {
        darkSpans[0].textContent = pick(copySource.headline_line1, DEFAULT_HERO_COPY.copy.headline_line1);
      }
      if (darkSpans[1] && pick(copySource.headline_line2, DEFAULT_HERO_COPY.copy.headline_line2)) {
        darkSpans[1].textContent = pick(copySource.headline_line2, DEFAULT_HERO_COPY.copy.headline_line2);
      }
      const gradSpan = sequence.querySelector(".wx-headline .wx-headline__gradient");
      if (gradSpan && pick(copySource.headline_gradient, DEFAULT_HERO_COPY.copy.headline_gradient)) {
        gradSpan.textContent = pick(copySource.headline_gradient, DEFAULT_HERO_COPY.copy.headline_gradient);
      }
      const descNode = sequence.querySelector(".wx-description");
      if (descNode && pick(copySource.description, DEFAULT_HERO_COPY.copy.description)) {
        descNode.textContent = pick(copySource.description, DEFAULT_HERO_COPY.copy.description);
      }
      const primaryBtn = sequence.querySelector(".wx-btn-primary");
      if (primaryBtn) {
        const span = primaryBtn.querySelector("span");
        if (span && pick(copySource.primary_btn_text, DEFAULT_HERO_COPY.copy.primary_btn_text)) {
          span.textContent = pick(copySource.primary_btn_text, DEFAULT_HERO_COPY.copy.primary_btn_text);
        }
        if (copySource.primary_btn_href) {
          primaryBtn.setAttribute("href", copySource.primary_btn_href);
        }
      }
    }

    const statsBar = sequence.querySelector(".wx-stats-bar");
    if (statsBar) {
      statsBar.hidden = cfg.show_stats === false;
      if (cfg.show_stats === false) statsBar.style.display = "none";
      else statsBar.style.removeProperty("display");
      const statsSource = Array.isArray(cfg.stats) ? cfg.stats : DEFAULT_HERO_COPY.stats;
      if (Array.isArray(statsSource)) {
        const statItems = statsBar.querySelectorAll(".wx-stat-item");
        statsSource.forEach((st, idx) => {
          const itemEl = statItems[idx];
          if (!itemEl || !st) return;
          const valContainer = itemEl.querySelector(".wx-stat-value span");
          const labelEl = itemEl.querySelector(".wx-stat-label");
          if (valContainer && Number.isFinite(Number(st.value))) {
            const num = Number(st.value);
            const suffix = String(st.suffix ?? "");
            if (valContainer.hasAttribute("data-stat-decimal")) {
              valContainer.setAttribute("data-stat-decimal", String(num));
            } else {
              valContainer.setAttribute("data-stat-counter", String(num));
            }
            valContainer.setAttribute("data-stat-suffix", suffix);
            valContainer.textContent = `${num}${suffix}`;
          }
          const fallbackStat = DEFAULT_HERO_COPY.stats[idx];
          if (labelEl && pick(st.label, fallbackStat?.label)) {
            labelEl.textContent = pick(st.label, fallbackStat?.label);
          }
        });
      }
    }

    if (cfg.cards && typeof cfg.cards === "object") {
      const applyCard = (cardSelector, cardCfg) => {
        const cardEl = sequence.querySelector(cardSelector);
        if (!cardEl || !cardCfg) return;
        if (cardCfg.href) cardEl.setAttribute("href", cardCfg.href);
        const titleSpan =
          cardEl.querySelector(".wx-card-title [data-i18n]") ||
          cardEl.querySelector(".wx-card-title span:last-child");
        if (titleSpan && pick(cardCfg.title)) {
          titleSpan.removeAttribute("data-i18n");
          titleSpan.textContent = pick(cardCfg.title);
        }
        const labelEl = cardEl.querySelector(".wx-metric-label");
        if (labelEl && pick(cardCfg.label)) {
          labelEl.removeAttribute("data-i18n");
          labelEl.textContent = pick(cardCfg.label);
        }
        const valueEl = cardEl.querySelector(".wx-metric-value");
        if (valueEl && Number.isFinite(Number(cardCfg.number))) {
          const num = Number(cardCfg.number);
          const suffix = String(cardCfg.suffix ?? "");
          valueEl.setAttribute("data-card-number", String(num));
          valueEl.setAttribute("data-card-suffix", suffix);
          valueEl.textContent = `${num}${suffix}`;
        }
        const subEl = cardEl.querySelector(".wx-card-subnote");
        if (subEl && pick(cardCfg.sub)) {
          subEl.removeAttribute("data-i18n");
          subEl.textContent = pick(cardCfg.sub);
        }
      };
      applyCard('[data-reveal-card="0"]', cfg.cards.card1);
      applyCard('[data-reveal-card="1"]', cfg.cards.card2);

      const card3El = sequence.querySelector('[data-reveal-card="2"]');
      if (card3El && cfg.cards.card3) {
        const title3 = card3El.querySelector("[data-wx-featured-title]");
        if (title3 && pick(cfg.cards.card3.title)) {
          title3.removeAttribute("data-i18n");
          title3.textContent = pick(cfg.cards.card3.title);
        }
        const badge3 = card3El.querySelector("[data-wx-featured-badge]");
        if (badge3 && pick(cfg.cards.card3.badge)) {
          badge3.removeAttribute("data-i18n");
          badge3.textContent = pick(cfg.cards.card3.badge);
        }
      }
    }

    const norm = clamp(currentFrame / Math.max(1, totalFrames - 1), 0, 1);
    updateChoreography(norm, performance.now(), window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function applyCustomHelloPageConfig() {
    if (!(langGate instanceof HTMLElement)) return;
    const cfg = readCustomHelloPageData();
    if (!cfg || typeof cfg !== "object") return;

    const currentLang = selectedGateLang || window.NoursStore?.getLanguage?.() || "en";
    const pick = (map) => {
      if (!map || typeof map !== "object") return "";
      return String(map[currentLang] || map.en || "").trim();
    };

    // Logos
    const logoUrl = String(cfg.logo_url || "/images/new/li.png").trim() || "/images/new/li.png";
    const showLogo = cfg.show_logo !== false;
    const desktopLogoImg = langGate.querySelector(".wx-gate-brand__logo");
    const mobileLogoWrap = langGate.querySelector(".wx-gate-mobile-logo");
    const mobileLogoImg = langGate.querySelector(".wx-gate-mobile-logo img");
    const topbarEl = langGate.querySelector(".wx-gate-topbar");
    if (desktopLogoImg instanceof HTMLImageElement) desktopLogoImg.src = logoUrl;
    if (mobileLogoImg instanceof HTMLImageElement) mobileLogoImg.src = logoUrl;
    if (mobileLogoWrap instanceof HTMLElement) mobileLogoWrap.hidden = !showLogo;
    if (topbarEl instanceof HTMLElement) topbarEl.hidden = !showLogo;

    // Main Copy & Slide CTA
    if (cfg.copy && typeof cfg.copy === "object") {
      const titleEl = langGate.querySelector(".wx-gate-title");
      const titleVal = pick(cfg.copy.title);
      if (titleEl instanceof HTMLElement && titleVal) {
        titleEl.textContent = titleVal;
      }
      const subVal = pick(cfg.copy.subtitle);
      if (langGateStatus instanceof HTMLElement && subVal && !gatePendingLang) {
        langGateStatus.textContent = subVal;
      }
      const slideSpan = langGate.querySelector(".wx-gate-slide-thumb span");
      const slideVal = pick(cfg.copy.slide_btn_text);
      if (slideSpan instanceof HTMLElement && slideVal) {
        slideSpan.textContent = slideVal;
      }
      if (langGateDesktopStartLabel instanceof HTMLElement && slideVal) {
        langGateDesktopStartLabel.textContent = slideVal;
      }
    }

    // Pickers visibility
    const currPicker = langGate.querySelector(".wx-gate-currency-picker");
    const langPicker = langGate.querySelector(".wx-gate-language-picker");
    const showCurr = cfg.show_currency_picker !== false;
    const showLang = cfg.show_language_picker !== false;
    if (currPicker instanceof HTMLElement) currPicker.hidden = !showCurr;
    if (langPicker instanceof HTMLElement) langPicker.hidden = !showLang;

    // Mobile section
    if (cfg.mobile && typeof cfg.mobile === "object") {
      const modelImg = langGate.querySelector(".wx-gate-mobile-model");
      if (modelImg instanceof HTMLImageElement && cfg.mobile.model_image_url) {
        modelImg.src = String(cfg.mobile.model_image_url).trim();
      }
      const outlineWrap = langGate.querySelector(".wx-gate-mobile-outline-word");
      if (outlineWrap instanceof HTMLElement) {
        outlineWrap.hidden = cfg.mobile.show_outline_word === false;
        const scalePct = Number.isFinite(Number(cfg.mobile.outline_scale))
          ? Math.min(180, Math.max(40, Number(cfg.mobile.outline_scale)))
          : 100;
        const posX = Number.isFinite(Number(cfg.mobile.outline_pos_x))
          ? Math.min(90, Math.max(10, Number(cfg.mobile.outline_pos_x)))
          : 50;
        const posY = Number.isFinite(Number(cfg.mobile.outline_pos_y))
          ? Math.min(92, Math.max(10, Number(cfg.mobile.outline_pos_y)))
          : 72;
        outlineWrap.style.setProperty("--wx-outline-scale", String(scalePct / 100));
        outlineWrap.style.setProperty("--wx-outline-x", `${posX}%`);
        outlineWrap.style.setProperty("--wx-outline-y", `${posY}%`);
        const spans = outlineWrap.querySelectorAll("span");
        if (spans[0] && cfg.mobile.outline_line1 !== undefined) {
          spans[0].textContent = String(cfg.mobile.outline_line1);
        }
        if (spans[1] && cfg.mobile.outline_line2 !== undefined) {
          spans[1].textContent = String(cfg.mobile.outline_line2);
        }
      }
      const stripesEl = langGate.querySelector(".wx-gate-mobile-bg-stripes");
      if (stripesEl instanceof HTMLElement) {
        stripesEl.hidden = cfg.mobile.show_stripes === false;
      }
    }

    // Desktop section
    if (cfg.desktop && typeof cfg.desktop === "object") {
      if (langGateVideo instanceof HTMLVideoElement) {
        const nextPoster = String(cfg.desktop.crystal_poster_url || "").trim();
        if (nextPoster) langGateVideo.poster = nextPoster;
        const nextVideo = String(cfg.desktop.crystal_video_url || "").trim();
        if (nextVideo && langGateVideo.getAttribute("src") !== nextVideo) {
          langGateVideo.setAttribute("src", nextVideo);
          langGateVideo.load();
          if (isGateOpen) langGateVideo.play().catch(() => {});
        }
      }

      const cards = cfg.desktop.cards;
      if (cards && typeof cards === "object") {
        // Card 1: Top-Left
        const c1El = langGate.querySelector(".wx-gate-float-card--top-left");
        if (c1El instanceof HTMLElement && cards.card1) {
          c1El.hidden = cards.card1.visible === false;
          const nums = c1El.querySelectorAll(".wx-gate-stat-num");
          const lbls = c1El.querySelectorAll(".wx-gate-stat-lbl");
          const badges = c1El.querySelectorAll(".wx-gate-badge");
          const vss = c1El.querySelectorAll(".wx-gate-stat-vs");
          if (nums[0] && cards.card1.num1) nums[0].textContent = String(cards.card1.num1);
          if (lbls[0] && pick(cards.card1.label1)) lbls[0].textContent = pick(cards.card1.label1);
          if (badges[0] && cards.card1.badge1) badges[0].textContent = String(cards.card1.badge1);
          if (nums[1] && cards.card1.num2) nums[1].textContent = String(cards.card1.num2);
          if (lbls[1] && pick(cards.card1.label2)) lbls[1].textContent = pick(cards.card1.label2);
          if (badges[1] && cards.card1.badge2) badges[1].textContent = String(cards.card1.badge2);
          const vsText = pick(cards.card1.vs_text);
          if (vsText) vss.forEach((el) => { el.textContent = vsText; });
        }

        // Card 2: Bottom-Left
        const c2El = langGate.querySelector(".wx-gate-float-card--bottom-left");
        if (c2El instanceof HTMLElement && cards.card2) {
          c2El.hidden = cards.card2.visible === false;
          const lbl = c2El.querySelector(".wx-gate-goal-label");
          const val = c2El.querySelector(".wx-gate-goal-val");
          const bdg = c2El.querySelector(".wx-gate-badge");
          if (lbl && pick(cards.card2.label)) lbl.textContent = pick(cards.card2.label);
          if (val && cards.card2.value) val.textContent = String(cards.card2.value);
          if (bdg && cards.card2.badge) bdg.textContent = String(cards.card2.badge);
        }

        // Card 3: Top-Right
        const c3El = langGate.querySelector(".wx-gate-float-card--top-right");
        if (c3El instanceof HTMLElement && cards.card3) {
          c3El.hidden = cards.card3.visible === false;
          const pill = c3El.querySelector(".wx-gate-chart-pill");
          if (pill && pick(cards.card3.pill)) pill.textContent = pick(cards.card3.pill);
          const barEls = c3El.querySelectorAll(".wx-gate-bar");
          if (Array.isArray(cards.card3.bars)) {
            cards.card3.bars.forEach((b, idx) => {
              const barEl = barEls[idx];
              if (!barEl || !b) return;
              const pctEl = barEl.querySelector(".wx-gate-bar__pct");
              const numEl = barEl.querySelector(".wx-gate-bar__num");
              if (pctEl && b.pct) pctEl.textContent = String(b.pct);
              if (numEl && b.num) numEl.textContent = String(b.num);
            });
          }
        }

        // Card 4: Bottom-Right
        const c4El = langGate.querySelector(".wx-gate-float-card--bottom-right");
        if (c4El instanceof HTMLElement && cards.card4) {
          c4El.hidden = cards.card4.visible === false;
          const title = c4El.querySelector(".wx-gate-growth-title");
          const val = c4El.querySelector(".wx-gate-growth-val");
          const sub = c4El.querySelector(".wx-gate-growth-sub");
          if (title && pick(cards.card4.title)) title.textContent = pick(cards.card4.title);
          if (val && cards.card4.value) val.textContent = String(cards.card4.value);
          if (sub && pick(cards.card4.sub)) sub.textContent = pick(cards.card4.sub);
        }
      }
    }
  }

  const INITIAL_BUFFER_TARGET = useMobilePortraitSequence
    ? Math.min(10, totalFrames)
    : Math.min(8, totalFrames);
  let gatePendingLang = null;
  let gateSafetyTimer = null;

  function getInitialBufferRatio() {
    let loadedCount = 0;
    for (let i = 0; i < INITIAL_BUFFER_TARGET; i += 1) {
      if (images[i]) loadedCount += 1;
    }
    const frameWeight = useMobilePortraitSequence ? 1 : 0.72;
    const videoReadyScore = useMobilePortraitSequence
      ? 1
      : introVideoReady
        ? 1
        : introPosterReady
          ? 0.55
          : 0.15;
    const ratio =
      (loadedCount / Math.max(1, INITIAL_BUFFER_TARGET)) * frameWeight +
      videoReadyScore * (1 - frameWeight);
    return clamp(ratio, 0.08, 1);
  }

  function updateGateBufferProgress() {
    if (!(langGate instanceof HTMLElement) || langGate.hidden) return;
    const ratio = getInitialBufferRatio();
    if (langGateBar instanceof HTMLElement) {
      langGateBar.style.width = `${Math.round(ratio * 100)}%`;
    }
    if (gatePendingLang && ratio >= 0.75) {
      const chosen = gatePendingLang;
      gatePendingLang = null;
      finalizeGateAndLaunch(chosen);
    }
  }

  const langGateVideo = document.querySelector("[data-wx-gate-video]");
  if (langGateVideo instanceof HTMLVideoElement) {
    langGateVideo.loop = true;
    langGateVideo.addEventListener("ended", () => {
      if (!isGateOpen) return;
      langGateVideo.currentTime = 0;
      langGateVideo.play().catch(() => {});
    });
  }

  function finalizeGateAndLaunch(chosenLang) {
    if (gateSafetyTimer) {
      window.clearTimeout(gateSafetyTimer);
      gateSafetyTimer = null;
    }
    markFirstVisitCompleted();
    window.NoursStore?.setLanguage?.(chosenLang);
    applyCustomHeroConfig();

    isGateOpen = false;
    document.documentElement.classList.remove("is-wx-gate-pending");
    document.body.classList.remove("is-wx-gate-open");

    if (langGate instanceof HTMLElement) {
      langGate.classList.add("is-closing");
      window.setTimeout(() => {
        if (langGateVideo instanceof HTMLVideoElement && !langGateVideo.paused) {
          langGateVideo.pause();
        }
        langGate.hidden = true;
        langGate.classList.remove("is-closing");
      }, 740);
    }

    startIntroVideoPlayback();
  }

  function updateLanguagePickerSelection(chosenLang, activeButton = null) {
    langGateButtons.forEach((button) => {
      const selected = button === activeButton || button.getAttribute("data-wx-gate-lang") === chosenLang;
      button.classList.toggle("is-selected", selected);
      if (button.hasAttribute("aria-pressed")) {
        button.setAttribute("aria-pressed", String(selected));
      }
    });
    const selectedButton = activeButton instanceof HTMLElement
      ? activeButton
      : langGateButtons.find((button) => button.getAttribute("data-wx-gate-lang") === chosenLang);
    if (langGateLanguageLabel instanceof HTMLElement && selectedButton instanceof HTMLElement) {
      langGateLanguageLabel.textContent = selectedButton.textContent.trim();
    }
    if (chosenLang) {
      selectedGateLang = chosenLang;
    }
  }

  function launchFromGate(chosenLang) {
    const langToUse = chosenLang || selectedGateLang || window.NoursStore?.getLanguage?.() || "en";
    const ratio = getInitialBufferRatio();
    if (ratio >= 0.65) {
      finalizeGateAndLaunch(langToUse);
      return;
    }

    gatePendingLang = langToUse;
    if (langGateStatus instanceof HTMLElement) {
      langGateStatus.textContent = "One moment... preparing your cinematic experience.";
    }
    if (gateSafetyTimer) window.clearTimeout(gateSafetyTimer);
    gateSafetyTimer = window.setTimeout(() => {
      if (gatePendingLang) {
        const lang = gatePendingLang;
        gatePendingLang = null;
        finalizeGateAndLaunch(lang);
      }
    }, 1800);
  }

  function handleGateLanguageSelection(chosenLang, btnEl) {
    if (!chosenLang) return;
    updateLanguagePickerSelection(chosenLang, btnEl);
    setLanguageMenuOpen(false);
    window.NoursStore?.setLanguage?.(chosenLang);
    applyCustomHeroConfig();
    applyCustomHelloPageConfig();
  }

  function setLanguageMenuOpen(open, restoreFocus = false) {
    if (!(langGateLanguageTrigger instanceof HTMLButtonElement) || !(langGateLanguageMenu instanceof HTMLElement)) return;
    langGateLanguageMenu.hidden = !open;
    langGateLanguageTrigger.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) langGateLanguageTrigger.focus();
  }

  function updateCurrencyPickerSelection(currency, activeButton = null) {
    langGateCurrencyButtons.forEach((button) => {
      const selected = button === activeButton || button.getAttribute("data-wx-gate-currency") === currency;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    if (langGateCurrencyLabel instanceof HTMLElement) {
      langGateCurrencyLabel.textContent = currency;
    }
    if (langGateCurrencyTrigger instanceof HTMLButtonElement) {
      langGateCurrencyTrigger.setAttribute("aria-label", `Currency: ${currency}`);
    }
  }

  function setCurrencyMenuOpen(open, restoreFocus = false) {
    if (!(langGateCurrencyTrigger instanceof HTMLButtonElement) || !(langGateCurrencyMenu instanceof HTMLElement)) return;
    langGateCurrencyMenu.hidden = !open;
    langGateCurrencyTrigger.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) langGateCurrencyTrigger.focus();
  }

  function handleGateCurrencySelection(button) {
    const currency = button.getAttribute("data-wx-gate-currency");
    if (!["USD", "EUR", "SAR"].includes(currency)) {
      console.error("Language gate: an unsupported currency was selected.");
      return;
    }
    if (typeof window.NoursStore?.setCurrency !== "function") {
      console.error("Language gate: the currency store is unavailable.");
      return;
    }
    window.NoursStore.setCurrency(currency);
    updateCurrencyPickerSelection(currency, button);
    setCurrencyMenuOpen(false);
  }

  const devGateButtons = Array.from(document.querySelectorAll("[data-wx-open-gate-dev]"));
  const defaultGateSubtitleHtml =
    langGateStatus instanceof HTMLElement ? langGateStatus.innerHTML : "";

  function openLanguageGateForPreview() {
    if (!(langGate instanceof HTMLElement)) return;
    try {
      localStorage.removeItem(FIRST_VISIT_COMPLETED_KEY);
      sessionStorage.removeItem(HERO_SEEN_SESSION_KEY);
    } catch (_) {}

    if (gateSafetyTimer) {
      window.clearTimeout(gateSafetyTimer);
      gateSafetyTimer = null;
    }

    gatePendingLang = null;
    isGateOpen = true;
    isAutoPlayingSequence = false;
    isIntroPlaying = false;
    isRewinding = false;
    heroLocked = false;
    currentFrame = 0;
    targetFrame = 0;
    introVideoEnded = false;
    introDismissedByScroll = false;
    introBlend = 1;

    if (!introVideo.paused) {
      introVideo.pause();
    }
    if (!ambientVideo.paused) {
      ambientVideo.pause();
    }
    window.scrollTo({ top: 0, behavior: "instant" });

    setLanguageMenuOpen(false);
    setCurrencyMenuOpen(false);
    if (langGateSlider instanceof HTMLElement) {
      langGateSlider.classList.remove("is-dragging");
      langGateSlider.style.setProperty("--wx-slide-x", "0px");
    }
    if (langGateStatus instanceof HTMLElement && defaultGateSubtitleHtml) {
      langGateStatus.innerHTML = defaultGateSubtitleHtml;
    }

    const activeLang = window.NoursStore?.getLanguage?.() || "en";
    updateLanguagePickerSelection(activeLang);
    updateCurrencyPickerSelection(window.NoursStore?.getCurrency?.() || "USD");
    applyCustomHelloPageConfig();

    langGate.classList.remove("is-closing");
    langGate.hidden = false;
    if (langGateVideo instanceof HTMLVideoElement) {
      langGateVideo.currentTime = 0;
      langGateVideo.play().catch(() => {});
    }
    document.documentElement.classList.add("is-wx-gate-pending");
    document.body.classList.add("is-wx-gate-open", "is-intro-locked", "is-lunae-header-hidden");

    ensureIntroAssetsLoaded();
    loadFrame(0)
      .then(() => {
        resizeCanvas();
        drawFrame(0);
      })
      .catch(() => {});
    scheduleProgressivePreload(1);
    updateGateBufferProgress();
    redrawRequested = true;
  }

  if (devGateButtons.length > 0) {
    devGateButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        openLanguageGateForPreview();
      });
    });
  }

  if (langGateButtons.length > 0) {
    langGateButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = btn.getAttribute("data-wx-gate-lang") || "en";
        handleGateLanguageSelection(chosen, btn);
      });
    });
  }

  if (langGateLanguageTrigger instanceof HTMLButtonElement) {
    langGateLanguageTrigger.addEventListener("click", () => {
      const isOpen = langGateLanguageTrigger.getAttribute("aria-expanded") === "true";
      setLanguageMenuOpen(!isOpen);
    });
  }

  if (langGateCurrencyButtons.length > 0) {
    langGateCurrencyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        handleGateCurrencySelection(button);
      });
    });
  }

  if (langGateCurrencyTrigger instanceof HTMLButtonElement) {
    langGateCurrencyTrigger.addEventListener("click", () => {
      const isOpen = langGateCurrencyTrigger.getAttribute("aria-expanded") === "true";
      setCurrencyMenuOpen(!isOpen);
    });
  }

  if (langGateDesktopStart instanceof HTMLButtonElement) {
    langGateDesktopStart.addEventListener("click", () => {
      setLanguageMenuOpen(false);
      setCurrencyMenuOpen(false);
      launchFromGate(selectedGateLang);
    });
  }

  if (langGateSlider instanceof HTMLElement && langGateThumb instanceof HTMLElement) {
    let isDraggingSlide = false;
    let slideStartX = 0;
    let currentSlideX = 0;
    let maxSlideX = 0;

    const resetSlideThumb = () => {
      isDraggingSlide = false;
      currentSlideX = 0;
      langGateSlider.classList.remove("is-dragging");
      langGateSlider.style.setProperty("--wx-slide-x", "0px");
    };

    const completeSlideLaunch = () => {
      isDraggingSlide = false;
      langGateSlider.classList.remove("is-dragging");
      const endX = Math.max(0, langGateSlider.clientWidth - langGateThumb.offsetWidth - 12);
      langGateSlider.style.setProperty("--wx-slide-x", `${endX}px`);
      setLanguageMenuOpen(false);
      setCurrencyMenuOpen(false);
      window.setTimeout(() => {
        launchFromGate(selectedGateLang);
        window.setTimeout(resetSlideThumb, 650);
      }, 150);
    };

    langGateSlider.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      isDraggingSlide = true;
      slideStartX = event.clientX - currentSlideX;
      maxSlideX = Math.max(1, langGateSlider.clientWidth - langGateThumb.offsetWidth - 12);
      langGateSlider.classList.add("is-dragging");
      try {
        langGateSlider.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    langGateSlider.addEventListener("pointermove", (event) => {
      if (!isDraggingSlide) return;
      const deltaX = event.clientX - slideStartX;
      currentSlideX = Math.min(maxSlideX, Math.max(0, deltaX));
      langGateSlider.style.setProperty("--wx-slide-x", `${currentSlideX}px`);
    });

    const finishPointerDrag = (event) => {
      if (!isDraggingSlide) return;
      try {
        if (event?.pointerId !== undefined) {
          langGateSlider.releasePointerCapture(event.pointerId);
        }
      } catch (_) {}

      if (maxSlideX > 0 && currentSlideX >= maxSlideX * 0.55) {
        completeSlideLaunch();
      } else if (Math.abs(currentSlideX) < 6) {
        // Also support quick tap on the track/thumb to animate & launch smoothly
        completeSlideLaunch();
      } else {
        resetSlideThumb();
      }
    };

    langGateSlider.addEventListener("pointerup", finishPointerDrag);
    langGateSlider.addEventListener("pointercancel", resetSlideThumb);

    langGateSlider.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        completeSlideLaunch();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (
      langGateLanguageMenu instanceof HTMLElement &&
      event.target instanceof Node &&
      !langGateLanguageMenu.contains(event.target) &&
      !(langGateLanguageTrigger instanceof HTMLElement && langGateLanguageTrigger.contains(event.target))
    ) {
      setLanguageMenuOpen(false);
    }
    if (
      langGateCurrencyMenu instanceof HTMLElement &&
      event.target instanceof Node &&
      !langGateCurrencyMenu.contains(event.target) &&
      !(langGateCurrencyTrigger instanceof HTMLElement && langGateCurrencyTrigger.contains(event.target))
    ) {
      setCurrencyMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && langGateLanguageTrigger?.getAttribute("aria-expanded") === "true") {
      setLanguageMenuOpen(false, true);
    }
    if (event.key === "Escape" && langGateCurrencyTrigger?.getAttribute("aria-expanded") === "true") {
      setCurrencyMenuOpen(false, true);
    }
  });

  window.addEventListener("ruqo:home-lunae-hero-updated", applyCustomHeroConfig);
  window.addEventListener("ruqo:home-hello-page-updated", applyCustomHelloPageConfig);
  window.addEventListener("ruqo:language-updated", () => {
    applyCustomHeroConfig();
    applyCustomHelloPageConfig();
  });
  window.addEventListener("ruqo:currency-updated", (event) => {
    updateCurrencyPickerSelection(event.detail?.currency || window.NoursStore?.getCurrency?.() || "USD");
  });

  resizeCanvas();
  applyCustomHeroConfig();
  applyCustomHelloPageConfig();
  updateCurrencyPickerSelection(window.NoursStore?.getCurrency?.() || "USD");

  if (shouldSkipIntroOnLoad) {
    document.documentElement.classList.remove("is-wx-gate-pending");
    document.body.classList.remove("is-wx-gate-open");
    if (langGate instanceof HTMLElement) {
      langGate.hidden = true;
    }
    if (langGateVideo instanceof HTMLVideoElement && !langGateVideo.paused) {
      langGateVideo.pause();
    }
    heroLocked = true;
    sequence.classList.add("is-hero-locked");
    document.body.classList.remove("is-lunae-header-hidden");
    setIntroLockState(false);
    introVideoEnded = true;
    introDismissedByScroll = true;
    introBlend = 0;
    targetFrame = totalFrames - 1;
    currentFrame = totalFrames - 1;
    ensureAmbientVideoLoaded();
    updateChoreography(1, 0, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    loadFrame(totalFrames - 1)
      .then(() => {
        resizeCanvas();
        drawFrame(totalFrames - 1);
      })
      .catch(() => {});
  } else if (shouldOpenHelloGateOnLoad && langGate instanceof HTMLElement) {
    isGateOpen = true;
    langGate.hidden = false;
    const helloCfg = readCustomHelloPageData();
    const initialLang = helloCfg?.default_language || window.NoursStore?.getLanguage?.() || "en";
    if (helloCfg?.default_currency && ["USD", "EUR", "SAR"].includes(helloCfg.default_currency) && isFirstEverVisit) {
      window.NoursStore?.setCurrency?.(helloCfg.default_currency);
      updateCurrencyPickerSelection(helloCfg.default_currency);
    }
    updateLanguagePickerSelection(initialLang);
    applyCustomHelloPageConfig();
    document.body.classList.add("is-wx-gate-open", "is-intro-locked", "is-lunae-header-hidden");
    sequence.classList.add("is-hero-locked");
    ensureIntroAssetsLoaded();
    updateGateBufferProgress();
    loadFrame(0)
      .then(() => {
        resizeCanvas();
        drawFrame(0);
      })
      .catch(() => {});
    scheduleProgressivePreload(1);
  } else {
    document.documentElement.classList.remove("is-wx-gate-pending");
    document.body.classList.remove("is-wx-gate-open");
    if (langGate instanceof HTMLElement) {
      langGate.hidden = true;
    }
    sequence.classList.add("is-hero-locked");
    document.body.classList.add("is-lunae-header-hidden");
    markFirstVisitCompleted();
    startIntroVideoPlayback();
    loadFrame(0)
      .then(() => {
        resizeCanvas();
        drawFrame(0);
      })
      .catch(() => {});
    scheduleProgressivePreload(1);
  }

  requestAnimationFrame(animate);
})();
