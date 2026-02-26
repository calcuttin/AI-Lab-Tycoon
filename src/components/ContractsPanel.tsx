import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface Contract {
  id: string;
  client: string;
  title: string;
  description: string;
  reward: number;
  deadline: number;
  requiredSkills: {
    development: number;
    research: number;
    creativity: number;
  };
  status: 'available' | 'active' | 'completed';
}

const availableContracts: Contract[] = [
  {
    id: 'contract-1',
    client: 'TechCorp',
    title: 'Build Enterprise Chatbot',
    description: 'A corporate client needs a custom chatbot for customer service.',
    reward: 25000,
    deadline: 60,
    requiredSkills: { development: 5, research: 2, creativity: 3 },
    status: 'available',
  },
  {
    id: 'contract-2',
    client: 'StartupXYZ',
    title: 'AI-Powered Analytics Dashboard',
    description: 'Help a startup build an AI analytics tool.',
    reward: 15000,
    deadline: 45,
    requiredSkills: { development: 4, research: 3, creativity: 4 },
    status: 'available',
  },
  {
    id: 'contract-3',
    client: 'Research Institute',
    title: 'ML Model for Data Analysis',
    description: 'Academic research project requiring advanced ML capabilities.',
    reward: 35000,
    deadline: 90,
    requiredSkills: { development: 3, research: 7, creativity: 2 },
    status: 'available',
  },
];

export default function ContractsPanel() {
  const employees = useGameStore((state) => state.employees);
  const addMoney = useGameStore((state) => state.addMoney);
  const completeContract = useGameStore((state) => state.completeContract);
  const [contracts, setContracts] = useState<Contract[]>(availableContracts);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);

  const canAcceptContract = (contract: Contract) => {
    const totalDev = employees.reduce((sum, e) => sum + e.skills.development, 0);
    const totalRes = employees.reduce((sum, e) => sum + e.skills.research, 0);
    const totalCre = employees.reduce((sum, e) => sum + e.skills.creativity, 0);
    
    return (
      totalDev >= contract.requiredSkills.development &&
      totalRes >= contract.requiredSkills.research &&
      totalCre >= contract.requiredSkills.creativity
    );
  };

  const handleAcceptContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !canAcceptContract(contract)) return;

    setContracts(prev => prev.map(c => 
      c.id === contractId ? { ...c, status: 'active' as const } : c
    ));
    setActiveContract(contract);
  };

  const handleCompleteContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    addMoney(contract.reward);
    completeContract();
    setContracts(prev => prev.map(c => 
      c.id === contractId ? { ...c, status: 'completed' as const } : c
    ));
    setActiveContract(null);
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        📋 CONTRACTS
      </h2>

      {/* Active contract */}
      {activeContract && (
        <div
          className="p-5 rounded mb-4"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #f59e0b',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                ACTIVE: {activeContract.title}
              </div>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>{activeContract.description}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#22c55e' }}>
              ${activeContract.reward.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => handleCompleteContract(activeContract.id)}
            className="w-full py-3 rounded transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '4px solid #15803d',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
              fontSize: 9,
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            COMPLETE CONTRACT
          </button>
        </div>
      )}

      {/* Available contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts
          .filter(c => c.status === 'available')
          .map((contract) => {
            const canAccept = canAcceptContract(contract);
            return (
              <div
                key={contract.id}
                className="p-4 rounded transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                  border: `5px solid ${canAccept ? '#0ea5e9' : '#475569'}`,
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
                  opacity: canAccept ? 1 : 0.7,
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                      {contract.title}
                    </div>
                    <div style={{ fontSize: 7, color: '#94a3b8', marginBottom: 4 }}>
                      Client: {contract.client}
                    </div>
                    <div style={{ fontSize: 8, color: '#94a3b8' }}>{contract.description}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e' }}>
                    ${contract.reward.toLocaleString()}
                  </div>
                </div>
                
                <div className="mb-3" style={{ fontSize: 7, color: '#94a3b8' }}>
                  <div>Required: Dev {contract.requiredSkills.development} | 
                    Res {contract.requiredSkills.research} | 
                    Cre {contract.requiredSkills.creativity}</div>
                  <div>Deadline: {contract.deadline} days</div>
                </div>

                <button
                  onClick={() => handleAcceptContract(contract.id)}
                  disabled={!canAccept}
                  className="w-full py-2 rounded transition-all hover:scale-[1.02]"
                  style={{
                    background: canAccept
                      ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)'
                      : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                    border: `3px solid ${canAccept ? '#0369a1' : '#475569'}`,
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                    fontSize: 8,
                    fontWeight: 'bold',
                    color: canAccept ? '#fff' : '#64748b',
                  }}
                >
                  {canAccept ? 'ACCEPT CONTRACT' : 'INSUFFICIENT SKILLS'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
