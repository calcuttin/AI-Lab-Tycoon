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
    { label: 'DAYS PLAYED', value: daysPlayed, color: '#b7d98e', icon: '📅' },
    { label: 'PROJECTS COMPLETED', value: totalProjectsCompleted, color: '#a5c992', icon: '🚀' },
    { label: 'TOTAL REVENUE', value: `$${(totalRevenueEver / 1000).toFixed(0)}k`, color: '#a5c992', icon: '💵' },
    { label: 'RESEARCH COMPLETED', value: completedResearch, color: '#b2a2cf', icon: '🔬' },
    { label: 'ACTIVE RESEARCH', value: activeResearch, color: '#d9b778', icon: '⚗️' },
    { label: 'TOTAL EMPLOYEES', value: employees.length, color: '#b7d98e', icon: '👥' },
    { label: 'CONTRACTS DONE', value: totalContractsCompleted, color: '#b7d98e', icon: '📋' },
    { label: 'TRAININGS DONE', value: totalTrainingsDone, color: '#b2a2cf', icon: '🎓' },
    { label: 'SHIPPED PRODUCTS', value: shippedProducts.length, color: '#a5c992', icon: '🛒' },
    { label: 'COMPANY PHASE', value: companyPhase.replace('_', ' '), color: '#b2a2cf', icon: '🏁' },
    { label: 'LEGACY POINTS', value: legacyPoints, color: '#ec4899', icon: '⭐' },
    { label: 'AVG MORALE', value: `${Math.floor(avgMorale)}%`, color: avgMorale > 70 ? '#a5c992' : avgMorale > 50 ? '#d9b778' : '#e49a8e', icon: '😊' },
    { label: 'AVG DEV SKILL', value: avgDevSkill.toFixed(1), color: '#b7d98e', icon: '💻' },
    { label: 'MONTHLY EXPENSES', value: `$${(totalSalaries + office.rent).toLocaleString()}`, color: '#e49a8e', icon: '💰' },
  ];

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#b7d98e', textShadow: 'none' }}>
        📊 STATISTICS
      </h2>

      {/* Trend Charts */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div
          className="p-4 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #a5c992',
            boxShadow: 'none',
          }}
        >
          <MiniChart data={revenueHistory} color="#a5c992" label="DAILY REVENUE (LAST 30 DAYS)" height={80} />
        </div>
        <div
          className="p-4 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #d9b778',
            boxShadow: 'none',
          }}
        >
          <MiniChart data={moraleHistory} color="#d9b778" label="TEAM MORALE TREND" height={80} />
        </div>
        <div
          className="p-4 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #b2a2cf',
            boxShadow: 'none',
          }}
        >
          <MiniChart data={reputationHistory} color="#b2a2cf" label="REPUTATION GROWTH" height={80} />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg relative overflow-hidden"
            style={{
              background: '#202523',
              border: `1px solid ${stat.color}`,
              boxShadow: 'none',
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div style={{ fontSize: 11, color: '#a7b39d' }}>{stat.label}</div>
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
          className="p-5 rounded-lg"
          style={{
            background: '#202523',
            border: '1px solid #b7d98e',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: 'none' }}>
            TEAM BREAKDOWN
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['engineer', 'researcher', 'designer', 'manager', 'intern'].map((role) => {
              const roleEmployees = employees.filter(e => e.role === role);
              return (
                <div
                  key={role}
                  className="p-3 rounded-lg text-center"
                  style={{
                    background: '#333b36',
                    border: '1px solid #46523d',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {roleEmployees.length > 0 ? '👤' : '👻'}
                  </div>
                  <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 2 }}>{role.toUpperCase()}</div>
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
