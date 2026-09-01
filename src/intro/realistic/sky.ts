import type { Atmosphere } from './atmosphere';
import { seededRandom } from './prng';

export interface CloudPuff {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const clouds: CloudPuff[] = (() => {
  const rnd = seededRandom(42);
  return Array.from({ length: 28 }, () => ({
    x: rnd() * 1.4 - 0.1,
    y: rnd() * 0.35 + 0.04,
    scale: 0.6 + rnd() * 1.4,
    opacity: 0.35 + rnd() * 0.45,
  }));
})();

export function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  atmosphere: Atmosphere,
  time: number,
  cameraX: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, atmosphere.skyTop);
  gradient.addColorStop(0.45, atmosphere.skyHorizon);
  gradient.addColorStop(1, atmosphere.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (atmosphere.showStars) {
    const rnd = seededRandom(7);
    for (let i = 0; i < 120; i++) {
      const sx = rnd() * width;
      const sy = rnd() * height * 0.45;
      const twinkle = 0.3 + Math.sin(time * 1.5 + i) * 0.2;
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.fillRect(sx, sy, rnd() > 0.85 ? 2 : 1, rnd() > 0.85 ? 2 : 1);
    }
  }

  if (atmosphere.sunRadius > 0) {
    const glow = ctx.createRadialGradient(
      atmosphere.sunX,
      atmosphere.sunY,
      atmosphere.sunRadius * 0.2,
      atmosphere.sunX,
      atmosphere.sunY,
      atmosphere.sunRadius * 4,
    );
    glow.addColorStop(0, atmosphere.sunGlow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const sun = ctx.createRadialGradient(
      atmosphere.sunX,
      atmosphere.sunY,
      0,
      atmosphere.sunX,
      atmosphere.sunY,
      atmosphere.sunRadius,
    );
    sun.addColorStop(0, atmosphere.sunCore);
    sun.addColorStop(0.7, '#fde68a');
    sun.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(atmosphere.sunX, atmosphere.sunY, atmosphere.sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const parallax = cameraX * 0.00008;
  for (const cloud of clouds) {
    const cx = ((cloud.x - parallax + time * 0.008) % 1.3) * width;
    const cy = cloud.y * height;
    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    drawCloudPuff(ctx, cx, cy, 80 * cloud.scale);
    ctx.restore();
  }

  const haze = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.72);
  haze.addColorStop(0, 'rgba(255,255,255,0)');
  haze.addColorStop(1, atmosphere.haze);
  ctx.fillStyle = haze;
  ctx.globalAlpha = atmosphere.hazeStrength;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

function drawCloudPuff(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.22, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.35, y - size * 0.05, size * 0.4, size * 0.18, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * 0.3, y + size * 0.02, size * 0.35, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
}
