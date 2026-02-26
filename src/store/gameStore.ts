import { create } from 'zustand';
import { projectTypes } from '../data/projectTypes';
import { gameEvents } from '../data/events';
import { getInitialEmployees } from '../data/initialTeam';
import type { GameEvent } from '../data/events';
import { companyPhases, type CompanyPhaseId } from '../data/milestones';
import { generateDailyChallenge, generateWeeklyChallenge, type Challenge, type ChallengeGoalType } from '../data/challenges';
import { type RoomTypeId, getRoomTypeById, officeGridSizes, type OfficeSizeType, type RoomEffects } from '../data/roomTypes';
import { type InstalledUpgrade, type OfficeSizeId, getUpgradeById, calculateTotalEffects, getLayoutById } from '../data/officeLayouts';
import { playSound } from '../systems/audio';

// Helper function to calculate slot-based upgrade bonuses
export function calculateUpgradeBonuses(installedUpgrades: InstalledUpgrade[]): {
  productivity: number;
  morale: number;
  research: number;
  reputation: number;
  capacity: number;
  burnoutReduction: number;
} {
  return calculateTotalEffects(installedUpgrades);
}

// Helper function to calculate aggregate room bonuses (legacy, kept for compatibility)
export function calculateRoomBonuses(rooms: OfficeRoom[]): RoomEffects {
  const totals: RoomEffects = {
    productivityBonus: 0,
    moraleBonus: 0,
    researchBonus: 0,
    reputationBonus: 0,
    capacityBonus: 0,
    burnoutReduction: 0,
    teamworkBonus: 0,
    eventBonus: 0,
  };

  for (const room of rooms) {
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType) continue;

    // Calculate level multiplier (level 1 = 1x, level 2 = 1.3x, level 3 = 1.6x for upgradable rooms)
    const levelMultiplier = roomType.upgradable && roomType.upgradeMultiplier
      ? 1 + (room.level - 1) * (roomType.upgradeMultiplier - 1)
      : 1;

    // Condition affects efficiency (100 = full, 50 = half effect)
    const conditionMultiplier = room.condition / 100;

    const effectMultiplier = levelMultiplier * conditionMultiplier;

    // Aggregate effects
    if (roomType.effects.productivityBonus) {
      totals.productivityBonus! += roomType.effects.productivityBonus * effectMultiplier;
    }
    if (roomType.effects.moraleBonus) {
      totals.moraleBonus! += roomType.effects.moraleBonus * effectMultiplier;
    }
    if (roomType.effects.researchBonus) {
      totals.researchBonus! += roomType.effects.researchBonus * effectMultiplier;
    }
    if (roomType.effects.reputationBonus) {
      totals.reputationBonus! += roomType.effects.reputationBonus * effectMultiplier;
    }
    if (roomType.effects.capacityBonus) {
      totals.capacityBonus! += roomType.effects.capacityBonus;
    }
    if (roomType.effects.burnoutReduction) {
      // Burnout reduction stacks multiplicatively, capped at 80%
      totals.burnoutReduction = Math.min(0.8, (totals.burnoutReduction ?? 0) + roomType.effects.burnoutReduction * effectMultiplier);
    }
    if (roomType.effects.teamworkBonus) {
      totals.teamworkBonus! += roomType.effects.teamworkBonus * effectMultiplier;
    }
    if (roomType.effects.eventBonus) {
      totals.eventBonus! += roomType.effects.eventBonus * effectMultiplier;
    }
  }

  return totals;
}

// Forward declaration for OfficeRoom (used by calculateRoomBonuses)
export interface OfficeRoom {
  id: string;
  typeId: RoomTypeId;
  gridX: number;
  gridY: number;
  level: number;
  condition: number;
}

export interface Employee {
  id: string;
  name: string;
  role: 'researcher' | 'engineer' | 'designer' | 'manager' | 'intern';
  skills: {
    research: number;
    development: number;
    creativity: number;
    management: number;
  };
  salary: number;
  morale: number;
  traits: string[];
}

export interface Project {
  id: string;
  name: string;
  type: string;
  complexity: 'simple' | 'medium' | 'complex' | 'revolutionary';
  progress: number;
  maxProgress: number;
  team: string[]; // employee IDs
  quality: number;
  marketAppeal: number;
}

export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  timeRequired: number;
  progress: number;
  unlocked: boolean;
  completed: boolean;
  prerequisites: string[];
  unlocks: string[];
}

export interface Office {
  level: number;
  size: 'hacker_den' | 'small' | 'medium' | 'large' | 'campus';
  upgrades: {
    computers: number;
    coffeeMachines: number;
    serverRacks: number;
    meetingRooms: number;
    napPods: number;
  };
  rent: number;
  // Room system (legacy, kept for backward compatibility)
  rooms: OfficeRoom[];
  gridWidth: number;
  gridHeight: number;
  // New slot-based upgrade system
  installedUpgrades: InstalledUpgrade[];
}

export interface Competitor {
  id: string;
  name: string;
  tagline: string;
  marketShare: number;
  reputation: number;
  recentActivity: string[];
}

export interface ShippedProduct {
  id: string;
  name: string;
  dailyRevenue: number;
  unlockedAt: string;
}

export type FundingRound = 'none' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'ipo';

type ProjectUpdateResult = {
  updatedProjects: Project[];
  completedProjects: Project[];
  revenue: number;
  reputationGain: number;
  newUnlockedTypes: string[];
  moraleDeltasByEmployee: Map<string, number>;
};

type ResearchUpdateResult = {
  researchNodes: ResearchNode[];
  newlyCompletedResearch: string[];
};

type CombinedBonuses = {
  productivityBonus: number;
  moraleBonus: number;
  researchBonus: number;
  reputationBonus: number;
  burnoutReduction: number;
};

type SlotBonuses = ReturnType<typeof calculateUpgradeBonuses>;

type FinanceResult = {
  passiveIncome: number;
  totalRevenue: number;
  dailyExpenses: number;
  newMoney: number;
  isFirstOfMonth: boolean;
};

type PhaseTransitionResult = {
  nextPhase: CompanyPhaseId;
  phaseRepBonus: number;
  phaseName: string | null;
};

type ChallengeUpdateResult = {
  dailyChallenge: Challenge | null;
  weeklyChallenge: Challenge | null;
  dailyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  weeklyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  dailyChallengeDaySeed: number;
  weeklyChallengeWeekSeed: number;
  challengeMoney: number;
  challengeRep: number;
  challengeLegacy: number;
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
};

type ChallengeUpdateInput = {
  dailyChallenge: Challenge | null;
  weeklyChallenge: Challenge | null;
  dailyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  weeklyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  daysPlayed: number;
  completedProjects: number;
  totalRevenue: number;
  avgMorale: number;
  completedResearch: number;
};

type RandomEventResult = {
  eventTriggered: boolean;
  event: GameEvent | null;
};

type NotificationPayload = {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration: number;
};
export function computeCombinedBonuses(roomBonuses: RoomEffects, slotBonuses: SlotBonuses): CombinedBonuses {
  return {
    productivityBonus: (slotBonuses.productivity || 0) + (roomBonuses.productivityBonus || 0),
    moraleBonus: (slotBonuses.morale || 0) + (roomBonuses.moraleBonus || 0),
    researchBonus: (slotBonuses.research || 0) + (roomBonuses.researchBonus || 0),
    reputationBonus: (slotBonuses.reputation || 0) + (roomBonuses.reputationBonus || 0),
    burnoutReduction: Math.min(0.8, (slotBonuses.burnoutReduction || 0) + (roomBonuses.burnoutReduction || 0)),
  };
}

export function applyEmployeeMoraleForDay(
  employees: Employee[],
  moraleDeltasByEmployee: Map<string, number>,
  office: Office,
  combinedBonuses: CombinedBonuses,
  rng: () => number = Math.random,
): Employee[] {
  return employees.map(emp => {
    let newMorale = emp.morale + (moraleDeltasByEmployee.get(emp.id) ?? 0);

    // Coffee machines boost morale
    if (office.upgrades.coffeeMachines > 0) {
      newMorale = Math.min(100, newMorale + office.upgrades.coffeeMachines * 0.5);
    }

    // Nap pods reduce burnout
    if (office.upgrades.napPods > 0 && newMorale < 50) {
      newMorale = Math.min(100, newMorale + office.upgrades.napPods * 1);
    }

    // Room morale bonus (break room, gym, game room, etc.)
    if (combinedBonuses.moraleBonus) {
      newMorale = Math.min(100, newMorale + combinedBonuses.moraleBonus);
    }

    // Low morale warning
    if (newMorale < 30 && rng() < 0.1) {
      // Chance of employee leaving
      if (rng() < 0.05) {
        // Employee quits (handled separately)
      }
    }

    return {
      ...emp,
      morale: Math.max(0, Math.min(100, newMorale)),
    };
  });
}

export function calculateDailyFinance(
  state: GameState,
  newDate: Date,
  revenue: number,
): FinanceResult {
  // Passive income from shipped products
  const phase = companyPhases.find((p) => p.id === state.companyPhase);
  const passiveMultiplier = phase?.rewards?.passiveIncomeBonus ?? 1;
  const passiveIncome = Math.floor(
    state.shippedProducts.reduce((sum, p) => sum + p.dailyRevenue, 0) * passiveMultiplier
  );
  const totalRevenue = revenue + passiveIncome;

  // Pay salaries (only on first day of month)
  const isFirstOfMonth = newDate.getDate() === 1;
  const totalSalaries = state.employees.reduce((sum, e) => sum + e.salary, 0);
  const monthlyRent = state.office.rent;
  const dailyExpenses = isFirstOfMonth ? totalSalaries + monthlyRent : 0;
  const newMoney = state.money - dailyExpenses + totalRevenue;

  return {
    passiveIncome,
    totalRevenue,
    dailyExpenses,
    newMoney,
    isFirstOfMonth,
  };
}

export function computePhaseTransition(
  currentPhase: CompanyPhaseId,
  newMoneyVal: number,
  repSoFar: number,
  employeeCount: number,
  totalProjectsCompleted: number,
  completedProjectsToday: number,
  researchCompletedCount: number,
): PhaseTransitionResult {
  let phaseRepBonus = 0;
  const phaseIndex = companyPhases.findIndex((p) => p.id === currentPhase);
  let nextPhase = currentPhase;
  let phaseName: string | null = null;
  if (phaseIndex >= 0 && phaseIndex < companyPhases.length - 1) {
    const next = companyPhases[phaseIndex + 1];
    const req = next.requirement;
    const met =
      (req.money == null || newMoneyVal >= req.money) &&
      (req.reputation == null || repSoFar >= req.reputation) &&
      (req.employees == null || employeeCount >= req.employees) &&
      (req.projectsCompleted == null || totalProjectsCompleted + completedProjectsToday >= req.projectsCompleted) &&
      (req.researchCompleted == null || researchCompletedCount >= req.researchCompleted);
    if (met) {
      nextPhase = next.id;
      phaseName = next.name;
      if (next.rewards.reputationGain) {
        phaseRepBonus = next.rewards.reputationGain;
      }
    }
  }
  return { nextPhase, phaseRepBonus, phaseName };
}

export interface CompetitorNewsItem {
  day: number;
  competitor: string;
  headline: string;
  icon: string;
}

const competitorActions = [
  { headline: '{name} launched a new AI chatbot product', icon: '🚀', shareBoost: 1.5, repBoost: 3 },
  { headline: '{name} raised $200M in Series D funding', icon: '💰', shareBoost: 2, repBoost: 2 },
  { headline: '{name} hired 50 top ML engineers', icon: '👥', shareBoost: 1, repBoost: 2 },
  { headline: '{name} published breakthrough research paper', icon: '📄', shareBoost: 0.5, repBoost: 5 },
  { headline: '{name} partnered with a Fortune 500 company', icon: '🤝', shareBoost: 2, repBoost: 3 },
  { headline: '{name} open-sourced their latest model', icon: '🔓', shareBoost: -1, repBoost: 6 },
  { headline: '{name} suffered a major data breach', icon: '🔒', shareBoost: -3, repBoost: -8 },
  { headline: '{name} CEO made controversial AI safety claims', icon: '⚠️', shareBoost: -1, repBoost: -4 },
  { headline: '{name} acquired a promising AI startup', icon: '🏢', shareBoost: 2.5, repBoost: 2 },
  { headline: '{name} launched an enterprise AI platform', icon: '🖥️', shareBoost: 1.5, repBoost: 2 },
  { headline: '{name} won a major government contract', icon: '🏛️', shareBoost: 3, repBoost: 4 },
  { headline: '{name} product went viral on social media', icon: '📱', shareBoost: 2, repBoost: 3 },
  { headline: '{name} faced regulatory scrutiny over AI ethics', icon: '⚖️', shareBoost: -2, repBoost: -5 },
  { headline: '{name} released disappointing quarterly earnings', icon: '📉', shareBoost: -2, repBoost: -3 },
  { headline: '{name} demoed AGI prototype at tech conference', icon: '🧠', shareBoost: 1, repBoost: 7 },
];

export function evolveCompetitors(
  competitors: Competitor[],
  daysPlayed: number,
  rng: () => number = Math.random
): { competitors: Competitor[]; news: CompetitorNewsItem[] } {
  const news: CompetitorNewsItem[] = [];

  const updatedCompetitors = competitors.map((c) => {
    const shift = (rng() - 0.5) * 2;
    let newShare = c.marketShare + shift;
    let newRep = c.reputation;
    const newActivity = [...c.recentActivity];

    // ~15% chance per competitor per day to generate an action
    if (rng() < 0.15) {
      const action = competitorActions[Math.floor(rng() * competitorActions.length)];
      const headline = action.headline.replace('{name}', c.name);
      newShare += action.shareBoost;
      newRep = Math.max(0, Math.min(100, newRep + action.repBoost));
      newActivity.unshift(headline);
      if (newActivity.length > 5) newActivity.pop();
      news.push({ day: daysPlayed, competitor: c.name, headline, icon: action.icon });
    }

    newShare = Math.max(1, Math.min(45, newShare));
    return { ...c, marketShare: newShare, reputation: newRep, recentActivity: newActivity };
  });

  const totalCompShare = updatedCompetitors.reduce((s, c) => s + c.marketShare, 0);
  const normalized = totalCompShare > 100
    ? updatedCompetitors.map((c) => ({ ...c, marketShare: (c.marketShare / totalCompShare) * 100 }))
    : updatedCompetitors;

  return { competitors: normalized, news };
}

export function updateChallengesForDay(input: ChallengeUpdateInput): ChallengeUpdateResult {
  const newDaysPlayed = input.daysPlayed + 1;
  const dailyProgress: Partial<Record<ChallengeGoalType, number>> = {
    ...input.dailyChallengeProgress,
    complete_projects: (input.dailyChallengeProgress.complete_projects ?? 0) + input.completedProjects,
    earn_money: (input.dailyChallengeProgress.earn_money ?? 0) + input.totalRevenue,
    reach_morale: Math.max(input.dailyChallengeProgress.reach_morale ?? 0, input.avgMorale),
    complete_research: (input.dailyChallengeProgress.complete_research ?? 0) + input.completedResearch,
  };
  const weeklyProgress: Partial<Record<ChallengeGoalType, number>> = {
    ...input.weeklyChallengeProgress,
    complete_projects: (input.weeklyChallengeProgress.complete_projects ?? 0) + input.completedProjects,
    earn_money: (input.weeklyChallengeProgress.earn_money ?? 0) + input.totalRevenue,
    reach_morale: Math.max(input.weeklyChallengeProgress.reach_morale ?? 0, input.avgMorale),
    complete_research: (input.weeklyChallengeProgress.complete_research ?? 0) + input.completedResearch,
  };

  let challengeMoney = 0;
  let challengeRep = 0;
  let challengeLegacy = 0;
  let dailyCompleted = false;
  let weeklyCompleted = false;
  let nextDaily = input.dailyChallenge;
  let nextWeekly = input.weeklyChallenge;
  let nextDailyProgress = dailyProgress;
  let nextWeeklyProgress = weeklyProgress;

  const currentWeek = Math.floor(input.daysPlayed / 7);
  const nextWeek = Math.floor(newDaysPlayed / 7);

  if (input.dailyChallenge) {
    const prog = dailyProgress[input.dailyChallenge.goalType] ?? 0;
    if (prog >= input.dailyChallenge.target) {
      challengeMoney += input.dailyChallenge.rewardMoney;
      challengeRep += input.dailyChallenge.rewardReputation;
      dailyCompleted = true;
      nextDaily = generateDailyChallenge(newDaysPlayed);
      nextDailyProgress = {};
    }
  } else {
    nextDaily = generateDailyChallenge(newDaysPlayed);
  }

  if (input.weeklyChallenge && nextWeek > currentWeek) {
    const prog = input.weeklyChallengeProgress[input.weeklyChallenge.goalType] ?? 0;
    if (prog >= input.weeklyChallenge.target) {
      challengeMoney += input.weeklyChallenge.rewardMoney;
      challengeRep += input.weeklyChallenge.rewardReputation;
      challengeLegacy += input.weeklyChallenge.rewardLegacy ?? 0;
      weeklyCompleted = true;
      nextWeekly = generateWeeklyChallenge(nextWeek);
      nextWeeklyProgress = {};
    } else {
      nextWeekly = generateWeeklyChallenge(nextWeek);
      nextWeeklyProgress = {};
    }
  } else if (!input.weeklyChallenge) {
    nextWeekly = generateWeeklyChallenge(nextWeek);
  }

  return {
    dailyChallenge: nextDaily,
    weeklyChallenge: nextWeekly,
    dailyChallengeProgress: nextDailyProgress,
    weeklyChallengeProgress: nextWeeklyProgress,
    dailyChallengeDaySeed: newDaysPlayed,
    weeklyChallengeWeekSeed: nextWeek,
    challengeMoney,
    challengeRep,
    challengeLegacy,
    dailyCompleted,
    weeklyCompleted,
  };
}

export function pickRandomEvent(
  activeEvent: GameEvent | null,
  eventHistory: string[],
  availableEvents: GameEvent[],
  rng: () => number = Math.random,
): RandomEventResult {
  if (activeEvent) return { eventTriggered: false, event: null };
  if (rng() >= 0.05) return { eventTriggered: false, event: null };

  const candidates = availableEvents.filter(e =>
    !eventHistory.includes(e.id) &&
    (!e.triggerCondition || e.triggerCondition())
  );
  if (candidates.length === 0) return { eventTriggered: false, event: null };

  const totalProbability = candidates.reduce((sum, e) => sum + e.probability, 0);
  let random = rng() * totalProbability;
  for (const event of candidates) {
    random -= event.probability;
    if (random <= 0) {
      return { eventTriggered: true, event };
    }
  }

  return { eventTriggered: false, event: null };
}

export function getChallengeNotifications(
  dailyCompleted: boolean,
  weeklyCompleted: boolean,
  dailyChallenge: Challenge | null,
  weeklyChallenge: Challenge | null,
): NotificationPayload[] {
  const notifications: NotificationPayload[] = [];
  if (dailyCompleted && dailyChallenge) {
    notifications.push({
      message: `✅ Daily challenge completed! +$${dailyChallenge.rewardMoney.toLocaleString()}`,
      type: 'success',
      duration: 3000,
    });
  }
  if (weeklyCompleted && weeklyChallenge) {
    notifications.push({
      message: `✅ Weekly challenge completed! +$${weeklyChallenge.rewardMoney.toLocaleString()}`,
      type: 'success',
      duration: 4000,
    });
  }
  return notifications;
}

export function getPhaseNotification(phaseName: string | null): NotificationPayload | null {
  if (!phaseName) return null;
  return {
    message: `🏆 Company phase: ${phaseName}!`,
    type: 'success',
    duration: 5000,
  };
}

export function getProjectCompletionNotifications(projects: Project[]): NotificationPayload[] {
  return projects.map((project) => ({
    message: `🎉 "${project.name}" completed! +$${Math.floor(project.marketAppeal * 1000 * (project.quality / 10)).toLocaleString()}`,
    type: 'success',
    duration: 4000,
  }));
}

export function updateProjectsForDay(
  state: GameState,
  combinedBonuses: CombinedBonuses,
  roomBonuses: RoomEffects,
): ProjectUpdateResult {
  const completedProjects: Project[] = [];
  let revenue = 0;
  let reputationGain = 0;
  const newUnlockedTypes: string[] = [];
  const moraleDeltasByEmployee = new Map<string, number>();

  const updatedProjects = state.projects
    .map(project => {
      const team = state.employees.filter(e => project.team.includes(e.id));
      if (team.length === 0) return project; // No progress without team

      // Calculate team effectiveness
      const totalDevSkill = team.reduce((sum, e) => sum + e.skills.development, 0);
      const totalResSkill = team.reduce((sum, e) => sum + e.skills.research, 0);
      const totalCreSkill = team.reduce((sum, e) => sum + e.skills.creativity, 0);
      const totalMgmtSkill = team.reduce((sum, e) => sum + e.skills.management, 0);
      const avgMorale = team.reduce((sum, e) => sum + e.morale, 0) / team.length;
      const avgMgmt = totalMgmtSkill / team.length;

      // Base progress from development + management (management reduces drag)
      const baseOutput = totalDevSkill * 0.7 + totalMgmtSkill * 0.3;
      let progressGain = Math.max(1, Math.floor(baseOutput / team.length));

      // Morale bonus (high morale = faster work)
      const moraleMultiplier = 0.5 + (avgMorale / 100) * 0.5; // 0.5x to 1.0x
      progressGain = Math.floor(progressGain * moraleMultiplier);

      // Policy effects
      const policyProgressMultiplier =
        state.policy === 'crunch' ? 1.2 : state.policy === 'wellness' ? 0.9 : 1;
      progressGain = Math.floor(progressGain * policyProgressMultiplier);

      // Low morale penalty
      if (avgMorale < 40) {
        progressGain = Math.max(1, Math.floor(progressGain * 0.85));
      }

      // Office upgrade bonuses
      const computerBonus = state.office.upgrades.computers * 0.1; // 10% per level
      progressGain = Math.floor(progressGain * (1 + computerBonus));

      // Office upgrade productivity bonus (combined from rooms and slot upgrades)
      if (combinedBonuses.productivityBonus) {
        progressGain = Math.floor(progressGain * (1 + combinedBonuses.productivityBonus));
      }

      // Room teamwork bonus (improves team efficiency)
      if (roomBonuses.teamworkBonus && team.length > 1) {
        progressGain = Math.floor(progressGain * (1 + roomBonuses.teamworkBonus));
      }

      // Research skill helps with complex projects
      if (project.complexity === 'complex' || project.complexity === 'revolutionary') {
        const researchBonus = Math.floor(totalResSkill / team.length / 2);
        progressGain += researchBonus;
      }

      // Creativity + research improves quality over time
      const creativityBonus = totalCreSkill / team.length;
      const researchQualityBonus = totalResSkill / team.length;
      const qualityIncrease = Math.min(0.12, (creativityBonus + researchQualityBonus * 0.6) / 120);

      const newProgress = Math.min(project.progress + progressGain, project.maxProgress);
      const newQuality = Math.min(10, project.quality + qualityIncrease);

      // Track morale changes without mutating state directly
      team.forEach(emp => {
        if (emp.morale > 0) {
          // Slight morale decrease from work, but less if morale is high
          let moraleChange = -0.1 + (emp.morale / 100) * 0.05 - (avgMgmt / 100) * 0.05;
          if (state.policy === 'crunch') {
            // Apply room burnout reduction to crunch penalty
            const crunchPenalty = 0.1 * (1 - (combinedBonuses.burnoutReduction ?? 0));
            moraleChange -= crunchPenalty;
          } else if (state.policy === 'wellness') {
            moraleChange += 0.08;
          }
          const currentDelta = moraleDeltasByEmployee.get(emp.id) ?? 0;
          const next = Math.max(0, Math.min(100, emp.morale + currentDelta + moraleChange));
          moraleDeltasByEmployee.set(emp.id, next - emp.morale);
        }
      });

      // Check if project is completed
      if (newProgress >= project.maxProgress && project.progress < project.maxProgress) {
        completedProjects.push({
          ...project,
          quality: newQuality,
        });

        // Enhanced revenue calculation
        const baseRevenue = project.marketAppeal * 1000;
        const qualityMultiplier = newQuality / 10;
        const teamSizeBonus = 1 + (team.length * 0.05); // 5% per team member
        revenue += Math.floor(baseRevenue * qualityMultiplier * teamSizeBonus);

        // Enhanced reputation gain
        reputationGain += Math.floor(newQuality * 2 + project.marketAppeal + (team.length * 0.5));

        // Unlock new project types based on complexity
        if (project.complexity === 'revolutionary' && !state.unlockedProjectTypes.includes('agi')) {
          newUnlockedTypes.push('agi');
        }

        return null; // Remove from active projects
      }

      return {
        ...project,
        progress: newProgress,
        quality: newQuality,
      };
    })
    .filter((p): p is Project => p !== null);

  return {
    updatedProjects,
    completedProjects,
    revenue,
    reputationGain,
    newUnlockedTypes,
    moraleDeltasByEmployee,
  };
}

export function updateResearchForDay(
  state: GameState,
  combinedBonuses: { researchBonus: number },
): ResearchUpdateResult {
  const hasResearcher = state.employees.some((e) => e.role === 'researcher');
  const updatedResearch = state.researchNodes.map(node => {
    if (!node.unlocked || node.completed || node.progress === 0) return node;
    if (!hasResearcher) return node; // No progress without a researcher

    // Base progress with room research bonus
    let progressGain = 1;
    if (combinedBonuses.researchBonus) {
      progressGain = Math.max(1, Math.floor(progressGain * (1 + combinedBonuses.researchBonus)));
    }
    const newProgress = node.progress + progressGain;

    if (newProgress >= node.timeRequired) {
      // Complete research
      return {
        ...node,
        progress: node.timeRequired,
        completed: true,
      };
    }

    return {
      ...node,
      progress: newProgress,
    };
  });

  // Check for completed research and unlock new content (immutably)
  const newlyCompletedResearch: string[] = [];
  const newlyUnlockedIds = new Set<string>();
  updatedResearch.forEach(node => {
    if (node.completed && !state.unlockedTechnologies.includes(node.id)) {
      newlyCompletedResearch.push(node.id);
      node.unlocks.forEach(unlockId => newlyUnlockedIds.add(unlockId));
    }
  });
  const unlockedResearch = updatedResearch.map(node =>
    newlyUnlockedIds.has(node.id) ? { ...node, unlocked: true } : node
  );

  return { researchNodes: unlockedResearch, newlyCompletedResearch };
}

interface GameState {
  // Core resources
  money: number;
  reputation: number;
  researchPoints: number;
  
  // Time
  currentDate: Date;
  gameSpeed: 0 | 1 | 2 | 4;
  isPaused: boolean;
  
  // Game entities
  employees: Employee[];
  projects: Project[];
  researchNodes: ResearchNode[];
  office: Office;
  competitors: Competitor[];
  shippedProducts: ShippedProduct[];
  policy: 'balanced' | 'crunch' | 'wellness';
  
  // Unlocked content
  unlockedTechnologies: string[];
  unlockedProjectTypes: string[];
  fundingRound: FundingRound;
  companyPhase: CompanyPhaseId;
  
  // Challenges
  dailyChallenge: Challenge | null;
  weeklyChallenge: Challenge | null;
  dailyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  weeklyChallengeProgress: Partial<Record<ChallengeGoalType, number>>;
  dailyChallengeDaySeed: number;
  weeklyChallengeWeekSeed: number;
  
  // Prestige
  prestigeLevel: number;
  legacyPoints: number;
  
  // Events
  activeEvent: GameEvent | null;
  eventHistory: string[];
  
  // Statistics
  totalProjectsCompleted: number;
  totalContractsCompleted: number;
  totalTrainingsDone: number;
  totalDailyChallengesCompleted: number;
  totalWeeklyChallengesCompleted: number;
  daysPlayed: number;
  totalRevenueEver: number;
  revenueThisDay: number;
  projectsCompletedThisDay: number;
  revenueHistory: number[];
  moraleHistory: number[];
  reputationHistory: number[];
  competitorNews: CompetitorNewsItem[];

  // Actions
  setGameSpeed: (speed: 0 | 1 | 2 | 4) => void;
  togglePause: () => void;
  setPolicy: (policy: GameState['policy']) => void;
  advanceDay: () => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addReputation: (amount: number) => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  startResearch: (nodeId: string) => void;
  updateResearch: (nodeId: string, progress: number) => void;
  completeResearch: (nodeId: string) => void;
  upgradeOffice: (upgrade: keyof Office['upgrades']) => void;
  upgradeOfficeSize: () => void;
  // Room system actions (legacy)
  placeRoom: (typeId: RoomTypeId, gridX: number, gridY: number) => boolean;
  removeRoom: (roomId: string) => void;
  upgradeRoom: (roomId: string) => boolean;
  // Slot-based upgrade system
  installUpgrade: (slotId: string, upgradeId: string) => boolean;
  upgradeSlot: (slotId: string) => boolean;
  removeSlotUpgrade: (slotId: string) => void;
  triggerEvent: (event: GameEvent) => void;
  handleEventChoice: (eventId: string, choiceId: string) => void;
  trainEmployee: (employeeId: string, skill: keyof Employee['skills']) => void;
  shipProduct: (projectName: string, dailyRevenue: number) => void;
  completeContract: () => void;
  addLegacyPoints: (amount: number) => void;
  prestigeReset: () => void;
  initializeGame: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
}

const initialDate = new Date(2024, 0, 1);

const initialResearchNodes: ResearchNode[] = [
  {
    id: 'transformer-basics',
    name: 'Transformer Basics',
    description: 'Learn the fundamentals of attention mechanisms',
    cost: 5000,
    timeRequired: 30,
    progress: 0,
    unlocked: true,
    completed: false,
    prerequisites: [],
    unlocks: ['transformer-advanced', 'multimodal-basics'],
  },
  {
    id: 'transformer-advanced',
    name: 'Transformer 2.0',
    description: 'Attention is All You Need... Again',
    cost: 15000,
    timeRequired: 60,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-basics'],
    unlocks: ['rlhf-basics'],
  },
  {
    id: 'rlhf-basics',
    name: 'RLHF for Dummies',
    description: 'Make models say what you want them to say',
    cost: 20000,
    timeRequired: 45,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-advanced'],
    unlocks: ['constitutional-ai'],
  },
  {
    id: 'constitutional-ai',
    name: 'Constitutional AI (The Sequel)',
    description: 'AI that follows rules... sometimes',
    cost: 30000,
    timeRequired: 90,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['rlhf-basics'],
    unlocks: ['agent-systems'],
  },
  {
    id: 'multimodal-basics',
    name: 'Multimodal Foundations',
    description: 'Text-to-Image-to-Text-to-Image',
    cost: 25000,
    timeRequired: 75,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-basics'],
    unlocks: ['vision-models'],
  },
  {
    id: 'vision-models',
    name: 'GPT-Vision',
    description: 'See what the model sees',
    cost: 35000,
    timeRequired: 90,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['multimodal-basics'],
    unlocks: [],
  },
  {
    id: 'agent-systems',
    name: 'AutoGPT but Actually Good',
    description: 'AI Agents That Don\'t Hallucinate',
    cost: 50000,
    timeRequired: 120,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['constitutional-ai'],
    unlocks: ['agi-research'],
  },
  {
    id: 'agi-research',
    name: 'AGI Research',
    description: 'The final frontier... maybe',
    cost: 100000,
    timeRequired: 365,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['agent-systems'],
    unlocks: [],
  },
  {
    id: 'efficient-training',
    name: 'Efficient Training Methods',
    description: 'Train models faster with less compute',
    cost: 12000,
    timeRequired: 45,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-basics'],
    unlocks: [],
  },
  {
    id: 'few-shot-learning',
    name: 'Few-Shot Learning',
    description: 'Teach models with minimal examples',
    cost: 18000,
    timeRequired: 50,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-advanced'],
    unlocks: [],
  },
  {
    id: 'reinforcement-learning',
    name: 'Reinforcement Learning',
    description: 'Let AI learn from its mistakes',
    cost: 22000,
    timeRequired: 55,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['rlhf-basics'],
    unlocks: [],
  },
  {
    id: 'neural-architecture',
    name: 'Neural Architecture Search',
    description: 'Let AI design better AI architectures',
    cost: 28000,
    timeRequired: 70,
    progress: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['transformer-advanced'],
    unlocks: [],
  },
];

const initialCompetitors: Competitor[] = [
  {
    id: 'cortex',
    name: 'Cortex Systems',
    tagline: 'We\'ll make AGI safe... eventually',
    marketShare: 35,
    reputation: 85,
    recentActivity: [],
  },
  {
    id: 'ethos',
    name: 'Ethos AI',
    tagline: 'Constitutional AI experts',
    marketShare: 20,
    reputation: 75,
    recentActivity: [],
  },
  {
    id: 'nexus',
    name: 'Nexus Intelligence',
    tagline: 'We solve games, not problems',
    marketShare: 25,
    reputation: 80,
    recentActivity: [],
  },
  {
    id: 'collective',
    name: 'Collective Labs',
    tagline: 'Open source everything... except the good stuff',
    marketShare: 15,
    reputation: 70,
    recentActivity: [],
  },
  {
    id: 'omnicorp',
    name: 'OmniCorp Research',
    tagline: 'We have 50 AI products, pick one',
    marketShare: 5,
    reputation: 65,
    recentActivity: [],
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state - Start with more money and paused
  money: 100000,
  reputation: 0,
  researchPoints: 0,
  currentDate: initialDate,
  gameSpeed: 1,
  isPaused: true, // Start paused so player can get oriented
  employees: getInitialEmployees(),
  projects: [],
  researchNodes: initialResearchNodes,
  office: {
    level: 1,
    size: 'hacker_den',
    upgrades: {
      computers: 0,
      coffeeMachines: 0,
      serverRacks: 0,
      meetingRooms: 0,
      napPods: 0,
    },
    rent: 500,
    rooms: [
      { id: 'room-1', typeId: 'dev_pit', gridX: 0, gridY: 0, level: 1, condition: 100 },
    ],
    gridWidth: officeGridSizes.hacker_den.width,
    gridHeight: officeGridSizes.hacker_den.height,
    installedUpgrades: [
      { slotId: 'main_work', upgradeId: 'basic_desks', level: 1 },
    ],
  },
  competitors: initialCompetitors,
  shippedProducts: [],
  policy: 'balanced',
  unlockedTechnologies: [],
  unlockedProjectTypes: ['chatbot-basic'],
  fundingRound: 'none',
  companyPhase: 'startup',
  dailyChallenge: generateDailyChallenge(0),
  weeklyChallenge: generateWeeklyChallenge(0),
  dailyChallengeProgress: {},
  weeklyChallengeProgress: {},
  dailyChallengeDaySeed: 0,
  weeklyChallengeWeekSeed: 0,
  prestigeLevel: 0,
  legacyPoints: 0,
  activeEvent: null,
  eventHistory: [],
  totalProjectsCompleted: 0,
  totalContractsCompleted: 0,
  totalTrainingsDone: 0,
  totalDailyChallengesCompleted: 0,
  totalWeeklyChallengesCompleted: 0,
  daysPlayed: 0,
  totalRevenueEver: 0,
  revenueThisDay: 0,
  projectsCompletedThisDay: 0,
  revenueHistory: [],
  moraleHistory: [],
  reputationHistory: [],
  competitorNews: [],

  // Actions
  setGameSpeed: (speed) => set({ gameSpeed: speed, isPaused: speed === 0 }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPolicy: (policy) => set({ policy }),
  
  advanceDay: () => {
    const state = get();
    if (state.isPaused) return;
    
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    
    // Calculate room bonuses for this day (legacy system)
    const roomBonuses = calculateRoomBonuses(state.office.rooms);
    
    // Calculate slot upgrade bonuses (new system)
    const slotBonuses = calculateUpgradeBonuses(state.office.installedUpgrades || []);
    
    // Combined bonuses (use slot bonuses primarily, fall back to room bonuses)
    const combinedBonuses = computeCombinedBonuses(roomBonuses, slotBonuses);
    
    const projectResult = updateProjectsForDay(state, combinedBonuses, roomBonuses);
    const {
      updatedProjects,
      completedProjects,
      revenue,
      reputationGain,
      newUnlockedTypes,
      moraleDeltasByEmployee,
    } = projectResult;

    const researchResult = updateResearchForDay(state, combinedBonuses);
    const { researchNodes: unlockedResearch, newlyCompletedResearch } = researchResult;
    
    // Unlock project types based on completed research
    const allUnlockedTech = [...state.unlockedTechnologies, ...newlyCompletedResearch];
    const newUnlockedProjectTypes = projectTypes
      .filter((type) => {
        // Check if all required tech is now unlocked and project type isn't already unlocked
        return type.requiredTech.every((tech: string) => allUnlockedTech.includes(tech)) &&
          !state.unlockedProjectTypes.includes(type.id);
      })
      .map((type) => type.id);
    
    const financeResult = calculateDailyFinance(state, newDate, revenue);
    const { totalRevenue, newMoney } = financeResult;
    
    // Update employee morale based on office upgrades and rooms
    const rng = Math.random;
    const updatedEmployees = applyEmployeeMoraleForDay(
      state.employees,
      moraleDeltasByEmployee,
      state.office,
      combinedBonuses,
      rng
    );
    
    // Update unlocked project types (from both completed projects and research)
    const updatedUnlockedTypes = [...state.unlockedProjectTypes, ...newUnlockedTypes, ...newUnlockedProjectTypes];
    const uniqueUnlockedTypes = Array.from(new Set(updatedUnlockedTypes));
    
    // Update unlocked technologies
    const updatedUnlockedTech = [...state.unlockedTechnologies, ...newlyCompletedResearch];
    const uniqueUnlockedTech = Array.from(new Set(updatedUnlockedTech));
    
    // Challenge progress (today's activity)
    const newDaysPlayed = state.daysPlayed + 1;
    const avgMorale = updatedEmployees.length > 0
      ? updatedEmployees.reduce((s, e) => s + e.morale, 0) / updatedEmployees.length
      : 0;
    const challengeUpdate = updateChallengesForDay({
      dailyChallenge: state.dailyChallenge,
      weeklyChallenge: state.weeklyChallenge,
      dailyChallengeProgress: state.dailyChallengeProgress,
      weeklyChallengeProgress: state.weeklyChallengeProgress,
      daysPlayed: state.daysPlayed,
      completedProjects: completedProjects.length,
      totalRevenue,
      avgMorale,
      completedResearch: newlyCompletedResearch.length,
    });
    const {
      challengeMoney,
      challengeRep,
      challengeLegacy,
      dailyCompleted,
      weeklyCompleted,
    } = challengeUpdate;
    const nextDaily = challengeUpdate.dailyChallenge;
    const nextWeekly = challengeUpdate.weeklyChallenge;
    const nextDailyProgress = challengeUpdate.dailyChallengeProgress;
    const nextWeeklyProgress = challengeUpdate.weeklyChallengeProgress;

    const challengeNotifications = getChallengeNotifications(
      dailyCompleted,
      weeklyCompleted,
      state.dailyChallenge,
      state.weeklyChallenge
    );
    challengeNotifications.forEach((detail) => {
      window.dispatchEvent(new CustomEvent('showNotification', { detail }));
    });
    
    // Company phase check (reputation from phase reward added to challengeRep below)
    const newMoneyVal = Math.max(0, newMoney) + challengeMoney;
    const repSoFar = state.reputation + reputationGain + challengeRep;
    const phaseTransition = computePhaseTransition(
      state.companyPhase,
      newMoneyVal,
      repSoFar,
      updatedEmployees.length,
      state.totalProjectsCompleted,
      completedProjects.length,
      unlockedResearch.filter((n) => n.completed).length
    );
    const nextPhase = phaseTransition.nextPhase;
    const phaseRepBonus = phaseTransition.phaseRepBonus;
    const phaseNotification = getPhaseNotification(phaseTransition.phaseName);
    if (phaseNotification) {
      window.dispatchEvent(new CustomEvent('showNotification', { detail: phaseNotification }));
    }
    // Add room reputation bonus
    const roomReputationGain = combinedBonuses.reputationBonus ?? 0;
    const newReputation = state.reputation + reputationGain + challengeRep + phaseRepBonus + roomReputationGain;
    
    // Competitor evolution (market share shifts + dynamic actions)
    const competitorResult = evolveCompetitors(state.competitors, newDaysPlayed, rng);
    const normalizedCompetitors = competitorResult.competitors;
    const newCompetitorNews = [...competitorResult.news, ...state.competitorNews].slice(0, 20);
    
    set({
      currentDate: newDate,
      projects: updatedProjects,
      researchNodes: unlockedResearch,
      employees: updatedEmployees,
      money: Math.max(0, newMoney) + challengeMoney,
      reputation: newReputation,
      unlockedProjectTypes: uniqueUnlockedTypes,
      unlockedTechnologies: uniqueUnlockedTech,
      totalProjectsCompleted: state.totalProjectsCompleted + completedProjects.length,
      totalRevenueEver: state.totalRevenueEver + totalRevenue,
      revenueThisDay: totalRevenue,
      projectsCompletedThisDay: completedProjects.length,
      daysPlayed: newDaysPlayed,
      dailyChallenge: nextDaily,
      weeklyChallenge: nextWeekly,
      dailyChallengeProgress: nextDailyProgress,
      weeklyChallengeProgress: nextWeeklyProgress,
      dailyChallengeDaySeed: challengeUpdate.dailyChallengeDaySeed,
      weeklyChallengeWeekSeed: challengeUpdate.weeklyChallengeWeekSeed,
      companyPhase: nextPhase,
      competitors: normalizedCompetitors,
      competitorNews: newCompetitorNews,
      legacyPoints: state.legacyPoints + challengeLegacy,
      totalDailyChallengesCompleted: state.totalDailyChallengesCompleted + (dailyCompleted ? 1 : 0),
      totalWeeklyChallengesCompleted: state.totalWeeklyChallengesCompleted + (weeklyCompleted ? 1 : 0),
      revenueHistory: [...state.revenueHistory, totalRevenue].slice(-30),
      moraleHistory: [...state.moraleHistory, updatedEmployees.length > 0 ? updatedEmployees.reduce((s, e) => s + e.morale, 0) / updatedEmployees.length : 0].slice(-30),
      reputationHistory: [...state.reputationHistory, newReputation].slice(-30),
    });
    
    // Show notification for completed projects
    if (completedProjects.length > 0) {
      const projectNotifications = getProjectCompletionNotifications(completedProjects);
      projectNotifications.forEach((detail) => {
        window.dispatchEvent(new CustomEvent('showNotification', { detail }));
      });
      // Trigger celebration particle effects and audio
      window.dispatchEvent(new CustomEvent('particleEffect', {
        detail: { type: 'celebration', x: window.innerWidth / 2, y: window.innerHeight / 3 },
      }));
      playSound('success');
    }

    // Sound & particles for challenge completion
    if (dailyCompleted || weeklyCompleted) {
      window.dispatchEvent(new CustomEvent('particleEffect', {
        detail: { type: 'reputation', x: window.innerWidth / 2, y: 50 },
      }));
      playSound('levelup');
    }

    // Money particles when revenue is positive
    if (totalRevenue > 0) {
      window.dispatchEvent(new CustomEvent('particleEffect', {
        detail: { type: 'money', x: 200, y: 30 },
      }));
    }
    
    // Check for random events (only if no active event)
    const updatedState = get();
    const randomEvent = pickRandomEvent(
      updatedState.activeEvent,
      updatedState.eventHistory,
      gameEvents,
      rng
    );
    if (randomEvent.eventTriggered && randomEvent.event) {
      updatedState.triggerEvent(randomEvent.event);
    }
  },
  
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  
  spendMoney: (amount) => {
    const state = get();
    if (state.money >= amount) {
      set({ money: state.money - amount });
      return true;
    }
    return false;
  },
  
  addReputation: (amount) => set((state) => ({ reputation: state.reputation + amount })),
  
  addEmployee: (employee) => {
    const state = get();
    if (state.employees.some(e => e.id === employee.id)) {
      console.warn('Employee already exists:', employee.id);
      return;
    }
    const hireCount = (state.dailyChallengeProgress.hire_employees ?? 0) + 1;
    const weekHireCount = (state.weeklyChallengeProgress.hire_employees ?? 0) + 1;
    set({
      employees: [...state.employees, employee],
      dailyChallengeProgress: { ...state.dailyChallengeProgress, hire_employees: hireCount },
      weeklyChallengeProgress: { ...state.weeklyChallengeProgress, hire_employees: weekHireCount },
    });
  },
  
  removeEmployee: (id) => set((state) => ({
    employees: state.employees.filter(e => e.id !== id),
  })),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  
  startResearch: (nodeId) => {
    const state = get();
    const node = state.researchNodes.find(n => n.id === nodeId);
    if (!node || !node.unlocked || node.completed || node.progress > 0) return;
    if (!state.spendMoney(node.cost)) return;
    
    set((state) => ({
      researchNodes: state.researchNodes.map(n =>
        n.id === nodeId ? { ...n, progress: 1 } : n
      ),
    }));
  },
  
  updateResearch: (nodeId, progress) => set((state) => ({
    researchNodes: state.researchNodes.map(n =>
      n.id === nodeId ? { ...n, progress } : n
    ),
  })),
  
  completeResearch: (nodeId) => {
    const state = get();
    const node = state.researchNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const newUnlockedTech = [...state.unlockedTechnologies, nodeId];
    const newUnlockedNodes = state.researchNodes.map(n => {
      if (node.unlocks.includes(n.id)) {
        return { ...n, unlocked: true };
      }
      return n;
    });
    
    set({
      unlockedTechnologies: newUnlockedTech,
      researchNodes: newUnlockedNodes,
    });
  },
  
  upgradeOffice: (upgrade) => {
    const state = get();
    const cost = {
      computers: 2000,
      coffeeMachines: 500,
      serverRacks: 5000,
      meetingRooms: 3000,
      napPods: 1000,
    }[upgrade];
    
    if (state.spendMoney(cost)) {
      set((state) => ({
        office: {
          ...state.office,
          upgrades: {
            ...state.office.upgrades,
            [upgrade]: state.office.upgrades[upgrade] + 1,
          },
        },
      }));
    }
  },
  
  upgradeOfficeSize: () => {
    const state = get();
    const sizeOrder: Office['size'][] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
    const currentIndex = sizeOrder.indexOf(state.office.size);
    
    if (currentIndex >= sizeOrder.length - 1) {
      alert('You already have the largest office size!');
      return;
    }
    
    const nextSize = sizeOrder[currentIndex + 1];
    const costs: Record<Office['size'], number> = {
      hacker_den: 0,
      small: 10000,
      medium: 50000,
      large: 200000,
      campus: 500000,
    };
    
    const cost = costs[nextSize];
    if (state.spendMoney(cost)) {
      const newRent: Record<Office['size'], number> = {
        hacker_den: 500,
        small: 1500,
        medium: 5000,
        large: 15000,
        campus: 50000,
      };
      
      const newGridSize = officeGridSizes[nextSize];
      set({
        office: {
          ...state.office,
          size: nextSize,
          level: state.office.level + 1,
          rent: newRent[nextSize],
          gridWidth: newGridSize.width,
          gridHeight: newGridSize.height,
        },
      });
    } else {
      alert(`Not enough money! Need $${cost.toLocaleString()} to upgrade to ${nextSize} office.`);
    }
  },
  
  placeRoom: (typeId, gridX, gridY) => {
    const state = get();
    const roomType = getRoomTypeById(typeId);
    if (!roomType) return false;
    
    // Check if player can afford it
    if (state.money < roomType.baseCost) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `Not enough money! Need $${roomType.baseCost.toLocaleString()}`, type: 'error' },
      }));
      return false;
    }
    
    // Check office size requirement
    if (roomType.requirements?.officeSize) {
      const sizeOrder: OfficeSizeType[] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
      const currentSizeIndex = sizeOrder.indexOf(state.office.size);
      const meetsSize = roomType.requirements.officeSize.some((reqSize) => {
        const reqIndex = sizeOrder.indexOf(reqSize);
        return currentSizeIndex >= reqIndex;
      });
      if (!meetsSize) {
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: { message: `Requires ${roomType.requirements.officeSize[0]} office or larger`, type: 'error' },
        }));
        return false;
      }
    }
    
    // Check employee requirement
    if (roomType.requirements?.minEmployees && state.employees.length < roomType.requirements.minEmployees) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `Requires at least ${roomType.requirements.minEmployees} employees`, type: 'error' },
      }));
      return false;
    }
    
    // Check maxPerOffice limit
    if (roomType.maxPerOffice) {
      const existingCount = state.office.rooms.filter(r => r.typeId === typeId).length;
      if (existingCount >= roomType.maxPerOffice) {
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: { message: `Maximum ${roomType.maxPerOffice} ${roomType.name}(s) per office`, type: 'error' },
        }));
        return false;
      }
    }
    
    // Check bounds
    if (gridX < 0 || gridY < 0 ||
        gridX + roomType.size.width > state.office.gridWidth ||
        gridY + roomType.size.height > state.office.gridHeight) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Room does not fit in that location', type: 'error' },
      }));
      return false;
    }
    
    // Check for overlapping rooms
    const occupiedCells = new Set<string>();
    for (const room of state.office.rooms) {
      const rt = getRoomTypeById(room.typeId);
      if (!rt) continue;
      for (let dx = 0; dx < rt.size.width; dx++) {
        for (let dy = 0; dy < rt.size.height; dy++) {
          occupiedCells.add(`${room.gridX + dx},${room.gridY + dy}`);
        }
      }
    }
    
    for (let dx = 0; dx < roomType.size.width; dx++) {
      for (let dy = 0; dy < roomType.size.height; dy++) {
        if (occupiedCells.has(`${gridX + dx},${gridY + dy}`)) {
          window.dispatchEvent(new CustomEvent('showNotification', {
            detail: { message: 'Space is already occupied', type: 'error' },
          }));
          return false;
        }
      }
    }
    
    // All checks passed - place the room
    const newRoom: OfficeRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      typeId,
      gridX,
      gridY,
      level: 1,
      condition: 100,
    };
    
    set((state) => ({
      money: state.money - roomType.baseCost,
      office: {
        ...state.office,
        rooms: [...state.office.rooms, newRoom],
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `${roomType.name} placed!`, type: 'success' },
    }));
    
    return true;
  },
  
  removeRoom: (roomId) => {
    const state = get();
    const room = state.office.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const roomType = getRoomTypeById(room.typeId);
    const refund = roomType ? Math.floor(roomType.baseCost * 0.5) : 0;
    
    set((state) => ({
      money: state.money + refund,
      office: {
        ...state.office,
        rooms: state.office.rooms.filter(r => r.id !== roomId),
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `Room removed. Refunded $${refund.toLocaleString()}`, type: 'info' },
    }));
  },
  
  upgradeRoom: (roomId) => {
    const state = get();
    const room = state.office.rooms.find(r => r.id === roomId);
    if (!room) return false;
    
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType || !roomType.upgradable) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'This room cannot be upgraded', type: 'error' },
      }));
      return false;
    }
    
    if (room.level >= 3) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Room is already at maximum level', type: 'error' },
      }));
      return false;
    }
    
    const upgradeCost = Math.floor(roomType.baseCost * (room.level * 0.75));
    if (state.money < upgradeCost) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `Not enough money! Need $${upgradeCost.toLocaleString()}`, type: 'error' },
      }));
      return false;
    }
    
    set((state) => ({
      money: state.money - upgradeCost,
      office: {
        ...state.office,
        rooms: state.office.rooms.map(r =>
          r.id === roomId ? { ...r, level: r.level + 1 } : r
        ),
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `${roomType.name} upgraded to level ${room.level + 1}!`, type: 'success' },
    }));
    
    return true;
  },
  
  // Slot-based upgrade system actions
  installUpgrade: (slotId, upgradeId) => {
    const state = get();
    const layout = getLayoutById(state.office.size);
    if (!layout) return false;
    
    const slot = layout.slots.find(s => s.id === slotId);
    if (!slot) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Invalid slot', type: 'error' },
      }));
      return false;
    }
    
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Invalid upgrade', type: 'error' },
      }));
      return false;
    }
    
    // Check if slot type matches
    if (upgrade.slotType !== slot.type) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `This upgrade doesn't fit in a ${slot.type} slot`, type: 'error' },
      }));
      return false;
    }
    
    // Check if already installed in this slot
    const existingUpgrade = state.office.installedUpgrades.find(u => u.slotId === slotId);
    if (existingUpgrade) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Slot already has an upgrade. Remove it first.', type: 'error' },
      }));
      return false;
    }
    
    // Check cost
    if (state.money < upgrade.cost) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `Not enough money! Need $${upgrade.cost.toLocaleString()}`, type: 'error' },
      }));
      return false;
    }
    
    // Check office size requirement
    if (upgrade.requiresOffice) {
      const sizeOrder: OfficeSizeId[] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
      const currentIndex = sizeOrder.indexOf(state.office.size);
      const requiredIndex = Math.min(...upgrade.requiresOffice.map(s => sizeOrder.indexOf(s)));
      if (currentIndex < requiredIndex) {
        window.dispatchEvent(new CustomEvent('showNotification', {
          detail: { message: `Requires ${upgrade.requiresOffice[0]} office or larger`, type: 'error' },
        }));
        return false;
      }
    }
    
    // Install the upgrade
    const newUpgrade: InstalledUpgrade = {
      slotId,
      upgradeId,
      level: 1,
    };
    
    set((state) => ({
      money: state.money - upgrade.cost,
      office: {
        ...state.office,
        installedUpgrades: [...state.office.installedUpgrades, newUpgrade],
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `${upgrade.name} installed!`, type: 'success' },
    }));
    
    return true;
  },
  
  upgradeSlot: (slotId) => {
    const state = get();
    const installed = state.office.installedUpgrades.find(u => u.slotId === slotId);
    if (!installed) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'No upgrade installed in this slot', type: 'error' },
      }));
      return false;
    }
    
    const upgrade = getUpgradeById(installed.upgradeId);
    if (!upgrade) return false;
    
    if (installed.level >= upgrade.maxLevel) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Already at maximum level', type: 'error' },
      }));
      return false;
    }
    
    const upgradeCost = Math.floor(upgrade.cost * (installed.level * 0.6));
    if (state.money < upgradeCost) {
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: `Not enough money! Need $${upgradeCost.toLocaleString()}`, type: 'error' },
      }));
      return false;
    }
    
    set((state) => ({
      money: state.money - upgradeCost,
      office: {
        ...state.office,
        installedUpgrades: state.office.installedUpgrades.map(u =>
          u.slotId === slotId ? { ...u, level: u.level + 1 } : u
        ),
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `${upgrade.name} upgraded to level ${installed.level + 1}!`, type: 'success' },
    }));
    
    return true;
  },
  
  removeSlotUpgrade: (slotId) => {
    const state = get();
    const installed = state.office.installedUpgrades.find(u => u.slotId === slotId);
    if (!installed) return;
    
    const upgrade = getUpgradeById(installed.upgradeId);
    const refund = upgrade ? Math.floor(upgrade.cost * 0.5) : 0;
    
    set((state) => ({
      money: state.money + refund,
      office: {
        ...state.office,
        installedUpgrades: state.office.installedUpgrades.filter(u => u.slotId !== slotId),
      },
    }));
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `Upgrade removed. Refunded $${refund.toLocaleString()}`, type: 'info' },
    }));
  },
  
  triggerEvent: (event) => {
    const state = get();
    if (state.activeEvent) return; // Don't trigger if event already active
    
    if (event.triggerCondition && !event.triggerCondition()) return;
    
    set({ activeEvent: event });
  },
  
  handleEventChoice: (eventId, choiceId) => {
    const state = get();
    const event = state.activeEvent;
    if (!event || event.id !== eventId) return;
    
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    // Apply effects
    if (choice.effects.money) {
      state.addMoney(choice.effects.money);
    }
    if (choice.effects.reputation) {
      state.addReputation(choice.effects.reputation);
    }
    if (choice.effects.researchPoints) {
      set({ researchPoints: state.researchPoints + choice.effects.researchPoints });
    }
    if (choice.effects.unlockTech) {
      set({ unlockedTechnologies: [...state.unlockedTechnologies, ...choice.effects.unlockTech] });
    }
    if (choice.effects.unlockProject) {
      set({ unlockedProjectTypes: [...state.unlockedProjectTypes, ...choice.effects.unlockProject] });
    }
    if (choice.effects.fireEmployee && state.employees.length > 0) {
      const randomEmployee = state.employees[Math.floor(Math.random() * state.employees.length)];
      state.removeEmployee(randomEmployee.id);
    }
    if (choice.effects.boostMorale) {
      // Boost morale for all employees
      const updatedEmployees = state.employees.map(emp => ({
        ...emp,
        morale: Math.max(0, Math.min(100, emp.morale + choice.effects.boostMorale!)),
      }));
      set({ employees: updatedEmployees });
    }
    
    // Close event and add to history
    set({
      activeEvent: null,
      eventHistory: [...state.eventHistory, eventId],
    });
  },
  
  trainEmployee: (employeeId, skill) => {
    const state = get();
    const employee = state.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const trainingCosts: Record<keyof Employee['skills'], number> = {
      development: 5000,
      research: 5000,
      creativity: 3000,
      management: 4000,
    };

    const cost = trainingCosts[skill];
    if (state.money < cost) return;
    if (employee.skills[skill] >= 10) return;

    if (state.spendMoney(cost)) {
      const updatedEmployees = state.employees.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            skills: {
              ...emp.skills,
              [skill]: Math.min(10, emp.skills[skill] + 1),
            },
            salary: Math.floor(emp.salary * 1.1), // Salary increases with training
          };
        }
        return emp;
      });
      const trainCount = (state.dailyChallengeProgress.train_employees ?? 0) + 1;
      const weekTrainCount = (state.weeklyChallengeProgress.train_employees ?? 0) + 1;
      set({
        employees: updatedEmployees,
        totalTrainingsDone: state.totalTrainingsDone + 1,
        dailyChallengeProgress: { ...state.dailyChallengeProgress, train_employees: trainCount },
        weeklyChallengeProgress: { ...state.weeklyChallengeProgress, train_employees: weekTrainCount },
      });
    }
  },
  
  shipProduct: (projectName, dailyRevenue) => {
    const state = get();
    const product: ShippedProduct = {
      id: `product-${Date.now()}`,
      name: projectName,
      dailyRevenue: Math.floor(dailyRevenue),
      unlockedAt: state.currentDate.toISOString(),
    };
    const shipCount = (state.dailyChallengeProgress.ship_products ?? 0) + 1;
    const weekShipCount = (state.weeklyChallengeProgress.ship_products ?? 0) + 1;
    set({
      shippedProducts: [...state.shippedProducts, product],
      dailyChallengeProgress: { ...state.dailyChallengeProgress, ship_products: shipCount },
      weeklyChallengeProgress: { ...state.weeklyChallengeProgress, ship_products: weekShipCount },
    });
  },
  
  completeContract: () => {
    const state = get();
    const contractCount = (state.dailyChallengeProgress.complete_contracts ?? 0) + 1;
    const weekContractCount = (state.weeklyChallengeProgress.complete_contracts ?? 0) + 1;
    set({
      totalContractsCompleted: state.totalContractsCompleted + 1,
      dailyChallengeProgress: { ...state.dailyChallengeProgress, complete_contracts: contractCount },
      weeklyChallengeProgress: { ...state.weeklyChallengeProgress, complete_contracts: weekContractCount },
    });
  },
  
  addLegacyPoints: (amount) => set((state) => ({ legacyPoints: state.legacyPoints + amount })),
  
  prestigeReset: () => {
    const state = get();
    const legacyGain = Math.floor(
      (state.totalProjectsCompleted * 2) +
      (state.daysPlayed * 0.5) +
      (state.totalRevenueEver / 50000)
    );
    const newPrestige = state.prestigeLevel + 1;
    const newLegacy = state.legacyPoints + legacyGain;
    const bonusMultiplier = 1 + newPrestige * 0.1;
    get().initializeGame();
    set({
      prestigeLevel: newPrestige,
      legacyPoints: newLegacy,
      money: Math.floor(100000 * bonusMultiplier),
      dailyChallenge: generateDailyChallenge(0),
      weeklyChallenge: generateWeeklyChallenge(0),
    });
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: `🔄 Prestige! +${legacyGain} Legacy. New run with ${Math.floor((bonusMultiplier - 1) * 100)}% cash bonus.`, type: 'success', duration: 6000 },
    }));
  },
  
  saveGame: () => {
    const state = get();
    const saveData = {
      money: state.money,
      reputation: state.reputation,
      researchPoints: state.researchPoints,
      currentDate: state.currentDate.toISOString(),
      employees: state.employees,
      projects: state.projects,
      researchNodes: state.researchNodes,
      office: state.office,
      policy: state.policy,
      unlockedTechnologies: state.unlockedTechnologies,
      unlockedProjectTypes: state.unlockedProjectTypes,
      eventHistory: state.eventHistory,
      totalProjectsCompleted: state.totalProjectsCompleted,
      totalContractsCompleted: state.totalContractsCompleted,
      totalTrainingsDone: state.totalTrainingsDone,
      totalDailyChallengesCompleted: state.totalDailyChallengesCompleted,
      totalWeeklyChallengesCompleted: state.totalWeeklyChallengesCompleted,
      shippedProducts: state.shippedProducts,
      fundingRound: state.fundingRound,
      companyPhase: state.companyPhase,
      dailyChallenge: state.dailyChallenge,
      weeklyChallenge: state.weeklyChallenge,
      dailyChallengeProgress: state.dailyChallengeProgress,
      weeklyChallengeProgress: state.weeklyChallengeProgress,
      dailyChallengeDaySeed: state.dailyChallengeDaySeed,
      weeklyChallengeWeekSeed: state.weeklyChallengeWeekSeed,
      prestigeLevel: state.prestigeLevel,
      legacyPoints: state.legacyPoints,
      daysPlayed: state.daysPlayed,
      totalRevenueEver: state.totalRevenueEver,
      competitors: state.competitors,
      revenueHistory: state.revenueHistory,
      moraleHistory: state.moraleHistory,
      reputationHistory: state.reputationHistory,
      version: '1.0',
    };
    localStorage.setItem('aiLabTycoonSave', JSON.stringify(saveData));
  },
  
  loadGame: () => {
    try {
      const saveData = localStorage.getItem('aiLabTycoonSave');
      if (!saveData) return false;
      
      const data = JSON.parse(saveData);
      const daysPlayed = data.daysPlayed ?? 0;
      
      set({
        money: data.money,
        reputation: data.reputation,
        researchPoints: data.researchPoints,
        currentDate: new Date(data.currentDate),
        employees: data.employees ?? [],
        projects: data.projects ?? [],
        researchNodes: data.researchNodes ?? initialResearchNodes,
        office: {
          level: data.office?.level ?? 1,
          size: data.office?.size ?? 'hacker_den',
          upgrades: data.office?.upgrades ?? { computers: 0, coffeeMachines: 0, serverRacks: 0, meetingRooms: 0, napPods: 0 },
          rent: data.office?.rent ?? 500,
          // Backward compatibility: add rooms if missing
          rooms: data.office?.rooms ?? [
            { id: 'room-1', typeId: 'dev_pit' as RoomTypeId, gridX: 0, gridY: 0, level: 1, condition: 100 },
          ],
          gridWidth: data.office?.gridWidth ?? officeGridSizes[(data.office?.size ?? 'hacker_den') as OfficeSizeType].width,
          gridHeight: data.office?.gridHeight ?? officeGridSizes[(data.office?.size ?? 'hacker_den') as OfficeSizeType].height,
          // Backward compatibility: add installedUpgrades if missing
          installedUpgrades: data.office?.installedUpgrades ?? [
            { slotId: 'main_work', upgradeId: 'basic_desks', level: 1 },
          ],
        },
        policy: data.policy || 'balanced',
        unlockedTechnologies: data.unlockedTechnologies ?? [],
        unlockedProjectTypes: data.unlockedProjectTypes ?? ['chatbot-basic'],
        eventHistory: data.eventHistory ?? [],
        activeEvent: null,
        totalProjectsCompleted: data.totalProjectsCompleted ?? 0,
        shippedProducts: data.shippedProducts ?? [],
        fundingRound: data.fundingRound ?? 'none',
        companyPhase: data.companyPhase ?? 'startup',
        dailyChallenge: data.dailyChallenge ?? generateDailyChallenge(daysPlayed),
        weeklyChallenge: data.weeklyChallenge ?? generateWeeklyChallenge(Math.floor(daysPlayed / 7)),
        dailyChallengeProgress: data.dailyChallengeProgress ?? {},
        weeklyChallengeProgress: data.weeklyChallengeProgress ?? {},
        dailyChallengeDaySeed: data.dailyChallengeDaySeed ?? daysPlayed,
        weeklyChallengeWeekSeed: data.weeklyChallengeWeekSeed ?? Math.floor(daysPlayed / 7),
        prestigeLevel: data.prestigeLevel ?? 0,
        legacyPoints: data.legacyPoints ?? 0,
        totalContractsCompleted: data.totalContractsCompleted ?? 0,
        totalTrainingsDone: data.totalTrainingsDone ?? 0,
        totalDailyChallengesCompleted: data.totalDailyChallengesCompleted ?? 0,
        totalWeeklyChallengesCompleted: data.totalWeeklyChallengesCompleted ?? 0,
        daysPlayed,
        totalRevenueEver: data.totalRevenueEver ?? 0,
        revenueThisDay: data.revenueThisDay ?? 0,
        projectsCompletedThisDay: data.projectsCompletedThisDay ?? 0,
        competitors: data.competitors ?? initialCompetitors,
        revenueHistory: data.revenueHistory ?? [],
        moraleHistory: data.moraleHistory ?? [],
        reputationHistory: data.reputationHistory ?? [],
        competitorNews: data.competitorNews ?? [],
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },
  
  initializeGame: () => {
    set({
      money: 100000,
      reputation: 0,
      researchPoints: 0,
      currentDate: initialDate,
      gameSpeed: 1,
      isPaused: true,
      employees: getInitialEmployees(),
      projects: [],
      researchNodes: initialResearchNodes,
      office: {
        level: 1,
        size: 'hacker_den',
        upgrades: { computers: 0, coffeeMachines: 0, serverRacks: 0, meetingRooms: 0, napPods: 0 },
        rent: 500,
        rooms: [
          { id: 'room-1', typeId: 'dev_pit', gridX: 0, gridY: 0, level: 1, condition: 100 },
        ],
        gridWidth: officeGridSizes.hacker_den.width,
        gridHeight: officeGridSizes.hacker_den.height,
        installedUpgrades: [
          { slotId: 'main_work', upgradeId: 'basic_desks', level: 1 },
        ],
      },
      competitors: initialCompetitors,
      shippedProducts: [],
      policy: 'balanced',
      unlockedTechnologies: [],
      unlockedProjectTypes: ['chatbot-basic'],
      fundingRound: 'none',
      companyPhase: 'startup',
      dailyChallenge: generateDailyChallenge(0),
      weeklyChallenge: generateWeeklyChallenge(0),
      dailyChallengeProgress: {},
      weeklyChallengeProgress: {},
      dailyChallengeDaySeed: 0,
      weeklyChallengeWeekSeed: 0,
      prestigeLevel: 0,
      legacyPoints: 0,
      activeEvent: null,
      eventHistory: [],
      totalProjectsCompleted: 0,
      totalContractsCompleted: 0,
      totalTrainingsDone: 0,
      totalDailyChallengesCompleted: 0,
      totalWeeklyChallengesCompleted: 0,
      daysPlayed: 0,
      totalRevenueEver: 0,
      revenueThisDay: 0,
      projectsCompletedThisDay: 0,
      revenueHistory: [],
      moraleHistory: [],
      reputationHistory: [],
      competitorNews: [],
    });
  },
}));
