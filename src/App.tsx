import { useState } from 'react';
import GameScreen from './components/GameScreen';
import TitleScreen from './components/TitleScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const loadGame = useGameStore((state) => state.loadGame);

  const handleNewGame = () => {
    localStorage.removeItem('aiLabTycoonSave');
    useGameStore.getState().initializeGame();
    setGameStarted(true);
  };

  const handleContinue = () => {
    if (loadGame()) {
      setGameStarted(true);
    }
  };

  if (!gameStarted) {
    return <TitleScreen onNewGame={handleNewGame} onContinue={handleContinue} />;
  }

  return <GameScreen />;
}

export default App;
