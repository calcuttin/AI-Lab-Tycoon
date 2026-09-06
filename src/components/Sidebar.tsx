import type { View } from "./GameScreen";
import Icon, { type IconName } from "./ui/Icon";
import { useGameStore } from "../store/gameStore";

const groups: {
  label: string;
  items: { id: View; label: string; icon: IconName; key?: string }[];
}[] = [
  {
    label: "YOUR STARTUP",
    items: [
      { id: "office", label: "Headquarters", icon: "office", key: "O" },
      { id: "projects", label: "Projects", icon: "projects", key: "P" },
      { id: "employees", label: "Team", icon: "team", key: "E" },
      { id: "research", label: "Research lab", icon: "research", key: "R" },
      { id: "contracts", label: "Contracts", icon: "contract" },
    ],
  },
  {
    label: "THE BIG PICTURE",
    items: [
      { id: "market", label: "The Valley", icon: "chart", key: "M" },
      { id: "statistics", label: "Company metrics", icon: "chart", key: "I" },
      { id: "milestones", label: "Milestones", icon: "flag" },
      { id: "achievements", label: "Achievements", icon: "trophy" },
    ],
  },
  {
    label: "PEOPLE OPERATIONS",
    items: [
      { id: "training", label: "Training", icon: "learn", key: "T" },
      { id: "policies", label: "Culture & policies", icon: "settings" },
    ],
  },
];
export default function Sidebar({
  currentView,
  setCurrentView,
}: {
  currentView: View;
  setCurrentView: (view: View) => void;
}) {
  const funding = useGameStore((s) => s.fundingRound);
  return (
    <aside className="app-sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="chip" size={24} />
        </span>
        <div>
          AI LAB<span>TYCOON</span>
        </div>
      </div>
      <div className="workspace-label">
        <span className="workspace-avatar">A</span>
        <div>
          Your very real company
          <small>
            {funding === "none" ? "Bootstrapped" : funding} stage · Private
            workspace
          </small>
        </div>
      </div>
      <nav aria-label="Main navigation">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? "is-active" : ""}`}
                aria-current={currentView === item.id ? "page" : undefined}
                onClick={() => setCurrentView(item.id)}
                title={item.label}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.key && <kbd>{item.key}</kbd>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="status-dot" />
        <span>
          Making the world a better place.
          <small>Terms and conditions apply.</small>
        </span>
      </div>
    </aside>
  );
}
