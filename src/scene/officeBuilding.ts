import * as THREE from 'three';
import type { OfficeSizeId } from '../data/officeLayouts';
import type { OfficeObjects } from './officeObjects';
import type { OfficeFloorplanArea } from './officeFloorplan';
import { findOfficeLounge } from './officeLounge';

type SurfaceSpec = {
  asset: string;
  repeat: [number, number];
  tint?: string;
  useColor?: boolean;
  normal?: number;
  roughness?: number;
};
export interface BuildingSurface {
  mesh: THREE.Mesh;
  spec: SurfaceSpec;
}
interface BuildingOptions {
  scene: THREE.Scene;
  room: THREE.Group;
  assets: OfficeObjects;
  size: OfficeSizeId;
  night: boolean;
  width: number;
  depth: number;
  areas?: OfficeFloorplanArea[];
}
interface Opening { x: number; width: number; bottom: number; top: number }

/** Cutaway architecture in metres. Scenery respects the physical furnishing bays. */
export function buildOfficeBuilding({ scene, room, assets: a, size, night, width: w, depth: d, areas = [] }: BuildingOptions) {
  const garage = size === 'hacker_den';
  const house = size === 'small';
  const corporate = !garage && !house;
  const height = garage ? 2.85 : house ? 3.05 : 3.45;
  const rear = -d / 2;
  const left = -w / 2;
  const surfaces: BuildingSurface[] = [];
  const exterior = new THREE.Group();
  exterior.name = `${size} exterior landscaping`;
  scene.add(exterior);
  const surface = (mesh: THREE.Mesh, spec: SurfaceSpec) => { surfaces.push({ mesh, spec }); return mesh; };
  const box = a.box.bind(a);

  box(scene, 0, -0.5, 0, 1000, 0.1, 1000, night ? '#26323a' : '#bbc4b5');
  box(room, 0, -0.23, 0, w + 0.32, 0.46, d + 0.32, garage ? '#96968b' : '#ada99d');
  const floor = a.mesh(room, new THREE.PlaneGeometry(w, d),
    a.material(house ? '#bda57f' : corporate ? '#aaa99d' : '#bbb6a6'), 0, 0.025, 0);
  floor.rotation.x = -Math.PI / 2;
  surface(floor, house
    ? { asset: 'wood_floor', repeat: [w / 1.7, d / 1.7], normal: 0.2, roughness: 0.7 }
    : corporate
      ? { asset: 'fabric_pattern_07', repeat: [w * 1.8, d * 1.8], useColor: false, tint: '#b0b0a4', normal: 0.18, roughness: 1 }
      : { asset: 'garage_floor', repeat: [w / 3, d / 3], normal: 0.35, roughness: 0.96 });

  const openings: Opening[] = garage
    ? [{ x: -w * 0.28, width: 1.65, bottom: 1.35, top: 2.5 }, { x: w * 0.19, width: Math.min(4.7, w * 0.46), bottom: 0.015, top: 2.53 }]
    : house
      ? [-0.31, 0, 0.31].map((x) => ({ x: w * x, width: Math.min(2.2, w * 0.2), bottom: 0.95, top: 2.65 }))
      : Array.from({ length: size === 'medium' ? 4 : 5 }, (_, i) => {
        const count = size === 'medium' ? 4 : 5;
        const bay = (w - 1.2) / count;
        return { x: -w / 2 + 0.6 + bay * (i + 0.5), width: bay - 0.2, bottom: 0.27, top: height - 0.27 };
      });
  const shape = new THREE.Shape();
  shape.moveTo(left, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, height);
  if (!corporate) shape.lineTo(0, height + (house ? 1.05 : 0.75));
  shape.lineTo(left, height); shape.closePath();
  for (const o of openings) {
    const hole = new THREE.Path();
    hole.moveTo(o.x - o.width / 2, o.bottom); hole.lineTo(o.x - o.width / 2, o.top);
    hole.lineTo(o.x + o.width / 2, o.top); hole.lineTo(o.x + o.width / 2, o.bottom); hole.closePath();
    shape.holes.push(hole);
  }
  const wallGeometry = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
  const position = wallGeometry.getAttribute('position');
  const uv = wallGeometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i), position.getY(i));
  const backWall = a.mesh(room, wallGeometry, a.material(house ? '#dfd7c3' : '#d2d3c8'), 0, 0, rear - 0.09);
  const sideWall = box(room, left, height / 2, 0, 0.18, height, d, house ? '#cec7b6' : garage ? '#b7b8aa' : '#c7ceca');
  for (const mesh of [backWall, sideWall]) surface(mesh, {
    asset: 'painted_plaster_wall', repeat: [0.45, 0.45], normal: garage ? 0.3 : 0.12,
    tint: house ? '#ece3ce' : '#f4f4eb',
  });
  const trim = corporate ? '#77857d' : house ? '#e5dfce' : '#9b9d8d';
  box(room, 0, 0.1, rear + 0.13, w, 0.17, 0.065, trim);
  box(room, left + 0.13, 0.1, 0, 0.065, 0.17, d, trim);
  box(room, left, height + 0.015, 0, 0.27, 0.12, d + 0.15, trim);
  box(room, 0, height + 0.015, rear, w + 0.15, 0.13, 0.3, trim);

  const glass = new THREE.MeshPhysicalMaterial({
    color: night ? '#859da7' : '#cfdfdc', roughness: corporate ? 0.06 : 0.13,
    metalness: 0.02, transmission: 0.7, thickness: 0.015, ior: 1.5,
    transparent: true, opacity: 0.72, side: THREE.DoubleSide,
  });
  function window(o: Opening) {
    const y = (o.bottom + o.top) / 2;
    const h = o.top - o.bottom;
    const frame = corporate ? '#566862' : '#e4dfd0';
    const pane = a.mesh(room, new THREE.PlaneGeometry(o.width, h), glass, o.x, y, rear + 0.03);
    pane.castShadow = false;
    for (const x of [-1, 1]) box(room, o.x + x * (o.width / 2 + 0.025), y, rear + 0.08, 0.085, h + 0.13, 0.22, frame, 0.4, corporate ? 0.45 : 0);
    for (const yy of [o.bottom - 0.02, o.top + 0.02]) box(room, o.x, yy, rear + 0.08, o.width + 0.14, 0.09, 0.22, frame);
    box(room, o.x, y, rear + 0.17, 0.045, h, 0.055, frame);
    box(room, o.x, corporate ? o.top - 0.52 : y, rear + 0.17, o.width, 0.045, 0.055, frame);
    if (!corporate) box(room, o.x, o.bottom - 0.075, rear + 0.2, o.width + 0.32, 0.09, 0.38, '#e5dfcc');
    if (house) {
      // Folded linen side panels leave the window and exterior view open.
      box(room, o.x, o.top + 0.14, rear + 0.34, o.width + 0.56, 0.035, 0.035, '#655342', 0.4, 0.3);
      for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
        const curtain = a.cylinder(room, o.x + side * (o.width / 2 + 0.03) + (i - 1.5) * 0.068,
          y - 0.2, rear + 0.27, 0.055, 0.07, h + 0.4, '#d6ceb9');
        curtain.scale.z = 0.7;
        surface(curtain, { asset: 'fabric_pattern_07', repeat: [1.5, 4], useColor: false, tint: '#d6ceb9', normal: 0.2 });
      }
    }
  }
  openings.forEach((o, i) => { if (!garage || i === 0) window(o); });

  function beam(start: THREE.Vector3, end: THREE.Vector3, thickness: number, color: string) {
    const delta = end.clone().sub(start);
    const mesh = box(room, ...start.clone().add(end).multiplyScalar(0.5).toArray() as [number, number, number], thickness, delta.length(), thickness, color);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return mesh;
  }
  if (!corporate) {
    const peak = height + (house ? 1.05 : 0.75);
    for (const side of [-1, 1]) {
      beam(new THREE.Vector3(side * w / 2, height + 0.1, rear), new THREE.Vector3(0, peak + 0.1, rear), 0.18, house ? '#ebe2d0' : '#a48a64');
    }
    if (garage) {
      beam(new THREE.Vector3(-w / 2 + 0.2, height - 0.05, rear + 0.32), new THREE.Vector3(w / 2 - 0.2, height - 0.05, rear + 0.32), 0.16, '#a48a64');
      beam(new THREE.Vector3(0, height, rear + 0.32), new THREE.Vector3(0, peak - 0.1, rear + 0.32), 0.13, '#a48a64');
    } else {
      // Exterior clapboard and an overhanging eave make the converted ranch readable.
      for (let y = 0.25; y < height; y += 0.22)
        box(exterior, left - 0.115, y, 0, 0.025, 0.025, d, '#a0aba0');
      box(exterior, left - 0.33, height + 0.1, 0, 0.8, 0.18, d + 0.45, '#77796c');
    }
  }

  if (garage) {
    const door = openings[1];
    // A partly lifted sectional door: lower panels remain vertical, upper panels turn along the tracks.
    for (const edge of [-1, 1]) {
      const x = door.x + edge * (door.width / 2 + 0.09);
      box(room, x, 1.31, rear + 0.18, 0.09, 2.6, 0.1, '#747d78', 0.38, 0.7);
      box(room, x, 2.63, rear + 1.16, 0.055, 0.075, 2.2, '#818b83', 0.32, 0.7);
      box(room, x, 2.85, rear + 2.18, 0.05, 0.44, 0.045, '#818b83', 0.32, 0.7);
    }
    for (let i = 0; i < 3; i++) {
      const y = 1.55 + i * 0.34;
      box(room, door.x, y, rear + 0.16, door.width - 0.09, 0.325, 0.095, '#d8d7c8', 0.5);
      for (let panel = 0; panel < 5; panel++) {
        box(room, door.x + (panel - 2) * door.width / 5, y, rear + 0.22, door.width / 5 - 0.13, 0.22, 0.026, '#c7cbbb', 0.55);
      }
    }
    for (let i = 0; i < 4; i++) box(room, door.x, 2.65, rear + 0.48 + i * 0.34, door.width - 0.08, 0.08, 0.325, '#c6cbbb');
    box(room, door.x, 1.365, rear + 0.19, door.width, 0.055, 0.1, '#414944');
    box(room, door.x, 2.72, rear + 1.05, 0.045, 0.06, 2.4, '#707a75', 0.3, 0.7);
    box(room, door.x, 2.69, rear + 2.15, 0.36, 0.2, 0.48, '#515f57');
    box(exterior, door.x, -0.01, rear - 1.8, door.width + 0.35, 0.09, 3.5, '#aaa897');
    for (const x of [-1, 1]) box(exterior, door.x + x * door.width * 0.28, 0.038, rear - 1.8, 0.12, 0.006, 3.3, '#95968b');
    box(room, door.x, 0.035, rear + 0.08, door.width, 0.045, 0.32, '#7a8278');

    const workshop = a.group(room, left + 0.16, 0, Math.PI / 2);
    box(workshop, 0, 0.82, 0.25, 2.65, 0.09, 0.58, '#a48a64');
    for (const x of [-1.1, 1.1]) box(workshop, x, 0.4, 0.25, 0.075, 0.8, 0.5, '#596357', 0.45, 0.6);
    box(workshop, 0, 1.7, 0.04, 2.65, 1.35, 0.055, '#a58e66');
    const pegboard = a.texture(512, 256, (ctx) => {
      ctx.fillStyle = '#a58e66'; ctx.fillRect(0, 0, 512, 256);
      for (let col = 0; col < 24; col++) for (let row = 0; row < 12; row++) {
        ctx.fillStyle = '#c3ac82'; ctx.beginPath(); ctx.arc(12 + col * 21, 12 + row * 21, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#635840'; ctx.beginPath(); ctx.arc(12 + col * 21, 11 + row * 21, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
    a.mesh(workshop, new THREE.PlaneGeometry(2.62, 1.32), new THREE.MeshStandardMaterial({ map: pegboard, roughness: 0.9 }), 0, 1.7, 0.071);
    for (let i = 0; i < 7; i++) {
      box(workshop, -0.95 + i * 0.29, 1.75, 0.1, 0.028, 0.3 + (i % 2) * 0.12, 0.028, '#a0aaa3', 0.3, 0.7);
      box(workshop, -0.95 + i * 0.29, 1.58, 0.11, 0.07, 0.18, 0.055, i % 2 ? '#984f39' : '#4c6451');
    }
    box(workshop, 0.65, 0.94, 0.25, 0.65, 0.17, 0.35, '#8b4936');
    box(workshop, -0.75, 0.95, 0.24, 0.24, 0.16, 0.25, '#66716a', 0.4, 0.6);
    a.sign(room, 'GARAGE LAB', 'The valuation is mostly potential.', 2.1, 0.48, -w * 0.28, 0.62, rear + 0.12);
    a.floorFan(room, left + 0.65, rear + 0.7);
    // Conduit and breaker panel belong only to this first, improvised headquarters.
    box(room, left + 0.13, 2.67, 0, 0.032, 0.032, d - 0.3, '#7b857c', 0.4, 0.6);
    box(room, left + 0.18, 1.86, rear + 0.55, 0.2, 0.6, 0.42, '#929c91', 0.45, 0.45);
    box(room, left + 0.14, 2.33, rear + 0.55, 0.035, 0.55, 0.035, '#7b857c', 0.4, 0.6);
  } else if (house) {
    const hearth = a.group(room, left + 0.12, -0.6, Math.PI / 2);
    box(hearth, 0, 0.07, 0.32, 2.45, 0.12, 0.67, '#8a8273');
    box(hearth, 0, 0.77, 0.2, 2.05, 1.4, 0.36, '#a38e78');
    box(hearth, 0, 0.63, 0.395, 1.22, 0.86, 0.03, '#343a34');
    for (let row = 0; row < 8; row++) {
      box(hearth, 0, 0.18 + row * 0.17, 0.388, 2.05, 0.016, 0.025, '#c2b49c');
      for (let col = 0; col < 6; col++) {
        const x = -0.9 + col * 0.36 + (row % 2) * 0.16;
        if (Math.abs(x) > 0.67 || row > 5) box(hearth, x, 0.25 + row * 0.17, 0.398, 0.014, 0.15, 0.01, '#c2b49c');
      }
    }
    box(hearth, 0, 0.63, 0.42, 1.2, 0.86, 0.025, '#303831');
    for (const x of [-0.35, 0, 0.35]) {
      const log = a.cylinder(hearth, x, 0.34, 0.49, 0.075, 0.085, 0.46, '#796249');
      log.rotation.x = Math.PI / 2;
    }
    box(hearth, 0, 1.5, 0.22, 2.28, 0.13, 0.53, '#a48a64');
    a.sign(hearth, 'MAKE THINGS.', 'Rent is due on the first.', 1.6, 0.66, 0, 2.07, 0.08);
    a.mug(hearth, -0.74, 1.57, 0.25);
    box(exterior, left - 0.38, 1.98, -0.6, 0.68, 3.95, 1.02, '#a5927d');
    box(exterior, left - 0.38, 3.98, -0.6, 0.85, 0.16, 1.18, '#aaa18e');
    const board = a.group(room, left + 0.14, d / 2 - 1.8, Math.PI / 2);
    a.sign(board, 'AI → ??? → IPO', 'The living room is now R&D.', 2.05, 1.12, 0, 1.9, 0.02);
    a.sign(room, 'INCUBATOR HOUSE', 'Equity does not cover the utilities.', 2.1, 0.5, 0, 0.53, rear + 0.12);
  } else {
    // Curtain-wall piers, ceiling service rails and a raised entrance express the lease upgrade.
    for (const o of openings) for (const sign of [-1, 1]) {
      box(room, o.x + sign * (o.width / 2 + 0.05), height / 2, rear + 0.03, 0.12, height, 0.28, '#74837c', 0.3, 0.55);
    }
    for (let z = rear + 1; z < d / 2; z += 4) {
      box(room, left + 0.18, height / 2, z, 0.35, height, 0.4, '#bdc7bf');
    }
    const brand = a.group(room, left + 0.13, 0, Math.PI / 2);
    a.sign(brand, size === 'campus' ? 'CATEGORY CREATOR' : size === 'large' ? 'UNREASONABLE SCALE' : 'PRODUCT / MARKET / MAYBE',
      size === 'campus' ? 'Please badge into your disruption.' : 'World-changing. Subject to quarterly review.', 3.4, 1.12, 0, 2.07, 0.03, true);
    box(exterior, 0, -0.025, rear - 1.65, w + 0.4, 0.08, 3.2, '#b2b7aa');
    for (let x = left + 0.4; x < w / 2; x += 1.25) box(exterior, x, 0.019, rear - 1.65, 0.015, 0.005, 3.2, '#8f9a8c');
    if (size !== 'medium') {
      const guard = a.mesh(exterior, new THREE.PlaneGeometry(w, 1.05), glass, 0, 0.65, rear - 3.15);
      guard.castShadow = false;
      box(exterior, 0, 1.19, rear - 3.15, w, 0.045, 0.05, '#71827a', 0.32, 0.6);
      for (let x = left; x <= w / 2; x += 2.4) box(exterior, x, 0.63, rear - 3.15, 0.045, 1.13, 0.06, '#71827a', 0.32, 0.6);
    }
  }

  // Rooms follow physical bay bounds. Walls sit inside those bounds, preserving
  // the full 1.2m circulation lanes outside them and every occupied chair envelope.
  if (house) {
    for (const [index, area] of areas.filter((area) => area.slot.type === 'workstation').entries()) {
      const edgeX = area.x + area.width / 2 - 0.12;
      const backZ = area.z - area.depth / 2 + 0.12;
      const frontZ = area.z + area.depth / 2 - 0.12;
      const doorWidth = 1.5;
      const segment = (area.depth - doorWidth) / 2 - 0.12;
      const material = index % 2 ? '#c9cfbd' : '#d8ceba';
      const rearPartition = box(room, area.x, 0.59, backZ, area.width - 0.04, 1.14, 0.13, material);
      surface(rearPartition, { asset: 'painted_plaster_wall', repeat: [0.45, 0.45], tint: material, normal: 0.15 });
      box(room, area.x, 1.18, backZ, area.width, 0.06, 0.18, '#e8dfca');
      for (const side of [-1, 1]) {
        if (segment > 0.2) {
          const wall = box(room, edgeX, 0.59, area.z + side * (doorWidth / 2 + segment / 2), 0.13, 1.14, segment, material);
          surface(wall, { asset: 'painted_plaster_wall', repeat: [0.45, 0.45], tint: material, normal: 0.15 });
          box(room, edgeX, 1.18, area.z + side * (doorWidth / 2 + segment / 2), 0.18, 0.06, segment, '#e8dfca');
        }
        box(room, edgeX, 1.32, area.z + side * (doorWidth / 2 + 0.06), 0.2, 2.6, 0.11, '#e8dfca');
      }
      box(room, edgeX, 2.64, area.z, 0.22, 0.16, doorWidth + 0.25, '#e8dfca');
      // An exposed door casing gives the cutaway a room silhouette without a roof.
      box(room, area.x - area.width / 2 + 0.12, 1.32, backZ, 0.18, 2.6, 0.18, '#e8dfca');
      box(room, edgeX, 1.32, frontZ, 0.18, 2.6, 0.18, '#e8dfca');
    }
  } else if (corporate) {
    const partitionGlass = new THREE.MeshPhysicalMaterial({ color: '#b9d1c7', roughness: 0.13,
      transmission: 0.3, thickness: 0.012, transparent: true, opacity: 0.23, side: THREE.DoubleSide, depthWrite: false });
    for (const area of areas.filter((area) => /meeting|conference|board|executive|training|server|data|quiet/i.test(area.slot.name))) {
      const bx = area.x - area.width / 2 + 0.045;
      const bz = area.z - area.depth / 2 + 0.045;
      const h = size === 'medium' ? 2.25 : 2.55;
      const rearPane = a.mesh(room, new THREE.PlaneGeometry(area.width - 0.09, h), partitionGlass, area.x, h / 2 + 0.06, bz);
      const sidePane = a.mesh(room, new THREE.PlaneGeometry(area.depth - 0.09, h), partitionGlass, bx, h / 2 + 0.06, area.z);
      sidePane.rotation.y = Math.PI / 2;
      rearPane.castShadow = sidePane.castShadow = false;
      for (const y of [0.065, h + 0.06]) {
        box(room, area.x, y, bz, area.width, 0.045, 0.05, '#647d70', 0.35, 0.5);
        box(room, bx, y, area.z, 0.05, 0.045, area.depth, '#647d70', 0.35, 0.5);
      }
      for (const [x, z] of [[bx, bz], [area.x + area.width / 2 - 0.045, bz], [bx, area.z + area.depth / 2 - 0.045]]) {
        box(room, x, h / 2 + 0.06, z, 0.045, h, 0.045, '#647d70', 0.35, 0.5);
      }
      // The front and aisle-facing side stay fully open for access and picking.
      box(room, area.x, 1.15, bz + 0.008, area.width - 0.16, 0.055, 0.007, '#acbfb2');
      box(room, bx + 0.008, 1.15, area.z, 0.007, 0.055, area.depth - 0.16, '#acbfb2');
    }
  }

  const loungeRect = garage ? null : findOfficeLounge(areas, w, d);
  if (loungeRect) {
    const lounge = a.group(room, loungeRect.x, loungeRect.z);
    lounge.name = house ? 'Inherited living-room lounge (scenery)' : 'Office conversation lounge (scenery)';
    const rug = box(lounge, 0, 0.043, 0, 4.05, 0.026, 3.25, house ? '#8c9276' : '#82958b');
    surface(rug, { asset: 'fabric_pattern_07', repeat: [3, 3], useColor: false,
      tint: house ? '#8c9276' : '#82958b', normal: 0.22, roughness: 1 });
    // Stitched inset edges preserve the quiet, woven rug treatment.
    for (const side of [-1, 1]) {
      box(lounge, side * 1.92, 0.059, 0, 0.018, 0.006, 3.03, '#bbc0a8');
      box(lounge, 0, 0.059, side * 1.51, 3.85, 0.006, 0.018, '#bbc0a8');
    }
    a.sofa(lounge, 0, -1.2);
    if (corporate) {
      const opposite = a.sofa(lounge, 0, 1.2);
      opposite.rotation.y = Math.PI;
    }
    box(lounge, 0, 0.42, 0, 1.3, 0.075, 0.64, '#a48a64');
    for (const x of [-0.48, 0.48]) for (const z of [-0.22, 0.22])
      a.cylinder(lounge, x, 0.23, z, 0.028, 0.025, 0.4, '#544c40');
    a.mug(lounge, 0.34, 0.463, -0.04);
    for (let i = 0; i < 3; i++) {
      const book = box(lounge, -0.28, 0.475 + i * 0.037, 0.02, 0.35, 0.033, 0.25,
        ['#a47756', '#6d8275', '#ddd3b8'][i]);
      book.rotation.y = i === 1 ? 0.12 : -0.04;
    }
    a.cylinder(lounge, 1.75, 0.07, -1.16, 0.25, 0.27, 0.08, '#615f4d');
    a.cylinder(lounge, 1.75, 0.93, -1.16, 0.018, 0.022, 1.73, '#87794f');
    const shade = a.cylinder(lounge, 1.75, 1.8, -1.16, 0.22, 0.32, 0.42, '#d1c6a8');
    surface(shade, { asset: 'fabric_pattern_07', repeat: [2, 2], useColor: false, tint: '#d1c6a8', normal: 0.12 });
    const diffuser = a.mesh(lounge, new THREE.CircleGeometry(0.28, 24),
      new THREE.MeshBasicMaterial({ color: night ? '#ffe2ae' : '#e9dfc4', side: THREE.DoubleSide }), 1.75, 1.58, -1.16);
    diffuser.rotation.x = Math.PI / 2;
    if (night) {
      const readingLight = new THREE.PointLight('#ffd3a0', 4, 4.5, 2);
      readingLight.position.set(1.75, 1.55, -1.16);
      lounge.add(readingLight);
    }
  }

  // Sparse landscaping is left open for the shared scanned foliage pack.
  if (!corporate) box(exterior, 0, -0.17, rear - 1.85, w + 0.4, 0.28, 3.7, '#858c6c');
  exterior.userData.plantingPoints = [
    { x: left + 0.65, z: rear - 1.25 },
    { x: garage ? left + 2.4 : w * 0.27, z: rear - 2.5 },
    { x: w / 2 - 0.6, z: rear - 1.1 },
  ];
  for (const point of exterior.userData.plantingPoints as { x: number; z: number }[]) {
    box(exterior, point.x, 0.12, point.z, 0.78, 0.28, 0.78, corporate ? '#879285' : '#aaa086');
    box(exterior, point.x, 0.266, point.z, 0.66, 0.02, 0.66, '#5b5944');
  }
  // Ceiling fittings remain narrow so the cutaway still exposes every workstation.
  const fittings = corporate ? [-w * 0.28, 0, w * 0.28] : [-w * 0.25, w * 0.25];
  for (const x of fittings) {
    const z = corporate ? -0.7 : rear + 2;
    if (house) a.cylinder(room, x, 2.83, z, 0.18, 0.32, 0.22, '#4e5d51');
    else box(room, x, height - 0.16, z, garage ? 1.45 : 2.4, 0.09, 0.15, garage ? '#afb5a6' : '#4b5e55', 0.4, 0.3);
    const diffuser = a.mesh(room,
      house ? new THREE.CircleGeometry(0.28, 24) : new THREE.PlaneGeometry(garage ? 1.33 : 2.25, 0.1),
      new THREE.MeshBasicMaterial({ color: night ? '#ffe1ae' : '#eeeee0', side: THREE.DoubleSide }),
      x, house ? 2.71 : height - 0.211, z);
    diffuser.rotation.x = Math.PI / 2;
    if (night) {
      const light = new THREE.PointLight(house ? '#ffd3a0' : '#eee5d0', corporate ? 13 : 10, 8, 2);
      light.position.set(x, house ? 2.65 : height - 0.3, z);
      room.add(light);
    }
  }
  return { floor, backWall, sideWall, surfaces, exterior, wallHeight: height };
}
