import { useGameStore } from '../store/gameStore';
import MiniChart from './MiniChart';

export default function StatisticsPanel() {
  const employees = useGameStore((state) => state.employees);
  const researchNodes = useGameStore((state) => state.researchNodes);
  const totalProjectsCompleted = useGameStore((state) => state.totalProjectsCompleted);
  const office = useGameStore((state) => state.office);
  const daysPlayed = useGameStore((state) => state.daysPlayed);
  const totalRevenueEver = useGameStore((state) => state.totalRevenueEver);
  const totalContractsCompleted = useGameStore((state) => state.totalContractsCompleted);
  const totalTrainingsDone = useGameStore((state) => state.totalTrainingsDone);
  const shippedProducts = useGameStore((state) => state.shippedProducts);
  const companyPhase = useGameStore((state) => state.companyPhase);
  const legacyPoints = useGameStore((state) => state.legacyPoints);
  const revenueHistory = useGameStore((state) => state.revenueHistory);
  const moraleHistory = useGameStore((state) => state.moraleHistory);
  const reputationHistory = useGameStore((state) => state.reputationHistory);

  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgMorale = employees.length > 0
    ? employees.reduce((sum, e) => sum + e.morale, 0) / employees.length
    : 0;
  const avgDevSkill = employees.length > 0
    ? employees.reduce((sum, e) => sum + e.skills.development, 0) / employees.length
    : 0;
  const completedResearch = researchNodes.filter(n => n.completed).length;
  const activeResearch = researchNodes.filter(n => n.progress > 0 && !n.completed).length;

  const stats = [
    { label: 'DAYS PLAYED', value: daysPlayed, color: '#0ea5e9', icon: '📅' },
    { label: 'PROJECTS COMPLETED', value: totalProjectsCompleted, color: '#22c55e', icon: '🚀' },
    { label: 'TOTAL REVENUE', value: `$${(totalRevenueEver / 1000).toFixed(0)}k`, color: '#22c55e', icon: '💵' },
    { label: 'RESEARCH COMPLETED', value: completedResearch, color: '#a855f7', icon: '🔬' },
    { label: 'ACTIVE RESEARCH', value: activeResearch, color: '#f59e0b', icon: '⚗️' },
    { label: 'TOTAL EMPLOYEES', value: employees.length, color: '#0ea5e9', icon: '👥' },
    { label: 'CONTRACTS DONE', value: totalContractsCompleted, color: '#0ea5e9', icon: '📋' },
    { label: 'TRAININGS DONE', value: totalTrainingsDone, color: '#a855f7', icon: '🎓' },
    { label: 'SHIPPED PRODUCTS', value: shippedProducts.length, color: '#22c55e', icon: '🛒' },
    { label: 'COMPANY PHASE', value: companyPhase.replace('_', ' '), color: '#a855f7', icon: '🏁' },
    { label: 'LEGACY POINTS', value: legacyPoints, color: '#ec4899', icon: '⭐' },
    { label: 'AVG MORALE', value: `${Math.floor(avgMorale)}%`, color: avgMorale > 70 ? '#22c55e' : avgMorale > 50 ? '#f59e0b' : '#ef4444', icon: '😊' },
    { label: 'AVG DEV SKILL', value: avgDevSkill.toFixed(1), color: '#0ea5e9', icon: '💻' },
    { label: 'MONTHLY EXPENSES', value: `$${(totalSalaries + office.rent).toLocaleString()}`, color: '#ef4444', icon: '💰' },
  ];

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        📊 STATISTICS
      </h2>

      {/* Trend Charts */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div
          className="p-4 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #22c55e',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <MiniChart data={revenueHistory} color="#22c55e" label="DAILY REVENUE (LAST 30 DAYS)" height={80} />
        </div>
        <div
          className="p-4 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #f59e0b',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <MiniChart data={moraleHistory} color="#f59e0b" label="TEAM MORALE TREND" height={80} />
        </div>
        <div
          className="p-4 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '4px solid #a855f7',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <MiniChart data={reputationHistory} color="#a855f7" label="REPUTATION GROWTH" height={80} />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="p-4 rounded relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
              border: `4px solid ${stat.color}`,
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>{stat.label}</div>
            </div>
            <div
              style={{
                fontSize: 16,
                color: stat.color,
                fontWeight: 'bold',
                textShadow: `0 0 10px ${stat.color}88`,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Employee breakdown */}
      {employees.length > 0 && (
        <div
          className="p-5 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #0ea5e9',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: '1px 1px 0 #000' }}>
            TEAM BREAKDOWN
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['engineer', 'researcher', 'designer', 'manager', 'intern'].map((role) => {
              const roleEmployees = employees.filter(e => e.role === role);
              return (
                <div
                  key={role}
                  className="p-3 rounded text-center"
                  style={{
                    background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                    border: '3px solid #475569',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {roleEmployees.length > 0 ? '👤' : '👻'}
                  </div>
                  <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 2 }}>{role.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>{roleEmployees.length}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
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
      `}</style>
    </div>
  );
}
