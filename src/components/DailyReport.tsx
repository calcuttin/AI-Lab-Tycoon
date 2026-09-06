import { useGameStore } from '../store/gameStore';

export default function DailyReport() {
  const employees = useGameStore((state) => state.employees);
  const todayLog = useGameStore((state) => state.monthlyReport);
  const dismissMonthlyReport = useGameStore((state) => state.dismissMonthlyReport);

  const handleClose = () => {
    dismissMonthlyReport();
  };

  if (!todayLog) return null;

  const netIncome = todayLog.revenue - todayLog.expenses;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[350] p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        fontFamily: 'var(--font-pixel)',
      }}
    >
      <div
        className="w-full max-w-xl rounded-lg overflow-hidden"
        style={{
          background: '#202523',
          border: '1px solid #d9b778',
          boxShadow: 'none',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #d9b778 0%, #d97706 100%)',
            borderBottom: '1px solid #b45309',
          }}
        >
          <div style={{ fontSize: 12, color: '#fff', opacity: 0.9, letterSpacing: '0.2em', marginBottom: 4 }}>
            📊 MONTHLY REPORT
          </div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: 'none',
            }}
          >
            {new Date(todayLog.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h2>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#333b36',
                border: '1px solid #a5c992',
              }}
            >
              <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 4 }}>REVENUE</div>
              <div style={{ fontSize: 14, color: '#a5c992', fontWeight: 'bold' }}>
                +${todayLog.revenue.toLocaleString()}
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#333b36',
                border: '1px solid #e49a8e',
              }}
            >
              <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 4 }}>EXPENSES</div>
              <div style={{ fontSize: 14, color: '#e49a8e', fontWeight: 'bold' }}>
                -${todayLog.expenses.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div
            className="p-5 rounded-lg text-center"
            style={{
              background: netIncome >= 0
                ? 'linear-gradient(180deg, #a5c99222 0%, transparent 100%)'
                : 'linear-gradient(180deg, #e49a8e22 0%, transparent 100%)',
              border: `1px solid ${netIncome >= 0 ? '#a5c992' : '#e49a8e'}`,
            }}
          >
            <div style={{ fontSize: 12, color: '#a7b39d', marginBottom: 4 }}>NET INCOME</div>
            <div
              style={{
                fontSize: 20,
                color: netIncome >= 0 ? '#a5c992' : '#e49a8e',
                fontWeight: 'bold',
                textShadow: `0 0 15px ${netIncome >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
              }}
            >
              {netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString()}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#333b36',
                border: '1px solid #b7d98e',
              }}
            >
              <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 4 }}>PROJECTS COMPLETED</div>
              <div style={{ fontSize: 16, color: '#b7d98e', fontWeight: 'bold' }}>
                {todayLog.projectsCompleted}
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#333b36',
                border: '1px solid #b2a2cf',
              }}
            >
              <div style={{ fontSize: 11, color: '#a7b39d', marginBottom: 4 }}>TEAM SIZE</div>
              <div style={{ fontSize: 16, color: '#b2a2cf', fontWeight: 'bold' }}>
                {employees.length}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full py-4 rounded-lg transition-all  active:scale-[0.98]"
            style={{
              background: '#425637',
              border: '1px solid #425637',
              boxShadow: 'none',
              fontSize: 13,
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
