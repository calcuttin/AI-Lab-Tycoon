import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Employee } from '../store/gameStore';
import { getCharacter } from '../data/characters';

let employeeCounter = 0;

const generateRandomName = () => {
  const firstNames = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Drew', 'Jamie'];
  const lastNames = ['Chen', 'Patel', 'Kim', 'Rodriguez', 'Singh', 'Martinez', 'Nguyen', 'Brown', 'Lee', 'Wang'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateRandomEmployee = (): Employee => {
  const roles: Employee['role'][] = ['researcher', 'engineer', 'designer', 'manager', 'intern'];
  const role = roles[Math.floor(Math.random() * roles.length)];

  const baseSkills = {
    research: Math.floor(Math.random() * 5) + 1,
    development: Math.floor(Math.random() * 5) + 1,
    creativity: Math.floor(Math.random() * 5) + 1,
    management: Math.floor(Math.random() * 5) + 1,
  };

  const totalSkill = Object.values(baseSkills).reduce((a, b) => a + b, 0);
  const salary = Math.floor(totalSkill * 500);

  const traits = ['Coffee Addict', 'Burnout Risk', 'Genius', 'Overpromiser'].filter(() => Math.random() > 0.7);

  employeeCounter++;

  return {
    id: `emp-${Date.now()}-${employeeCounter}-${Math.random().toString(36).substr(2, 9)}`,
    name: generateRandomName(),
    role,
    skills: baseSkills,
    salary,
    morale: 70 + Math.floor(Math.random() * 30),
    traits,
  };
};

const getRoleAvatar = (role: string, index: number) => {
  const avatars: Record<string, string[]> = {
    engineer: ['👨‍💻', '👩‍💻', '🧑‍💻'],
    researcher: ['👨‍🔬', '👩‍🔬', '🧑‍🔬'],
    designer: ['👨‍🎨', '👩‍🎨', '🧑‍🎨'],
    manager: ['👨‍💼', '👩‍💼', '🧑‍💼'],
    intern: ['🧑‍🎓', '👨‍🎓', '👩‍🎓'],
  };
  const roleKey = role.toLowerCase();
  const spriteSet = avatars[roleKey] || avatars.engineer;
  return spriteSet[index % spriteSet.length];
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    engineer: '#0ea5e9',
    researcher: '#a855f7',
    designer: '#f59e0b',
    manager: '#22c55e',
    intern: '#94a3b8',
  };
  return colors[role.toLowerCase()] || '#94a3b8';
};

const ROLE_ORDER: Employee['role'][] = ['manager', 'researcher', 'engineer', 'designer', 'intern'];
const ROLE_LABELS: Record<string, string> = {
  manager: 'Managers',
  researcher: 'Researchers',
  engineer: 'Engineers',
  designer: 'Designers',
  intern: 'Interns',
};

const SkillBar = ({ label, value, color, max = 10 }: { label: string; value: number; color: string; max?: number }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1" style={{ fontSize: 7 }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span style={{ color, fontWeight: 'bold' }}>{value}/{max}</span>
      </div>
      <div
        style={{
          height: 8,
          background: '#2d3748',
          borderRadius: 2,
          border: '2px solid #475569',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
            transition: 'width 0.3s',
            boxShadow: `inset 0 0 8px ${color}88`,
          }}
        />
      </div>
    </div>
  );
};

export default function EmployeesPanel() {
  const employees = useGameStore((state) => state.employees);
  const money = useGameStore((state) => state.money);
  const removeEmployee = useGameStore((state) => state.removeEmployee);

  const [showHireModal, setShowHireModal] = useState(false);
  const [candidate, setCandidate] = useState<Employee | null>(null);

  const groupedEmployees = ROLE_ORDER
    .map((role) => ({ role, employees: employees.filter((e) => e.role === role) }))
    .filter((group) => group.employees.length > 0);

  const handleShowHire = () => {
    setCandidate(generateRandomEmployee());
    setShowHireModal(true);
  };

  const handleHire = () => {
    if (!candidate) return;
    const state = useGameStore.getState();
    if (state.money < candidate.salary) return;
    if (!state.spendMoney(candidate.salary)) return;
    state.addEmployee(candidate);
    setShowHireModal(false);
    setCandidate(null);
  };

  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgMorale = employees.length ? Math.round(employees.reduce((s, e) => s + e.morale, 0) / employees.length) : 0;

  const panelStyle = {
    fontFamily: 'var(--font-pixel)',
    background: 'var(--color-bg-dark)',
    minHeight: '100%',
  };

  const cardStyle = {
    background: 'linear-gradient(180deg, var(--color-bg-panel) 0%, var(--color-bg-dark) 100%)',
    border: '3px solid var(--color-bg-surface)',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={panelStyle}>
      {/* Sticky header */}
      <div
        className="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-4 p-6 pb-4"
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-dark) 0%, var(--color-bg-dark) 80%, transparent 100%)',
          borderBottom: '4px solid var(--color-bg-surface)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                border: '3px solid #0369a1',
                boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                fontSize: 24,
              }}
            >
              👥
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide" style={{ color: 'var(--color-text)', textShadow: '2px 2px 0 #0c1222' }}>
                TEAM
              </h1>
              <p style={{ fontSize: 8, color: 'var(--color-text-muted)' }}>
                Manage staff and hire new talent
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShowHire}
            className="px-6 py-3 rounded transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{
              background: 'linear-gradient(180deg, var(--color-success) 0%, #16a34a 100%)',
              color: '#fff',
              border: '4px solid #15803d',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            <span>+</span> HIRE
          </button>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded"
          style={{
            background: 'linear-gradient(180deg, var(--color-bg-panel) 0%, #0f1729 100%)',
            border: '4px solid var(--color-bg-surface)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 3px 3px 0 rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(14,165,233,0.2)', border: '2px solid #0ea5e9', fontSize: 18 }}>👥</div>
            <div>
              <div style={{ fontSize: 7, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Staff</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-text)' }}>{employees.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', fontSize: 18 }}>💰</div>
            <div>
              <div style={{ fontSize: 7, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Payroll /mo</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f87171' }}>${totalSalaries.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)', border: '2px solid #22c55e', fontSize: 18 }}>😊</div>
            <div>
              <div style={{ fontSize: 7, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Avg morale</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: avgMorale >= 70 ? '#22c55e' : avgMorale >= 40 ? '#f59e0b' : '#ef4444',
                }}
              >
                {employees.length ? `${avgMorale}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {employees.length === 0 ? (
          <div
            className="max-w-md mx-auto text-center py-16 px-8 rounded mt-6"
            style={{
              ...cardStyle,
              borderStyle: 'dashed',
              borderColor: 'var(--color-bg-surface)',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16, animation: 'teamBounce 2s ease-in-out infinite', lineHeight: 1 }}>👥</div>
            <h3 style={{ fontSize: 12, color: 'var(--color-text)', marginBottom: 8, fontWeight: 'bold' }}>NO TEAM YET</h3>
            <p style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Hire your first team member to start building projects and growing your lab.
            </p>
            <button
              onClick={handleShowHire}
              className="px-8 py-4 rounded transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, var(--color-success) 0%, #16a34a 100%)',
                color: '#fff',
                border: '4px solid #15803d',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              + HIRE FIRST EMPLOYEE
            </button>
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            {groupedEmployees.map((group) => {
              const roleColor = getRoleColor(group.role);
              const label = ROLE_LABELS[group.role] ?? group.role;
              return (
                <section key={group.role} className="space-y-3">
                  <header
                    className="flex items-center justify-between px-4 py-2 rounded"
                    style={{
                      background: `linear-gradient(90deg, ${roleColor}22 0%, transparent 100%)`,
                      borderLeft: `4px solid ${roleColor}`,
                      borderTop: '2px solid var(--color-bg-surface)',
                      borderRight: '2px solid var(--color-bg-surface)',
                      borderBottom: '2px solid var(--color-bg-surface)',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 'bold', color: 'var(--color-text)', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ fontSize: 8, fontWeight: 'bold', color: roleColor, background: `${roleColor}22` }}
                    >
                      {group.employees.length}
                    </span>
                  </header>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.employees.map((employee, index) => {
                      const character = getCharacter(employee.id);
                      const avatar = character?.avatar ?? getRoleAvatar(employee.role, index);
                      const displayName = character?.name ?? employee.name;
                      const moraleColor = employee.morale > 70 ? '#22c55e' : employee.morale > 50 ? '#f59e0b' : '#ef4444';
                      return (
                        <article
                          key={employee.id}
                          className="rounded overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
                          style={{
                            ...cardStyle,
                            borderColor: `${roleColor}88`,
                          }}
                          title={character ? `${displayName} (${character.role})` : undefined}
                        >
                          <div
                            className="flex items-start justify-between p-3"
                            style={{
                              background: `linear-gradient(135deg, ${roleColor}18 0%, transparent 60%)`,
                              borderBottom: `2px solid ${roleColor}44`,
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: `linear-gradient(180deg, ${roleColor} 0%, ${roleColor}cc 100%)`,
                                  border: `3px solid ${roleColor}`,
                                  fontSize: 28,
                                  boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                                }}
                              >
                                {avatar}
                              </div>
                              <div className="min-w-0">
                                <div style={{ fontSize: 10, fontWeight: 'bold', color: 'var(--color-text)', textShadow: '1px 1px 0 #000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {displayName}
                                </div>
                                <div style={{ fontSize: 8, color: roleColor, textTransform: 'uppercase', fontWeight: 'bold' }}>
                                  {employee.role}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeEmployee(employee.id)}
                              className="px-2 py-1 rounded transition-all hover:opacity-90 flex-shrink-0"
                              style={{
                                background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                                border: '2px solid #b91c1c',
                                boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
                                fontSize: 6,
                                fontWeight: 'bold',
                                color: '#fff',
                              }}
                            >
                              FIRE
                            </button>
                          </div>
                          <div className="p-3">
                            <SkillBar label="DEV" value={employee.skills.development} color="#22c55e" />
                            <SkillBar label="RES" value={employee.skills.research} color="#0ea5e9" />
                            <SkillBar label="CRE" value={employee.skills.creativity} color="#f59e0b" />
                            <SkillBar label="MGT" value={employee.skills.management} color="#a855f7" />
                            <div className="mt-2 pt-2" style={{ borderTop: '2px solid var(--color-bg-surface)' }}>
                              <div className="flex justify-between mb-1" style={{ fontSize: 7 }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>MORALE</span>
                                <span style={{ color: moraleColor, fontWeight: 'bold' }}>{employee.morale}%</span>
                              </div>
                              <div
                                style={{
                                  height: 8,
                                  background: '#2d3748',
                                  borderRadius: 2,
                                  border: '2px solid #475569',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${employee.morale}%`,
                                    background: employee.morale > 70
                                      ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                      : employee.morale > 50
                                      ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                                      : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                                    transition: 'width 0.3s',
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-center" style={{ fontSize: 8 }}>
                              <span style={{ color: 'var(--color-text-muted)' }}>SALARY </span>
                              <span style={{ color: '#f87171', fontWeight: 'bold' }}>${employee.salary.toLocaleString()}/mo</span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Hire modal */}
      {showHireModal && candidate && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
          }}
          onClick={(e) => e.target === e.currentTarget && (setShowHireModal(false), setCandidate(null))}
        >
            <div
              className="w-full max-w-md rounded overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, var(--color-bg-panel) 0%, var(--color-bg-dark) 100%)',
                border: '6px solid var(--color-accent)',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.4), 0 0 0 2px rgba(14,165,233,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  background: 'linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                  borderBottom: '4px solid #0369a1',
                }}
              >
                <span style={{ fontSize: 24 }}>📋</span>
                <h3 style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
                  HIRE CANDIDATE
                </h3>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(180deg, ${getRoleColor(candidate.role)} 0%, ${getRoleColor(candidate.role)}cc 100%)`,
                      border: `4px solid ${getRoleColor(candidate.role)}`,
                      fontSize: 36,
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
                    }}
                  >
                    {getRoleAvatar(candidate.role, 0)}
                  </div>
                  <div className="min-w-0">
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text)' }}>
                      {candidate.name}
                    </div>
                    <div style={{ fontSize: 9, color: getRoleColor(candidate.role), textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {candidate.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <SkillBar label="DEV" value={candidate.skills.development} color="#22c55e" />
                  <SkillBar label="RES" value={candidate.skills.research} color="#0ea5e9" />
                  <SkillBar label="CRE" value={candidate.skills.creativity} color="#f59e0b" />
                  <SkillBar label="MGT" value={candidate.skills.management} color="#a855f7" />
                </div>

                <div
                  className="p-4 rounded text-center"
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '3px solid var(--color-bg-surface)',
                  }}
                >
                  <div style={{ fontSize: 8, color: 'var(--color-text-muted)', marginBottom: 4 }}>MONTHLY SALARY</div>
                  <div style={{ fontSize: 13, color: money >= candidate.salary ? '#f87171' : '#94a3b8', fontWeight: 'bold' }}>
                    ${candidate.salary.toLocaleString()}
                  </div>
                  {money < candidate.salary && (
                    <div style={{ fontSize: 7, color: 'var(--color-danger)', marginTop: 4 }}>Not enough funds</div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowHireModal(false); setCandidate(null); }}
                    className="flex-1 py-3 rounded transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(180deg, var(--color-bg-surface) 0%, #1e293b 100%)',
                      border: '3px solid #475569',
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidate(generateRandomEmployee())}
                    className="px-4 py-3 rounded transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(180deg, var(--color-bg-surface) 0%, #1e293b 100%)',
                      border: '3px solid #475569',
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    onClick={handleHire}
                    disabled={money < candidate.salary}
                    className="flex-1 py-3 rounded transition-all hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
                    style={{
                      background: money >= candidate.salary
                        ? 'linear-gradient(180deg, var(--color-success) 0%, #16a34a 100%)'
                        : 'linear-gradient(180deg, var(--color-bg-surface) 0%, #1e293b 100%)',
                      border: `3px solid ${money >= candidate.salary ? '#15803d' : '#475569'}`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: money >= candidate.salary ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    HIRE
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes teamBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
