import { useState } from "react";
import {
  useGameStore,
  calculateUpgradeBonuses,
  type Employee,
} from "../store/gameStore";
import { generateRandomEmployee } from "../data/recruiting";
import { getCharacter } from "../data/characters";
import { getLayoutById } from "../data/officeLayouts";
import { Button, Badge, Modal, PageHeader } from "./ui/Primitives";
import { showNotification } from "../systems/feedback";
import Icon from "./ui/Icon";

function Skills({ employee }: { employee: Employee }) {
  return (
    <div>
      {Object.entries(employee.skills).map(([key, value]) => (
        <div className="skill-row" key={key}>
          <span style={{ textTransform: "capitalize" }}>{key}</span>
          <div className="ui-progress">
            <div style={{ width: `${Math.min(100, value * 10)}%` }} />
          </div>
          <strong>{value}/10</strong>
        </div>
      ))}
    </div>
  );
}
function Identity({ employee }: { employee: Employee }) {
  return (
    <div className="employee-identity">
      <span className="employee-avatar">
        {employee.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </span>
      <div>
        <h3>{getCharacter(employee.id)?.name ?? employee.name}</h3>
        <small>{employee.role}</small>
      </div>
    </div>
  );
}
export default function EmployeesPanel() {
  const employees = useGameStore((s) => s.employees);
  const office = useGameStore((s) => s.office);
  const projects = useGameStore((s) => s.projects);
  const money = useGameStore((s) => s.money);
  const [candidate, setCandidate] = useState<Employee | null>(null);
  const [departure, setDeparture] = useState<Employee | null>(null);
  const capacity =
    getLayoutById(office.size)!.baseCapacity +
    calculateUpgradeBonuses(office.installedUpgrades).capacity;
  const payroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const hire = () => {
    if (!candidate || employees.length >= capacity) return;
    const state = useGameStore.getState();
    if (!state.spendMoney(candidate.salary)) return;
    state.addEmployee(candidate);
    setCandidate(null);
    showNotification(
      `${candidate.name} joined. Someone should explain the equity.`,
      "success",
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="YOUR MOST EXPENSIVE ASSET"
        title="Talent. Egos. Stock options."
        description="Build a team that can ship a product and survive a group chat."
        action={
          <Button
            icon="plus"
            variant="primary"
            onClick={() => setCandidate(generateRandomEmployee())}
          >
            Find talent
          </Button>
        }
      />
      <div className="summary-strip">
        <span>
          <strong>
            {employees.length} / {capacity}
          </strong>{" "}
          seats filled
        </span>
        <span>
          <strong>${payroll.toLocaleString()}</strong> monthly payroll
        </span>
        <span>
          <strong>
            {
              employees.filter(
                (e) => !projects.some((p) => p.team.includes(e.id)),
              ).length
            }
          </strong>{" "}
          available for a project
        </span>
      </div>
      {employees.length ? (
        <div className="employee-grid">
          {employees.map((employee) => {
            const project = projects.find((p) => p.team.includes(employee.id));
            return (
              <article className="employee-card" key={employee.id}>
                <Identity employee={employee} />
                <p className="employee-quote">
                  {getCharacter(employee.id)?.catchphrase ??
                    (employee.traits.length
                      ? employee.traits.join(" · ")
                      : "“I was told there would be meaningful equity.”")}
                </p>
                <Badge tone={project ? "green" : "amber"}>
                  {project
                    ? `BUILDING · ${project.name}`
                    : "AVAILABLE FOR YOUR VISION"}
                </Badge>
                <div style={{ marginTop: 20 }}>
                  <Skills employee={employee} />
                </div>
                <div className="project-progress-label">
                  <span>Morale</span>
                  <strong>{Math.round(employee.morale)}%</strong>
                </div>
                <div className="ui-progress">
                  <div style={{ width: `${employee.morale}%` }} />
                </div>
                <div className="employee-footer">
                  <span>${employee.salary.toLocaleString()} / month</span>
                  <Button
                    variant="ghost"
                    onClick={() => setDeparture(employee)}
                  >
                    Let go
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="object-icon">
            <Icon name="team" size={27} />
          </span>
          <h2>You can’t put “vision” on payroll.</h2>
          <p>
            Hire your first engineer, researcher, or wildly overconfident
            manager. They’ll appear in your office, ready to turn caffeine into
            intellectual property.
          </p>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setCandidate(generateRandomEmployee())}
          >
            Meet a candidate
          </Button>
        </div>
      )}
      {candidate && (
        <Modal
          title="Your next co-conspirator"
          onClose={() => setCandidate(null)}
        >
          <div className="modal-body">
            <Identity employee={candidate} />
            <p style={{ marginTop: 20 }}>
              {candidate.traits.join(" · ") ||
                "Highly motivated. Mildly suspicious of the compensation package."}
            </p>
            <Skills employee={candidate} />
            <div className="bonus-list">
              <div>
                <span>Signing cost</span>
                <strong>${candidate.salary.toLocaleString()}</strong>
              </div>
              <div>
                <span>Monthly salary</span>
                <strong>${candidate.salary.toLocaleString()}</strong>
              </div>
              <div>
                <span>Starting morale</span>
                <strong>{candidate.morale}%</strong>
              </div>
            </div>
            {employees.length >= capacity && (
              <p>
                Your office is full. Add desks or expand Headquarters before
                hiring.
              </p>
            )}
            {money < candidate.salary && (
              <p>You need more cash to cover the signing cost.</p>
            )}
            <div className="modal-actions">
              <Button onClick={() => setCandidate(generateRandomEmployee())}>
                Next candidate
              </Button>
              <Button
                variant="primary"
                disabled={
                  money < candidate.salary || employees.length >= capacity
                }
                onClick={hire}
              >
                Hire {candidate.name.split(" ")[0]}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {departure && (
        <Modal
          title={`Let ${departure.name} go?`}
          onClose={() => setDeparture(null)}
        >
          <div className="modal-body">
            <p>
              They’ll leave your team and their active project assignments.
              Monthly payroll will decrease by $
              {departure.salary.toLocaleString()}.
            </p>
            <div className="modal-actions">
              <Button onClick={() => setDeparture(null)}>
                Keep on the team
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const state = useGameStore.getState();
                  state.projects
                    .filter((p) => p.team.includes(departure.id))
                    .forEach((p) =>
                      state.updateProject(p.id, {
                        team: p.team.filter((id) => id !== departure.id),
                      }),
                    );
                  state.removeEmployee(departure.id);
                  setDeparture(null);
                }}
              >
                Confirm departure
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
