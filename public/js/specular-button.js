(() => {
  const button = document.querySelector("[data-specular-button]");
  const canvas = button?.querySelector(".specular-button__light");
  const context = canvas?.getContext("2d");
  if (!button || !canvas || !context) {
    console.warn("Specular button rendering is unavailable.");
    return;
  }

  const settings = {
    radius: 18,
    lineColor: "#ffffff",
    baseColor: "#525252",
    intensity: 1,
    idleIntensity: 0.35,
    shineSize: 10,
    shineFade: 34,
    thickness: 1.2,
    glow: 1,
    followMouse: true,
    proximity: 250,
  };
  const padding = 24;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rgbCache = new Map();
  const view = { width: 1, height: 1, ratio: 1 };
  const pointer = { x: 0, y: 0, known: false };
  const state = { angle: -Math.PI / 2, level: settings.idleIntensity, press: 0 };
  let animationFrame = 0;
  let lastFrame = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const colorRgb = (value) => {
    if (rgbCache.has(value)) return rgbCache.get(value);
    const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
    const rgb = match
      ? match.slice(1).map((channel) => Number.parseInt(channel, 16))
      : [255, 255, 255];
    rgbCache.set(value, rgb);
    return rgb;
  };
  const rgba = (color, alpha) => {
    const [red, green, blue] = colorRgb(color);
    return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha, 0, 1)})`;
  };

  button.style.setProperty("--sb-radius", `${settings.radius}px`);
  button.style.setProperty("--sb-line-color", settings.lineColor);
  button.style.setProperty("--sb-base-color", settings.baseColor);

  function draw() {
    const { width, height, ratio } = view;
    const canvasWidth = width + padding * 2;
    const canvasHeight = height + padding * 2;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const rect = button.getBoundingClientRect();
    const x = padding;
    const y = padding;
    const radius = Math.min(settings.radius, width / 2, height / 2);
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const intensity = settings.intensity * (state.level + state.press * 0.8);
    const path = new Path2D();
    path.roundRect(x + 0.6, y + 0.6, width - 1.2, height - 1.2, Math.max(0, radius - 0.6));

    context.lineWidth = 1;
    context.strokeStyle = rgba(settings.baseColor, 0.65);
    context.stroke(path);
    context.lineWidth = 0.6;
    context.strokeStyle = rgba(settings.lineColor, 0.18);
    context.stroke(path);

    if (pointer.known && settings.followMouse && !reducedMotion.matches) {
      const localX = clamp(pointer.x - rect.left, 0, rect.width);
      const localY = clamp(pointer.y - rect.top, 0, rect.height);
      const glow = context.createRadialGradient(
        x + localX,
        y + localY,
        0,
        x + localX,
        y + localY,
        Math.max(height * 0.85, 1),
      );
      glow.addColorStop(0, rgba(settings.lineColor, intensity * settings.glow * 0.09));
      glow.addColorStop(1, rgba(settings.lineColor, 0));
      context.fillStyle = glow;
      context.fill(path);
    }

    const shine = context.createConicGradient(state.angle, centerX, centerY);
    const fade = clamp(settings.shineFade / 360, 0.01, 0.2);
    const core = clamp(settings.shineSize / 360, 0.005, 0.1);
    const outer = Math.min(0.48, (fade + core) / 2);
    const inner = Math.min(0.48, core / 2);
    shine.addColorStop(0, rgba(settings.lineColor, intensity * 0.9));
    shine.addColorStop(inner, rgba(settings.lineColor, intensity * 0.55));
    shine.addColorStop(outer, rgba(settings.lineColor, intensity * 0.08));
    shine.addColorStop(0.5, rgba(settings.lineColor, 0));
    shine.addColorStop(1 - outer, rgba(settings.lineColor, intensity * 0.08));
    shine.addColorStop(1 - inner, rgba(settings.lineColor, intensity * 0.55));
    shine.addColorStop(1, rgba(settings.lineColor, intensity * 0.9));

    context.save();
    context.globalCompositeOperation = "lighter";
    context.shadowColor = rgba(settings.lineColor, intensity * 0.55);
    context.shadowBlur = 8 * settings.glow * intensity;
    context.lineWidth = Math.max(1, settings.thickness + state.press * 0.5);
    context.strokeStyle = shine;
    context.stroke(path);
    context.restore();
  }

  function measure() {
    view.width = Math.max(1, button.getBoundingClientRect().width);
    view.height = Math.max(1, button.getBoundingClientRect().height);
    view.ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round((view.width + padding * 2) * view.ratio);
    canvas.height = Math.round((view.height + padding * 2) * view.ratio);
    canvas.style.width = `${view.width + padding * 2}px`;
    canvas.style.height = `${view.height + padding * 2}px`;
    draw();
  }

  function frame(now) {
    animationFrame = 0;
    const elapsed = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
    lastFrame = now;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right);
    const distanceY = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);
    const distance = Math.hypot(distanceX, distanceY);
    const proximity = pointer.known && settings.followMouse && !reducedMotion.matches
      ? clamp(1 - distance / settings.proximity, 0, 1)
      : 0;
    const easedProximity = proximity * proximity * (3 - 2 * proximity);
    const targetLevel = settings.idleIntensity + (1 - settings.idleIntensity) * easedProximity;

    const targetAngle = proximity > 0
      ? Math.atan2(pointer.y - centerY, pointer.x - centerX)
      : -Math.PI / 2;
    let angleDifference = targetAngle - state.angle;
    angleDifference -= Math.round(angleDifference / (Math.PI * 2)) * Math.PI * 2;
    state.angle += angleDifference * (1 - Math.exp(-elapsed * 8));
    const levelDifference = targetLevel - state.level;
    state.level += (targetLevel - state.level) * (1 - Math.exp(-elapsed * 7));
    state.press *= Math.exp(-elapsed * 5);
    draw();

    if (Math.abs(angleDifference) > 0.0002 || Math.abs(levelDifference) > 0.001 || state.press > 0.002) {
      animationFrame = requestAnimationFrame(frame);
    } else {
      lastFrame = 0;
    }
  }

  function wake() {
    if (!animationFrame) animationFrame = requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.known = true;
    wake();
  }, { passive: true });
  window.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") {
      pointer.known = false;
      wake();
    }
  }, { passive: true });
  window.addEventListener("pointercancel", () => {
    pointer.known = false;
    wake();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.known = false;
    wake();
  });
  button.addEventListener("pointerdown", () => {
    if (!reducedMotion.matches && !button.disabled) state.press = 1;
    wake();
  });
  reducedMotion.addEventListener?.("change", wake);
  new ResizeObserver(measure).observe(button);
  measure();
})();
