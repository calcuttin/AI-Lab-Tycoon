/** Central economy tuning knobs for projects, passive income, and contracts. */

export const BALANCE = {
  projectRevenue: {
    baseMultiplier: 1000,
    teamSizeBonusPerMember: 0.05,
    reputationPerQuality: 2,
    reputationPerAppeal: 1,
    reputationPerTeamMember: 0.5,
  },
  passiveIncome: {
    minDailyRevenue: 25,
    qualityAppealDivisor: 2,
  },
  office: {
    computerProductivityPerLevel: 0.1,
    coffeeMoralePerLevel: 0.5,
    napPodMoralePerLevel: 1,
  },
  morale: {
    lowMoraleThreshold: 40,
    lowMoraleProgressPenalty: 0.85,
    criticalMoraleThreshold: 30,
  },
} as const;
