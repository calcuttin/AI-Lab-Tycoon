import { useState, useEffect } from 'react';

interface WelcomePanelProps {
  onClose: () => void;
}

export default function WelcomePanel({ onClose }: WelcomePanelProps) {
  const [page, setPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const pages = [
    {
      title: 'WELCOME TO AI LAB TYCOON',
      content: (
        <div className="space-y-5">
          <p style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            You're a startup founder in Silicon Valley, ready to build the next
            big AI company. You've got $100,000 in seed funding, a laptop, and
            a dream. First order of business: hire your team.
          </p>
          <p style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
            Your goal: Build the most successful AI lab in the world, beat your
            competitors, and maybe... just maybe... achieve AGI.
          </p>
          <div
            className="mt-6 p-4 rounded text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
              border: '4px solid #475569',
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.5s ease-out 0.4s both',
            }}
          >
            <span style={{ fontSize: 32, display: 'block', animation: 'bounce 2s ease-in-out infinite' }}>🚀</span>
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>
              "Making the world a better place... through AI"
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'HOW TO PLAY',
      content: (
        <div className="space-y-5">
          {[
            { icon: '👥', title: 'HIRE TEAM', desc: 'Recruit engineers, researchers, and managers to build your lab', color: '#22c55e' },
            { icon: '📁', title: 'START PROJECTS', desc: 'Assign teams to build AI products and earn revenue', color: '#0ea5e9' },
            { icon: '🔬', title: 'RESEARCH', desc: 'Unlock new technologies to build better products', color: '#a855f7' },
            { icon: '🏢', title: 'UPGRADE OFFICE', desc: 'Expand your space and add amenities for your team', color: '#f59e0b' },
          ].map((item, index) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-4 rounded transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: `4px solid ${item.color}`,
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 'bold', color: item.color, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'TIPS',
      content: (
        <div className="space-y-4">
          {[
            { tip: 'FIRST STEP: Visit the TEAM tab to hire employees — you can\'t build without a team!', color: '#22c55e' },
            { tip: 'Research unlocks new project types with higher revenue potential', color: '#0ea5e9' },
            { tip: 'Watch your burn rate! Salaries and rent are paid monthly', color: '#f59e0b' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 rounded relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #2d3748 0%, #1a2744 100%)',
                border: `4px solid ${item.color}`,
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 'bold', color: item.color, marginBottom: 6 }}>
                💡 TIP {index + 1}
              </div>
              <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.6 }}>
                {item.tip}
              </div>
            </div>
          ))}
          <div
            className="text-center mt-6 p-4 rounded"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              border: '4px solid #15803d',
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <div style={{ fontSize: 10, color: '#fff', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              🎮 READY TO BUILD YOUR AI EMPIRE?
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentPage = pages[page];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[250] p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        fontFamily: 'var(--font-pixel)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        className="w-full max-w-lg rounded overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0c1222 100%)',
          border: '8px solid #0ea5e9',
          boxShadow: '10px 10px 0 rgba(0,0,0,0.6), 0 0 60px rgba(14, 165, 233, 0.4)',
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-5 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
            borderBottom: '5px solid #0369a1',
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
            }}
          />
          <h2
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '4px 4px 0 rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {currentPage.title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-8" style={{ fontSize: 9, color: '#e2e8f0', lineHeight: 1.8 }}>
          {currentPage.content}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderTop: '5px solid #2d3748' }}
        >
          {/* Page indicators */}
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full cursor-pointer transition-all"
                style={{
                  background: i === page ? '#0ea5e9' : '#475569',
                  boxShadow: i === page ? '0 0 12px #0ea5e9' : 'none',
                  transform: i === page ? 'scale(1.2)' : 'scale(1)',
                }}
                onClick={() => setPage(i)}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {page > 0 && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-5 py-2 rounded transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                  border: '4px solid #475569',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#94a3b8',
                }}
              >
                ← BACK
              </button>
            )}
            {page < pages.length - 1 ? (
              <button
                onClick={() => setPage(page + 1)}
                className="px-5 py-2 rounded transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                  border: '4px solid #0369a1',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-8 py-2 rounded transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                  border: '4px solid #15803d',
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.3), 0 0 20px rgba(34, 197, 94, 0.4)',
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                LET'S GO! 🚀
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
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
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
