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
    orb: document.querySelector('[data-reveal-item="orb"]'),
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
  const initialCustomHero = readCustomHeroData();
  const introMode = ["once_per_session", "always", "skip"].includes(initialCustomHero?.intro_mode)
    ? initialCustomHero.intro_mode
    : "once_per_session";

  function hasSeenHeroInSession() {
    try {
      return sessionStorage.getItem(HERO_SEEN_SESSION_KEY) === "1";
    } catch (error) {
      console.warn("Lunae sequence: session storage is unavailable; the hero intro may replay after reload.", error);
      return false;
    }
  }

  const shouldSkipIntroOnLoad =
    introMode === "skip" ||
    (introMode === "once_per_session" && hasSeenHeroInSession());

  function markHeroSeenInSession() {
    try {
      sessionStorage.setItem(HERO_SEEN_SESSION_KEY, "1");
    } catch (error) {
      console.warn("Lunae sequence: the hero intro session state could not be saved.", error);
    }
  }

  // Intro eye-opening video — lazy-loaded only when the intro is scheduled or Replay is triggered.
  const introPoster = new Image();
  introPoster.decoding = "async";
  let introPosterReady = false;
  let introAssetsInitialized = false;
  introPoster.onload = () => {
    introPosterReady = true;
    redrawRequested = true;
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
    document.body.classList.toggle("is-intro-locked", locked);
    if (introCueText instanceof HTMLElement) {
      introCueText.textContent = locked
        ? "AWAKENING WEEXEY VISION..."
        : "SCROLL TO AWAKEN WEEXEY VISION";
    }
  }

  function startIntroVideoPlayback() {
    if (useMobilePortraitSequence) {
      setIntroLockState(false);
      introVideoEnded = true;
      introDismissedByScroll = true;
      introBlend = 0;
      redrawRequested = true;
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIntroLockState(false);
      introVideoEnded = true;
      introDismissedByScroll = true;
      introBlend = 0;
      redrawRequested = true;
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    ensureIntroAssetsLoaded();
    introVideoEnded = false;
    introDismissedByScroll = false;
    introBlend = 1;
    setIntroLockState(true);
    introVideo.currentTime = 0;
    const playPromise = introVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIntroLockState(false);
        introVideoEnded = true;
      });
    }
    redrawRequested = true;
  }

  introVideo.addEventListener("loadeddata", () => {
    introVideoReady = true;
    redrawRequested = true;
  });

  introVideo.addEventListener("ended", () => {
    introVideoEnded = true;
    markHeroSeenInSession();
    setIntroLockState(false);
    redrawRequested = true;
  });

  // Ambient hair & wind loop video that takes over seamlessly at the end of the scroll
  const ambientVideo = document.createElement("video");
  if (!useMobilePortraitSequence) {
    ambientVideo.src = "/images/lunae-sequence/lunae-ambient-hair.mp4";
  }
  ambientVideo.muted = true;
  ambientVideo.defaultMuted = true;
  ambientVideo.loop = true;
  ambientVideo.playsInline = true;
  ambientVideo.preload = useMobilePortraitSequence ? "none" : "auto";
  ambientVideo.setAttribute("muted", "");
  ambientVideo.setAttribute("playsinline", "");
  let ambientVideoReady = false;
  let ambientBlend = 0;
  let heroLocked = false;
  let isRewinding = false;
  let rewindStartTime = 0;
  let rewindStartFrame = 0;

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
      return Promise.resolve(image);
    }

    pendingLoads[index] = new Promise((resolve, reject) => {
      image.onload = () => {
        images[index] = image;
        pendingLoads[index] = null;
        redrawRequested = true;
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
      const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const containScale = Math.min(width / image.naturalWidth, height / image.naturalHeight);

      if (!useMobilePortraitSequence) {
        // 1. Draw an atmospheric edge-matched backdrop (cover + soft blur) on wide desktop frames
        const bgWidth = width / coverScale;
        const bgHeight = height / coverScale;
        const bgX = (image.naturalWidth - bgWidth) / 2;
        const bgY = (image.naturalHeight - bgHeight) / 2;

        context.save();
        context.filter = "blur(26px) saturate(1.08)";
        context.drawImage(
          image,
          bgX,
          bgY,
          bgWidth,
          bgHeight,
          -32,
          -32,
          width + 64,
          height + 64,
        );
        context.restore();
      }

      // 2. Blend framing between cover and contain on wide desktop frames; keep full 9:16 portrait cover on mobile
      const pullBackReveal = smoothstep(0.18, 0.72, index / Math.max(1, totalFrames - 1));
      const zoomReduction = useMobilePortraitSequence ? 0 : 0.45 * pullBackReveal;
      const effectiveScale = coverScale * (1 - zoomReduction) + containScale * zoomReduction;

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

    // 4. Floating Center Orb on the purple ring (synchronized 78% -> 92%)
    if (revealItems.orb instanceof HTMLElement && (progressChanged || (!reducedMotion && syncReveal > 0.01))) {
      const orbP = syncReveal;
      const floatY = reducedMotion ? 0 : Math.sin(timeMs * 0.0024) * 5 * orbP;
      revealItems.orb.style.opacity = orbP.toFixed(3);
      revealItems.orb.style.transform = `translate3d(-50%, ${((1 - orbP) * 20 + floatY).toFixed(1)}px, 0) scale(${(0.9 + 0.1 * orbP).toFixed(3)})`;
      revealItems.orb.style.pointerEvents = orbP > 0.6 ? "auto" : "none";
    }

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
    markHeroSeenInSession();
    sequence.classList.add("is-hero-locked");
    targetFrame = totalFrames - 1;
    currentFrame = totalFrames - 1;
    // Collapse scroll track to 100vh and clamp window scroll so the hero stays pinned at the top
    // while allowing natural downward scroll if future sections exist below <section class="lunae-sequence">
    const rect = sequence.getBoundingClientRect();
    const lockedScrollTop = Math.max(0, window.scrollY + rect.top);
    window.scrollTo({ top: lockedScrollTop, behavior: "instant" });
    window.WEEXEY_SMOOTH_SCROLL?.syncTo(lockedScrollTop);
    redrawRequested = true;
  }

  function startWatchFilmRewind() {
    if (isRewinding) return;
    ensureIntroAssetsLoaded();
    isRewinding = true;
    heroLocked = false;
    sequence.classList.remove("is-hero-locked");
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
    if (isRewinding) return;
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

    const sectionBounds = sequence.getBoundingClientRect();
    const travelDistance = Math.max(1, sequence.offsetHeight - stage.offsetHeight);
    const progress = clamp(-sectionBounds.top / travelDistance, 0, 1);
    targetFrame = progress * (totalFrames - 1);

    if (progress >= 0.965) {
      lockHeroAtEnd();
      return;
    }

    const requestedFrame = Math.round(targetFrame);
    loadFrame(requestedFrame).catch(() => {});
    if (useMobilePortraitSequence) {
      const lookBehind = isLowPowerMobile ? 1 : 3;
      const lookAhead = isLowPowerMobile ? 2 : 4;
      for (let offset = -lookBehind; offset <= lookAhead; offset += 1) {
        if (offset !== 0) loadFrame(requestedFrame + offset).catch(() => {});
      }
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
    if (heroLocked && !isHeroInViewport && !isRewinding && !isIntroPlaying) {
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
    } else if (isIntroPlaying) {
      targetFrame = 0;
      currentFrame = 0;
      redrawRequested = true;
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
      markHeroSeenInSession();
    }

    // Smooth blend from the intro video into the scroll sequence as user scrolls away from top
    const targetIntroBlend = reducedMotion
      ? 0
      : isIntroPlaying
        ? 1
        : introDismissedByScroll || isRewinding
          ? 0
          : 1 - smoothstep(0.0, 1.1, currentFrame);
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
      !isIntroPlaying &&
      !isRewinding &&
      (heroLocked || normalizedProgress >= 0.85 || window.scrollY > stage.offsetHeight * 0.85);
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

  function applyCustomHeroConfig() {
    const cfg = readCustomHeroData();
    if (!cfg || typeof cfg !== "object") return;
    const lang = String(
      window.NoursStore?.getLanguage?.() || document.documentElement.lang || "en",
    )
      .toLowerCase()
      .split("-")[0];
    const pick = (map) => String(map?.[lang] || map?.en || "").trim();

    if (cfg.copy && typeof cfg.copy === "object") {
      const pillBadgeNode = sequence.querySelector(".wx-pill-badge");
      if (pillBadgeNode) {
        const dot = pillBadgeNode.querySelector(".wx-pill-dot");
        const val = pick(cfg.copy.pill_badge);
        if (val) {
          pillBadgeNode.replaceChildren();
          if (dot) pillBadgeNode.append(dot, document.createTextNode(` ${val}`));
          else pillBadgeNode.textContent = val;
        }
      }
      const subNode = sequence.querySelector(".wx-eyebrow-sub");
      if (subNode && pick(cfg.copy.eyebrow_sub)) {
        subNode.textContent = pick(cfg.copy.eyebrow_sub);
      }
      const darkSpans = sequence.querySelectorAll(".wx-headline .wx-headline__dark");
      if (darkSpans[0] && pick(cfg.copy.headline_line1)) {
        darkSpans[0].textContent = pick(cfg.copy.headline_line1);
      }
      if (darkSpans[1] && pick(cfg.copy.headline_line2)) {
        darkSpans[1].textContent = pick(cfg.copy.headline_line2);
      }
      const gradSpan = sequence.querySelector(".wx-headline .wx-headline__gradient");
      if (gradSpan && pick(cfg.copy.headline_gradient)) {
        gradSpan.textContent = pick(cfg.copy.headline_gradient);
      }
      const descNode = sequence.querySelector(".wx-description");
      if (descNode && pick(cfg.copy.description)) {
        descNode.textContent = pick(cfg.copy.description);
      }
      const primaryBtn = sequence.querySelector(".wx-btn-primary");
      if (primaryBtn) {
        const span = primaryBtn.querySelector("span");
        if (span && pick(cfg.copy.primary_btn_text)) {
          span.textContent = pick(cfg.copy.primary_btn_text);
        }
        if (cfg.copy.primary_btn_href) {
          primaryBtn.setAttribute("href", cfg.copy.primary_btn_href);
        }
      }
      const orbNode = sequence.querySelector(".wx-floating-orb");
      if (orbNode) {
        orbNode.hidden = cfg.show_orb === false;
        if (cfg.show_orb === false) orbNode.style.display = "none";
        else orbNode.style.removeProperty("display");
        if (cfg.copy.orb_href) orbNode.setAttribute("href", cfg.copy.orb_href);
        const orbSpan = orbNode.querySelector(".wx-floating-orb__core span");
        if (orbSpan && pick(cfg.copy.orb_text)) {
          orbSpan.textContent = pick(cfg.copy.orb_text);
        }
      }
    }

    const statsBar = sequence.querySelector(".wx-stats-bar");
    if (statsBar) {
      statsBar.hidden = cfg.show_stats === false;
      if (cfg.show_stats === false) statsBar.style.display = "none";
      else statsBar.style.removeProperty("display");
      if (Array.isArray(cfg.stats)) {
        const statItems = statsBar.querySelectorAll(".wx-stat-item");
        cfg.stats.forEach((st, idx) => {
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
          if (labelEl && pick(st.label)) {
            labelEl.textContent = pick(st.label);
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

  window.addEventListener("ruqo:home-lunae-hero-updated", applyCustomHeroConfig);
  window.addEventListener("ruqo:language-updated", applyCustomHeroConfig);

  resizeCanvas();
  applyCustomHeroConfig();

  if (shouldSkipIntroOnLoad) {
    heroLocked = true;
    sequence.classList.add("is-hero-locked");
    document.body.classList.remove("is-lunae-header-hidden");
    setIntroLockState(false);
    introVideoEnded = true;
    introDismissedByScroll = true;
    introBlend = 0;
    targetFrame = totalFrames - 1;
    currentFrame = totalFrames - 1;
    updateChoreography(1, 0, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    loadFrame(totalFrames - 1)
      .then(() => {
        resizeCanvas();
        drawFrame(totalFrames - 1);
        scheduleProgressivePreload(0);
      })
      .catch(() => {
        scheduleProgressivePreload(0);
      });
  } else if (window.scrollY < 120) {
    document.body.classList.add("is-lunae-header-hidden");
    if (introMode === "once_per_session") {
      markHeroSeenInSession();
    }
    startIntroVideoPlayback();
    loadFrame(0)
      .then(() => {
        resizeCanvas();
        drawFrame(0);
      })
      .catch(() => {});
    scheduleProgressivePreload(1);
  } else {
    introVideoEnded = true;
    introDismissedByScroll = true;
    introBlend = 0;
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
