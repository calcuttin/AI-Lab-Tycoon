export type ChallengeType = 'daily' | 'weekly';

export type ChallengeGoalType =
  | 'complete_projects'
  | 'earn_money'
  | 'hire_employees'
  | 'complete_research'
  | 'train_employees'
  | 'complete_contracts'
  | 'reach_morale'
  | 'ship_products';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  goalType: ChallengeGoalType;
  target: number;
  rewardMoney: number;
  rewardReputation: number;
  rewardLegacy?: number; // for weekly only
}

const dailyTemplates: Omit<Challenge, 'id' | 'type'>[] = [
  { title: 'Ship 1 Project', description: 'Complete any project today', icon: '📦', goalType: 'complete_projects', target: 1, rewardMoney: 2000, rewardReputation: 2 },
  { title: 'Earn $10k', description: 'Earn $10,000 in a single day', icon: '💰', goalType: 'earn_money', target: 10000, rewardMoney: 1000, rewardReputation: 1 },
  { title: 'Train 1 Employee', description: 'Train any employee skill', icon: '🎓', goalType: 'train_employees', target: 1, rewardMoney: 1500, rewardReputation: 1 },
  { title: 'Team Morale 80%', description: 'Keep average team morale at 80%+', icon: '😊', goalType: 'reach_morale', target: 80, rewardMoney: 2500, rewardReputation: 3 },
  { title: 'Complete 1 Contract', description: 'Finish a contract', icon: '📋', goalType: 'complete_contracts', target: 1, rewardMoney: 3000, rewardReputation: 2 },
  { title: 'Research Progress', description: 'Make progress on any research', icon: '🔬', goalType: 'complete_research', target: 1, rewardMoney: 2000, rewardReputation: 2 },
  { title: 'Hire 1 Employee', description: 'Add a new team member', icon: '👤', goalType: 'hire_employees', target: 1, rewardMoney: 1500, rewardReputation: 1 },
  { title: 'Productize 1 Project', description: 'Ship a product for passive income', icon: '🛒', goalType: 'ship_products', target: 1, rewardMoney: 5000, rewardReputation: 5 },
];

const weeklyTemplates: Omit<Challenge, 'id' | 'type'>[] = [
  { title: 'Ship 5 Projects', description: 'Complete 5 projects this week', icon: '📦', goalType: 'complete_projects', target: 5, rewardMoney: 15000, rewardReputation: 15, rewardLegacy: 1 },
  { title: 'Earn $100k', description: 'Earn $100,000 this week', icon: '💰', goalType: 'earn_money', target: 100000, rewardMoney: 10000, rewardReputation: 10, rewardLegacy: 1 },
  { title: 'Train 5 Employees', description: 'Train 5 employee skills', icon: '🎓', goalType: 'train_employees', target: 5, rewardMoney: 12000, rewardReputation: 8, rewardLegacy: 1 },
  { title: 'Complete 3 Contracts', description: 'Finish 3 contracts', icon: '📋', goalType: 'complete_contracts', target: 3, rewardMoney: 20000, rewardReputation: 12, rewardLegacy: 1 },
  { title: 'Complete 2 Research', description: 'Finish 2 research nodes', icon: '🔬', goalType: 'complete_research', target: 2, rewardMoney: 25000, rewardReputation: 20, rewardLegacy: 2 },
  { title: 'Hire 3 Employees', description: 'Grow team by 3', icon: '👥', goalType: 'hire_employees', target: 3, rewardMoney: 10000, rewardReputation: 8, rewardLegacy: 1 },
  { title: 'Ship 3 Products', description: 'Productize 3 completed projects', icon: '🛒', goalType: 'ship_products', target: 3, rewardMoney: 30000, rewardReputation: 25, rewardLegacy: 2 },
];

export function generateDailyChallenge(daySeed: number): Challenge {
  const t = dailyTemplates[Math.floor((daySeed * 7919) % dailyTemplates.length)];
  return {
    id: `daily-${daySeed}`,
    type: 'daily',
    ...t,
  };
}

export function generateWeeklyChallenge(weekSeed: number): Challenge {
  const t = weeklyTemplates[Math.floor((weekSeed * 7877) % weeklyTemplates.length)];
  return {
    id: `weekly-${weekSeed}`,
    type: 'weekly',
    ...t,
  };
}
