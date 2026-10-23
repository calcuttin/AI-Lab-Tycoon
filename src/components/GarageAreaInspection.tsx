import UpgradeArtwork from "./UpgradeArtwork";
import { useEffect, useRef } from "react";
import { getUpgradeById, type InstalledUpgrade } from "../data/officeLayouts";

import { garageInspections, type GarageAreaId } from "../data/garageInspections";

export default function GarageAreaInspection({ areaId, upgrades, onSelect }: {
  areaId: GarageAreaId; upgrades: InstalledUpgrade[]; onSelect: (id: string | null) => void;
}) {
  const area = garageInspections[areaId];
  const installed = upgrades.find((item) => item.slotId === areaId);
  const upgrade = installed && getUpgradeById(installed.upgradeId);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return (
    <section className="garage-inspection" aria-label={`${area.name} inspection`}
      onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); onSelect(null); } }}>
      <header className="garage-inspection-header">
        <button type="button" className="ui-button" onClick={() => onSelect(null)}>← Back to garage</button>
        <span className="eyebrow">A CLOSER LOOK</span>
      </header>
      <div className="garage-inspection-title">
        <h3 ref={heading} tabIndex={-1}>{area.name}</h3>
        <p>{area.caption}</p>
      </div>
      <div className="garage-inspection-photo">
        <UpgradeArtwork upgradeId={installed?.upgradeId} fallback={`/images/garage-details/${area.image}`} alt={area.alt} />
      </div>
      <div className="garage-inspection-inventory">
        <span className="eyebrow">{installed ? "CURRENT FURNISHING" : "ROOM FOR YOUR NEXT IDEA"}</span>
        <strong>{upgrade && installed ? `${upgrade.name} · Level ${installed.level}` : "Available to furnish"}</strong>
        <small>{upgrade?.description ?? "Choose a furnishing from the area details to make this space your own."}</small>
      </div>
      <nav className="garage-inspection-nav" aria-label="Inspect another garage area">
        {Object.entries(garageInspections).map(([id, detail]) => (
          <button type="button" key={id} aria-pressed={areaId === id} onClick={() => onSelect(id)}>{detail.tab}</button>
        ))}
      </nav>
    </section>
  );
}
