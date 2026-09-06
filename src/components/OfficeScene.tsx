import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  createOfficeScene,
  type OfficeSceneController,
} from "../scene/createOfficeScene";
import { Button } from "./ui/Primitives";

export default function OfficeScene({
  selectedSlot,
  onSelect,
}: {
  selectedSlot: string | null;
  onSelect: (slotId: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<OfficeSceneController | null>(null);
  const [tour, setTour] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setReducedMotion(media.matches); if (media.matches) setTour(false); };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const [night, setNight] = useState(false);
  const [error, setError] = useState(false);
  const size = useGameStore((s) => s.office.size);
  const upgrades = useGameStore((s) =>
    JSON.stringify(s.office.installedUpgrades),
  );
  const staff = useGameStore((s) =>
    JSON.stringify(
      s.employees.map((e) => ({
        id: e.id,
        working: s.projects.some((p) => p.team.includes(e.id)),
      })),
    ),
  );
  const paused = useGameStore((s) => s.isPaused);
  const speed = useGameStore((s) => s.gameSpeed);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!host.current) return;
    let scene: OfficeSceneController;
    try {
      scene = createOfficeScene(
        host.current,
        {
          size,
          upgrades: JSON.parse(upgrades),
          employees: JSON.parse(staff),
          night,
        },
        (id) => selectRef.current(id),
      );
      controller.current = scene;
      setError(false);
    } catch (error) {
      console.error("Unable to start office renderer", error);
      setError(true);
      return;
    }
    return () => {
      scene.dispose();
      controller.current = null;
    };
  }, [size, upgrades, staff, night]);
  useEffect(() => {
    controller.current?.setSimulation(paused, speed);
    controller.current?.select(selectedSlot);
    controller.current?.setTour(tour);
  }, [paused, speed, selectedSlot, size, upgrades, staff, night, tour]);
  return (
    <div className={`office-scene ${night ? "is-night" : ""}`}>
      <div ref={host} className="office-canvas" />
      {error && (
        <div className="scene-fallback">
          <h3>Office rendering is unavailable</h3>
          <p>
            Enable browser hardware acceleration to view the 3D office. All
            upgrades are available through the area buttons below.
          </p>
        </div>
      )}
      <div className="scene-top-label">
        <span className="scene-tag">
          {night
            ? "After-hours ambition"
            : size === "hacker_den"
              ? "The incubator era"
              : "A very serious headquarters"}
        </span>
        <span className="scene-live">
          <span className={`status-dot ${paused ? "paused" : ""}`} />
          {paused ? "SIMULATION PAUSED" : `LIVE · ${speed}×`}
        </span>
      </div>
      <div className="scene-bottom">
        <span>
          Drag to orbit <i>·</i> Scroll to zoom <i>·</i> Click an area to
          furnish
        </span>
        <div className="scene-controls">
          {selectedSlot && <Button icon="office" aria-label="Focus selected area" onClick={() => controller.current?.focus(selectedSlot)} />}
          <Button disabled={reducedMotion} title={reducedMotion ? 'Camera tour disabled by your reduced-motion preference' : 'Slow camera tour'} icon={tour ? 'pause' : 'play'} aria-label={tour ? 'Stop camera tour' : 'Tour the office'} aria-pressed={tour} onClick={() => setTour(!tour)} />
          <Button
            icon={night ? "moon" : "sun"}
            aria-label={
              night ? "Switch to daylight" : "Switch to evening lighting"
            }
            onClick={() => setNight(!night)}
          />
          <Button
            icon="minus"
            aria-label="Zoom out"
            onClick={() => controller.current?.zoom(-1)}
          />
          <Button
            icon="plus"
            aria-label="Zoom in"
            onClick={() => controller.current?.zoom(1)}
          />
          <Button
            icon="rotate"
            aria-label="Reset camera"
            onClick={() => controller.current?.reset()}
          />
        </div>
      </div>
    </div>
  );
}
