import { useEffect } from 'react';
import { achievements } from '../data/achievements';
import { isAchievementUnlocked, useGameStore } from '../store/gameStore';
import { showNotification } from './NotificationToast';

export default function AchievementTracker() {
  const state = useGameStore();

  useEffect(() => {
    for (const achievement of achievements) {
      if (
        !state.unlockedAchievements.includes(achievement.id) &&
        isAchievementUnlocked(achievement.id, state) &&
        state.unlockAchievement(achievement.id)
      ) {
        showNotification(`🏆 Achievement: ${achievement.title}!`, 'success', 4000);
      }
    }
  }, [state]);

  return null;
}
