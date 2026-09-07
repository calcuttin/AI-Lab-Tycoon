import { describe, expect, it } from 'vitest';
import { officeLayouts } from '../data/officeLayouts';
import { getOfficeFloorplan, WORKSTATION_CLEARANCE } from './officeFloorplan';
import { findOfficeLounge, LOUNGE_BAY_CLEARANCE } from './officeLounge';

describe('scenery lounge placement', () => {
  it('prefers the front-left corner while preserving the architectural perimeter', () => {
    const lounge = findOfficeLounge([], 16, 12)!;
    expect(lounge).toMatchObject({ x: -4.75, width: 4.8, depth: 3.7 });
    expect(lounge.z).toBeCloseTo(3.3);
  });
  it('does not squeeze scenery into an undersized or occupied floor', () => {
    expect(findOfficeLounge([], 6, 5)).toBeNull();
    expect(findOfficeLounge([{ x: 0, z: 0, width: 12, depth: 12 }], 12, 12)).toBeNull();
  });
  it('moves away from an occupied corner rather than shrinking the clearance', () => {
    const area = { x: -4.75, z: 3.3, width: 4.8, depth: 3.7 };
    const result = findOfficeLounge([area], 16, 12)!;
    expect(result).not.toBeNull();
    expect(Math.abs(result.x - area.x)).toBeGreaterThanOrEqual(4.8 + LOUNGE_BAY_CLEARANCE - 1e-8);
    expect(result.z).toBeCloseTo(3.3);
  });
  for (const layout of officeLayouts.filter((layout) => layout.id !== 'hacker_den')) {
    it(`${layout.id}: keeps the lounge clear of every current and legacy furnishing bay`, () => {
      for (const employees of [0, 43, 100]) {
        const upgrades = [
          { slotId: layout.slots[0].id, upgradeId: 'dev_workstations', level: 3 },
          ...Array.from({ length: 5 }, (_, i) => ({ slotId: `carried-server-${i}`, upgradeId: 'server_room', level: 1 })),
        ];
        const plan = getOfficeFloorplan(layout.id, upgrades, employees);
        const lounge = findOfficeLounge(plan.areas, plan.width, plan.depth);
        if (!lounge) continue;
        expect(Math.abs(lounge.x) + lounge.width / 2).toBeLessThanOrEqual(plan.width / 2 - WORKSTATION_CLEARANCE.perimeter + 1e-8);
        expect(Math.abs(lounge.z) + lounge.depth / 2).toBeLessThanOrEqual(plan.depth / 2 - WORKSTATION_CLEARANCE.perimeter + 1e-8);
        for (const area of plan.areas) {
          const gapX = Math.abs(lounge.x - area.x) - (lounge.width + area.width) / 2;
          const gapZ = Math.abs(lounge.z - area.z) - (lounge.depth + area.depth) / 2;
          expect(Math.max(gapX, gapZ)).toBeGreaterThanOrEqual(LOUNGE_BAY_CLEARANCE - 1e-8);
        }
      }
    });
  }
  it('finds room for the inherited house lounge in the normal house layout', () => {
    const plan = getOfficeFloorplan('small', [], 0);
    expect(findOfficeLounge(plan.areas, plan.width, plan.depth)).not.toBeNull();
  });
});
