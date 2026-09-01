import { useEffect, useRef, useState } from 'react';
import { CanvasIntroEngine } from '../intro/CanvasIntroEngine';
import { INTRO_DURATION } from '../intro/worldData';
import { getIntroAudio } from '../intro/introAudio';
import { hasSavedGame, loadIntroSettings, saveIntroSettings } from '../intro/settings';

interface IntroScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  forcePlay?: boolean;
  onIntroFinished?: () => void;
}

type IntroPhase = 'playing' | 'menu';

export default function IntroScreen({
  onNewGame,
  onContinue,
  forcePlay = false,
  onIntroFinished,
}: IntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasIntroEngine | null>(null);
  const [phase, setPhase] = useState<IntroPhase>('playing');
  const [titleVisible, setTitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [savedGameExists] = useState(hasSavedGame);
  const [skipIntroNextTime, setSkipIntroNextTime] = useState(() => loadIntroSettings().skipIntro);
  const [muted, setMuted] = useState(() => loadIntroSettings().introMuted);
  const [elapsed, setElapsed] = useState(0);

  const enterMenu = () => {
    setPhase('menu');
    setTitleVisible(true);
    window.setTimeout(() => setButtonsVisible(true), 400);
    getIntroAudio().fadeOut();
    onIntroFinished?.();
  };

  const skipToMenu = () => {
    engineRef.current?.skipToEnd();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const settings = loadIntroSettings();
    const engine = new CanvasIntroEngine(canvas, {
      onComplete: enterMenu,
      onTick: setElapsed,
      showHud: true,
    });
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    handleResize();

    if (!forcePlay && (settings.skipIntro || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      engine.pauseAt(INTRO_DURATION);
      setElapsed(INTRO_DURATION);
      enterMenu();
    } else {
      getIntroAudio().start(settings.introMuted);
      engine.start();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      getIntroAudio().stop();
    };
  }, [forcePlay, onIntroFinished]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== 'playing') return;
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        skipToMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase]);

  const handleStart = (action: () => void) => {
    saveIntroSettings({ skipIntro: skipIntroNextTime, introMuted: muted });
    getIntroAudio().stop();
    action();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    saveIntroSettings({ introMuted: next });
    if (next) {
      getIntroAudio().stop();
    } else if (phase === 'playing') {
      getIntroAudio().start(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020617',
        overflow: 'hidden',
        fontFamily: 'var(--font-intro, "Segoe UI", system-ui, sans-serif)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: phase === 'playing' ? 'pointer' : 'default',
        }}
        onClick={phase === 'playing' ? skipToMenu : undefined}
      />

      {phase === 'playing' && (
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(148, 163, 184, 0.9)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          Click or press Space to skip · {Math.max(0, Math.ceil(INTRO_DURATION - elapsed))}s
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 30,
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          color: '#e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        {muted ? 'Unmute' : 'Mute'}
      </button>

      {phase === 'menu' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 72,
            background: 'linear-gradient(180deg, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.92) 100%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 28,
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(28px, 5vw, 56px)',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#f8fafc',
                textShadow: '0 8px 30px rgba(0,0,0,0.45)',
              }}
            >
              AI LAB
            </div>
            <div
              style={{
                fontSize: 'clamp(36px, 7vw, 72px)',
                fontWeight: 800,
                letterSpacing: '0.18em',
                color: '#38bdf8',
                textShadow: '0 8px 30px rgba(56, 189, 248, 0.35)',
              }}
            >
              TYCOON
            </div>
            <p style={{ color: '#94a3b8', marginTop: 16, fontSize: 14, letterSpacing: '0.08em' }}>
              A cinematic flight through Silicon Valley
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'center',
              opacity: buttonsVisible ? 1 : 0,
              transform: buttonsVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              pointerEvents: buttonsVisible ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              onClick={() => handleStart(onNewGame)}
              style={{
                padding: '18px 48px',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.08em',
                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(34, 197, 94, 0.35)',
                cursor: 'pointer',
              }}
            >
              NEW GAME
            </button>

            {savedGameExists && (
              <button
                type="button"
                onClick={() => handleStart(onContinue)}
                style={{
                  padding: '14px 36px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  background: 'rgba(30, 41, 59, 0.9)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                CONTINUE
              </button>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#94a3b8',
                fontSize: 12,
                marginTop: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={skipIntroNextTime}
                onChange={(event) => setSkipIntroNextTime(event.target.checked)}
              />
              Skip intro next time
            </label>
          </div>

          <div style={{ position: 'absolute', bottom: 16, color: '#64748b', fontSize: 11, letterSpacing: '0.08em' }}>
            v2.0 · A SATIRICAL AI ADVENTURE
          </div>
        </div>
      )}
    </div>
  );
}
