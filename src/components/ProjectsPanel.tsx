import { useState } from "react";
import { useGameStore, type Project } from "../store/gameStore";
import { projectTypes } from "../data/projectTypes";
import { useTeamAssignment } from "../hooks/useTeamAssignment";
import { showNotification } from "../systems/feedback";
import { Button, Badge, Modal, PageHeader } from "./ui/Primitives";
import Icon from "./ui/Icon";

function ProjectCard({ project }: { project: Project }) {
  const {
    type,
    teamMembers,
    availableEmployees,
    isExpanded,
    toggleExpand,
    addToTeam,
    removeFromTeam,
    getTeamImpact,
  } = useTeamAssignment(project);
  const progress = Math.min(
    100,
    Math.max(0, Math.floor((project.progress / project.maxProgress) * 100)),
  );
  const impact = getTeamImpact(project);
  return (
    <article className="project-card">
      <div className="project-card-heading">
        <span className="object-icon">
          <Icon name="chip" size={24} />
        </span>
        <Badge tone={teamMembers.length ? "green" : "amber"}>
          {teamMembers.length ? "IN DEVELOPMENT" : "NEEDS A TEAM"}
        </Badge>
      </div>
      <h3>{project.name}</h3>
      <p>{type?.description}</p>
      <div className="project-progress-label">
        <span>Development progress</span>
        <strong>{progress}%</strong>
      </div>
      <div
        className="ui-progress"
        role="progressbar"
        aria-label={`${project.name} progress`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${progress}%` }} />
      </div>
      <div className="project-stats">
        <div>
          <small>EST. SHIP DATE</small>
          <strong>
            {impact.etaDays === null ? "Unassigned" : `${impact.etaDays} days`}
          </strong>
        </div>
        <div>
          <small>QUALITY</small>
          <strong>{project.quality.toFixed(1)} / 10</strong>
        </div>
        <div>
          <small>TEAM MORALE</small>
          <strong>{Math.round(impact.morale)}%</strong>
        </div>
      </div>
      <div className="section-title">
        <span className="eyebrow">THE PEOPLE DOING THE WORK</span>
        <Badge>
          {teamMembers.length} / {type?.maxTeamSize ?? 3}
        </Badge>
      </div>
      <div className="team-chips">
        {teamMembers.map((e) => (
          <button
            className="team-chip"
            key={e.id}
            title={`Remove ${e.name} from project`}
            aria-label={`Remove ${e.name} from project`}
            onClick={() => removeFromTeam(e.id)}
          >
            {e.name}
            <Icon name="close" size={11} />
          </button>
        ))}
        {!teamMembers.length && (
          <span className="muted">
            The pitch deck cannot code. Assign someone.
          </span>
        )}
      </div>
      <Button icon="team" onClick={toggleExpand} aria-expanded={isExpanded}>
        {isExpanded ? "Done assigning" : "Assign team"}
      </Button>
      {isExpanded && (
        <div className="team-chips">
          {availableEmployees.map((e) => (
            <button
              className="team-chip"
              key={e.id}
              disabled={teamMembers.length >= (type?.maxTeamSize ?? 3)}
              onClick={() => addToTeam(e.id)}
            >
              <Icon name="plus" size={12} />
              {e.name}
            </button>
          ))}
          {!availableEmployees.length && (
            <p className="muted">
              Everyone is assigned. Hire someone or move a teammate from another
              project.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
export default function ProjectsPanel() {
  const projects = useGameStore((s) => s.projects);
  const employees = useGameStore((s) => s.employees);
  const money = useGameStore((s) => s.money);
  const unlocked = useGameStore((s) => s.unlockedProjectTypes);
  const shipped = useGameStore((s) => s.totalProjectsCompleted);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const available = employees.filter(
    (e) => !projects.some((p) => p.team.includes(e.id)),
  );
  const type = projectTypes.find((t) => t.id === selectedType);
  const validIds = teamIds.filter((id) => available.some((e) => e.id === id));
  const canStart =
    !!type &&
    money >= type.baseCost &&
    validIds.length >= type.minTeamSize &&
    validIds.length <= type.maxTeamSize;
  const openProject = () => {
    setSelectedType("");
    setTeamIds([]);
    setName("");
    setOpen(true);
  };
  const start = () => {
    if (!type || !canStart) return;
    const state = useGameStore.getState();
    const team = validIds.filter(
      (id) =>
        state.employees.some((e) => e.id === id) &&
        !state.projects.some((p) => p.team.includes(id)),
    );
    if (team.length < type.minTeamSize || !state.spendMoney(type.baseCost))
      return;
    state.addProject({
      id: crypto.randomUUID(),
      name: name.trim() || type.name,
      type: type.id,
      complexity: type.complexity,
      progress: 0,
      maxProgress: type.baseTime,
      team,
      quality: type.baseQuality,
      marketAppeal: type.marketAppeal,
    });
    setOpen(false);
    showNotification(
      "Project started. The demo is now only slightly fictional.",
      "success",
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="THE PRODUCT, ALLEGEDLY"
        title="Less pitching. More shipping."
        description="Turn your world-changing vision into something with a release date."
        action={
          <Button variant="primary" icon="plus" onClick={openProject}>
            New project
          </Button>
        }
      />
      <div className="summary-strip">
        <span>
          <strong>{projects.length}</strong> in development
        </span>
        <span>
          <strong>{available.length}</strong> people available
        </span>
        <span>
          <strong>{shipped}</strong> products shipped
        </span>
      </div>
      {projects.length ? (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="object-icon">
            <Icon name="projects" size={26} />
          </span>
          <h2>Your next unicorn starts here.</h2>
          <p>
            {employees.length
              ? "The team is ready. Pick a product, assign the people, and see if the world actually needs another chatbot."
              : "First, hire your founding team from the Team tab. Then pick a product and put those equity promises to work."}
          </p>
          <Button icon="plus" variant="primary" onClick={openProject}>
            Plan your first project
          </Button>
        </div>
      )}
      {open && (
        <Modal title="Build the next big thing" onClose={() => setOpen(false)}>
          <div className="modal-body">
            <span className="eyebrow">01 / PICK YOUR WORLD-CHANGING IDEA</span>
            <div className="choice-grid">
              {projectTypes
                .filter((t) => unlocked.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    className={`choice-card ${selectedType === t.id ? "selected" : ""}`}
                    aria-pressed={selectedType === t.id}
                    onClick={() => {
                      setSelectedType(t.id);
                      setTeamIds([]);
                    }}
                  >
                    <strong>{t.name}</strong>
                    <small>{t.description}</small>
                    <span>
                      <span>${t.baseCost.toLocaleString()}</span>
                      <span>
                        {t.minTeamSize}–{t.maxTeamSize} people
                      </span>
                      <span>{t.complexity} complexity</span>
                    </span>
                  </button>
                ))}
            </div>
            {type && (
              <>
                <label className="eyebrow" htmlFor="project-name">
                  PROJECT NAME
                </label>
                <input
                  id="project-name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type.name}
                  style={{
                    display: "block",
                    width: "100%",
                    margin: "9px 0 23px",
                  }}
                />
                <span className="eyebrow">
                  02 / ASSEMBLE THE TEAM · {validIds.length} /{" "}
                  {type.maxTeamSize}
                </span>
                <div className="choice-grid">
                  {available.map((e) => (
                    <button
                      className={`choice-card ${validIds.includes(e.id) ? "selected" : ""}`}
                      aria-pressed={validIds.includes(e.id)}
                      key={e.id}
                      disabled={
                        !validIds.includes(e.id) &&
                        validIds.length >= type.maxTeamSize
                      }
                      onClick={() =>
                        setTeamIds((ids) =>
                          ids.includes(e.id)
                            ? ids.filter((id) => id !== e.id)
                            : [...ids, e.id],
                        )
                      }
                    >
                      <strong>{e.name}</strong>
                      <small>
                        {e.role} · Development {e.skills.development} · Research{" "}
                        {e.skills.research}
                      </small>
                    </button>
                  ))}
                </div>
                {!available.length && (
                  <p>
                    No one available. Hire from the Team tab or free someone
                    from another project.
                  </p>
                )}
                <p className="muted">
                  {money < type.baseCost
                    ? `You need $${(type.baseCost - money).toLocaleString()} more to fund this project.`
                    : `Assign at least ${type.minTeamSize} ${type.minTeamSize === 1 ? "person" : "people"}. Work progresses while the simulation is running.`}
                </p>
              </>
            )}
            <div className="modal-actions">
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" disabled={!canStart} onClick={start}>
                Start project
                {type ? ` · $${type.baseCost.toLocaleString()}` : ""}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
