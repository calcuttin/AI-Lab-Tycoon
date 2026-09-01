import { useState } from 'react';
import { loadIntroSettings, saveIntroSettings } from '../intro/settings';

interface IntroSettingsModalProps {
  onClose: () => void;
  onReplayIntro?: () => void;
}

export default function IntroSettingsModal({ onClose, onReplayIntro }: IntroSettingsModalProps) {
  const [skipIntro, setSkipIntro] = useState(() => loadIntroSettings().skipIntro);
  const [introMuted, setIntroMuted] = useState(() => loadIntroSettings().introMuted);

  const handleSave = () => {
    saveIntroSettings({ skipIntro, introMuted });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', fontFamily: 'var(--font-pixel)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded p-6"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '4px solid #475569',
          boxShadow: '8px 8px 0 rgba(0,0,0,0.4)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 style={{ color: '#0ea5e9', fontSize: 12, marginBottom: 16 }}>SETTINGS</h2>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: 9, marginBottom: 12 }}>
          <input type="checkbox" checked={skipIntro} onChange={(e) => setSkipIntro(e.target.checked)} />
          Skip intro on launch
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: 9, marginBottom: 20 }}>
          <input type="checkbox" checked={introMuted} onChange={(e) => setIntroMuted(e.target.checked)} />
          Mute intro music by default
        </label>

        {onReplayIntro && (
          <button
            type="button"
            onClick={() => {
              handleSave();
              onReplayIntro();
            }}
            style={{
              width: '100%',
              marginBottom: 12,
              padding: '12px 16px',
              background: '#334155',
              border: '3px solid #475569',
              color: '#e2e8f0',
              fontSize: 9,
              cursor: 'pointer',
            }}
          >
            REPLAY INTRO
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
            border: '3px solid #15803d',
            color: '#fff',
            fontSize: 9,
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
