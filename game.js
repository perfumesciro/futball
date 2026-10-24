import { survival } from "./systems.js";

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ========================================
// ISLA PERDIDA - PROTOTIPO 3D
// ========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc9d0);
scene.fog = new THREE.Fog(0x9bc9d0, 38, 125);

const camera = new THREE.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  0.1,
  250
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// ILUMINACIÓN
scene.add(
  new THREE.HemisphereLight(0xc9e9ff, 0x456044, 2)
);

const sun = new THREE.DirectionalLight(0xffedca, 3);
sun.position.set(-30, 45, 22);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -45;
sun.shadow.camera.right = 45;
sun.shadow.camera.top = 45;
sun.shadow.camera.bottom = -45;
scene.add(sun);

// MATERIALES
const mat = (color, roughness = 1) =>
  new THREE.MeshStandardMaterial({ color, roughness });

const sandMat = mat(0xd9c58e);
const grassMat = mat(0x58804b);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x238da2,
  roughness: 0.32,
  metalness: 0.1,
  transparent: true,
  opacity: 0.92
});

// MAR
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 260),
  waterMat
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.9;
water.receiveShadow = true;
scene.add(water);

// ISLA
function islandRadius(a) {
  return 23 + Math.sin(a * 3 + 1) * 2.2 +
    Math.cos(a * 5) * 1.2;
}

const N = 100;
const RINGS = 18;
const positions = [];
const indices = [];

for (let r = 0; r <= RINGS; r++) {
  const t = r / RINGS;

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rad = islandRadius(a) * t;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;

    let y = t < 0.72
      ? 0.15 + Math.max(0, 1 - t / 0.8) *
        2.8 * Math.sin(x * 0.17 + 1) *
        Math.cos(z * 0.13)
      : 0.12;

    positions.push(x, y, z);
  }
}

for (let r = 0; r < RINGS; r++) {
  for (let i = 0; i < N; i++) {
    const a = r * N + i;
    const b = r * N + (i + 1) % N;
    const c = (r + 1) * N + i;
    const d = (r + 1) * N + (i + 1) % N;

    indices.push(a, c, b, b, c, d);
  }
}

const terrainGeo = new THREE.BufferGeometry();
terrainGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);
terrainGeo.setIndex(indices);
terrainGeo.computeVertexNormals();

const terrainMat = new THREE.MeshStandardMaterial({
  color: 0x5e874b,
  roughness: 1,
  side: THREE.DoubleSide
});

const terrain = new THREE.Mesh(terrainGeo, terrainMat);
terrain.receiveShadow = true;
terrain.castShadow = true;
scene.add(terrain);

// PLAYA
const beach = new THREE.Mesh(
  new THREE.RingGeometry(19.5, 24.7, 100),
  sandMat
);
beach.rotation.x = -Math.PI / 2;
beach.position.y = 0.02;
scene.add(beach);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(19.6, 100),
  grassMat
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0.045;
ground.receiveShadow = true;
scene.add(ground);

// RECURSOS
const resourceObjects = [];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// ÁRBOLES
function makeTree(x, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.25, 2.1, 7),
    mat(0x795236)
  );
  trunk.position.y = 1;
  trunk.castShadow = true;
  g.add(trunk);

  const greens = [0x2d603b, 0x387344, 0x4d8246];

  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.25 - i * 0.18, 1.7, 7),
      mat(greens[i])
    );
    crown.position.y = 2.1 + i * 0.65;
    crown.castShadow = true;
    g.add(crown);
  }

  scene.add(g);

  resourceObjects.push({
    mesh: g,
    type: 'wood',
    label: 'Árbol',
    amount: 3,
    active: true
  });
}

// PIEDRAS
function makeRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0),
    mat(0x7c8986)
  );

  rock.position.set(x, 0.25 * scale, z);
  rock.scale.set(scale, scale * 0.7, scale * 1.1);
  rock.rotation.set(rand(0, 1), rand(0, 3), rand(0, 1));
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);

  resourceObjects.push({
    mesh: rock,
    type: 'stone',
    label: 'Piedra',
    amount: 2,
    active: true
  });
}

// ARBUSTOS
function makeBush(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 1),
      mat(0x6f9b55)
    );
    b.position.set(
      rand(-0.25, 0.25),
      rand(0.2, 0.5),
      rand(-0.25, 0.25)
    );
    g.add(b);
  }

  scene.add(g);

  resourceObjects.push({
    mesh: g,
    type: 'fiber',
    label: 'Arbusto',
    amount: 2,
    active: true
  });
}

// DISTRIBUCIÓN DE RECURSOS
for (let i = 0; i < 46; i++) {
  const a = rand(0, Math.PI * 2);
  const r = rand(5, 17.5);
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;

  if (Math.hypot(x, z) < 5.5) continue;

  if (Math.random() < 0.72) {
    makeTree(x, z, rand(0.75, 1.25));
  } else {
    makeRock(x, z, rand(0.7, 1.2));
  }
}

for (let i = 0; i < 13; i++) {
  const a = rand(0, Math.PI * 2);
  const r = rand(4, 17);
  makeBush(Math.cos(a) * r, Math.sin(a) * r);
}

// BARCO NAUFRAGADO
const wreck = new THREE.Group();
wreck.position.set(18, 0.1, 5);
wreck.rotation.y = -0.5;

const woodMat = mat(0x604b38);

const hull = new THREE.Mesh(
  new THREE.BoxGeometry(4, 0.6, 1.5),
  woodMat
);
hull.rotation.z = -0.15;
hull.position.y = 0.5;
hull.castShadow = true;
wreck.add(hull);

const mast = new THREE.Mesh(
  new THREE.CylinderGeometry(0.09, 0.13, 3.6, 7),
  woodMat
);
mast.position.set(0, 2, 0);
mast.rotation.z = 0.15;
mast.castShadow = true;
wreck.add(mast);

const sail = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.6),
  mat(0xc8c0a5)
);
sail.position.set(0.1, 2.6, 0.05);
sail.rotation.y = 0.1;
wreck.add(sail);
scene.add(wreck);

// PERSONAJE
const player = new THREE.Group();
scene.add(player);

const skin = mat(0xd5a47c);
const shirt = mat(0x355d58);
const pants = mat(0x303b45);

const torso = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.34, 0.65, 4, 8),
  shirt
);
torso.position.y = 1.2;
torso.castShadow = true;
player.add(torso);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 12, 10),
  skin
);
head.position.y = 1.88;
head.castShadow = true;
player.add(head);

const legL = new THREE.Mesh(
  new THREE.BoxGeometry(0.19, 0.58, 0.22),
  mat(0x303b45)
);
legL.position.set(-0.16, 0.55, 0);
player.add(legL);

const legR = new THREE.Mesh(
  new THREE.BoxGeometry(0.19, 0.58, 0.22),
  mat(0x303b45)
);
legR.position.set(0.16, 0.55, 0);
player.add(legR);

const armL = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.09, 0.48, 3, 6),
  skin
);
armL.position.set(-0.42, 1.27, 0);
armL.rotation.z = 0.13;
player.add(armL);

const armR = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.09, 0.48, 3, 6),
  skin
);
armR.position.set(0.42, 1.27, 0);
armR.rotation.z = -0.13;
player.add(armR);

player.position.set(0, 0.08, 0);

// ESTADO DEL JUEGO
const keys = {};
let health = 100;
let hunger = 100;
let wood = 0;
let stone = 0;
let fiber = 0;
let elapsed = 0;
let day = 1;
let vy = 0;
let onGround = true;
let walkPhase = 0;

const message = document.getElementById('message');
let messageTimer;

function say(txt) {
  message.textContent = txt;
  message.style.opacity = '1';
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    message.style.opacity = '0.65';
  }, 2800);
}

// CONTROLES
addEventListener('keydown', e => {
  keys[e.code] = true;

  if (
    ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      .includes(e.code)
  ) {
    e.preventDefault();
  }

  if (e.code === 'KeyE') collect();

  if (e.code === 'Space' && onGround) {
    vy = 7;
    onGround = false;
  }
});

addEventListener('keyup', e => {
  keys[e.code] = false;
});

addEventListener('blur', () => {
  Object.keys(keys).forEach(k => keys[k] = false);
});

// RECOLECCIÓN
function collect() {
  let nearest = null;
  let dist = 2.8;

  for (const o of resourceObjects) {
    if (!o.active) continue;

    const p = o.mesh.position;
    const d = Math.hypot(
      p.x - player.position.x,
      p.z - player.position.z
    );

    if (d < dist) {
      dist = d;
      nearest = o;
    }
  }

  if (!nearest) {
    say('No hay recursos suficientemente cerca.');
    return;
  }

  nearest.active = false;
  scene.remove(nearest.mesh);

  if (nearest.type === 'wood') {
    wood += nearest.amount;
    document.getElementById('wood').textContent = wood;
  }

  if (nearest.type === 'stone') {
    stone += nearest.amount;
    document.getElementById('stone').textContent = stone;
  }

  if (nearest.type === 'fiber') {
    fiber += nearest.amount;
    document.getElementById('fiber').textContent = fiber;
  }

  say(`Recolectaste ${nearest.amount} de ${nearest.label.toLowerCase()}.`);

  if (wood >= 6 && stone >= 4 && fiber >= 2) {
    document.getElementById('objective').textContent =
      '¡Ya tenés recursos para empezar a construir!';
  }
}

// LÍMITES DE LA ISLA
function islandLimit(pos) {
  const max = 21.7;
  const d = Math.hypot(pos.x, pos.z);

  if (d > max) {
    pos.x = pos.x / d * max;
    pos.z = pos.z / d * max;
  }
}

// BUCLE PRINCIPAL
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);
  elapsed += dt;

  const forward = new THREE.Vector3(
    (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0),
    0,
    (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0)
  );

  const moving = forward.lengthSq() > 0;

  if (moving) {
    forward.normalize();

    const speed =
      (keys.ShiftLeft || keys.ShiftRight) ? 8 : 4.5;

    player.position.addScaledVector(forward, speed * dt);
    islandLimit(player.position);

    player.rotation.y = Math.atan2(forward.x, forward.z);

    walkPhase += dt * 10 * (speed / 4.5);
    legL.rotation.x = Math.sin(walkPhase) * 0.65;
    legR.rotation.x = -Math.sin(walkPhase) * 0.65;
    armL.rotation.x = -Math.sin(walkPhase) * 0.45;
    armR.rotation.x = Math.sin(walkPhase) * 0.45;
  } else {
    legL.rotation.x *= 0.8;
    legR.rotation.x *= 0.8;
    armL.rotation.x *= 0.8;
    armR.rotation.x *= 0.8;
  }

  // SALTO Y GRAVEDAD
  vy -= 18 * dt;
  player.position.y += vy * dt;

  if (player.position.y <= 0.08) {
    player.position.y = 0.08;
    vy = 0;
    onGround = true;
  }

  // CÁMARA EN TERCERA PERSONA
  const camOffset = new THREE.Vector3(0, 4.2, -7.8)
    .applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      player.rotation.y
    );

  const targetCam = player.position.clone().add(camOffset);

  camera.position.lerp(
    targetCam,
    1 - Math.pow(0.001, dt)
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1.2,
    player.position.z
  );

  // MAR Y LUZ
  water.position.y = -0.9 + Math.sin(elapsed * 0.7) * 0.06;
  sun.position.x = -30 + Math.sin(elapsed * 0.025) * 12;

  const cycle = (elapsed % 240) / 240;
  sun.intensity = 2 + Math.sin(cycle * Math.PI) * 1.1;

  scene.background.setHSL(
    0.53,
    0.32,
    0.62 - Math.max(
      0,
      Math.sin(cycle * Math.PI * 2)
    ) * 0.08
  );

  // DÍAS Y HAMBRE
  const newDay = Math.floor(elapsed / 80) + 1;

  if (newDay > day) {
    day = newDay;
    document.getElementById('day').textContent = day;
    say(`Comenzó el día ${day}.`);
  }

  const hungerTick = Math.floor(elapsed / 12);

  if (hungerTick !== animate.lastHunger) {
    animate.lastHunger = hungerTick;

    if (hungerTick > 0) {
      hunger = Math.max(0, hunger - 1);

      document.getElementById('hungerText').textContent = hunger;
      document.getElementById('hungerBar').style.width =
        hunger + '%';

      if (hunger === 0) {
        health = Math.max(0, health - 1);

        document.getElementById('healthText').textContent = health;
        document.getElementById('healthBar').style.width =
          health + '%';
      }
    }
  }

  // AVISO DE RECOLECCIÓN CERCANA
  let nearestDist = Infinity;

  for (const o of resourceObjects) {
    if (!o.active) continue;

    nearestDist = Math.min(
      nearestDist,
      Math.hypot(
        o.mesh.position.x - player.position.x,
        o.mesh.position.z - player.position.z
      )
    );
  }

  document.getElementById('interact')
    .classList.toggle('hidden', nearestDist > 2.8);

  renderer.render(scene, camera);
}

animate();

// AJUSTE DE PANTALLA
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
