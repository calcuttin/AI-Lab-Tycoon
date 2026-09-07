import {
  calculateTotalEffects,
  getLayoutById,
  type InstalledUpgrade,
  type OfficeSizeId,
  type UpgradeSlot,
} from '../data/officeLayouts';
import { getFurnishingAreas } from '../data/officeRelocation';

/** Physical metres, matching OfficeObjects.desk and its occupied chair. */
export const WORKSTATION_CLEARANCE = {
  width: 1.65,
  back: 0.42,
  front: 1.23,
  pitchX: 2.15,
  pitchZ: 2.9,
  aisle: 1.2,
  perimeter: 0.85,
} as const;

export interface OfficeFloorplanArea {
  slot: UpgradeSlot;
  /** World-space centre of this furnishing bay. */
  x: number;
  z: number;
  width: number;
  depth: number;
  /** Desk origins relative to the bay centre; chairs face positive Z. */
  desks: { x: number; z: number }[];
}

export interface OfficeFloorplan {
  width: number;
  depth: number;
  seatCount: number;
  areas: OfficeFloorplanArea[];
}

// These are detached garage, converted ranch house, then increasingly large
// office floors. Dimensions can grow for legacy carried equipment; furniture is
// never shrunk or overlapped to make a percentage diagram appear to fit.
const stages: Record<OfficeSizeId, {
  width: number; depth: number; workColumns: number; deskColumns: number; serviceColumns: number;
}> = {
  hacker_den: { width: 10.8, depth: 8.5, workColumns: 1, deskColumns: 2, serviceColumns: 1 },
  small: { width: 16.4, depth: 13.4, workColumns: 2, deskColumns: 2, serviceColumns: 1 },
  medium: { width: 22, depth: 19, workColumns: 2, deskColumns: 3, serviceColumns: 2 },
  large: { width: 27, depth: 23, workColumns: 2, deskColumns: 3, serviceColumns: 2 },
  campus: { width: 34, depth: 28, workColumns: 2, deskColumns: 4, serviceColumns: 3 },
};

/**
 * Pack actual furniture footprints into circulation-separated bays. The old
 * percentage layout remains UI metadata; it must not determine physical space.
 * Employee count is only a floor for old saves that exceed today's capacity.
 */
export function getOfficeFloorplan(
  size: OfficeSizeId,
  upgrades: InstalledUpgrade[],
  employeesCount: number,
): OfficeFloorplan {
  const layout = getLayoutById(size)!;
  const spec = stages[size];
  const slots = getFurnishingAreas(size, upgrades);
  const work = slots.filter((slot) => slot.type === 'workstation');
  const service = slots.filter((slot) => slot.type !== 'workstation');
  const seatCount = Math.max(
    layout.baseCapacity + calculateTotalEffects(upgrades).capacity,
    Number.isFinite(employeesCount) ? Math.max(0, Math.ceil(employeesCount)) : 0,
  );
  const { pitchX, pitchZ, aisle, perimeter, back, front } = WORKSTATION_CLEARANCE;
  const workColumnCount = Math.min(spec.workColumns, work.length);
  const workWidth = spec.deskColumns * pitchX;
  const serviceWidth = 3.6;
  const serviceDepth = 3.2;
  const serviceColumnCount = Math.min(spec.serviceColumns, service.length);
  const workSpan = workColumnCount * workWidth + (workColumnCount - 1) * aisle;
  const serviceSpan = serviceColumnCount * serviceWidth + Math.max(0, serviceColumnCount - 1) * aisle;
  const neededWidth = workSpan + (service.length ? aisle + serviceSpan : 0) + perimeter * 2;
  const width = Math.max(spec.width, neededWidth);
  const areas: OfficeFloorplanArea[] = [];
  const workHeights = Array.from({ length: workColumnCount }, () => 0);
  const serviceHeights = Array.from({ length: serviceColumnCount }, () => 0);
  // Centre the furnished footprint, leaving stage-specific spare space at edges.
  const left = -((neededWidth - perimeter * 2) / 2);
  for (const [index, slot] of work.entries()) {
    const count = Math.floor(seatCount / work.length) + (index < seatCount % work.length ? 1 : 0);
    const rows = Math.max(1, Math.ceil(count / spec.deskColumns));
    const depth = rows * pitchZ;
    const column = workHeights.indexOf(Math.min(...workHeights));
    const desks = Array.from({ length: count }, (_, deskIndex) => {
      const row = Math.floor(deskIndex / spec.deskColumns);
      const rowCount = Math.min(spec.deskColumns, count - row * spec.deskColumns);
      return {
        x: ((deskIndex % spec.deskColumns) - (rowCount - 1) / 2) * pitchX,
        // Centre desk + chair footprint, preserving the full aisle behind it.
        z: (row - (rows - 1) / 2) * pitchZ - (front - back) / 2,
      };
    });
    areas.push({ slot, x: left + column * (workWidth + aisle) + workWidth / 2,
      z: workHeights[column] + depth / 2, width: workWidth, depth, desks });
    workHeights[column] += depth + aisle;
  }
  for (const slot of service) {
    const column = serviceHeights.indexOf(Math.min(...serviceHeights));
    areas.push({ slot,
      x: left + workSpan + aisle + column * (serviceWidth + aisle) + serviceWidth / 2,
      z: serviceHeights[column] + serviceDepth / 2,
      width: serviceWidth, depth: serviceDepth, desks: [] });
    serviceHeights[column] += serviceDepth + aisle;
  }
  const contentDepth = Math.max(...workHeights, ...serviceHeights) - aisle;
  const depth = Math.max(spec.depth, contentDepth + perimeter * 2);
  for (const area of areas) area.z -= contentDepth / 2;
  // Preserve the original slot ordering for keyboard navigation and employee assignment.
  areas.sort((a, b) => slots.indexOf(a.slot) - slots.indexOf(b.slot));
  return { width, depth, seatCount, areas };
}
