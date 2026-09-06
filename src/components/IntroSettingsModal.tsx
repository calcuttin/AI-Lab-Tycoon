import { useState } from "react";
import { loadIntroSettings, saveIntroSettings } from "../intro/settings";
import { Button, Modal } from "./ui/Primitives";
export default function IntroSettingsModal({
  onClose,
  onReplayIntro,
}: {
  onClose: () => void;
  onReplayIntro?: () => void;
}) {
  const [skipIntro, setSkipIntro] = useState(
    () => loadIntroSettings().skipIntro,
  );
  const [introMuted, setIntroMuted] = useState(
    () => loadIntroSettings().introMuted,
  );
  const save = () => {
    saveIntroSettings({ skipIntro, introMuted });
    onClose();
  };
  return (
    <Modal title="Workspace settings" onClose={onClose}>
      <div className="modal-body">
        <p>
          The simulation starts paused. Space toggles play, and 1, 2, or 4
          changes speed. Your game is saved when you close the window.
        </p>
        <label
          style={{ display: "flex", gap: 12, marginBottom: 20, fontSize: 12 }}
        >
          <input
            type="checkbox"
            checked={skipIntro}
            onChange={(e) => setSkipIntro(e.target.checked)}
          />
          Skip intro and resume your saved company on launch
        </label>
        <label
          style={{ display: "flex", gap: 12, marginBottom: 20, fontSize: 12 }}
        >
          <input
            type="checkbox"
            checked={introMuted}
            onChange={(e) => setIntroMuted(e.target.checked)}
          />
          Mute intro music by default
        </label>
        <div className="modal-actions">
          {onReplayIntro && (
            <Button
              onClick={() => {
                save();
                onReplayIntro();
              }}
            >
              Replay intro
            </Button>
          )}
          <Button variant="primary" onClick={save}>
            Save preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}
