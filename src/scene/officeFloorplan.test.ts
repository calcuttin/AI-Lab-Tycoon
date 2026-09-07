import { describe, expect, it } from 'vitest';
import { calculateTotalEffects, officeLayouts, type InstalledUpgrade } from '../data/officeLayouts';
import { getFurnishingAreas, relocateOfficeUpgrades } from '../data/officeRelocation';
import { getOfficeFloorplan, WORKSTATION_CLEARANCE as clearance } from './officeFloorplan';

function verifyPlan(plan: ReturnType<typeof getOfficeFloorplan>) {
  const desks = plan.areas.flatMap((area) => area.desks.map((desk) => ({
    x: desk.x + area.x, z: desk.z + area.z,
  })));
  expect(desks).toHaveLength(plan.seatCount);
  for (const area of plan.areas) {
    expect(Math.abs(area.x) + area.width / 2).toBeLessThanOrEqual(plan.width / 2 - clearance.perimeter + 1e-8);
    expect(Math.abs(area.z) + area.depth / 2).toBeLessThanOrEqual(plan.depth / 2 - clearance.perimeter + 1e-8);
    for (const desk of area.desks) {
      expect(Math.abs(desk.x) + clearance.width / 2).toBeLessThanOrEqual(area.width / 2);
      expect(desk.z - clearance.back).toBeGreaterThanOrEqual(-area.depth / 2);
      expect(desk.z + clearance.front).toBeLessThanOrEqual(area.depth / 2);
    }
  }
  for (let i = 0; i < plan.areas.length; i++) {
    for (const b of plan.areas.slice(i + 1)) {
      const a = plan.areas[i];
      const gapX = Math.abs(a.x - b.x) - (a.width + b.width) / 2;
      const gapZ = Math.abs(a.z - b.z) - (a.depth + b.depth) / 2;
      expect(Math.max(gapX, gapZ)).toBeGreaterThanOrEqual(clearance.aisle - 1e-8);
    }
  }
  for (let i = 0; i < desks.length; i++) {
    for (const b of desks.slice(i + 1)) {
      const a = desks[i];
      // Adjacent desks have 50cm between tops; rows have 1.25m clear
      // behind the occupied chair, rather than measuring only desk surfaces.
      expect(Math.abs(a.x - b.x) >= clearance.pitchX - 1e-8 || Math.abs(a.z - b.z) >= clearance.pitchZ - 1e-8).toBe(true);
    }
  }
}

describe('physical office floorplans', () => {
  for (const layout of officeLayouts) {
    it(`${layout.id}: fits every capacity seat, circulation and furnishing bay`, () => {
      const upgraded = layout.slots.filter((slot) => slot.type === 'workstation').map((slot) => ({
        slotId: slot.id, upgradeId: 'dev_workstations', level: 3,
      }));
      for (const upgrades of [[], upgraded]) {
        const plan = getOfficeFloorplan(layout.id, upgrades, 0);
        expect(plan.seatCount).toBe(layout.baseCapacity + calculateTotalEffects(upgrades).capacity);
        verifyPlan(plan);
      }
    });
  }
  it('keeps every carried furnishing accessible through the full progression', () => {
    let upgrades: InstalledUpgrade[] = [
      { slotId: 'main_work', upgradeId: 'dev_workstations', level: 3 },
      { slotId: 'corner_1', upgradeId: 'coffee_corner', level: 2 },
      { slotId: 'closet', upgradeId: 'storage_closet', level: 1 },
      { slotId: 'old-server', upgradeId: 'server_closet', level: 3 },
    ];
    for (const layout of officeLayouts) {
      upgrades = relocateOfficeUpgrades(upgrades, layout.id);
      const plan = getOfficeFloorplan(layout.id, upgrades, 0);
      expect(plan.areas.map((area) => area.slot.id)).toEqual(getFurnishingAreas(layout.id, upgrades).map((slot) => slot.id));
      verifyPlan(plan);
    }
  });
  it('extends a floor for legacy over-capacity staff instead of overlapping desks', () => {
    const plan = getOfficeFloorplan('small', [
      { slotId: 'carried-focus', upgradeId: 'dev_workstations', level: 3 },
      ...Array.from({ length: 8 }, (_, i) => ({ slotId: `carried-server-${i}`, upgradeId: 'server_room', level: 1 })),
    ], 43);
    expect(plan.seatCount).toBe(43);
    verifyPlan(plan);
  });
  it('allocates capacity exactly instead of rounding every workstation bay up', () => {
    const plan = getOfficeFloorplan('medium', [{ slotId: 'dev_area', upgradeId: 'basic_desks', level: 1 }], 1);
    expect(plan.areas.filter((area) => area.slot.type === 'workstation').map((area) => area.desks.length)).toEqual([6, 6, 5]);
  });
});
