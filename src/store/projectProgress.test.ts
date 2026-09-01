import { describe, expect, it } from 'vitest';
import { computeProjectDailyProgress } from './projectProgress';
import type { Employee, Project } from './gameStore';

const baseProject: Project = {
  id: 'p1',
  name: 'Test Bot',
  type: 'chatbot-basic',
  progress: 0,
  maxProgress: 100,
  quality: 5,
  complexity: 'simple',
  marketAppeal: 5,
  team: ['e1'],
};

const baseEmployee: Employee = {
  id: 'e1',
  name: 'Dev',
  role: 'engineer',
  skills: { research: 5, development: 50, creativity: 5, management: 10 },
  morale: 80,
  salary: 5000,
  traits: [],
};

const emptyBonuses = {
  productivityBonus: 0,
  moraleBonus: 0,
  researchBonus: 0,
  reputationBonus: 0,
  burnoutReduction: 0,
};

describe('computeProjectDailyProgress', () => {
  it('returns zero progress without a team', () => {
    const result = computeProjectDailyProgress(
      baseProject,
      [],
      'balanced',
      0,
      emptyBonuses,
      {},
    );
    expect(result.dailyProgress).toBe(0);
    expect(result.etaDays).toBeNull();
  });

  it('applies policy and office bonuses consistently', () => {
    const balanced = computeProjectDailyProgress(
      baseProject,
      [baseEmployee],
      'balanced',
      0,
      emptyBonuses,
      {},
    );
    const crunch = computeProjectDailyProgress(
      baseProject,
      [baseEmployee],
      'crunch',
      0,
      emptyBonuses,
      {},
    );
    const boosted = computeProjectDailyProgress(
      baseProject,
      [baseEmployee],
      'balanced',
      2,
      { ...emptyBonuses, productivityBonus: 0.2 },
      { teamworkBonus: 0.1 },
    );

    expect(crunch.dailyProgress).toBeGreaterThan(balanced.dailyProgress);
    expect(boosted.dailyProgress).toBeGreaterThan(balanced.dailyProgress);
    expect(boosted.etaDays).toBeLessThanOrEqual(balanced.etaDays ?? Number.MAX_SAFE_INTEGER);
  });
});
