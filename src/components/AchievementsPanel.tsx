import { useGameStore } from '../store/gameStore';
import { achievements } from '../data/achievements';

export default function AchievementsPanel() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);

  const unlocked = achievements.filter((a) => unlockedAchievements.includes(a.id));
  const locked = achievements.filter((a) => !unlockedAchievements.includes(a.id));

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        🏆 ACHIEVEMENTS
      </h2>

      {/* Stats */}
      <div
        className="p-5 rounded-lg"
        style={{
          background: '#202523',
          border: '1px solid #d9b778',
          boxShadow: 'none',
        }}
      >
        <div className="flex items-center gap-6">
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#a7b39d' }}>PROGRESS: </span>
            <span style={{ color: '#d9b778', fontWeight: 'bold', fontSize: 14 }}>
              {unlocked.length} / {achievements.length}
            </span>
          </div>
          <div
            style={{
              height: 16,
              flex: 1,
              maxWidth: 300,
              background: '#333b36',
              borderRadius: 3,
              border: '1px solid #46523d',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(unlocked.length / achievements.length) * 100}%`,
                background: 'linear-gradient(90deg, #d9b778 0%, #d97706 100%)',
                transition: 'width 0.3s',
                boxShadow: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#a5c992', marginBottom: 8 }}>
            ✓ UNLOCKED ({unlocked.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg relative overflow-hidden transition-all "
                style={{
                  background: '#202523',
                  border: '1px solid #a5c992',
                  boxShadow: 'none',
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
                    className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: '#425637',
                      border: '1px solid #425637',
                      fontSize: 28,
                      boxShadow: 'none',
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', textShadow: 'none', marginBottom: 2 }}>
                      {achievement.title.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: '#a7b39d' }}>{achievement.description}</div>
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
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#a7b39d', marginBottom: 8 }}>
            🔒 LOCKED ({locked.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg"
                style={{
                  background: '#202523',
                  border: '1px solid #46523d',
                  boxShadow: 'none',
                  opacity: 0.6,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: '#333d32',
                      border: '1px solid #46523d',
                      fontSize: 28,
                      boxShadow: 'none',
                      filter: 'grayscale(100%)',
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8b9980' }}>
                      {achievement.title.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: '#46523d' }}>{achievement.description}</div>
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
