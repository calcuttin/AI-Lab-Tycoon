import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Employee } from '../store/gameStore';
import { showNotification } from './NotificationToast';

export default function EmployeeTraining() {
  const employees = useGameStore((state) => state.employees);
  const money = useGameStore((state) => state.money);
  const trainEmployee = useGameStore((state) => state.trainEmployee);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<keyof Employee['skills'] | null>(null);

  const trainingCosts: Record<keyof Employee['skills'], number> = {
    development: 5000,
    research: 5000,
    creativity: 3000,
    management: 4000,
  };

  const handleTrain = () => {
    if (!selectedEmployee || !selectedSkill) return;
    
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;

    const cost = trainingCosts[selectedSkill];
    if (money < cost) {
      alert('Not enough money for training!');
      return;
    }

    // Training increases skill by 1 (max 10)
    const currentSkill = employee.skills[selectedSkill];
    if (currentSkill >= 10) {
      showNotification('This skill is already maxed out!', 'warning', 2000);
      return;
    }

    trainEmployee(selectedEmployee, selectedSkill);
    showNotification(`🎓 Trained ${employee.name} in ${selectedSkill}!`, 'success', 3000);
    setSelectedSkill(null);
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        🎓 EMPLOYEE TRAINING
      </h2>

      {employees.length === 0 ? (
        <div
          className="text-center py-16 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #2d3748',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 'bold' }}>
            NO EMPLOYEES TO TRAIN
          </div>
          <div style={{ fontSize: 9, color: '#64748b' }}>Hire employees first!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee selection */}
          <div
            className="p-5 rounded"
            style={{
              background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
              border: '5px solid #0ea5e9',
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: '1px 1px 0 #000' }}>
              SELECT EMPLOYEE
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className="w-full p-3 rounded text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: selectedEmployee === emp.id
                      ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                      : 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                    border: `3px solid ${selectedEmployee === emp.id ? '#0369a1' : '#475569'}`,
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                    {emp.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 7, color: '#94a3b8' }}>{emp.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skill selection */}
          {selectedEmployee && (
            <div
              className="p-5 rounded"
              style={{
                background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                border: '5px solid #22c55e',
                boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: '1px 1px 0 #000' }}>
                SELECT SKILL
              </div>
              {(['development', 'research', 'creativity', 'management'] as const).map((skill) => {
                const employee = employees.find(e => e.id === selectedEmployee);
                const currentLevel = employee?.skills[skill] || 0;
                const cost = trainingCosts[skill];
                const canTrain = currentLevel < 10 && money >= cost;

                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    disabled={!canTrain}
                    className="w-full p-4 rounded mb-3 text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: selectedSkill === skill
                        ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                        : 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                      border: `3px solid ${selectedSkill === skill ? '#15803d' : '#475569'}`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                      opacity: canTrain ? 1 : 0.6,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div style={{ fontSize: 9, fontWeight: 'bold', color: '#fff' }}>
                        {skill.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        {currentLevel}/10
                      </div>
                    </div>
                    <div style={{ fontSize: 8, color: '#94a3b8' }}>
                      Cost: ${cost.toLocaleString()}
                    </div>
                  </button>
                );
              })}

              {selectedSkill && (
                <button
                  onClick={handleTrain}
                  className="w-full py-4 rounded transition-all hover:scale-[1.02] mt-4"
                  style={{
                    background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                    border: '4px solid #15803d',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  TRAIN (+1 SKILL)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
