import { useGameStore } from '../store/gameStore';
import { achievements } from '../data/achievements';

export default function AchievementsPanel() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);

  const unlocked = achievements.filter((a) => unlockedAchievements.includes(a.id));
  const locked = achievements.filter((a) => !unlockedAchievements.includes(a.id));

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        🏆 ACHIEVEMENTS
      </h2>

      {/* Stats */}
      <div
        className="p-5 rounded"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #f59e0b',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-6">
          <div style={{ fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>PROGRESS: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 14 }}>
              {unlocked.length} / {achievements.length}
            </span>
          </div>
          <div
            style={{
              height: 16,
              flex: 1,
              maxWidth: 300,
              background: '#2d3748',
              borderRadius: 3,
              border: '3px solid #475569',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(unlocked.length / achievements.length) * 100}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                transition: 'width 0.3s',
                boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.5)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>
            ✓ UNLOCKED ({unlocked.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded relative overflow-hidden transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                  border: '5px solid #22c55e',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 5px 5px 0 rgba(0,0,0,0.3)',
                }}
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: 'shine 3s infinite',
                  }}
                />
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                      border: '4px solid #15803d',
                      fontSize: 28,
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 0 #000', marginBottom: 2 }}>
                      {achievement.title.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 8, color: '#94a3b8' }}>{achievement.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 }}>
            🔒 LOCKED ({locked.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded"
                style={{
                  background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                  border: '5px solid #475569',
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
                  opacity: 0.6,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                      border: '4px solid #475569',
                      fontSize: 28,
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                      filter: 'grayscale(100%)',
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 10, fontWeight: 'bold', color: '#64748b' }}>
                      {achievement.title.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 8, color: '#475569' }}>{achievement.description}</div>
                  </div>
                  <div style={{ fontSize: 20, opacity: 0.5 }}>🔒</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
