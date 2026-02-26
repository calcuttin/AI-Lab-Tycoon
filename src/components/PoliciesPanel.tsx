import { useGameStore } from '../store/gameStore';

type Policy = 'balanced' | 'crunch' | 'wellness';

const policyDetails: Record<Policy, { title: string; description: string; effect: string; color: string }> = {
  balanced: {
    title: 'Balanced',
    description: 'Default pace with steady morale.',
    effect: 'Neutral speed and morale',
    color: '#0ea5e9',
  },
  crunch: {
    title: 'Crunch Mode',
    description: 'Short-term speed boost at a morale cost.',
    effect: '+Speed, -Morale',
    color: '#ef4444',
  },
  wellness: {
    title: 'Wellness First',
    description: 'Protect morale with a small speed tradeoff.',
    effect: '+Morale, -Speed',
    color: '#22c55e',
  },
};

export default function PoliciesPanel() {
  const policy = useGameStore((state) => state.policy);
  const setPolicy = useGameStore((state) => state.setPolicy);

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        🧩 POLICIES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(policyDetails) as Policy[]).map((key) => {
          const details = policyDetails[key];
          const isActive = policy === key;
          return (
            <button
              key={key}
              onClick={() => setPolicy(key)}
              className="p-4 rounded text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${details.color}22 0%, transparent 100%)`
                  : 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                border: `5px solid ${isActive ? details.color : '#475569'}`,
                boxShadow: isActive
                  ? `0 0 20px ${details.color}55, 5px 5px 0 rgba(0,0,0,0.3)`
                  : '5px 5px 0 rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
                {details.title.toUpperCase()}
              </div>
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 8 }}>
                {details.description}
              </div>
              <div style={{ fontSize: 8, color: details.color, fontWeight: 'bold' }}>
                {details.effect}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
