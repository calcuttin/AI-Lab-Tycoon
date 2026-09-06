import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { OfficeObjects } from "../../scene/officeObjects";
import { seededRandom } from "../realistic/prng";

// All scenery is original geometry. Dimensions and architectural details are
// deliberately grounded in real objects; the fictional town is a satirical set.
export function createValleyWorld(scene: THREE.Scene) {
  const o = new OfficeObjects();
  const staticSet = new THREE.Group();
  scene.add(staticSet);
  const rng = seededRandom(2401);
  const cars: {
    group: THREE.Group;
    speed: number;
    offset: number;
    lane: number;
  }[] = [];
  const growing: { group: THREE.Group; delay: number }[] = [];
  const rotors: THREE.Group[] = [];
  const disposables: THREE.BufferGeometry[] = [];

  const surface = (base: string, grain: number, lines = false) => {
    const map = o.texture(256, 256, (ctx) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 14000; i++) {
        ctx.fillStyle = `rgba(${rng() > 0.5 ? "255,255,255" : "0,0,0"},${rng() * grain})`;
        ctx.fillRect(rng() * 256, rng() * 256, 1 + rng() * 2, 1);
      }
      if (lines) {
        ctx.strokeStyle = "#99958b";
        ctx.lineWidth = 1;
        for (let y = 0; y < 256; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y);
          ctx.stroke();
        }
      }
    });
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(12, 12);
    map.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map, roughness: 0.92 });
  };
  const grass = surface("#929775", 0.17);
  const asphalt = surface("#515655", 0.3);
  const concrete = surface("#bbb6a6", 0.17);
  o.mesh(staticSet, new THREE.BoxGeometry(430, 1, 320), grass, 0, -0.65, -25);

  // Golden coastal foothills behind the town, modeled as continuous terrain.
  const terrain = new THREE.PlaneGeometry(750, 230, 95, 36);
  terrain.rotateX(-Math.PI / 2);
  const pos = terrain.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    const rise = Math.max(0, (85 - z) / 160);
    pos.setY(
      i,
      rise *
        (27 +
          Math.sin(x * 0.024 + z * 0.021) * 12 +
          Math.sin(x * 0.055 - z * 0.02) * 6),
    );
  }
  terrain.computeVertexNormals();
  o.mesh(staticSet, terrain, o.material("#a49c6a"), 0, -2, -190);

  function tree(
    parent: THREE.Object3D,
    x: number,
    z: number,
    height: number,
    palm = false,
  ) {
    const group = o.group(parent, x, z);
    if (palm) {
      const trunk = o.cylinder(
        group,
        0,
        height / 2,
        0,
        0.13,
        0.29,
        height,
        "#83705a",
      );
      trunk.rotation.z = 0.05;
      for (let k = 0; k < 9; k++) {
        const leaf = new THREE.Shape();
        leaf.moveTo(0, 0);
        for (let edge = 0; edge < 2; edge++) {
          for (let segment = 0; segment <= 32; segment++) {
            const t = edge ? 1 - segment / 32 : segment / 32;
            const width =
              Math.sin(t * Math.PI) * 0.46 * (segment % 2 ? 0.4 : 1);
            leaf.lineTo(t * 3.5, (edge ? -width : width) - t * t * 0.6);
          }
        }
        leaf.closePath();
        const mesh = o.mesh(
          group,
          new THREE.ShapeGeometry(leaf),
          o.material(k % 2 ? "#566b39" : "#6d7d44"),
          0,
          height,
          0,
        );
        mesh.material.side = THREE.DoubleSide;
        mesh.rotation.set(-0.6, (k * Math.PI * 2) / 9, -0.25);
      }
    } else {
      o.cylinder(
        group,
        0,
        height * 0.31,
        0,
        0.13,
        0.33,
        height * 0.62,
        "#78664e",
      );
      for (let k = 0; k < 19; k++) {
        const angle = k * 2.399;
        const spread = height * (0.12 + (k % 4) * 0.055);
        const radius = height * (0.13 + rng() * 0.07);
        const geometry = new THREE.IcosahedronGeometry(radius, 2);
        const vertices = geometry.attributes.position;
        for (let v = 0; v < vertices.count; v++) {
          const scale = 0.86 + rng() * 0.28;
          vertices.setXYZ(
            v,
            vertices.getX(v) * scale,
            vertices.getY(v) * scale,
            vertices.getZ(v) * scale,
          );
        }
        geometry.computeVertexNormals();
        o.mesh(
          group,
          geometry,
          o.material(["#405e3d", "#52683e", "#667347", "#778051"][k % 4]),
          Math.cos(angle) * spread,
          height * (0.65 + rng() * 0.24),
          Math.sin(angle) * spread,
        );
      }
    }
    return group;
  }

  function road(
    x: number,
    z: number,
    length: number,
    width: number,
    across = true,
  ) {
    const group = o.group(staticSet, x, z, across ? 0 : Math.PI / 2);
    o.mesh(
      group,
      new THREE.BoxGeometry(length, 0.12, width),
      asphalt,
      0,
      0.02,
      0,
    );
    for (const side of [-1, 1]) {
      o.box(
        group,
        0,
        0.12,
        side * (width / 2 + 0.65),
        length,
        0.23,
        1.3,
        "#bcb9a9",
      );
      o.box(group, 0, 0.092, side * 0.13, length, 0.016, 0.09, "#d2b45e");
    }
    for (let i = -length / 2; i < length / 2; i += 7)
      for (const side of [-1, 1])
        o.box(group, i, 0.092, side * width * 0.25, 2.4, 0.016, 0.1, "#e4e0ca");
  }
  road(0, 39, 360, 15);
  road(0, 11, 240, 7);
  road(-23, -26, 94, 7, false);
  road(53, -26, 94, 7, false);
  road(0, -69, 240, 7);
  for (let x = -146; x < 155; x += 18) {
    for (const z of [28, 50]) {
      o.cylinder(staticSet, x, 4.1, z, 0.08, 0.12, 8.2, "#767b73");
      o.box(staticSet, x, 8.15, z - 0.75, 0.13, 0.14, 1.7, "#92998b");
      o.box(staticSet, x, 8.1, z - 1.5, 0.5, 0.13, 0.8, "#eee7c3");
    }
  }
  // Roadside overhead signs and a very optimistic billboard.
  for (const x of [-70, 73])
    o.cylinder(staticSet, x, 5, 48, 0.19, 0.19, 10, "#939b8d");
  o.box(staticSet, -70, 10, 40.5, 0.25, 0.3, 15, "#939b8d");
  const freewaySign = o.sign(
    staticSet,
    "PALO ALTO  →",
    "SAND HILL ROAD · NEXT EXIT",
    9,
    3.3,
    -70,
    8.6,
    42.5,
    true,
  );
  freewaySign.rotation.y = Math.PI / 2;
  o.box(staticSet, 73, 10, 40.5, 0.25, 0.3, 15, "#939b8d");
  const billboard = o.group(staticSet, 108, 17, -0.25);
  o.cylinder(billboard, 0, 4, 0, 0.3, 0.3, 8, "#777767");
  o.box(billboard, 0, 8.8, 0, 13.6, 5, 0.45, "#273e38");
  o.sign(
    billboard,
    "PRE-REVENUE.",
    "POST-REALITY.  /  SERIES B NOW OPEN",
    13,
    4.5,
    0,
    8.8,
    0.24,
    true,
  );

  function car(
    parent: THREE.Object3D,
    x: number,
    z: number,
    color: string,
    bus = false,
  ) {
    const g = o.group(parent, x, z);
    const length = bus ? 8 : 3.9;
    o.box(g, 0, 0.64, 0, length, 0.65, 1.75, color, 0.27, 0.28);
    o.box(
      g,
      -0.15,
      bus ? 1.62 : 1.15,
      0,
      bus ? 7.2 : 2.1,
      bus ? 1.45 : 0.58,
      1.5,
      "#42616a",
      0.14,
      0.5,
    );
    o.box(
      g,
      -0.15,
      bus ? 2.38 : 1.46,
      0,
      bus ? 7.3 : 2.3,
      0.12,
      1.6,
      color,
      0.3,
      0.3,
    );
    for (const end of [-1, 1])
      for (const side of [-1, 1]) {
        const wheel = o.cylinder(
          g,
          end * length * 0.3,
          0.4,
          side * 0.84,
          0.35,
          0.35,
          0.24,
          "#262b2c",
        );
        wheel.rotation.x = Math.PI / 2;
        const hub = o.cylinder(
          g,
          end * length * 0.3,
          0.4,
          side * 0.97,
          0.19,
          0.19,
          0.015,
          "#b3bab8",
        );
        hub.rotation.x = Math.PI / 2;
        o.box(
          g,
          end * (length / 2 + 0.01),
          0.7,
          side * 0.54,
          0.025,
          0.2,
          0.35,
          end > 0 ? "#faf1c9" : "#b14534",
        );
      }
    return g;
  }
  const carColors = [
    "#c4c9c3",
    "#e5e2d7",
    "#a84631",
    "#3c5056",
    "#bba272",
    "#535858",
  ];
  for (let i = 0; i < 24; i++) {
    const lane = [33.8, 37, 41, 44.3][i % 4];
    const direction = i % 4 < 2 ? 1 : -1;
    const group = car(
      scene,
      0,
      lane,
      carColors[i % carColors.length],
      i === 3 || i === 16,
    );
    group.rotation.y = direction < 0 ? Math.PI : 0;
    cars.push({
      group,
      offset: i * 16.7,
      speed: direction * (6 + (i % 3) * 0.7),
      lane,
    });
  }

  const windowMap = o.texture(512, 512, (ctx) => {
    const reflection = ctx.createLinearGradient(0, 0, 280, 512);
    reflection.addColorStop(0, "#c8d5d2");
    reflection.addColorStop(0.45, "#81a0aa");
    reflection.addColorStop(1, "#3c5553");
    ctx.fillStyle = reflection;
    ctx.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 8; col++) {
        const x = col * 64,
          y = row * 64;
        ctx.fillStyle = `rgba(15,37,38,${0.1 + rng() * 0.3})`;
        ctx.fillRect(x + 2, y + 2, 60, 60);
        if (rng() > 0.5) {
          ctx.fillStyle = "rgba(217,220,202,.32)";
          ctx.fillRect(x + 3, y + 3, 58, 15 + rng() * 28);
          ctx.fillStyle = "rgba(45,60,59,.35)";
          for (let slat = 0; slat < 5; slat++)
            ctx.fillRect(x + 3, y + 6 + slat * 4, 58, 1);
        } else {
          ctx.fillStyle = "rgba(232,223,174,.16)";
          ctx.fillRect(x + 12, y + 6, 34, 2);
          ctx.fillStyle = "rgba(17,40,40,.3)";
          ctx.fillRect(x + 10, y + 43, 42, 6);
        }
        ctx.fillStyle = "rgba(211,226,226,.18)";
        ctx.fillRect(x + 3, y + 3, 2, 58);
      }
  });
  windowMap.anisotropy = 4;
  const glass = new THREE.MeshStandardMaterial({
    color: "#cad9d8",
    map: windowMap,
    roughness: 0.23,
    metalness: 0.48,
  });
  function office(
    parent: THREE.Object3D,
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    name = "",
  ) {
    const g = o.group(parent, x, z);
    o.mesh(g, new THREE.BoxGeometry(w, h, d), glass, 0, h / 2, 0);
    o.box(g, 0, 0.22, 0, w + 2, 0.44, d + 2, "#bbbbaa");
    for (let y = 0.5; y < h; y += 2.6)
      o.box(g, 0, y, 0, w + 0.3, 0.23, d + 0.3, "#c8c5b7", 0.45, 0.2);
    for (let x1 = -w / 2; x1 <= w / 2; x1 += 2.2) {
      for (const s of [-1, 1])
        o.box(
          g,
          x1,
          h / 2,
          s * (d / 2 + 0.035),
          0.085,
          h,
          0.1,
          "#a6b0a7",
          0.35,
          0.5,
        );
    }
    for (let z1 = -d / 2; z1 <= d / 2; z1 += 2.2) {
      for (const s of [-1, 1])
        o.box(
          g,
          s * (w / 2 + 0.035),
          h / 2,
          z1,
          0.1,
          h,
          0.085,
          "#a6b0a7",
          0.35,
          0.5,
        );
    }
    o.box(g, 0, h + 0.15, 0, w + 0.65, 0.35, d + 0.65, "#ddd9c8");
    o.box(g, 0, h + 0.38, 0, w - 1, 0.2, d - 1, "#838d83");
    for (let k = 0; k < 3; k++) {
      o.box(
        g,
        -w * 0.3 + k * w * 0.3,
        h + 0.9,
        -d * 0.15,
        w * 0.18,
        1,
        d * 0.26,
        "#b7bdb3",
      );
      o.cylinder(
        g,
        -w * 0.3 + k * w * 0.3,
        h + 1.42,
        -d * 0.15,
        0.62,
        0.62,
        0.1,
        "#535e58",
      );
    }
    // Entrance canopy and glass doors.
    o.box(g, 0, 2.5, d / 2 + 1.3, w * 0.36, 0.18, 2.7, "#dbd8c8");
    for (const s of [-1, 1])
      o.cylinder(g, s * w * 0.16, 1.2, d / 2 + 2.4, 0.06, 0.06, 2.4, "#888e82");
    if (name)
      o.sign(
        g,
        name,
        "MAKING THE WORLD A BETTER PLACE",
        Math.min(w - 1, 14),
        3.3,
        0,
        h - 2.1,
        d / 2 + 0.11,
        true,
      );
    return g;
  }

  // Campus courtyards, parking, solar arrays, pool, bike racks and landscaping.
  o.mesh(
    staticSet,
    new THREE.BoxGeometry(67, 0.18, 64),
    concrete,
    16,
    0.02,
    -29,
  );
  office(staticSet, 5, -39, 19, 15, 10.7, "hooli");
  office(staticSet, 30, -41, 18, 18, 15.8, "hooli");
  office(staticSet, 34, -15, 19, 12, 8);
  o.box(staticSet, 18, 5.5, -39, 8, 3.2, 4, "#708e91", 0.17, 0.6);
  o.box(staticSet, 10, 0.21, -15, 21, 0.3, 10, "#82916a");
  o.box(staticSet, 10, 0.39, -15, 12, 0.08, 5, "#5b9d9f", 0.1, 0.5);
  for (let i = 0; i < 7; i++) tree(staticSet, -11 + i * 8, -3, 7.7, true);
  for (let i = 0; i < 5; i++) tree(staticSet, -12, -17 - i * 9, 7, true);
  for (let x = -6; x < 28; x += 6) {
    o.box(staticSet, x, 0.55, -24, 2, 0.25, 0.65, "#9b7651");
    for (const s of [-1, 1])
      o.box(staticSet, x + s * 0.7, 0.28, -24, 0.15, 0.55, 0.5, "#49574c");
  }
  // Parking fields are real painted stalls, occupied by modeled cars.
  for (const area of [
    { x: 18, z: -60 },
    { x: 86, z: -58 },
  ]) {
    o.mesh(
      staticSet,
      new THREE.BoxGeometry(49, 0.08, 10),
      asphalt,
      area.x,
      0.08,
      area.z,
    );
    for (let i = 0; i < 14; i++) {
      o.box(
        staticSet,
        area.x - 23 + i * 3.5,
        0.13,
        area.z,
        0.1,
        0.02,
        4.5,
        "#dfdbc5",
      );
      if (i % 3 !== 0)
        car(
          staticSet,
          area.x - 21.4 + i * 3.5,
          area.z,
          carColors[i % 6],
        ).rotation.y = Math.PI / 2;
    }
  }
  for (let i = 0; i < 8; i++) {
    const panel = o.box(
      staticSet,
      29 + i * 1.5,
      8.4,
      -15,
      1.2,
      0.08,
      5,
      "#2e4e65",
      0.2,
      0.45,
    );
    panel.rotation.z = 0.12;
  }

  // The title-sequence joke: increasingly implausible towers grow out of the ground.
  for (const [x, z, w, d, h, name, delay] of [
    [70, -31, 16, 18, 30, "ENDFRAME", 17],
    [92, -35, 18, 21, 43, "NUCLEUS", 18.4],
    [85, -8, 15, 15, 22, "BREAM HALL", 19.6],
  ] as const) {
    const tower = office(scene, x, z, w, d, h, name);
    growing.push({ group: tower, delay });
  }
  const crane = o.group(staticSet, 111, -21);
  for (let y = 0; y < 33; y += 3) {
    for (const x of [-0.6, 0.6])
      o.box(crane, x, y + 1.5, 0, 0.15, 3, 0.15, "#cd994b");
    o.box(crane, 0, y, 0, 1.3, 0.12, 0.15, "#d4aa58");
    const brace = o.box(crane, 0, y + 1.5, 0, 0.09, 3.2, 0.09, "#b38747");
    brace.rotation.z = 0.38;
  }
  const boom = o.group(scene, 111, -21);
  boom.position.y = 33;
  o.box(boom, -5, 0, 0, 26, 0.6, 0.7, "#d6a455");
  o.box(boom, 5, -0.7, 0, 3.5, 1.3, 1.8, "#727e77");
  o.cylinder(boom, -15, -6, 0, 0.026, 0.026, 12, "#424d49");
  o.box(boom, -15, -12.4, 0, 0.45, 0.6, 0.3, "#b28c3d");
  rotors.push(boom);

  const shingle = o.texture(512, 512, (ctx) => {
    ctx.fillStyle = "#9d8468";
    ctx.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 32; row++)
      for (let col = -1; col < 24; col++) {
        const shade = Math.floor(110 + rng() * 22);
        ctx.fillStyle = `rgb(${shade + 25},${shade + 9},${shade - 14})`;
        ctx.fillRect(col * 24 + (row % 2) * 12, row * 16, 23, 14);
      }
  });
  shingle.wrapS = shingle.wrapT = THREE.RepeatWrapping;
  shingle.repeat.set(0.18, 0.18);
  shingle.anisotropy = 4;
  function roof(
    parent: THREE.Object3D,
    w: number,
    d: number,
    y: number,
    color: string,
  ) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(0, 2.3);
    shape.lineTo(w / 2, 0);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: false,
    });
    const material = o.material(color);
    material.map = shingle;
    material.color.set("#d1c0a4");
    const mesh = new THREE.Mesh(geom, [o.material("#d5c7aa"), material]);
    mesh.position.set(0, y, -d / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    for (let t = 0; t < 10; t++) {
      const f = t / 10;
      for (const side of [-1, 1])
        o.box(
          parent,
          (side * f * w) / 2,
          y + 2.3 * (1 - f) + 0.03,
          0,
          0.065,
          0.05,
          d + 0.1,
          "#8c7258",
        );
    }
  }
  function house(x: number, z: number, color: string) {
    const g = o.group(staticSet, x, z);
    o.box(g, 0, 0.02, 0, 20, 0.15, 19, "#8b966e");
    o.box(g, 0, 1.8, 0, 13, 3.6, 9, color);
    roof(g, 14, 10.3, 3.6, "#9a795d");
    for (const xx of [-4.2, 3.6]) {
      o.box(g, xx, 2, 4.53, 2.7, 1.65, 0.13, "#e1dfcd");
      o.box(g, xx, 2, 4.62, 2.35, 1.4, 0.04, "#648287", 0.23, 0.45);
      o.box(g, xx, 2, 4.66, 0.07, 1.4, 0.05, "#c9c9b6");
    }
    o.box(g, -0.4, 1.2, 4.57, 1.2, 2.4, 0.2, "#756e53");
    o.box(g, -0.4, 0.09, 7.2, 1.8, 0.1, 5, "#c8c0a7");
    o.box(g, 4.5, 0.1, 7.4, 5.5, 0.1, 5.2, "#b8b5a3");
    o.box(g, -3, 5.5, -1.5, 1, 2.4, 1.1, "#af9476");
    tree(g, -8, 5.2, 6.5);
    o.cylinder(g, 7.8, 0.8, 9, 0.05, 0.05, 1.6, "#646b5b");
    o.box(g, 7.8, 1.4, 9, 0.4, 0.35, 0.7, "#65716c");
    return g;
  }
  for (const [x, z, color] of [
    [-83, -10, "#c8b99e"],
    [-80, -39, "#d6cdb9"],
    [-48, -40, "#c3baa4"],
    [-111, -40, "#b8bba6"],
  ] as const)
    house(x, z, color);
  car(staticSet, -78, -2.5, "#849b96").rotation.y = Math.PI / 2;
  car(staticSet, -44, -32.5, "#cdb36e").rotation.y = Math.PI / 2;

  // The founder's garage is an open, dressed set, with actual furniture inside.
  const garage = o.group(staticSet, -48, -10);
  o.box(garage, 0, 0.05, 0, 24, 0.18, 22, "#8c956e");
  o.mesh(garage, new THREE.BoxGeometry(10.5, 0.15, 12), concrete, 0, 0.15, 6);
  o.box(garage, 0, 0.23, -1, 10, 0.16, 8, "#a7a38f");
  o.box(garage, -4.85, 2.05, -1, 0.3, 3.8, 8, "#d5c7aa");
  o.box(garage, 4.85, 2.05, -1, 0.3, 3.8, 8, "#d5c7aa");
  o.box(garage, 0, 2.05, -4.85, 9.8, 3.8, 0.3, "#d5c7aa");
  o.box(garage, 0, 3.65, 3, 10, 0.7, 0.3, "#ded2b7");
  roof(garage, 10.8, 8.8, 3.98, "#8b785f");
  // Closed neighboring house wall gives the garage its suburban context.
  const home = o.group(garage, 8.5, -1.5);
  o.box(home, 0, 2, -1, 7, 4, 8, "#d4c7ad");
  roof(home, 8, 9, 4, "#967859");
  o.box(home, 0, 2.3, 3.04, 2.8, 1.7, 0.08, "#6c8688", 0.25, 0.3);
  o.box(home, 0, 2.3, 3.1, 0.1, 1.7, 0.1, "#e1d9c5");
  const door = o.group(scene, -48, -7);
  o.box(door, 0, 0, 0, 9.2, 3.05, 0.12, "#b7bba9");
  for (let i = 0; i < 8; i++)
    o.box(door, 0, -1.3 + i * 0.38, 0.08, 9.2, 0.035, 0.03, "#919987");
  // Hinged up-and-over panel lifts as the camera arrives.
  o.sign(
    garage,
    "AI LAB",
    "BIG IDEAS. SMALL RUNWAY.",
    3.2,
    1.3,
    0,
    4.95,
    4.43,
    true,
  );
  for (const x of [-2.8, 0, 2.8]) {
    o.box(garage, x, 0.84, -1.8, 2.4, 0.12, 1.1, "#b89664");
    for (const side of [-1, 1])
      o.box(garage, x + side * 1, 0.43, -1.8, 0.06, 0.8, 0.85, "#59605b");
    o.monitor(garage, x, 0.9, -1.97, 2);
    o.box(garage, x, 0.92, -1.35, 0.62, 0.035, 0.22, "#464d4c");
    o.chair(garage, x, -0.65);
    o.cylinder(garage, x + 0.8, 1.03, -1.45, 0.09, 0.08, 0.2, "#ddd7bd");
  }
  o.storage(garage, -3.6, -3.8);
  o.sign(
    garage,
    "MIDDLE OUT.",
    "THE PIVOT IS THE BUSINESS PLAN.",
    2.6,
    1.3,
    0,
    2.3,
    -4.65,
  );
  o.box(garage, 4.55, 1.1, -2.8, 0.35, 2, 1.5, "#5a625a");
  for (let y = 0; y < 7; y++)
    o.box(garage, 4.32, 0.3 + y * 0.22, -2.8, 0.03, 0.025, 1.2, "#8bb5a3");
  tree(garage, -8.5, 0.5, 9, true);
  tree(garage, 13, -4, 8);
  // Wheelie bins, startup boxes and a skateboard, all mundane and intentional.
  for (let i = 0; i < 2; i++) {
    o.box(
      garage,
      -5.6 - i * 0.8,
      0.65,
      2,
      0.6,
      1.1,
      0.7,
      i ? "#4d726d" : "#686e58",
    );
    o.box(garage, -5.6 - i * 0.8, 1.22, 2, 0.67, 0.1, 0.78, "#3d5349");
  }
  for (let i = 0; i < 3; i++)
    o.box(garage, 3 + i * 0.4, 0.5 + i * 0.2, 1.8, 0.7, 0.7, 0.6, "#b39567");
  const board = o.box(garage, -1.8, 0.36, 4.8, 0.28, 0.07, 0.85, "#b16b42");
  board.rotation.y = 0.5;
  for (const z of [4.55, 5.05])
    o.cylinder(garage, -1.8, 0.27, z, 0.065, 0.065, 0.4, "#373d3b").rotation.z =
      Math.PI / 2;
  for (let x = -115; x < 128; x += 13) {
    tree(staticSet, x, -80, 7 + rng() * 5);
    if (x < -25) tree(staticSet, x, -57, 6 + rng() * 3);
  }
  for (let x = -137; x < 145; x += 15)
    tree(staticSet, x, 58, 5 + rng() * 2, x % 3 > 0);

  road(0, -106, 320, 8);
  for (let i = 0; i < 13; i++) {
    const x = -142 + i * 23;
    office(
      staticSet,
      x,
      -91 - (i % 2) * 6,
      12 + (i % 3) * 3,
      11,
      5.3 + (i % 4) * 2.6,
    );
    tree(staticSet, x + 9, -97, 6 + rng() * 2);
    if (i % 2 === 0) office(staticSet, x + 4, -125, 18, 14, 7.9);
  }
  // Timber fence boards, porch light, door trim and utility service make the
  // close-up read as a lived-in building rather than a schematic block.
  for (let i = 0; i < 29; i++) {
    o.box(
      garage,
      -10,
      0.95,
      -9 + i * 0.55,
      0.12,
      1.65,
      0.49,
      i % 3 ? "#a89474" : "#b39d79",
    );
  }
  for (const x of [-4.65, 4.65]) {
    o.box(garage, x, 2.05, 3.17, 0.2, 3.1, 0.2, "#eee1bf");
    o.box(garage, x * 1.12, 2.65, 3.25, 0.25, 0.42, 0.2, "#414a41");
    o.box(garage, x * 1.12, 2.65, 3.37, 0.16, 0.23, 0.05, "#f9deb0");
  }
  o.box(garage, -4.63, 1.8, 1.8, 0.2, 0.7, 0.48, "#929c8b");
  o.cylinder(garage, -4.59, 2.4, 1.8, 0.035, 0.035, 2.3, "#91998c");
  const stucco = surface("#efeddf", 0.22).map!;
  stucco.repeat.set(2, 2);
  for (const color of [
    "#d5c7aa",
    "#d4c7ad",
    "#c8b99e",
    "#d6cdb9",
    "#c3baa4",
    "#b8bba6",
  ])
    o.material(color).map = stucco;

  // Consolidate the static set and each moving asset by material. This preserves
  // all of the modeled detail without issuing thousands of individual draw calls.
  function batch(root: THREE.Group) {
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert();
    const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
    const originals: THREE.Mesh[] = [];
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || Array.isArray(obj.material)) return;
      const geometry = obj.geometry
        .clone()
        .applyMatrix4(
          new THREE.Matrix4().multiplyMatrices(inverse, obj.matrixWorld),
        );
      const list = buckets.get(obj.material) ?? [];
      list.push(geometry);
      buckets.set(obj.material, list);
      originals.push(obj);
      disposables.push(obj.geometry);
    });
    originals.forEach((mesh) => mesh.removeFromParent());
    for (const [material, geometries] of buckets) {
      const merged = mergeGeometries(geometries, false);
      if (merged) {
        const mesh = new THREE.Mesh(merged, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        root.add(mesh);
      }
      geometries.forEach((g) => g.dispose());
    }
  }
  batch(staticSet);
  cars.forEach(({ group }) => batch(group));
  growing.forEach(({ group }) => batch(group));
  batch(door);
  batch(boom);
  const smooth = (t: number) => {
    const p = THREE.MathUtils.clamp(t, 0, 1);
    return p * p * (3 - 2 * p);
  };
  return {
    update(time: number) {
      for (const item of cars)
        item.group.position.set(
          ((item.offset + time * item.speed + 1000) % 340) - 170,
          0,
          item.lane,
        );
      for (const item of growing)
        item.group.scale.y = 0.08 + 0.92 * smooth((time - item.delay) / 4);
      const lift = smooth((time - 31) / 4);
      door.position.y = 1.8 + lift * 1.7;
      door.position.z = -7 - lift * 1.4;
      door.rotation.x = (-lift * Math.PI) / 2;
      rotors.forEach((rotor) => {
        rotor.rotation.y = Math.sin(time * 0.1) * 0.32;
      });
    },
    dispose() {
      o.dispose(scene);
      new Set(disposables).forEach((g) => g.dispose());
    },
  };
}
