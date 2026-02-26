import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { storyMilestones, getCharacter } from '../data/characters';
import type { StoryMilestone } from '../data/characters';

export default function StoryNotification() {
  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const employees = useGameStore((state) => state.employees);
  const addMoney = useGameStore((state) => state.addMoney);
  const addReputation = useGameStore((state) => state.addReputation);

  const [triggeredMilestones, setTriggeredMilestones] = useState<string[]>([]);
  const [activeMilestone, setActiveMilestone] = useState<StoryMilestone | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check for triggered milestones
  useEffect(() => {
    for (const milestone of storyMilestones) {
      if (triggeredMilestones.includes(milestone.id)) continue;

      let shouldTrigger = false;
      const { type, value } = milestone.triggerCondition;

      switch (type) {
        case 'money':
          shouldTrigger = money >= value;
          break;
        case 'reputation':
          shouldTrigger = reputation >= value;
          break;
        case 'employees':
          shouldTrigger = employees.length >= value;
          break;
        default:
          shouldTrigger = false;
      }

      if (shouldTrigger) {
        setTriggeredMilestones((prev) => [...prev, milestone.id]);
        setActiveMilestone(milestone);
        setShowNotification(true);
        setTimeout(() => setIsVisible(true), 50);

        // Apply rewards
        if (milestone.reward) {
          if (milestone.reward.money) addMoney(milestone.reward.money);
          if (milestone.reward.reputation) addReputation(milestone.reward.reputation);
        }
        break;
      }
    }
  }, [money, reputation, employees.length, triggeredMilestones, addMoney, addReputation]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowNotification(false);
      setActiveMilestone(null);
    }, 300);
  };

  if (!showNotification || !activeMilestone) return null;

  const character = activeMilestone.characterDialogue
    ? getCharacter(activeMilestone.characterDialogue.characterId)
    : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[300] p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        fontFamily: 'var(--font-pixel)',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: 8,
              height: 8,
              background: ['#f59e0b', '#22c55e', '#0ea5e9', '#ef4444'][i % 4],
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.8,
              animation: `celebrate ${2 + Math.random() * 2}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div
        className="w-full max-w-xl rounded overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '8px solid #f59e0b',
          boxShadow: '10px 10px 0 rgba(0,0,0,0.6), 0 0 80px rgba(245, 158, 11, 0.5)',
          transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-5deg)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Animated header */}
        <div
          className="px-8 py-5 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
            borderBottom: '5px solid #b45309',
          }}
        >
          {/* Animated shine effect */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation: 'shine 3s infinite',
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: '#fff',
              opacity: 0.95,
              letterSpacing: '0.3em',
              marginBottom: 6,
              position: 'relative',
              zIndex: 1,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            ⭐ MILESTONE REACHED ⭐
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '4px 4px 0 rgba(0,0,0,0.4), 0 0 25px rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {activeMilestone.title.toUpperCase()}
          </h2>
        </div>

        {/* Body */}
        <div className="p-8">
          <p
            style={{
              fontSize: 11,
              color: '#e2e8f0',
              lineHeight: 1.9,
              marginBottom: 20,
              textAlign: 'center',
              textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            {activeMilestone.description}
          </p>

          {/* Character dialogue with enhanced styling */}
          {character && activeMilestone.characterDialogue && (
            <div
              className="mt-6 p-5 rounded relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '5px solid #475569',
                boxShadow: '5px 5px 0 rgba(0,0,0,0.3), inset 0 0 20px rgba(14, 165, 233, 0.1)',
              }}
            >
              {/* Speech bubble tail */}
              <div
                className="absolute -left-2 top-8 w-0 h-0"
                style={{
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderRight: '15px solid #475569',
                }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                    border: '4px solid #0369a1',
                    fontSize: 32,
                    boxShadow: '5px 5px 0 rgba(0,0,0,0.3), 0 0 20px rgba(14, 165, 233, 0.4)',
                    animation: 'bounce 2s ease-in-out infinite',
                  }}
                >
                  {character.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ fontSize: 10, fontWeight: 'bold', color: '#0ea5e9', textShadow: '0 0 8px rgba(14, 165, 233, 0.5)' }}>
                      {character.name.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 8, color: '#64748b' }}>{character.role}</span>
                  </div>
                  <p
                    style={{
                      fontSize: 10,
                      color: '#e2e8f0',
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    "{activeMilestone.characterDialogue.text}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards with animation */}
          {activeMilestone.reward && (
            <div
              className="flex justify-center gap-6 mt-6"
              style={{ fontSize: 11 }}
            >
              {activeMilestone.reward.money && (
                <div
                  className="px-4 py-2 rounded"
                  style={{
                    background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                    border: '3px solid #15803d',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                    animation: 'popIn 0.5s ease-out 0.3s both',
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                    +${activeMilestone.reward.money.toLocaleString()}
                  </span>
                </div>
              )}
              {activeMilestone.reward.reputation && (
                <div
                  className="px-4 py-2 rounded"
                  style={{
                    background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                    border: '3px solid #b45309',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                    animation: 'popIn 0.5s ease-out 0.4s both',
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                    +{activeMilestone.reward.reputation} REP
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="w-full mt-8 py-4 rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '5px solid #15803d',
              boxShadow: '6px 6px 0 rgba(0,0,0,0.3), 0 0 25px rgba(34, 197, 94, 0.4)',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#fff',
              animation: 'slideUp 0.5s ease-out 0.5s both',
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes celebrate {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
