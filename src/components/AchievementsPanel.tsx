import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { achievements } from '../data/achievements';
import type { Achievement } from '../data/achievements';
import { showNotification } from './NotificationToast';

export default function AchievementsPanel() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const employees = useGameStore((state) => state.employees);
  const projects = useGameStore((state) => state.projects);
  const researchNodes = useGameStore((state) => state.researchNodes);
  const office = useGameStore((state) => state.office);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const totalContractsCompleted = useGameStore((state) => state.totalContractsCompleted);
  const totalTrainingsDone = useGameStore((state) => state.totalTrainingsDone);
  const shippedProducts = useGameStore((state) => state.shippedProducts);
  const totalDailyChallengesCompleted = useGameStore((state) => state.totalDailyChallengesCompleted);
  const totalWeeklyChallengesCompleted = useGameStore((state) => state.totalWeeklyChallengesCompleted);
  const companyPhase = useGameStore((state) => state.companyPhase);
  const daysPlayed = useGameStore((state) => state.daysPlayed);
  const totalRevenueEver = useGameStore((state) => state.totalRevenueEver);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const legacyPoints = useGameStore((state) => state.legacyPoints);

  // Check achievements
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id)) {
        let unlocked = false;
        
        // Check conditions using store state
        switch (achievement.id) {
          case 'first-hire':
            unlocked = employees.length >= 1;
            break;
          case 'first-project':
            unlocked = projects.length >= 1;
            break;
          case 'first-completion':
            unlocked = totalProjectsCompleted >= 1;
            break;
          case '100k':
            unlocked = money >= 100000;
            break;
          case '500k':
            unlocked = money >= 500000;
            break;
          case 'millionaire':
            unlocked = money >= 1000000;
            break;
          case 'team-5':
            unlocked = employees.length >= 5;
            break;
          case 'team-10':
            unlocked = employees.length >= 10;
            break;
          case 'reputation-50':
            unlocked = reputation >= 50;
            break;
          case 'reputation-100':
            unlocked = reputation >= 100;
            break;
          case 'research-first':
            unlocked = researchNodes.some((node) => node.completed);
            break;
          case 'office-upgrade':
            unlocked = office.size !== 'hacker_den';
            break;
          case 'contract-master':
            unlocked = totalContractsCompleted >= 5;
            break;
          case 'training-expert':
            unlocked = totalTrainingsDone >= 10;
            break;
          case 'research-master':
            unlocked = researchNodes.length > 0 && researchNodes.every((node) => node.completed);
            break;
          case 'team-leader':
            unlocked = employees.length >= 20;
            break;
          case 'first-product':
            unlocked = shippedProducts.length >= 1;
            break;
          case 'five-products':
            unlocked = shippedProducts.length >= 5;
            break;
          case 'daily-challenge':
            unlocked = totalDailyChallengesCompleted >= 1;
            break;
          case 'weekly-challenge':
            unlocked = totalWeeklyChallengesCompleted >= 1;
            break;
          case 'phase-growth':
            unlocked = companyPhase !== 'startup';
            break;
          case 'phase-unicorn':
            unlocked = companyPhase === 'unicorn' || companyPhase === 'empire' || companyPhase === 'legend';
            break;
          case 'phase-legend':
            unlocked = companyPhase === 'legend';
            break;
          case 'days-30':
            unlocked = daysPlayed >= 30;
            break;
          case 'days-100':
            unlocked = daysPlayed >= 100;
            break;
          case 'projects-50':
            unlocked = totalProjectsCompleted >= 50;
            break;
          case 'revenue-1m':
            unlocked = totalRevenueEver >= 1_000_000;
            break;
          case 'prestige':
            unlocked = prestigeLevel >= 1;
            break;
          case 'legacy-100':
            unlocked = legacyPoints >= 100;
            break;
        }

        if (unlocked) {
          setUnlockedAchievements((prev) => [...prev, achievement.id]);
          setNewAchievement(achievement);
          showNotification(`🏆 Achievement: ${achievement.title}!`, 'success', 4000);
          
          setTimeout(() => {
            setNewAchievement(null);
          }, 5000);
        }
      }
    });
  }, [money, reputation, employees.length, projects.length, researchNodes, office.size, totalProjectsCompleted, totalContractsCompleted, totalTrainingsDone, shippedProducts.length, totalDailyChallengesCompleted, totalWeeklyChallengesCompleted, companyPhase, daysPlayed, totalRevenueEver, prestigeLevel, legacyPoints, unlockedAchievements]);

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

      {/* New achievement notification */}
      {newAchievement && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] p-6 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '8px solid #22c55e',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), 8px 8px 0 rgba(0,0,0,0.3)',
            animation: 'slideDown 0.5s ease-out',
            fontFamily: 'var(--font-pixel)',
            minWidth: 320,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                border: '5px solid #15803d',
                fontSize: 40,
                boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
                animation: 'bounce 1s ease-in-out infinite',
              }}
            >
              {newAchievement.icon}
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 'bold', marginBottom: 4, letterSpacing: '0.1em' }}>
                🏆 ACHIEVEMENT UNLOCKED!
              </div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', textShadow: '2px 2px 0 #000', marginBottom: 2 }}>
                {newAchievement.title.toUpperCase()}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{newAchievement.description}</div>
            </div>
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
