import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { OfficeObjects } from './officeObjects';
import { getOfficeFloorplan } from './officeFloorplan';

// Measure the actual mesh geometry, including chair backs/arms, the kitchen
// refrigerator, and the second upgraded rack. The partition extends 7cm into
// the bay at its rear/left edges; front and right remain open to the aisle.
describe('furniture against service-room walls', () => {
  const fixtures: [string, (assets: OfficeObjects, room: THREE.Group) => void][] = [
    ['conference table and chairs', (assets, room) => { assets.meeting(room, 0, 0); }],
    ['full kitchen and refrigerator', (assets, room) => { assets.coffee(room, 0, 0, true); }],
    ['upgraded server racks', (assets, room) => { assets.server(room, 0, 0, 3); }],
    ['storage shelves', (assets, room) => { assets.storage(room, 0, 0); }],
    ['sofa and adjacent plant', (assets, room) => { assets.sofa(room, 0, 0); assets.plant(room, 1.35, 0, 0.65); }],
  ];
  for (const [name, build] of fixtures) {
    it(`${name} fits the furnishing bay and clears the glass partition`, () => {
      const assets = new OfficeObjects(), room = new THREE.Group();
      build(assets, room);
      const bounds = new THREE.Box3().setFromObject(room);
      const area = getOfficeFloorplan('large', [], 0).areas.find((area) => area.slot.type === 'infrastructure')!;
      expect(bounds.min.x).toBeGreaterThan(-area.width / 2 + 0.07);
      expect(bounds.max.x).toBeLessThan(area.width / 2);
      expect(bounds.min.z).toBeGreaterThan(-area.depth / 2 + 0.07);
      expect(bounds.max.z).toBeLessThan(area.depth / 2);
      assets.dispose(room);
    });
  }
});
