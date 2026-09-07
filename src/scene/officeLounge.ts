import type { OfficeFloorplanArea } from './officeFloorplan';
import { WORKSTATION_CLEARANCE } from './officeFloorplan';

export interface OfficeLoungeRectangle {
  x: number;
  z: number;
  width: number;
  depth: number;
}
export const LOUNGE_BAY_CLEARANCE = 0.65;

/** Find scenery space without consuming any furnishing bay or its approach. */
export function findOfficeLounge(
  areas: Pick<OfficeFloorplanArea, 'x' | 'z' | 'width' | 'depth'>[],
  width: number,
  depth: number,
): OfficeLoungeRectangle | null {
  const loungeWidth = 4.8, loungeDepth = 3.7;
  const inset = WORKSTATION_CLEARANCE.perimeter;
  const minX = -width / 2 + inset + loungeWidth / 2;
  const maxX = width / 2 - inset - loungeWidth / 2;
  const minZ = -depth / 2 + inset + loungeDepth / 2;
  const maxZ = depth / 2 - inset - loungeDepth / 2;
  if (![width, depth].every(Number.isFinite) || minX > maxX || minZ > maxZ) return null;
  // Rectangle edge alignments find narrow feasible spaces that a grid can miss.
  const xs = new Set([minX, maxX]);
  const zs = new Set([maxZ, minZ]);
  for (const area of areas) {
    for (const direction of [-1, 1]) {
      xs.add(area.x + direction * ((area.width + loungeWidth) / 2 + LOUNGE_BAY_CLEARANCE));
      zs.add(area.z + direction * ((area.depth + loungeDepth) / 2 + LOUNGE_BAY_CLEARANCE));
    }
  }
  for (const z of [...zs].sort((a, b) => b - a)) {
    if (z < minZ - 1e-8 || z > maxZ + 1e-8) continue;
    for (const x of [...xs].sort((a, b) => a - b)) {
      if (x < minX - 1e-8 || x > maxX + 1e-8) continue;
      const clear = areas.every((area) =>
        Math.abs(x - area.x) >= (loungeWidth + area.width) / 2 + LOUNGE_BAY_CLEARANCE - 1e-8 ||
        Math.abs(z - area.z) >= (loungeDepth + area.depth) / 2 + LOUNGE_BAY_CLEARANCE - 1e-8,
      );
      if (clear) return { x, z, width: loungeWidth, depth: loungeDepth };
    }
  }
  return null;
}
