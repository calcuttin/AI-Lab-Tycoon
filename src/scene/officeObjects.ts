import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Original, editable game assets. Units are meters; Y is up.
export class OfficeObjects {
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private geometries = new Map<string, THREE.BufferGeometry>();
  private propSlots: { shell: THREE.Group; kind: string }[] = [];
  private retiredProps: THREE.Object3D[] = [];
  private detailRoot: THREE.Object3D | null = null;
  private disposed = false;
  private screenTick = -1;
  readonly fans: THREE.Object3D[] = [];
  readonly foliage: { object: THREE.Object3D; rest: number; phase: number }[] = [];
  readonly animatedScreens: THREE.MeshStandardMaterial[] = [];
  readonly leds: THREE.Mesh[] = [];
  readonly people: {
    group: THREE.Group;
    arms: THREE.Group[];
    head: THREE.Object3D;
    phase: number;
    working: boolean;
  }[] = [];
  readonly steam: THREE.Mesh[] = [];

  material(color: string, roughness = 0.7, metalness = 0) {
    const key = `${color}/${roughness}/${metalness}`;
    if (!this.materials.has(key))
      this.materials.set(
        key,
        new THREE.MeshStandardMaterial({ color, roughness, metalness }),
      );
    return this.materials.get(key)!;
  }
  mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  box(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    roughness = 0.7,
    metalness = 0,
  ) {
    const key = `b/${w}/${h}/${d}`;
    if (!this.geometries.has(key))
      this.geometries.set(key, new THREE.BoxGeometry(w, h, d));
    return this.mesh(
      parent,
      this.geometries.get(key)!,
      this.material(color, roughness, metalness),
      x,
      y,
      z,
    );
  }
  cylinder(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    top: number,
    bottom: number,
    height: number,
    color: string,
  ) {
    const key = `c/${top}/${bottom}/${height}`;
    if (!this.geometries.has(key))
      this.geometries.set(
        key,
        new THREE.CylinderGeometry(top, bottom, height, 16),
      );
    return this.mesh(
      parent,
      this.geometries.get(key)!,
      this.material(color),
      x,
      y,
      z,
    );
  }
  sphere(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    color: string,
  ) {
    const key = `s/${radius}`;
    if (!this.geometries.has(key))
      this.geometries.set(key, new THREE.SphereGeometry(radius, 16, 12));
    return this.mesh(
      parent,
      this.geometries.get(key)!,
      this.material(color),
      x,
      y,
      z,
    );
  }
  group(parent: THREE.Object3D, x: number, z: number, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    parent.add(group);
    return group;
  }
  texture(
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    draw(ctx);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  sign(
    parent: THREE.Object3D,
    text: string,
    subtext: string,
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    dark = false,
  ) {
    const map = this.texture(768, 384, (ctx) => {
      ctx.fillStyle = dark ? "#263b32" : "#eeede5";
      ctx.fillRect(0, 0, 768, 384);
      ctx.fillStyle = dark ? "#d6f293" : "#263b32";
      ctx.font = "bold 66px sans-serif";
      ctx.fillText(text, 45, 155);
      ctx.font = "24px sans-serif";
      ctx.fillText(subtext, 48, 218);
      ctx.strokeStyle = dark ? "#657963" : "#bdc4b8";
      ctx.beginPath();
      ctx.moveTo(48, 264);
      ctx.lineTo(715, 264);
      ctx.stroke();
    });
    return this.mesh(
      parent,
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({ map, roughness: 0.95 }),
      x,
      y,
      z,
    );
  }
  monitor(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    index: number,
  ) {
    this.box(parent, x, y + 0.06, z, 0.36, 0.04, 0.24, "#4c5255", 0.35, 0.5);
    this.box(parent, x, y + 0.25, z, 0.045, 0.4, 0.04, "#4c5255", 0.35, 0.5);
    this.box(parent, x, y + 0.51, z, 0.84, 0.52, 0.065, "#20272c", 0.45, 0.2);
    const map = this.texture(256, 160, (ctx) => {
      ctx.fillStyle = "#142329";
      ctx.fillRect(0, 0, 256, 160);
      ctx.fillStyle = "#293c42";
      ctx.fillRect(0, 0, 256, 16);
      ctx.fillRect(0, 18, 43, 142);
      for (let i = 0; i < 11; i++) {
        ctx.fillStyle = ["#81cbbc", "#d4bc80", "#8e9fbc", "#71949b"][
          (i + index) % 4
        ];
        ctx.fillRect(
          52 + (i % 3) * 8,
          26 + i * 9,
          30 + ((i * 23 + index * 17) % 132),
          3,
        );
      }
    });
    const material = new THREE.MeshStandardMaterial({
      map,
      emissiveMap: map,
      emissive: "#a3d8d2",
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    this.animatedScreens.push(material);
    this.mesh(
      parent,
      new THREE.PlaneGeometry(0.78, 0.45),
      material,
      x,
      y + 0.51,
      z + 0.035,
    );
  }
  chair(parent: THREE.Object3D, x: number, z: number, color = "#4c6062") {
    const group = this.group(parent, x, z);
    this.propSlots.push({ shell: group, kind: "ChairShell" });
    this.cylinder(group, 0, 0.28, 0, 0.035, 0.045, 0.44, "#343c40");
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const leg = this.box(
        group,
        Math.sin(a) * 0.16,
        0.085,
        Math.cos(a) * 0.16,
        0.035,
        0.04,
        0.35,
        "#3c4447",
        0.5,
        0.4,
      );
      leg.rotation.y = a;
      this.sphere(
        group,
        Math.sin(a) * 0.3,
        0.055,
        Math.cos(a) * 0.3,
        0.055,
        "#252b2f",
      );
    }
    this.box(group, 0, 0.53, 0, 0.52, 0.13, 0.49, color);
    const back = this.box(group, 0, 0.88, 0.25, 0.52, 0.55, 0.1, color);
    back.rotation.x = -0.1;
    for (const side of [-1, 1]) {
      this.box(group, side * 0.31, 0.7, 0, 0.04, 0.26, 0.05, "#30393b");
      this.box(group, side * 0.31, 0.83, -0.025, 0.085, 0.04, 0.3, "#30393b");
    }
    return group;
  }
  mug(parent: THREE.Object3D, x: number, y: number, z: number) {
    this.cylinder(parent, x, y + 0.08, z, 0.064, 0.055, 0.15, "#ece6d8");
    this.cylinder(parent, x, y + 0.156, z, 0.052, 0.052, 0.006, "#403125");
    const ring = this.mesh(
      parent,
      new THREE.TorusGeometry(0.04, 0.013, 6, 12),
      this.material("#ece6d8"),
      x + 0.072,
      y + 0.09,
      z,
    );
    ring.rotation.y = Math.PI / 2;
  }
  desk(
    parent: THREE.Object3D,
    x: number,
    z: number,
    index: number,
    upgraded = false,
    standing = false,
  ) {
    const group = this.group(parent, x, z);
    const h = standing ? 1.12 : 0.82;
    const shell = this.group(group, 0, 0);
    if (!standing) this.propSlots.push({ shell, kind: 'DeskShell' });
    for (const a of [-0.72, 0.72])
      for (const b of [-0.31, 0.31])
        this.box(shell, a, h / 2, b, 0.045, h, 0.045, "#4b4b47", 0.4, 0.4);
    this.box(
      shell,
      0,
      h,
      0,
      1.65,
      0.075,
      0.84,
      upgraded ? "#b99562" : "#b9a17f",
    );
    // Edge banding and individual grain lines catch the sun.
    for (let i = 0; i < 7; i++)
      this.box(
        shell,
        0,
        h + 0.038,
        -0.35 + i * 0.11,
        1.58,
        0.001,
        0.005,
        i % 2 ? "#ae906a" : "#c3a881",
      );
    this.monitor(group, upgraded ? -0.35 : 0, h + 0.04, -0.18, index);
    if (upgraded) {
      const second = this.group(group, 0.48, -0.13, -0.2);
      this.monitor(second, 0, h + 0.04, 0, index + 2);
    }
    this.box(group, -0.1, h + 0.063, 0.22, 0.53, 0.025, 0.19, "#c0c2bd");
    if (!this.materials.has("keyboard")) {
      const map = this.texture(256, 96, (ctx) => {
        ctx.fillStyle = "#b6bbb3";
        ctx.fillRect(0, 0, 256, 96);
        for (let row = 0; row < 3; row++)
          for (let col = 0; col < 10; col++) {
            ctx.fillStyle = "#727a70";
            ctx.fillRect(5 + col * 25, 5 + row * 29, 21, 25);
            ctx.fillStyle = "#e3e1d8";
            ctx.fillRect(5 + col * 25, 4 + row * 29, 21, 22);
          }
      });
      this.materials.set(
        "keyboard",
        new THREE.MeshStandardMaterial({ map, roughness: 0.65 }),
      );
    }
    const keys = this.mesh(
      group,
      new THREE.PlaneGeometry(0.51, 0.18),
      this.materials.get("keyboard")!,
      -0.1,
      h + 0.078,
      0.22,
    );
    keys.rotation.x = -Math.PI / 2;
    this.box(group, 0.48, h + 0.045, 0.22, 0.23, 0.008, 0.24, "#485a57");
    const mouse = this.sphere(group, 0.48, h + 0.07, 0.22, 0.055, "#a9aea9");
    mouse.scale.set(0.65, 0.42, 1);
    this.mug(group, -0.65, h + 0.04, 0.12);
    this.box(group, -0.51, h / 2, -0.17, 0.21, 0.48, 0.42, "#343d40");
    this.box(group, -0.51, h / 2 + 0.15, 0.045, 0.12, 0.02, 0.007, "#7db9a5");
    if (!standing)
      this.chair(group, 0, 0.87, index % 2 ? "#62664f" : "#536b69");
    if (index % 2 === 0) {
      const lamp = this.group(group, 0.65, -0.25);
      lamp.position.y = h + 0.04;
      lamp.rotation.y = -0.4;
      this.propSlots.push({ shell: lamp, kind: 'DeskLamp' });
    }
    return { group, standing };
  }
  person(
    parent: THREE.Object3D,
    index: number,
    working: boolean,
    standing = false,
  ) {
    const group = this.group(parent, 0, 0.84, Math.PI);
    const skin = ["#cda07c", "#8c5d45", "#dfbca1", "#ba8462"][index % 4];
    const shirt = ["#5b7773", "#d0ad70", "#606f96", "#bc795f", "#76766c"][
      index % 5
    ];
    const seat = standing ? 0.5 : 0;
    this.box(group, -0.12, 0.29 + seat, -0.02, 0.15, 0.48, 0.17, "#374451");
    this.box(group, 0.12, 0.29 + seat, -0.02, 0.15, 0.48, 0.17, "#374451");
    this.box(group, -0.12, 0.075, 0.055, 0.18, 0.12, 0.32, "#dfddd3");
    this.box(group, 0.12, 0.075, 0.055, 0.18, 0.12, 0.32, "#dfddd3");
    const torso = this.sphere(group, 0, 0.83 + seat * 0.5, 0, 0.29, shirt);
    torso.scale.set(0.86, 1.25, 0.67);
    this.cylinder(group, 0, 1.14 + seat * 0.5, 0, 0.07, 0.07, 0.14, skin);
    const headPartsStart = new Set(group.children);
    const head = this.sphere(group, 0, 1.36 + seat * 0.5, 0.025, 0.19, skin);
    head.scale.set(0.86, 1.08, 0.94);
    const hair = this.sphere(
      group,
      0,
      1.47 + seat * 0.5,
      -0.02,
      0.18,
      index % 3 ? "#3d302b" : "#806447",
    );
    hair.scale.set(1, 0.62, 1);
    for (const side of [-1, 1]) {
      this.sphere(
        group,
        side * 0.07,
        1.37 + seat * 0.5,
        0.184,
        0.018,
        "#3b3530",
      );
    }
    const headRig = new THREE.Group();
    headRig.position.copy(head.position);
    const headParts = group.children.filter((part) => !headPartsStart.has(part));
    group.add(headRig);
    headParts.forEach((part) => { part.position.sub(headRig.position); headRig.add(part); });
    const arms: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const arm = this.group(group, side * 0.24, 0);
      arm.position.y = 0.97 + seat * 0.5;
      const sleeve = this.cylinder(
        arm,
        0,
        -0.14,
        0.02,
        0.075,
        0.07,
        0.3,
        shirt,
      );
      sleeve.rotation.x = -0.3;
      const forearm = this.cylinder(
        arm,
        0,
        -0.26,
        0.16,
        0.047,
        0.05,
        0.27,
        skin,
      );
      forearm.rotation.x = Math.PI / 2;
      this.sphere(arm, 0, -0.26, 0.3, 0.06, skin);
      arms.push(arm);
    }
    this.people.push({ group, arms, head: headRig, phase: index * 1.7, working });
    return group;
  }
  plant(parent: THREE.Object3D, x: number, z: number, size = 1) {
    const group = this.group(parent, x, z);
    group.scale.setScalar(size);
    this.cylinder(group, 0, 0.24, 0, 0.25, 0.18, 0.45, "#d5c6ac");
    this.cylinder(group, 0, 0.47, 0, 0.23, 0.23, 0.02, "#544b34");
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.4;
      const height = 0.65 + (i % 4) * 0.18;
      const stem = this.cylinder(
        group,
        Math.cos(angle) * 0.1,
        height / 2 + 0.45,
        Math.sin(angle) * 0.1,
        0.012,
        0.012,
        height,
        "#4b6540",
      );
      stem.rotation.z = Math.cos(angle) * 0.3;
      const leaf = this.sphere(
        group,
        Math.cos(angle) * 0.26,
        height + 0.4,
        Math.sin(angle) * 0.26,
        0.22,
        ["#58744a", "#778e51", "#3d654b"][i % 3],
      );
      leaf.scale.set(0.65, 1.4, 0.25);
      leaf.rotation.set(0.5, angle, -0.5);
      this.foliage.push({ object: leaf, rest: -0.5, phase: i * 1.7 + x });
    }
  }
  server(parent: THREE.Object3D, x: number, z: number, level = 1) {
    const group = this.group(parent, x, z);
    this.box(group, 0, 1, 0, 0.72, 2, 0.8, "#29343b", 0.45, 0.35);
    this.box(group, 0, 1.02, 0.41, 0.61, 1.85, 0.025, "#131e23");
    for (let i = 0; i < 9; i++) {
      this.box(
        group,
        0,
        0.2 + i * 0.19,
        0.44,
        0.55,
        0.145,
        0.03,
        "#47515a",
        0.4,
        0.5,
      );
      for (let j = 0; j < 6; j++)
        this.box(
          group,
          -0.16 + j * 0.053,
          0.2 + i * 0.19,
          0.46,
          0.02,
          0.082,
          0.008,
          "#242e36",
        );
      const led = this.box(
        group,
        0.23,
        0.2 + i * 0.19,
        0.468,
        0.023,
        0.018,
        0.01,
        "#a9e88e",
      );
      const mat = new THREE.MeshStandardMaterial({
        color: "#a9e88e",
        emissive: "#9ae78a",
        emissiveIntensity: 1.4,
      });
      led.material = mat;
      this.leds.push(led);
    }
    if (level > 1) {
      const second = group.clone();
      second.position.x += 0.86;
      parent.add(second);
    }
    return group;
  }
  coffee(parent: THREE.Object3D, x: number, z: number, kitchen = false) {
    const group = this.group(parent, x, z);
    this.box(group, 0, 0.45, 0, 1.65, 0.9, 0.7, "#849083");
    this.box(group, 0, 0.93, 0, 1.74, 0.07, 0.8, "#dad6c8");
    for (const a of [-0.52, 0, 0.52]) {
      this.box(group, a, 0.43, 0.36, 0.49, 0.78, 0.025, "#919c8d");
      this.box(group, a, 0.73, 0.39, 0.16, 0.018, 0.03, "#455047");
    }
    this.box(group, -0.38, 1.18, -0.1, 0.45, 0.45, 0.42, "#3c4646", 0.3, 0.5);
    this.box(group, -0.38, 1.24, 0.13, 0.33, 0.19, 0.025, "#a5ada6", 0.3, 0.7);
    this.box(group, -0.38, 1.025, 0.14, 0.35, 0.03, 0.25, "#515956");
    this.mug(group, -0.38, 1.04, 0.15);
    this.mug(group, 0.27, 0.98, 0.05);
    for (let i = 0; i < 3; i++) {
      const puff = this.sphere(
        group,
        -0.38,
        1.4 + i * 0.1,
        0.15,
        0.035 + i * 0.016,
        "#f7f2df",
      );
      puff.material = new THREE.MeshBasicMaterial({
        color: "#f7f2df",
        transparent: true,
        opacity: 0.22,
      });
      this.steam.push(puff);
    }
    if (kitchen) {
      this.box(group, 1.22, 0.97, -0.02, 0.72, 1.94, 0.74, "#d6d7ce", 0.3, 0.5);
      this.box(group, 0.92, 1.02, 0.37, 0.025, 0.55, 0.045, "#69756e");
    }
    return group;
  }
  sofa(parent: THREE.Object3D, x: number, z: number, color = "#b16d45") {
    const group = this.group(parent, x, z);
    for (const a of [-0.92, 0.92])
      for (const b of [-0.32, 0.32])
        this.cylinder(group, a, 0.12, b, 0.04, 0.03, 0.22, "#564335");
    this.box(group, 0, 0.37, 0, 2.1, 0.36, 0.85, color);
    this.box(group, 0, 0.76, -0.36, 2.1, 0.7, 0.22, color);
    for (const a of [-1, 1])
      this.box(group, a, 0.64, 0, 0.2, 0.42, 0.87, color);
    for (const a of [-0.5, 0.5])
      this.box(group, a, 0.59, 0.01, 0.86, 0.13, 0.63, "#c28a5c");
    const pillow = this.box(
      group,
      -0.65,
      0.85,
      -0.1,
      0.36,
      0.37,
      0.13,
      "#d3cbaa",
    );
    pillow.rotation.z = 0.2;
    return group;
  }
  meeting(parent: THREE.Object3D, x: number, z: number) {
    const group = this.group(parent, x, z);
    this.box(group, 0, 0.8, 0, 1.8, 0.08, 1.1, "#b29b79");
    for (const a of [-0.6, 0.6])
      this.box(group, a, 0.4, 0, 0.075, 0.8, 0.6, "#535d56");
    this.chair(group, -0.5, 0.9);
    this.chair(group, 0.5, 0.9);
    const c = this.chair(group, 0, -0.9);
    c.rotation.y = Math.PI;
    this.box(group, 0, 0.85, 0.1, 0.42, 0.02, 0.3, "#e1ded1");
    this.mug(group, 0.6, 0.85, 0.15);
    return group;
  }
  storage(parent: THREE.Object3D, x: number, z: number) {
    const group = this.group(parent, x, z);
    for (const a of [-0.65, 0.65])
      this.box(group, a, 0.95, 0, 0.035, 1.9, 0.58, "#535f58", 0.5, 0.5);
    for (let i = 0; i < 4; i++) {
      this.box(group, 0, 0.12 + i * 0.56, 0, 1.38, 0.04, 0.64, "#918d7c");
      for (let j = 0; j < 2; j++) {
        this.box(
          group,
          -0.35 + j * 0.68,
          0.34 + i * 0.56,
          0,
          0.52,
          0.38,
          0.49,
          i % 2 ? "#b79768" : "#a4a18d",
        );
        this.box(
          group,
          -0.35 + j * 0.68,
          0.37 + i * 0.56,
          0.25,
          0.18,
          0.09,
          0.005,
          "#e0d8bd",
        );
      }
    }
    return group;
  }
  animateScreens(time: number) {
    const tick = Math.floor(time * 4);
    if (tick === this.screenTick) return;
    this.screenTick = tick;
    this.animatedScreens.forEach((material, index) => {
      const map = material.map;
      const canvas = map?.image;
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !map) return;
      ctx.fillStyle = '#142329'; ctx.fillRect(45, 128, 211, 32);
      ctx.fillStyle = '#71949b'; ctx.fillRect(53, 135, 38 + ((tick + index * 17) % 105), 3);
      if (tick % 4 < 2) { ctx.fillStyle = '#e6d292'; ctx.fillRect(60 + ((tick + index * 17) % 105), 133, 2, 7); }
      ctx.fillStyle = '#293c42'; ctx.fillRect(0, 151, 256, 9);
      ctx.fillStyle = '#87baa0'; ctx.fillRect(5, 154, 20 + (tick + index * 11) % 70, 3);
      map.needsUpdate = true;
    });
  }
  floorFan(parent: THREE.Object3D, x: number, z: number) {
    const body = this.group(parent, x, z, -0.3);
    this.propSlots.push({ shell: body, kind: 'FloorFan' });
    const rotor = this.group(body, 0, 0);
    rotor.position.y = 0.91;
    // This child is populated separately so it can rotate around its real hub.
    this.propSlots.push({ shell: rotor, kind: 'FanRotor' });
    this.fans.push(rotor);
  }
  async loadDetails(onReady: () => void) {
    try {
      const gltf = await new GLTFLoader().loadAsync('/models/office-props.glb');
      if (this.disposed) { this.dispose(gltf.scene); return; }
      this.detailRoot = gltf.scene;
      for (const { shell, kind } of this.propSlots) {
        const source = gltf.scene.getObjectByName(kind);
        if (!source) continue;
        // Retain nested slots (the fan rotor) while replacing placeholder geometry.
        for (const child of [...shell.children]) {
          if (this.propSlots.some((slot) => slot.shell === child)) continue;
          shell.remove(child); this.retiredProps.push(child);
        }
        const model = source.clone(true);
        model.position.set(0, 0, 0);
        model.traverse((o) => {
          if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; }
        });
        shell.add(model);
      }
      onReady();
    } catch {
      // Original furniture remains fully usable if the optional detail pack fails.
    }
  }
  dispose(root: THREE.Object3D) {
    this.disposed = true;
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    const roots = [root, ...this.retiredProps, ...(this.detailRoot ? [this.detailRoot] : [])];
    roots.forEach((item) => item.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    }));
    this.geometries.forEach((g) => geometries.add(g));
    this.materials.forEach((m) => materials.add(m));
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  }
}
