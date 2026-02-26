import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Project } from '../store/gameStore';
import { projectTypes } from '../data/projectTypes';

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
  const updateProject = useGameStore((state) => state.updateProject);

  const [isExpanded, setIsExpanded] = useState(false);

  const type = project ? projectTypes.find((t) => t.id === project.type) : null;
  const teamMembers = project
    ? employees.filter((e) => project.team.includes(e.id))
    : [];
  // One project per employee: only show employees not on this project AND not on any other project
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
      const totalDev = team.reduce((sum, e) => sum + e.skills.development, 0);
      const totalRes = team.reduce((sum, e) => sum + e.skills.research, 0);
      const totalCre = team.reduce((sum, e) => sum + e.skills.creativity, 0);
      const totalMgmt = team.reduce((sum, e) => sum + e.skills.management, 0);
      const avgMorale = team.reduce((sum, e) => sum + e.morale, 0) / team.length;

      let baseOutput = totalDev * 0.7 + totalMgmt * 0.3;
      let dailyProgress = Math.max(1, Math.floor(baseOutput / team.length));
      const moraleMultiplier = 0.5 + (avgMorale / 100) * 0.5;
      dailyProgress = Math.floor(dailyProgress * moraleMultiplier);
      if (avgMorale < 40) {
        dailyProgress = Math.max(1, Math.floor(dailyProgress * 0.85));
      }
      if (proj.complexity === 'complex' || proj.complexity === 'revolutionary') {
        dailyProgress += Math.floor(totalRes / team.length / 2);
      }

      const qualityPerDay = Math.min(
        0.12,
        (totalCre / team.length + (totalRes / team.length) * 0.6) / 120
      );
      const remaining = Math.max(0, proj.maxProgress - proj.progress);
      const etaDays = dailyProgress > 0 ? Math.ceil(remaining / dailyProgress) : null;
      const expectedQuality = Math.min(
        10,
        proj.quality + qualityPerDay * (etaDays || 0)
      );

      return {
        dailyProgress,
        qualityPerDay,
        morale: avgMorale,
        etaDays,
        expectedQuality,
      };
    },
    [employees]
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
