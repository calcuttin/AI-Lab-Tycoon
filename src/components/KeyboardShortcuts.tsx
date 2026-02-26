import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { View } from './GameScreen';

interface KeyboardShortcutsProps {
  setCurrentView?: (view: View) => void;
}

export default function KeyboardShortcuts({ setCurrentView }: KeyboardShortcutsProps) {
  const togglePause = useGameStore((state) => state.togglePause);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea/select or contentEditable
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.isContentEditable) return;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        return;
      }

      // Don't intercept modified keys for view navigation (except Ctrl+S/L)
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case '1':
          if (!hasModifier) setGameSpeed(1);
          break;
        case '2':
          if (!hasModifier) setGameSpeed(2);
          break;
        case '4':
          if (!hasModifier) setGameSpeed(4);
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            saveGame();
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            loadGame();
          }
          break;
        // View navigation shortcuts
        case 'p':
          if (!hasModifier && setCurrentView) setCurrentView('projects');
          break;
        case 'r':
          if (!hasModifier && setCurrentView) setCurrentView('research');
          break;
        case 'e':
          if (!hasModifier && setCurrentView) setCurrentView('employees');
          break;
        case 'o':
          if (!hasModifier && setCurrentView) setCurrentView('office');
          break;
        case 'm':
          if (!hasModifier && setCurrentView) setCurrentView('market');
          break;
        case 't':
          if (!hasModifier && setCurrentView) setCurrentView('training');
          break;
        case 'i':
          if (!hasModifier && setCurrentView) setCurrentView('statistics');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePause, setGameSpeed, saveGame, loadGame, setCurrentView]);

  return null;
}
