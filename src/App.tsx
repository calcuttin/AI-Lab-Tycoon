import { useState } from 'react';
import GameScreen from './components/GameScreen';
import IntroScreen from './components/IntroScreen';
import { useGameStore } from './store/gameStore';

type SessionKind = 'new' | 'continue';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionKind, setSessionKind] = useState<SessionKind>('new');
  const [transitioning, setTransitioning] = useState(false);
  const loadGame = useGameStore((state) => state.loadGame);

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

  if (!gameStarted) {
    return (
      <div style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease' }}>
        <IntroScreen onNewGame={handleNewGame} onContinue={handleContinue} />
      </div>
    );
  }

  return (
    <div style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease' }}>
      <GameScreen isNewGame={sessionKind === 'new'} />
    </div>
  );
}

export default App;
