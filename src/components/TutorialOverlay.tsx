import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import Icon from "./ui/Icon";
export default function TutorialOverlay() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("aiLabTycoon_founderHint") === "dismissed";
    } catch {
      return false;
    }
  });
  const projects = useGameStore((s) => s.projects.length);
  const days = useGameStore((s) => s.daysPlayed);
  if (dismissed || projects > 0 || days > 2) return null;
  return (
    <div className="founder-hint">
      <Icon name="research" size={17} />
      <span>
        <strong>Founder tip</strong> Start a project and hire or assign your
        team. Press Space when you’re ready to run.
      </span>
      <button
        aria-label="Dismiss founder tip"
        onClick={() => {
          setDismissed(true);
          localStorage.setItem("aiLabTycoon_founderHint", "dismissed");
        }}
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
