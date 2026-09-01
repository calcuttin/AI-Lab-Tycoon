import { seededRandom } from './prng';

export function drawHighway(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  zoom: number,
  streetLightIntensity: number,
) {
  const roadTop = groundY + 2;
  const roadHeight = 56 * zoom;

  const asphalt = ctx.createLinearGradient(0, roadTop, 0, roadTop + roadHeight);
  asphalt.addColorStop(0, '#334155');
  asphalt.addColorStop(0.35, '#1e293b');
  asphalt.addColorStop(1, '#0f172a');
  ctx.fillStyle = asphalt;
  ctx.fillRect(0, roadTop, width, roadHeight + 40);

  const skyReflection = ctx.createLinearGradient(0, roadTop, 0, roadTop + 18);
  skyReflection.addColorStop(0, 'rgba(148, 163, 184, 0.12)');
  skyReflection.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = skyReflection;
  ctx.fillRect(0, roadTop, width, 18);

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, roadTop - 3, width, 4);

  const dashSpacing = 48 * zoom;
  const offset = (-cameraX * zoom * 1.2) % dashSpacing;
  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  for (let x = offset; x < width; x += dashSpacing) {
    ctx.fillRect(x, roadTop + roadHeight * 0.42, 22 * zoom, 3);
  }

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, roadTop + roadHeight * 0.72);
  ctx.lineTo(width, roadTop + roadHeight * 0.72);
  ctx.stroke();

  const rnd = seededRandom(55);
  for (let x = offset; x < width; x += 180 * zoom) {
    if (rnd() > 0.55) continue;
    drawCarSilhouette(ctx, x, roadTop + roadHeight * 0.55, zoom, rnd() > 0.5);
  }

  if (streetLightIntensity > 0.1) {
    for (let x = 80; x < width; x += 220 * zoom) {
      const lx = x - (cameraX * zoom * 1.2) % (220 * zoom);
      if (lx < -20 || lx > width + 20) continue;
      drawStreetLight(ctx, lx, roadTop - 4, streetLightIntensity);
    }
  }
}

function drawCarSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zoom: number,
  headlightsOn: boolean,
) {
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(x, y, 38 * zoom, 12 * zoom, 3);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 8 * zoom, y - 8 * zoom, 22 * zoom, 8 * zoom);

  if (headlightsOn) {
    ctx.fillStyle = 'rgba(254, 249, 195, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x + 2 * zoom, y + 6 * zoom);
    ctx.lineTo(x - 14 * zoom, y + 14 * zoom);
    ctx.lineTo(x - 14 * zoom, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStreetLight(ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) {
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 48);
  ctx.lineTo(x + 14, y - 52);
  ctx.stroke();

  const glow = ctx.createRadialGradient(x + 14, y - 52, 0, x + 14, y - 52, 40);
  glow.addColorStop(0, `rgba(254, 240, 138, ${0.5 * intensity})`);
  glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 30, y - 92, 90, 80);
}
