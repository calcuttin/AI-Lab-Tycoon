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
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        🔬 RESEARCH TREE
      </h2>
      {!hasResearcher && (
        <div
          className="p-3 rounded"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '2px solid #f59e0b',
            fontSize: 9,
            color: '#fbbf24',
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
              className="rounded relative overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                border: `5px solid ${
                  node.completed ? '#22c55e' : node.unlocked ? '#0ea5e9' : '#475569'
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
                    ? 'linear-gradient(135deg, #22c55e22 0%, transparent 100%)'
                    : node.unlocked
                    ? 'linear-gradient(135deg, #0ea5e922 0%, transparent 100%)'
                    : 'linear-gradient(135deg, #47556922 0%, transparent 100%)',
                  borderBottom: `2px solid ${node.completed ? '#22c55e44' : node.unlocked ? '#0ea5e944' : '#47556944'}`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: node.completed
                        ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                        : node.unlocked
                        ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                        : 'linear-gradient(180deg, #475569 0%, #334155 100%)',
                      border: `3px solid ${node.completed ? '#15803d' : node.unlocked ? '#0369a1' : '#64748b'}`,
                      fontSize: 24,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {getResearchIcon(node.id)}
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 0 #000' }}>
                      {node.name.toUpperCase()}
                    </h3>
                    {node.completed && (
                      <div style={{ fontSize: 7, color: '#22c55e', fontWeight: 'bold', marginTop: 2 }}>
                        ✓ COMPLETED
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p style={{ fontSize: 8, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
                  {node.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4" style={{ fontSize: 8 }}>
                  <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <span style={{ color: '#94a3b8' }}>COST:</span>
                    <span style={{ color: money >= node.cost ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                      ${node.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                    <span style={{ color: '#94a3b8' }}>TIME:</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{node.timeRequired} DAYS</span>
                  </div>
                </div>

                {/* Progress bar */}
                {inProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2" style={{ fontSize: 8 }}>
                      <span style={{ color: '#94a3b8' }}>PROGRESS</span>
                      <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                        {formatProgress(node.progress, node.timeRequired)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 14,
                        background: '#2d3748',
                        borderRadius: 3,
                        border: '3px solid #475569',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                          transition: 'width 0.3s',
                          boxShadow: 'inset 0 0 10px rgba(14, 165, 233, 0.5)',
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
                            boxShadow: '0 0 8px rgba(255,255,255,0.8)',
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
                    className="w-full py-3 rounded text-center"
                    style={{
                      background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                      border: '3px solid #15803d',
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                      fontSize: 9,
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
                    className="w-full py-3 rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: canStart
                        ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                        : inProgress
                        ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                      color: canStart || inProgress ? '#fff' : '#64748b',
                      border: `3px solid ${canStart ? '#0369a1' : inProgress ? '#b45309' : '#475569'}`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                      fontSize: 9,
                      fontWeight: 'bold',
                      opacity: canStart || inProgress ? 1 : 0.6,
                    }}
                  >
                    {inProgress ? '⏳ IN PROGRESS...' : '▶ START RESEARCH'}
                  </button>
                ) : (
                  <div
                    className="w-full py-3 rounded text-center"
                    style={{
                      background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                      border: '3px solid #475569',
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                      fontSize: 8,
                      color: '#64748b',
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
