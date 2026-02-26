// Room types for the SimCity-style office building system

export type RoomTypeId =
  | 'dev_pit'
  | 'server_room'
  | 'break_room'
  | 'meeting_room'
  | 'exec_office'
  | 'lobby'
  | 'gym'
  | 'cafeteria'
  | 'storage'
  | 'phone_booth'
  | 'quiet_zone'
  | 'game_room'
  | 'meditation_room';

export type OfficeSizeType = 'hacker_den' | 'small' | 'medium' | 'large' | 'campus';

export interface RoomEffects {
  productivityBonus?: number;      // % bonus to project progress
  moraleBonus?: number;            // Daily morale gain
  researchBonus?: number;          // % bonus to research speed
  reputationBonus?: number;        // Daily reputation gain
  capacityBonus?: number;          // Extra desk slots
  burnoutReduction?: number;       // Reduces crunch penalty (0-1)
  teamworkBonus?: number;          // % bonus to team collaboration
  eventBonus?: number;             // % bonus to positive event chances
}

export interface RoomType {
  id: RoomTypeId;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  size: { width: number; height: number }; // Grid cells
  effects: RoomEffects;
  requirements?: {
    officeSize?: OfficeSizeType[];   // Required office sizes
    minEmployees?: number;
    unlockedTech?: string[];
  };
  maxPerOffice?: number;             // Limit instances (e.g., 1 lobby)
  upgradable: boolean;               // Can be upgraded for better effects
  upgradeMultiplier?: number;        // Effect multiplier per upgrade level
}

// Grid dimensions for each office size
export const officeGridSizes: Record<OfficeSizeType, { width: number; height: number; maxRooms: number }> = {
  hacker_den: { width: 4, height: 3, maxRooms: 3 },
  small: { width: 6, height: 4, maxRooms: 6 },
  medium: { width: 8, height: 5, maxRooms: 10 },
  large: { width: 10, height: 6, maxRooms: 15 },
  campus: { width: 12, height: 8, maxRooms: 24 },
};

export const roomTypes: RoomType[] = [
  {
    id: 'dev_pit',
    name: 'Dev Pit',
    description: 'Open workspace with high-end workstations for developers. Boosts coding productivity.',
    icon: '💻',
    baseCost: 5000,
    size: { width: 2, height: 2 },
    effects: {
      productivityBonus: 0.15,
      capacityBonus: 2,
    },
    upgradable: true,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'server_room',
    name: 'Server Room',
    description: 'Climate-controlled room with powerful servers for research and computation.',
    icon: '🖥️',
    baseCost: 8000,
    size: { width: 2, height: 1 },
    effects: {
      researchBonus: 0.20,
    },
    upgradable: true,
    upgradeMultiplier: 1.25,
  },
  {
    id: 'break_room',
    name: 'Break Room',
    description: 'Comfortable space for employees to relax, grab coffee, and recharge.',
    icon: '☕',
    baseCost: 3000,
    size: { width: 2, height: 2 },
    effects: {
      moraleBonus: 2,
    },
    upgradable: true,
    upgradeMultiplier: 1.5,
  },
  {
    id: 'meeting_room',
    name: 'Meeting Room',
    description: 'Professional conference room for team collaboration and client meetings.',
    icon: '🚪',
    baseCost: 4000,
    size: { width: 2, height: 1 },
    effects: {
      teamworkBonus: 0.10,
    },
    upgradable: true,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'exec_office',
    name: 'Executive Office',
    description: 'Corner office for leadership. Impresses visitors and boosts company reputation.',
    icon: '👔',
    baseCost: 15000,
    size: { width: 2, height: 2 },
    effects: {
      reputationBonus: 1,
    },
    requirements: {
      officeSize: ['medium', 'large', 'campus'],
      minEmployees: 5,
    },
    maxPerOffice: 3,
    upgradable: true,
    upgradeMultiplier: 1.5,
  },
  {
    id: 'lobby',
    name: 'Lobby',
    description: 'Impressive entrance area that sets the tone for visitors and clients.',
    icon: '🏛️',
    baseCost: 10000,
    size: { width: 3, height: 2 },
    effects: {
      eventBonus: 0.05,
      reputationBonus: 0.5,
    },
    requirements: {
      officeSize: ['small', 'medium', 'large', 'campus'],
    },
    maxPerOffice: 1,
    upgradable: true,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'gym',
    name: 'Fitness Center',
    description: 'On-site gym keeps employees healthy and happy. Premium perk for top talent.',
    icon: '🏋️',
    baseCost: 12000,
    size: { width: 2, height: 2 },
    effects: {
      moraleBonus: 3,
    },
    requirements: {
      officeSize: ['medium', 'large', 'campus'],
      minEmployees: 8,
    },
    maxPerOffice: 2,
    upgradable: true,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    description: 'Full-service dining area with healthy food options. Reduces burnout from crunch.',
    icon: '🍽️',
    baseCost: 8000,
    size: { width: 3, height: 2 },
    effects: {
      burnoutReduction: 0.50,
      moraleBonus: 1,
    },
    requirements: {
      officeSize: ['medium', 'large', 'campus'],
      minEmployees: 6,
    },
    maxPerOffice: 2,
    upgradable: true,
    upgradeMultiplier: 1.25,
  },
  {
    id: 'storage',
    name: 'Storage Room',
    description: 'Secure storage for equipment and supplies. Required for major equipment upgrades.',
    icon: '📦',
    baseCost: 1000,
    size: { width: 1, height: 1 },
    effects: {},
    upgradable: false,
  },
  {
    id: 'phone_booth',
    name: 'Phone Booth',
    description: 'Private pod for calls and focused work. Boosts individual productivity.',
    icon: '📞',
    baseCost: 2000,
    size: { width: 1, height: 1 },
    effects: {
      productivityBonus: 0.05,
    },
    upgradable: false,
  },
  {
    id: 'quiet_zone',
    name: 'Quiet Zone',
    description: 'Dedicated space for deep work and research. No meetings or distractions allowed.',
    icon: '🤫',
    baseCost: 4000,
    size: { width: 2, height: 1 },
    effects: {
      researchBonus: 0.10,
      moraleBonus: 1,
    },
    upgradable: true,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'game_room',
    name: 'Game Room',
    description: 'Recreation area with games and entertainment. Major morale booster for the team.',
    icon: '🎮',
    baseCost: 6000,
    size: { width: 2, height: 2 },
    effects: {
      moraleBonus: 4,
    },
    requirements: {
      officeSize: ['medium', 'large', 'campus'],
      minEmployees: 5,
    },
    maxPerOffice: 1,
    upgradable: true,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'meditation_room',
    name: 'Meditation Room',
    description: 'Peaceful space for mindfulness and stress relief. Reduces burnout and boosts morale.',
    icon: '🧘',
    baseCost: 5000,
    size: { width: 1, height: 2 },
    effects: {
      burnoutReduction: 0.30,
      moraleBonus: 2,
    },
    upgradable: true,
    upgradeMultiplier: 1.3,
  },
];

// Helper functions

export function getRoomTypeById(id: RoomTypeId): RoomType | undefined {
  return roomTypes.find((room) => room.id === id);
}

export function getRoomsForOfficeSize(officeSize: OfficeSizeType, employeeCount: number): RoomType[] {
  const sizeOrder: OfficeSizeType[] = ['hacker_den', 'small', 'medium', 'large', 'campus'];
  const currentSizeIndex = sizeOrder.indexOf(officeSize);

  return roomTypes.filter((room) => {
    // Check office size requirement
    if (room.requirements?.officeSize) {
      const meetsSize = room.requirements.officeSize.some((reqSize) => {
        const reqIndex = sizeOrder.indexOf(reqSize);
        return currentSizeIndex >= reqIndex;
      });
      if (!meetsSize) return false;
    }

    // Check employee count requirement
    if (room.requirements?.minEmployees && employeeCount < room.requirements.minEmployees) {
      return false;
    }

    return true;
  });
}

export function calculateRoomCells(room: { gridX: number; gridY: number }, roomType: RoomType): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let dx = 0; dx < roomType.size.width; dx++) {
    for (let dy = 0; dy < roomType.size.height; dy++) {
      cells.push({ x: room.gridX + dx, y: room.gridY + dy });
    }
  }
  return cells;
}

export function canPlaceRoom(
  gridX: number,
  gridY: number,
  roomType: RoomType,
  gridWidth: number,
  gridHeight: number,
  occupiedCells: Set<string>
): boolean {
  // Check bounds
  if (gridX < 0 || gridY < 0) return false;
  if (gridX + roomType.size.width > gridWidth) return false;
  if (gridY + roomType.size.height > gridHeight) return false;

  // Check for overlapping cells
  for (let dx = 0; dx < roomType.size.width; dx++) {
    for (let dy = 0; dy < roomType.size.height; dy++) {
      const key = `${gridX + dx},${gridY + dy}`;
      if (occupiedCells.has(key)) return false;
    }
  }

  return true;
}

export function getOccupiedCells(
  rooms: Array<{ gridX: number; gridY: number; typeId: RoomTypeId }>
): Set<string> {
  const occupied = new Set<string>();
  for (const room of rooms) {
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType) continue;
    for (let dx = 0; dx < roomType.size.width; dx++) {
      for (let dy = 0; dy < roomType.size.height; dy++) {
        occupied.add(`${room.gridX + dx},${room.gridY + dy}`);
      }
    }
  }
  return occupied;
}
