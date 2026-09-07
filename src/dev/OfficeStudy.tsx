import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateTotalEffects, getLayoutById, getUpgradesForSlot, officeLayouts, type OfficeSizeId } from '../data/officeLayouts';
import { createOfficeScene, type OfficeSceneController } from '../scene/createOfficeScene';
import { getOfficeFloorplan } from '../scene/officeFloorplan';
import './OfficeStudy.css';

/** Development-only fixtures: no store import, storage access or game actions. */
export default function OfficeStudy() {
  const [size, setSize] = useState<OfficeSizeId>('hacker_den');
  const [night, setNight] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [full, setFull] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<OfficeSceneController | null>(null);
  const layout = getLayoutById(size)!;
  const upgrades = useMemo(() => layout.slots.flatMap((slot) => {
    const options = getUpgradesForSlot(slot.type, size);
    const upgrade = slot.type === 'workstation'
      ? options.find((option) => option.id === (upgraded ? 'dev_workstations' : 'basic_desks'))
      : options.find((option) => option.id === ({ amenity: upgraded ? 'full_kitchen' : 'coffee_corner', infrastructure: 'server_room', executive: 'exec_office', wellness: 'meditation_space', utility: 'storage_closet' } as Record<string, string>)[slot.type]) ?? options[0];
    // Base capacity study leaves workstations unupgraded, with furnished amenities.
    return upgrade && (slot.type !== 'workstation' || upgraded)
      ? [{ slotId: slot.id, upgradeId: upgrade.id, level: upgraded ? upgrade.maxLevel : 1 }]
      : [];
  }), [layout, size, upgraded]);
  const capacity = layout.baseCapacity + calculateTotalEffects(upgrades).capacity;
  const employees = useMemo(() => Array.from({ length: full ? capacity : 1 }, (_, index) => ({ id: `study-${index}`, working: true })), [full, capacity]);
  const plan = useMemo(() => getOfficeFloorplan(size, upgrades, employees.length), [size, upgrades, employees]);
  useEffect(() => {
    if (!host.current) return;
    const scene = createOfficeScene(host.current, { size, upgrades, employees, night }, setSelected);
    controller.current = scene;
    scene.setSimulation(true, 1);
    return () => { controller.current = null; scene.dispose(); };
  }, [size, upgrades, employees, night]);
  useEffect(() => { controller.current?.select(selected); }, [selected]);
  // Reapply after scene changes, without rebuilding the renderer on play/pause.
  useEffect(() => { controller.current?.setSimulation(!animated, 1); }, [animated, size, upgrades, employees, night]);

  return <main className="office-study">
    <header className="office-study-header">
      <div><p className="office-study-eyebrow">Environment study · local fixtures</p><h1>{layout.name}</h1><p>{layout.description}</p></div>
      <a href="/">Return to game</a>
    </header>
    <nav className="office-study-stages" aria-label="Building stage">
      {officeLayouts.map((stage, index) => <button key={stage.id} aria-pressed={stage.id === size} onClick={() => { setSize(stage.id); setSelected(null); }}>{index + 1}. {stage.name}</button>)}
    </nav>
    <div className="office-study-controls">
      <button aria-pressed={animated} onClick={() => setAnimated(!animated)}>{animated ? 'Pause animation' : 'Play animation'}</button>
      <button onClick={() => setNight(!night)}>{night ? 'Switch to daylight' : 'Switch to evening'}</button>
      <button aria-pressed={full} onClick={() => setFull(!full)}>{full ? 'Full team' : 'Founder only'}</button>
      <button aria-pressed={upgraded} onClick={() => setUpgraded(!upgraded)}>{upgraded ? 'Maximum upgrades' : 'Base capacity'}</button>
      <button onClick={() => controller.current?.reset()}>Reset camera</button>
      <button aria-label="Zoom in" onClick={() => controller.current?.zoom(1)}>+</button>
      <button aria-label="Zoom out" onClick={() => controller.current?.zoom(-1)}>−</button>
      <span>{employees.length} people · {capacity} desks · {plan.width.toFixed(1)} × {plan.depth.toFixed(1)} m</span>
    </div>
    <div className="office-study-canvas" ref={host} />
    <div className="office-study-areas" aria-label="Focus furnishing area">
      {plan.areas.map(({ slot }) => <button key={slot.id} aria-pressed={selected === slot.id} onClick={() => { setSelected(slot.id); controller.current?.focus(slot.id); }}>{slot.name}</button>)}
    </div>
    <p className="office-study-note">Drag to orbit. Select a room to move closer. These fixtures do not read or change your saved company.</p>
  </main>;
}
