import { useGameStore } from '../store/gameStore';

export default function MarketView() {
  const competitors = useGameStore((state) => state.competitors);
  const reputation = useGameStore((state) => state.reputation);
  const money = useGameStore((state) => state.money);
  const employees = useGameStore((state) => state.employees);
  const projects = useGameStore((state) => state.projects);
  const competitorNews = useGameStore((state) => state.competitorNews);
  const daysPlayed = useGameStore((state) => state.daysPlayed);

  const calculateMarketShare = () => {
    const totalShare = competitors.reduce((sum, c) => sum + c.marketShare, 0);
    return Math.max(0, 100 - totalShare);
  };

  const yourMarketShare = calculateMarketShare();

  // Competitor colors
  const competitorColors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-pixel)' }}>
      <h2 className="text-sm font-bold tracking-wide" style={{ color: '#0ea5e9', textShadow: '2px 2px 0 #0369a1' }}>
        📊 MARKET
      </h2>

      {/* Market trends section */}
      <div
        className="p-5 rounded mb-4"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #a855f7',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadow: '1px 1px 0 #000' }}>
          📈 MARKET TRENDS
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ fontSize: 8 }}>
          <div className="p-3 rounded" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '2px solid #0ea5e944' }}>
            <div style={{ color: '#94a3b8', marginBottom: 2 }}>AI DEMAND</div>
            <div style={{ color: '#22c55e', fontWeight: 'bold' }}>↑ HIGH</div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '2px solid #f59e0b44' }}>
            <div style={{ color: '#94a3b8', marginBottom: 2 }}>COMPETITION</div>
            <div style={{ color: '#ef4444', fontWeight: 'bold' }}>↑ INTENSE</div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '2px solid #a855f744' }}>
            <div style={{ color: '#94a3b8', marginBottom: 2 }}>INNOVATION</div>
            <div style={{ color: '#a855f7', fontWeight: 'bold' }}>→ STEADY</div>
          </div>
          <div className="p-3 rounded" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e44' }}>
            <div style={{ color: '#94a3b8', marginBottom: 2 }}>FUNDING</div>
            <div style={{ color: '#22c55e', fontWeight: 'bold' }}>↑ AVAILABLE</div>
          </div>
        </div>
      </div>

      {/* Industry News Feed */}
      {competitorNews.length > 0 && (
        <div
          className="p-5 rounded mb-4"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #0ea5e9',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: '1px 1px 0 #000' }}>
            📰 INDUSTRY NEWS
          </div>
          <div className="space-y-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {competitorNews.map((item, i) => (
              <div
                key={`${item.day}-${i}`}
                className="flex items-center gap-3 p-3 rounded"
                style={{
                  background: i === 0 ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: i === 0 ? '2px solid #0ea5e944' : '1px solid #1e293b',
                  animation: i === 0 ? 'fadeInUp 0.5s ease-out' : undefined,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div className="flex-1">
                  <div style={{ fontSize: 8, color: '#e2e8f0' }}>{item.headline}</div>
                  <div style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>
                    Day {item.day} • {daysPlayed - item.day === 0 ? 'TODAY' : `${daysPlayed - item.day}d ago`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your stats - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #0ea5e9',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.4), 5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          {/* Animated background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(14, 165, 233, 0.1) 10px, rgba(14, 165, 233, 0.1) 20px)',
              animation: 'slideBg 3s linear infinite',
            }}
          />
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadow: '1px 1px 0 #000', position: 'relative', zIndex: 1 }}>
            YOUR LAB
          </div>
          <div className="space-y-3" style={{ fontSize: 9, position: 'relative', zIndex: 1 }}>
            <div className="flex justify-between items-center">
              <span style={{ color: '#94a3b8' }}>MARKET SHARE:</span>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: 12, textShadow: '0 0 10px rgba(14, 165, 233, 0.6)' }}>
                {yourMarketShare.toFixed(1)}%
              </span>
            </div>
            {/* Market share visual bar */}
            <div
              style={{
                height: 16,
                background: '#2d3748',
                borderRadius: 3,
                border: '3px solid #475569',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(yourMarketShare / 100) * 100}%`,
                  background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                  boxShadow: 'inset 0 0 10px rgba(14, 165, 233, 0.5)',
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: '#94a3b8' }}>REPUTATION:</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 12, textShadow: '0 0 10px rgba(245, 158, 11, 0.6)' }}>
                {reputation}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-5 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #22c55e',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadow: '1px 1px 0 #000' }}>
            STATS
          </div>
          <div className="space-y-2" style={{ fontSize: 8 }}>
            <div className="flex justify-between">
              <span style={{ color: '#94a3b8' }}>EMPLOYEES:</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{employees.length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#94a3b8' }}>ACTIVE PROJECTS:</span>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#94a3b8' }}>CAPITAL:</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                ${money >= 1000000 ? `${(money / 1000000).toFixed(2)}M` : money >= 1000 ? `${(money / 1000).toFixed(1)}K` : money.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-5 rounded"
          style={{
            background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
            border: '5px solid #f59e0b',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadow: '1px 1px 0 #000' }}>
            TRENDS
          </div>
          <div className="space-y-2" style={{ fontSize: 8, color: '#94a3b8' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12 }}>📈</span>
              <span>CHATBOTS ARE TRENDING</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12 }}>🚀</span>
              <span>MULTIMODAL AI GROWING</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12 }}>⚠️</span>
              <span>SAFETY CONCERNS RISING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market share pie chart visualization */}
      <div
        className="p-5 rounded"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '5px solid #2d3748',
          boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', marginBottom: 12, textShadow: '1px 1px 0 #000' }}>
          MARKET SHARE BREAKDOWN
        </div>
        <div className="space-y-3">
          {/* Your share */}
          <div>
            <div className="flex justify-between mb-2" style={{ fontSize: 8 }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#0ea5e9' }} />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>YOUR LAB</span>
              </div>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{yourMarketShare.toFixed(1)}%</span>
            </div>
            <div
              style={{
                height: 12,
                background: '#2d3748',
                borderRadius: 2,
                border: '2px solid #475569',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(yourMarketShare / 100) * 100}%`,
                  background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                  boxShadow: 'inset 0 0 8px rgba(14, 165, 233, 0.5)',
                }}
              />
            </div>
          </div>
          
          {/* Competitors */}
          {competitors.map((competitor, index) => {
            const color = competitorColors[index % competitorColors.length];
            return (
              <div key={competitor.id}>
                <div className="flex justify-between mb-2" style={{ fontSize: 8 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: color }} />
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{competitor.name.toUpperCase()}</span>
                  </div>
                  <span style={{ color, fontWeight: 'bold' }}>{competitor.marketShare.toFixed(1)}%</span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: '#2d3748',
                    borderRadius: 2,
                    border: '2px solid #475569',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(competitor.marketShare / 100) * 100}%`,
                      background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                      boxShadow: `inset 0 0 8px ${color}88`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitors grid - Enhanced */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 12 }}>
          COMPETITORS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((competitor, index) => {
            const color = competitorColors[index % competitorColors.length];
            return (
              <div
                key={competitor.id}
                className="rounded relative overflow-hidden transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
                  border: `5px solid ${color}`,
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
                }}
              >
                {/* Header */}
                <div
                  className="p-4"
                  style={{
                    background: `linear-gradient(135deg, ${color}22 0%, transparent 100%)`,
                    borderBottom: `2px solid ${color}44`,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#fff', marginBottom: 4, textShadow: '1px 1px 0 #000' }}>
                    {competitor.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 7, color: '#64748b', fontStyle: 'italic' }}>
                    "{competitor.tagline}"
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3" style={{ fontSize: 8 }}>
                  <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <span style={{ color: '#94a3b8' }}>SHARE:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>{competitor.marketShare}%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                    <span style={{ color: '#94a3b8' }}>REP:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 10 }}>{competitor.reputation}</span>
                  </div>
                  {/* Market share bar */}
                  <div
                    style={{
                      height: 14,
                      background: '#2d3748',
                      borderRadius: 3,
                      border: '3px solid #475569',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${competitor.marketShare}%`,
                        background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                        boxShadow: `inset 0 0 10px ${color}88`,
                      }}
                    />
                  </div>
                  {/* Recent activity */}
                  {competitor.recentActivity.length > 0 && (
                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 7, color: '#64748b', marginBottom: 4 }}>RECENT:</div>
                      {competitor.recentActivity.slice(0, 2).map((activity, ai) => (
                        <div key={ai} style={{ fontSize: 7, color: '#94a3b8', marginBottom: 2, lineHeight: 1.4 }}>
                          • {activity}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes slideBg {
          from { transform: translateX(0); }
          to { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}
