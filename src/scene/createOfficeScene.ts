import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createOfficePostProcessing } from "./officePostProcessing";
import { createOfficeMaterials } from "./officeMaterials";
import { OfficeObjects } from "./officeObjects";
import { getOfficeFloorplan } from "./officeFloorplan";
import { buildOfficeBuilding } from "./officeBuilding";
import { createOfficeGarden } from "./officeGarden";
import {
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
  renderer.shadowMap.type = THREE.PCFShadowMap;
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
  const floorplan = getOfficeFloorplan(data.size, data.upgrades, data.employees.length);
  const { width, depth } = floorplan;
  const frameSize = Math.max(width, depth);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, Math.max(150, frameSize * 8));
  const defaultPosition = new THREE.Vector3(
    frameSize * 0.94,
    frameSize * 0.79,
    frameSize * 1.14,
  );
  camera.position.copy(defaultPosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 4.5;
  controls.maxDistance = frameSize * 2.65;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI * 0.43;
  controls.minAzimuthAngle = -0.2;
  controls.maxAzimuthAngle = Math.PI * 0.55;
  controls.enablePan = false;
  controls.update();
  const ambient = new THREE.HemisphereLight(
    data.night ? "#93bfdc" : "#e8efed",
    "#716f58",
    data.night ? 0.65 : 0.95,
  );
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(
    data.night ? "#a6c9ec" : "#fff1d5",
    data.night ? 0.85 : 3.2,
  );
  sun.position.set(-3, 9, -8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -frameSize,
    right: frameSize,
    top: frameSize,
    bottom: -frameSize,
    near: 0.5,
    far: Math.max(70, frameSize * 3),
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
  const building = buildOfficeBuilding({ scene, room, assets, size: data.size, night: data.night, width, depth, areas: floorplan.areas });
  const clickable: THREE.Object3D[] = [];
  const markers = new Map<string, THREE.Mesh>();
  let employeeIndex = 0;
  for (const area of floorplan.areas) {
    const { slot, x, z } = area;
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
      area.width,
      0.018,
      area.depth,
      "#93a28b",
    );
    marker.material = new THREE.MeshStandardMaterial({
      color: "#93a28b",
      transparent: true,
      opacity: 0.025,
      depthWrite: false,
    });
    marker.receiveShadow = true;
    markers.set(slot.id, marker);
    if (slot.type === "workstation") {
      for (const [i, position] of area.desks.entries()) {
        const desk = assets.desk(
          zone,
          position.x,
          position.z,
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
  const surfaces = createOfficeMaterials(() => { needsRender = true; });
  for (const { mesh, spec } of building.surfaces) void surfaces.apply(mesh, spec);
  const garden = createOfficeGarden(building.exterior,
    building.exterior.userData.plantingPoints as { x: number; z: number }[], () => { needsRender = true; });
  surfaces.applyProps(room);
  void assets.loadDetails(() => { surfaces.applyProps(room); needsRender = true; });
  const post = createOfficePostProcessing(renderer, scene, camera);
  controls.addEventListener("change", () => {
    needsRender = true;
  });
  const resize = () => {
    needsRender = true;
    const w = Math.max(1, host.clientWidth),
      h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h);
    post.resize(w, h);
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
    post.render();
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
        material.opacity = slotId === id ? 0.16 : 0.025;
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
      const area = floorplan.areas.find(({ slot }) => slot.id === slotId);
      const distance = area ? THREE.MathUtils.clamp(Math.max(area.width, area.depth) * 1.45, 6, 16) : 10;
      const offset = camera.position.clone().sub(controls.target).setLength(distance);
      moveCamera(target.clone().add(offset), target);
    },
    setTour(enabled) { tour = enabled; needsRender = true; },
    dispose() {
      post.dispose();
      surfaces.dispose();
      garden.dispose();
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
