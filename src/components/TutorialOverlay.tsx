import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const tutorialSteps = [
  {
    id: 'hire-first',
    message: 'Welcome, founder! Visit TEAM in the sidebar to hire your first employees!',
    trigger: (state: { employees: unknown[] }) => state.employees.length === 0,
    icon: '🚀',
  },
  {
    id: 'start-project',
    message: 'Great hire! Now click PROJECTS in the sidebar to create your first AI project!',
    trigger: (state: { totalProjectsCompleted: number; projects: unknown[]; employees: unknown[] }) =>
      state.employees.length > 0 && state.projects.length === 0 && state.totalProjectsCompleted === 0,
    icon: '📁',
  },
  {
    id: 'unpause',
    message: 'Hit PLAY or press SPACE to start the clock and watch your team work!',
    trigger: (state: { isPaused: boolean; daysPlayed: number }) => state.isPaused && state.daysPlayed === 0,
    icon: '▶️',
  },
  {
    id: 'research',
    message: 'Explore the RESEARCH tree to unlock new AI project types!',
    trigger: (state: { daysPlayed: number; researchNodes: { completed: boolean }[] }) =>
      state.daysPlayed >= 5 && state.researchNodes.every((n) => !n.completed),
    icon: '🔬',
  },
  {
    id: 'hire',
    message: 'Your team is small! Visit TEAM to hire more employees and boost productivity.',
    trigger: (state: { daysPlayed: number; employees: unknown[] }) =>
      state.daysPlayed >= 10 && state.employees.length <= 1,
    icon: '👥',
  },
];

export default function TutorialOverlay() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aiLabTycoon_dismissedTutorials');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [visible, setVisible] = useState(true);

  const projects = useGameStore((state) => state.projects);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const isPaused = useGameStore((state) => state.isPaused);
  const daysPlayed = useGameStore((state) => state.daysPlayed);
  const employees = useGameStore((state) => state.employees);
  const researchNodes = useGameStore((state) => state.researchNodes);

  const gameState = { projects, totalProjectsCompleted, isPaused, daysPlayed, employees, researchNodes };

  // Find the first active tutorial step
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeStep = tutorialSteps.find((step) => !dismissed.has(step.id) && step.trigger(gameState as any));

  // Auto-show when a new step becomes active
  useEffect(() => {
    if (activeStep) setVisible(true);
  }, [activeStep?.id]);

  const handleDismiss = (stepId: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(stepId);
    setDismissed(newDismissed);
    localStorage.setItem('aiLabTycoon_dismissedTutorials', JSON.stringify([...newDismissed]));
    setVisible(false);
  };

  const handleDismissAll = () => {
    const allIds = new Set(tutorialSteps.map((s) => s.id));
    setDismissed(allIds);
    localStorage.setItem('aiLabTycoon_dismissedTutorials', JSON.stringify([...allIds]));
    setVisible(false);
  };

  if (!activeStep || !visible) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
      style={{
        animation: 'tutorialSlideUp 0.4s ease-out',
      }}
    >
      <div
        className="flex items-center gap-4 px-6 py-4 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
          border: '3px solid #0ea5e9',
          boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 6px 6px 0 rgba(0,0,0,0.4)',
          fontFamily: "'Press Start 2P', monospace",
          maxWidth: 500,
        }}
      >
        <span style={{ fontSize: 28 }}>{activeStep.icon}</span>
        <div className="flex-1">
          <div style={{ fontSize: 8, color: '#0ea5e9', marginBottom: 4, letterSpacing: 2 }}>TIP</div>
          <div style={{ fontSize: 9, color: '#e2e8f0', lineHeight: 1.6 }}>{activeStep.message}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleDismiss(activeStep.id)}
            style={{
              fontSize: 8,
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid #475569',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            GOT IT
          </button>
          <button
            onClick={handleDismissAll}
            style={{
              fontSize: 6,
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            HIDE ALL
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tutorialSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
