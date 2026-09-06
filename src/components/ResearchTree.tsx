import { useGameStore } from '../store/gameStore';

// Research icons
const getResearchIcon = (id: string) => {
  const icons: Record<string, string> = {
    'transformer-basics': '⚡',
    'transformer-advanced': '🔋',
    'rlhf-basics': '🎯',
    'constitutional-ai': '📜',
    'multimodal-basics': '👁️',
    'vision-models': '🔍',
    'agent-systems': '🤖',
    'agi-research': '🧠',
  };
  return icons[id] || '🔬';
};

export default function ResearchTree() {
  const researchNodes = useGameStore((state) => state.researchNodes);
  const employees = useGameStore((state) => state.employees);
  const money = useGameStore((state) => state.money);
  const startResearch = useGameStore((state) => state.startResearch);
  const hasResearcher = employees.some((e) => e.role === 'researcher');

  const handleStartResearch = (nodeId: string) => {
    startResearch(nodeId);
  };

  const formatProgress = (progress: number, required: number) => {
    if (progress === 0) return 'NOT STARTED';
    const percent = Math.floor((progress / required) * 100);
    return `${percent}%`;
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        🔬 RESEARCH TREE
      </h2>
      {!hasResearcher && (
        <div
          className="p-3 rounded-lg"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #d9b778',
            fontSize: 12,
            color: '#dfc893',
          }}
        >
          ⚠️ Research requires a <strong>researcher</strong> on staff. Hire a researcher (Team panel) to make progress on research nodes.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {researchNodes.map((node) => {
          const canStart = node.unlocked && !node.completed && node.progress === 0 && money >= node.cost;
          const inProgress = node.progress > 0 && !node.completed;
          const progressPercent = node.progress > 0 ? (node.progress / node.timeRequired) * 100 : 0;

          return (
            <div
              key={node.id}
              className="rounded-lg relative overflow-hidden transition-all "
              style={{
                background: '#202523',
                border: `1px solid ${
                  node.completed ? '#a5c992' : node.unlocked ? '#b7d98e' : '#46523d'
                }`,
                boxShadow: node.completed
                  ? '0 0 20px rgba(34, 197, 94, 0.4), 5px 5px 0 rgba(0,0,0,0.3)'
                  : node.unlocked
                  ? '0 0 15px rgba(14, 165, 233, 0.2), 5px 5px 0 rgba(0,0,0,0.3)'
                  : '5px 5px 0 rgba(0,0,0,0.3)',
                opacity: node.unlocked ? 1 : 0.5,
              }}
            >
              {/* Progress glow effect */}
              {inProgress && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, transparent 70%)`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
              
              {/* Header with icon */}
              <div
                className="p-4 relative z-10"
                style={{
                  background: node.completed
                    ? 'linear-gradient(135deg, #a5c99222 0%, transparent 100%)'
                    : node.unlocked
                    ? 'linear-gradient(135deg, #b7d98e22 0%, transparent 100%)'
                    : 'linear-gradient(135deg, #46523d22 0%, transparent 100%)',
                  borderBottom: `1px solid ${node.completed ? '#a5c99244' : node.unlocked ? '#b7d98e44' : '#46523d44'}`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: node.completed
                        ? '#a5c992'
                        : node.unlocked
                        ? '#b7d98e'
                        : '#46523d',
                      border: `1px solid ${node.completed ? '#425637' : node.unlocked ? '#536b3e' : '#8b9980'}`,
                      fontSize: 24,
                      boxShadow: 'none',
                    }}
                  >
                    {getResearchIcon(node.id)}
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', textShadow: 'none' }}>
                      {node.name.toUpperCase()}
                    </h3>
                    {node.completed && (
                      <div style={{ fontSize: 10, color: '#a5c992', fontWeight: 'bold', marginTop: 2 }}>
                        ✓ COMPLETED
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p style={{ fontSize: 11, color: '#a7b39d', marginBottom: 12, lineHeight: 1.6 }}>
                  {node.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4" style={{ fontSize: 11 }}>
                  <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <span style={{ color: '#a7b39d' }}>COST:</span>
                    <span style={{ color: money >= node.cost ? '#a5c992' : '#e49a8e', fontWeight: 'bold' }}>
                      ${node.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                    <span style={{ color: '#a7b39d' }}>TIME:</span>
                    <span style={{ color: '#b7d98e', fontWeight: 'bold' }}>{node.timeRequired} DAYS</span>
                  </div>
                </div>

                {/* Progress bar */}
                {inProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2" style={{ fontSize: 11 }}>
                      <span style={{ color: '#a7b39d' }}>PROGRESS</span>
                      <span style={{ color: '#b7d98e', fontWeight: 'bold' }}>
                        {formatProgress(node.progress, node.timeRequired)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 14,
                        background: '#333b36',
                        borderRadius: 3,
                        border: '1px solid #46523d',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #b7d98e 0%, #8ea86f 100%)',
                          transition: 'width 0.3s',
                          boxShadow: 'none',
                        }}
                      />
                      {/* Animated progress indicator */}
                      {progressPercent > 0 && progressPercent < 100 && (
                        <div
                          style={{
                            position: 'absolute',
                            right: `${100 - progressPercent}%`,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: '#fff',
                            boxShadow: 'none',
                            animation: 'progressPulse 1.5s ease-in-out infinite',
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Action button */}
                {node.completed ? (
                  <div
                    className="w-full py-3 rounded-lg text-center"
                    style={{
                      background: '#425637',
                      border: '1px solid #425637',
                      boxShadow: 'none',
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    ✓ COMPLETED
                  </div>
                ) : node.unlocked ? (
                  <button
                    onClick={() => handleStartResearch(node.id)}
                    disabled={!canStart}
                    className="w-full py-3 rounded-lg transition-all  active:scale-[0.98]"
                    style={{
                      background: canStart
                        ? '#b7d98e'
                        : inProgress
                        ? '#d9b778'
                        : '#333d32',
                      color: canStart || inProgress ? '#fff' : '#8b9980',
                      border: `1px solid ${canStart ? '#536b3e' : inProgress ? '#b45309' : '#46523d'}`,
                      boxShadow: 'none',
                      fontSize: 12,
                      fontWeight: 'bold',
                      opacity: canStart || inProgress ? 1 : 0.6,
                    }}
                  >
                    {inProgress ? '⏳ IN PROGRESS...' : '▶ START RESEARCH'}
                  </button>
                ) : (
                  <div
                    className="w-full py-3 rounded-lg text-center"
                    style={{
                      background: '#333d32',
                      border: '1px solid #46523d',
                      boxShadow: 'none',
                      fontSize: 11,
                      color: '#8b9980',
                    }}
                  >
                    🔒 LOCKED
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
