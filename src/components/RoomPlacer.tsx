import { useState } from 'react';
import { roomTypes, type RoomType, type RoomTypeId, getRoomsForOfficeSize, officeGridSizes } from '../data/roomTypes';
import { useGameStore, type OfficeRoom, calculateRoomBonuses } from '../store/gameStore';

interface RoomPlacerProps {
  selectedRoomType: RoomType | null;
  onSelectRoom: (roomType: RoomType | null) => void;
  selectedPlacedRoom: OfficeRoom | null;
  onSelectPlacedRoom: (room: OfficeRoom | null) => void;
}

export default function RoomPlacer({
  selectedRoomType,
  onSelectRoom,
  selectedPlacedRoom,
  onSelectPlacedRoom,
}: RoomPlacerProps) {
  const office = useGameStore((state) => state.office);
  const employees = useGameStore((state) => state.employees);
  const money = useGameStore((state) => state.money);
  const removeRoom = useGameStore((state) => state.removeRoom);
  const upgradeRoom = useGameStore((state) => state.upgradeRoom);
  
  const [activeTab, setActiveTab] = useState<'build' | 'manage' | 'bonuses'>('build');
  
  // Get available rooms for current office size
  const availableRooms = getRoomsForOfficeSize(office.size, employees.length);
  
  // Calculate current room bonuses
  const roomBonuses = calculateRoomBonuses(office.rooms);
  
  // Get room count by type
  const getRoomCount = (typeId: RoomTypeId) => {
    return office.rooms.filter(r => r.typeId === typeId).length;
  };
  
  // Check if room type is at max capacity
  const isAtMaxCapacity = (roomType: RoomType) => {
    if (!roomType.maxPerOffice) return false;
    return getRoomCount(roomType.id) >= roomType.maxPerOffice;
  };
  
  // Get upgrade cost for a room
  const getUpgradeCost = (room: OfficeRoom) => {
    const roomType = roomTypes.find(r => r.id === room.typeId);
    if (!roomType) return 0;
    return Math.floor(roomType.baseCost * (room.level * 0.75));
  };
  
  // Get grid info
  const gridInfo = officeGridSizes[office.size];
  const usedCells = office.rooms.reduce((sum, room) => {
    const rt = roomTypes.find(r => r.id === room.typeId);
    return sum + (rt ? rt.size.width * rt.size.height : 0);
  }, 0);
  const totalCells = gridInfo.width * gridInfo.height;
  
  return (
    <div
      className="rounded p-4 space-y-4"
      style={{
        background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
        border: '4px solid #2d3748',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-pixel)',
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
          🏗️ OFFICE BUILDER
        </h3>
        <span className="text-[9px]" style={{ color: '#94a3b8' }}>
          {usedCells}/{totalCells} cells
        </span>
      </div>
      
      {/* Tab buttons */}
      <div className="flex gap-1">
        {(['build', 'manage', 'bonuses'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 px-2 text-[9px] font-bold rounded transition-all"
            style={{
              background: activeTab === tab
                ? 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)'
                : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              border: `2px solid ${activeTab === tab ? '#0ea5e9' : '#475569'}`,
            }}
          >
            {tab === 'build' ? '🔨 BUILD' : tab === 'manage' ? '📋 MANAGE' : '📊 BONUSES'}
          </button>
        ))}
      </div>
      
      {/* Build tab */}
      {activeTab === 'build' && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {selectedRoomType && (
            <div
              className="p-3 rounded mb-3"
              style={{
                background: 'rgba(14, 165, 233, 0.2)',
                border: '2px solid #0ea5e9',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold" style={{ color: '#fff' }}>
                  {selectedRoomType.icon} {selectedRoomType.name}
                </span>
                <button
                  onClick={() => onSelectRoom(null)}
                  className="text-[9px] px-2 py-1 rounded"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  ✕ CANCEL
                </button>
              </div>
              <p className="text-[8px]" style={{ color: '#94a3b8' }}>
                Click on a green cell to place
              </p>
            </div>
          )}
          
          {availableRooms.map((roomType) => {
            const canAfford = money >= roomType.baseCost;
            const atMax = isAtMaxCapacity(roomType);
            const isSelected = selectedRoomType?.id === roomType.id;
            const count = getRoomCount(roomType.id);
            
            return (
              <button
                key={roomType.id}
                onClick={() => onSelectRoom(isSelected ? null : roomType)}
                disabled={!canAfford || atMax}
                className="w-full p-3 rounded text-left transition-all hover:scale-[1.01]"
                style={{
                  background: isSelected
                    ? 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)'
                    : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  border: `2px solid ${isSelected ? '#0ea5e9' : canAfford && !atMax ? '#22c55e' : '#475569'}`,
                  opacity: canAfford && !atMax ? 1 : 0.5,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: '#fff' }}>
                    {roomType.icon} {roomType.name}
                  </span>
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: canAfford ? '#22c55e' : '#ef4444' }}
                  >
                    ${roomType.baseCost.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-[8px] mb-2" style={{ color: '#94a3b8' }}>
                  {roomType.description.slice(0, 60)}...
                </p>
                
                <div className="flex items-center justify-between text-[8px]">
                  <span style={{ color: '#64748b' }}>
                    Size: {roomType.size.width}x{roomType.size.height}
                  </span>
                  {roomType.maxPerOffice && (
                    <span style={{ color: atMax ? '#ef4444' : '#64748b' }}>
                      {count}/{roomType.maxPerOffice}
                    </span>
                  )}
                </div>
                
                {/* Effects preview */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {roomType.effects.productivityBonus && (
                    <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: '#0ea5e9', color: '#fff' }}>
                      +{Math.round(roomType.effects.productivityBonus * 100)}% PROD
                    </span>
                  )}
                  {roomType.effects.moraleBonus && (
                    <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: '#f59e0b', color: '#fff' }}>
                      +{roomType.effects.moraleBonus} MORALE
                    </span>
                  )}
                  {roomType.effects.researchBonus && (
                    <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: '#8b5cf6', color: '#fff' }}>
                      +{Math.round(roomType.effects.researchBonus * 100)}% RESEARCH
                    </span>
                  )}
                  {roomType.effects.reputationBonus && (
                    <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: '#ec4899', color: '#fff' }}>
                      +{roomType.effects.reputationBonus} REP/DAY
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          
          {availableRooms.length === 0 && (
            <p className="text-[10px] text-center py-4" style={{ color: '#64748b' }}>
              No rooms available. Upgrade your office or hire more employees.
            </p>
          )}
        </div>
      )}
      
      {/* Manage tab */}
      {activeTab === 'manage' && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {selectedPlacedRoom && (
            <div
              className="p-3 rounded mb-3"
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid #22c55e',
              }}
            >
              {(() => {
                const roomType = roomTypes.find(r => r.id === selectedPlacedRoom.typeId);
                if (!roomType) return null;
                const upgradeCost = getUpgradeCost(selectedPlacedRoom);
                const canUpgrade = selectedPlacedRoom.level < 3 && roomType.upgradable && money >= upgradeCost;
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold" style={{ color: '#fff' }}>
                        {roomType.icon} {roomType.name} (Lv.{selectedPlacedRoom.level})
                      </span>
                      <button
                        onClick={() => onSelectPlacedRoom(null)}
                        className="text-[8px] px-1"
                        style={{ color: '#94a3b8' }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="text-[8px] mb-2" style={{ color: '#94a3b8' }}>
                      Position: ({selectedPlacedRoom.gridX}, {selectedPlacedRoom.gridY})
                    </div>
                    
                    <div className="flex gap-2">
                      {roomType.upgradable && selectedPlacedRoom.level < 3 && (
                        <button
                          onClick={() => upgradeRoom(selectedPlacedRoom.id)}
                          disabled={!canUpgrade}
                          className="flex-1 py-2 text-[9px] font-bold rounded"
                          style={{
                            background: canUpgrade
                              ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                              : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                            color: canUpgrade ? '#fff' : '#64748b',
                            border: `2px solid ${canUpgrade ? '#22c55e' : '#475569'}`,
                          }}
                        >
                          ⬆️ UPGRADE ${upgradeCost.toLocaleString()}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          removeRoom(selectedPlacedRoom.id);
                          onSelectPlacedRoom(null);
                        }}
                        className="flex-1 py-2 text-[9px] font-bold rounded"
                        style={{
                          background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                          color: '#fff',
                          border: '2px solid #ef4444',
                        }}
                      >
                        🗑️ REMOVE
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          
          {office.rooms.length === 0 ? (
            <p className="text-[10px] text-center py-4" style={{ color: '#64748b' }}>
              No rooms placed yet. Switch to BUILD tab to add rooms.
            </p>
          ) : (
            office.rooms.map((room) => {
              const roomType = roomTypes.find(r => r.id === room.typeId);
              if (!roomType) return null;
              const isSelected = selectedPlacedRoom?.id === room.id;
              
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectPlacedRoom(isSelected ? null : room)}
                  className="w-full p-3 rounded text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                      : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    border: `2px solid ${isSelected ? '#22c55e' : '#475569'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: '#fff' }}>
                      {roomType.icon} {roomType.name}
                    </span>
                    <span className="text-[9px]" style={{ color: '#0ea5e9' }}>
                      Lv.{room.level}
                    </span>
                  </div>
                  <div className="text-[8px] mt-1" style={{ color: '#64748b' }}>
                    Position: ({room.gridX}, {room.gridY}) | Condition: {room.condition}%
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
      
      {/* Bonuses tab */}
      {activeTab === 'bonuses' && (
        <div className="space-y-3">
          <p className="text-[9px]" style={{ color: '#94a3b8' }}>
            Total bonuses from all {office.rooms.length} room(s):
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded" style={{ background: 'rgba(14, 165, 233, 0.2)', border: '1px solid #0ea5e9' }}>
              <div className="text-[8px]" style={{ color: '#0ea5e9' }}>PRODUCTIVITY</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                +{Math.round((roomBonuses.productivityBonus ?? 0) * 100)}%
              </div>
            </div>
            
            <div className="p-2 rounded" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b' }}>
              <div className="text-[8px]" style={{ color: '#f59e0b' }}>MORALE/DAY</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                +{(roomBonuses.moraleBonus ?? 0).toFixed(1)}
              </div>
            </div>
            
            <div className="p-2 rounded" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6' }}>
              <div className="text-[8px]" style={{ color: '#8b5cf6' }}>RESEARCH</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                +{Math.round((roomBonuses.researchBonus ?? 0) * 100)}%
              </div>
            </div>
            
            <div className="p-2 rounded" style={{ background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899' }}>
              <div className="text-[8px]" style={{ color: '#ec4899' }}>REP/DAY</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                +{(roomBonuses.reputationBonus ?? 0).toFixed(1)}
              </div>
            </div>
            
            <div className="p-2 rounded" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e' }}>
              <div className="text-[8px]" style={{ color: '#22c55e' }}>TEAMWORK</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                +{Math.round((roomBonuses.teamworkBonus ?? 0) * 100)}%
              </div>
            </div>
            
            <div className="p-2 rounded" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}>
              <div className="text-[8px]" style={{ color: '#ef4444' }}>BURNOUT REDUCTION</div>
              <div className="text-[12px] font-bold" style={{ color: '#fff' }}>
                -{Math.round((roomBonuses.burnoutReduction ?? 0) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700">
            <div className="text-[8px]" style={{ color: '#64748b' }}>
              DESK CAPACITY BONUS: +{roomBonuses.capacityBonus ?? 0}
            </div>
            <div className="text-[8px]" style={{ color: '#64748b' }}>
              EVENT BONUS: +{Math.round((roomBonuses.eventBonus ?? 0) * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
