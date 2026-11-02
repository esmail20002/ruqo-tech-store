import * as THREE from 'https://esm.sh/three@0.170.0';
import { GLTFLoader } from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

const FOV = 30;
const INTRO_SECONDS = 1.3;
const DRAG_SPEED = 0.0065;
const PITCH_LIMIT = (65 * Math.PI) / 180;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Procedural 3D electronics models so the viewer works instantly without waiting for external files
export function buildProceduralDevice(type = 'laptop', accentHex = '#a855f7') {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xd4d4dc, metalness: 0.86, roughness: 0.22 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x221f29, metalness: 0.78, roughness: 0.28 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0d0916, metalness: 0.1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.06 });
  const accent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 0.45,
    metalness: 0.4,
    roughness: 0.25,
  });

  if (type === 'phone') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.92, 0.11), darkMetal);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.84, 0.02), glass);
    screen.position.z = 0.052;
    const wallpaper = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.76), accent);
    wallpaper.position.z = 0.064;
    const camBump = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.04), metal);
    camBump.position.set(-0.2, 0.64, -0.065);
    [-0.09, 0.09].forEach((ox, i) => {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 24), glass);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(-0.2 + ox, 0.64 + (i === 0 ? 0.09 : -0.09), -0.078);
      group.add(lens);
    });
    group.add(body, screen, wallpaper, camBump);
  } else if (type === 'headphones') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.065, 20, 48, Math.PI), darkMetal);
    band.position.y = 0.12;
    [-0.66, 0.66].forEach((x) => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 32), metal);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(x, -0.15, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 16, 32), accent);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(x + (x < 0 ? -0.1 : 0.1), -0.15, 0);
      group.add(cup, ring);
    });
    group.add(band);
  } else if (type === 'watch') {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.14, 18, 42), darkMetal);
    strap.scale.set(0.75, 1.15, 0.55);
    const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.86, 0.18), metal);
    caseMesh.position.z = 0.36;
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.76, 0.04), accent);
    face.position.z = 0.45;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 20), accent);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(0.39, 0.15, 0.36);
    group.add(strap, caseMesh, face, crown);
  } else {
    // Laptop (default)
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.07, 1.18), metal);
    base.position.y = -0.38;
    const kb = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.02, 0.66), darkMetal);
    kb.position.set(0, -0.34, -0.1);
    const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.015, 0.3), darkMetal);
    trackpad.position.set(0, -0.34, 0.36);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, -0.35, -0.56);
    lidPivot.rotation.x = -0.32;

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.12, 0.05), metal);
    lid.position.set(0, 0.56, 0);
    const display = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.02, 0.02), glass);
    display.position.set(0, 0.56, 0.026);
    const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.94), accent);
    glowPanel.position.set(0, 0.56, 0.038);

    lidPivot.add(lid, display, glowPanel);
    group.add(base, kb, trackpad, lidPivot);
  }

  return group;
}

function createSoftShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(18, 8, 34, 0.72)');
  grad.addColorStop(0.45, 'rgba(18, 8, 34, 0.32)');
  grad.addColorStop(1, 'rgba(18, 8, 34, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function measure(object) {
  const box = new THREE.Box3().setFromObject(object);
  const extent = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 2 / Math.max(extent.x, extent.y, extent.z, 0.0001);
  return {
    scale,
    center,
    radius: (extent.length() / 2) * scale,
    floor: (extent.y / 2) * scale,
  };
}

export function mountModelViewer(container, initialOptions = {}) {
  let state = {
    url: '',
    procedural: 'laptop',
    accentColor: '#a855f7',
    environmentIntensity: 1,
    exposure: 1,
    autoRotate: true,
    autoRotateSpeed: 0.4,
    autoRotateDelay: 2,
    dragRotate: true,
    turntable: false,
    zoom: true,
    minZoom: 0.7,
    maxZoom: 2,
    hoverTilt: 0.15,
    float: 0.3,
    shadow: true,
    shadowOpacity: 0.45,
    intro: 'rise',
    startAngle: -35,
    tilt: 12,
    offsetX: 0,
    offsetY: 0,
    fit: 0.8,
    resetOnDoubleClick: true,
    ...initialOptions,
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = state.exposure;

  const domElement = renderer.domElement;
  domElement.style.display = 'block';
  domElement.style.width = '100%';
  domElement.style.height = '100%';
  domElement.style.touchAction = 'pan-y';
  domElement.style.cursor = state.dragRotate ? 'grab' : 'default';
  container.replaceChildren(domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
  camera.position.set(0, 0, 6);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = state.environmentIntensity;

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(3, 5, 4);
  const rimLight = new THREE.DirectionalLight(0xd848a0, 0.55);
  rimLight.position.set(-4, 2, -3);
  scene.add(dirLight, rimLight);

  const placeGroup = new THREE.Group();
  const floatGroup = new THREE.Group();
  const tiltGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  const fitGroup = new THREE.Group();

  spinGroup.add(fitGroup);
  tiltGroup.add(spinGroup);
  floatGroup.add(tiltGroup);
  placeGroup.add(floatGroup);
  scene.add(placeGroup);

  const shadowMat = new THREE.MeshBasicMaterial({
    map: createSoftShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: state.shadowOpacity,
  });
  const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  placeGroup.add(shadowMesh);

  let bounds = { scale: 1, center: new THREE.Vector3(), radius: 1.4, floor: 0.6 };

  const motion = {
    yaw: toRadians(state.startAngle),
    pitch: toRadians(state.tilt),
    yawVelocity: 0,
    pitchVelocity: 0,
    zoom: 1,
    zoomGoal: 1,
    tiltX: 0,
    tiltY: 0,
    tiltGoalX: 0,
    tiltGoalY: 0,
    spinSpeed: 0,
    idle: 0,
    dragging: false,
    intro: state.intro === 'none' ? 1 : 0,
    clock: 0,
    reset: null,
  };

  const applyObject = (obj) => {
    fitGroup.clear();
    fitGroup.add(obj);
    bounds = measure(obj);
    fitGroup.scale.setScalar(bounds.scale);
    fitGroup.position.set(
      -bounds.center.x * bounds.scale,
      -bounds.center.y * bounds.scale,
      -bounds.center.z * bounds.scale
    );
    shadowMesh.position.set(0, -bounds.floor - 0.1, 0);
    shadowMesh.scale.setScalar(bounds.radius * 3.1);
    shadowMesh.visible = Boolean(state.shadow);
    shadowMat.opacity = state.shadowOpacity;
    motion.intro = state.intro === 'none' ? 1 : 0;
  };

  const gltfLoader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  gltfLoader.setDRACOLoader(draco);
  const glbSceneCache = new Map();

  const loadGlbCached = (url, onSuccess, onError) => {
    if (glbSceneCache.has(url)) {
      const entry = glbSceneCache.get(url);
      if (entry.scene) {
        onSuccess(entry.scene.clone(true));
      } else {
        entry.callbacks.push({ onSuccess, onError });
      }
      return;
    }
    const entry = { scene: null, callbacks: [{ onSuccess, onError }] };
    glbSceneCache.set(url, entry);
    gltfLoader.load(
      url,
      (gltf) => {
        entry.scene = gltf.scene;
        entry.callbacks.forEach((cb) => cb.onSuccess(gltf.scene.clone(true)));
        entry.callbacks = [];
      },
      undefined,
      (err) => {
        glbSceneCache.delete(url);
        entry.callbacks.forEach((cb) => cb.onError?.(err));
        entry.callbacks = [];
      }
    );
  };

  let currentUrl = '';
  let currentProcedural = '';
  let currentAccent = '';

  const loadModel = () => {
    if (state.url && state.url.trim()) {
      if (currentUrl === state.url) return;
      currentUrl = state.url;
      loadGlbCached(
        state.url,
        (cloned) => {
          if (currentUrl === state.url) applyObject(cloned);
        },
        () => {
          applyObject(buildProceduralDevice(state.procedural || 'laptop', state.accentColor));
        }
      );
    } else {
      currentUrl = '';
      if (currentProcedural !== state.procedural || currentAccent !== state.accentColor) {
        currentProcedural = state.procedural;
        currentAccent = state.accentColor;
        applyObject(buildProceduralDevice(state.procedural || 'laptop', state.accentColor));
      }
    }
  };

  loadModel();

  const pointers = new Map();
  let pinchStart = 0;
  let zoomStart = 1;

  const onDown = (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, t: event.timeStamp });
    if (pointers.size === 2 && state.zoom) {
      const [a, b] = [...pointers.values()];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      zoomStart = motion.zoomGoal;
      motion.dragging = false;
    } else if (pointers.size === 1 && state.dragRotate && (event.pointerType !== 'mouse' || event.button === 0)) {
      motion.dragging = true;
      motion.yawVelocity = 0;
      motion.pitchVelocity = 0;
      domElement.setPointerCapture?.(event.pointerId);
      domElement.style.cursor = 'grabbing';
    }
    motion.idle = 0;
  };

  const onMove = (event) => {
    const rect = domElement.getBoundingClientRect();
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      const nx = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      motion.tiltGoalX = ny * state.hoverTilt * 0.6;
      motion.tiltGoalY = nx * state.hoverTilt;
    }
    const last = pointers.get(event.pointerId);
    if (last) {
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const elapsed = Math.max((event.timeStamp - last.t) / 1000, 1 / 240);
      last.x = event.clientX;
      last.y = event.clientY;
      last.t = event.timeStamp;
      if (pointers.size === 2 && state.zoom && pinchStart > 0) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        motion.zoomGoal = THREE.MathUtils.clamp((zoomStart * distance) / pinchStart, state.minZoom, state.maxZoom);
      } else if (motion.dragging) {
        motion.yaw += dx * DRAG_SPEED;
        motion.yawVelocity = motion.yawVelocity * 0.4 + ((dx * DRAG_SPEED) / elapsed) * 0.6;
        if (!state.turntable) {
          motion.pitch = THREE.MathUtils.clamp(motion.pitch + dy * DRAG_SPEED, -PITCH_LIMIT, PITCH_LIMIT);
          motion.pitchVelocity = motion.pitchVelocity * 0.4 + ((dy * DRAG_SPEED) / elapsed) * 0.6;
        }
        motion.idle = 0;
      }
    }
  };

  const onUp = (event) => {
    const last = pointers.get(event.pointerId);
    if (last && event.timeStamp - last.t > 80) {
      motion.yawVelocity = 0;
      motion.pitchVelocity = 0;
    }
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchStart = 0;
    if (pointers.size === 0) {
      motion.dragging = false;
      domElement.style.cursor = state.dragRotate ? 'grab' : 'default';
    }
  };

  const onLeave = () => {
    motion.tiltGoalX = 0;
    motion.tiltGoalY = 0;
  };

  const onWheel = (event) => {
    if (!state.zoom || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    motion.zoomGoal = THREE.MathUtils.clamp(
      motion.zoomGoal * Math.exp(-event.deltaY * 0.01),
      state.minZoom,
      state.maxZoom
    );
    motion.idle = 0;
  };

  const triggerReset = () => {
    const turns = Math.round((motion.yaw - toRadians(state.startAngle)) / (Math.PI * 2));
    motion.reset = {
      yaw: toRadians(state.startAngle) + turns * Math.PI * 2,
      pitch: toRadians(state.tilt),
    };
    motion.zoomGoal = 1;
    motion.yawVelocity = 0;
    motion.pitchVelocity = 0;
    motion.idle = 0;
  };

  const onDoubleClick = () => {
    if (state.resetOnDoubleClick) triggerReset();
  };

  domElement.addEventListener('pointerdown', onDown);
  domElement.addEventListener('pointermove', onMove);
  domElement.addEventListener('pointerup', onUp);
  domElement.addEventListener('pointercancel', onUp);
  domElement.addEventListener('pointerleave', onLeave);
  domElement.addEventListener('wheel', onWheel, { passive: false });
  domElement.addEventListener('dblclick', onDoubleClick);

  let width = 1;
  let height = 1;
  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let visible = true;
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersectionObserver.observe(container);

  let raf = 0;
  let prevTime = performance.now();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (!visible) {
      prevTime = now;
      return;
    }
    const dt = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;

    motion.clock += dt;
    motion.idle += dt;

    if (motion.intro < 1) {
      motion.intro = reducedMotion ? 1 : Math.min(1, motion.intro + dt / INTRO_SECONDS);
    }
    const eased = 1 - Math.pow(1 - motion.intro, 3);

    if (motion.reset) {
      motion.yaw += (motion.reset.yaw - motion.yaw) * (1 - Math.exp(-dt * 7));
      motion.pitch += (motion.reset.pitch - motion.pitch) * (1 - Math.exp(-dt * 7));
      if (Math.abs(motion.reset.yaw - motion.yaw) < 0.001 && Math.abs(motion.reset.pitch - motion.pitch) < 0.001) {
        motion.reset = null;
      }
    } else if (!motion.dragging) {
      const decay = Math.exp(-dt * 4.5);
      motion.yaw += motion.yawVelocity * dt;
      motion.pitch = THREE.MathUtils.clamp(motion.pitch + motion.pitchVelocity * dt, -PITCH_LIMIT, PITCH_LIMIT);
      motion.yawVelocity *= decay;
      motion.pitchVelocity *= decay;
      if (state.turntable) {
        motion.pitch += (toRadians(state.tilt) - motion.pitch) * (1 - Math.exp(-dt * 4));
      }
    }

    const spinning = state.autoRotate && !reducedMotion && !motion.dragging && motion.idle > state.autoRotateDelay;
    motion.spinSpeed += ((spinning ? state.autoRotateSpeed : 0) - motion.spinSpeed) * (1 - Math.exp(-dt * 2));
    motion.yaw += motion.spinSpeed * dt;

    motion.zoom += (motion.zoomGoal - motion.zoom) * (1 - Math.exp(-dt * 8));
    motion.tiltX += (motion.tiltGoalX - motion.tiltX) * (1 - Math.exp(-dt * 6));
    motion.tiltY += (motion.tiltGoalY - motion.tiltY) * (1 - Math.exp(-dt * 6));

    const aspect = width / Math.max(height, 1);
    const halfView = Math.tan(toRadians(FOV) / 2);
    const fitDistance = bounds.radius / (Math.max(state.fit, 0.05) * halfView * Math.min(1, aspect));
    const distance = fitDistance / motion.zoom;
    camera.aspect = aspect;
    camera.position.set(0, 0, distance);
    camera.near = distance / 50;
    camera.far = distance * 50;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const halfHeight = fitDistance * halfView;
    placeGroup.position.set(state.offsetX * halfHeight * aspect, state.offsetY * halfHeight, 0);

    const rise = state.intro === 'rise' ? (1 - eased) * -0.45 : 0;
    const grow = state.intro === 'rise' ? 0.9 + 0.1 * eased : 1;
    const twist = state.intro === 'spin' ? (1 - eased) * -Math.PI * 1.2 : state.intro === 'rise' ? (1 - eased) * -0.5 : 0;
    const bob = reducedMotion ? 0 : Math.sin(motion.clock * 1.3) * state.float * 0.06;

    floatGroup.position.y = rise + bob;
    floatGroup.scale.setScalar(grow);
    tiltGroup.rotation.set(motion.tiltX, motion.tiltY, 0);
    spinGroup.rotation.set(motion.pitch, motion.yaw + twist, 0, 'YXZ');

    renderer.render(scene, camera);
  };

  raf = requestAnimationFrame(tick);

  return {
    update(next = {}) {
      const prevAngle = state.startAngle;
      const prevTilt = state.tilt;
      state = { ...state, ...next };
      renderer.toneMappingExposure = state.exposure;
      scene.environmentIntensity = state.environmentIntensity;
      shadowMesh.visible = Boolean(state.shadow);
      shadowMat.opacity = state.shadowOpacity;
      domElement.style.cursor = state.dragRotate ? 'grab' : 'default';
      if (next.startAngle !== undefined && next.startAngle !== prevAngle) {
        motion.yaw = toRadians(state.startAngle);
      }
      if (next.tilt !== undefined && next.tilt !== prevTilt) {
        motion.pitch = toRadians(state.tilt);
      }
      loadModel();
    },
    resetView: triggerReset,
    capture: (type = 'image/png') => domElement.toDataURL(type),
    destroy() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.dispose();
      domElement.remove();
    },
  };
}
