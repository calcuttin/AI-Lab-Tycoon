import { lazy, Suspense, useState } from "react";
import { useGameStore, calculateUpgradeBonuses } from "../store/gameStore";
import {
  getLayoutById,
  getUpgradesForSlot,
  getUpgradeById,
  officeLayouts,
  type UpgradeSlotType,
} from "../data/officeLayouts";
import { getFurnishingAreas } from "../data/officeRelocation";
import { Button, Badge, Modal, PageHeader } from "./ui/Primitives";
import Icon, { type IconName } from "./ui/Icon";
import type { View } from "./GameScreen";
const OfficeScene = lazy(() => import("./OfficeScene"));
const icons: Record<UpgradeSlotType, IconName> = {
  workstation: "chip",
  amenity: "coffee",
  infrastructure: "research",
  wellness: "leaf",
  executive: "office",
  utility: "box",
};
const dollars = (value: number) =>
  `$${Math.round(value).toLocaleString("en-US")}`;

export default function OfficeView({
  navigate,
}: {
  navigate?: (view: View) => void;
}) {
  const office = useGameStore((s) => s.office);
  const employees = useGameStore((s) => s.employees);
  const money = useGameStore((s) => s.money);
  const projects = useGameStore((s) => s.projects);
  const reputation = useGameStore((s) => s.reputation);
  const research = useGameStore((s) => s.researchPoints);
  const days = useGameStore((s) => s.daysPlayed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expand, setExpand] = useState(false);
  const layout = getLayoutById(office.size)!;
  const bonuses = calculateUpgradeBonuses(office.installedUpgrades || []);
  const areas = getFurnishingAreas(office.size, office.installedUpgrades);
  const selected = areas.find((s) => s.id === selectedId);
  const installed = office.installedUpgrades.find(
    (u) => u.slotId === selectedId,
  );
  const upgrade = installed && getUpgradeById(installed.upgradeId);
  const next =
    officeLayouts[officeLayouts.findIndex((l) => l.id === office.size) + 1];
  const salaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const overhead = salaries + office.rent;
  const morale = employees.length
    ? Math.round(
        employees.reduce((sum, e) => sum + e.morale, 0) / employees.length,
      )
    : 0;
  const working = employees.filter((e) =>
    projects.some((p) => p.team.includes(e.id)),
  ).length;
  const upgrades = selected
    ? getUpgradesForSlot(selected.type, office.size)
    : [];
  const levelCost =
    installed && upgrade ? Math.floor(upgrade.cost * installed.level * 0.6) : 0;
  return (
    <div className="headquarters">
      <PageHeader
        eyebrow="BUILD SOMETHING. PREFERABLY A BUSINESS."
        title="Your little corner of the Valley."
        description="Big ideas. Borrowed furniture. A completely reasonable burn rate."
        action={
          <Button
            icon="plus"
            variant="primary"
            onClick={() =>
              navigate?.(employees.length ? "projects" : "employees")
            }
          >
            {employees.length ? "Start a project" : "Hire your first teammate"}
          </Button>
        }
      />
      <div className="metrics-grid">
        <div className="metric">
          <span>
            Cash in the bank <Icon name="chart" size={15} />
          </span>
          <strong>{dollars(money)}</strong>
          <small>
            {overhead > 0
              ? `${Math.max(0, money / overhead).toFixed(1)} months of overhead covered`
              : "No overhead. Suspiciously efficient."}
          </small>
          <div className="metric-line mint" />
        </div>
        <div className="metric">
          <span>
            Monthly overhead <Icon name="contract" size={15} />
          </span>
          <strong>
            {dollars(overhead)}
            <em>/ mo</em>
          </strong>
          <small>Payroll + rent. The price of disruption.</small>
          <div className="metric-line amber" />
        </div>
        <div className="metric">
          <span>
            Team morale <Icon name="team" size={15} />
          </span>
          <strong>
            {morale}
            <em>/ 100</em>
          </strong>
          <small>
            {employees.length
              ? morale >= 70
                ? "Cautiously buying into the vision."
                : "The all-hands could have been an email."
              : "Hire someone to believe in you."}
          </small>
          <div className="metric-line mint" />
        </div>
        <div className="metric">
          <span>
            Reputation <Icon name="flag" size={15} />
          </span>
          <strong>
            {Math.round(reputation)}
            <em> rep</em>
          </strong>
          <small>
            {Math.round(research)} research points · {projects.length} active
            projects
          </small>
          <div className="metric-line lilac" />
        </div>
      </div>
      <div className="hq-grid">
        <section className="office-panel">
          <div className="section-heading">
            <div className="section-title">
              <Icon name="office" />
              <h2>{layout.name}</h2>
              <Badge>LEVEL {office.level}</Badge>
            </div>
            <span className="muted">
              {employees.length} / {layout.baseCapacity + bonuses.capacity}{" "}
              seats
            </span>
          </div>
          <Suspense
            fallback={
              <div className="office-scene scene-loading">
                Opening the garage doors…
              </div>
            }
          >
            <OfficeScene
              selectedSlot={selected?.id ?? null}
              onSelect={setSelectedId}
            />
          </Suspense>
          <div className="office-footnote">
            <span>
              <span className="status-dot" />
              {working} building · {employees.length - working} available
            </span>
            <span>{dollars(office.rent)} monthly rent</span>
          </div>
          <div className="area-picker">
            <div className="area-picker-heading">
              <span className="eyebrow">OFFICE AREAS</span>
              <small>Select an area to furnish or upgrade</small>
            </div>
            <div className="area-buttons">
              {areas.map((slot) => {
                const item = office.installedUpgrades.find(
                  (u) => u.slotId === slot.id,
                );
                return (
                  <button
                    key={slot.id}
                    className={`area-button ${selectedId === slot.id ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedId(selectedId === slot.id ? null : slot.id)
                    }
                    aria-pressed={selectedId === slot.id}
                  >
                    <Icon name={icons[slot.type]} size={17} />
                    <span>
                      {slot.name}
                      <small>
                        {item
                          ? `${getUpgradeById(item.upgradeId)?.name} · Lv ${item.level}`
                          : "Space for your next bad investment"}
                      </small>
                    </span>
                    <Icon name={item ? "check" : "plus"} size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="hq-inspector">
          {selected ? (
            <section className="inspector-card">
              <div className="section-heading">
                <h2>{selected.name}</h2>
                <Button
                  icon="close"
                  variant="ghost"
                  aria-label="Close area details"
                  onClick={() => setSelectedId(null)}
                />
              </div>
              <div className="inspector-body">
                <span className="object-icon">
                  <Icon name={icons[selected.type]} size={28} />
                </span>
                <h3>{upgrade ? upgrade.name : "Make yourself at home."}</h3>
                <p>
                  {upgrade
                    ? upgrade.description
                    : "Every great company starts with a garage. And an expense account."}
                </p>
                {upgrade && installed ? (
                  <>
                    <Badge tone="green">
                      Installed · Level {installed.level} / {upgrade.maxLevel}
                    </Badge>
                    <div className="bonus-list">
                      {Object.entries(upgrade.effects).map(([key, value]) => (
                        <div key={key}>
                          <span>{key.replace(/([A-Z])/g, " $1")}</span>
                          <strong>
                            +
                            {[
                              "productivity",
                              "research",
                              "burnoutReduction",
                            ].includes(key)
                              ? `${Math.round(value * (key === "capacity" ? 1 : 1 + (installed.level - 1) * 0.4) * 100)}%`
                              : value *
                                (key === "capacity"
                                  ? 1
                                  : 1 + (installed.level - 1) * 0.4)}
                          </strong>
                        </div>
                      ))}
                    </div>
                    {installed.level < upgrade.maxLevel && (
                      <Button
                        variant="primary"
                        disabled={money < levelCost}
                        onClick={() =>
                          useGameStore.getState().upgradeSlot(selected.id)
                        }
                      >
                        Upgrade · {dollars(levelCost)}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() =>
                        useGameStore.getState().removeSlotUpgrade(selected.id)
                      }
                    >
                      Sell for {dollars(upgrade.cost * 0.5)}
                    </Button>
                  </>
                ) : (
                  <div className="upgrade-list">
                    {upgrades.map((option) => (
                      <div className="upgrade-option" key={option.id}>
                        <div>
                          <strong>{option.name}</strong>
                          <small>{option.description}</small>
                        </div>
                        <Button
                          variant="secondary"
                          aria-label={`Install ${option.name} for ${dollars(option.cost)}`}
                          disabled={
                            money < option.cost ||
                            (!!option.requiresEmployees &&
                              employees.length < option.requiresEmployees)
                          }
                          onClick={() =>
                            useGameStore
                              .getState()
                              .installUpgrade(selected.id, option.id)
                          }
                        >
                          {dollars(option.cost)} <Icon name="plus" size={13} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              <section className="inspector-card">
                <div className="section-heading">
                  <h2>The next big thing</h2>
                  <Badge>{projects.length}</Badge>
                </div>
                <div className="inspector-body">
                  {projects.length ? (
                    projects.slice(0, 3).map((project) => {
                      const progress = Math.min(
                        100,
                        Math.floor(
                          (project.progress / project.maxProgress) * 100,
                        ),
                      );
                      return (
                        <button
                          className="project-preview"
                          key={project.id}
                          onClick={() => navigate?.("projects")}
                        >
                          <span>
                            <strong>{project.name}</strong>
                            <Icon name="arrow" size={15} />
                          </span>
                          <small>
                            {project.team.length} people assigned · {progress}%
                            complete
                          </small>
                          <div className="ui-progress">
                            <div style={{ width: `${progress}%` }} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <span className="object-icon">
                        <Icon name="projects" size={25} />
                      </span>
                      <h3>A vision is not a product.</h3>
                      <p>
                        {employees.length
                          ? "Your team is ready. Give them something to build before they start a podcast."
                          : "First, hire a founding team. Then turn your pitch into a product someone might pay for."}
                      </p>
                      <Button
                        variant="primary"
                        icon="plus"
                        onClick={() =>
                          navigate?.(
                            employees.length ? "projects" : "employees",
                          )
                        }
                      >
                        {employees.length
                          ? "Create your first project"
                          : "Hire your founding team"}
                      </Button>
                    </>
                  )}
                </div>
              </section>
              <section className="mentor-card">
                <div className="mentor-heading">
                  <span className="mentor-avatar">EB</span>
                  <div>
                    Erik Bachmann
                    <small>Incubator owner · 10% stakeholder</small>
                  </div>
                  <Icon name="more" />
                </div>
                <blockquote>
                  “
                  {
                    [
                      "The garage isn’t small. It’s an exclusive, high-density innovation campus.",
                      "You don’t need revenue. You need a better explanation for not having revenue.",
                      "A pivot is just a mistake with a press release.",
                      "The coffee machine is not an expense. It is your entire retention strategy.",
                    ][Math.floor(days / 3) % 4]
                  }
                  ”
                </blockquote>
                <span className="eyebrow">UNSOLICITED FOUNDER ADVICE</span>
              </section>
            </>
          )}
          {next && (
            <section className="expansion-card">
              <span className="eyebrow">THINK OUTSIDE THE GARAGE</span>
              <h3>Room for a bigger ego.</h3>
              <p>
                {next.name} · {next.baseCapacity} base seats
              </p>
              <Button icon="arrow" onClick={() => setExpand(true)}>
                Explore expansion <span>{dollars(next.upgradeCost)}</span>
              </Button>
            </section>
          )}
        </aside>
      </div>
      <div className="hq-bottom">
        <div>
          <span className="eyebrow">THE OPERATING PRINCIPLE</span>
          <p>Move fast. Break things. Tell investors it’s a feature.</p>
        </div>
        <span>
          Day {days + 1} of changing the world <Icon name="arrow" size={16} />
        </span>
      </div>
      {expand && next && (
        <Modal title={`Move to ${next.name}`} onClose={() => setExpand(false)}>
          <div className="modal-body">
            <p>{next.description}</p>
            <div className="bonus-list">
              <div>
                <span>One-time relocation</span>
                <strong>{dollars(next.upgradeCost)}</strong>
              </div>
              <div>
                <span>New monthly rent</span>
                <strong>{dollars(next.baseRent)}</strong>
              </div>
              <div>
                <span>Base capacity</span>
                <strong>{next.baseCapacity} seats</strong>
              </div>
            </div>
            <p className="muted">
              Your installed upgrades keep their bonuses. Furnishing areas
              follow the new floor plan.
            </p>
            <Button
              variant="primary"
              disabled={money < next.upgradeCost}
              onClick={() => {
                useGameStore.getState().upgradeOfficeSize();
                setSelectedId(null);
                setExpand(false);
              }}
            >
              Sign the lease · {dollars(next.upgradeCost)}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
