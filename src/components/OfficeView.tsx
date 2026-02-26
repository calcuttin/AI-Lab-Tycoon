import { useState } from 'react';
import { useGameStore, calculateUpgradeBonuses } from '../store/gameStore';

const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.85; transform: scale(1.15); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
    50% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.6); }
  }
  @keyframes decoFloat {
    0%, 100% { transform: translate(-50%, -50%) translateY(0); opacity: inherit; }
    50% { transform: translate(-50%, -50%) translateY(-3px); opacity: 0.9; }
  }
  @keyframes slotPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.94; }
  }
  @keyframes shine {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes tierGlow {
    0%, 100% { filter: drop-shadow(0 0 4px var(--tier-color, transparent)); }
    50% { filter: drop-shadow(0 0 12px var(--tier-color, transparent)) drop-shadow(0 0 20px var(--tier-color, transparent)); }
  }
  .office-slot-2d:hover {
    box-shadow: 0 10px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .office-slot-empty {
    animation: slotPulse 3s ease-in-out infinite;
  }
  .tier-2 { --tier-color: rgba(14, 165, 233, 0.5); animation: tierGlow 3s ease-in-out infinite; }
  .tier-3 { --tier-color: rgba(168, 85, 247, 0.6); animation: tierGlow 2.5s ease-in-out infinite; }
  .tier-max { --tier-color: rgba(251, 191, 36, 0.7); animation: tierGlow 2s ease-in-out infinite; }
`;
import { 
  getLayoutById, 
  getUpgradesForSlot, 
  getUpgradeById,
  type UpgradeSlot,
  type UpgradeOption,
  officeLayouts,
  type OfficeSizeId,
} from '../data/officeLayouts';

// Slot type colors and icons
const slotTypeStyles: Record<string, { color: string; icon: string; label: string }> = {
  workstation: { color: '#0ea5e9', icon: '💻', label: 'Workstation' },
  amenity: { color: '#f59e0b', icon: '☕', label: 'Amenity' },
  infrastructure: { color: '#8b5cf6', icon: '🖥️', label: 'Infrastructure' },
  wellness: { color: '#22c55e', icon: '🧘', label: 'Wellness' },
  executive: { color: '#ec4899', icon: '👔', label: 'Executive' },
  utility: { color: '#64748b', icon: '📦', label: 'Utility' },
};

// Upgrade visual representations
const upgradeVisuals: Record<string, { items: Array<{ emoji: string; x: number; y: number; size: number }> }> = {
  basic_desks: {
    items: [
      { emoji: '🖥️', x: 20, y: 30, size: 32 },
      { emoji: '🪑', x: 20, y: 55, size: 24 },
      { emoji: '🖥️', x: 50, y: 30, size: 32 },
      { emoji: '🪑', x: 50, y: 55, size: 24 },
      { emoji: '📋', x: 80, y: 40, size: 20 },
    ],
  },
  dev_workstations: {
    items: [
      { emoji: '🖥️', x: 15, y: 25, size: 36 },
      { emoji: '🖥️', x: 15, y: 45, size: 28 },
      { emoji: '🪑', x: 15, y: 65, size: 24 },
      { emoji: '🖥️', x: 45, y: 25, size: 36 },
      { emoji: '🖥️', x: 45, y: 45, size: 28 },
      { emoji: '🪑', x: 45, y: 65, size: 24 },
      { emoji: '🖥️', x: 75, y: 25, size: 36 },
      { emoji: '🪑', x: 75, y: 65, size: 24 },
      { emoji: '☕', x: 85, y: 20, size: 18 },
    ],
  },
  standing_desks: {
    items: [
      { emoji: '🧍', x: 25, y: 40, size: 32 },
      { emoji: '🖥️', x: 25, y: 25, size: 28 },
      { emoji: '🧍', x: 55, y: 40, size: 32 },
      { emoji: '🖥️', x: 55, y: 25, size: 28 },
      { emoji: '🌱', x: 80, y: 60, size: 24 },
    ],
  },
  pod_workstations: {
    items: [
      { emoji: '🎧', x: 30, y: 30, size: 28 },
      { emoji: '💻', x: 30, y: 50, size: 32 },
      { emoji: '🎧', x: 70, y: 30, size: 28 },
      { emoji: '💻', x: 70, y: 50, size: 32 },
    ],
  },
  coffee_corner: {
    items: [
      { emoji: '☕', x: 30, y: 30, size: 40 },
      { emoji: '🍩', x: 60, y: 35, size: 28 },
      { emoji: '🥐', x: 45, y: 55, size: 24 },
      { emoji: '🧁', x: 70, y: 60, size: 22 },
    ],
  },
  snack_bar: {
    items: [
      { emoji: '🍿', x: 20, y: 30, size: 32 },
      { emoji: '🥤', x: 45, y: 25, size: 36 },
      { emoji: '🍫', x: 70, y: 35, size: 28 },
      { emoji: '🍪', x: 35, y: 55, size: 24 },
      { emoji: '🧃', x: 60, y: 60, size: 26 },
    ],
  },
  game_corner: {
    items: [
      { emoji: '🎮', x: 25, y: 30, size: 36 },
      { emoji: '🏓', x: 55, y: 35, size: 40 },
      { emoji: '🎯', x: 80, y: 25, size: 32 },
      { emoji: '🛋️', x: 40, y: 65, size: 28 },
    ],
  },
  full_kitchen: {
    items: [
      { emoji: '🍳', x: 20, y: 25, size: 32 },
      { emoji: '🧊', x: 45, y: 20, size: 40 },
      { emoji: '🍽️', x: 70, y: 30, size: 28 },
      { emoji: '🪑', x: 30, y: 60, size: 24 },
      { emoji: '🪑', x: 50, y: 60, size: 24 },
      { emoji: '🪑', x: 70, y: 60, size: 24 },
    ],
  },
  server_closet: {
    items: [
      { emoji: '🖥️', x: 35, y: 30, size: 40 },
      { emoji: '💾', x: 60, y: 35, size: 28 },
      { emoji: '🔌', x: 50, y: 60, size: 24 },
    ],
  },
  server_room: {
    items: [
      { emoji: '🏭', x: 25, y: 25, size: 44 },
      { emoji: '🖥️', x: 55, y: 30, size: 36 },
      { emoji: '🖥️', x: 75, y: 30, size: 36 },
      { emoji: '❄️', x: 40, y: 60, size: 28 },
      { emoji: '🔌', x: 65, y: 65, size: 22 },
    ],
  },
  meeting_booth: {
    items: [
      { emoji: '📞', x: 40, y: 30, size: 36 },
      { emoji: '🪑', x: 40, y: 55, size: 28 },
      { emoji: '🔇', x: 65, y: 25, size: 22 },
    ],
  },
  conference_room: {
    items: [
      { emoji: '📊', x: 50, y: 20, size: 36 },
      { emoji: '🪑', x: 20, y: 50, size: 22 },
      { emoji: '🪑', x: 35, y: 50, size: 22 },
      { emoji: '🪑', x: 50, y: 50, size: 22 },
      { emoji: '🪑', x: 65, y: 50, size: 22 },
      { emoji: '🪑', x: 80, y: 50, size: 22 },
      { emoji: '📝', x: 30, y: 70, size: 20 },
    ],
  },
  nap_corner: {
    items: [
      { emoji: '😴', x: 35, y: 35, size: 32 },
      { emoji: '🛋️', x: 35, y: 55, size: 36 },
      { emoji: '💤', x: 55, y: 25, size: 24 },
      { emoji: '🌙', x: 70, y: 30, size: 22 },
    ],
  },
  meditation_space: {
    items: [
      { emoji: '🧘', x: 35, y: 40, size: 40 },
      { emoji: '🕯️', x: 20, y: 30, size: 24 },
      { emoji: '🪷', x: 65, y: 35, size: 28 },
      { emoji: '🌿', x: 75, y: 55, size: 26 },
    ],
  },
  gym_corner: {
    items: [
      { emoji: '🏋️', x: 30, y: 35, size: 36 },
      { emoji: '🚴', x: 60, y: 40, size: 32 },
      { emoji: '💪', x: 45, y: 65, size: 24 },
    ],
  },
  full_gym: {
    items: [
      { emoji: '🏋️', x: 20, y: 30, size: 40 },
      { emoji: '🚴', x: 45, y: 35, size: 36 },
      { emoji: '🏃', x: 70, y: 30, size: 36 },
      { emoji: '🧘', x: 35, y: 60, size: 28 },
      { emoji: '🚿', x: 80, y: 60, size: 24 },
    ],
  },
  reception_desk: {
    items: [
      { emoji: '🛎️', x: 40, y: 35, size: 32 },
      { emoji: '💐', x: 65, y: 30, size: 28 },
      { emoji: '🪑', x: 40, y: 55, size: 26 },
      { emoji: '📋', x: 25, y: 40, size: 22 },
    ],
  },
  exec_office: {
    items: [
      { emoji: '👔', x: 40, y: 30, size: 28 },
      { emoji: '🪑', x: 40, y: 50, size: 32 },
      { emoji: '🖼️', x: 70, y: 25, size: 24 },
      { emoji: '🏆', x: 20, y: 35, size: 26 },
      { emoji: '📈', x: 65, y: 55, size: 22 },
    ],
  },
  lobby: {
    items: [
      { emoji: '🏛️', x: 50, y: 20, size: 44 },
      { emoji: '🛋️', x: 25, y: 50, size: 32 },
      { emoji: '🛋️', x: 70, y: 50, size: 32 },
      { emoji: '🌳', x: 15, y: 35, size: 28 },
      { emoji: '🌳', x: 85, y: 35, size: 28 },
    ],
  },
  storage_closet: {
    items: [
      { emoji: '📦', x: 35, y: 35, size: 36 },
      { emoji: '📦', x: 55, y: 40, size: 32 },
      { emoji: '🗄️', x: 70, y: 30, size: 28 },
    ],
  },
  it_closet: {
    items: [
      { emoji: '🔌', x: 30, y: 35, size: 32 },
      { emoji: '📡', x: 55, y: 30, size: 28 },
      { emoji: '🔧', x: 70, y: 50, size: 24 },
    ],
  },
};

// Office background decorations
const officeDecorations: Record<OfficeSizeId, Array<{ emoji: string; x: number; y: number; size: number; opacity?: number }>> = {
  hacker_den: [
    { emoji: '🌙', x: 90, y: 5, size: 24, opacity: 0.6 },
    { emoji: '🪟', x: 5, y: 5, size: 28, opacity: 0.4 },
    { emoji: '📦', x: 88, y: 85, size: 20, opacity: 0.5 },
    { emoji: '🧹', x: 3, y: 80, size: 18, opacity: 0.4 },
    { emoji: '💡', x: 50, y: 3, size: 20, opacity: 0.7 },
    { emoji: '🎸', x: 92, y: 40, size: 22, opacity: 0.5 },
    { emoji: '🍕', x: 85, y: 15, size: 18, opacity: 0.4 },
  ],
  small: [
    { emoji: '🪟', x: 5, y: 5, size: 32, opacity: 0.5 },
    { emoji: '🪟', x: 30, y: 5, size: 32, opacity: 0.5 },
    { emoji: '🌿', x: 3, y: 45, size: 24, opacity: 0.6 },
    { emoji: '🚪', x: 92, y: 75, size: 28, opacity: 0.5 },
    { emoji: '💡', x: 50, y: 3, size: 22, opacity: 0.7 },
    { emoji: '🖼️', x: 88, y: 10, size: 20, opacity: 0.5 },
  ],
  medium: [
    { emoji: '🪟', x: 5, y: 3, size: 36, opacity: 0.5 },
    { emoji: '🪟', x: 25, y: 3, size: 36, opacity: 0.5 },
    { emoji: '🪟', x: 45, y: 3, size: 36, opacity: 0.5 },
    { emoji: '🌳', x: 3, y: 40, size: 28, opacity: 0.6 },
    { emoji: '🌳', x: 3, y: 70, size: 28, opacity: 0.6 },
    { emoji: '🚪', x: 92, y: 80, size: 30, opacity: 0.5 },
    { emoji: '🖼️', x: 88, y: 15, size: 24, opacity: 0.5 },
    { emoji: '🏢', x: 90, y: 3, size: 20, opacity: 0.4 },
  ],
  large: [
    { emoji: '🪟', x: 3, y: 3, size: 40, opacity: 0.5 },
    { emoji: '🪟', x: 18, y: 3, size: 40, opacity: 0.5 },
    { emoji: '🪟', x: 33, y: 3, size: 40, opacity: 0.5 },
    { emoji: '🪟', x: 48, y: 3, size: 40, opacity: 0.5 },
    { emoji: '🌳', x: 2, y: 35, size: 32, opacity: 0.6 },
    { emoji: '🌳', x: 2, y: 60, size: 32, opacity: 0.6 },
    { emoji: '🌳', x: 92, y: 45, size: 32, opacity: 0.6 },
    { emoji: '🚪', x: 90, y: 85, size: 32, opacity: 0.5 },
    { emoji: '🏛️', x: 50, y: 90, size: 24, opacity: 0.4 },
  ],
  campus: [
    { emoji: '☀️', x: 90, y: 3, size: 36, opacity: 0.7 },
    { emoji: '🏢', x: 3, y: 3, size: 32, opacity: 0.5 },
    { emoji: '🏢', x: 15, y: 3, size: 28, opacity: 0.4 },
    { emoji: '🌳', x: 2, y: 30, size: 36, opacity: 0.6 },
    { emoji: '🌳', x: 2, y: 50, size: 36, opacity: 0.6 },
    { emoji: '🌳', x: 2, y: 70, size: 36, opacity: 0.6 },
    { emoji: '🌳', x: 92, y: 25, size: 36, opacity: 0.6 },
    { emoji: '🌳', x: 92, y: 50, size: 36, opacity: 0.6 },
    { emoji: '⛲', x: 50, y: 88, size: 32, opacity: 0.6 },
    { emoji: '🚗', x: 88, y: 88, size: 24, opacity: 0.4 },
  ],
};

export default function OfficeView() {
  const office = useGameStore((state) => state.office);
  const employees = useGameStore((state) => state.employees);
  const money = useGameStore((state) => state.money);
  const upgradeOfficeSize = useGameStore((state) => state.upgradeOfficeSize);
  const installUpgrade = useGameStore((state) => state.installUpgrade);
  const upgradeSlot = useGameStore((state) => state.upgradeSlot);
  const removeSlotUpgrade = useGameStore((state) => state.removeSlotUpgrade);
  
  const [selectedSlot, setSelectedSlot] = useState<UpgradeSlot | null>(null);

  const layout = getLayoutById(office.size);
  if (!layout) return <div>Loading...</div>;

  // Get bonuses
  const bonuses = calculateUpgradeBonuses(office.installedUpgrades || []);

  // Size upgrade info
  const sizeOrder = officeLayouts.map(l => l.id);
  const currentSizeIndex = sizeOrder.indexOf(office.size);
  const canUpgradeSize = currentSizeIndex < sizeOrder.length - 1;
  const nextLayout = canUpgradeSize ? officeLayouts[currentSizeIndex + 1] : null;

  // Get installed upgrade for a slot
  const getInstalledUpgrade = (slotId: string) => {
    const installed = office.installedUpgrades?.find(u => u.slotId === slotId);
    if (!installed) return null;
    return { ...installed, upgrade: getUpgradeById(installed.upgradeId) };
  };

  // Handle slot click
  const handleSlotClick = (slot: UpgradeSlot) => {
    setSelectedSlot(slot);
  };

  // Handle upgrade selection
  const handleSelectUpgrade = (upgrade: UpgradeOption) => {
    if (!selectedSlot) return;
    installUpgrade(selectedSlot.id, upgrade.id);
    setSelectedSlot(null);
  };

  // Handle upgrade level up
  const handleUpgradeSlot = () => {
    if (!selectedSlot) return;
    upgradeSlot(selectedSlot.id);
  };

  // Handle remove upgrade
  const handleRemoveUpgrade = () => {
    if (!selectedSlot) return;
    removeSlotUpgrade(selectedSlot.id);
    setSelectedSlot(null);
  };

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: 'var(--font-pixel)' }}>
      {/* Inject animations */}
      <style>{animationStyles}</style>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
            🏢 {layout.name.toUpperCase()}
          </h2>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{layout.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            {employees.length} / {layout.baseCapacity + (bonuses.capacity || 0)} Staff
          </div>
          <div className="text-xs" style={{ color: '#ef4444' }}>
            Rent: ${layout.baseRent.toLocaleString()}/mo
          </div>
        </div>
      </div>

      {/* Bonus Bar */}
      <div
        className="flex flex-wrap gap-3 p-3 rounded-lg mb-4"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '3px solid #2d3748',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: '#0ea5e9' }}>⚡</span>
          <span className="text-sm" style={{ color: '#fff' }}>+{Math.round((bonuses.productivity || 0) * 100)}% Prod</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#f59e0b' }}>😊</span>
          <span className="text-sm" style={{ color: '#fff' }}>+{(bonuses.morale || 0).toFixed(1)}/day Morale</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#8b5cf6' }}>🔬</span>
          <span className="text-sm" style={{ color: '#fff' }}>+{Math.round((bonuses.research || 0) * 100)}% Research</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#ec4899' }}>⭐</span>
          <span className="text-sm" style={{ color: '#fff' }}>+{(bonuses.reputation || 0).toFixed(1)}/day Rep</span>
        </div>
        {canUpgradeSize && (
          <button
            onClick={upgradeOfficeSize}
            disabled={money < (nextLayout?.upgradeCost || 0)}
            className="ml-auto px-4 py-2 text-sm font-bold rounded-lg transition-all hover:scale-105"
            style={{
              background: money >= (nextLayout?.upgradeCost || 0)
                ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              color: money >= (nextLayout?.upgradeCost || 0) ? '#fff' : '#64748b',
              border: `3px solid ${money >= (nextLayout?.upgradeCost || 0) ? '#15803d' : '#475569'}`,
            }}
          >
            Expand to {nextLayout?.name} (${nextLayout?.upgradeCost.toLocaleString()})
          </button>
        )}
      </div>

      {/* Main Content: Office Layout + Menu */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Office Visual — Enhanced 2D: layered depth + fake light */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            flex: '2 1 0%',
            minWidth: 400,
            minHeight: 400,
            border: '4px solid #334155',
            boxShadow:
              'inset 0 0 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
            isolation: 'isolate',
          }}
        >
          {/* Layer 1: deep back (fake depth) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                layout.backgroundStyle === 'hacker'
                  ? 'linear-gradient(180deg, #0a0a14 0%, #0f0f1e 50%, #16213e 100%)'
                  : layout.backgroundStyle === 'campus'
                  ? 'linear-gradient(180deg, #032e23 0%, #064e3b 50%, #047857 100%)'
                  : 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
              transform: 'scale(1.02)',
              transformOrigin: 'center',
            }}
          />
          {/* Layer 2: main gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                layout.backgroundStyle === 'hacker'
                  ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 45%, #16213e 100%)'
                  : layout.backgroundStyle === 'modern'
                  ? 'linear-gradient(180deg, #1e293b 0%, #334155 45%, #1e293b 100%)'
                  : layout.backgroundStyle === 'premium'
                  ? 'linear-gradient(180deg, #1f2937 0%, #374151 45%, #1f2937 100%)'
                  : layout.backgroundStyle === 'campus'
                  ? 'linear-gradient(180deg, #064e3b 0%, #065f46 45%, #047857 100%)'
                  : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            }}
          />
          {/* Ceiling strip (room frame) */}
          <div
            className="absolute left-0 right-0 top-0 pointer-events-none"
            style={{
              height: '10%',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          />
          {/* Baseboard */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '5%',
              background:
                'linear-gradient(0deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          />
          {/* Fake light from top-left — stronger, style-specific tint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                layout.backgroundStyle === 'hacker'
                  ? 'radial-gradient(ellipse 75% 55% at 22% 18%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 25% 20%, rgba(255,255,255,0.06) 0%, transparent 55%)'
                  : layout.backgroundStyle === 'campus'
                  ? 'radial-gradient(ellipse 75% 55% at 22% 18%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 25% 20%, rgba(255,255,255,0.1) 0%, transparent 55%)'
                  : 'radial-gradient(ellipse 80% 60% at 25% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
            }}
          />
          {/* Floor pattern — style-specific */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                layout.backgroundStyle === 'hacker'
                  ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(45deg, transparent 0px, transparent 38px, rgba(99,102,241,0.03) 39px)'
                  : layout.backgroundStyle === 'campus'
                  ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 60px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 60px)'
                  : layout.backgroundStyle === 'premium'
                  ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 36px), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 36px)'
                  : 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 50px)',
              opacity: 0.65,
            }}
          />

          {/* Background decorations — some with gentle float */}
          {officeDecorations[office.size]?.map((deco, i) => {
            const floatable = ['💡', '🌙', '☀️', '✨'].includes(deco.emoji);
            return (
              <div
                key={`deco-${i}`}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${deco.x}%`,
                  top: `${deco.y}%`,
                  fontSize: deco.size,
                  opacity: deco.opacity ?? 0.55,
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
                  animation: floatable ? `decoFloat ${4 + (i % 3)}s ease-in-out infinite` : undefined,
                  animationDelay: floatable ? `${i * 0.4}s` : undefined,
                }}
              >
                {deco.emoji}
              </div>
            );
          })}

          {/* Office Layout Title — upgraded badge */}
          <div
            className="absolute top-4 left-4 z-20"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              border: '2px solid rgba(14, 165, 233, 0.4)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-sm font-bold" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              🏢 {layout.name}
            </span>
          </div>

          {/* Slots */}
          {layout.slots.map((slot) => {
            const installed = getInstalledUpgrade(slot.id);
            const style = slotTypeStyles[slot.type];
            const isSelected = selectedSlot?.id === slot.id;
            const visuals = installed?.upgradeId ? upgradeVisuals[installed.upgradeId] : null;
            const empty = !installed;

            return (
              <button
                key={slot.id}
                aria-label={`${slot.name} - ${installed ? 'Click to manage' : 'Click to add upgrade'}`}
                className={`absolute cursor-pointer transition-all duration-200 hover:scale-[1.03] overflow-hidden office-slot-2d ${empty ? 'office-slot-empty' : ''}`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  zIndex: 10,
                  background: installed
                    ? `linear-gradient(165deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.9) 100%)`
                    : 'linear-gradient(165deg, rgba(51,65,85,0.2) 0%, rgba(30,41,59,0.25) 100%)',
                  border: `3px ${installed ? 'solid' : 'dashed'} ${isSelected ? '#fff' : installed ? style.color : 'rgba(148,163,184,0.6)'}`,
                  borderRadius: 12,
                  boxShadow: isSelected
                    ? `0 0 28px ${style.color}, inset 0 0 35px ${style.color}40, inset 0 2px 0 rgba(255,255,255,0.15)`
                    : installed
                    ? `0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 0 20px ${style.color}18`
                    : 'inset 0 2px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(148,163,184,0.2)',
                }}
                onClick={() => handleSlotClick(slot)}
              >
                {/* Installed upgrade with visual furniture */}
                {installed && installed.upgrade && visuals ? (
                  <div className={`relative w-full h-full ${installed.level >= (installed.upgrade.maxLevel ?? 3) ? 'tier-max' : installed.level >= 3 ? 'tier-3' : installed.level >= 2 ? 'tier-2' : ''}`}>
                    {/* Furniture items */}
                    {visuals.items.map((item, i) => (
                      <span
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          fontSize: item.size,
                          transform: 'translate(-50%, -50%)',
                          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        }}
                      >
                        {item.emoji}
                      </span>
                    ))}
                    {/* Sparkle effects for high-level upgrades */}
                    {installed.level >= 2 && (
                      <>
                        {Array.from({ length: installed.level }).map((_, i) => (
                          <span
                            key={`sparkle-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${20 + i * 25}%`,
                              top: `${15 + (i % 2) * 40}%`,
                              fontSize: 10,
                              animation: `sparkle ${2 + i * 0.5}s ease-in-out infinite`,
                              animationDelay: `${i * 0.7}s`,
                            }}
                          >
                            {installed.level >= 3 ? '✨' : '💫'}
                          </span>
                        ))}
                      </>
                    )}
                    {/* Level stars */}
                    {installed.level > 1 && (
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        {Array.from({ length: installed.level }).map((_, i) => (
                          <span key={i} style={{ color: '#fbbf24', fontSize: 12, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))', textShadow: '0 0 4px rgba(251,191,36,0.5)' }}>★</span>
                        ))}
                      </div>
                    )}
                    {/* Name label */}
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md"
                      style={{
                        background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                        maxWidth: '90%',
                      }}
                    >
                      <span className="text-xs font-bold truncate block" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {installed.upgrade.name}
                      </span>
                    </div>
                  </div>
                ) : installed && installed.upgrade ? (
                  /* Fallback for upgrades without visuals */
                  <div className="h-full flex flex-col items-center justify-center p-2">
                    <span style={{ fontSize: 36, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>{installed.upgrade.icon}</span>
                    <span 
                      className="text-xs font-bold text-center mt-2 px-2 py-0.5 rounded" 
                      style={{ color: '#fff', background: 'rgba(0,0,0,0.6)' }}
                    >
                      {installed.upgrade.name}
                    </span>
                    {installed.level > 1 && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: installed.level }).map((_, i) => (
                          <span key={i} style={{ color: '#fbbf24', fontSize: 12 }}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty slot */
                  <div className="h-full flex flex-col items-center justify-center p-2">
                    <span
                      style={{
                        fontSize: 36,
                        opacity: 0.5,
                        filter: 'grayscale(0.4) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      }}
                    >
                      {style.icon}
                    </span>
                    <span
                      className="text-xs text-center mt-2 font-medium"
                      style={{ color: '#94a3b8', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {slot.name}
                    </span>
                    <span
                      className="text-xs mt-2 px-4 py-1.5 rounded-lg font-bold transition-all duration-200 hover:scale-110"
                      style={{
                        background: `linear-gradient(180deg, ${style.color} 0%, ${style.color}cc 100%)`,
                        color: '#fff',
                        fontSize: 10,
                        border: '1px solid rgba(255,255,255,0.25)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      + ADD
                    </span>
                  </div>
                )}
              </button>
            );
          })}
          
          {/* Ambient lighting — subtle tinted glows */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 28% 22%, rgba(14, 165, 233, 0.07) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 72% 78%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
            }}
          />
          {/* Vignette — corner darkening */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.12) 100%)',
            }}
          />

          {/* Employees working — slightly larger, float */}
          {employees.slice(0, Math.min(8, employees.length)).map((emp, i) => {
            const positions = [
              { x: 25, y: 45 }, { x: 35, y: 50 }, { x: 28, y: 55 },
              { x: 65, y: 35 }, { x: 72, y: 45 }, { x: 68, y: 55 },
              { x: 45, y: 75 }, { x: 55, y: 78 },
            ];
            const pos = positions[i % positions.length];
            const roleEmojis: Record<string, string[]> = {
              engineer: ['👨‍💻', '👩‍💻', '🧑‍💻'],
              researcher: ['👨‍🔬', '👩‍🔬', '🔬'],
              designer: ['👨‍🎨', '👩‍🎨', '🎨'],
              manager: ['👨‍💼', '👩‍💼', '📊'],
              intern: ['🧑‍🎓', '👨‍🎓', '📚'],
            };
            const emojis = roleEmojis[emp.role] || ['🧑‍💻'];
            const emoji = emojis[i % emojis.length];
            return (
              <div
                key={emp.id}
                className="absolute pointer-events-none z-5"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  fontSize: 26,
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
                  animation: `float ${2.2 + (i % 3) * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.25}s`,
                }}
              >
                {emoji}
                <span
                  className="absolute -top-2 -right-2"
                  style={{
                    fontSize: 11,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                  }}
                >
                  {emp.morale > 80 ? '😊' : emp.morale > 50 ? '😐' : '😟'}
                </span>
              </div>
            );
          })}

          {/* Activity particles — more visible */}
          {(office.installedUpgrades || []).length > 1 && (
            <>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '30%',
                  top: '25%',
                  fontSize: 18,
                  opacity: 0.7,
                  animation: 'pulse 2s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
                }}
              >
                ✨
              </div>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '70%',
                  top: '65%',
                  fontSize: 14,
                  opacity: 0.6,
                  animation: 'pulse 2.5s ease-in-out infinite',
                  animationDelay: '0.5s',
                  filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
                }}
              >
                💫
              </div>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '52%',
                  top: '48%',
                  fontSize: 12,
                  opacity: 0.45,
                  animation: 'pulse 3s ease-in-out infinite',
                  animationDelay: '1.2s',
                }}
              >
                ✨
              </div>
            </>
          )}
        </div>

        {/* Upgrade Menu (Large and Readable) */}
        <div
          className="rounded-lg overflow-hidden flex flex-col"
          style={{
            flex: '1 1 0%',
            minWidth: 280,
            maxWidth: 350,
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #2d3748',
          }}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold" style={{ color: '#0ea5e9' }}>
              {selectedSlot ? `${slotTypeStyles[selectedSlot.type].icon} ${selectedSlot.name}` : '🏗️ Select a Slot'}
            </h3>
            {selectedSlot && (
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                {slotTypeStyles[selectedSlot.type].label} slot - Click an upgrade to install
              </p>
            )}
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedSlot ? (
              <>
                {/* Currently Installed */}
                {(() => {
                  const installed = getInstalledUpgrade(selectedSlot.id);
                  if (installed && installed.upgrade) {
                    const upgradeCost = Math.floor(installed.upgrade.cost * (installed.level * 0.6));
                    const canUpgrade = installed.level < installed.upgrade.maxLevel && money >= upgradeCost;
                    
                    return (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, #22c55e20 0%, #16a34a10 100%)',
                          border: '2px solid #22c55e',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span style={{ fontSize: 40 }}>{installed.upgrade.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold" style={{ color: '#fff' }}>
                                {installed.upgrade.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#22c55e', color: '#fff' }}>
                                LV.{installed.level}
                              </span>
                            </div>
                            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                              {installed.upgrade.description}
                            </p>
                            <div className="flex gap-2 mt-3">
                              {installed.level < installed.upgrade.maxLevel && (
                                <button
                                  onClick={handleUpgradeSlot}
                                  disabled={!canUpgrade}
                                  className="px-4 py-2 text-sm font-bold rounded transition-all"
                                  style={{
                                    background: canUpgrade 
                                      ? 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)'
                                      : '#334155',
                                    color: canUpgrade ? '#fff' : '#64748b',
                                    border: `2px solid ${canUpgrade ? '#0ea5e9' : '#475569'}`,
                                  }}
                                >
                                  ⬆️ Upgrade (${upgradeCost.toLocaleString()})
                                </button>
                              )}
                              <button
                                onClick={handleRemoveUpgrade}
                                className="px-4 py-2 text-sm font-bold rounded transition-all"
                                style={{
                                  background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                                  color: '#fff',
                                  border: '2px solid #ef4444',
                                }}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Available Upgrades */}
                {!getInstalledUpgrade(selectedSlot.id) && (
                  <>
                    <h4 className="text-sm font-bold" style={{ color: '#94a3b8' }}>
                      Available Upgrades
                    </h4>
                    {getUpgradesForSlot(selectedSlot.type, office.size).map((upgrade) => {
                      const canAfford = money >= upgrade.cost;
                      
                      return (
                        <button
                          key={upgrade.id}
                          onClick={() => handleSelectUpgrade(upgrade)}
                          disabled={!canAfford}
                          className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                            border: `2px solid ${canAfford ? '#22c55e' : '#475569'}`,
                            opacity: canAfford ? 1 : 0.6,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span style={{ fontSize: 36 }}>{upgrade.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-bold" style={{ color: '#fff' }}>
                                  {upgrade.name}
                                </span>
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: canAfford ? '#22c55e' : '#ef4444' }}
                                >
                                  ${upgrade.cost.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                                {upgrade.description}
                              </p>
                              {/* Effects */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {upgrade.effects.productivity && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#0ea5e9', color: '#fff' }}>
                                    +{Math.round(upgrade.effects.productivity * 100)}% Prod
                                  </span>
                                )}
                                {upgrade.effects.morale && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#fff' }}>
                                    +{upgrade.effects.morale} Morale
                                  </span>
                                )}
                                {upgrade.effects.research && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#8b5cf6', color: '#fff' }}>
                                    +{Math.round(upgrade.effects.research * 100)}% Research
                                  </span>
                                )}
                                {upgrade.effects.reputation && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#ec4899', color: '#fff' }}>
                                    +{upgrade.effects.reputation} Rep
                                  </span>
                                )}
                                {upgrade.effects.capacity && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#22c55e', color: '#fff' }}>
                                    +{upgrade.effects.capacity} Capacity
                                  </span>
                                )}
                                {upgrade.effects.burnoutReduction && (
                                  <span className="text-xs px-2 py-1 rounded" style={{ background: '#14b8a6', color: '#fff' }}>
                                    -{Math.round(upgrade.effects.burnoutReduction * 100)}% Burnout
                                  </span>
                                )}
                              </div>
                              {upgrade.maxLevel > 1 && (
                                <div className="text-xs mt-2" style={{ color: '#64748b' }}>
                                  Upgradable to Lv.{upgrade.maxLevel}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Close button */}
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="w-full py-3 text-sm font-bold rounded-lg mt-4"
                  style={{
                    background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                    color: '#94a3b8',
                    border: '2px solid #475569',
                  }}
                >
                  ✕ Close
                </button>
              </>
            ) : (
              /* No slot selected - show summary */
              <div className="space-y-4">
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Click on a slot in your office to install or upgrade equipment.
                </p>
                
                <h4 className="text-sm font-bold mt-4" style={{ color: '#fff' }}>
                  Installed Upgrades ({office.installedUpgrades?.length || 0})
                </h4>
                
                {(office.installedUpgrades || []).map((installed) => {
                  const upgrade = getUpgradeById(installed.upgradeId);
                  if (!upgrade) return null;
                  const slot = layout.slots.find(s => s.id === installed.slotId);
                  
                  return (
                    <div
                      key={installed.slotId}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      onClick={() => {
                        if (slot) handleSlotClick(slot);
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{upgrade.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold" style={{ color: '#fff' }}>
                          {upgrade.name}
                        </div>
                        <div className="text-xs" style={{ color: '#64748b' }}>
                          {slot?.name || installed.slotId} • Lv.{installed.level}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(office.installedUpgrades?.length || 0) === 0 && (
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    No upgrades installed yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
