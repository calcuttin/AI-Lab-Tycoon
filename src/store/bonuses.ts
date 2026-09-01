import { getRoomTypeById, type RoomEffects, type RoomTypeId } from '../data/roomTypes';
import { calculateTotalEffects, type InstalledUpgrade } from '../data/officeLayouts';

export interface OfficeRoom {
  id: string;
  typeId: RoomTypeId;
  gridX: number;
  gridY: number;
  level: number;
  condition: number;
}

export type CombinedBonuses = {
  productivityBonus: number;
  moraleBonus: number;
  researchBonus: number;
  reputationBonus: number;
  burnoutReduction: number;
};

type SlotBonuses = ReturnType<typeof calculateUpgradeBonuses>;

export function calculateUpgradeBonuses(installedUpgrades: InstalledUpgrade[]) {
  return calculateTotalEffects(installedUpgrades);
}

export function calculateRoomBonuses(rooms: OfficeRoom[]): RoomEffects {
  const totals: RoomEffects = {
    productivityBonus: 0,
    moraleBonus: 0,
    researchBonus: 0,
    reputationBonus: 0,
    capacityBonus: 0,
    burnoutReduction: 0,
    teamworkBonus: 0,
    eventBonus: 0,
  };

  for (const room of rooms) {
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType) continue;

    const levelMultiplier = roomType.upgradable && roomType.upgradeMultiplier
      ? 1 + (room.level - 1) * (roomType.upgradeMultiplier - 1)
      : 1;
    const conditionMultiplier = room.condition / 100;
    const effectMultiplier = levelMultiplier * conditionMultiplier;

    if (roomType.effects.productivityBonus) {
      totals.productivityBonus! += roomType.effects.productivityBonus * effectMultiplier;
    }
    if (roomType.effects.moraleBonus) {
      totals.moraleBonus! += roomType.effects.moraleBonus * effectMultiplier;
    }
    if (roomType.effects.researchBonus) {
      totals.researchBonus! += roomType.effects.researchBonus * effectMultiplier;
    }
    if (roomType.effects.reputationBonus) {
      totals.reputationBonus! += roomType.effects.reputationBonus * effectMultiplier;
    }
    if (roomType.effects.capacityBonus) {
      totals.capacityBonus! += roomType.effects.capacityBonus;
    }
    if (roomType.effects.burnoutReduction) {
      totals.burnoutReduction = Math.min(
        0.8,
        (totals.burnoutReduction ?? 0) + roomType.effects.burnoutReduction * effectMultiplier,
      );
    }
    if (roomType.effects.teamworkBonus) {
      totals.teamworkBonus! += roomType.effects.teamworkBonus * effectMultiplier;
    }
    if (roomType.effects.eventBonus) {
      totals.eventBonus! += roomType.effects.eventBonus * effectMultiplier;
    }
  }

  return totals;
}

export function computeCombinedBonuses(_roomBonuses: RoomEffects, slotBonuses: SlotBonuses): CombinedBonuses {
  return {
    productivityBonus: slotBonuses.productivity || 0,
    moraleBonus: slotBonuses.morale || 0,
    researchBonus: slotBonuses.research || 0,
    reputationBonus: slotBonuses.reputation || 0,
    burnoutReduction: Math.min(0.8, slotBonuses.burnoutReduction || 0),
  };
}
