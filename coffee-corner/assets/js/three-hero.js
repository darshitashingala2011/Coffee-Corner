/**
 * ============================================================================
 * COFFEE CORNER - 3D INTERACTIVE THREE.JS HERO EXPERIENCE
 * Features:
 * - Handcrafted procedural porcelain Coffee Cup with inner cavity & gold rim
 * - Ergonomic curved ceramic handle
 * - Porcelain Saucer with center depression & metallic trim
 * - Artisanal metallic Gold Stirring Spoon resting beside the cup
 * - Procedural 3D Coffee Beans with realistic center crease
 * - Procedural dynamic Canvas Latte Art (Caramel Drizzle, Rosetta, Matcha, Crema)
 * - Rising 3D steam particle simulation with progressive alpha dissipation
 * - Full 360° mouse & touch drag inspection with physics inertia & mouse parallax
 * - Interactive Flavor Switcher: Caramel Velvet, Flat White, Matcha Uji, Dark Crema
 * ============================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  // Flavor Configurations
  const FLAVORS = {
    caramel: {
      name: 'Caramel Velvet Macchiato',
      liquidColor: 0x5c3317,
      cupColor: 0xf6efe6,
      foamColor: '#f7ebd2',
      artType: 'caramel-drizzle',
      steamColor: 0xdeb887,
      lightColor: 0xffd199
    },
    flatwhite: {
      name: 'Golden Honeycomb Flat White',
      liquidColor: 0x734822,
      cupColor: 0xfcf9f2,
      foamColor: '#fff5ea',
      artType: 'tulip-art',
      steamColor: 0xf5deb3,
      lightColor: 0xffe0a3
    },
    matcha: {
      name: 'Ceremonial Matcha Latte',
      liquidColor: 0x3d5a28,
      cupColor: 0x242e22,
      foamColor: '#c5d9a5',
      artType: 'matcha-leaf',
      steamColor: 0xbfd8bd,
      lightColor: 0xa7c957
    },
    espresso: {
      name: 'Obsidian Crema Espresso',
      liquidColor: 0x1f1107,
      cupColor: 0x1e1b19,
      foamColor: '#a66a38',
      artType: 'espresso-crema',
      steamColor: 0xc89666,
      lightColor: 0xffaa5e
    }
  };

  let activeFlavorKey = 'caramel';

  // Three.js Core Variables
  let scene, camera, renderer;
  let cupGroup, liquidMesh, cupMaterial, liquidMaterial, saucerMaterial;
  let steamParticles = [];
  let floatingBeans = [];
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotation = { x: 0.28, y: -0.45 };
  let currentRotation = { x: 0.28, y: -0.45 };
  let mouseNormalized = { x: 0, y: 0 };
  let pointLight, spotLight;

  function initThree() {
    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 2.0, 6.4);
    camera.lookAt(0, 0.3, 0);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    setupLighting();

    // 5. Build 3D Coffee Cup & Saucer Group
    buildCoffeeCup();

    // 6. Build 3D Coffee Spoon
    buildCoffeeSpoon();

    // 7. Build 3D Floating Coffee Beans
    buildFloatingBeans();

    // 8. Build Steam Particle System
    buildSteamSystem();

    // 9. Event Listeners
    setupEvents();

    // 10. Start Animation Loop
    animate();
  }

  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.85);
    scene.add(ambientLight);

    // Warm Key Spotlight
    spotLight = new THREE.SpotLight(0xffdfba, 2.5);
    spotLight.position.set(4.5, 7.5, 5.0);
    spotLight.angle = Math.PI / 4.2;
    spotLight.penumbra = 0.65;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Warm Caramel Back Rim Light
    pointLight = new THREE.PointLight(0xd49b6a, 2.0, 22);
    pointLight.position.set(-4.2, 3.2, -3.2);
    scene.add(pointLight);

    // Subtle Fill Light from bottom
    const fillLight = new THREE.DirectionalLight(0xb87b46, 0.45);
    fillLight.position.set(0, -3.5, 3.0);
    scene.add(fillLight);
  }

  // Generates dynamic latte art canvas texture
  function generateLatteArtCanvas(artType, foamHex, baseHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base coffee liquid
    ctx.fillStyle = baseHex;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Radial crema gradient
    const gradient = ctx.createRadialGradient(256, 256, 110, 256, 256, 252);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.65, 'rgba(180, 110, 50, 0.28)');
    gradient.addColorStop(1, 'rgba(90, 45, 18, 0.68)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Foam pattern
    ctx.fillStyle = foamHex;
    ctx.strokeStyle = '#c58f5e';
    ctx.lineWidth = 4;

    if (artType === 'caramel-drizzle') {
      // Swirling rosette petals
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        const cx = 256 + Math.cos(rad) * 62;
        const cy = 256 + Math.sin(rad) * 62;
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      }
      ctx.fill();

      // Caramel spiral drizzle
      ctx.strokeStyle = '#9e521e';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.1) {
        const r = 18 * a;
        const x = 256 + Math.cos(a) * r;
        const y = 256 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Delicate caramel star drops
      ctx.fillStyle = '#b86b2d';
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(256 + Math.cos(rad) * 110, 256 + Math.sin(rad) * 110, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (artType === 'tulip-art' || artType === 'matcha-leaf') {
      // Barista Rosetta / Heart
      ctx.beginPath();
      ctx.ellipse(256, 300, 80, 58, 0, 0, Math.PI * 2);
      ctx.ellipse(256, 235, 65, 48, 0, 0, Math.PI * 2);
      ctx.ellipse(256, 175, 48, 36, 0, 0, Math.PI * 2);
      ctx.ellipse(256, 125, 30, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stem pull cut line
      ctx.strokeStyle = baseHex;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(256, 105);
      ctx.lineTo(256, 345);
      ctx.stroke();
    } else {
      // Espresso Crema marbling
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(220, 150, 90, ${0.12 + Math.random() * 0.28})`;
        ctx.beginPath();
        const rx = 160 + Math.random() * 190;
        const ry = 160 + Math.random() * 190;
        ctx.arc(rx, ry, 20 + Math.random() * 50, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  }

  function buildCoffeeCup() {
    cupGroup = new THREE.Group();

    const currentFlav = FLAVORS[activeFlavorKey];

    // Porcelain Glaze Material
    cupMaterial = new THREE.MeshStandardMaterial({
      color: currentFlav.cupColor,
      roughness: 0.22,
      metalness: 0.08
    });

    // Metallic Gold Trim Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.2,
      metalness: 0.88
    });

    // 1. Cup Body (Smooth tapered mug geometry)
    const cupHeight = 2.15;
    const cupGeo = new THREE.CylinderGeometry(1.42, 0.96, cupHeight, 64, 1, false);
    const cupMesh = new THREE.Mesh(cupGeo, cupMaterial);
    cupMesh.castShadow = true;
    cupMesh.receiveShadow = true;
    cupMesh.position.y = 1.07;
    cupGroup.add(cupMesh);

    // Gold Cup Rim
    const rimGeo = new THREE.TorusGeometry(1.42, 0.045, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, goldMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 2.15;
    cupGroup.add(rimMesh);

    // 2. Liquid Surface & Dynamic Latte Art
    const canvasArt = generateLatteArtCanvas(currentFlav.artType, currentFlav.foamColor, '#3e1f0d');
    const artTexture = new THREE.CanvasTexture(canvasArt);

    liquidMaterial = new THREE.MeshStandardMaterial({
      map: artTexture,
      roughness: 0.35,
      metalness: 0.05
    });

    const liquidGeo = new THREE.CircleGeometry(1.38, 64);
    liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 2.0;
    cupGroup.add(liquidMesh);

    // 3. Ergonomic Cup Handle
    const handleGeo = new THREE.TorusGeometry(0.72, 0.13, 24, 64, Math.PI * 1.05);
    const handleMesh = new THREE.Mesh(handleGeo, cupMaterial);
    handleMesh.rotation.z = -Math.PI / 1.15;
    handleMesh.position.set(1.48, 1.08, 0);
    handleMesh.castShadow = true;
    cupGroup.add(handleMesh);

    // Handle Gold Ring Detail
    const handleRingGeo = new THREE.TorusGeometry(0.14, 0.03, 16, 32);
    const handleRing = new THREE.Mesh(handleRingGeo, goldMaterial);
    handleRing.position.set(1.48, 1.45, 0);
    handleRing.rotation.y = Math.PI / 2;
    cupGroup.add(handleRing);

    // 4. Porcelain Saucer with Center Depression & Gold Trim
    saucerMaterial = new THREE.MeshStandardMaterial({
      color: currentFlav.cupColor,
      roughness: 0.25,
      metalness: 0.06
    });

    const saucerGeo = new THREE.CylinderGeometry(2.4, 1.45, 0.24, 64);
    const saucerMesh = new THREE.Mesh(saucerGeo, saucerMaterial);
    saucerMesh.position.y = 0.06;
    saucerMesh.receiveShadow = true;
    saucerMesh.castShadow = true;
    cupGroup.add(saucerMesh);

    const saucerRimGeo = new THREE.TorusGeometry(2.4, 0.038, 16, 64);
    const saucerRim = new THREE.Mesh(saucerRimGeo, goldMaterial);
    saucerRim.rotation.x = Math.PI / 2;
    saucerRim.position.y = 0.18;
    cupGroup.add(saucerRim);

    // Center cup group
    cupGroup.position.set(0, -0.7, 0);
    scene.add(cupGroup);
  }

  // Builds an artisanal metallic coffee spoon resting on the saucer
  function buildCoffeeSpoon() {
    const spoonGroup = new THREE.Group();

    const goldSpoonMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.18,
      metalness: 0.92
    });

    // Spoon Bowl (ellipsoid cup)
    const bowlGeo = new THREE.SphereGeometry(0.24, 24, 16);
    bowlGeo.scale(1.4, 0.45, 0.9);
    const bowlMesh = new THREE.Mesh(bowlGeo, goldSpoonMat);
    bowlMesh.position.set(-1.6, 0.14, 0.6);
    bowlMesh.rotation.set(0.1, 0.4, -0.15);
    bowlMesh.castShadow = true;
    spoonGroup.add(bowlMesh);

    // Spoon Handle
    const spoonHandleGeo = new THREE.CylinderGeometry(0.035, 0.05, 2.1, 16);
    const spoonHandleMesh = new THREE.Mesh(spoonHandleGeo, goldSpoonMat);
    spoonHandleMesh.rotation.set(Math.PI / 2.2, 0.35, -0.6);
    spoonHandleMesh.position.set(-0.7, 0.16, 1.3);
    spoonHandleMesh.castShadow = true;
    spoonGroup.add(spoonHandleMesh);

    cupGroup.add(spoonGroup);
  }

  // Realistic Procedural Coffee Bean Geometry Creation
  function createRealisticCoffeeBeanMesh(material) {
    const beanGroup = new THREE.Group();

    // Main bean halves creating the curved indentation crease
    const halfGeo = new THREE.SphereGeometry(0.22, 24, 24);
    halfGeo.scale(1.35, 0.7, 0.85);

    // Left half
    const leftMesh = new THREE.Mesh(halfGeo, material);
    leftMesh.position.z = 0.05;
    leftMesh.scale.set(0.95, 1, 0.9);
    beanGroup.add(leftMesh);

    // Right half
    const rightMesh = new THREE.Mesh(halfGeo, material);
    rightMesh.position.z = -0.05;
    rightMesh.scale.set(0.95, 1, 0.9);
    beanGroup.add(rightMesh);

    // Center indentation crease line
    const creaseGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.46, 12);
    const darkCreaseMat = new THREE.MeshStandardMaterial({
      color: 0x180b04,
      roughness: 0.9
    });
    const creaseMesh = new THREE.Mesh(creaseGeo, darkCreaseMat);
    creaseMesh.rotation.z = Math.PI / 2;
    creaseMesh.position.y = 0.08;
    beanGroup.add(creaseMesh);

    beanGroup.castShadow = true;
    return beanGroup;
  }

  function buildFloatingBeans() {
    const beanMat = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      roughness: 0.42,
      metalness: 0.18
    });

    const beanPositions = [
      { x: -2.4, y: 1.8, z: 0.6, speed: 0.009, rotX: 0.012, rotY: 0.015 },
      { x: 2.3, y: 2.2, z: -0.9, speed: 0.011, rotX: 0.014, rotY: 0.010 },
      { x: -2.0, y: -0.3, z: 1.3, speed: 0.008, rotX: 0.016, rotY: 0.018 },
      { x: 2.6, y: -0.4, z: 0.8, speed: 0.010, rotX: 0.013, rotY: 0.014 },
      { x: -1.0, y: 2.9, z: -1.3, speed: 0.012, rotX: 0.011, rotY: 0.012 },
      { x: 1.4, y: 3.1, z: 0.4, speed: 0.010, rotX: 0.015, rotY: 0.009 }
    ];

    beanPositions.forEach(pos => {
      const bean = createRealisticCoffeeBeanMesh(beanMat);
      bean.position.set(pos.x, pos.y, pos.z);
      scene.add(bean);
      floatingBeans.push({
        group: bean,
        initialY: pos.y,
        speed: pos.speed,
        rotX: pos.rotX,
        rotY: pos.rotY,
        seed: Math.random() * 10
      });
    });
  }

  // Steam particle cloud simulation
  function buildSteamSystem() {
    const steamGeo = new THREE.SphereGeometry(0.18, 14, 14);
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });

    for (let i = 0; i < 30; i++) {
      const steamPuff = new THREE.Mesh(steamGeo, steamMat.clone());
      resetSteamPuff(steamPuff, i * 0.12);
      scene.add(steamPuff);
      steamParticles.push(steamPuff);
    }
  }

  function resetSteamPuff(puff, delayOffset = 0) {
    puff.position.set(
      (Math.random() - 0.5) * 0.65,
      1.35 + Math.random() * 0.3 - delayOffset,
      (Math.random() - 0.5) * 0.65
    );
    puff.scale.set(0.6, 0.6, 0.6);
    puff.material.opacity = 0;
    puff.userData = {
      speedY: 0.019 + Math.random() * 0.013,
      driftX: (Math.random() - 0.5) * 0.008,
      driftZ: (Math.random() - 0.5) * 0.008,
      scaleGrowth: 0.022 + Math.random() * 0.012,
      maxHeight: 3.8 + Math.random() * 0.8
    };
  }

  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);

    // Mouse Controls
    container.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);

    // Touch Controls
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, false);

    // 3D Flavor buttons
    const flavorButtons = document.querySelectorAll('.flavor-btn');
    flavorButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        flavorButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const flavKey = this.dataset.flavor;
        switchFlavor(flavKey);
      });
    });
  }

  function switchFlavor(flavKey) {
    if (!FLAVORS[flavKey]) return;
    activeFlavorKey = flavKey;
    const config = FLAVORS[flavKey];

    // Smooth material updates
    cupMaterial.color.setHex(config.cupColor);
    saucerMaterial.color.setHex(config.cupColor);

    // Generate matching latte art
    const newCanvas = generateLatteArtCanvas(config.artType, config.foamColor, '#' + config.liquidColor.toString(16));
    liquidMaterial.map = new THREE.CanvasTexture(newCanvas);
    liquidMaterial.needsUpdate = true;

    // Shift rim point light tone
    pointLight.color.setHex(config.lightColor);
  }

  function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouseNormalized.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNormalized.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.005;
      targetRotation.x = Math.max(-0.2, Math.min(0.7, targetRotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  function onMouseUp() {
    isDragging = false;
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      targetRotation.y += deltaX * 0.01;
      targetRotation.x += deltaY * 0.008;
      targetRotation.x = Math.max(-0.2, Math.min(0.7, targetRotation.x));

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onTouchEnd() {
    isDragging = false;
  }

  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Damped inertia
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

    if (!isDragging) {
      cupGroup.rotation.y = currentRotation.y + Math.sin(elapsedTime * 0.5) * 0.08 + mouseNormalized.x * 0.25;
      cupGroup.rotation.x = currentRotation.x + Math.cos(elapsedTime * 0.7) * 0.03 - mouseNormalized.y * 0.15;
    } else {
      cupGroup.rotation.y = currentRotation.y;
      cupGroup.rotation.x = currentRotation.x;
    }

    // Animate Floating Coffee Beans
    floatingBeans.forEach(bean => {
      bean.group.position.y = bean.initialY + Math.sin(elapsedTime * 1.5 + bean.seed) * 0.18;
      bean.group.rotation.x += bean.rotX;
      bean.group.rotation.y += bean.rotY;
    });

    // Animate Rising Steam Puffs
    steamParticles.forEach(puff => {
      puff.position.y += puff.userData.speedY;
      puff.position.x += puff.userData.driftX;
      puff.position.z += puff.userData.driftZ;

      const progress = (puff.position.y - 1.35) / (puff.userData.maxHeight - 1.35);
      puff.scale.addScalar(puff.userData.scaleGrowth * 0.08);

      if (progress < 0.25) {
        puff.material.opacity = (progress / 0.25) * 0.18;
      } else {
        puff.material.opacity = (1 - progress) * 0.18;
      }

      if (puff.position.y >= puff.userData.maxHeight || progress >= 1) {
        resetSteamPuff(puff);
      }
    });

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }

})();
