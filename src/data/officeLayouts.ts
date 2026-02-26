// Office layouts with designated upgrade slots
// Each office size has a static layout with specific spots for upgrades

export type OfficeSizeId = 'hacker_den' | 'small' | 'medium' | 'large' | 'campus';

export type UpgradeSlotType = 
  | 'workstation'    // Desks, computers
  | 'amenity'        // Break room, kitchen, games
  | 'infrastructure' // Servers, meeting rooms
  | 'wellness'       // Gym, meditation, nap pods
  | 'executive'      // Exec offices, lobby
  | 'utility';       // Storage, closets

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  slotType: UpgradeSlotType;
  effects: {
    productivity?: number;      // % bonus
    morale?: number;            // Daily gain
    research?: number;          // % bonus
    reputation?: number;        // Daily gain
    capacity?: number;          // Extra desk slots
    burnoutReduction?: number;  // 0-1
  };
  maxLevel: number;
  requiresOffice?: OfficeSizeId[];  // Minimum office size
  requiresEmployees?: number;
}

export interface UpgradeSlot {
  id: string;
  type: UpgradeSlotType;
  name: string;
  x: number;  // Percentage position
  y: number;
  width: number;   // Percentage width
  height: number;  // Percentage height
  unlockedAt?: OfficeSizeId;  // When this slot becomes available
}

export interface InstalledUpgrade {
  slotId: string;
  upgradeId: string;
  level: number;
}

export interface OfficeLayout {
  id: OfficeSizeId;
  name: string;
  description: string;
  backgroundStyle: string;
  slots: UpgradeSlot[];
  baseCapacity: number;  // How many employees can work here
  baseRent: number;
  upgradeCost: number;   // Cost to upgrade to this size
}

// Available upgrades that can be installed in slots
export const upgradeOptions: UpgradeOption[] = [
  // Workstation upgrades
  {
    id: 'basic_desks',
    name: 'Basic Desks',
    description: 'Simple desks with standard computers',
    icon: '🖥️',
    cost: 2000,
    slotType: 'workstation',
    effects: { productivity: 0.05, capacity: 2 },
    maxLevel: 1,
  },
  {
    id: 'dev_workstations',
    name: 'Dev Workstations',
    description: 'High-end dual-monitor setups for developers',
    icon: '💻',
    cost: 5000,
    slotType: 'workstation',
    effects: { productivity: 0.15, capacity: 3 },
    maxLevel: 3,
  },
  {
    id: 'standing_desks',
    name: 'Standing Desks',
    description: 'Ergonomic standing desks with monitor arms',
    icon: '🧍',
    cost: 8000,
    slotType: 'workstation',
    effects: { productivity: 0.12, morale: 1, capacity: 2 },
    maxLevel: 3,
  },
  {
    id: 'pod_workstations',
    name: 'Focus Pods',
    description: 'Private pods for deep work and concentration',
    icon: '🎧',
    cost: 12000,
    slotType: 'workstation',
    effects: { productivity: 0.20, research: 0.10 },
    maxLevel: 2,
    requiresOffice: ['medium', 'large', 'campus'],
  },

  // Amenity upgrades
  {
    id: 'coffee_corner',
    name: 'Coffee Corner',
    description: 'Basic coffee machine and snacks',
    icon: '☕',
    cost: 1500,
    slotType: 'amenity',
    effects: { morale: 2 },
    maxLevel: 3,
  },
  {
    id: 'snack_bar',
    name: 'Snack Bar',
    description: 'Fully stocked snack bar with drinks',
    icon: '🍿',
    cost: 3000,
    slotType: 'amenity',
    effects: { morale: 3 },
    maxLevel: 2,
  },
  {
    id: 'game_corner',
    name: 'Game Corner',
    description: 'Ping pong, foosball, and video games',
    icon: '🎮',
    cost: 6000,
    slotType: 'amenity',
    effects: { morale: 4, burnoutReduction: 0.15 },
    maxLevel: 2,
    requiresOffice: ['small', 'medium', 'large', 'campus'],
  },
  {
    id: 'full_kitchen',
    name: 'Full Kitchen',
    description: 'Complete kitchen with appliances and seating',
    icon: '🍳',
    cost: 15000,
    slotType: 'amenity',
    effects: { morale: 5, burnoutReduction: 0.25 },
    maxLevel: 2,
    requiresOffice: ['medium', 'large', 'campus'],
  },

  // Infrastructure upgrades
  {
    id: 'server_closet',
    name: 'Server Closet',
    description: 'Basic server rack for local computing',
    icon: '🖥️',
    cost: 5000,
    slotType: 'infrastructure',
    effects: { research: 0.10 },
    maxLevel: 3,
  },
  {
    id: 'server_room',
    name: 'Server Room',
    description: 'Climate-controlled server room',
    icon: '🏭',
    cost: 20000,
    slotType: 'infrastructure',
    effects: { research: 0.25, productivity: 0.05 },
    maxLevel: 3,
    requiresOffice: ['medium', 'large', 'campus'],
  },
  {
    id: 'meeting_booth',
    name: 'Meeting Booth',
    description: 'Small phone booth for calls',
    icon: '📞',
    cost: 2000,
    slotType: 'infrastructure',
    effects: { productivity: 0.05 },
    maxLevel: 2,
  },
  {
    id: 'conference_room',
    name: 'Conference Room',
    description: 'Professional meeting room with AV equipment',
    icon: '📊',
    cost: 10000,
    slotType: 'infrastructure',
    effects: { productivity: 0.10, reputation: 0.5 },
    maxLevel: 2,
    requiresOffice: ['small', 'medium', 'large', 'campus'],
  },

  // Wellness upgrades
  {
    id: 'nap_corner',
    name: 'Nap Corner',
    description: 'Cozy corner with bean bags for power naps',
    icon: '😴',
    cost: 2000,
    slotType: 'wellness',
    effects: { burnoutReduction: 0.20, morale: 1 },
    maxLevel: 2,
  },
  {
    id: 'meditation_space',
    name: 'Meditation Space',
    description: 'Quiet area for mindfulness and relaxation',
    icon: '🧘',
    cost: 5000,
    slotType: 'wellness',
    effects: { burnoutReduction: 0.30, morale: 2 },
    maxLevel: 2,
  },
  {
    id: 'gym_corner',
    name: 'Fitness Corner',
    description: 'Basic exercise equipment',
    icon: '🏋️',
    cost: 8000,
    slotType: 'wellness',
    effects: { morale: 3, burnoutReduction: 0.15 },
    maxLevel: 2,
    requiresOffice: ['medium', 'large', 'campus'],
  },
  {
    id: 'full_gym',
    name: 'Full Gym',
    description: 'Complete fitness center with showers',
    icon: '💪',
    cost: 25000,
    slotType: 'wellness',
    effects: { morale: 5, burnoutReduction: 0.35 },
    maxLevel: 2,
    requiresOffice: ['large', 'campus'],
  },

  // Executive upgrades
  {
    id: 'reception_desk',
    name: 'Reception Desk',
    description: 'Professional front desk for visitors',
    icon: '🛎️',
    cost: 5000,
    slotType: 'executive',
    effects: { reputation: 1 },
    maxLevel: 2,
    requiresOffice: ['small', 'medium', 'large', 'campus'],
  },
  {
    id: 'exec_office',
    name: 'Executive Office',
    description: 'Corner office for leadership',
    icon: '👔',
    cost: 15000,
    slotType: 'executive',
    effects: { reputation: 2, morale: 1 },
    maxLevel: 2,
    requiresOffice: ['medium', 'large', 'campus'],
  },
  {
    id: 'lobby',
    name: 'Impressive Lobby',
    description: 'Grand lobby that impresses visitors',
    icon: '🏛️',
    cost: 30000,
    slotType: 'executive',
    effects: { reputation: 3 },
    maxLevel: 2,
    requiresOffice: ['large', 'campus'],
  },

  // Utility upgrades
  {
    id: 'storage_closet',
    name: 'Storage Closet',
    description: 'Basic storage for equipment',
    icon: '📦',
    cost: 1000,
    slotType: 'utility',
    effects: {},
    maxLevel: 1,
  },
  {
    id: 'it_closet',
    name: 'IT Closet',
    description: 'Network equipment and backups',
    icon: '🔌',
    cost: 3000,
    slotType: 'utility',
    effects: { productivity: 0.03 },
    maxLevel: 2,
  },
];

// Office layouts with their upgrade slots
export const officeLayouts: OfficeLayout[] = [
  {
    id: 'hacker_den',
    name: 'Hacker Den',
    description: 'A cramped garage/basement setup. The classic startup origin story.',
    backgroundStyle: 'hacker',
    baseCapacity: 4,
    baseRent: 500,
    upgradeCost: 0,
    slots: [
      { id: 'main_work', type: 'workstation', name: 'Main Work Area', x: 10, y: 25, width: 40, height: 45 },
      { id: 'corner_1', type: 'amenity', name: 'Corner Space', x: 55, y: 20, width: 30, height: 30 },
      { id: 'closet', type: 'utility', name: 'Closet', x: 55, y: 55, width: 30, height: 30 },
    ],
  },
  {
    id: 'small',
    name: 'Small Office',
    description: 'A proper office space in a shared building. Room to grow.',
    backgroundStyle: 'office',
    baseCapacity: 8,
    baseRent: 1500,
    upgradeCost: 10000,
    slots: [
      { id: 'main_work', type: 'workstation', name: 'Main Work Area', x: 10, y: 25, width: 35, height: 35 },
      { id: 'secondary_work', type: 'workstation', name: 'Secondary Desks', x: 10, y: 65, width: 30, height: 25 },
      { id: 'break_area', type: 'amenity', name: 'Break Area', x: 55, y: 20, width: 25, height: 25 },
      { id: 'meeting', type: 'infrastructure', name: 'Meeting Space', x: 55, y: 50, width: 25, height: 25 },
      { id: 'entrance', type: 'executive', name: 'Entrance', x: 55, y: 80, width: 30, height: 15, unlockedAt: 'small' },
    ],
  },
  {
    id: 'medium',
    name: 'Medium Office',
    description: 'A full floor in a tech building. Starting to look legit.',
    backgroundStyle: 'modern',
    baseCapacity: 15,
    baseRent: 5000,
    upgradeCost: 50000,
    slots: [
      { id: 'dev_area', type: 'workstation', name: 'Dev Team Area', x: 5, y: 20, width: 30, height: 35 },
      { id: 'research_area', type: 'workstation', name: 'Research Area', x: 5, y: 60, width: 25, height: 25 },
      { id: 'open_space', type: 'workstation', name: 'Open Workspace', x: 35, y: 35, width: 25, height: 30 },
      { id: 'kitchen', type: 'amenity', name: 'Kitchen', x: 65, y: 15, width: 25, height: 25 },
      { id: 'lounge', type: 'amenity', name: 'Lounge', x: 65, y: 45, width: 25, height: 20 },
      { id: 'server', type: 'infrastructure', name: 'Server Room', x: 35, y: 70, width: 20, height: 20 },
      { id: 'conf_room', type: 'infrastructure', name: 'Conference Room', x: 60, y: 70, width: 25, height: 20 },
      { id: 'wellness', type: 'wellness', name: 'Wellness Area', x: 5, y: 88, width: 25, height: 10, unlockedAt: 'medium' },
      { id: 'reception', type: 'executive', name: 'Reception', x: 85, y: 45, width: 12, height: 35, unlockedAt: 'medium' },
    ],
  },
  {
    id: 'large',
    name: 'Large Office',
    description: 'Multiple floors in a premium building. VC-approved aesthetics.',
    backgroundStyle: 'premium',
    baseCapacity: 30,
    baseRent: 15000,
    upgradeCost: 200000,
    slots: [
      { id: 'eng_floor', type: 'workstation', name: 'Engineering Floor', x: 5, y: 15, width: 40, height: 25 },
      { id: 'product_area', type: 'workstation', name: 'Product Area', x: 5, y: 45, width: 30, height: 20 },
      { id: 'research_lab', type: 'workstation', name: 'Research Lab', x: 5, y: 70, width: 25, height: 20 },
      { id: 'collab_space', type: 'workstation', name: 'Collaboration Space', x: 35, y: 45, width: 20, height: 25 },
      { id: 'cafeteria', type: 'amenity', name: 'Cafeteria', x: 50, y: 10, width: 25, height: 25 },
      { id: 'game_room', type: 'amenity', name: 'Game Room', x: 50, y: 40, width: 20, height: 20 },
      { id: 'data_center', type: 'infrastructure', name: 'Data Center', x: 35, y: 75, width: 25, height: 18 },
      { id: 'board_room', type: 'infrastructure', name: 'Board Room', x: 65, y: 65, width: 25, height: 20 },
      { id: 'gym', type: 'wellness', name: 'Fitness Center', x: 75, y: 10, width: 20, height: 25 },
      { id: 'quiet_room', type: 'wellness', name: 'Quiet Room', x: 75, y: 40, width: 15, height: 15 },
      { id: 'exec_suite', type: 'executive', name: 'Executive Suite', x: 65, y: 88, width: 30, height: 10, unlockedAt: 'large' },
      { id: 'lobby', type: 'executive', name: 'Main Lobby', x: 85, y: 55, width: 12, height: 30, unlockedAt: 'large' },
    ],
  },
  {
    id: 'campus',
    name: 'Tech Campus',
    description: 'Your own campus with multiple buildings. You made it.',
    backgroundStyle: 'campus',
    baseCapacity: 50,
    baseRent: 50000,
    upgradeCost: 500000,
    slots: [
      { id: 'building_a', type: 'workstation', name: 'Building A - Engineering', x: 5, y: 10, width: 28, height: 25 },
      { id: 'building_b', type: 'workstation', name: 'Building B - Research', x: 5, y: 40, width: 28, height: 25 },
      { id: 'building_c', type: 'workstation', name: 'Building C - Product', x: 5, y: 70, width: 28, height: 20 },
      { id: 'innovation_lab', type: 'workstation', name: 'Innovation Lab', x: 38, y: 25, width: 22, height: 25 },
      { id: 'food_hall', type: 'amenity', name: 'Food Hall', x: 38, y: 55, width: 25, height: 20 },
      { id: 'recreation', type: 'amenity', name: 'Recreation Center', x: 38, y: 80, width: 25, height: 15 },
      { id: 'main_data', type: 'infrastructure', name: 'Main Data Center', x: 65, y: 10, width: 30, height: 20 },
      { id: 'auditorium', type: 'infrastructure', name: 'Auditorium', x: 65, y: 35, width: 25, height: 20 },
      { id: 'training', type: 'infrastructure', name: 'Training Center', x: 65, y: 60, width: 20, height: 15 },
      { id: 'wellness_center', type: 'wellness', name: 'Wellness Center', x: 65, y: 80, width: 30, height: 15 },
      { id: 'meditation', type: 'wellness', name: 'Zen Garden', x: 88, y: 35, width: 10, height: 20, unlockedAt: 'campus' },
      { id: 'hq', type: 'executive', name: 'HQ Building', x: 88, y: 60, width: 10, height: 30, unlockedAt: 'campus' },
    ],
  },
];

// Helper functions
export function getLayoutById(id: OfficeSizeId): OfficeLayout | undefined {
  return officeLayouts.find(l => l.id === id);
}

export function getUpgradeById(id: string): UpgradeOption | undefined {
  return upgradeOptions.find(u => u.id === id);
}

export function getUpgradesForSlot(slotType: UpgradeSlotType, officeSize: OfficeSizeId): UpgradeOption[] {
  const sizeOrder: OfficeSizeId[] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
  const currentIndex = sizeOrder.indexOf(officeSize);
  
  return upgradeOptions.filter(upgrade => {
    if (upgrade.slotType !== slotType) return false;
    if (upgrade.requiresOffice) {
      const requiredIndex = Math.min(...upgrade.requiresOffice.map(s => sizeOrder.indexOf(s)));
      if (currentIndex < requiredIndex) return false;
    }
    return true;
  });
}

export function calculateTotalEffects(upgrades: InstalledUpgrade[]): {
  productivity: number;
  morale: number;
  research: number;
  reputation: number;
  capacity: number;
  burnoutReduction: number;
} {
  const totals = {
    productivity: 0,
    morale: 0,
    research: 0,
    reputation: 0,
    capacity: 0,
    burnoutReduction: 0,
  };

  for (const installed of upgrades) {
    const upgrade = getUpgradeById(installed.upgradeId);
    if (!upgrade) continue;
    
    const levelMultiplier = 1 + (installed.level - 1) * 0.4; // 1x, 1.4x, 1.8x for levels 1-3
    
    if (upgrade.effects.productivity) totals.productivity += upgrade.effects.productivity * levelMultiplier;
    if (upgrade.effects.morale) totals.morale += upgrade.effects.morale * levelMultiplier;
    if (upgrade.effects.research) totals.research += upgrade.effects.research * levelMultiplier;
    if (upgrade.effects.reputation) totals.reputation += upgrade.effects.reputation * levelMultiplier;
    if (upgrade.effects.capacity) totals.capacity += upgrade.effects.capacity;
    if (upgrade.effects.burnoutReduction) {
      totals.burnoutReduction = Math.min(0.8, totals.burnoutReduction + upgrade.effects.burnoutReduction * levelMultiplier);
    }
  }

  return totals;
}
