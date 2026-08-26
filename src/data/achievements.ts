export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: () => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-hire',
    title: 'First Steps',
    description: 'Hire your first employee',
    icon: '👤',
    unlocked: false,
    condition: () => {
      const employees = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').employees || [];
      return employees.length >= 1;
    },
  },
  {
    id: 'first-project',
    title: 'Project Manager',
    description: 'Start your first project',
    icon: '📁',
    unlocked: false,
    condition: () => {
      const projects = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').projects || [];
      return projects.length >= 1;
    },
  },
  {
    id: 'first-completion',
    title: 'Ship It!',
    description: 'Complete your first project',
    icon: '🚀',
    unlocked: false,
    condition: () => {
      // This would need to track completed projects
      return false;
    },
  },
  {
    id: '100k',
    title: 'Hundred Grand',
    description: 'Reach $100,000',
    icon: '💰',
    unlocked: false,
    condition: () => {
      const money = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').money || 0;
      return money >= 100000;
    },
  },
  {
    id: '500k',
    title: 'Half Million',
    description: 'Reach $500,000',
    icon: '💵',
    unlocked: false,
    condition: () => {
      const money = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').money || 0;
      return money >= 500000;
    },
  },
  {
    id: 'millionaire',
    title: 'Millionaire',
    description: 'Reach $1,000,000',
    icon: '💎',
    unlocked: false,
    condition: () => {
      const money = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').money || 0;
      return money >= 1000000;
    },
  },
  {
    id: 'team-5',
    title: 'Growing Team',
    description: 'Have 5 employees',
    icon: '👥',
    unlocked: false,
    condition: () => {
      const employees = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').employees || [];
      return employees.length >= 5;
    },
  },
  {
    id: 'team-10',
    title: 'Big Team',
    description: 'Have 10 employees',
    icon: '🏢',
    unlocked: false,
    condition: () => {
      const employees = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').employees || [];
      return employees.length >= 10;
    },
  },
  {
    id: 'reputation-50',
    title: 'Rising Star',
    description: 'Reach 50 reputation',
    icon: '⭐',
    unlocked: false,
    condition: () => {
      const reputation = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').reputation || 0;
      return reputation >= 50;
    },
  },
  {
    id: 'reputation-100',
    title: 'Industry Leader',
    description: 'Reach 100 reputation',
    icon: '🌟',
    unlocked: false,
    condition: () => {
      const reputation = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').reputation || 0;
      return reputation >= 100;
    },
  },
  {
    id: 'research-first',
    title: 'Researcher',
    description: 'Complete your first research',
    icon: '🔬',
    unlocked: false,
    condition: () => {
      const researchNodes = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').researchNodes || [];
      return researchNodes.some((node: any) => node.completed);
    },
  },
  {
    id: 'office-upgrade',
    title: 'Moving Up',
    description: 'Upgrade your office size',
    icon: '🏢',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return office.size !== 'hacker_den';
    },
  },
  {
    id: 'contract-master',
    title: 'Contract Master',
    description: 'Complete 5 contracts',
    icon: '📋',
    unlocked: false,
    condition: () => {
      // Track contract completions
      return false;
    },
  },
  {
    id: 'training-expert',
    title: 'Training Expert',
    description: 'Train 10 employees',
    icon: '🎓',
    unlocked: false,
    condition: () => {
      // Track training count
      return false;
    },
  },
  {
    id: 'research-master',
    title: 'Research Master',
    description: 'Complete all research nodes',
    icon: '🔬',
    unlocked: false,
    condition: () => {
      const researchNodes = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').researchNodes || [];
      return researchNodes.every((node: any) => node.completed);
    },
  },
  {
    id: 'team-leader',
    title: 'Team Leader',
    description: 'Have 20 employees',
    icon: '👥',
    unlocked: false,
    condition: () => {
      const employees = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').employees || [];
      return employees.length >= 20;
    },
  },
  {
    id: 'first-product',
    title: 'Productizer',
    description: 'Ship your first product',
    icon: '🛒',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'five-products',
    title: 'Product Line',
    description: 'Ship 5 products',
    icon: '📦',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'daily-challenge',
    title: 'Daily Grind',
    description: 'Complete a daily challenge',
    icon: '☀️',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'weekly-challenge',
    title: 'Week Warrior',
    description: 'Complete a weekly challenge',
    icon: '📅',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'phase-growth',
    title: 'Growth Stage',
    description: 'Reach Growth Stage company phase',
    icon: '📈',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'phase-unicorn',
    title: 'Unicorn',
    description: 'Reach Unicorn company phase',
    icon: '🦄',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'phase-legend',
    title: 'Legend',
    description: 'Reach Legend company phase',
    icon: '♾️',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'days-30',
    title: 'Month in the Lab',
    description: 'Play for 30 days',
    icon: '📆',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'days-100',
    title: 'Century',
    description: 'Play for 100 days',
    icon: '💯',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'projects-50',
    title: 'Shipping Machine',
    description: 'Complete 50 projects',
    icon: '🚀',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'revenue-1m',
    title: 'Revenue Millionaire',
    description: 'Earn $1M total revenue',
    icon: '💵',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'prestige',
    title: 'Prestige',
    description: 'Prestige once',
    icon: '🔄',
    unlocked: false,
    condition: () => false,
  },
  {
    id: 'legacy-100',
    title: 'Legacy Builder',
    description: 'Accumulate 100 Legacy Points',
    icon: '⭐',
    unlocked: false,
    condition: () => false,
  },
  // Room-related achievements
  {
    id: 'first-room',
    title: 'Interior Designer',
    description: 'Place your first room',
    icon: '🏗️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).length >= 1;
    },
  },
  {
    id: 'rooms-5',
    title: 'Office Planner',
    description: 'Place 5 rooms',
    icon: '📐',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).length >= 5;
    },
  },
  {
    id: 'rooms-10',
    title: 'Architect',
    description: 'Place 10 rooms',
    icon: '🏛️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).length >= 10;
    },
  },
  {
    id: 'rooms-20',
    title: 'Master Builder',
    description: 'Place 20 rooms',
    icon: '🌆',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).length >= 20;
    },
  },
  {
    id: 'room-upgrade',
    title: 'Room Renovator',
    description: 'Upgrade a room to level 2',
    icon: '⬆️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.level >= 2);
    },
  },
  {
    id: 'room-max-level',
    title: 'Perfection',
    description: 'Upgrade a room to level 3',
    icon: '✨',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.level >= 3);
    },
  },
  {
    id: 'room-dev-pit',
    title: 'Dev Den',
    description: 'Build a Dev Pit',
    icon: '💻',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.typeId === 'dev_pit');
    },
  },
  {
    id: 'room-server',
    title: 'Server Farm',
    description: 'Build a Server Room',
    icon: '🖥️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.typeId === 'server_room');
    },
  },
  {
    id: 'room-gym',
    title: 'Fitness First',
    description: 'Build a Fitness Center',
    icon: '🏋️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.typeId === 'gym');
    },
  },
  {
    id: 'room-exec',
    title: 'Corner Office',
    description: 'Build an Executive Office',
    icon: '👔',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.typeId === 'exec_office');
    },
  },
  {
    id: 'room-game',
    title: 'Recreational Activities',
    description: 'Build a Game Room',
    icon: '🎮',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return (office.rooms || []).some((r: any) => r.typeId === 'game_room');
    },
  },
  {
    id: 'room-variety',
    title: 'Diverse Workspace',
    description: 'Have 5 different room types',
    icon: '🎨',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      const rooms = office.rooms || [];
      const uniqueTypes = new Set(rooms.map((r: any) => r.typeId));
      return uniqueTypes.size >= 5;
    },
  },
  {
    id: 'room-all-types',
    title: 'Complete Office',
    description: 'Build every room type at least once',
    icon: '🏆',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      const rooms = office.rooms || [];
      const uniqueTypes = new Set(rooms.map((r: any) => r.typeId));
      // 13 total room types
      return uniqueTypes.size >= 13;
    },
  },
  {
    id: 'campus-full',
    title: 'Tech Campus',
    description: 'Reach Campus size with 20+ rooms',
    icon: '🏙️',
    unlocked: false,
    condition: () => {
      const office = JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}').office || {};
      return office.size === 'campus' && (office.rooms || []).length >= 20;
    },
  },
];
