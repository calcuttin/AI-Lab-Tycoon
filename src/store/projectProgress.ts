import type { CombinedBonuses, Employee, Project } from './gameStore';
import type { RoomEffects } from '../data/roomTypes';

export interface ProjectProgressPreview {
  dailyProgress: number;
  qualityPerDay: number;
  etaDays: number | null;
  expectedQuality: number;
}

export function computeProjectDailyProgress(
  project: Project,
  team: Employee[],
  policy: 'balanced' | 'crunch' | 'wellness',
  computerBonusLevel: number,
  combinedBonuses: CombinedBonuses,
  roomBonuses: RoomEffects,
): ProjectProgressPreview {
  if (team.length === 0) {
    return {
      dailyProgress: 0,
      qualityPerDay: 0,
      etaDays: null,
      expectedQuality: project.quality,
    };
  }

  const totalDevSkill = team.reduce((sum, employee) => sum + employee.skills.development, 0);
  const totalResSkill = team.reduce((sum, employee) => sum + employee.skills.research, 0);
  const totalCreSkill = team.reduce((sum, employee) => sum + employee.skills.creativity, 0);
  const totalMgmtSkill = team.reduce((sum, employee) => sum + employee.skills.management, 0);
  const avgMorale = team.reduce((sum, employee) => sum + employee.morale, 0) / team.length;

  const baseOutput = totalDevSkill * 0.7 + totalMgmtSkill * 0.3;
  let dailyProgress = Math.max(1, Math.floor(baseOutput / team.length));

  const moraleMultiplier = 0.5 + (avgMorale / 100) * 0.5;
  dailyProgress = Math.floor(dailyProgress * moraleMultiplier);

  const policyProgressMultiplier = policy === 'crunch' ? 1.2 : policy === 'wellness' ? 0.9 : 1;
  dailyProgress = Math.floor(dailyProgress * policyProgressMultiplier);

  if (avgMorale < 40) {
    dailyProgress = Math.max(1, Math.floor(dailyProgress * 0.85));
  }

  const computerBonus = computerBonusLevel * 0.1;
  dailyProgress = Math.floor(dailyProgress * (1 + computerBonus));

  if (combinedBonuses.productivityBonus) {
    dailyProgress = Math.floor(dailyProgress * (1 + combinedBonuses.productivityBonus));
  }

  if (roomBonuses.teamworkBonus && team.length > 1) {
    dailyProgress = Math.floor(dailyProgress * (1 + roomBonuses.teamworkBonus));
  }

  if (project.complexity === 'complex' || project.complexity === 'revolutionary') {
    dailyProgress += Math.floor(totalResSkill / team.length / 2);
  }

  const qualityPerDay = Math.min(
    0.12,
    (totalCreSkill / team.length + (totalResSkill / team.length) * 0.6) / 120,
  );
  const remaining = Math.max(0, project.maxProgress - project.progress);
  const etaDays = dailyProgress > 0 ? Math.ceil(remaining / dailyProgress) : null;
  const expectedQuality = Math.min(10, project.quality + qualityPerDay * (etaDays || 0));

  return {
    dailyProgress,
    qualityPerDay,
    etaDays,
    expectedQuality,
  };
}
