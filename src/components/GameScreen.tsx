import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTimeSystem } from '../systems/time';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import ProjectsPanel from './ProjectsPanel';
import ResearchTree from './ResearchTree';
import EmployeesPanel from './EmployeesPanel';
import OfficeView from './OfficeView';
import MarketView from './MarketView';
import EventModal from './EventModal';
import StoryNotification from './StoryNotification';
import WelcomePanel from './WelcomePanel';
import NotificationToast from './NotificationToast';
import AchievementsPanel from './AchievementsPanel';
import MilestonesPanel from './MilestonesPanel';
import ParticleEffects from './ParticleEffects';
import DailyReport from './DailyReport';
import StatisticsPanel from './StatisticsPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import EmployeeTraining from './EmployeeTraining';
import PoliciesPanel from './PoliciesPanel';
import ContractsPanel from './ContractsPanel';
import TutorialOverlay from './TutorialOverlay';

export type View = 'projects' | 'research' | 'employees' | 'office' | 'market' | 'milestones' | 'statistics' | 'training' | 'policies' | 'contracts' | 'achievements';

export default function GameScreen() {
  const [currentView, setCurrentView] = useState<View>('projects');
  const [showWelcome, setShowWelcome] = useState(true);
  const [viewTransition, setViewTransition] = useState(false);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const isPaused = useGameStore((state) => state.isPaused);

  // Animated view transition wrapper
  const handleViewChange = useCallback((view: View) => {
    if (view === currentView) return;
    setViewTransition(true);
    setTimeout(() => {
      setCurrentView(view);
      setViewTransition(false);
    }, 150);
  }, [currentView]);

  useEffect(() => {
    // Only start the time system; do NOT reset game state (App handles load vs new game)
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
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #1a2744 100%)',
        color: 'var(--color-text)',
      }}
    >
      <TopBar />
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
      <NotificationToast />
      <ParticleEffects />
      <DailyReport />
      <KeyboardShortcuts setCurrentView={handleViewChange} />
      <TutorialOverlay />
      {showWelcome && <WelcomePanel onClose={() => setShowWelcome(false)} />}
    </div>
  );
}
