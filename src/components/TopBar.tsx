import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { showNotification } from './NotificationToast';
import { getAudioManager, playSound } from '../systems/audio';

export default function TopBar() {
  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const currentDate = useGameStore((state) => state.currentDate);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const isPaused = useGameStore((state) => state.isPaused);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const togglePause = useGameStore((state) => state.togglePause);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);

  const [moneyDisplay, setMoneyDisplay] = useState(money);
  const [reputationDisplay, setReputationDisplay] = useState(reputation);
  const [moneyChange, setMoneyChange] = useState<number | null>(null);
  const [repChange, setRepChange] = useState<number | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [isMuted, setIsMuted] = useState(getAudioManager().isMuted());
  const moneyChangeTimeoutRef = useRef<number | null>(null);
  const repChangeTimeoutRef = useRef<number | null>(null);
  const saveFeedbackTimeoutRef = useRef<number | null>(null);

  const EPS = 0.5; // Snap when this close to target (avoids float junk)
  const MIN_CHANGE_TO_SHOW = 1;   // Don't show popup for tiny changes

  // Animate money changes
  useEffect(() => {
    const diff = money - moneyDisplay;
    if (Math.abs(diff) < EPS) {
      setMoneyDisplay(money);
      return;
    }
    if (Math.abs(diff) >= MIN_CHANGE_TO_SHOW) {
      setMoneyChange(diff);
      if (moneyChangeTimeoutRef.current !== null) {
        clearTimeout(moneyChangeTimeoutRef.current);
      }
      moneyChangeTimeoutRef.current = window.setTimeout(() => setMoneyChange(null), 2000);
    }

    const steps = 20;
    const stepValue = diff / steps;
    let current = moneyDisplay;
    const interval = setInterval(() => {
      current += stepValue;
      if (Math.abs(current - money) < EPS || (diff > 0 && current >= money) || (diff < 0 && current <= money)) {
        setMoneyDisplay(money);
        clearInterval(interval);
      } else {
        setMoneyDisplay(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [money, moneyDisplay]);

  // Animate reputation changes
  useEffect(() => {
    const diff = reputation - reputationDisplay;
    if (Math.abs(diff) < EPS) {
      setReputationDisplay(reputation);
      return;
    }
    if (Math.abs(diff) >= MIN_CHANGE_TO_SHOW) {
      setRepChange(diff);
      if (repChangeTimeoutRef.current !== null) {
        clearTimeout(repChangeTimeoutRef.current);
      }
      repChangeTimeoutRef.current = window.setTimeout(() => setRepChange(null), 2000);
    }

    const steps = 10;
    const stepValue = diff / steps;
    let current = reputationDisplay;
    const interval = setInterval(() => {
      current += stepValue;
      if (Math.abs(current - reputation) < EPS || (diff > 0 && current >= reputation) || (diff < 0 && current <= reputation)) {
        setReputationDisplay(reputation);
        clearInterval(interval);
      } else {
        setReputationDisplay(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [reputation, reputationDisplay]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMoney = (amount: number) => {
    const a = Number(amount);
    if (!Number.isFinite(a) || Math.abs(a) < 0.01) return '$0';
    if (a >= 1000000) return `$${(a / 1000000).toFixed(2)}M`;
    if (a >= 1000) return `$${(a / 1000).toFixed(1)}K`;
    return `$${Math.round(a)}`;
  };

  const handleSave = () => {
    saveGame();
    setSaveFeedback(true);
    playSound('success');
    showNotification('💾 Game saved!', 'success', 2000);
    if (saveFeedbackTimeoutRef.current !== null) {
      clearTimeout(saveFeedbackTimeoutRef.current);
    }
    saveFeedbackTimeoutRef.current = window.setTimeout(() => setSaveFeedback(false), 500);
  };

  const handleLoad = () => {
    if (loadGame()) {
      showNotification('📂 Game loaded!', 'info', 2000);
    } else {
      showNotification('❌ No save game found', 'error', 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (moneyChangeTimeoutRef.current !== null) {
        clearTimeout(moneyChangeTimeoutRef.current);
      }
      if (repChangeTimeoutRef.current !== null) {
        clearTimeout(repChangeTimeoutRef.current);
      }
      if (saveFeedbackTimeoutRef.current !== null) {
        clearTimeout(saveFeedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="px-5 py-4 flex items-center justify-between border-b-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
        borderColor: '#2d3748',
        fontFamily: 'var(--font-pixel)',
      }}
    >
      {/* Animated background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(14, 165, 233, 0.1) 20px, rgba(14, 165, 233, 0.1) 40px)',
          animation: 'slideRight 10s linear infinite',
        }}
      />

      <div className="flex items-center gap-6 relative z-10">
        <h1
          className="text-sm font-bold tracking-wider"
          style={{
            color: '#0ea5e9',
            textShadow: '3px 3px 0 #0369a1, 0 0 15px rgba(14, 165, 233, 0.3)',
          }}
        >
          AI LAB TYCOON
        </h1>
        <div className="flex items-center gap-4 text-[10px]">
          {/* Money with animation */}
          <div className="relative flex items-center gap-2 px-4 py-2 rounded pixel-panel">
            <span style={{ fontSize: 14, color: '#94a3b8' }}>💰</span>
            <span className="font-bold" style={{ color: '#22c55e', textShadow: '0 0 10px rgba(34, 197, 94, 0.6)', fontSize: 11 }}>
              {formatMoney(moneyDisplay)}
            </span>
            {moneyChange !== null && Math.abs(moneyChange) >= MIN_CHANGE_TO_SHOW && (
              <div
                className="absolute -top-6 right-0 px-2 py-1 rounded"
                style={{
                  background: moneyChange > 0 ? '#22c55e' : '#ef4444',
                  color: '#fff',
                  fontSize: 8,
                  fontWeight: 'bold',
                  animation: 'floatUp 2s ease-out forwards',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                }}
              >
                {moneyChange > 0 ? '+' : ''}{formatMoney(moneyChange)}
              </div>
            )}
          </div>
          
          {/* Reputation with animation */}
          <div className="relative flex items-center gap-2 px-4 py-2 rounded pixel-panel">
            <span style={{ fontSize: 14, color: '#94a3b8' }}>⭐</span>
            <span className="font-bold" style={{ color: '#f59e0b', textShadow: '0 0 10px rgba(245, 158, 11, 0.6)', fontSize: 11 }}>
              {Math.round(reputationDisplay)}
            </span>
            {repChange !== null && Math.abs(repChange) >= MIN_CHANGE_TO_SHOW && (
              <div
                className="absolute -top-6 right-0 px-2 py-1 rounded"
                style={{
                  background: repChange > 0 ? '#f59e0b' : '#ef4444',
                  color: '#fff',
                  fontSize: 8,
                  fontWeight: 'bold',
                  animation: 'floatUp 2s ease-out forwards',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                }}
              >
                {repChange > 0 ? '+' : ''}{Math.round(repChange)}
              </div>
            )}
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-2 px-4 py-2 rounded pixel-panel">
            <span style={{ fontSize: 14, color: '#94a3b8' }}>📅</span>
            <span className="font-bold" style={{ color: '#e2e8f0', fontSize: 10 }}>{formatDate(currentDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <button
          onClick={() => {
            const muted = getAudioManager().toggleMute();
            setIsMuted(muted);
            if (!muted) playSound('click');
          }}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="px-5 py-4 text-[15px] font-bold rounded transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
            color: isMuted ? '#64748b' : '#94a3b8',
            border: '3px solid #475569',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={handleSave}
          aria-label="Save game"
          className="px-7 py-4 text-[15px] font-bold rounded transition-all hover:scale-110 active:scale-95 relative"
          style={{
            background: saveFeedback
              ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
            color: saveFeedback ? '#fff' : '#94a3b8',
            border: `3px solid ${saveFeedback ? '#15803d' : '#475569'}`,
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            transform: saveFeedback ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          💾 SAVE
        </button>
        <button
          onClick={handleLoad}
          aria-label="Load game"
          className="px-7 py-4 text-[15px] font-bold rounded transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
            color: '#94a3b8',
            border: '3px solid #475569',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          📂 LOAD
        </button>
        <button
          onClick={togglePause}
          aria-pressed={!isPaused}
          aria-label={isPaused ? 'Play' : 'Pause'}
          className="px-7 py-4 text-[15px] font-bold rounded transition-all hover:scale-110 active:scale-95 relative"
          style={{
            background: isPaused
              ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            border: `3px solid ${isPaused ? '#15803d' : '#b45309'}`,
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
          {!isPaused && (
            <div
              className="absolute inset-0 rounded"
              style={{
                background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          )}
        </button>
        <div className="flex gap-1">
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setGameSpeed(speed as 1 | 2 | 4)}
              aria-pressed={gameSpeed === speed}
              aria-label={`Set speed to ${speed}x`}
              className="px-6 py-4 text-[15px] font-bold rounded transition-all hover:scale-110 active:scale-95 relative"
              style={{
                background:
                  gameSpeed === speed
                    ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                    : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                color: gameSpeed === speed ? '#fff' : '#94a3b8',
                border: `3px solid ${gameSpeed === speed ? '#0369a1' : '#475569'}`,
                boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              }}
            >
              {speed}X
              {gameSpeed === speed && (
                <div
                  className="absolute inset-0 rounded"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(0); }
          to { transform: translateX(40px); }
        }
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
