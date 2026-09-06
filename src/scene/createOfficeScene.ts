import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getFurnishingAreas } from "../data/officeRelocation";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { loadOfficeSurfaces } from "./officeMaterials";
import { OfficeObjects } from "./officeObjects";
import {
  calculateTotalEffects,
  getLayoutById,
  getUpgradeById,
  type OfficeSizeId,
  type InstalledUpgrade,
} from "../data/officeLayouts";

export interface OfficeSceneData {
  size: OfficeSizeId;
  upgrades: InstalledUpgrade[];
  employees: { id: string; working: boolean }[];
  night: boolean;
}
export interface OfficeSceneController {
  setSimulation: (paused: boolean, speed: number) => void;
  select: (slotId: string | null) => void;
  zoom: (direction: number) => void;
  reset: () => void;
  focus: (slotId: string) => void;
  setTour: (enabled: boolean) => void;
  dispose: () => void;
}
export function createOfficeScene(
  host: HTMLDivElement,
  data: OfficeSceneData,
  onSelect: (slotId: string) => void,
): OfficeSceneController {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = data.night ? 1.05 : 1.12;
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D office. Drag to orbit, scroll to zoom. Use the office area buttons below to select furniture.",
  );
  renderer.domElement.setAttribute("role", "img");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(data.night ? "#26323a" : "#c6cdc0");
  const assets = new OfficeObjects();
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = data.night ? 0.2 : 0.45;
  environmentScene.dispose();
  pmrem.dispose();
  const room = new THREE.Group();
  scene.add(room);
  const layout = getLayoutById(data.size)!;
  const dimensions = {
    hacker_den: 14,
    small: 16,
    medium: 20,
    large: 24,
    campus: 28,
  };
  const width = dimensions[data.size];
  const depth = width * 0.72;
  const wallHeight = 3.1;
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 150);
  const defaultPosition = new THREE.Vector3(
    width * 0.94,
    width * 0.79,
    width * 1.14,
  );
  camera.position.copy(defaultPosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = width * 0.65;
  controls.maxDistance = width * 2.65;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI * 0.43;
  controls.minAzimuthAngle = -0.2;
  controls.maxAzimuthAngle = Math.PI * 0.55;
  controls.enablePan = false;
  controls.update();
  const ambient = new THREE.HemisphereLight(
    data.night ? "#93bfdc" : "#e8efed",
    "#716f58",
    data.night ? 1.0 : 1.65,
  );
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(
    data.night ? "#a6c9ec" : "#fff1d5",
    data.night ? 1.1 : 2.8,
  );
  sun.position.set(-7, 13, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -width,
    right: width,
    top: width,
    bottom: -width,
    near: 0.5,
    far: 70,
  });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  sun.shadow.radius = 3;
  scene.add(sun);
  const warm = new THREE.PointLight(
    "#ffd49c",
    data.night ? 45 : 9,
    width * 1.3,
    2,
  );
  warm.position.set(1, 4, -2);
  scene.add(warm);
  assets.box(
    scene,
    0,
    -0.47,
    0,
    200,
    0.1,
    200,
    data.night ? "#26323a" : "#bbc4b5",
  );
  assets.box(room, 0, -0.23, 0, width + 0.3, 0.46, depth + 0.3, "#aaa99a");
  // A tiled concrete material keeps large campuses inexpensive to draw.
  const concrete = assets.texture(256, 256, (ctx) => {
    ctx.fillStyle = "#c4bca9";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = i % 2 ? "rgba(83,78,62,.065)" : "rgba(245,240,218,.12)";
      ctx.fillRect((i * 71) % 256, (i * 131 + Math.floor(i / 7)) % 256, 2, 2);
    }
    ctx.fillStyle = "#b0aa98";
    ctx.fillRect(0, 0, 256, 1);
    ctx.fillRect(0, 0, 1, 256);
  });
  concrete.wrapS = concrete.wrapT = THREE.RepeatWrapping;
  concrete.repeat.set(width, depth);
  concrete.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const floor = assets.mesh(
    room,
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.96 }),
    0,
    0.035,
    0,
  );
  floor.rotation.x = -Math.PI / 2;
  const backWall = assets.box(
    room,
    0,
    wallHeight / 2,
    -depth / 2,
    width,
    wallHeight,
    0.16,
    "#d8d4c4",
  );
  const sideWall = assets.box(
    room,
    -width / 2,
    wallHeight / 2,
    0,
    0.16,
    wallHeight,
    depth,
    "#babfb0",
  );
  assets.box(room, 0, 0.12, -depth / 2 + 0.11, width, 0.22, 0.05, "#90978b");
  assets.box(room, -width / 2 + 0.11, 0.12, 0, 0.05, 0.22, depth, "#838d81");
  assets.box(
    room,
    0,
    wallHeight + 0.02,
    -depth / 2,
    width + 0.1,
    0.12,
    0.26,
    "#dedbd0",
  );
  assets.box(
    room,
    -width / 2,
    wallHeight + 0.02,
    0,
    0.26,
    0.12,
    depth,
    "#d4d6c9",
  );
  // Back-wall windows: deep frames, panes and sunlit sills.
  for (let i = 0; i < 3; i++) {
    const x = -width / 2 + 1.6 + i * 2.5;
    assets.box(room, x, 1.98, -depth / 2 + 0.1, 2.04, 1.71, 0.08, "#77877e");
    const windowMat = new THREE.MeshStandardMaterial({
      color: data.night ? "#405d76" : "#b4d1ce",
      emissive: data.night ? "#253752" : "#c3d7c7",
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.2,
    });
    assets.mesh(
      room,
      new THREE.PlaneGeometry(1.88, 1.55),
      windowMat,
      x,
      1.98,
      -depth / 2 + 0.15,
    );
    assets.box(room, x, 1.98, -depth / 2 + 0.2, 0.055, 1.6, 0.05, "#e4e2d6");
    assets.box(room, x, 1.98, -depth / 2 + 0.2, 1.95, 0.055, 0.05, "#e4e2d6");
    assets.box(room, x, 1.1, -depth / 2 + 0.25, 2.18, 0.08, 0.38, "#e2dfd1");
  }
  assets.sign(
    room,
    "DISRUPT.",
    "Preferably after the stand-up.",
    2.8,
    1.4,
    width / 2 - 2.5,
    2.06,
    -depth / 2 + 0.11,
    true,
  );
  // Whiteboard on the left wall. A strategy is mostly arrows.
  // Exposed conduits and a breaker box keep the incubator grounded in a garage.
  assets.box(
    room,
    -width / 2 + 0.13,
    2.9,
    0,
    0.035,
    0.035,
    depth - 0.5,
    "#7f877c",
    0.45,
    0.55,
  );
  assets.box(
    room,
    -width / 2 + 0.15,
    1.88,
    -depth / 2 + 1.65,
    0.16,
    0.66,
    0.48,
    "#969b8f",
    0.45,
    0.45,
  );
  assets.box(
    room,
    -width / 2 + 0.24,
    1.83,
    -depth / 2 + 1.65,
    0.015,
    0.28,
    0.2,
    "#72796b",
  );
  assets.box(
    room,
    -width / 2 + 0.14,
    2.55,
    -depth / 2 + 1.65,
    0.035,
    0.7,
    0.035,
    "#7f877c",
    0.45,
    0.55,
  );
  const board = assets.group(
    room,
    -width / 2 + 0.12,
    depth / 2 - 2.5,
    Math.PI / 2,
  );
  assets.box(board, 0, 1.86, -0.015, 2.35, 1.36, 0.08, "#7c8982");
  assets.sign(
    board,
    "AI → ??? → IPO",
    "Runway is a state of mind.",
    2.23,
    1.25,
    0,
    1.86,
    0.03,
  );
  assets.plant(room, -width / 2 + 0.6, -depth / 2 + 0.6, 0.9);
  assets.plant(room, width / 2 - 0.65, -depth / 2 + 0.65, 1.25);
  assets.plant(room, -width / 2 + 0.6, depth / 2 - 0.65, 1.1);
  // The founder's inherited sofa is scenery; purchasable amenities supply bonuses.
  assets.sofa(room, width / 2 - 2.3, depth / 2 - 0.9);
  assets.box(
    room,
    width / 2 - 2.2,
    0.34,
    depth / 2 - 2.15,
    1.15,
    0.06,
    0.58,
    "#a48a64",
  );
  for (const x of [-0.4, 0.4])
    assets.box(
      room,
      width / 2 - 2.2 + x,
      0.17,
      depth / 2 - 2.15,
      0.04,
      0.32,
      0.4,
      "#5b5e51",
    );
  assets.box(
    room,
    width / 2 - 2.4,
    0.39,
    depth / 2 - 2.15,
    0.45,
    0.05,
    0.36,
    "#bd8b56",
  );
  assets.sign(
    room,
    "10%",
    "Incubator equity. Non-negotiable.",
    1,
    0.5,
    width / 2 - 0.5,
    1.5,
    -depth / 2 + 0.12,
  );

  assets.floorFan(room, -width / 2 + 1.15, -depth / 2 + 2.25);
  // Pendant fixtures and pools of warm light anchor the evening scene.
  for (const x of [-width * 0.22, width * 0.22]) {
    assets.cylinder(room, x, 2.98, -1.2, 0.22, 0.32, 0.16, '#3e4c46');
    const diffuser = assets.mesh(room, new THREE.CircleGeometry(0.27, 24),
      new THREE.MeshBasicMaterial({ color: data.night ? '#ffe0a1' : '#e8dec3' }), x, 2.895, -1.2);
    diffuser.rotation.x = Math.PI / 2;
    if (data.night) {
      const lamp = new THREE.PointLight('#ffd7a0', 12, 7, 2);
      lamp.position.set(x, 2.7, -1.2); room.add(lamp);
    }
  }
  const clickable: THREE.Object3D[] = [];
  const markers = new Map<string, THREE.Mesh>();
  let employeeIndex = 0;
  const areas = getFurnishingAreas(data.size, data.upgrades);
  const workSlots = areas.filter((s) => s.type === "workstation");
  const seats =
    layout.baseCapacity + calculateTotalEffects(data.upgrades).capacity;
  const staffPerSlot = Math.ceil(
    Math.max(data.employees.length, seats) / Math.max(1, workSlots.length),
  );
  for (const slot of areas) {
    const x = ((slot.x + slot.width / 2) / 100 - 0.5) * (width - 1.4);
    const z = ((slot.y + slot.height / 2) / 100 - 0.5) * (depth - 1.4);
    const installed = data.upgrades.find((u) => u.slotId === slot.id);
    const upgrade = installed && getUpgradeById(installed.upgradeId);
    const zone = assets.group(room, x, z);
    zone.userData.slotId = slot.id;
    clickable.push(zone);
    const marker = assets.box(
      zone,
      0,
      0.055,
      0,
      Math.max(1.5, (slot.width / 100) * (width - 2)),
      0.018,
      Math.max(1.1, (slot.height / 100) * (depth - 2)),
      "#93a28b",
    );
    marker.material = new THREE.MeshStandardMaterial({
      color: "#93a28b",
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    marker.receiveShadow = true;
    markers.set(slot.id, marker);
    if (slot.type === "workstation") {
      const count = Math.max(2, staffPerSlot);
      const cols = Math.min(
        3,
        Math.max(1, Math.floor(((slot.width / 100) * (width - 1)) / 1.9)),
      );
      const rows = Math.ceil(count / cols);
      const spacingZ = Math.min(2.2, ((slot.height / 100) * depth) / rows);
      for (let i = 0; i < count; i++) {
        const desk = assets.desk(
          zone,
          ((i % cols) - (cols - 1) / 2) * 1.95,
          (Math.floor(i / cols) - (rows - 1) / 2) * spacingZ,
          i,
          !!upgrade && upgrade.id !== "basic_desks",
          upgrade?.id === "standing_desks",
        );
        const employee = data.employees[employeeIndex];
        if (employee) {
          const person = assets.person(
            desk.group,
            employeeIndex,
            employee.working,
            desk.standing,
          );
          person.userData.employeeId = employee.id;
          employeeIndex++;
        }
      }
    } else if (upgrade) {
      switch (upgrade.id) {
        case "server_closet":
        case "server_room":
        case "it_closet":
          assets.server(zone, 0, 0, installed?.level);
          break;
        case "coffee_corner":
        case "snack_bar":
        case "full_kitchen":
          assets.coffee(zone, 0, 0, upgrade.id === "full_kitchen");
          break;
        case "meeting_booth":
        case "conference_room":
        case "exec_office":
        case "reception_desk":
          assets.meeting(zone, 0, 0);
          break;
        case "storage_closet":
          assets.storage(zone, 0, 0);
          break;
        case "gym_corner":
        case "full_gym": {
          assets.box(zone, 0, 0.12, 0, 0.85, 0.16, 1.75, "#414b50");
          for (const a of [-0.4, 0.4])
            assets.box(
              zone,
              a,
              0.8,
              -0.65,
              0.05,
              1.5,
              0.05,
              "#687570",
              0.4,
              0.7,
            );
          assets.box(zone, 0, 1.45, -0.65, 0.95, 0.1, 0.4, "#333e40");
          break;
        }
        case "meditation_space":
          assets.plant(zone, -0.7, -0.4);
          assets.cylinder(zone, 0.3, 0.1, 0.2, 0.45, 0.45, 0.15, "#9fa58c");
          break;
        case "game_corner": {
          assets.meeting(zone, 0, 0);
          assets.box(zone, 0, 0.88, 0, 1.85, 0.025, 1.13, "#507b71");
          assets.box(zone, 0, 0.98, 0, 0.015, 0.18, 1.1, "#d8ddd3");
          break;
        }
        default:
          assets.sofa(zone, 0, 0);
          assets.plant(zone, 1.35, 0, 0.65);
      }
    } else {
      const ring = assets.mesh(
        zone,
        new THREE.RingGeometry(0.24, 0.28, 32),
        new THREE.MeshBasicMaterial({
          color: "#667967",
          side: THREE.DoubleSide,
        }),
        0,
        0.078,
        0,
      );
      ring.rotation.x = -Math.PI / 2;
      assets.box(zone, 0, 0.08, 0, 0.2, 0.015, 0.03, "#667967");
      assets.box(zone, 0, 0.08, 0, 0.03, 0.015, 0.2, "#667967");
    }
  }
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let down = { x: 0, y: 0 };
  const pick = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickable, true);
    let object: THREE.Object3D | null = hits[0]?.object ?? null;
    while (object && !object.userData.slotId) object = object.parent;
    return object?.userData.slotId as string | undefined;
  };
  const pointerDown = (e: PointerEvent) => {
    cameraMove = null;
    down = { x: e.clientX, y: e.clientY };
  };
  const pointerUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
      const id = pick(e);
      if (id) onSelect(id);
    }
  };
  const pointerMove = (e: PointerEvent) => {
    renderer.domElement.style.cursor = pick(e) ? "pointer" : "grab";
  };
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  let needsRender = true;
  let tour = false;
  let tourDirection = 1;
  let cameraMove: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  const moveCamera = (position: THREE.Vector3, target: THREE.Vector3) => {
    if (reducedMotion.matches) {
      camera.position.copy(position); controls.target.copy(target); controls.update();
    } else cameraMove = { position, target };
    needsRender = true;
  };
  const releaseSurfaces = loadOfficeSurfaces(floor, [backWall, sideWall], width, depth, () => { needsRender = true; });
  void assets.loadDetails(() => { needsRender = true; });
  controls.addEventListener("change", () => {
    needsRender = true;
  });
  const resize = () => {
    needsRender = true;
    const w = Math.max(1, host.clientWidth),
      h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov =
      (2 *
        Math.atan(
          Math.tan(THREE.MathUtils.degToRad(18)) *
            Math.max(1, 1.45 / camera.aspect),
        ) *
        180) /
      Math.PI;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = true,
    speed = 1,
    time = 0,
    last = 0,
    visible = true;
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    needsRender = true;
  });
  intersection.observe(host);
  renderer.setAnimationLoop((now: number) => {
    if (now - last < 1000 / 30) return;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!visible || document.hidden) return;
    if (cameraMove) {
      const blend = 1 - Math.exp(-delta * 7);
      camera.position.lerp(cameraMove.position, blend);
      controls.target.lerp(cameraMove.target, blend);
      if (camera.position.distanceTo(cameraMove.position) < 0.015 && controls.target.distanceTo(cameraMove.target) < 0.015) cameraMove = null;
      needsRender = true;
    }
    controls.autoRotate = tour && !reducedMotion.matches && !cameraMove;
    if (controls.getAzimuthalAngle() < controls.minAzimuthAngle + 0.03) tourDirection = -1;
    if (controls.getAzimuthalAngle() > controls.maxAzimuthAngle - 0.03) tourDirection = 1;
    controls.autoRotateSpeed = 0.35 * tourDirection;
    controls.update(delta);
    const animating = !paused && !reducedMotion.matches;
    if (!needsRender && !animating && !controls.autoRotate) return;
    if (animating) time += delta * speed;
    assets.people.forEach((person) => {
      const cycle = (time + person.phase * 3) % 28;
      const stretch = Math.max(0, Math.sin(((cycle - 22) / 6) * Math.PI)) * (cycle > 22 ? 1 : 0);
      person.head.rotation.y = Math.sin(time * 0.55 + person.phase) * (person.working ? 0.1 : 0.32);
      person.head.rotation.x = Math.sin(time * 1.3 + person.phase) * 0.04 - stretch * 0.15;
      person.group.rotation.z = Math.sin(time * 1.2 + person.phase) * 0.012;
      person.arms.forEach((arm, i) => {
        arm.rotation.x = -stretch * 0.65 + (person.working
          ? Math.sin(time * 8 + person.phase + i * 2) * 0.07
          : Math.sin(time + person.phase) * 0.05);
        arm.rotation.z = stretch * (i ? -0.35 : 0.35);
      });
    });
    assets.fans.forEach((fan) => { fan.rotation.z = time * 11; });
    assets.foliage.forEach(({ object, rest, phase }) => {
      object.rotation.z = rest + Math.sin(time * 1.25 + phase) * 0.045;
    });
    assets.animateScreens(time);
    assets.animatedScreens.forEach((m, i) => {
      m.emissiveIntensity = 0.45 + Math.sin(time * 1.5 + i) * 0.08;
    });
    assets.leds.forEach((led, i) => {
      (led.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.4 + (Math.sin(time * 3 + i * 3) > 0.1 ? 1 : 0);
    });
    assets.steam.forEach((puff, i) => {
      puff.position.y = 1.35 + ((time * 0.16 + i * 0.13) % 0.45);
      (puff.material as THREE.MeshBasicMaterial).opacity =
        0.23 * (1 - (puff.position.y - 1.35) / 0.45);
    });
    renderer.render(scene, camera);
    needsRender = false;
  });
  return {
    setSimulation(p, s) {
      needsRender = true;
      paused = p;
      speed = s;
    },
    select(id) {
      needsRender = true;
      markers.forEach((mesh, slotId) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.color.set(slotId === id ? "#bad978" : "#93a28b");
        material.opacity = slotId === id ? 0.6 : 0.15;
      });
    },
    zoom(direction) {
      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(
        offset.length() * (direction > 0 ? 0.85 : 1.18),
        controls.minDistance,
        controls.maxDistance,
      );
      moveCamera(controls.target.clone().add(offset.setLength(distance)), controls.target.clone());
    },
    reset() {
      moveCamera(defaultPosition.clone(), new THREE.Vector3(0, 0.1, 0));
    },
    focus(slotId) {
      const marker = markers.get(slotId);
      if (!marker) return;
      const target = marker.getWorldPosition(new THREE.Vector3());
      target.y = 0.7;
      const offset = camera.position.clone().sub(controls.target).setLength(width * 0.85);
      moveCamera(target.clone().add(offset), target);
    },
    setTour(enabled) { tour = enabled; needsRender = true; },
    dispose() {
      releaseSurfaces();
      environment.dispose();
      renderer.setAnimationLoop(null);
      observer.disconnect();
      intersection.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      assets.dispose(scene);
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
