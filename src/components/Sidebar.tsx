import { playSound } from '../systems/audio';

type View = 'projects' | 'research' | 'employees' | 'office' | 'market' | 'milestones' | 'statistics' | 'training' | 'policies' | 'contracts' | 'achievements';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const shortcutKeys: Partial<Record<View, string>> = {
  projects: 'P',
  research: 'R',
  employees: 'E',
  office: 'O',
  market: 'M',
  training: 'T',
  statistics: 'I',
};

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'projects', label: 'PROJECTS', icon: '📁' },
    { id: 'research', label: 'RESEARCH', icon: '🔬' },
    { id: 'employees', label: 'TEAM', icon: '👥' },
    { id: 'office', label: 'OFFICE', icon: '🏢' },
    { id: 'market', label: 'MARKET', icon: '📊' },
    { id: 'milestones', label: 'MILESTONES', icon: '🏁' },
    { id: 'statistics', label: 'STATS', icon: '📈' },
    { id: 'training', label: 'TRAINING', icon: '🎓' },
    { id: 'policies', label: 'POLICIES', icon: '🧩' },
    { id: 'contracts', label: 'CONTRACTS', icon: '📋' },
    { id: 'achievements', label: 'ACHIEVEMENTS', icon: '🏆' },
  ];

  return (
    <div
      className="w-72 p-6 border-r-4"
      style={{
        background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
        borderColor: '#2d3748',
        fontFamily: 'var(--font-pixel)',
      }}
    >
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const shortcut = shortcutKeys[item.id];
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound('click');
                setCurrentView(item.id);
              }}
              className="w-full text-left px-6 py-4.5 rounded transition-all flex items-center gap-5 hover:scale-[1.02] active:scale-[0.98] relative"
              style={{
                background:
                  currentView === item.id
                    ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                    : 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                color: currentView === item.id ? '#fff' : '#94a3b8',
                border: `3px solid ${currentView === item.id ? '#0369a1' : '#475569'}`,
                boxShadow: currentView === item.id
                  ? '0 0 15px rgba(14, 165, 233, 0.3), 3px 3px 0 rgba(0,0,0,0.3)'
                  : '3px 3px 0 rgba(0,0,0,0.3)',
                fontSize: '15px',
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-bold tracking-wide flex-1">{item.label}</span>
              {shortcut && (
                <span
                  style={{
                    fontSize: 7,
                    color: currentView === item.id ? 'rgba(255,255,255,0.6)' : '#64748b',
                    background: currentView === item.id ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
                    padding: '2px 5px',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {shortcut}
                </span>
              )}
              {currentView === item.id && (
                <div
                  className="absolute right-2 w-2 h-2 rounded-full"
                  style={{
                    background: '#fff',
                    boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
