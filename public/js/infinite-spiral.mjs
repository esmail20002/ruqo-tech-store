const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min, max, value) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

export function mountInfiniteSpiral(container, initialOptions = {}) {
  let state = {
    items: [],
    speed: 0.55,
    direction: 'up',
    animationMode: 'all',
    radius: 170,
    cardWidth: 100,
    cardHeight: 100,
    verticalSpacing: 60,
    perspective: 1000,
    cardsPerTurn: 7,
    rotation: 0,
    cardTilt: 0,
    cardRadius: 10,
    centerScale: 1.2,
    edgeFade: 0.3,
    edgeBlur: 6,
    pauseOnHover: true,
    imageFit: 'cover',
    grayscale: 0,
    ...initialOptions
  };

  const root = document.createElement('div');
  root.className = 'infinite-spiral';
  const stage = document.createElement('div');
  stage.className = 'infinite-spiral__stage';
  stage.setAttribute('role', 'list');
  stage.setAttribute('aria-label', 'Infinite spiral gallery');
  root.appendChild(stage);
  container.replaceChildren(root);

  let cardNodes = [];
  let normalizedItems = [];
  let progress = 0;
  let targetProgress = 0;
  let autoSpeed = 0;
  let hovered = false;
  let visible = true;
  let dragging = false;
  let lastPointerY = 0;
  let dragMoved = false;
  let lastScrollY = window.scrollY;
  let previousTime = performance.now();
  let frameId = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const applyRootStyles = () => {
    const dragEnabled = state.animationMode === 'drag' || state.animationMode === 'all';
    root.style.perspective = `${state.perspective}px`;
    root.style.setProperty('--infinite-spiral-card-width', `${state.cardWidth}px`);
    root.style.setProperty('--infinite-spiral-card-height', `${state.cardHeight}px`);
    root.style.setProperty('--infinite-spiral-card-radius', `${state.cardRadius}px`);
    root.style.cursor = dragging ? 'grabbing' : (dragEnabled ? 'grab' : 'default');
    root.style.touchAction = dragEnabled ? 'pan-x' : 'auto';
    root.style.userSelect = dragEnabled ? 'none' : 'auto';

    cardNodes.forEach((card) => {
      card.style.width = `${state.cardWidth}px`;
      card.style.height = `${state.cardHeight}px`;
      card.style.borderRadius = `${state.cardRadius}px`;
      const img = card.querySelector('.infinite-spiral__image');
      if (img) {
        img.style.width = `${state.cardWidth}px`;
        img.style.height = `${state.cardHeight}px`;
        img.style.objectFit = state.imageFit;
        img.style.filter = `grayscale(${Math.min(1, Math.max(0, state.grayscale))})`;
      }
    });
  };

  const buildCards = (items) => {
    normalizedItems = (items || []).map((item, index) =>
      typeof item === 'string'
        ? { src: item, alt: `Spiral image ${index + 1}` }
        : { alt: `Spiral image ${index + 1}`, ...item }
    );
    cardNodes = normalizedItems.map((item, index) => {
      const card = document.createElement(item.href ? 'a' : 'div');
      card.className = 'infinite-spiral__item';
      if (item.href) {
        card.href = item.href;
        if (item.target) card.target = item.target;
        if (item.target === '_blank') card.rel = 'noreferrer';
      }
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', item.label ?? item.alt);

      const img = document.createElement('img');
      img.className = 'infinite-spiral__image';
      img.src = item.src;
      img.alt = item.alt;
      img.loading = index < 6 ? 'eager' : 'lazy';
      img.draggable = false;
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      card.appendChild(img);

      if (item.badge) {
        const badge = document.createElement('span');
        badge.className = 'infinite-spiral__badge';
        badge.textContent = item.badge;
        card.appendChild(badge);
      }
      return card;
    });
    stage.replaceChildren(...cardNodes);
    applyRootStyles();
  };

  buildCards(state.items);

  let bounds = root.getBoundingClientRect();
  const resizeObserver = new ResizeObserver(() => {
    bounds = root.getBoundingClientRect();
  });
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { threshold: 0.02 }
  );
  intersectionObserver.observe(root);

  const handleScroll = () => {
    const nextScrollY = window.scrollY;
    const scrollDelta = nextScrollY - lastScrollY;
    lastScrollY = nextScrollY;
    const scrollEnabled = state.animationMode === 'scroll' || state.animationMode === 'all';
    if (!scrollEnabled || !visible || scrollDelta === 0) return;
    const scrollSpeedMultiplier = Math.max(state.speed, 0) / 0.55;
    targetProgress += clamp(
      (scrollDelta * scrollSpeedMultiplier) / Math.max(state.verticalSpacing * 2, 1),
      -1.5,
      1.5
    );
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  root.addEventListener('mouseenter', () => { hovered = true; });
  root.addEventListener('mouseleave', () => { hovered = false; });

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    if (root.hasPointerCapture?.(event.pointerId)) {
      root.releasePointerCapture(event.pointerId);
    }
    const dragEnabled = state.animationMode === 'drag' || state.animationMode === 'all';
    root.style.cursor = dragEnabled ? 'grab' : 'default';
  };

  root.addEventListener('pointerdown', (event) => {
    const dragEnabled = state.animationMode === 'drag' || state.animationMode === 'all';
    if (!dragEnabled || event.button !== 0) return;
    dragging = true;
    dragMoved = false;
    lastPointerY = event.clientY;
    targetProgress = progress;
    root.setPointerCapture?.(event.pointerId);
    root.style.cursor = 'grabbing';
  });

  root.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const pointerDelta = event.clientY - lastPointerY;
    lastPointerY = event.clientY;
    if (Math.abs(pointerDelta) > 0.5) dragMoved = true;
    targetProgress -= pointerDelta / Math.max(state.verticalSpacing, 1);
  });

  root.addEventListener('pointerup', stopDragging);
  root.addEventListener('pointercancel', stopDragging);
  root.addEventListener('click', (event) => {
    if (!dragMoved) return;
    event.preventDefault();
    event.stopPropagation();
    dragMoved = false;
  }, true);

  const render = (time) => {
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;

    const autoEnabled = state.animationMode === 'auto' || state.animationMode === 'all';
    const motionPaused = dragging || (state.pauseOnHover && hovered);
    const directionMultiplier = state.direction === 'down' ? -1 : 1;
    const desiredAutoSpeed =
      autoEnabled && visible && !reducedMotion.matches && !motionPaused
        ? state.speed * directionMultiplier
        : 0;
    const speedBlend = 1 - Math.exp(-delta * 7);
    autoSpeed += (desiredAutoSpeed - autoSpeed) * speedBlend;
    targetProgress += autoSpeed * delta;

    const followBlend = 1 - Math.exp(-delta * (dragging ? 22 : 11));
    progress += (targetProgress - progress) * followBlend;

    const count = normalizedItems.length;
    if (count > 0) {
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / (state.cardWidth * 2.8), height / (state.cardHeight * 2.35));
      const responsiveRadius = Math.min(state.radius, Math.max(72, width * 0.36)) * fit;
      const fadeStart = clamp(1 - state.edgeFade, 0, 0.98);
      const turnSize = Math.max(state.cardsPerTurn, 1);

      cardNodes.forEach((card, index) => {
        if (!card) return;
        let offset = index - progress;
        offset = modulo(offset + half, count) - half;

        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (state.centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + state.rotation;
        const angleRadians = (angle * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(state.perspective / Math.max(state.perspective - z, 1), 0.72, 1.45);
        const visualScale = scale * depthScale;
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = state.edgeBlur * smoothstep(0.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * state.verticalSpacing * fit}px, 0) rotateZ(${state.cardTilt}deg) scale(${visualScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
      });
    }

    frameId = requestAnimationFrame(render);
  };

  frameId = requestAnimationFrame(render);

  return {
    update(next = {}) {
      const itemsChanged = next.items && next.items !== state.items;
      state = { ...state, ...next };
      if (itemsChanged) buildCards(state.items);
      else applyRootStyles();
    },
    getState: () => ({ ...state }),
    destroy() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      root.remove();
    }
  };
}
