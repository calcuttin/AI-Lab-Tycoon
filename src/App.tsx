import { useState } from 'react';
import GameScreen from './components/GameScreen';
import TitleScreen from './components/TitleScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const loadGame = useGameStore((state) => state.loadGame);

  const handleStartGame = () => {
    // Try to load saved game; only start fresh if no save exists
    const loaded = loadGame();
    if (!loaded) {
      useGameStore.getState().initializeGame();
    }
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <TitleScreen onStartGame={handleStartGame} />;
  }

  return <GameScreen />;
}

export default App;
