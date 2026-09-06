import { useGameStore } from '../store/gameStore';
import { companyPhases } from '../data/milestones';
import type { ChallengeGoalType } from '../data/challenges';

function formatProgress(goalType: ChallengeGoalType | undefined, value: number): string {
  if (goalType === 'earn_money') return `$${Number(value).toLocaleString()}`;
  if (goalType === 'reach_morale') return `${Math.floor(Number(value))}%`;
  return String(Math.floor(Number(value)));
}

export default function MilestonesPanel() {
  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const employees = useGameStore((state) => state.employees);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const researchNodes = useGameStore((state) => state.researchNodes);
  const companyPhase = useGameStore((state) => state.companyPhase);
  const dailyChallenge = useGameStore((state) => state.dailyChallenge);
  const weeklyChallenge = useGameStore((state) => state.weeklyChallenge);
  const dailyChallengeProgress = useGameStore((state) => state.dailyChallengeProgress);
  const weeklyChallengeProgress = useGameStore((state) => state.weeklyChallengeProgress);
  const shippedProducts = useGameStore((state) => state.shippedProducts ?? []);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const legacyPoints = useGameStore((state) => state.legacyPoints);
  const prestigeReset = useGameStore((state) => state.prestigeReset);

  const safePhaseId = companyPhase && companyPhases.some((p) => p.id === companyPhase) ? companyPhase : 'startup';
  const phaseIndex = Math.max(0, companyPhases.findIndex((p) => p.id === safePhaseId));
  const currentPhase = companyPhases[phaseIndex] ?? companyPhases[0];
  const nextPhase = phaseIndex >= 0 && phaseIndex < companyPhases.length - 1 ? companyPhases[phaseIndex + 1] : null;
  const completedResearch = Array.isArray(researchNodes) ? researchNodes.filter((n) => n?.completed).length : 0;
  const req = nextPhase?.requirement ?? {};

  const dailyProg = dailyChallenge ? Number(dailyChallengeProgress?.[dailyChallenge.goalType] ?? 0) : 0;
  const weeklyProg = weeklyChallenge ? Number(weeklyChallengeProgress?.[weeklyChallenge.goalType] ?? 0) : 0;
  const dailyTarget = dailyChallenge ? Number(dailyChallenge.target) || 1 : 1;
  const weeklyTarget = weeklyChallenge ? Number(weeklyChallenge.target) || 1 : 1;

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        🏁 MILESTONES
      </h2>

      {/* Company phase */}
      <div
        className="p-5 rounded-lg"
        style={{
          background: '#202523',
          border: '1px solid #b2a2cf',
          boxShadow: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#b2a2cf', marginBottom: 8 }}>
          COMPANY PHASE
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: '#b2a2cf',
              border: '1px solid #6d28d9',
              fontSize: 32,
              boxShadow: 'none',
            }}
          >
            {currentPhase?.icon ?? '🌱'}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
              {currentPhase?.name ?? 'Startup'}
            </div>
            <div style={{ fontSize: 12, color: '#a7b39d' }}>
              {currentPhase?.description ?? 'Just getting started.'}
            </div>
          </div>
        </div>
        {nextPhase && (
          <div style={{ fontSize: 12, color: '#a7b39d' }}>
            Next: <span style={{ color: '#b2a2cf' }}>{nextPhase.name}</span> —{' '}
            {req.money != null && `$${Number(req.money).toLocaleString()} `}
            {req.reputation != null && `${req.reputation} rep `}
            {req.employees != null && `${req.employees} employees `}
            {req.projectsCompleted != null && `${req.projectsCompleted} projects `}
            {req.researchCompleted != null && `${req.researchCompleted} research `}
            — You: ${Number(money).toLocaleString()}, {Number(reputation)} rep, {employees?.length ?? 0} emp, {totalProjectsCompleted ?? 0} projects, {completedResearch} research
          </div>
        )}
      </div>

      {/* Daily challenge */}
      {dailyChallenge && (
        <div
          className="p-5 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #d9b778',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#d9b778', marginBottom: 8 }}>
            ☀️ DAILY CHALLENGE
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>{dailyChallenge?.title ?? 'Daily Challenge'}</div>
              <div style={{ fontSize: 12, color: '#a7b39d' }}>{dailyChallenge?.description ?? ''}</div>
            </div>
            <div style={{ fontSize: 13, color: '#d9b778' }}>
              {formatProgress(dailyChallenge?.goalType, dailyProg)} / {formatProgress(dailyChallenge?.goalType, dailyTarget)}
            </div>
            <div style={{ fontSize: 12, color: '#a5c992' }}>
              +${Number(dailyChallenge?.rewardMoney ?? 0).toLocaleString()} / +{dailyChallenge?.rewardReputation ?? 0} rep
            </div>
          </div>
          <div
            className="mt-2 h-2 rounded-lg overflow-hidden"
            style={{ background: '#333b36', border: '1px solid #46523d' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (dailyProg / dailyTarget) * 100))}%`,
                background: 'linear-gradient(90deg, #d9b778 0%, #d97706 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* Weekly challenge */}
      {weeklyChallenge && (
        <div
          className="p-5 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #b7d98e',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#b7d98e', marginBottom: 8 }}>
            📅 WEEKLY CHALLENGE
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>{weeklyChallenge?.title ?? 'Weekly Challenge'}</div>
              <div style={{ fontSize: 12, color: '#a7b39d' }}>{weeklyChallenge?.description ?? ''}</div>
            </div>
            <div style={{ fontSize: 13, color: '#b7d98e' }}>
              {formatProgress(weeklyChallenge?.goalType, weeklyProg)} / {formatProgress(weeklyChallenge?.goalType, weeklyTarget)}
            </div>
            <div style={{ fontSize: 12, color: '#a5c992' }}>
              +${Number(weeklyChallenge?.rewardMoney ?? 0).toLocaleString()} / +{weeklyChallenge?.rewardReputation ?? 0} rep
              {weeklyChallenge?.rewardLegacy != null && ` / +${weeklyChallenge.rewardLegacy} Legacy`}
            </div>
          </div>
          <div
            className="mt-2 h-2 rounded-lg overflow-hidden"
            style={{ background: '#333b36', border: '1px solid #46523d' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (weeklyProg / weeklyTarget) * 100))}%`,
                background: 'linear-gradient(90deg, #b7d98e 0%, #8ea86f 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* Shipped products */}
      <div
        className="p-5 rounded-lg"
        style={{
          background: '#202523',
          border: '1px solid #a5c992',
          boxShadow: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#a5c992', marginBottom: 8 }}>
          🛒 SHIPPED PRODUCTS (passive income)
        </div>
        {Array.isArray(shippedProducts) && shippedProducts.length > 0 && (
          <ul className="space-y-2 mb-4" style={{ fontSize: 12 }}>
            {shippedProducts.map((p: { id: string; name: string; dailyRevenue: number }) => (
              <li key={p.id} className="flex justify-between items-center">
                <span style={{ color: '#fff' }}>{p.name}</span>
                <span style={{ color: '#a5c992' }}>+${p.dailyRevenue.toLocaleString()}/day</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ fontSize: 11, color: '#a7b39d' }}>
          Completed projects become products automatically. Daily revenue is based on project quality and market appeal.
        </div>
      </div>

      {/* Prestige / Legacy */}
      <div
        className="p-5 rounded-lg"
        style={{
          background: '#202523',
          border: '1px solid #ec4899',
          boxShadow: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ec4899', marginBottom: 8 }}>
          🔄 PRESTIGE & LEGACY
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div style={{ fontSize: 13, color: '#fff' }}>
              Prestige level: <span style={{ color: '#ec4899' }}>{prestigeLevel ?? 0}</span>
            </div>
            <div style={{ fontSize: 13, color: '#fff' }}>
              Legacy Points: <span style={{ color: '#d9b778' }}>{legacyPoints ?? 0}</span>
            </div>
            <div style={{ fontSize: 11, color: '#a7b39d', marginTop: 4 }}>
              Prestige resets your run but gives a permanent cash bonus on new games. Legacy is earned from challenges and progress.
            </div>
          </div>
          <button
            type="button"
            onClick={prestigeReset}
            className="px-4 py-3 rounded-lg font-bold transition-all "
            style={{
              background: '#ec4899',
              border: '1px solid #be185d',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 12,
              boxShadow: 'none',
            }}
          >
            PRESTIGE (NEW GAME+)
          </button>
        </div>
      </div>
    </div>
  );
}
