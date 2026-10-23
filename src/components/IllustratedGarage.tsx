import GarageAreaInspection from "./GarageAreaInspection";
import { garageInspections, type GarageAreaId } from "../data/garageInspections";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getUpgradeById, type InstalledUpgrade } from "../data/officeLayouts";

const areas = [
  { id: "main_work", name: "Main Work Area", x: 52, y: 63, number: "01" },
  { id: "corner_1", name: "Corner Space", x: 81, y: 69, number: "02" },
  { id: "closet", name: "Closet", x: 23, y: 31, number: "03" },
];

export default function IllustratedGarage({ selectedSlot, onSelect, upgrades, paused, speed, working, staff }: {
  selectedSlot: string | null;
  onSelect: (slotId: string | null) => void;
  upgrades: InstalledUpgrade[];
  paused: boolean;
  speed: number;
  working: number;
  staff: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const previousArea = useRef<string | null>(null);
  useEffect(() => {
    if (selectedSlot) previousArea.current = selectedSlot;
    else if (previousArea.current) host.current?.querySelector<HTMLButtonElement>(`[data-garage-slot="${previousArea.current}"]`)?.focus({ preventScroll: true });
  }, [selectedSlot]);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const coffee = upgrades.some((item) => ["coffee_corner", "full_kitchen"].includes(item.upgradeId));
  if (selectedSlot && selectedSlot in garageInspections) {
    return <GarageAreaInspection key={selectedSlot} areaId={selectedSlot as GarageAreaId} upgrades={upgrades} onSelect={onSelect} />;
  }
  return (
    <div ref={host} className="illustrated-garage" data-running={!paused && visible}
      style={{ "--garage-cycle": `${8 / Math.max(1, speed)}s` } as CSSProperties}>
      <div className="garage-status">
        <span className="eyebrow">THE FOUNDER YEARS</span>
        <span><span className={`status-dot ${paused ? "paused" : ""}`} />{paused ? "Paused" : `Live · ${speed}×`}</span>
      </div>
      <div className="garage-stage" role="group" aria-label="Founder garage work areas">
        {!imageFailed && <img className="garage-backdrop" src="/images/locations/garage-1600.jpg"
          alt="Warm sunlight falls across a converted garage with borrowed desks, a bicycle and storage shelves."
          width="1600" height="900" decoding="async" onError={() => setImageFailed(true)} />}
        {imageFailed && <p className="garage-image-fallback">The garage image couldn’t load. Your work areas are still available.</p>}
        {!imageFailed && <>
          <span className="garage-sunlight garage-effect" aria-hidden="true" />
          {working > 0 && <span className="garage-screen garage-effect" aria-hidden="true" />}
          {coffee && <span className="garage-steam" aria-hidden="true"><i className="garage-effect" /><i className="garage-effect" /><i className="garage-effect" /></span>}
        </>}
        {areas.map((area) => {
          const installed = upgrades.find((item) => item.slotId === area.id);
          const name = installed ? `${getUpgradeById(installed.upgradeId)?.name ?? "Installed upgrade"} · Lv ${installed.level}` : "Available to furnish";
          return (
            <button type="button" key={area.id} className="garage-hotspot" data-garage-slot={area.id}
              style={{ left: `${area.x}%`, top: `${area.y}%` }}
              aria-label={`${area.name}: ${name}`} aria-pressed={selectedSlot === area.id}
              onClick={() => onSelect(area.id)}>
              <span className="garage-hotspot-number">{area.number}</span>
              <span className="garage-hotspot-copy">{area.name}<small>{name}</small></span>
            </button>
          );
        })}
      </div>
      <div className="garage-caption">
        <span>Borrowed desks. Unreasonable ambition.</span>
        <small>{staff ? `${working} building · ${staff - working} available` : "Your founding team starts here"}</small>
      </div>
    </div>
  );
}
