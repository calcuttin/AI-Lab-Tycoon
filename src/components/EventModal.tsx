import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCharacter } from '../data/characters';

export default function EventModal() {
  const activeEvent = useGameStore((state) => state.activeEvent);
  const handleEventChoice = useGameStore((state) => state.handleEventChoice);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (activeEvent) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setSelectedChoice(null);
    }
  }, [activeEvent]);

  if (!activeEvent || !isVisible) return null;

  const handleChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setTimeout(() => {
      handleEventChoice(activeEvent.id, choiceId);
      setIsVisible(false);
    }, 300);
  };

  // Try to find character from event title/description
  const eventCharacter = activeEvent.title.includes('Russ') ? getCharacter('russ') :
    activeEvent.title.includes('Gilfoyle') ? getCharacter('gilfoyle') :
    activeEvent.title.includes('Dinesh') ? getCharacter('dinesh') :
    activeEvent.title.includes('Jared') ? getCharacter('jared') :
    activeEvent.title.includes('Erik') ? getCharacter('erlich') :
    activeEvent.title.includes('Monica') ? getCharacter('monica') :
    activeEvent.title.includes('Gavin') || activeEvent.title.includes('Hooli') ? getCharacter('gavin') :
    null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        fontFamily: 'var(--font-pixel)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: '#0ea5e9',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div
        className="w-full max-w-2xl rounded overflow-hidden pixel-art"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '8px solid #0ea5e9',
          boxShadow: '10px 10px 0 rgba(0,0,0,0.6), 0 0 60px rgba(14, 165, 233, 0.4)',
          imageRendering: 'pixelated',
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s ease-out',
        }}
      >
        {/* Animated header */}
        <div
          className="px-8 py-5 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
            borderBottom: '5px solid #0369a1',
          }}
        >
          {/* Animated background pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
            }}
          />
          <div
            style={{
              fontSize: 9,
              color: '#fff',
              opacity: 0.9,
              letterSpacing: '0.3em',
              marginBottom: 6,
              position: 'relative',
              zIndex: 1,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            ⚡ BREAKING NEWS ⚡
          </div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '4px 4px 0 rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.3)',
              lineHeight: 1.3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {activeEvent.title.toUpperCase()}
          </h2>
        </div>

        {/* Character avatar if found */}
        {eventCharacter && (
          <div className="px-6 pt-4 flex items-center gap-3">
            <div
              className="flex-shrink-0 w-14 h-14 rounded flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                border: '4px solid #0369a1',
                fontSize: 28,
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
              }}
            >
              {eventCharacter.avatar}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#0ea5e9' }}>
                {eventCharacter.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 8, color: '#64748b' }}>{eventCharacter.role}</div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-8 py-6">
          <p
            style={{
              fontSize: 11,
              color: '#e2e8f0',
              lineHeight: 1.9,
              marginBottom: 24,
              textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            {activeEvent.description}
          </p>

          <div className="space-y-4">
            {activeEvent.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.id;
              const isPositive = (choice.effects.money ?? 0) >= 0 && (choice.effects.reputation ?? 0) >= 0;
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  disabled={isSelected}
                  className="w-full text-left p-5 rounded transition-all relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                      : isPositive
                      ? 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)'
                      : 'linear-gradient(180deg, #3f1f1f 0%, #2a1414 100%)',
                    border: `5px solid ${isSelected ? '#15803d' : isPositive ? '#475569' : '#7f1d1d'}`,
                    boxShadow: isSelected
                      ? '6px 6px 0 rgba(0,0,0,0.4), 0 0 30px rgba(34, 197, 94, 0.4)'
                      : '5px 5px 0 rgba(0,0,0,0.3)',
                    transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                    opacity: isSelected ? 0.8 : 1,
                    cursor: isSelected ? 'not-allowed' : 'pointer',
                    animation: `slideInLeft ${0.3 + index * 0.1}s ease-out`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#0ea5e9';
                      e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.3), 0 0 25px rgba(14, 165, 233, 0.4)';
                      e.currentTarget.style.transform = 'translateX(4px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = isPositive ? '#475569' : '#7f1d1d';
                      e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
                      → {choice.label.toUpperCase()}
                    </div>
                    {choice.description && (
                      <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 8, lineHeight: 1.5 }}>
                        {choice.description}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 items-center" style={{ fontSize: 9 }}>
                      {choice.effects.money !== undefined && (
                        <span
                          style={{
                            color: choice.effects.money >= 0 ? '#22c55e' : '#ef4444',
                            fontWeight: 'bold',
                            textShadow: '0 0 8px currentColor',
                          }}
                        >
                          {choice.effects.money >= 0 ? '+' : ''}${choice.effects.money.toLocaleString()}
                        </span>
                      )}
                      {choice.effects.reputation !== undefined && (
                        <span
                          style={{
                            color: choice.effects.reputation >= 0 ? '#f59e0b' : '#ef4444',
                            fontWeight: 'bold',
                            textShadow: '0 0 8px currentColor',
                          }}
                        >
                          {choice.effects.reputation >= 0 ? '+' : ''}{choice.effects.reputation} REP
                        </span>
                      )}
                      {choice.effects.researchPoints !== undefined && (
                        <span
                          style={{
                            color: '#0ea5e9',
                            fontWeight: 'bold',
                            textShadow: '0 0 8px currentColor',
                          }}
                        >
                          +{choice.effects.researchPoints} RES
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(5px) translateX(-5px); }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
