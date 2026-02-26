import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function ParticleEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Listen for particle effect events
    const handleParticleEffect = (e: CustomEvent<{ type: 'money' | 'reputation' | 'celebration'; x: number; y: number }>) => {
      const { type, x, y } = e.detail;
      const colors = {
        money: ['#22c55e', '#16a34a'],
        reputation: ['#f59e0b', '#d97706'],
        celebration: ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7'],
      };
      
      const colorSet = colors[type];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: Date.now() + i,
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 1,
          color: colorSet[Math.floor(Math.random() * colorSet.length)],
        });
      }
      
      setParticles((prev) => [...prev, ...newParticles]);
    };

    window.addEventListener('particleEffect' as any, handleParticleEffect as EventListener);
    
    return () => {
      window.removeEventListener('particleEffect' as any, handleParticleEffect as EventListener);
    };
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ overflow: 'hidden' }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: 6,
            height: 6,
            background: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            boxShadow: `0 0 ${particle.life * 8}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}

// Helper function to trigger particle effects
export const triggerParticleEffect = (type: 'money' | 'reputation' | 'celebration', x: number, y: number) => {
  const event = new CustomEvent('particleEffect', {
    detail: { type, x, y },
  });
  window.dispatchEvent(event);
};
