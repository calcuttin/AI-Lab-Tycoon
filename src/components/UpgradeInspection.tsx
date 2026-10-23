import { useEffect, useRef } from "react";
import { getUpgradeById, type InstalledUpgrade } from "../data/officeLayouts";
import UpgradeArtwork from "./UpgradeArtwork";

export default function UpgradeInspection({ installed, areaName, onClose }: {
  installed: InstalledUpgrade; areaName: string; onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const upgrade = getUpgradeById(installed.upgradeId);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return <section className="garage-inspection" aria-label={`${areaName} inspection`}
    onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); onClose(); } }}>
    <header className="garage-inspection-header"><button type="button" className="ui-button" onClick={onClose}>← Back to layout</button><span className="eyebrow">A CLOSER LOOK</span></header>
    <div className="garage-inspection-title"><h3 ref={heading} tabIndex={-1}>{upgrade?.name ?? areaName}</h3><p>{areaName} · Level {installed.level}</p></div>
    <UpgradeArtwork upgradeId={installed.upgradeId} />
    <div className="garage-inspection-inventory"><strong>{upgrade?.description}</strong><small>Use the area details to upgrade or sell this furnishing.</small></div>
  </section>;
}
