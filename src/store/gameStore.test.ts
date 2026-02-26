import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyEmployeeMoraleForDay,
  calculateDailyFinance,
  computeCombinedBonuses,
  computePhaseTransition,
  getChallengeNotifications,
  getPhaseNotification,
  getProjectCompletionNotifications,
  evolveCompetitors,
  pickRandomEvent,
  updateChallengesForDay,
  useGameStore,
  type Employee,
  type Project,
  type ResearchNode,
} from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().initializeGame();
  });

  it('saves and loads core state', () => {
    useGameStore.setState({ money: 12345, reputation: 42 });
    useGameStore.getState().saveGame();

    useGameStore.setState({ money: 0, reputation: 0 });
    const loaded = useGameStore.getState().loadGame();

    expect(loaded).toBe(true);
    const state = useGameStore.getState();
    expect(state.money).toBe(12345);
    expect(state.reputation).toBe(42);
  });

  it('advanceDay updates employees immutably', () => {
    const employee: Employee = {
      id: 'emp-1',
      name: 'Test Employee',
      role: 'engineer',
      skills: { research: 1, development: 5, creativity: 2, management: 0 },
      salary: 1000,
      morale: 50,
      traits: [],
    };

    const project: Project = {
      id: 'proj-1',
      name: 'Test Project',
      type: 'chatbot-basic',
      complexity: 'simple',
      progress: 0,
      maxProgress: 10,
      team: [employee.id],
      quality: 1,
      marketAppeal: 5,
    };

    const office = useGameStore.getState().office;
    useGameStore.setState({
      isPaused: false,
      employees: [employee],
      projects: [project],
      office: {
        ...office,
        rooms: [],
        installedUpgrades: [],
        upgrades: { computers: 0, coffeeMachines: 0, serverRacks: 0, meetingRooms: 0, napPods: 0 },
      },
    });

    const prevEmployee = useGameStore.getState().employees[0];
    const prevMorale = prevEmployee.morale;

    useGameStore.getState().advanceDay();

    const nextEmployee = useGameStore.getState().employees[0];
    expect(nextEmployee).not.toBe(prevEmployee);
    expect(prevEmployee.morale).toBe(prevMorale);
  });

  it('unlocks research nodes immutably on completed research', () => {
    const nodes: ResearchNode[] = [
      {
        id: 'r1',
        name: 'R1',
        description: 'Root',
        cost: 0,
        timeRequired: 1,
        progress: 1,
        unlocked: true,
        completed: true,
        prerequisites: [],
        unlocks: ['r2'],
      },
      {
        id: 'r2',
        name: 'R2',
        description: 'Child',
        cost: 0,
        timeRequired: 1,
        progress: 0,
        unlocked: false,
        completed: false,
        prerequisites: ['r1'],
        unlocks: [],
      },
    ];

    useGameStore.setState({
      isPaused: false,
      researchNodes: nodes,
      unlockedTechnologies: [],
      employees: [
        {
          id: 'res-1',
          name: 'Researcher',
          role: 'researcher',
          skills: { research: 5, development: 1, creativity: 1, management: 0 },
          salary: 1000,
          morale: 80,
          traits: [],
        },
      ],
      projects: [],
    });

    const prevNodes = useGameStore.getState().researchNodes;
    useGameStore.getState().advanceDay();
    const nextNodes = useGameStore.getState().researchNodes;

    expect(nextNodes).not.toBe(prevNodes);
    const unlocked = nextNodes.find((n) => n.id === 'r2');
    expect(unlocked?.unlocked).toBe(true);
  });

  it('computes combined bonuses from room and slot effects', () => {
    const combined = computeCombinedBonuses(
      {
        productivityBonus: 0.1,
        moraleBonus: 0.2,
        researchBonus: 0.05,
        reputationBonus: 0.1,
        capacityBonus: 0,
        burnoutReduction: 0.2,
        teamworkBonus: 0,
        eventBonus: 0,
      },
      {
        productivity: 0.1,
        morale: 0.1,
        research: 0,
        reputation: 0.05,
        capacity: 0,
        burnoutReduction: 0.1,
      }
    );

    expect(combined.productivityBonus).toBeCloseTo(0.2);
    expect(combined.moraleBonus).toBeCloseTo(0.3);
    expect(combined.reputationBonus).toBeCloseTo(0.15);
    expect(combined.burnoutReduction).toBeCloseTo(0.3);
  });

  it('applies employee morale deltas and office bonuses', () => {
    const employees: Employee[] = [
      {
        id: 'emp-1',
        name: 'Test',
        role: 'engineer',
        skills: { research: 1, development: 1, creativity: 1, management: 1 },
        salary: 1000,
        morale: 60,
        traits: [],
      },
    ];
    const deltas = new Map<string, number>([['emp-1', -5]]);
    const office = useGameStore.getState().office;
    const updated = applyEmployeeMoraleForDay(
      employees,
      deltas,
      {
        ...office,
        upgrades: { ...office.upgrades, coffeeMachines: 2, napPods: 0 },
      },
      {
        productivityBonus: 0,
        moraleBonus: 2,
        researchBonus: 0,
        reputationBonus: 0,
        burnoutReduction: 0,
      },
      () => 1
    );

    expect(updated[0].morale).toBe(60 - 5 + 1 + 2);
  });

  it('calculates daily finances with salaries on first of month', () => {
    const state = useGameStore.getState();
    const newDate = new Date(state.currentDate);
    newDate.setDate(1);
    const result = calculateDailyFinance(state, newDate, 1000);

    const expectedSalaries = state.employees.reduce((sum, e) => sum + e.salary, 0);
    expect(result.isFirstOfMonth).toBe(true);
    expect(result.dailyExpenses).toBe(expectedSalaries + state.office.rent);
    expect(result.totalRevenue).toBeGreaterThanOrEqual(1000);
  });

  it('computes phase transition when requirements are met', () => {
    const result = computePhaseTransition(
      'startup',
      1000000,
      1000,
      20,
      50,
      5,
      10
    );
    expect(result.nextPhase).not.toBe('startup');
  });

  it('updates daily challenge and rewards when completed', () => {
    const input = {
      dailyChallenge: {
        id: 'daily-1',
        type: 'daily' as const,
        title: 'Daily',
        description: 'Test daily challenge',
        icon: '💰',
        goalType: 'earn_money' as const,
        target: 100,
        rewardMoney: 50,
        rewardReputation: 5,
      },
      weeklyChallenge: null,
      dailyChallengeProgress: {},
      weeklyChallengeProgress: {},
      daysPlayed: 0,
      completedProjects: 0,
      totalRevenue: 120,
      avgMorale: 50,
      completedResearch: 0,
    };
    const result = updateChallengesForDay(input);
    expect(result.challengeMoney).toBe(50);
    expect(result.challengeRep).toBe(5);
    expect(result.dailyCompleted).toBe(true);
    expect(result.dailyChallengeProgress).toEqual({});
  });

  it('picks a random event when eligible', () => {
    const result = pickRandomEvent(
      null,
      [],
      [
        {
          id: 'event-1',
          title: 'Event',
          description: 'Test',
          probability: 1,
          choices: [],
        },
      ],
      () => 0
    );
    expect(result.eventTriggered).toBe(true);
    expect(result.event?.id).toBe('event-1');
  });

  it('handles weekly rollover and seed updates', () => {
    const result = updateChallengesForDay({
      dailyChallenge: null,
      weeklyChallenge: {
        id: 'weekly-1',
        type: 'weekly' as const,
        title: 'Weekly',
        description: 'Test weekly challenge',
        icon: '📋',
        goalType: 'complete_projects' as const,
        target: 10,
        rewardMoney: 100,
        rewardReputation: 10,
        rewardLegacy: 1,
      },
      dailyChallengeProgress: {},
      weeklyChallengeProgress: { complete_projects: 0 },
      daysPlayed: 6,
      completedProjects: 0,
      totalRevenue: 0,
      avgMorale: 0,
      completedResearch: 0,
    });

    expect(result.weeklyChallenge).not.toBeNull();
    expect(result.weeklyChallengeWeekSeed).toBe(1);
    expect(result.weeklyChallengeProgress).toEqual({});
  });

  it('builds notification payloads for challenges and phase', () => {
    const challengeNotifications = getChallengeNotifications(
      true,
      true,
      {
        id: 'daily-1',
        type: 'daily' as const,
        title: 'Daily',
        description: 'Test daily',
        icon: '💰',
        goalType: 'earn_money' as const,
        target: 100,
        rewardMoney: 50,
        rewardReputation: 5,
      },
      {
        id: 'weekly-1',
        type: 'weekly' as const,
        title: 'Weekly',
        description: 'Test weekly',
        icon: '📋',
        goalType: 'complete_projects' as const,
        target: 5,
        rewardMoney: 200,
        rewardReputation: 20,
        rewardLegacy: 2,
      }
    );
    expect(challengeNotifications.length).toBe(2);

    const phaseNotification = getPhaseNotification('Growth Stage');
    expect(phaseNotification?.message).toContain('Growth Stage');
  });

  it('builds project completion notifications', () => {
    const notifications = getProjectCompletionNotifications([
      {
        id: 'p1',
        name: 'Ship It',
        type: 'chatbot-basic',
        complexity: 'simple',
        progress: 10,
        maxProgress: 10,
        team: [],
        quality: 10,
        marketAppeal: 5,
      },
    ]);
    expect(notifications[0].message).toContain('Ship It');
  });

  it('evolves competitors deterministically with RNG', () => {
    const competitors = [
      {
        id: 'c1',
        name: 'Comp',
        tagline: 'Test',
        marketShare: 10,
        reputation: 50,
        recentActivity: [],
      },
    ];
    const result = evolveCompetitors(competitors, 1, () => 1);
    expect(result.competitors[0].marketShare).toBeGreaterThan(competitors[0].marketShare);
  });
});
