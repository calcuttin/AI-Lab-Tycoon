import { useGameStore } from '../store/gameStore';

type Policy = 'balanced' | 'crunch' | 'wellness';

const policyDetails: Record<Policy, { title: string; description: string; effect: string; color: string }> = {
  balanced: {
    title: 'Balanced',
    description: 'Default pace with steady morale.',
    effect: 'Neutral speed and morale',
    color: '#b7d98e',
  },
  crunch: {
    title: 'Crunch Mode',
    description: 'Short-term speed boost at a morale cost.',
    effect: '+Speed, -Morale',
    color: '#e49a8e',
  },
  wellness: {
    title: 'Wellness First',
    description: 'Protect morale with a small speed tradeoff.',
    effect: '+Morale, -Speed',
    color: '#a5c992',
  },
};

export default function PoliciesPanel() {
  const policy = useGameStore((state) => state.policy);
  const setPolicy = useGameStore((state) => state.setPolicy);

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
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
              className="p-4 rounded-lg text-left transition-all  active:scale-[0.98]"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${details.color}22 0%, transparent 100%)`
                  : '#202523',
                border: `1px solid ${isActive ? details.color : '#46523d'}`,
                boxShadow: isActive
                  ? `0 0 20px ${details.color}55, 5px 5px 0 rgba(0,0,0,0.3)`
                  : '5px 5px 0 rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
                {details.title.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 8 }}>
                {details.description}
              </div>
              <div style={{ fontSize: 11, color: details.color, fontWeight: 'bold' }}>
                {details.effect}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
