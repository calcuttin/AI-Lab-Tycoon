import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTimeSystem } from '../systems/time';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import EventModal from './EventModal';
import StoryNotification from './StoryNotification';
import WelcomePanel from './WelcomePanel';
import NotificationToast from './NotificationToast';
import ParticleEffects from './ParticleEffects';
import DailyReport from './DailyReport';
import KeyboardShortcuts from './KeyboardShortcuts';
import TutorialOverlay from './TutorialOverlay';
import AchievementTracker from './AchievementTracker';

const ProjectsPanel = lazy(() => import('./ProjectsPanel'));
const ResearchTree = lazy(() => import('./ResearchTree'));
const EmployeesPanel = lazy(() => import('./EmployeesPanel'));
const OfficeView = lazy(() => import('./OfficeView'));
const MarketView = lazy(() => import('./MarketView'));
const MilestonesPanel = lazy(() => import('./MilestonesPanel'));
const StatisticsPanel = lazy(() => import('./StatisticsPanel'));
const EmployeeTraining = lazy(() => import('./EmployeeTraining'));
const PoliciesPanel = lazy(() => import('./PoliciesPanel'));
const ContractsPanel = lazy(() => import('./ContractsPanel'));
const AchievementsPanel = lazy(() => import('./AchievementsPanel'));

export type View = 'projects' | 'research' | 'employees' | 'office' | 'market' | 'milestones' | 'statistics' | 'training' | 'policies' | 'contracts' | 'achievements';

interface GameScreenProps {
  isNewGame?: boolean;
  onReplayIntro?: () => void;
}

function PanelFallback() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400" style={{ fontFamily: 'var(--font-ui)' }}>
      Loading...
    </div>
  );
}

export default function GameScreen({ isNewGame = true, onReplayIntro }: GameScreenProps) {
  const [currentView, setCurrentView] = useState<View>('projects');
  const [showWelcome, setShowWelcome] = useState(isNewGame);
  const [viewTransition, setViewTransition] = useState(false);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const isPaused = useGameStore((state) => state.isPaused);

  const handleViewChange = useCallback((view: View) => {
    if (view === currentView) return;
    setViewTransition(true);
    window.setTimeout(() => {
      setCurrentView(view);
      setViewTransition(false);
    }, 150);
  }, [currentView]);

  useEffect(() => {
    const timeSystem = getTimeSystem();
    timeSystem.start();

    return () => {
      timeSystem.stop();
    };
  }, []);

  useEffect(() => {
    const timeSystem = getTimeSystem();
    timeSystem.update();
  }, [gameSpeed, isPaused]);

  const renderView = () => {
    const panel = (() => {
      switch (currentView) {
        case 'projects':
          return <ProjectsPanel />;
        case 'research':
          return <ResearchTree />;
        case 'employees':
          return <EmployeesPanel />;
        case 'office':
          return <OfficeView />;
        case 'market':
          return <MarketView />;
        case 'milestones':
          return <MilestonesPanel />;
        case 'statistics':
          return <StatisticsPanel />;
        case 'training':
          return <EmployeeTraining />;
        case 'policies':
          return <PoliciesPanel />;
        case 'contracts':
          return <ContractsPanel />;
        case 'achievements':
          return <AchievementsPanel />;
        default:
          return <ProjectsPanel />;
      }
    })();

    return <Suspense fallback={<PanelFallback />}>{panel}</Suspense>;
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #1a2744 100%)',
        color: 'var(--color-text)',
      }}
    >
      <TopBar onReplayIntro={onReplayIntro} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={handleViewChange} />
        <main
          className="flex-1 overflow-auto p-4"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          <div
            key={currentView}
            style={{
              opacity: viewTransition ? 0 : 1,
              transform: viewTransition ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
            }}
          >
            {renderView()}
          </div>
        </main>
      </div>
      <EventModal />
      <StoryNotification />
      <AchievementTracker />
      <NotificationToast />
      <ParticleEffects />
      <DailyReport />
      <KeyboardShortcuts setCurrentView={handleViewChange} />
      <TutorialOverlay />
      {showWelcome && <WelcomePanel onClose={() => setShowWelcome(false)} />}
    </div>
  );
}
