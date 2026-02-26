import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface DailyLog {
  date: Date;
  revenue: number;
  expenses: number;
  projectsCompleted: number;
  events: string[];
}

export default function DailyReport() {
  const currentDate = useGameStore((state) => state.currentDate);
  const employees = useGameStore((state) => state.employees);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    // Check if it's a new day (month change triggers report)
    const dayOfMonth = currentDate.getDate();
    if (dayOfMonth === 1 && logs.length > 0) {
      // Generate monthly report
      const monthlyRevenue = logs.reduce((sum, log) => sum + log.revenue, 0);
      const monthlyExpenses = logs.reduce((sum, log) => sum + log.expenses, 0);
      const totalCompleted = logs.reduce((sum, log) => sum + log.projectsCompleted, 0);
      
      setTodayLog({
        date: currentDate,
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        projectsCompleted: totalCompleted,
        events: logs.flatMap(log => log.events),
      });
      setShowReport(true);
      setLogs([]); // Reset for new month
    }
  }, [currentDate, logs]);

  const handleClose = () => {
    setShowReport(false);
  };

  if (!showReport || !todayLog) return null;

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
        className="w-full max-w-xl rounded overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '8px solid #f59e0b',
          boxShadow: '10px 10px 0 rgba(0,0,0,0.5), 0 0 60px rgba(245, 158, 11, 0.4)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderBottom: '5px solid #b45309',
          }}
        >
          <div style={{ fontSize: 9, color: '#fff', opacity: 0.9, letterSpacing: '0.2em', marginBottom: 4 }}>
            📊 MONTHLY REPORT
          </div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '4px 4px 0 rgba(0,0,0,0.4)',
            }}
          >
            {todayLog.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h2>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '4px solid #22c55e',
              }}
            >
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>REVENUE</div>
              <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 'bold' }}>
                +${todayLog.revenue.toLocaleString()}
              </div>
            </div>
            <div
              className="p-4 rounded"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '4px solid #ef4444',
              }}
            >
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>EXPENSES</div>
              <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 'bold' }}>
                -${todayLog.expenses.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div
            className="p-5 rounded text-center"
            style={{
              background: netIncome >= 0
                ? 'linear-gradient(180deg, #22c55e22 0%, transparent 100%)'
                : 'linear-gradient(180deg, #ef444422 0%, transparent 100%)',
              border: `4px solid ${netIncome >= 0 ? '#22c55e' : '#ef4444'}`,
            }}
          >
            <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 4 }}>NET INCOME</div>
            <div
              style={{
                fontSize: 20,
                color: netIncome >= 0 ? '#22c55e' : '#ef4444',
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
              className="p-4 rounded"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '4px solid #0ea5e9',
              }}
            >
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>PROJECTS COMPLETED</div>
              <div style={{ fontSize: 16, color: '#0ea5e9', fontWeight: 'bold' }}>
                {todayLog.projectsCompleted}
              </div>
            </div>
            <div
              className="p-4 rounded"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: '4px solid #a855f7',
              }}
            >
              <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>TEAM SIZE</div>
              <div style={{ fontSize: 16, color: '#a855f7', fontWeight: 'bold' }}>
                {employees.length}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full py-4 rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '5px solid #15803d',
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
              fontSize: 10,
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
