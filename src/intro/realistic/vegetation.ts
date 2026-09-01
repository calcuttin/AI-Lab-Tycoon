import { seededRandom } from './prng';

export function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, groundY);

  const trunkGrad = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
  trunkGrad.addColorStop(0, '#78350f');
  trunkGrad.addColorStop(0.5, '#a16207');
  trunkGrad.addColorStop(1, '#713f12');
  ctx.strokeStyle = trunkGrad;
  ctx.lineWidth = 5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6 * scale, -30 * scale, 2 * scale, -58 * scale);
  ctx.stroke();

  ctx.fillStyle = '#166534';
  const frondCount = 7;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 + 0.2;
    const len = 34 * scale;
    const fx = 2 * scale + Math.cos(angle) * len;
    const fy = -58 * scale + Math.sin(angle) * len * 0.55;
    ctx.beginPath();
    ctx.moveTo(2 * scale, -58 * scale);
    ctx.quadraticCurveTo(
      2 * scale + Math.cos(angle) * len * 0.5,
      -58 * scale + Math.sin(angle) * len * 0.25,
      fx,
      fy,
    );
    ctx.lineWidth = 3 * scale;
    ctx.strokeStyle = '#15803d';
    ctx.stroke();
  }
  ctx.restore();
}

export function drawEucalyptus(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  height: number,
) {
  ctx.fillStyle = '#44403c';
  ctx.fillRect(x - 2, groundY - height * 0.35, 4, height * 0.35);

  const canopy = ctx.createRadialGradient(x, groundY - height * 0.55, 2, x, groundY - height * 0.55, height * 0.35);
  canopy.addColorStop(0, '#4d7c0f');
  canopy.addColorStop(0.6, '#3f6212');
  canopy.addColorStop(1, 'rgba(63, 98, 18, 0)');
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.ellipse(x, groundY - height * 0.55, height * 0.28, height * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawVegetationStrip(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  zoom: number,
) {
  const rnd = seededRandom(17);
  for (let wx = 0; wx < 9200; wx += 90) {
    const x = (wx - cameraX * 0.55) * zoom;
    if (x < -60 || x > width + 60) continue;
    if (rnd() > 0.55) {
      drawPalmTree(ctx, x, groundY - 4, 0.7 + rnd() * 0.5);
    } else {
      drawEucalyptus(ctx, x, groundY - 4, (40 + rnd() * 30) * zoom);
    }
  }
}
