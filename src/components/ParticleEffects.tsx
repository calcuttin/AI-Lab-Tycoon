import { useEffect, useState } from 'react';
import { subscribeToParticles, type ParticlePayload } from '../systems/feedback';

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
    return subscribeToParticles((payload: ParticlePayload) => {
      const colors = {
        money: ['#22c55e', '#16a34a'],
        reputation: ['#f59e0b', '#d97706'],
        celebration: ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7'],
      };

      const colorSet = colors[payload.type];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: payload.x,
          y: payload.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 1,
          color: colorSet[Math.floor(Math.random() * colorSet.length)],
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    });
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = window.setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1,
            life: particle.life - 0.02,
          }))
          .filter((particle) => particle.life > 0),
      );
    }, 16);

    return () => window.clearInterval(interval);
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
