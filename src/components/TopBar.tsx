import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { showNotification } from "../systems/feedback";
import { getAudioManager } from "../systems/audio";
import IntroSettingsModal from "./IntroSettingsModal";
import { Button } from "./ui/Primitives";

export default function TopBar({
  onReplayIntro,
}: {
  onReplayIntro?: () => void;
}) {
  const date = useGameStore((s) => s.currentDate);
  const speed = useGameStore((s) => s.gameSpeed);
  const paused = useGameStore((s) => s.isPaused);
  const [muted, setMuted] = useState(getAudioManager().isMuted());
  const [settings, setSettings] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-location">
        Silicon Valley <span>/</span> <strong>Founder workspace</strong>
      </div>
      <div className="topbar-controls">
        <span className="game-date">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <div className="time-controls">
          <Button
            icon={paused ? "play" : "pause"}
            aria-label={paused ? "Play" : "Pause"}
            title="Play / pause (Space)"
            variant="ghost"
            onClick={() => useGameStore.getState().togglePause()}
          />
          {([1, 2, 4] as const).map((value) => (
            <button
              key={value}
              className={speed === value ? "selected" : ""}
              aria-label={`Set speed to ${value}x`}
              aria-pressed={speed === value}
              onClick={() => useGameStore.getState().setGameSpeed(value)}
            >
              {value}×
            </button>
          ))}
        </div>
        <Button
          icon={muted ? "muted" : "volume"}
          variant="ghost"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => setMuted(getAudioManager().toggleMute())}
        />
        <Button
          icon="save"
          variant="ghost"
          aria-label="Save game"
          onClick={() => {
            useGameStore.getState().saveGame();
            showNotification(
              "Company saved. Your runway is still your problem.",
              "success",
              2500,
            );
          }}
        />
        <div className="topbar-menu">
          <Button
            icon="settings"
            variant="ghost"
            aria-label="Open game menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          />
          {menu && (
            <div className="game-menu">
              <Button
                onClick={() => {
                  setSettings(true);
                  setMenu(false);
                }}
              >
                Settings
              </Button>
              <Button
                onClick={() => {
                  const loaded = useGameStore.getState().loadGame();
                  showNotification(
                    loaded
                      ? "Saved company loaded."
                      : "No saved company found.",
                    loaded ? "info" : "error",
                  );
                  setMenu(false);
                }}
              >
                Load game
              </Button>
              {onReplayIntro && (
                <Button onClick={onReplayIntro}>Replay intro</Button>
              )}
            </div>
          )}
        </div>
      </div>
      {settings && (
        <IntroSettingsModal
          onClose={() => setSettings(false)}
          onReplayIntro={onReplayIntro}
        />
      )}
    </header>
  );
}
