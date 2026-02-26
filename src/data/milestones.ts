export type CompanyPhaseId =
  | 'startup'
  | 'growth'
  | 'scale'
  | 'unicorn'
  | 'empire'
  | 'legend';

export interface CompanyPhase {
  id: CompanyPhaseId;
  name: string;
  description: string;
  icon: string;
  requirement: {
    money?: number;
    reputation?: number;
    employees?: number;
    projectsCompleted?: number;
    researchCompleted?: number;
  };
  rewards: {
    unlockFunding?: boolean;
    passiveIncomeBonus?: number; // multiplier e.g. 1.1 = +10%
    reputationGain?: number;
  };
}

export const companyPhases: CompanyPhase[] = [
  {
    id: 'startup',
    name: 'Startup',
    description: 'Just getting started. Every empire begins here.',
    icon: '🌱',
    requirement: {},
    rewards: {},
  },
  {
    id: 'growth',
    name: 'Growth Stage',
    description: 'You have traction. Investors are starting to notice.',
    icon: '📈',
    requirement: { money: 250_000, reputation: 25, employees: 3, projectsCompleted: 3 },
    rewards: { unlockFunding: true, reputationGain: 10 },
  },
  {
    id: 'scale',
    name: 'Scale-Up',
    description: 'Scaling the team and the vision. The market is listening.',
    icon: '🚀',
    requirement: { money: 1_000_000, reputation: 75, employees: 10, projectsCompleted: 10 },
    rewards: { passiveIncomeBonus: 1.1, reputationGain: 15 },
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    description: '$1B+ valuation energy. You are the disruptor.',
    icon: '🦄',
    requirement: { money: 5_000_000, reputation: 150, employees: 25, projectsCompleted: 25 },
    rewards: { passiveIncomeBonus: 1.25, reputationGain: 25 },
  },
  {
    id: 'empire',
    name: 'Empire',
    description: 'Industry-defining. Your lab is the standard.',
    icon: '🏛️',
    requirement: { money: 25_000_000, reputation: 300, employees: 50, projectsCompleted: 50 },
    rewards: { passiveIncomeBonus: 1.5, reputationGain: 50 },
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'The endless frontier. There is no ceiling.',
    icon: '♾️',
    requirement: { money: 100_000_000, reputation: 500, employees: 100, projectsCompleted: 100 },
    rewards: { passiveIncomeBonus: 2, reputationGain: 100 },
  },
];
