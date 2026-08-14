/* ========================================
   ADAM CREATES — Three.js 3D Effects
   Atom Hero, Skill Globe, Liquid Shapes, Particles
   ======================================== */

import * as THREE from 'three';

// ─── Shared State ───
let mouseX = 0;
let mouseY = 0;
const clock = new THREE.Clock();
const scenes = [];

// ─── 1. ATOM HERO ─────────────────────────────────────
export function initHeroAtom() {
  const container = document.getElementById('hero3d-container');
  if (!container) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 320;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Nucleus Core ──
  const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0xFF3B30,
    metalness: 0.2,
    roughness: 0.3,
    emissive: 0xFF3B30,
    emissiveIntensity: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // ── Inner Glow (slightly larger, transparent) ──
  const glowGeo = new THREE.SphereGeometry(0.7, 32, 32);
  const glowMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.15,
    emissive: 0xFFD700,
    emissiveIntensity: 0.2,
    metalness: 0,
    roughness: 0.5,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glow);

  // ── Protons (red particles inside nucleus) ──
  const protonGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const pGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const pMat = new THREE.MeshPhysicalMaterial({
      color: 0xFF6B6B,
      emissive: 0xFF3B30,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.3,
    });
    const proton = new THREE.Mesh(pGeo, pMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.3 + Math.random() * 0.15;
    proton.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    protonGroup.add(proton);
  }
  scene.add(protonGroup);

  // ── Neutrons (blue particles inside nucleus) ──
  const neutronGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const nGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const nMat = new THREE.MeshPhysicalMaterial({
      color: 0x6B9FFF,
      emissive: 0x0A2463,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.3,
    });
    const neutron = new THREE.Mesh(nGeo, nMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.3 + Math.random() * 0.15;
    neutron.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    neutronGroup.add(neutron);
  }
  scene.add(neutronGroup);

  // ── Orbital Ring 1 (horizontal, red) ──
  const ring1Geo = new THREE.TorusGeometry(1.4, 0.015, 48, 64);
  const ring1Mat = new THREE.MeshPhysicalMaterial({
    color: 0xFF3B30,
    transparent: true,
    opacity: 0.25,
    emissive: 0xFF3B30,
    emissiveIntensity: 0.1,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  scene.add(ring1);

  // ── Orbital Ring 2 (tilted, gold) ──
  const ring2Geo = new THREE.TorusGeometry(1.7, 0.012, 48, 64);
  const ring2Mat = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.2,
    emissive: 0xFFD700,
    emissiveIntensity: 0.08,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = Math.PI / 5;
  scene.add(ring2);

  // ── Orbital Ring 3 (vertical, blue) ──
  const ring3Geo = new THREE.TorusGeometry(2.0, 0.01, 32, 64);
  const ring3Mat = new THREE.MeshPhysicalMaterial({
    color: 0x6B9FFF,
    transparent: true,
    opacity: 0.15,
    emissive: 0x0A2463,
    emissiveIntensity: 0.05,
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.y = Math.PI / 3;
  ring3.rotation.x = Math.PI / 4;
  scene.add(ring3);

  // ── Electrons (glowing dots on each ring) ──
  function createElectron(color, orbitRadius, orbitAngle) {
    const group = new THREE.Group();

    const dotGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const dotMat = new THREE.MeshPhysicalMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0,
      roughness: 0.1,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(0, 0, 0);
    group.add(dot);

    // Glow trail — offset behind dot in group's local X
    const trailGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const trailMat = new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      emissive: color,
      emissiveIntensity: 0.2,
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.set(-0.08, 0, 0);
    group.add(trail);

    return { group, dot, trail, orbitRadius, speed: 0.6 + Math.random() * 0.3, angleOffset: orbitAngle };
  }

  // Electrons on ring 1 (3 electrons)
  const electrons1 = [];
  for (let i = 0; i < 3; i++) {
    const e = createElectron(0xFF3B30, 1.4, (i / 3) * Math.PI * 2);
    scene.add(e.group);
    electrons1.push(e);
  }

  // Electrons on ring 2 (2 electrons)
  const electrons2 = [];
  for (let i = 0; i < 2; i++) {
    const e = createElectron(0xFFD700, 1.7, (i / 2) * Math.PI * 2);
    scene.add(e.group);
    electrons2.push(e);
  }

  // Electrons on ring 3 (1 electron)
  const electrons3 = [];
  const e3 = createElectron(0x6B9FFF, 2.0, 0);
  scene.add(e3.group);
  electrons3.push(e3);

  // Reusable vectors for quaternion-based electron positioning
  const _v = new THREE.Vector3();
  const _q = new THREE.Quaternion();

  // ── Ambient Particles (tiny stars floating) ──
  const starCount = 120;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 3;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xFFD700,
    size: 0.025,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── Lights ──
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xFF6B6B, 0.3);
  fillLight.position.set(-3, 1, 2);
  scene.add(fillLight);

  // ── Animation ──
  function animate() {
    const elapsed = clock.getElapsedTime();

    // Slowly rotate nucleus parts
    protonGroup.rotation.x = elapsed * 0.15;
    protonGroup.rotation.y = elapsed * 0.2;
    neutronGroup.rotation.x = elapsed * 0.12;
    neutronGroup.rotation.y = elapsed * 0.18;

    // Pulsing glow
    glow.material.opacity = 0.12 + 0.06 * Math.sin(elapsed * 0.8);

    // Rotate rings at different speeds
    ring1.rotation.z = elapsed * 0.15;
    ring2.rotation.z = elapsed * 0.1 + Math.PI / 5;
    ring2.rotation.x = Math.PI / 3 + elapsed * 0.08;
    ring3.rotation.y = Math.PI / 3 + elapsed * 0.12;
    ring3.rotation.x = Math.PI / 4 + elapsed * 0.06;

    // Orbit electrons following ring paths using ring quaternions
    // TorusGeometry default ring path is in XY plane: (R*cos(u), R*sin(u), 0)
    ring1.getWorldQuaternion(_q);
    electrons1.forEach((e) => {
      const angle = elapsed * e.speed + e.angleOffset;
      _v.set(e.orbitRadius * Math.cos(angle), e.orbitRadius * Math.sin(angle), 0);
      _v.applyQuaternion(_q);
      e.group.position.copy(_v);
    });

    ring2.getWorldQuaternion(_q);
    electrons2.forEach((e) => {
      const angle = -elapsed * e.speed + e.angleOffset;
      _v.set(e.orbitRadius * Math.cos(angle), e.orbitRadius * Math.sin(angle), 0);
      _v.applyQuaternion(_q);
      e.group.position.copy(_v);
    });

    ring3.getWorldQuaternion(_q);
    electrons3.forEach((e) => {
      const angle = elapsed * e.speed;
      _v.set(e.orbitRadius * Math.cos(angle), e.orbitRadius * Math.sin(angle), 0);
      _v.applyQuaternion(_q);
      e.group.position.copy(_v);
    });

    // Slow star rotation
    stars.rotation.y = elapsed * 0.02;

    // Mouse parallax — gentle lean of everything
    const leanX = mouseX * 0.15;
    const leanY = mouseY * 0.1;
    core.rotation.x += (leanY - core.rotation.x) * 0.01;
    core.rotation.y += (leanX - core.rotation.y) * 0.01;
    protonGroup.rotation.x += (leanY - protonGroup.rotation.x) * 0.008;
    neutronGroup.rotation.x += (leanY - neutronGroup.rotation.x) * 0.008;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  scenes.push({ scene, camera, renderer, id: 'heroAtom' });

  function onResize() {
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 320;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}

// ─── 2. SKILL GLOBE ────────────────────────────────────
export function initSkillGlobe() {
  const container = document.getElementById('skills3d-container');
  if (!container) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Core Sphere (subtle) ──
  const sphereGeo = new THREE.IcosahedronGeometry(1.0, 2);
  const sphereMat = new THREE.MeshPhysicalMaterial({
    color: 0x0A2463,
    metalness: 0.1,
    roughness: 0.5,
    transparent: true,
    opacity: 0.2,
    emissive: 0x0A2463,
    emissiveIntensity: 0.05,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // ── Wireframe Overlay ──
  const wireGeo = new THREE.IcosahedronGeometry(1.05, 1);
  const wireMat = new THREE.MeshPhysicalMaterial({
    color: 0xFF3B30,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const wireframe = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireframe);

  // ── Orbital Rings ──
  const ring1Geo = new THREE.TorusGeometry(1.5, 0.008, 32, 64);
  const ring1Mat = new THREE.MeshPhysicalMaterial({
    color: 0xFF3B30,
    transparent: true,
    opacity: 0.12,
    emissive: 0xFF3B30,
    emissiveIntensity: 0.05,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  scene.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(1.8, 0.006, 16, 64);
  const ring2Mat = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.08,
    emissive: 0xFFD700,
    emissiveIntensity: 0.03,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.z = Math.PI / 3;
  ring2.rotation.x = Math.PI / 4;
  scene.add(ring2);

  // ── Orbiting Dots ──
  const dotCount = 30;
  const dotGroup = new THREE.Group();
  const dotData = [];

  for (let i = 0; i < dotCount; i++) {
    const theta = (i / dotCount) * Math.PI * 2;
    const phi = Math.acos(2 * (i / dotCount) - 1 + (1 / dotCount));
    const r = 1.6 + Math.random() * 0.4;

    const dGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const dMat = new THREE.MeshPhysicalMaterial({
      color: i % 3 === 0 ? 0xFF3B30 : i % 3 === 1 ? 0xFFD700 : 0x6B9FFF,
      emissive: i % 3 === 0 ? 0xFF3B30 : i % 3 === 1 ? 0xFFD700 : 0x6B9FFF,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.4,
    });
    const dot = new THREE.Mesh(dGeo, dMat);
    dot.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    dotGroup.add(dot);
    dotData.push({ dot, theta, phi, r, speed: 0.2 + Math.random() * 0.2 });
  }
  scene.add(dotGroup);

  // ── Lights ──
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(2, 3, 4);
  scene.add(light);

  // ── Animation ──
  function animate() {
    const elapsed = clock.getElapsedTime();

    sphere.rotation.x = elapsed * 0.08;
    sphere.rotation.y = elapsed * 0.12;
    wireframe.rotation.x = elapsed * 0.06;
    wireframe.rotation.y = elapsed * 0.1;

    ring1.rotation.z = elapsed * 0.06;
    ring2.rotation.y = elapsed * 0.08;

    // Orbit dots slowly
    dotData.forEach((d, i) => {
      const newTheta = d.theta + elapsed * d.speed * 0.015;
      const newPhi = d.phi + Math.sin(elapsed * 0.1 + i) * 0.005;
      d.dot.position.set(
        d.r * Math.sin(newPhi) * Math.cos(newTheta),
        d.r * Math.sin(newPhi) * Math.sin(newTheta),
        d.r * Math.cos(newPhi)
      );
      d.dot.material.opacity = 0.25 + 0.2 * Math.sin(elapsed * 0.3 + i);
    });

    // Mouse lean
    dotGroup.rotation.x += (mouseY * 0.05 - dotGroup.rotation.x) * 0.008;
    dotGroup.rotation.y += (mouseX * 0.05 - dotGroup.rotation.y) * 0.008;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  scenes.push({ scene, camera, renderer, id: 'skillGlobe' });

  function onResize() {
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}

// ─── 3. LIQUID MORPHING SHAPES ─────────────────────────
export function initLiquidShapes() {
  const container = document.getElementById('liquid3d-container');
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.z = 14;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Subtle Blobs ──
  const blobs = [];
  const configs = [
    { color: 0xFF3B30, size: 2.5, px: -3, py: 1, pz: -4, speed: 0.2 },
    { color: 0xFFD700, size: 2.0, px: 4, py: -2, pz: -3, speed: 0.15 },
    { color: 0x0A2463, size: 2.2, px: 0, py: -3, pz: -5, speed: 0.18 },
  ];

  configs.forEach((cfg) => {
    const geo = new THREE.SphereGeometry(cfg.size, 48, 48);
    const mat = new THREE.MeshPhysicalMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.04,
      metalness: 0,
      roughness: 0.6,
      emissive: cfg.color,
      emissiveIntensity: 0.02,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.px, cfg.py, cfg.pz);
    scene.add(mesh);
    blobs.push({
      mesh,
      origPos: geo.attributes.position.array.slice(),
      px: cfg.px, py: cfg.py, pz: cfg.pz,
      speed: cfg.speed,
    });
  });

  // ── Animation ──
  function animate() {
    const elapsed = clock.getElapsedTime();

    blobs.forEach((b, i) => {
      const positions = b.mesh.geometry.attributes.position.array;
      const orig = b.origPos;

      for (let j = 0; j < positions.length; j += 3) {
        const dist = Math.sqrt(orig[j] ** 2 + orig[j + 1] ** 2 + orig[j + 2] ** 2);
        const wave = Math.sin(dist * 2 + elapsed * b.speed + i) * 0.25;
        const factor = (dist + wave) / dist;
        positions[j] = orig[j] * factor;
        positions[j + 1] = orig[j + 1] * factor;
        positions[j + 2] = orig[j + 2] * factor;
      }
      b.mesh.geometry.attributes.position.needsUpdate = true;
      b.mesh.geometry.computeVertexNormals();

      // Slow drift
      b.mesh.position.x = b.px + Math.sin(elapsed * 0.06 + i * 2) * 0.8;
      b.mesh.position.y = b.py + Math.cos(elapsed * 0.05 + i * 1.5) * 0.8;
      b.mesh.material.opacity = 0.035 + 0.02 * Math.sin(elapsed * 0.15 + i);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  scenes.push({ scene, camera, renderer, id: 'liquidShapes' });

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);
  return () => ro.disconnect();
}

// ─── 4. BACKGROUND PARTICLES ───────────────────────────
export function initBgParticles() {
  const container = document.getElementById('particles3d-container');
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const count = Math.min(Math.floor((width * height) / 20000), 120);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = [];

  const c1 = new THREE.Color(0xFF3B30);
  const c2 = new THREE.Color(0xFFD700);
  const c3 = new THREE.Color(0x6B9FFF);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const col = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ── Connection Lines ──
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xFF3B30,
    transparent: true,
    opacity: 0.02,
    blending: THREE.AdditiveBlending,
  });
  const lineGeo = new THREE.BufferGeometry();
  const maxLines = count * 2;
  const linePositions = new Float32Array(maxLines * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ── Animation ──
  function animate() {
    const pos = particles.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;

      if (pos[i * 3] > 18) pos[i * 3] = -18;
      if (pos[i * 3] < -18) pos[i * 3] = 18;
      if (pos[i * 3 + 1] > 18) pos[i * 3 + 1] = -18;
      if (pos[i * 3 + 1] < -18) pos[i * 3 + 1] = 18;

      // Gentle mouse repulsion
      const dx = pos[i * 3] - mouseX * 4;
      const dy = pos[i * 3 + 1] - (-mouseY * 4);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        const force = ((4 - dist) / 4) * 0.03;
        pos[i * 3] += (dx / (dist + 0.001)) * force;
        pos[i * 3 + 1] += (dy / (dist + 0.001)) * force;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Connection lines
    let idx = 0;
    const cd = 3.5;
    for (let i = 0; i < count && idx < maxLines; i++) {
      for (let j = i + 1; j < count && idx < maxLines; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < cd) {
          linePositions[idx * 6] = pos[i * 3];
          linePositions[idx * 6 + 1] = pos[i * 3 + 1];
          linePositions[idx * 6 + 2] = pos[i * 3 + 2];
          linePositions[idx * 6 + 3] = pos[j * 3];
          linePositions[idx * 6 + 4] = pos[j * 3 + 1];
          linePositions[idx * 6 + 5] = pos[j * 3 + 2];
          idx++;
        }
      }
    }
    lineGeo.setDrawRange(0, idx * 2);
    lineGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  scenes.push({ scene, camera, renderer, id: 'bgParticles' });

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);
  return () => ro.disconnect();
}

// ─── MOUSE & TOUCH TRACKING ──────────────────────────────
export function init3DMouseTracking() {
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
  document.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

  // Touch support for mobile (tap, drag on atom)
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (touch) {
      mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      mouseY = (touch.clientY / window.innerHeight) * 2 - 1;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) {
      mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      mouseY = (touch.clientY / window.innerHeight) * 2 - 1;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    // Smoothly return to center after touch
    mouseX = 0;
    mouseY = 0;
  });

  document.addEventListener('touchcancel', () => {
    mouseX = 0;
    mouseY = 0;
  });
}

// ─── CLEANUP ──────────────────────────────────────────
export function dispose3DScenes() {
  scenes.forEach(({ scene, renderer }) => {
    scene.traverse((child) => {
      if (child.isMesh || child.isPoints || child.isLineSegments) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
    renderer.dispose();
  });
  scenes.length = 0;
}
