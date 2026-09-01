import { useEffect } from 'react';
import { achievements } from '../data/achievements';
import { isAchievementUnlocked, useGameStore } from '../store/gameStore';
import { showNotification } from '../systems/feedback';

export default function AchievementTracker() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const money = useGameStore((state) => state.money);
  const reputation = useGameStore((state) => state.reputation);
  const employees = useGameStore((state) => state.employees);
  const projects = useGameStore((state) => state.projects);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const researchNodes = useGameStore((state) => state.researchNodes);
  const office = useGameStore((state) => state.office);
  const shippedProducts = useGameStore((state) => state.shippedProducts);
  const totalContractsCompleted = useGameStore((state) => state.totalContractsCompleted);
  const totalTrainingsDone = useGameStore((state) => state.totalTrainingsDone);
  const totalDailyChallengesCompleted = useGameStore((state) => state.totalDailyChallengesCompleted);
  const totalWeeklyChallengesCompleted = useGameStore((state) => state.totalWeeklyChallengesCompleted);
  const companyPhase = useGameStore((state) => state.companyPhase);
  const daysPlayed = useGameStore((state) => state.daysPlayed);
  const totalRevenueEver = useGameStore((state) => state.totalRevenueEver);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const legacyPoints = useGameStore((state) => state.legacyPoints);

  useEffect(() => {
    const state = useGameStore.getState();
    for (const achievement of achievements) {
      if (
        !unlockedAchievements.includes(achievement.id) &&
        isAchievementUnlocked(achievement.id, state) &&
        unlockAchievement(achievement.id)
      ) {
        showNotification(`🏆 Achievement: ${achievement.title}!`, 'success', 4000);
      }
    }
  }, [
    unlockedAchievements,
    unlockAchievement,
    money,
    reputation,
    employees,
    projects,
    totalProjectsCompleted,
    researchNodes,
    office,
    shippedProducts,
    totalContractsCompleted,
    totalTrainingsDone,
    totalDailyChallengesCompleted,
    totalWeeklyChallengesCompleted,
    companyPhase,
    daysPlayed,
    totalRevenueEver,
    prestigeLevel,
    legacyPoints,
  ]);

  return null;
}
