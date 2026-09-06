import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Employee } from '../store/gameStore';
import { showNotification } from '../systems/feedback';

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
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        🎓 EMPLOYEE TRAINING
      </h2>

      {employees.length === 0 ? (
        <div
          className="text-center py-16 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #333b36',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <div style={{ fontSize: 14, color: '#a7b39d', marginBottom: 6, fontWeight: 'bold' }}>
            NO EMPLOYEES TO TRAIN
          </div>
          <div style={{ fontSize: 12, color: '#8b9980' }}>Hire employees first!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee selection */}
          <div
            className="p-5 rounded-lg"
            style={{
              background: '#202523',
              border: '1px solid #b7d98e',
              boxShadow: 'none',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: 'none' }}>
              SELECT EMPLOYEE
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className="w-full p-3 rounded-lg text-left transition-all "
                  style={{
                    background: selectedEmployee === emp.id
                      ? '#b7d98e'
                      : '#333b36',
                    border: `1px solid ${selectedEmployee === emp.id ? '#536b3e' : '#46523d'}`,
                    boxShadow: 'none',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                    {emp.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: '#a7b39d' }}>{emp.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skill selection */}
          {selectedEmployee && (
            <div
              className="p-5 rounded-lg"
              style={{
                background: '#202523',
                border: '1px solid #a5c992',
                boxShadow: 'none',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: 'none' }}>
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
                    className="w-full p-4 rounded-lg mb-3 text-left transition-all "
                    style={{
                      background: selectedSkill === skill
                        ? '#a5c992'
                        : '#333b36',
                      border: `1px solid ${selectedSkill === skill ? '#425637' : '#46523d'}`,
                      boxShadow: 'none',
                      opacity: canTrain ? 1 : 0.6,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
                        {skill.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, color: '#a7b39d' }}>
                        {currentLevel}/10
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#a7b39d' }}>
                      Cost: ${cost.toLocaleString()}
                    </div>
                  </button>
                );
              })}

              {selectedSkill && (
                <button
                  onClick={handleTrain}
                  className="w-full py-4 rounded-lg transition-all  mt-4"
                  style={{
                    background: '#425637',
                    border: '1px solid #425637',
                    boxShadow: 'none',
                    fontSize: 13,
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
