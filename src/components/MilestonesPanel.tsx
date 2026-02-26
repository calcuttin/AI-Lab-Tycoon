import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { companyPhases } from '../data/milestones';
import type { ChallengeGoalType } from '../data/challenges';

function formatProgress(goalType: ChallengeGoalType | undefined, value: number): string {
  if (goalType === 'earn_money') return `$${Number(value).toLocaleString()}`;
  if (goalType === 'reach_morale') return `${Math.floor(Number(value))}%`;
  return String(Number(value) ?? 0);
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
  const shipProduct = useGameStore((state) => state.shipProduct);

  const [newProductName, setNewProductName] = useState('');
  const [newProductRevenue, setNewProductRevenue] = useState('500');

  const safePhaseId = companyPhase && companyPhases.some((p) => p.id === companyPhase) ? companyPhase : 'startup';
  const phaseIndex = Math.max(0, companyPhases.findIndex((p) => p.id === safePhaseId));
  const currentPhase = companyPhases[phaseIndex] ?? companyPhases[0];
  const nextPhase = phaseIndex >= 0 && phaseIndex < companyPhases.length - 1 ? companyPhases[phaseIndex + 1] : null;
  const completedResearch = Array.isArray(researchNodes) ? researchNodes.filter((n) => n?.completed).length : 0;
  const req = nextPhase?.requirement ?? {};

  const handleShipProduct = () => {
    const revenue = parseInt(newProductRevenue, 10);
    if (newProductName.trim() && !isNaN(revenue) && revenue > 0) {
      shipProduct(newProductName.trim(), revenue);
      setNewProductName('');
      setNewProductRevenue('500');
    }
  };

  const dailyProg = dailyChallenge ? Number(dailyChallengeProgress?.[dailyChallenge.goalType] ?? 0) : 0;
  const weeklyProg = weeklyChallenge ? Number(weeklyChallengeProgress?.[weeklyChallenge.goalType] ?? 0) : 0;
  const dailyTarget = dailyChallenge ? Number(dailyChallenge.target) || 1 : 1;
  const weeklyTarget = weeklyChallenge ? Number(weeklyChallenge.target) || 1 : 1;

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        🏁 MILESTONES
      </h2>

      {/* Company phase */}
      <div
        className="p-5 rounded"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #a855f7',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#a855f7', marginBottom: 8 }}>
          COMPANY PHASE
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)',
              border: '4px solid #6d28d9',
              fontSize: 32,
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            {currentPhase?.icon ?? '🌱'}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
              {currentPhase?.name ?? 'Startup'}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>
              {currentPhase?.description ?? 'Just getting started.'}
            </div>
          </div>
        </div>
        {nextPhase && (
          <div style={{ fontSize: 9, color: '#94a3b8' }}>
            Next: <span style={{ color: '#a855f7' }}>{nextPhase.name}</span> —{' '}
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
          className="p-5 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #f59e0b',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#f59e0b', marginBottom: 8 }}>
            ☀️ DAILY CHALLENGE
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div style={{ fontSize: 10, color: '#fff', marginBottom: 2 }}>{dailyChallenge?.title ?? 'Daily Challenge'}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{dailyChallenge?.description ?? ''}</div>
            </div>
            <div style={{ fontSize: 10, color: '#f59e0b' }}>
              {formatProgress(dailyChallenge?.goalType, dailyProg)} / {formatProgress(dailyChallenge?.goalType, dailyTarget)}
            </div>
            <div style={{ fontSize: 9, color: '#22c55e' }}>
              +${Number(dailyChallenge?.rewardMoney ?? 0).toLocaleString()} / +{dailyChallenge?.rewardReputation ?? 0} rep
            </div>
          </div>
          <div
            className="mt-2 h-2 rounded overflow-hidden"
            style={{ background: '#2d3748', border: '2px solid #475569' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (dailyProg / dailyTarget) * 100))}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* Weekly challenge */}
      {weeklyChallenge && (
        <div
          className="p-5 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #0ea5e9',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#0ea5e9', marginBottom: 8 }}>
            📅 WEEKLY CHALLENGE
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div style={{ fontSize: 10, color: '#fff', marginBottom: 2 }}>{weeklyChallenge?.title ?? 'Weekly Challenge'}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{weeklyChallenge?.description ?? ''}</div>
            </div>
            <div style={{ fontSize: 10, color: '#0ea5e9' }}>
              {formatProgress(weeklyChallenge?.goalType, weeklyProg)} / {formatProgress(weeklyChallenge?.goalType, weeklyTarget)}
            </div>
            <div style={{ fontSize: 9, color: '#22c55e' }}>
              +${Number(weeklyChallenge?.rewardMoney ?? 0).toLocaleString()} / +{weeklyChallenge?.rewardReputation ?? 0} rep
              {weeklyChallenge?.rewardLegacy != null && ` / +${weeklyChallenge.rewardLegacy} Legacy`}
            </div>
          </div>
          <div
            className="mt-2 h-2 rounded overflow-hidden"
            style={{ background: '#2d3748', border: '2px solid #475569' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (weeklyProg / weeklyTarget) * 100))}%`,
                background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* Shipped products */}
      <div
        className="p-5 rounded"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #22c55e',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>
          🛒 SHIPPED PRODUCTS (passive income)
        </div>
        {Array.isArray(shippedProducts) && shippedProducts.length > 0 && (
          <ul className="space-y-2 mb-4" style={{ fontSize: 9 }}>
            {shippedProducts.map((p: { id: string; name: string; dailyRevenue: number }) => (
              <li key={p.id} className="flex justify-between items-center">
                <span style={{ color: '#fff' }}>{p.name}</span>
                <span style={{ color: '#22c55e' }}>+${p.dailyRevenue.toLocaleString()}/day</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Product name"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="px-3 py-2 rounded border-2 flex-1 min-w-[120px]"
            style={{
              background: '#0c1222',
              borderColor: '#475569',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 10,
            }}
          />
          <input
            type="number"
            placeholder="Daily $"
            value={newProductRevenue}
            onChange={(e) => setNewProductRevenue(e.target.value)}
            min={1}
            className="px-3 py-2 rounded border-2 w-24"
            style={{
              background: '#0c1222',
              borderColor: '#475569',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 10,
            }}
          />
          <button
            type="button"
            onClick={handleShipProduct}
            className="px-4 py-2 rounded font-bold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '3px solid #15803d',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 9,
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            }}
          >
            SHIP PRODUCT
          </button>
        </div>
      </div>

      {/* Prestige / Legacy */}
      <div
        className="p-5 rounded"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #ec4899',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ec4899', marginBottom: 8 }}>
          🔄 PRESTIGE & LEGACY
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div style={{ fontSize: 10, color: '#fff' }}>
              Prestige level: <span style={{ color: '#ec4899' }}>{prestigeLevel ?? 0}</span>
            </div>
            <div style={{ fontSize: 10, color: '#fff' }}>
              Legacy Points: <span style={{ color: '#f59e0b' }}>{legacyPoints ?? 0}</span>
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>
              Prestige resets your run but gives a permanent cash bonus on new games. Legacy is earned from challenges and progress.
            </div>
          </div>
          <button
            type="button"
            onClick={prestigeReset}
            className="px-4 py-3 rounded font-bold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(180deg, #ec4899 0%, #db2777 100%)',
              border: '3px solid #be185d',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 9,
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            }}
          >
            PRESTIGE (NEW GAME+)
          </button>
        </div>
      </div>
    </div>
  );
}
