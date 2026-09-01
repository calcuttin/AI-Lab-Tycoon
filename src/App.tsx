import { useEffect, useState } from 'react';
import GameScreen from './components/GameScreen';
import IntroScreen from './components/IntroScreen';
import { shouldAutoResumeGame } from './intro/settings';
import { useGameStore } from './store/gameStore';

type SessionKind = 'new' | 'continue';

function App() {
  const [gameStarted, setGameStarted] = useState(() => shouldAutoResumeGame() && useGameStore.getState().loadGame());
  const [sessionKind, setSessionKind] = useState<SessionKind>(() => (shouldAutoResumeGame() ? 'continue' : 'new'));
  const [transitioning, setTransitioning] = useState(false);
  const [replayIntro, setReplayIntro] = useState(false);
  const loadGame = useGameStore((state) => state.loadGame);
  const saveGame = useGameStore((state) => state.saveGame);

  useEffect(() => {
    const handleBeforeUnload = () => saveGame();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  const startSession = (kind: SessionKind) => {
    setSessionKind(kind);
    setTransitioning(true);
    window.setTimeout(() => {
      setGameStarted(true);
      setTransitioning(false);
    }, 450);
  };

  const handleNewGame = () => {
    localStorage.removeItem('aiLabTycoonSave');
    useGameStore.getState().initializeGame();
    startSession('new');
  };

  const handleContinue = () => {
    if (loadGame()) {
      startSession('continue');
    }
  };

  const handleReplayIntro = () => {
    setReplayIntro(true);
    setGameStarted(false);
    setTransitioning(false);
  };

  if (!gameStarted) {
    return (
      <div style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease' }}>
        <IntroScreen
          key={replayIntro ? 'replay' : 'title'}
          forcePlay={replayIntro}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onIntroFinished={() => setReplayIntro(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease' }}>
      <GameScreen isNewGame={sessionKind === 'new'} onReplayIntro={handleReplayIntro} />
    </div>
  );
}

export default App;
