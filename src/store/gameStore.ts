import { create } from 'zustand';
import { projectTypes } from '../data/projectTypes';
import { gameEvents } from '../data/events';
import { getInitialEmployees } from '../data/initialTeam';
import type { EventGameState, GameEvent } from '../data/events';
import { companyPhases, type CompanyPhaseId } from '../data/milestones';
import { generateDailyChallenge, generateWeeklyChallenge, type Challenge, type ChallengeGoalType } from '../data/challenges';
import { type RoomTypeId, getRoomTypeById, officeGridSizes, type OfficeSizeType, type RoomEffects } from '../data/roomTypes';
import { type InstalledUpgrade, type OfficeSizeId, getUpgradeById, calculateTotalEffects, getLayoutById } from '../data/officeLayouts';
import { playSound } from '../systems/audio';
import { emitNotification, showNotification, triggerParticleEffect } from '../systems/feedback';
import { computeProjectDailyProgress } from './projectProgress';
import { BALANCE } from '../data/balance';
import { getInitialContracts, type Contract } from '../data/contracts';
import { achievements } from '../data/achievements';
import { storyMilestones } from '../data/characters';

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

export interface DailyLog {
  date: string;
  revenue: number;
  expenses: number;
  projectsCompleted: number;
  events: string[];
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

export type CombinedBonuses = {
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

export function updateContractsForDay(
  contracts: Contract[],
  newDaysPlayed: number,
): { contracts: Contract[]; completedCount: number; revenue: number } {
  let completedCount = 0;
  let revenue = 0;

  const updatedContracts = contracts.map((contract) => {
    if (contract.status !== 'active' || contract.acceptedOnDay == null) return contract;

    const elapsedDays = newDaysPlayed - contract.acceptedOnDay;
    if (elapsedDays > contract.deadline) {
      return { ...contract, status: 'failed' as const };
    }

    const progress = contract.progress + 1;
    if (progress >= contract.workRequired) {
      completedCount += 1;
      revenue += contract.reward;
      return { ...contract, progress, status: 'completed' as const };
    }

    return { ...contract, progress };
  });

  return { contracts: updatedContracts, completedCount, revenue };
}

export function computeCombinedBonuses(_roomBonuses: RoomEffects, slotBonuses: SlotBonuses): CombinedBonuses {
  return {
    productivityBonus: slotBonuses.productivity || 0,
    moraleBonus: slotBonuses.morale || 0,
    researchBonus: slotBonuses.research || 0,
    reputationBonus: slotBonuses.reputation || 0,
    burnoutReduction: Math.min(0.8, slotBonuses.burnoutReduction || 0),
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
  state: EventGameState,
  rng: () => number = Math.random,
): RandomEventResult {
  if (activeEvent) return { eventTriggered: false, event: null };
  if (rng() >= 0.05) return { eventTriggered: false, event: null };

  const candidates = availableEvents.filter(e =>
    !eventHistory.includes(e.id) &&
    (!e.triggerCondition || e.triggerCondition(state))
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
      if (team.length === 0) return project;

      const progressPreview = computeProjectDailyProgress(
        project,
        team,
        state.policy,
        state.office.upgrades.computers,
        combinedBonuses,
        roomBonuses,
      );
      const progressGain = progressPreview.dailyProgress;
      const qualityIncrease = progressPreview.qualityPerDay;

      const totalMgmtSkill = team.reduce((sum, e) => sum + e.skills.management, 0);
      const avgMgmt = totalMgmtSkill / team.length;

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
        const baseRevenue = project.marketAppeal * BALANCE.projectRevenue.baseMultiplier;
        const qualityMultiplier = newQuality / 10;
        const teamSizeBonus = 1 + (team.length * BALANCE.projectRevenue.teamSizeBonusPerMember);
        revenue += Math.floor(baseRevenue * qualityMultiplier * teamSizeBonus);

        reputationGain += Math.floor(
          newQuality * BALANCE.projectRevenue.reputationPerQuality
          + project.marketAppeal * BALANCE.projectRevenue.reputationPerAppeal
          + (team.length * BALANCE.projectRevenue.reputationPerTeamMember),
        );

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

export interface GameState {
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
  contracts: Contract[];
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
  unlockedAchievements: string[];
  triggeredStoryMilestones: string[];
  dailyLogs: DailyLog[];
  monthlyReport: DailyLog | null;

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
  unlockAchievement: (achievementId: string) => boolean;
  claimStoryMilestone: (milestoneId: string, money: number, reputation: number) => boolean;
  dismissMonthlyReport: () => void;
  trainEmployee: (employeeId: string, skill: keyof Employee['skills']) => void;
  acceptContract: (contractId: string) => boolean;
  addLegacyPoints: (amount: number) => void;
  prestigeReset: () => void;
  initializeGame: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
}

export function isAchievementUnlocked(id: string, state: GameState): boolean {
  const rooms = state.office.rooms;
  const roomTypes = new Set(rooms.map((room) => room.typeId));
  const installedUpgrades = state.office.installedUpgrades ?? [];
  const upgradeIds = new Set(installedUpgrades.map((upgrade) => upgrade.upgradeId));

  switch (id) {
    case 'first-hire': return state.employees.length >= 1;
    case 'first-project': return state.projects.length >= 1;
    case 'first-completion': return state.totalProjectsCompleted >= 1;
    case '100k': return state.money >= 100_000;
    case '500k': return state.money >= 500_000;
    case 'millionaire': return state.money >= 1_000_000;
    case 'team-5': return state.employees.length >= 5;
    case 'team-10': return state.employees.length >= 10;
    case 'reputation-50': return state.reputation >= 50;
    case 'reputation-100': return state.reputation >= 100;
    case 'research-first': return state.researchNodes.some((node) => node.completed);
    case 'office-upgrade': return state.office.size !== 'hacker_den';
    case 'contract-master': return state.totalContractsCompleted >= 5;
    case 'training-expert': return state.totalTrainingsDone >= 10;
    case 'research-master':
      return state.researchNodes.length > 0 && state.researchNodes.every((node) => node.completed);
    case 'team-leader': return state.employees.length >= 20;
    case 'first-product': return state.shippedProducts.length >= 1;
    case 'five-products': return state.shippedProducts.length >= 5;
    case 'daily-challenge': return state.totalDailyChallengesCompleted >= 1;
    case 'weekly-challenge': return state.totalWeeklyChallengesCompleted >= 1;
    case 'phase-growth': return state.companyPhase !== 'startup';
    case 'phase-unicorn': return ['unicorn', 'empire', 'legend'].includes(state.companyPhase);
    case 'phase-legend': return state.companyPhase === 'legend';
    case 'days-30': return state.daysPlayed >= 30;
    case 'days-100': return state.daysPlayed >= 100;
    case 'projects-50': return state.totalProjectsCompleted >= 50;
    case 'revenue-1m': return state.totalRevenueEver >= 1_000_000;
    case 'prestige': return state.prestigeLevel >= 1;
    case 'legacy-100': return state.legacyPoints >= 100;
    case 'first-room': return installedUpgrades.length >= 1;
    case 'rooms-5': return installedUpgrades.length >= 5;
    case 'rooms-10': return installedUpgrades.length >= 10;
    case 'rooms-20': return installedUpgrades.length >= 20;
    case 'room-upgrade': return installedUpgrades.some((upgrade) => upgrade.level >= 2);
    case 'room-max-level': return installedUpgrades.some((upgrade) => upgrade.level >= 3);
    case 'room-dev-pit': return upgradeIds.has('basic_desks') || roomTypes.has('dev_pit');
    case 'room-server': return upgradeIds.has('server_room') || upgradeIds.has('server_closet') || roomTypes.has('server_room');
    case 'room-gym': return upgradeIds.has('gym_corner') || upgradeIds.has('full_gym') || roomTypes.has('gym');
    case 'room-exec': return upgradeIds.has('exec_office') || roomTypes.has('exec_office');
    case 'room-game': return upgradeIds.has('game_corner') || roomTypes.has('game_room');
    case 'room-variety': return new Set(installedUpgrades.map((upgrade) => upgrade.upgradeId)).size >= 5;
    case 'room-all-types': return new Set(installedUpgrades.map((upgrade) => upgrade.upgradeId)).size >= 8;
    case 'campus-full': return state.office.size === 'campus' && installedUpgrades.length >= 8;
    default: return false;
  }
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
  contracts: getInitialContracts(),
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
  unlockedAchievements: [],
  triggeredStoryMilestones: [],
  dailyLogs: [],
  monthlyReport: null,

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
    
    const newDaysPlayed = state.daysPlayed + 1;
    const contractResult = updateContractsForDay(state.contracts, newDaysPlayed);
    const newProducts = completedProjects.map((project) => ({
      id: `product-${project.id}`,
      name: project.name,
      dailyRevenue: Math.max(
        BALANCE.passiveIncome.minDailyRevenue,
        Math.floor((project.quality * project.marketAppeal) / BALANCE.passiveIncome.qualityAppealDivisor),
      ),
      unlockedAt: newDate.toISOString(),
    }));
    const dailyChallengeProgress = {
      ...state.dailyChallengeProgress,
      ship_products: (state.dailyChallengeProgress.ship_products ?? 0) + newProducts.length,
      complete_contracts:
        (state.dailyChallengeProgress.complete_contracts ?? 0) + contractResult.completedCount,
    };
    const weeklyChallengeProgress = {
      ...state.weeklyChallengeProgress,
      ship_products: (state.weeklyChallengeProgress.ship_products ?? 0) + newProducts.length,
      complete_contracts:
        (state.weeklyChallengeProgress.complete_contracts ?? 0) + contractResult.completedCount,
    };
    const financeResult = calculateDailyFinance(
      state,
      newDate,
      revenue + contractResult.revenue,
    );
    const { totalRevenue, dailyExpenses, newMoney } = financeResult;
    
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
    const avgMorale = updatedEmployees.length > 0
      ? updatedEmployees.reduce((s, e) => s + e.morale, 0) / updatedEmployees.length
      : 0;
    const challengeUpdate = updateChallengesForDay({
      dailyChallenge: state.dailyChallenge,
      weeklyChallenge: state.weeklyChallenge,
      dailyChallengeProgress,
      weeklyChallengeProgress,
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
      emitNotification(detail);
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
      emitNotification(phaseNotification);
    }
    // Add room reputation bonus
    const roomReputationGain = combinedBonuses.reputationBonus ?? 0;
    const newReputation = state.reputation + reputationGain + challengeRep + phaseRepBonus + roomReputationGain;
    
    // Competitor evolution (market share shifts + dynamic actions)
    const competitorResult = evolveCompetitors(state.competitors, newDaysPlayed, rng);
    const normalizedCompetitors = competitorResult.competitors;
    const newCompetitorNews = [...competitorResult.news, ...state.competitorNews].slice(0, 20);
    const dailyLog: DailyLog = {
      date: newDate.toISOString(),
      revenue: totalRevenue,
      expenses: dailyExpenses,
      projectsCompleted: completedProjects.length,
      events: [],
    };
    const isMonthlyRollover = newDate.getDate() === 1 && state.dailyLogs.length > 0;
    const monthlyReport = isMonthlyRollover
      ? {
          date: state.dailyLogs[0].date,
          revenue: state.dailyLogs.reduce((sum, log) => sum + log.revenue, 0),
          expenses: state.dailyLogs.reduce((sum, log) => sum + log.expenses, 0),
          projectsCompleted: state.dailyLogs.reduce((sum, log) => sum + log.projectsCompleted, 0),
          events: state.dailyLogs.flatMap((log) => log.events),
        }
      : state.monthlyReport;
    const dailyLogs = isMonthlyRollover ? [dailyLog] : [...state.dailyLogs, dailyLog];
    
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
      contracts: contractResult.contracts,
      shippedProducts: [...state.shippedProducts, ...newProducts],
      legacyPoints: state.legacyPoints + challengeLegacy,
      totalContractsCompleted: state.totalContractsCompleted + contractResult.completedCount,
      totalDailyChallengesCompleted: state.totalDailyChallengesCompleted + (dailyCompleted ? 1 : 0),
      totalWeeklyChallengesCompleted: state.totalWeeklyChallengesCompleted + (weeklyCompleted ? 1 : 0),
      revenueHistory: [...state.revenueHistory, totalRevenue].slice(-30),
      moraleHistory: [...state.moraleHistory, updatedEmployees.length > 0 ? updatedEmployees.reduce((s, e) => s + e.morale, 0) / updatedEmployees.length : 0].slice(-30),
      reputationHistory: [...state.reputationHistory, newReputation].slice(-30),
      dailyLogs,
      monthlyReport,
    });
    
    // Show notification for completed projects
    if (completedProjects.length > 0) {
      const projectNotifications = getProjectCompletionNotifications(completedProjects);
      projectNotifications.forEach((detail) => {
        emitNotification(detail);
      });
      // Trigger celebration particle effects and audio
      triggerParticleEffect('celebration', window.innerWidth / 2, window.innerHeight / 3);
      playSound('success');
    }

    // Sound & particles for challenge completion
    if (dailyCompleted || weeklyCompleted) {
      triggerParticleEffect('reputation', window.innerWidth / 2, 50);
      playSound('levelup');
    }

    // Money particles when revenue is positive
    if (totalRevenue > 0) {
      triggerParticleEffect('money', 200, 30);
    }
    
    // Check for random events (only if no active event)
    const updatedState = get();
    const randomEvent = pickRandomEvent(
      updatedState.activeEvent,
      updatedState.eventHistory,
      gameEvents,
      updatedState,
      rng
    );
    if (randomEvent.eventTriggered && randomEvent.event) {
      updatedState.triggerEvent(randomEvent.event);
    }

    get().saveGame();
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
      showNotification(`Not enough money! Need $${roomType.baseCost.toLocaleString()}`, 'error');
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
        showNotification(`Requires ${roomType.requirements.officeSize[0]} office or larger`, 'error');
        return false;
      }
    }
    
    // Check employee requirement
    if (roomType.requirements?.minEmployees && state.employees.length < roomType.requirements.minEmployees) {
      showNotification(`Requires at least ${roomType.requirements.minEmployees} employees`, 'error');
      return false;
    }
    
    // Check maxPerOffice limit
    if (roomType.maxPerOffice) {
      const existingCount = state.office.rooms.filter(r => r.typeId === typeId).length;
      if (existingCount >= roomType.maxPerOffice) {
        showNotification(`Maximum ${roomType.maxPerOffice} ${roomType.name}(s) per office`, 'error');
        return false;
      }
    }
    
    // Check bounds
    if (gridX < 0 || gridY < 0 ||
        gridX + roomType.size.width > state.office.gridWidth ||
        gridY + roomType.size.height > state.office.gridHeight) {
      showNotification('Room does not fit in that location', 'error');
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
          showNotification('Space is already occupied', 'error');
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
    
    showNotification(`${roomType.name} placed!`, 'success');
    
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
    
    showNotification(`Room removed. Refunded $${refund.toLocaleString()}`, 'info');
  },
  
  upgradeRoom: (roomId) => {
    const state = get();
    const room = state.office.rooms.find(r => r.id === roomId);
    if (!room) return false;
    
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType || !roomType.upgradable) {
      showNotification('This room cannot be upgraded', 'error');
      return false;
    }
    
    if (room.level >= 3) {
      showNotification('Room is already at maximum level', 'error');
      return false;
    }
    
    const upgradeCost = Math.floor(roomType.baseCost * (room.level * 0.75));
    if (state.money < upgradeCost) {
      showNotification(`Not enough money! Need $${upgradeCost.toLocaleString()}`, 'error');
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
    
    showNotification(`${roomType.name} upgraded to level ${room.level + 1}!`, 'success');
    
    return true;
  },
  
  // Slot-based upgrade system actions
  installUpgrade: (slotId, upgradeId) => {
    const state = get();
    const layout = getLayoutById(state.office.size);
    if (!layout) return false;
    
    const slot = layout.slots.find(s => s.id === slotId);
    if (!slot) {
      showNotification('Invalid slot', 'error');
      return false;
    }
    
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) {
      showNotification('Invalid upgrade', 'error');
      return false;
    }
    
    // Check if slot type matches
    if (upgrade.slotType !== slot.type) {
      showNotification(`This upgrade doesn't fit in a ${slot.type} slot`, 'error');
      return false;
    }
    
    // Check if already installed in this slot
    const existingUpgrade = state.office.installedUpgrades.find(u => u.slotId === slotId);
    if (existingUpgrade) {
      showNotification('Slot already has an upgrade. Remove it first.', 'error');
      return false;
    }
    
    // Check cost
    if (state.money < upgrade.cost) {
      showNotification(`Not enough money! Need $${upgrade.cost.toLocaleString()}`, 'error');
      return false;
    }
    
    // Check office size requirement
    if (upgrade.requiresOffice) {
      const sizeOrder: OfficeSizeId[] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
      const currentIndex = sizeOrder.indexOf(state.office.size);
      const requiredIndex = Math.min(...upgrade.requiresOffice.map(s => sizeOrder.indexOf(s)));
      if (currentIndex < requiredIndex) {
        showNotification(`Requires ${upgrade.requiresOffice[0]} office or larger`, 'error');
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
    
    showNotification(`${upgrade.name} installed!`, 'success');
    
    return true;
  },
  
  upgradeSlot: (slotId) => {
    const state = get();
    const installed = state.office.installedUpgrades.find(u => u.slotId === slotId);
    if (!installed) {
      showNotification('No upgrade installed in this slot', 'error');
      return false;
    }
    
    const upgrade = getUpgradeById(installed.upgradeId);
    if (!upgrade) return false;
    
    if (installed.level >= upgrade.maxLevel) {
      showNotification('Already at maximum level', 'error');
      return false;
    }
    
    const upgradeCost = Math.floor(upgrade.cost * (installed.level * 0.6));
    if (state.money < upgradeCost) {
      showNotification(`Not enough money! Need $${upgradeCost.toLocaleString()}`, 'error');
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
    
    showNotification(`${upgrade.name} upgraded to level ${installed.level + 1}!`, 'success');
    
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
    
    showNotification(`Upgrade removed. Refunded $${refund.toLocaleString()}`, 'info');
  },
  
  triggerEvent: (event) => {
    const state = get();
    if (state.activeEvent) return; // Don't trigger if event already active
    
    if (event.triggerCondition && !event.triggerCondition(state)) return;
    
    set({ activeEvent: event });
  },
  
  handleEventChoice: (eventId, choiceId) => {
    const state = get();
    const event = state.activeEvent;
    if (!event || event.id !== eventId) return;
    
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    const firedEmployeeId = choice.effects.fireEmployee && state.employees.length > 0
      ? state.employees[Math.floor(Math.random() * state.employees.length)].id
      : null;
    const remainingEmployees = firedEmployeeId
      ? state.employees.filter((employee) => employee.id !== firedEmployeeId)
      : state.employees;
    const employees = choice.effects.boostMorale
      ? remainingEmployees.map((employee) => ({
          ...employee,
          morale: Math.max(0, Math.min(100, employee.morale + choice.effects.boostMorale!)),
        }))
      : remainingEmployees;

    set((current) => ({
      money: current.money + (choice.effects.money ?? 0),
      reputation: current.reputation + (choice.effects.reputation ?? 0),
      researchPoints: current.researchPoints + (choice.effects.researchPoints ?? 0),
      unlockedTechnologies: Array.from(new Set([
        ...current.unlockedTechnologies,
        ...(choice.effects.unlockTech ?? []),
      ])),
      unlockedProjectTypes: Array.from(new Set([
        ...current.unlockedProjectTypes,
        ...(choice.effects.unlockProject ?? []),
      ])),
      employees,
      activeEvent: null,
      eventHistory: Array.from(new Set([...current.eventHistory, eventId])),
    }));
  },

  unlockAchievement: (achievementId) => {
    if (get().unlockedAchievements.includes(achievementId)) return false;
    set((current) => ({
      unlockedAchievements: [...current.unlockedAchievements, achievementId],
    }));
    return true;
  },

  claimStoryMilestone: (milestoneId, money, reputation) => {
    if (get().triggeredStoryMilestones.includes(milestoneId)) return false;
    set((current) => ({
      triggeredStoryMilestones: [...current.triggeredStoryMilestones, milestoneId],
      money: current.money + money,
      reputation: current.reputation + reputation,
    }));
    return true;
  },

  dismissMonthlyReport: () => set({ monthlyReport: null }),
  
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
  
  acceptContract: (contractId) => {
    const state = get();
    const contract = state.contracts.find((candidate) => candidate.id === contractId);
    if (
      !contract ||
      contract.status !== 'available' ||
      state.contracts.some((candidate) => candidate.status === 'active')
    ) return false;

    const skills = state.employees.reduce(
      (totals, employee) => ({
        development: totals.development + employee.skills.development,
        research: totals.research + employee.skills.research,
        creativity: totals.creativity + employee.skills.creativity,
      }),
      { development: 0, research: 0, creativity: 0 },
    );
    const meetsRequirements =
      skills.development >= contract.requiredSkills.development &&
      skills.research >= contract.requiredSkills.research &&
      skills.creativity >= contract.requiredSkills.creativity;
    if (!meetsRequirements) return false;

    set({
      contracts: state.contracts.map((candidate) =>
        candidate.id === contractId
          ? { ...candidate, status: 'active', acceptedOnDay: state.daysPlayed, progress: 0 }
          : candidate
      ),
    });
    return true;
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
      unlockedAchievements: state.unlockedAchievements,
      dailyChallenge: generateDailyChallenge(0),
      weeklyChallenge: generateWeeklyChallenge(0),
    });
    showNotification(`🔄 Prestige! +${legacyGain} Legacy. New run with ${Math.floor((bonusMultiplier - 1) * 100)}% cash bonus.`, 'success', 6000);
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
      contracts: state.contracts,
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
      competitorNews: state.competitorNews,
      revenueThisDay: state.revenueThisDay,
      projectsCompletedThisDay: state.projectsCompletedThisDay,
      unlockedAchievements: state.unlockedAchievements,
      triggeredStoryMilestones: state.triggeredStoryMilestones,
      dailyLogs: state.dailyLogs,
      monthlyReport: state.monthlyReport,
      version: '1.2',
      savedAt: new Date().toISOString(),
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
          // Legacy grid rooms are preserved for old saves but no longer seeded by default.
          rooms: data.office?.rooms ?? [],
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
        contracts: data.contracts ?? getInitialContracts(),
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
        unlockedAchievements: data.unlockedAchievements ?? [],
        triggeredStoryMilestones: data.triggeredStoryMilestones ?? [],
        dailyLogs: data.dailyLogs ?? [],
        monthlyReport: data.monthlyReport ?? null,
      });

      const loadedState = get();
      if (!Array.isArray(data.unlockedAchievements)) {
        set({
          unlockedAchievements: achievements
            .filter((achievement) => isAchievementUnlocked(achievement.id, loadedState))
            .map((achievement) => achievement.id),
        });
      }
      if (!Array.isArray(data.triggeredStoryMilestones)) {
        set({
          triggeredStoryMilestones: storyMilestones
            .filter((milestone) => {
              const { type, value } = milestone.triggerCondition;
              if (type === 'money') return loadedState.money >= value;
              if (type === 'reputation') return loadedState.reputation >= value;
              if (type === 'employees') return loadedState.employees.length >= value;
              if (type === 'projects') return loadedState.totalProjectsCompleted >= value;
              if (type === 'research') {
                return loadedState.researchNodes.filter((node) => node.completed).length >= value;
              }
              return false;
            })
            .map((milestone) => milestone.id),
        });
      }
      
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
        rooms: [],
        gridWidth: officeGridSizes.hacker_den.width,
        gridHeight: officeGridSizes.hacker_den.height,
        installedUpgrades: [
          { slotId: 'main_work', upgradeId: 'basic_desks', level: 1 },
        ],
      },
      competitors: initialCompetitors,
      shippedProducts: [],
      contracts: getInitialContracts(),
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
      unlockedAchievements: [],
      triggeredStoryMilestones: [],
      dailyLogs: [],
      monthlyReport: null,
    });
  },
}));
