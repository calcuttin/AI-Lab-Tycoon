import {
  getLayoutById,
  getUpgradeById,
  type InstalledUpgrade,
  type OfficeSizeId,
  type UpgradeSlot,
} from "./officeLayouts";

/** Keep owned equipment when a new floor plan uses different slot identifiers. */
export function relocateOfficeUpgrades(
  upgrades: InstalledUpgrade[],
  nextSize: OfficeSizeId,
): InstalledUpgrade[] {
  const slots = getLayoutById(nextSize)?.slots ?? [];
  const matching = (item: InstalledUpgrade) =>
    slots.find(
      (slot) =>
        slot.id === item.slotId &&
        slot.type === getUpgradeById(item.upgradeId)?.slotType,
    );
  const occupied = new Set(
    upgrades.filter((item) => matching(item)).map((item) => item.slotId),
  );
  return upgrades.map((item) => {
    if (matching(item)) return { ...item };
    const replacement = slots.find(
      (slot) =>
        !occupied.has(slot.id) &&
        slot.type === getUpgradeById(item.upgradeId)?.slotType,
    );
    if (replacement) {
      occupied.add(replacement.id);
      return { ...item, slotId: replacement.id };
    }
    // Some offices have no utility area. Keep this equipment accessible as a carried item.
    return {
      ...item,
      slotId: item.slotId.startsWith("carried-")
        ? item.slotId
        : `carried-${item.slotId}`,
    };
  });
}

/** Include equipment carried by older saves, so every paid upgrade can be inspected or sold. */
export function getFurnishingAreas(
  size: OfficeSizeId,
  upgrades: InstalledUpgrade[],
): UpgradeSlot[] {
  const slots = getLayoutById(size)?.slots ?? [];
  const carried = upgrades.filter(
    (item) => !slots.some((slot) => slot.id === item.slotId),
  );
  return [
    ...slots,
    ...carried.flatMap((item, index) => {
      const upgrade = getUpgradeById(item.upgradeId);
      return upgrade
        ? [
            {
              id: item.slotId,
              name: `Carried: ${upgrade.name}`,
              type: upgrade.slotType,
              x: 8 + (index % 5) * 16,
              y: 4 + Math.floor(index / 5) * 14,
              width: 14,
              height: 12,
            },
          ]
        : [];
    }),
  ];
}
