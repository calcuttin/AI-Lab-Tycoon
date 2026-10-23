import { useState } from "react";
import { getUpgradeById, getUpgradesForSlot, officeLayouts, upgradeOptions } from "../data/officeLayouts";
import UpgradeArtwork from "./UpgradeArtwork";
import { Badge, Modal } from "./ui/Primitives";

/** Browsing artwork never writes to a company or installs an upgrade. */
export default function UpgradePreview({ initialId, onClose }: { initialId: string; onClose: () => void }) {
  const [id, setId] = useState(initialId);
  const upgrade = getUpgradeById(id) ?? upgradeOptions[0];
  const firstOffice = officeLayouts.find((office) => office.slots.some((slot) => slot.type === upgrade.slotType) && getUpgradesForSlot(upgrade.slotType, office.id).some((item) => item.id === upgrade.id));
  return <Modal title="The upgrade showroom" onClose={onClose}>
    <div className="upgrade-preview">
      <div className="upgrade-preview-picker">
        <label htmlFor="upgrade-photo-selection">Inspect an upgrade</label>
        <select id="upgrade-photo-selection" value={upgrade.id} onChange={(event) => setId(event.target.value)}>
          {upgradeOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <UpgradeArtwork upgradeId={upgrade.id} />
      <div className="upgrade-preview-copy" aria-live="polite">
        <span className="eyebrow">BETTER EQUIPMENT. SAME BURN RATE ANXIETY.</span>
        <h3>{upgrade.name}</h3>
        <p>{upgrade.description}</p>
        <div className="upgrade-preview-facts"><Badge>${upgrade.cost.toLocaleString("en-US")}</Badge><Badge>{upgrade.maxLevel} {upgrade.maxLevel === 1 ? "level" : "levels"}</Badge><Badge>{firstOffice ? `From ${firstOffice.name}` : "Compatible areas"}</Badge></div>
        <small>Photo preview · Levels share this scene. Install in a compatible area from your office.</small>
      </div>
    </div>
  </Modal>;
}
