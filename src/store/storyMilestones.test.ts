import { describe, expect, it } from 'vitest';
import { evaluateStoryTrigger, findNextStoryMilestone } from './storyMilestones';
import type { GameState } from './gameStore';
import { storyMilestones } from '../data/characters';

const baseState = {
  money: 0,
  reputation: 0,
  employees: [],
  totalProjectsCompleted: 0,
  researchNodes: [],
  triggeredStoryMilestones: [],
} as unknown as GameState;

describe('storyMilestones', () => {
  it('evaluates project and research triggers', () => {
    const shipMilestone = storyMilestones.find((milestone) => milestone.id === 'first-ship')!;
    const researchMilestone = storyMilestones.find((milestone) => milestone.id === 'first-research')!;

    expect(evaluateStoryTrigger(shipMilestone, { ...baseState, totalProjectsCompleted: 1 })).toBe(true);
    expect(
      evaluateStoryTrigger(researchMilestone, {
        ...baseState,
        researchNodes: [{ completed: true } as GameState['researchNodes'][number]],
      }),
    ).toBe(true);
  });

  it('returns the first untriggered milestone in order', () => {
    const next = findNextStoryMilestone({
      ...baseState,
      money: 0,
    });
    expect(next?.id).toBe('first-steps');
  });
});
