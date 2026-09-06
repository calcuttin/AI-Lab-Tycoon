import { describe, expect, it } from "vitest";
import {
  officeLayouts,
  calculateTotalEffects,
  getUpgradeById,
  getUpgradesForSlot,
  type InstalledUpgrade,
} from "./officeLayouts";
import { getFurnishingAreas, relocateOfficeUpgrades } from "./officeRelocation";
import { useGameStore } from "../store/gameStore";

describe("moving office equipment", () => {
  it("relocates purchased amenities and preserves equipment without a matching slot", () => {
    const owned: InstalledUpgrade[] = [
      { slotId: "main_work", upgradeId: "basic_desks", level: 1 },
      { slotId: "corner_1", upgradeId: "coffee_corner", level: 2 },
      { slotId: "closet", upgradeId: "storage_closet", level: 1 },
    ];
    const moved = relocateOfficeUpgrades(owned, "small");
    expect(moved.map((item) => item.slotId)).toEqual([
      "main_work",
      "break_area",
      "carried-closet",
    ]);
    expect(calculateTotalEffects(moved)).toEqual(calculateTotalEffects(owned));
    const areas = getFurnishingAreas("small", moved);
    expect(
      moved.every((item) => areas.some((area) => area.id === item.slotId)),
    ).toBe(true);
    expect(owned[1].slotId).toBe("corner_1");
  });
  it("preserves every upgrade and uses unique, compatible areas through every expansion", () => {
    let owned: InstalledUpgrade[] = [];
    for (const layout of officeLayouts) {
      owned = relocateOfficeUpgrades(owned, layout.id);
      for (const slot of layout.slots) {
        if (owned.some((item) => item.slotId === slot.id)) continue;
        const upgrade = getUpgradesForSlot(slot.type, layout.id)[0];
        if (upgrade)
          owned.push({ slotId: slot.id, upgradeId: upgrade.id, level: 1 });
      }
      const areas = getFurnishingAreas(layout.id, owned);
      expect(new Set(owned.map((item) => item.slotId)).size).toBe(owned.length);
      for (const item of owned)
        expect(areas.find((area) => area.id === item.slotId)?.type).toBe(
          getUpgradeById(item.upgradeId)?.slotType,
        );
    }
  });
  it("charges relocation and keeps upgrades accessible in the actual store", () => {
    useGameStore.getState().initializeGame();
    useGameStore.getState().installUpgrade("corner_1", "coffee_corner");
    useGameStore.getState().upgradeOfficeSize();
    const state = useGameStore.getState();
    expect(state.money).toBe(88500);
    expect(state.office.size).toBe("small");
    expect(state.office.installedUpgrades).toContainEqual({
      slotId: "break_area",
      upgradeId: "coffee_corner",
      level: 1,
    });
  });
});
