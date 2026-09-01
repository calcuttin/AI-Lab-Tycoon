import { storyMilestones, type StoryMilestone } from '../data/characters';
import type { GameState } from './gameStore';

export function evaluateStoryTrigger(milestone: StoryMilestone, state: GameState): boolean {
  const { type, value } = milestone.triggerCondition;

  switch (type) {
    case 'money':
      return state.money >= value;
    case 'reputation':
      return state.reputation >= value;
    case 'employees':
      return state.employees.length >= value;
    case 'projects':
      return state.totalProjectsCompleted >= value;
    case 'research':
      return state.researchNodes.filter((node) => node.completed).length >= value;
    default:
      return false;
  }
}

export function findNextStoryMilestone(state: GameState): StoryMilestone | null {
  for (const milestone of storyMilestones) {
    if (state.triggeredStoryMilestones.includes(milestone.id)) continue;
    if (evaluateStoryTrigger(milestone, state)) return milestone;
  }
  return null;
}
