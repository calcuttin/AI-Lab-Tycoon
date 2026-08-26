import { useGameStore } from '../store/gameStore';
import type { Contract } from '../data/contracts';

export default function ContractsPanel() {
  const employees = useGameStore((state) => state.employees);
  const contracts = useGameStore((state) => state.contracts);
  const acceptContract = useGameStore((state) => state.acceptContract);
  const activeContract = contracts.find((contract) => contract.status === 'active') ?? null;

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
    acceptContract(contractId);
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
          <div
            className="w-full py-3 rounded"
            style={{
              background: '#0c1222',
              border: '4px solid #475569',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
              fontSize: 9,
              fontWeight: 'bold',
              color: '#f59e0b',
              textAlign: 'center',
            }}
          >
            WORK IN PROGRESS: {activeContract.progress} / {activeContract.workRequired} DAYS
          </div>
        </div>
      )}

      {/* Available contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts
          .filter(c => c.status === 'available')
          .map((contract) => {
            const canAccept = canAcceptContract(contract) && !activeContract;
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
