import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Project } from '../store/gameStore';
import { projectTypes } from '../data/projectTypes';
import { getCharacter } from '../data/characters';
import { useTeamAssignment } from '../hooks/useTeamAssignment';

// Project type icons
const getProjectIcon = (type: string) => {
  const icons: Record<string, string> = {
    'chatbot-basic': '💬',
    'chatbot-advanced': '🤖',
    'image-generator': '🎨',
    'code-assistant': '💻',
    'voice-ai': '🎤',
    'vision-model': '👁️',
    'agent-system': '🤖',
    'multimodal': '🔮',
    'agi': '🧠',
  };
  return icons[type] || '📁';
};

// Complexity colors
const getComplexityColor = (complexity: string) => {
  const colors: Record<string, string> = {
    simple: '#22c55e',
    medium: '#f59e0b',
    complex: '#ef4444',
    revolutionary: '#a855f7',
  };
  return colors[complexity] || '#94a3b8';
};

const formatProgress = (progress: number, max: number) => {
  if (!max || max <= 0) return 0;
  const pct = Math.min(100, Math.max(0, (Number(progress) / Number(max)) * 100));
  return Math.floor(pct);
};

const progressBarWidth = (progress: number, max: number) => {
  const pct = formatProgress(progress, max);
  if (pct <= 0) return 0;
  if (pct >= 100) return 100;
  return Math.max(pct, 4);
};

// Renders avatar + name; uses character when employee.id matches a character
function TeamMemberChip({
  employee,
  onClick,
}: {
  employee: { id: string; name: string };
  onClick: () => void;
}) {
  const character = getCharacter(employee.id);
  const avatar = character?.avatar ?? '👤';
  const displayName = character?.name ?? employee.name;
  const shortName = displayName.split(' ')[0];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-110 cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
        border: '2px solid #475569',
      }}
    >
      <span style={{ fontSize: 12 }}>{avatar}</span>
      <span style={{ fontSize: 7, color: '#fff' }} title={displayName}>{shortName}</span>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
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

  const progressPct = formatProgress(project.progress, project.maxProgress);
  const barWidth = progressBarWidth(project.progress, project.maxProgress);
  const complexityColor = getComplexityColor(project.complexity);
  const isActive = teamMembers.length > 0;
  const teamImpact = getTeamImpact(project);
  const needsTeam = teamMembers.length === 0;
  const minTeam = type?.minTeamSize ?? 1;
  const maxTeam = type?.maxTeamSize ?? 3;

  return (
    <div
      className="rounded relative overflow-hidden transition-all hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
        border: `5px solid ${complexityColor}`,
        boxShadow: isActive
          ? `0 0 25px ${complexityColor}44, 5px 5px 0 rgba(0,0,0,0.3)`
          : '5px 5px 0 rgba(0,0,0,0.3)',
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      {isActive && (
        <div
          className="absolute top-2 right-2 w-3 h-3 rounded-full"
          style={{
            background: complexityColor,
            boxShadow: `0 0 12px ${complexityColor}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      <div
        className="p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${complexityColor}22 0%, transparent 100%)`,
          borderBottom: `2px solid ${complexityColor}44`,
        }}
      >
        {isActive && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${complexityColor}44 50%, transparent 100%)`,
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
        )}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded flex items-center justify-center relative"
              style={{
                background: `linear-gradient(180deg, ${complexityColor} 0%, ${complexityColor}dd 100%)`,
                border: `3px solid ${complexityColor}`,
                fontSize: 24,
                boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              }}
            >
              {getProjectIcon(project.type)}
              {isActive && (
                <div
                  className="absolute inset-0 rounded"
                  style={{
                    background: `radial-gradient(circle at center, ${complexityColor}88 0%, transparent 70%)`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 0 #000' }}>
                {project.name.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 7,
                  color: complexityColor,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                {project.complexity}
              </div>
            </div>
          </div>
          <button
            onClick={toggleExpand}
            className="px-3 py-1 rounded transition-all hover:scale-105"
            style={{
              background: needsTeam
                ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              border: `2px solid ${needsTeam ? '#0369a1' : '#475569'}`,
              boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
              fontSize: 7,
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            {needsTeam ? 'ASSIGN TEAM' : (isExpanded ? 'HIDE' : 'EDIT TEAM')}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2" style={{ fontSize: 8 }}>
            <span style={{ color: '#94a3b8' }}>
              PROGRESS
              {needsTeam && (
                <span style={{ color: '#f59e0b', marginLeft: 6 }}>
                  — Assign team ({minTeam}–{maxTeam} members) & run time
                </span>
              )}
            </span>
            <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
              {Math.floor(Number(project.progress))} / {Number(project.maxProgress)} days · {progressPct}%
            </span>
          </div>
          <div
            style={{
              height: 18,
              background: '#2d3748',
              borderRadius: 3,
              border: '3px solid #475569',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${barWidth}%`,
                background: `linear-gradient(90deg, ${complexityColor} 0%, ${complexityColor}dd 100%)`,
                transition: 'width 0.3s ease-out',
                boxShadow: `inset 0 0 12px ${complexityColor}88`,
              }}
            />
            {progressPct > 0 && progressPct < 100 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${barWidth}%`,
                  transform: 'translateX(-2px)',
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: '#fff',
                  boxShadow: '0 0 10px rgba(255,255,255,0.9)',
                  animation: 'progressPulse 1.5s ease-in-out infinite',
                }}
              />
            )}
            {progressPct >= 100 && (
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 70%)',
                  animation: 'sparkle 1s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4" style={{ fontSize: 7 }}>
          <div
            className="p-2 rounded text-center"
            style={{
              background: 'rgba(14, 165, 233, 0.1)',
              border: '2px solid #0ea5e944',
            }}
          >
            <div style={{ color: '#94a3b8' }}>TEAM</div>
            <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: 9 }}>
              {teamMembers.length}/{maxTeam}
              {minTeam > 1 && teamMembers.length < minTeam && (
                <span style={{ color: '#f59e0b', fontSize: 6 }}> (min {minTeam})</span>
              )}
            </div>
          </div>
          <div
            className="p-2 rounded text-center"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid #f59e0b44',
            }}
          >
            <div style={{ color: '#94a3b8' }}>QUALITY</div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 9 }}>
              {(Number(project.quality) ?? 0).toFixed(1)}/10
            </div>
          </div>
          <div
            className="p-2 rounded text-center"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid #22c55e44',
            }}
          >
            <div style={{ color: '#94a3b8' }}>APPEAL</div>
            <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 9 }}>
              {project.marketAppeal}/10
            </div>
          </div>
        </div>

        {teamMembers.length > 0 && (
          <div
            className="p-3 rounded mb-3"
            style={{
              background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
              border: '2px solid #334155',
            }}
          >
            <div style={{ fontSize: 7, color: '#94a3b8', marginBottom: 4 }}>TEAM IMPACT</div>
            <div className="grid grid-cols-3 gap-2" style={{ fontSize: 7 }}>
              <div className="text-center">
                <div style={{ color: '#94a3b8' }}>SPEED/DAY</div>
                <div style={{ color: '#0ea5e9', fontWeight: 'bold' }}>+{teamImpact.dailyProgress}</div>
              </div>
              <div className="text-center">
                <div style={{ color: '#94a3b8' }}>QUALITY/DAY</div>
                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>+{teamImpact.qualityPerDay.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div style={{ color: '#94a3b8' }}>MORALE</div>
                <div
                  style={{
                    color: teamImpact.morale >= 60 ? '#22c55e' : teamImpact.morale >= 40 ? '#f59e0b' : '#ef4444',
                    fontWeight: 'bold',
                  }}
                >
                  {Math.floor(teamImpact.morale)}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3" style={{ fontSize: 7 }}>
              <div className="text-center">
                <div style={{ color: '#94a3b8' }}>ETA</div>
                <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
                  {teamImpact.etaDays !== null ? `${teamImpact.etaDays}d` : '--'}
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: '#94a3b8' }}>EXPECTED Q</div>
                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {teamImpact.expectedQuality.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-3">
          <div style={{ fontSize: 7, color: '#94a3b8', marginBottom: 4 }}>TEAM:</div>
          {teamMembers.length === 0 ? (
            <div style={{ fontSize: 7, color: '#64748b', fontStyle: 'italic' }}>
              No one assigned. Click &quot;Assign team&quot; to add members ({minTeam}–{maxTeam}).
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((emp) => (
                <TeamMemberChip
                  key={emp.id}
                  employee={emp}
                  onClick={() => removeFromTeam(emp.id)}
                />
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3" style={{ borderTop: '2px solid #2d3748' }}>
            <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 6 }}>ADD TO TEAM:</div>
            <div className="flex flex-wrap gap-2">
              {availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => addToTeam(emp.id)}
                  className="px-2 py-1 rounded transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                    border: '2px solid #475569',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                    fontSize: 7,
                    fontWeight: 'bold',
                    color: '#94a3b8',
                  }}
                >
                  + {(getCharacter(emp.id)?.name ?? emp.name).split(' ')[0].toUpperCase()}
                </button>
              ))}
              {availableEmployees.length === 0 && (
                <div style={{ fontSize: 7, color: '#64748b', fontStyle: 'italic' }}>No available employees</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPanel() {
  const projects = useGameStore((state) => state.projects);
  const employees = useGameStore((state) => state.employees);
  const unlockedProjectTypes = useGameStore((state) => state.unlockedProjectTypes);
  const addProject = useGameStore((state) => state.addProject);
  const spendMoney = useGameStore((state) => state.spendMoney);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const availableTypes = projectTypes.filter(
    (type) => unlockedProjectTypes.includes(type.id)
  );

  // Employees not assigned to any project (one project per employee)
  const unassignedEmployees = employees.filter(
    (e) => !projects.some((p) => p.team.includes(e.id))
  );

  const selectedTypeDef = selectedType ? projectTypes.find((t) => t.id === selectedType) : null;
  const minTeam = selectedTypeDef?.minTeamSize ?? 1;
  const maxTeam = selectedTypeDef?.maxTeamSize ?? 3;
  const canStart =
    selectedType &&
    selectedTeamIds.length >= minTeam &&
    selectedTeamIds.length <= maxTeam;

  const toggleTeamMember = (employeeId: string) => {
    setSelectedTeamIds((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }
      if (prev.length >= maxTeam) return prev;
      return [...prev, employeeId];
    });
  };

  const handleOpenModal = () => {
    setShowNewProjectModal(true);
    setSelectedType('');
    setSelectedTeamIds([]);
  };

  const handleCloseModal = () => {
    setShowNewProjectModal(false);
    setSelectedType('');
    setSelectedTeamIds([]);
  };

  const handleStartProject = () => {
    const type = projectTypes.find((t) => t.id === selectedType);
    if (!type) return;
    if (selectedTeamIds.length < minTeam || selectedTeamIds.length > maxTeam) return;

    if (!spendMoney(type.baseCost)) {
      alert('Not enough money!');
      return;
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: type.name,
      type: type.id,
      complexity: type.complexity,
      progress: 0,
      maxProgress: type.baseTime,
      team: [...selectedTeamIds],
      quality: type.baseQuality,
      marketAppeal: type.marketAppeal,
    };

    addProject(newProject);
    handleCloseModal();
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
          📁 PROJECTS
        </h2>
        <button
          onClick={handleOpenModal}
          className="px-5 py-2 rounded transition-all hover:scale-110 active:scale-95 relative"
          style={{
            background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
            color: '#fff',
            border: '4px solid #15803d',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(34, 197, 94, 0.4)',
            fontSize: 9,
            fontWeight: 'bold',
          }}
        >
          + NEW PROJECT
          <div
            className="absolute inset-0 rounded"
            style={{
              background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        </button>
      </div>

      {/* Projects grid - Game Dev Tycoon style */}
      {projects.length === 0 ? (
        <div
          className="text-center py-16 rounded relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #2d3748',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12, animation: 'bounce 2s ease-in-out infinite' }}>📂</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 'bold' }}>NO ACTIVE PROJECTS</div>
          <div style={{ fontSize: 9, color: '#64748b' }}>Start a project to build your AI empire!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      {/* New project modal */}
      {showNewProjectModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.9)' }}
        >
          <div
            className="w-full max-w-2xl rounded overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
              border: '8px solid #0ea5e9',
              boxShadow: '10px 10px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="px-8 py-5"
              style={{
                background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                borderBottom: '5px solid #0369a1',
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', textShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
                NEW PROJECT
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {!selectedType ? (
                <>
                  <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 6 }}>1. CHOOSE PROJECT TYPE</div>
                  {availableTypes.map((type) => {
                    const complexityColor = getComplexityColor(type.complexity);
                    return (
                      <label
                        key={type.id}
                        className="block p-4 rounded cursor-pointer transition-all"
                        style={{
                          background: `linear-gradient(180deg, #2d3748 0%, #1a2744 100%)`,
                          border: `4px solid #475569`,
                          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                        }}
                      >
                        <input
                          type="radio"
                          name="projectType"
                          value={type.id}
                          checked={false}
                          onChange={(e) => {
                            setSelectedType(e.target.value);
                            setSelectedTeamIds([]);
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(180deg, ${complexityColor} 0%, ${complexityColor}dd 100%)`,
                              border: `3px solid ${complexityColor}`,
                              fontSize: 28,
                              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                            }}
                          >
                            {getProjectIcon(type.id)}
                          </div>
                          <div className="flex-1">
                            <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                              {type.name.toUpperCase()}
                            </div>
                            <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 6 }}>{type.description}</div>
                            <div className="flex gap-4" style={{ fontSize: 7 }}>
                              <span style={{ color: '#22c55e' }}>${type.baseCost.toLocaleString()}</span>
                              <span style={{ color: '#94a3b8' }}>{type.baseTime} DAYS</span>
                              <span style={{ color: complexityColor }}>{type.complexity.toUpperCase()}</span>
                              <span style={{ color: '#0ea5e9' }}>TEAM: {type.minTeamSize}–{type.maxTeamSize}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded" style={{ background: '#1a2744', border: '2px solid #475569' }}>
                    <div className="flex items-center gap-3">
                      {selectedTypeDef && (
                        <>
                          <div
                            className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(180deg, ${getComplexityColor(selectedTypeDef.complexity)} 0%, ${getComplexityColor(selectedTypeDef.complexity)}dd 100%)`,
                              border: `3px solid ${getComplexityColor(selectedTypeDef.complexity)}`,
                              fontSize: 24,
                            }}
                          >
                            {getProjectIcon(selectedType)}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{selectedTypeDef.name.toUpperCase()}</div>
                            <div style={{ fontSize: 7, color: '#94a3b8' }}>${selectedTypeDef.baseCost.toLocaleString()} · {selectedTypeDef.minTeamSize}–{selectedTypeDef.maxTeamSize} team</div>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedType(''); setSelectedTeamIds([]); }}
                      style={{ fontSize: 8, color: '#0ea5e9', textDecoration: 'underline' }}
                    >
                      Change type
                    </button>
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#0ea5e9', marginBottom: 8 }}>
                    2. SELECT TEAM — {selectedTeamIds.length}/{maxTeam} (need at least {minTeam})
                  </div>
                  <div
                    className="flex flex-wrap gap-3 p-4 rounded"
                    style={{
                      background: 'linear-gradient(180deg, #0c1222 0%, #1a2744 100%)',
                      border: '3px solid #0ea5e9',
                      minHeight: 100,
                    }}
                  >
                    {unassignedEmployees.map((emp) => {
                      const isSelected = selectedTeamIds.includes(emp.id);
                      const char = getCharacter(emp.id);
                      const avatar = char?.avatar ?? '👤';
                      const displayName = char?.name ?? emp.name;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleTeamMember(emp.id)}
                          className="flex items-center gap-2 px-4 py-3 rounded transition-all hover:scale-105"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                              : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                            border: `3px solid ${isSelected ? '#0369a1' : '#475569'}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#fff',
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{avatar}</span>
                          <span>{displayName.split(' ')[0]}</span>
                          {isSelected && <span style={{ marginLeft: 4, fontSize: 12 }}>✓</span>}
                        </button>
                      );
                    })}
                    {unassignedEmployees.length === 0 && (
                      <div style={{ fontSize: 10, color: '#f59e0b', fontStyle: 'italic' }}>
                        No one available — each employee can only work on one project at a time.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-6" style={{ borderTop: '5px solid #2d3748' }}>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                  border: '4px solid #475569',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#94a3b8',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleStartProject}
                disabled={!canStart}
                className="flex-1 py-3 rounded transition-all hover:scale-[1.02]"
                style={{
                  background: canStart
                    ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                  border: `4px solid ${canStart ? '#15803d' : '#475569'}`,
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: canStart ? '#fff' : '#64748b',
                  opacity: canStart ? 1 : 0.6,
                }}
              >
                START PROJECT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
