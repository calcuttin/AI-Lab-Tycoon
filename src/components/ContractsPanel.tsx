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
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        📋 CONTRACTS
      </h2>

      {/* Active contract */}
      {activeContract && (
        <div
          className="p-5 rounded-lg mb-4"
          style={{
            background: '#202523',
            border: '1px solid #d9b778',
            boxShadow: 'none',
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                ACTIVE: {activeContract.title}
              </div>
              <div style={{ fontSize: 11, color: '#a7b39d' }}>{activeContract.description}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#a5c992' }}>
              ${activeContract.reward.toLocaleString()}
            </div>
          </div>
          <div
            className="w-full py-3 rounded-lg"
            style={{
              background: '#171b1a',
              border: '1px solid #46523d',
              boxShadow: 'none',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#d9b778',
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
                className="p-4 rounded-lg transition-all "
                style={{
                  background: '#202523',
                  border: `1px solid ${canAccept ? '#b7d98e' : '#46523d'}`,
                  boxShadow: 'none',
                  opacity: canAccept ? 1 : 0.7,
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                      {contract.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#a7b39d', marginBottom: 4 }}>
                      Client: {contract.client}
                    </div>
                    <div style={{ fontSize: 11, color: '#a7b39d' }}>{contract.description}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#a5c992' }}>
                    ${contract.reward.toLocaleString()}
                  </div>
                </div>
                
                <div className="mb-3" style={{ fontSize: 10, color: '#a7b39d' }}>
                  <div>Required: Dev {contract.requiredSkills.development} | 
                    Res {contract.requiredSkills.research} | 
                    Cre {contract.requiredSkills.creativity}</div>
                  <div>Deadline: {contract.deadline} days</div>
                </div>

                <button
                  onClick={() => handleAcceptContract(contract.id)}
                  disabled={!canAccept}
                  className="w-full py-2 rounded-lg transition-all "
                  style={{
                    background: canAccept
                      ? '#b7d98e'
                      : '#333d32',
                    border: `1px solid ${canAccept ? '#536b3e' : '#46523d'}`,
                    boxShadow: 'none',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: canAccept ? '#fff' : '#8b9980',
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
