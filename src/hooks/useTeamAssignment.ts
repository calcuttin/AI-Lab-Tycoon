import { useState, useCallback } from 'react';
import {
  calculateRoomBonuses,
  calculateUpgradeBonuses,
  computeCombinedBonuses,
  useGameStore,
} from '../store/gameStore';
import type { Project } from '../store/gameStore';
import { projectTypes } from '../data/projectTypes';
import { computeProjectDailyProgress } from '../store/projectProgress';

export interface TeamImpact {
  dailyProgress: number;
  qualityPerDay: number;
  morale: number;
  etaDays: number | null;
  expectedQuality: number;
}

export function useTeamAssignment(project: Project | null) {
  const employees = useGameStore((state) => state.employees);
  const projects = useGameStore((state) => state.projects);
  const policy = useGameStore((state) => state.policy);
  const office = useGameStore((state) => state.office);
  const updateProject = useGameStore((state) => state.updateProject);

  const [isExpanded, setIsExpanded] = useState(false);

  const type = project ? projectTypes.find((t) => t.id === project.type) : null;
  const teamMembers = project
    ? employees.filter((e) => project.team.includes(e.id))
    : [];
  const availableEmployees = project
    ? employees.filter(
        (e) =>
          !project.team.includes(e.id) &&
          !projects.some((p) => p.id !== project.id && p.team.includes(e.id))
      )
    : [];

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const addToTeam = useCallback(
    (employeeId: string) => {
      if (!project || !type || teamMembers.length >= type.maxTeamSize) return;
      updateProject(project.id, { team: [...project.team, employeeId] });
    },
    [project, type, teamMembers.length, updateProject]
  );

  const removeFromTeam = useCallback(
    (employeeId: string) => {
      if (!project) return;
      updateProject(project.id, {
        team: project.team.filter((id) => id !== employeeId),
      });
    },
    [project, updateProject]
  );

  const getTeamImpact = useCallback(
    (proj: Project): TeamImpact => {
      const team = employees.filter((e) => proj.team.includes(e.id));
      if (team.length === 0) {
        return {
          dailyProgress: 0,
          qualityPerDay: 0,
          morale: 0,
          etaDays: null,
          expectedQuality: proj.quality,
        };
      }

      const roomBonuses = calculateRoomBonuses(office.rooms);
      const slotBonuses = calculateUpgradeBonuses(office.installedUpgrades || []);
      const combinedBonuses = computeCombinedBonuses(roomBonuses, slotBonuses);
      const progress = computeProjectDailyProgress(
        proj,
        team,
        policy,
        office.upgrades.computers,
        combinedBonuses,
        roomBonuses,
      );
      const avgMorale = team.reduce((sum, employee) => sum + employee.morale, 0) / team.length;

      return {
        dailyProgress: progress.dailyProgress,
        qualityPerDay: progress.qualityPerDay,
        morale: avgMorale,
        etaDays: progress.etaDays,
        expectedQuality: progress.expectedQuality,
      };
    },
    [employees, office, policy],
  );

  return {
    type,
    teamMembers,
    availableEmployees,
    isExpanded,
    toggleExpand,
    addToTeam,
    removeFromTeam,
    getTeamImpact,
  };
}
