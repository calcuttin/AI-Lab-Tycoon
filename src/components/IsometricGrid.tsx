import { useMemo, useState, useEffect } from 'react';
import { type RoomType, type RoomTypeId, getRoomTypeById, canPlaceRoom, getOccupiedCells } from '../data/roomTypes';
import type { OfficeRoom } from '../store/gameStore';

interface IsometricGridProps {
  gridWidth: number;
  gridHeight: number;
  rooms: OfficeRoom[];
  selectedRoomType: RoomType | null;
  onCellClick: (gridX: number, gridY: number) => void;
  onRoomClick: (room: OfficeRoom) => void;
  cellSize?: number;
  employees?: Array<{ id: string; name: string; role: string; morale: number }>;
}

// Convert grid coordinates to isometric screen coordinates
function gridToScreen(gridX: number, gridY: number, cellSize: number, offsetX: number, offsetY: number) {
  const isoX = (gridX - gridY) * (cellSize / 2) + offsetX;
  const isoY = (gridX + gridY) * (cellSize / 4) + offsetY;
  return { x: isoX, y: isoY };
}

// Room interior details based on type
const roomInteriors: Record<RoomTypeId, {
  furniture: Array<{ emoji: string; dx: number; dy: number; size: number; animate?: string }>;
  floorPattern?: string;
  ambientParticles?: Array<{ emoji: string; animation: string }>;
}> = {
  dev_pit: {
    furniture: [
      { emoji: '🖥️', dx: -15, dy: -8, size: 14 },
      { emoji: '🖥️', dx: 15, dy: -8, size: 14 },
      { emoji: '💻', dx: 0, dy: 5, size: 12 },
      { emoji: '☕', dx: 25, dy: 0, size: 8 },
      { emoji: '🪑', dx: -15, dy: 8, size: 10 },
      { emoji: '🪑', dx: 15, dy: 8, size: 10 },
    ],
    floorPattern: 'carpet',
    ambientParticles: [
      { emoji: '✨', animation: 'sparkle' },
    ],
  },
  server_room: {
    furniture: [
      { emoji: '🖥️', dx: -12, dy: 0, size: 16, animate: 'blink' },
      { emoji: '🖥️', dx: 12, dy: 0, size: 16, animate: 'blink' },
      { emoji: '💡', dx: 0, dy: -8, size: 8, animate: 'pulse' },
    ],
    floorPattern: 'metal',
    ambientParticles: [
      { emoji: '⚡', animation: 'zap' },
    ],
  },
  break_room: {
    furniture: [
      { emoji: '☕', dx: -10, dy: -5, size: 14, animate: 'steam' },
      { emoji: '🍩', dx: 10, dy: -5, size: 12 },
      { emoji: '🛋️', dx: 0, dy: 8, size: 16 },
      { emoji: '📺', dx: 0, dy: -12, size: 10 },
    ],
    floorPattern: 'tile',
    ambientParticles: [
      { emoji: '♨️', animation: 'steam' },
    ],
  },
  meeting_room: {
    furniture: [
      { emoji: '🪑', dx: -12, dy: 0, size: 10 },
      { emoji: '🪑', dx: 12, dy: 0, size: 10 },
      { emoji: '📊', dx: 0, dy: -8, size: 12 },
    ],
    floorPattern: 'wood',
  },
  exec_office: {
    furniture: [
      { emoji: '🪑', dx: 0, dy: 5, size: 14 },
      { emoji: '🖼️', dx: -15, dy: -10, size: 10 },
      { emoji: '🏆', dx: 15, dy: -10, size: 10 },
      { emoji: '🌿', dx: 20, dy: 5, size: 12 },
      { emoji: '💼', dx: -8, dy: 0, size: 10 },
    ],
    floorPattern: 'marble',
  },
  lobby: {
    furniture: [
      { emoji: '🛋️', dx: -20, dy: 0, size: 14 },
      { emoji: '🛋️', dx: 20, dy: 0, size: 14 },
      { emoji: '🌿', dx: -30, dy: -5, size: 16 },
      { emoji: '🌿', dx: 30, dy: -5, size: 16 },
      { emoji: '🖼️', dx: 0, dy: -12, size: 12 },
    ],
    floorPattern: 'marble',
  },
  gym: {
    furniture: [
      { emoji: '🏋️', dx: -12, dy: -5, size: 14 },
      { emoji: '🚴', dx: 12, dy: -5, size: 14 },
      { emoji: '🧘', dx: 0, dy: 8, size: 12 },
      { emoji: '💪', dx: 0, dy: -10, size: 10, animate: 'bounce' },
    ],
    floorPattern: 'rubber',
  },
  cafeteria: {
    furniture: [
      { emoji: '🍽️', dx: -20, dy: 0, size: 12 },
      { emoji: '🍽️', dx: 0, dy: 0, size: 12 },
      { emoji: '🍽️', dx: 20, dy: 0, size: 12 },
      { emoji: '🍕', dx: -10, dy: -10, size: 10 },
      { emoji: '🥗', dx: 10, dy: -10, size: 10 },
    ],
    floorPattern: 'tile',
    ambientParticles: [
      { emoji: '♨️', animation: 'steam' },
    ],
  },
  storage: {
    furniture: [
      { emoji: '📦', dx: 0, dy: 0, size: 14 },
    ],
    floorPattern: 'concrete',
  },
  phone_booth: {
    furniture: [
      { emoji: '📞', dx: 0, dy: 0, size: 14 },
    ],
    floorPattern: 'carpet',
  },
  quiet_zone: {
    furniture: [
      { emoji: '📚', dx: -10, dy: 0, size: 12 },
      { emoji: '🪑', dx: 10, dy: 0, size: 10 },
      { emoji: '🔇', dx: 0, dy: -8, size: 8 },
    ],
    floorPattern: 'carpet',
  },
  game_room: {
    furniture: [
      { emoji: '🎮', dx: -10, dy: -5, size: 14 },
      { emoji: '🎱', dx: 10, dy: -5, size: 12 },
      { emoji: '🎯', dx: 0, dy: 8, size: 14 },
      { emoji: '🕹️', dx: -15, dy: 5, size: 10 },
    ],
    floorPattern: 'carpet',
    ambientParticles: [
      { emoji: '🎉', animation: 'confetti' },
    ],
  },
  meditation_room: {
    furniture: [
      { emoji: '🧘', dx: 0, dy: 0, size: 14 },
      { emoji: '🕯️', dx: -10, dy: -5, size: 10, animate: 'flicker' },
      { emoji: '🕯️', dx: 10, dy: -5, size: 10, animate: 'flicker' },
      { emoji: '🌸', dx: 0, dy: 10, size: 10 },
    ],
    floorPattern: 'bamboo',
    ambientParticles: [
      { emoji: '✨', animation: 'float' },
    ],
  },
};

// Floor pattern definitions
const floorPatterns: Record<string, { color1: string; color2: string; pattern: 'checker' | 'stripe' | 'solid' }> = {
  carpet: { color1: 'rgba(59, 130, 246, 0.3)', color2: 'rgba(37, 99, 235, 0.3)', pattern: 'solid' },
  tile: { color1: 'rgba(148, 163, 184, 0.4)', color2: 'rgba(100, 116, 139, 0.4)', pattern: 'checker' },
  wood: { color1: 'rgba(180, 140, 100, 0.5)', color2: 'rgba(160, 120, 80, 0.5)', pattern: 'stripe' },
  marble: { color1: 'rgba(226, 232, 240, 0.5)', color2: 'rgba(203, 213, 225, 0.5)', pattern: 'checker' },
  metal: { color1: 'rgba(71, 85, 105, 0.6)', color2: 'rgba(51, 65, 85, 0.6)', pattern: 'stripe' },
  rubber: { color1: 'rgba(34, 197, 94, 0.3)', color2: 'rgba(22, 163, 74, 0.3)', pattern: 'solid' },
  concrete: { color1: 'rgba(107, 114, 128, 0.5)', color2: 'rgba(75, 85, 99, 0.5)', pattern: 'solid' },
  bamboo: { color1: 'rgba(163, 148, 128, 0.4)', color2: 'rgba(143, 128, 108, 0.4)', pattern: 'stripe' },
};

export default function IsometricGrid({
  gridWidth,
  gridHeight,
  rooms,
  selectedRoomType,
  onCellClick,
  onRoomClick,
  cellSize = 70,
  employees = [],
}: IsometricGridProps) {
  const [animationTick, setAnimationTick] = useState(0);
  
  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick(t => (t + 1) % 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate canvas size based on grid
  const canvasWidth = (gridWidth + gridHeight) * (cellSize / 2) + 150;
  const canvasHeight = (gridWidth + gridHeight) * (cellSize / 4) + 200;
  const offsetX = gridHeight * (cellSize / 2) + 75;
  const offsetY = 80;

  // Get occupied cells and room lookup for placement validation and rendering
  const { occupiedCells, roomByCell } = useMemo(() => {
    const occupied = new Set<string>();
    const roomLookup = new Map<string, OfficeRoom>();

    for (const room of rooms) {
      const roomType = getRoomTypeById(room.typeId);
      if (!roomType) continue;

      for (let y = room.gridY; y < room.gridY + roomType.size.height; y++) {
        for (let x = room.gridX; x < room.gridX + roomType.size.width; x++) {
          const key = `${x},${y}`;
          occupied.add(key);
          roomLookup.set(key, room);
        }
      }
    }

    // Fallback to shared helper (kept for consistency) if no rooms provided
    if (rooms.length === 0) {
      return { occupiedCells: getOccupiedCells(rooms), roomByCell: roomLookup };
    }

    return { occupiedCells: occupied, roomByCell: roomLookup };
  }, [rooms]);

  // Check if a cell can accept the selected room type
  const canPlaceAt = (gridX: number, gridY: number): boolean => {
    if (!selectedRoomType) return false;
    return canPlaceRoom(gridX, gridY, selectedRoomType, gridWidth, gridHeight, occupiedCells);
  };

  // Generate grid cells
  const cells = useMemo(() => {
    const cellList: { x: number; y: number; isOccupied: boolean; occupyingRoom: OfficeRoom | null }[] = [];
    
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const key = `${x},${y}`;
        const isOccupied = occupiedCells.has(key);
        
        const occupyingRoom = roomByCell.get(key) ?? null;
        
        cellList.push({ x, y, isOccupied, occupyingRoom });
      }
    }
    
    return cellList;
  }, [gridWidth, gridHeight, occupiedCells, rooms]);

  // Render isometric diamond shape for a cell
  const renderCell = (gridX: number, gridY: number, isOccupied: boolean) => {
    const { x, y } = gridToScreen(gridX, gridY, cellSize, offsetX, offsetY);
    const canPlace = selectedRoomType ? canPlaceAt(gridX, gridY) : false;
    
    const halfW = cellSize / 2;
    const halfH = cellSize / 4;
    const points = `${halfW},0 ${cellSize},${halfH} ${halfW},${cellSize / 2} 0,${halfH}`;
    
    let fillColor = 'rgba(20, 40, 60, 0.4)';
    let strokeColor = 'rgba(100, 120, 140, 0.3)';
    
    if (selectedRoomType) {
      if (canPlace) {
        fillColor = 'rgba(34, 197, 94, 0.4)';
        strokeColor = 'rgba(34, 197, 94, 0.9)';
      } else if (!isOccupied) {
        fillColor = 'rgba(239, 68, 68, 0.2)';
        strokeColor = 'rgba(239, 68, 68, 0.5)';
      }
    }
    
    if (isOccupied) return null;
    
    return (
      <g
        key={`cell-${gridX}-${gridY}`}
        transform={`translate(${x}, ${y})`}
        style={{ cursor: canPlace ? 'pointer' : 'default' }}
        onClick={() => canPlace && onCellClick(gridX, gridY)}
      >
        {/* Cell shadow */}
        <polygon
          points={points}
          fill="rgba(0,0,0,0.2)"
          transform="translate(2, 2)"
        />
        {/* Cell floor */}
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1"
          style={{ transition: 'fill 0.2s, stroke 0.2s' }}
        />
        {/* Grid texture */}
        <polygon
          points={points}
          fill="url(#cellTexture)"
          opacity="0.3"
        />
        {/* Hover glow for placeable cells */}
        {canPlace && (
          <polygon
            points={points}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            opacity={0.5 + Math.sin(animationTick * 0.2) * 0.3}
          />
        )}
      </g>
    );
  };

  // Render a room on the grid with detailed interior
  const renderRoom = (room: OfficeRoom, index: number) => {
    const roomType = getRoomTypeById(room.typeId);
    if (!roomType) return null;
    
    const { x, y } = gridToScreen(room.gridX, room.gridY, cellSize, offsetX, offsetY);
    const width = roomType.size.width;
    const height = roomType.size.height;
    
    // Calculate isometric room shape
    const topX = width * (cellSize / 2);
    const topY = 0;
    const rightX = (width + height) * (cellSize / 2);
    const rightY = height * (cellSize / 4);
    const bottomX = height * (cellSize / 2);
    const bottomY = (width + height) * (cellSize / 4);
    const leftX = 0;
    const leftY = width * (cellSize / 4);
    
    const floorPoints = `${topX},${topY} ${rightX},${rightY} ${bottomX},${bottomY} ${leftX},${leftY}`;
    
    // Room colors with gradients
    const roomColors: Record<RoomTypeId, { base: string; light: string; dark: string; glow: string }> = {
      dev_pit: { base: '#0ea5e9', light: '#38bdf8', dark: '#0369a1', glow: 'rgba(14, 165, 233, 0.4)' },
      server_room: { base: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9', glow: 'rgba(139, 92, 246, 0.4)' },
      break_room: { base: '#f59e0b', light: '#fbbf24', dark: '#d97706', glow: 'rgba(245, 158, 11, 0.4)' },
      meeting_room: { base: '#64748b', light: '#94a3b8', dark: '#475569', glow: 'rgba(100, 116, 139, 0.3)' },
      exec_office: { base: '#ec4899', light: '#f472b6', dark: '#be185d', glow: 'rgba(236, 72, 153, 0.4)' },
      lobby: { base: '#22c55e', light: '#4ade80', dark: '#15803d', glow: 'rgba(34, 197, 94, 0.4)' },
      gym: { base: '#ef4444', light: '#f87171', dark: '#b91c1c', glow: 'rgba(239, 68, 68, 0.4)' },
      cafeteria: { base: '#f97316', light: '#fb923c', dark: '#c2410c', glow: 'rgba(249, 115, 22, 0.4)' },
      storage: { base: '#4b5563', light: '#6b7280', dark: '#374151', glow: 'rgba(75, 85, 99, 0.3)' },
      phone_booth: { base: '#06b6d4', light: '#22d3ee', dark: '#0891b2', glow: 'rgba(6, 182, 212, 0.4)' },
      quiet_zone: { base: '#6366f1', light: '#818cf8', dark: '#4338ca', glow: 'rgba(99, 102, 241, 0.4)' },
      game_room: { base: '#a855f7', light: '#c084fc', dark: '#7e22ce', glow: 'rgba(168, 85, 247, 0.4)' },
      meditation_room: { base: '#14b8a6', light: '#2dd4bf', dark: '#0f766e', glow: 'rgba(20, 184, 166, 0.4)' },
    };
    
    const colors = roomColors[room.typeId] || { base: '#666', light: '#888', dark: '#444', glow: 'rgba(100,100,100,0.3)' };
    const interior = roomInteriors[room.typeId];
    const floor = interior?.floorPattern ? floorPatterns[interior.floorPattern] : floorPatterns.carpet;
    
    const centerX = (topX + bottomX) / 2;
    const centerY = (leftY + rightY) / 2;
    const wallHeight = 20 + room.level * 4;
    
    return (
      <g
        key={`room-${room.id}`}
        transform={`translate(${x}, ${y})`}
        style={{ cursor: 'pointer' }}
        onClick={() => onRoomClick(room)}
      >
        {/* Room shadow */}
        <polygon
          points={floorPoints}
          fill="rgba(0,0,0,0.3)"
          transform="translate(4, 4)"
        />
        
        {/* Ambient glow */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={width * cellSize * 0.35}
          ry={height * cellSize * 0.2}
          fill={colors.glow}
          opacity={0.5 + Math.sin(animationTick * 0.1 + index) * 0.2}
        />
        
        {/* Floor with pattern */}
        <polygon
          points={floorPoints}
          fill={floor.color1}
        />
        <polygon
          points={floorPoints}
          fill={`url(#floor-${floor.pattern})`}
          opacity="0.5"
        />
        
        {/* Back wall (top-right) */}
        <polygon
          points={`${topX},${topY} ${rightX},${rightY} ${rightX},${rightY - wallHeight} ${topX},${topY - wallHeight}`}
          fill={colors.light}
          opacity="0.7"
        />
        {/* Wall texture */}
        <polygon
          points={`${topX},${topY} ${rightX},${rightY} ${rightX},${rightY - wallHeight} ${topX},${topY - wallHeight}`}
          fill="url(#wallTexture)"
          opacity="0.2"
        />
        
        {/* Back wall (top-left) */}
        <polygon
          points={`${leftX},${leftY} ${topX},${topY} ${topX},${topY - wallHeight} ${leftX},${leftY - wallHeight}`}
          fill={colors.base}
          opacity="0.8"
        />
        <polygon
          points={`${leftX},${leftY} ${topX},${topY} ${topX},${topY - wallHeight} ${leftX},${leftY - wallHeight}`}
          fill="url(#wallTexture)"
          opacity="0.2"
        />
        
        {/* Wall top edge */}
        <line
          x1={leftX} y1={leftY - wallHeight}
          x2={topX} y2={topY - wallHeight}
          stroke={colors.dark}
          strokeWidth="2"
        />
        <line
          x1={topX} y1={topY - wallHeight}
          x2={rightX} y2={rightY - wallHeight}
          stroke={colors.dark}
          strokeWidth="2"
        />
        
        {/* Front walls (3D depth) */}
        <polygon
          points={`${leftX},${leftY} ${bottomX},${bottomY} ${bottomX},${bottomY + 12} ${leftX},${leftY + 12}`}
          fill={colors.dark}
          opacity="0.8"
        />
        <polygon
          points={`${bottomX},${bottomY} ${rightX},${rightY} ${rightX},${rightY + 12} ${bottomX},${bottomY + 12}`}
          fill={colors.dark}
          opacity="0.6"
        />
        
        {/* Floor border */}
        <polygon
          points={floorPoints}
          fill="none"
          stroke={colors.base}
          strokeWidth="2"
        />
        
        {/* Room interior furniture */}
        {interior?.furniture.map((item, i) => {
          let animStyle = '';
          if (item.animate === 'blink') {
            animStyle = `opacity: ${Math.sin(animationTick * 0.3 + i) > 0 ? 1 : 0.3}`;
          } else if (item.animate === 'pulse') {
            animStyle = `opacity: ${0.5 + Math.sin(animationTick * 0.2 + i) * 0.5}`;
          } else if (item.animate === 'bounce') {
            animStyle = `transform: translateY(${Math.sin(animationTick * 0.15 + i) * 2}px)`;
          } else if (item.animate === 'flicker') {
            animStyle = `opacity: ${0.6 + Math.random() * 0.4}`;
          }
          
          return (
            <text
              key={`furniture-${i}`}
              x={centerX + item.dx}
              y={centerY + item.dy}
              textAnchor="middle"
              fontSize={item.size}
              style={{ 
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                ...(animStyle ? { [animStyle.split(':')[0].trim()]: animStyle.split(':')[1].trim() } : {})
              }}
            >
              {item.emoji}
            </text>
          );
        })}
        
        {/* Ambient particles */}
        {interior?.ambientParticles?.map((particle, i) => {
          const offset = (animationTick * 0.5 + i * 30) % 100;
          let px = centerX - 20 + (offset % 40);
          let py = centerY - 15 + Math.sin(offset * 0.1) * 5;
          let opacity = particle.animation === 'steam' 
            ? 0.3 + (1 - offset / 100) * 0.4
            : 0.3 + Math.sin(offset * 0.1) * 0.3;
          
          if (particle.animation === 'steam') {
            py = centerY - 10 - (offset * 0.3);
          }
          
          return (
            <text
              key={`particle-${i}`}
              x={px}
              y={py}
              fontSize="8"
              opacity={opacity}
            >
              {particle.emoji}
            </text>
          );
        })}
        
        {/* Room name label with background */}
        <rect
          x={centerX - 35}
          y={centerY + 20}
          width="70"
          height="14"
          rx="3"
          fill="rgba(0,0,0,0.7)"
        />
        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#fff"
          fontFamily="monospace"
        >
          {roomType.name.toUpperCase().slice(0, 12)}
        </text>
        
        {/* Level stars */}
        {room.level > 1 && (
          <g transform={`translate(${rightX - 25}, ${rightY - wallHeight - 10})`}>
            <rect x="-2" y="-2" width="24" height="14" rx="3" fill="rgba(0,0,0,0.6)" />
            {Array.from({ length: room.level }).map((_, i) => (
              <text key={i} x={i * 8} y="8" fontSize="8" fill="#fbbf24">★</text>
            ))}
          </g>
        )}
        
        {/* Activity indicator */}
        <circle
          cx={leftX + 8}
          cy={leftY - wallHeight + 8}
          r="4"
          fill="#22c55e"
          opacity={0.6 + Math.sin(animationTick * 0.2) * 0.4}
        >
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Condition warning */}
        {room.condition < 80 && (
          <g transform={`translate(${leftX + 5}, ${leftY - 10})`}>
            <circle cx="8" cy="8" r="10" fill="rgba(0,0,0,0.7)" />
            <text x="8" y="12" textAnchor="middle" fontSize="12">
              {room.condition < 50 ? '🔧' : '⚠️'}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render employees walking around
  const renderEmployees = () => {
    if (employees.length === 0 || rooms.length === 0) return null;
    
    return employees.slice(0, 8).map((emp, i) => {
      // Place employee in a random room
      const roomIndex = i % rooms.length;
      const room = rooms[roomIndex];
      const roomType = getRoomTypeById(room.typeId);
      if (!roomType) return null;
      
      const { x, y } = gridToScreen(room.gridX, room.gridY, cellSize, offsetX, offsetY);
      const width = roomType.size.width;
      const height = roomType.size.height;
      const centerX = width * (cellSize / 2);
      const centerY = (width + height) * (cellSize / 8);
      
      // Animate position
      const wobble = Math.sin(animationTick * 0.1 + i * 2) * 8;
      const bounce = Math.abs(Math.sin(animationTick * 0.15 + i)) * 2;
      
      const roleEmoji: Record<string, string> = {
        engineer: '👨‍💻',
        researcher: '👨‍🔬',
        designer: '👨‍🎨',
        manager: '👨‍💼',
        intern: '🧑‍🎓',
      };
      
      return (
        <g
          key={`emp-${emp.id}`}
          transform={`translate(${x + centerX + wobble - 15 + (i % 3) * 15}, ${y + centerY - bounce})`}
        >
          <text fontSize="16" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))' }}>
            {roleEmoji[emp.role] || '🧑'}
          </text>
          {/* Morale indicator */}
          <circle
            cx="8"
            cy="-5"
            r="3"
            fill={emp.morale > 70 ? '#22c55e' : emp.morale > 40 ? '#f59e0b' : '#ef4444'}
          />
        </g>
      );
    });
  };

  return (
    <div
      className="overflow-auto rounded-lg"
      style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #1a2744 50%, #0f172a 100%)',
        border: '4px solid #334155',
        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <svg
        width={canvasWidth}
        height={canvasHeight}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Definitions */}
        <defs>
          {/* Grid texture pattern */}
          <pattern id="cellTexture" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="transparent" />
            <circle cx="4" cy="4" r="0.5" fill="rgba(255,255,255,0.1)" />
          </pattern>
          
          {/* Wall texture */}
          <pattern id="wallTexture" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="transparent" />
            <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </pattern>
          
          {/* Floor patterns */}
          <pattern id="floor-checker" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="rgba(255,255,255,0.1)" />
            <rect x="8" y="8" width="8" height="8" fill="rgba(255,255,255,0.1)" />
          </pattern>
          <pattern id="floor-stripe" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="8" y2="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
          <pattern id="floor-solid" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="rgba(255,255,255,0.05)" />
          </pattern>
          
          {/* Ambient light gradient */}
          <radialGradient id="ambientLight" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background ambient light */}
        <rect width="100%" height="100%" fill="url(#ambientLight)" />
        
        {/* Subtle grid dots */}
        <g opacity="0.3">
          {Array.from({ length: 20 }).map((_, i) => (
            Array.from({ length: 15 }).map((_, j) => (
              <circle
                key={`dot-${i}-${j}`}
                cx={i * 30 + 15}
                cy={j * 30 + 15}
                r="1"
                fill="rgba(148, 163, 184, 0.3)"
              />
            ))
          ))}
        </g>
        
        {/* Render grid cells */}
        <g>
          {cells.map(({ x, y, isOccupied }) => renderCell(x, y, isOccupied))}
        </g>
        
        {/* Render rooms (sorted by Y for proper overlap) */}
        <g>
          {[...rooms]
            .sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY))
            .map((room, index) => renderRoom(room, index))}
        </g>
        
        {/* Render employees */}
        <g>
          {renderEmployees()}
        </g>
        
        {/* Grid info panel */}
        <g transform={`translate(10, ${canvasHeight - 40})`}>
          <rect width="180" height="30" rx="5" fill="rgba(0,0,0,0.6)" />
          <text x="10" y="12" fontSize="9" fill="#64748b" fontFamily="monospace">
            GRID: {gridWidth}x{gridHeight}
          </text>
          <text x="10" y="24" fontSize="9" fill="#94a3b8" fontFamily="monospace">
            ROOMS: {rooms.length} | STAFF: {employees.length}
          </text>
          {/* Live indicator */}
          <circle cx="165" cy="15" r="4" fill="#22c55e">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      
      {/* CSS for additional effects */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
          50% { filter: drop-shadow(0 0 15px currentColor); }
        }
      `}</style>
    </div>
  );
}
