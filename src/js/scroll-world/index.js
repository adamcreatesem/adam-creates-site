/* ========================================
   ADAM CREATES — Scroll World (Horizon Landscape)
   A scroll-responsive 3D terrain that transforms
   through each section of the page.
   ======================================== */

import * as THREE from 'three';

// ─── Configuration ─────────────────────────────────────
const CONFIG = {
  LANDSCAPE_WIDTH: 18,
  LANDSCAPE_DEPTH: 32,
  SEGMENTS_W: 70,
  SEGMENTS_D: 110,
  CAMERA_Z_START: -14,
  CAMERA_Z_END: 14,
  CAMERA_HEIGHT: 4.5,
  TERRAIN_OPACITY: 0.3,
  WIRE_OPACITY: 0.025,
  PARTICLE_COUNT: 160,
  TRANSITION_WIDTH: 0.04,
  SCROLL_SMOOTHING: 0.06,
  MOUSE_SMOOTHING: 0.04,
  MAX_ORBIT_Y: 0.06,
  MAX_ORBIT_X: 0.04,
};

// ─── Section Waypoints ─────────────────────────────────
// Each point defines the terrain type + color palette at that scroll position.
// Colors smoothly interpolate between adjacent waypoints.
const WAYPOINTS = [
  { start: 0.00, color: [1.0, 0.23, 0.19], terrainIdx: 0 },  // Hero
  { start: 0.14, color: [1.0, 0.84, 0.0],  terrainIdx: 1 },  // About
  { start: 0.27, color: [0.04, 0.14, 0.39], terrainIdx: 2 },  // Skills
  { start: 0.42, color: [1.0, 0.23, 0.19], terrainIdx: 3 },  // Services
  { start: 0.55, color: [1.0, 0.84, 0.0],  terrainIdx: 4 },  // Work
  { start: 0.68, color: [1.0, 0.23, 0.19], terrainIdx: 5 },  // Process
  { start: 0.82, color: [0.04, 0.14, 0.39], terrainIdx: 6 },  // Contact
];

// ─── Terrain Functions ─────────────────────────────────
// Each function receives (x, z, time) and returns a height value.
// The character of each terrain type reflects the section's mood.

function terrainPeaks(x, z, t) {
  return (
    Math.sin(x * 0.4 + t * 0.08) * 1.5 +
    Math.sin(x * 0.8 + z * 0.5 + t * 0.12) * 1.0 +
    Math.cos(z * 0.3 + t * 0.06) * 0.8 +
    Math.sin((x + z) * 0.6 + t * 0.1) * 0.4
  );
}

function terrainHills(x, z, t) {
  return (
    Math.cos(x * 0.25 + z * 0.15 + t * 0.05) * 0.8 +
    Math.sin(x * 0.5 + z * 0.3 + t * 0.07) * 0.4 +
    Math.cos(z * 0.2 + t * 0.03) * 0.3
  );
}

function terrainGrid(x, z, t) {
  return (
    Math.sin(x * 0.6 + t * 0.06) * 0.6 +
    Math.cos(z * 0.5 + t * 0.08) * 0.6 +
    Math.sin((x + z) * 0.4 + t * 0.05) * 0.4 +
    Math.cos(x * 0.3 - z * 0.3 + t * 0.04) * 0.25
  );
}

function terrainPlateau(x, z, t) {
  const base = Math.sin(x * 0.3 + t * 0.04) * 0.8 + Math.cos(z * 0.25 + t * 0.05) * 0.6;
  const capped = Math.min(base, 1.2);
  const detail = Math.max(0, Math.sin(x * 0.7 + z * 0.5 + t * 0.06) * 0.3 - 0.1);
  return capped + detail;
}

function terrainForest(x, z, t) {
  return (
    Math.sin(x * 0.35 + z * 0.25 + t * 0.06) * 1.2 +
    Math.sin(x * 0.9 + t * 0.1) * 0.6 +
    Math.cos(z * 0.7 + t * 0.08) * 0.5 +
    Math.sin((x + z * 0.5) * 1.2 + t * 0.12) * 0.3
  );
}

function terrainPath(x, z, t) {
  // A channel cuts through the middle; walls rise on either side
  const channelWidth = 1.8;
  const isChannel = Math.abs(x) < channelWidth;
  const wallFactor = isChannel ? -0.7 : 0.9 * (1 - Math.exp(-Math.pow((Math.abs(x) - channelWidth) * 1.2, 2)));
  const base = Math.sin(x * 0.3 + t * 0.04) * 0.4 + Math.cos(z * 0.2 + t * 0.03) * 0.3;
  return base + wallFactor;
}

function terrainHorizon(x, z, t) {
  return (
    Math.sin(x * 0.2 + t * 0.03) * 0.5 +
    Math.cos(z * 0.15 + t * 0.04) * 0.3 +
    Math.sin(x * 0.5 + z * 0.3 + t * 0.05) * 0.2
  );
}

const TERRAIN_FUNCTIONS = [
  terrainPeaks,
  terrainHills,
  terrainGrid,
  terrainPlateau,
  terrainForest,
  terrainPath,
  terrainHorizon,
];

// ─── Utility ───────────────────────────────────────────
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function lerpColor(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// ─── Main Initializer ──────────────────────────────────
export function initScrollWorld() {
  // ── Container ──
  let container = document.getElementById('scroll-world-canvas');
  if (!container) {
    container = document.createElement('div');
    container.id = 'scroll-world-canvas';
    container.className = 'scroll-world-container';
    document.body.prepend(container);
  }

  const W = CONFIG.LANDSCAPE_WIDTH;
  const D = CONFIG.LANDSCAPE_DEPTH;
  const SEG_W = CONFIG.SEGMENTS_W;
  const SEG_D = CONFIG.SEGMENTS_D;

  // ── Scene ──
  const scene = new THREE.Scene();

  // ── Camera ──
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_Z_START);

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Build Terrain Geometry ──
  const vertexCount = (SEG_W + 1) * (SEG_D + 1);
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const basePos = new Float32Array(vertexCount * 3); // static x,z references

  let idx = 0;
  for (let iz = 0; iz <= SEG_D; iz++) {
    const z = (iz / SEG_D - 0.5) * D;
    for (let ix = 0; ix <= SEG_W; ix++) {
      const x = (ix / SEG_W - 0.5) * W;
      basePos[idx * 3] = x;
      basePos[idx * 3 + 1] = 0;
      basePos[idx * 3 + 2] = z;
      idx++;
    }
  }

  // Indices
  const indices = [];
  for (let iz = 0; iz < SEG_D; iz++) {
    for (let ix = 0; ix < SEG_W; ix++) {
      const a = iz * (SEG_W + 1) + ix;
      const b = iz * (SEG_W + 1) + ix + 1;
      const c = (iz + 1) * (SEG_W + 1) + ix;
      const d = (iz + 1) * (SEG_W + 1) + ix + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const terrainGeo = new THREE.BufferGeometry();
  terrainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.setIndex(indices);
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: CONFIG.TERRAIN_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  scene.add(terrain);

  // ── Subtle Wireframe Overlay ──
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true,
    transparent: true,
    opacity: CONFIG.WIRE_OPACITY,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const wireGeo = terrainGeo.clone();
  const wireframe = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireframe);

  // ── Atmospheric Particles ──
  const pCount = CONFIG.PARTICLE_COUNT;
  const pPositions = new Float32Array(pCount * 3);
  const pData = [];

  for (let i = 0; i < pCount; i++) {
    const px = (Math.random() - 0.5) * W * 1.3;
    const pz = (Math.random() - 0.5) * D;
    const py = Math.random() * 3 + 0.5;
    pPositions[i * 3] = px;
    pPositions[i * 3 + 1] = py;
    pPositions[i * 3 + 2] = pz;
    pData.push({
      x: px, y: py, z: pz,
      baseX: px, baseZ: pz,
      vx: (Math.random() - 0.5) * 0.004,
      vy: (Math.random() - 0.5) * 0.002,
      vz: (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.25,
      size: 0.03 + Math.random() * 0.05,
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0xFFD700,
    size: 0.04,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Fog (ambient depth) ──
  const fog = new THREE.FogExp2(0xF5F0EB, 0.018);
  scene.fog = fog;

  // ── Mouse Tracking ──
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  function onMouseMove(e) {
    targetRotY = ((e.clientX / window.innerWidth) * 2 - 1) * CONFIG.MAX_ORBIT_Y;
    targetRotX = ((e.clientY / window.innerHeight) * 2 - 1) * CONFIG.MAX_ORBIT_X;
  }

  function onMouseLeave() {
    targetRotX = 0;
    targetRotY = 0;
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);

  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = (t.clientX - touchStartX) / window.innerWidth;
    const dy = (t.clientY - touchStartY) / window.innerHeight;
    targetRotY = dx * CONFIG.MAX_ORBIT_Y * 2;
    targetRotX = dy * CONFIG.MAX_ORBIT_X * 2;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    targetRotX = 0;
    targetRotY = 0;
  });

  // ── Scroll Tracking ──
  let rawScroll = 0;
  let smoothScroll = 0;
  let cachedMaxScroll = 1;

  function recalcMaxScroll() {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const winHeight = window.innerHeight;
    cachedMaxScroll = Math.max(docHeight - winHeight, 1);
  }

  recalcMaxScroll();
  window.addEventListener('resize', recalcMaxScroll);

  function getScrollRatio() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    return Math.min(Math.max(scrollTop / cachedMaxScroll, 0), 1);
  }

  // ── Section Parameter Interpolation ──
  function getParams(scrollPos) {
    const clamped = Math.max(0, Math.min(1, scrollPos));

    let i = 0;
    for (; i < WAYPOINTS.length - 1; i++) {
      if (clamped >= WAYPOINTS[i].start && clamped < WAYPOINTS[i + 1].start) {
        break;
      }
    }

    const current = WAYPOINTS[i];
    const next = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)];
    const range = next.start - current.start;
    const localT = range > 0 ? (clamped - current.start) / range : 0;
    const smoothT = smoothstep(Math.max(0, Math.min(1, localT)));

    return {
      color: lerpColor(current.color, next.color, smoothT),
      terrainIdx1: current.terrainIdx,
      terrainIdx2: next.terrainIdx,
      blend: smoothT,
    };
  }

  // ── Animation Loop ──
  const clock = new THREE.Clock();
  let animFrame = null;

  function animate() {
    const elapsed = clock.getElapsedTime();

    // Smooth scroll
    rawScroll = getScrollRatio();
    smoothScroll += (rawScroll - smoothScroll) * CONFIG.SCROLL_SMOOTHING;

    // Get section parameters
    const params = getParams(smoothScroll);
    const fn1 = TERRAIN_FUNCTIONS[params.terrainIdx1];
    const fn2 = TERRAIN_FUNCTIONS[params.terrainIdx2];
    const blend = params.blend;

    // Camera position
    const camZ = CONFIG.CAMERA_Z_START +
      (CONFIG.CAMERA_Z_END - CONFIG.CAMERA_Z_START) * smoothScroll;

    // Smooth mouse orbit
    currentRotX += (targetRotX - currentRotX) * CONFIG.MOUSE_SMOOTHING;
    currentRotY += (targetRotY - currentRotY) * CONFIG.MOUSE_SMOOTHING;

    camera.position.x = Math.sin(currentRotY) * 2.5;
    camera.position.y = CONFIG.CAMERA_HEIGHT + currentRotX * 1.5;
    camera.position.z = camZ;
    camera.lookAt(0, -0.3, camZ - 2);

    // ── Update Terrain Vertices ──
    const posAttr = terrain.geometry.attributes.position;
    const colAttr = terrain.geometry.attributes.color;
    const pos = posAttr.array;
    const col = colAttr.array;

    for (let i = 0; i < vertexCount; i++) {
      const bx = basePos[i * 3];
      const bz = basePos[i * 3 + 2];

      // Blend between two terrain functions
      const h1 = fn1(bx, bz, elapsed);
      const h2 = fn2(bx, bz, elapsed);
      const h = h1 + (h2 - h1) * blend;

      // Apply terrain height (scaled down for subtlety)
      const height = h * 0.55;

      pos[i * 3] = bx + currentRotY * 0.3;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = bz;

      // Vertex color: base palette + height-based brightness + lateral warmth shift
      const brightness = 0.55 + (height / 2.5) * 0.35;
      const lateral = 1.0 + (bx / W) * 0.15;

      col[i * 3]     = Math.min(1, Math.max(0.08, params.color[0] * brightness * lateral));
      col[i * 3 + 1] = Math.min(1, Math.max(0.08, params.color[1] * brightness * lateral));
      col[i * 3 + 2] = Math.min(1, Math.max(0.08, params.color[2] * brightness * lateral));
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // ── Update Wireframe ──
    const wirePos = wireframe.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i++) {
      wirePos[i] = pos[i];
    }
    wireframe.geometry.attributes.position.needsUpdate = true;

    // ── Update Particles ──
    const pPos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      const d = pData[i];
      d.x += d.vx + Math.sin(elapsed * d.speed + d.phase) * 0.002;
      d.z += d.vz + Math.cos(elapsed * d.speed * 0.7 + d.phase) * 0.002;
      d.y += d.vy + Math.sin(elapsed * d.speed * 0.5 + d.phase) * 0.003;

      // Wrap around
      const hw = W * 0.7;
      const hd = D * 0.55;
      if (d.x > hw) d.x = -hw;
      if (d.x < -hw) d.x = hw;
      if (d.z > hd) d.z = -hd;
      if (d.z < -hd) d.z = hd;
      if (d.y > 4) d.y = 0.5;
      if (d.y < 0.5) d.y = 4;

      pPos[i * 3]     = d.x + currentRotY * 0.2;
      pPos[i * 3 + 1] = d.y;
      pPos[i * 3 + 2] = d.z;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Particle color follows section
    pMat.color.setRGB(params.color[0], params.color[1], params.color[2]);

    // ── Update Fog for Theme ──
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    fog.color.set(isDark ? 0x121212 : 0xF5F0EB);
    fog.density = 0.015 + smoothScroll * 0.02;

    // Section-based wireframe color tint
    wireframe.material.color.setRGB(
      params.color[0] * 0.5 + 0.5,
      params.color[1] * 0.5 + 0.5,
      params.color[2] * 0.5 + 0.5
    );

    renderer.render(scene, camera);
    animFrame = requestAnimationFrame(animate);
  }

  // ── Start ──
  animFrame = requestAnimationFrame(animate);

  // ── Resize ──
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // ── Theme observer ──
  const themeObserver = new MutationObserver(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    fog.color.set(isDark ? 0x121212 : 0xF5F0EB);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── Cleanup ──
  return function destroyScrollWorld() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    themeObserver.disconnect();

    scene.traverse((child) => {
      if (child.isMesh || child.isPoints) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
    renderer.dispose();

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };
}
