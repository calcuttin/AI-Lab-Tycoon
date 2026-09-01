import type { Atmosphere } from './atmosphere';
import { seededRandom } from './prng';

const ridgePoints = (() => {
  const rnd = seededRandom(99);
  return Array.from({ length: 12 }, () => 0.25 + rnd() * 0.55);
})();

export function drawMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  atmosphere: Atmosphere,
) {
  const layers = [
    { parallax: 0.04, color: atmosphere.mountainFar, height: 0.18, alpha: 0.55 },
    { parallax: 0.08, color: atmosphere.mountainMid, height: 0.14, alpha: 0.7 },
    { parallax: 0.14, color: atmosphere.mountainNear, height: 0.1, alpha: 0.85 },
  ];

  for (const layer of layers) {
    ctx.save();
    ctx.globalAlpha = layer.alpha;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    const offset = (cameraX * layer.parallax) % width;
    for (let x = -width; x <= width * 2; x += width / ridgePoints.length) {
      const index = Math.floor(((x + offset) / width) * ridgePoints.length) % ridgePoints.length;
      const peak = groundY - layer.height * width * ridgePoints[Math.abs(index)];
      ctx.lineTo(x - offset, peak);
    }
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function drawGroundBase(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
  const gradient = ctx.createLinearGradient(0, groundY - 40, 0, groundY + 120);
  gradient.addColorStop(0, '#3f6212');
  gradient.addColorStop(0.15, '#365314');
  gradient.addColorStop(0.4, '#292524');
  gradient.addColorStop(1, '#1c1917');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, groundY - 8, width, ctx.canvas.height / (window.devicePixelRatio || 1) - groundY + 8);
}
