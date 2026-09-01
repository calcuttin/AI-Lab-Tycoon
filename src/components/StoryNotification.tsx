import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCharacter } from '../data/characters';

export default function StoryNotification() {
  const activeMilestone = useGameStore((state) => state.activeStoryMilestone);
  const syncStoryMilestones = useGameStore((state) => state.syncStoryMilestones);
  const dismissStoryMilestone = useGameStore((state) => state.dismissStoryMilestone);
  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const employees = useGameStore((state) => state.employees);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const completedResearchCount = useGameStore(
    (state) => state.researchNodes.filter((node) => node.completed).length,
  );

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    syncStoryMilestones();
  }, [
    money,
    reputation,
    employees.length,
    totalProjectsCompleted,
    completedResearchCount,
    syncStoryMilestones,
  ]);

  useEffect(() => {
    if (!activeMilestone) {
      setIsVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [activeMilestone?.id]);

  const celebrationParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        top: `${(index * 23) % 100}%`,
        color: ['#f59e0b', '#22c55e', '#0ea5e9', '#ef4444'][index % 4],
        duration: 2 + (index % 3) * 0.5,
        delay: (index % 5) * 0.1,
      })),
    [],
  );

  const handleDismiss = () => {
    setIsVisible(false);
    window.setTimeout(() => dismissStoryMilestone(), 300);
  };

  if (!activeMilestone) return null;

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {celebrationParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              width: 8,
              height: 8,
              background: particle.color,
              borderRadius: '50%',
              left: particle.left,
              top: particle.top,
              opacity: 0.8,
              animation: `celebrate ${particle.duration}s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
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
        <div
          className="px-8 py-5 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
            borderBottom: '5px solid #b45309',
          }}
        >
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

        <div className="p-8">
          <p
            style={{
              fontSize: 11,
              color: '#e2e8f0',
              lineHeight: 1.9,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            {activeMilestone.description}
          </p>

          {character && activeMilestone.characterDialogue && (
            <div
              className="mt-6 p-5 rounded"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '5px solid #475569',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                    border: '4px solid #0369a1',
                    fontSize: 32,
                  }}
                >
                  {character.avatar}
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#0ea5e9', marginBottom: 8 }}>
                    {character.name.toUpperCase()}
                  </div>
                  <p style={{ fontSize: 10, color: '#e2e8f0', lineHeight: 1.8, fontStyle: 'italic' }}>
                    "{activeMilestone.characterDialogue.text}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full mt-8 py-4 rounded"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '5px solid #15803d',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes celebrate {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
