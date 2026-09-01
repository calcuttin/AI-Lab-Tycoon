import { getCollapseProgress } from '../timeline';
import type { WorldBuilding, WorldBillboard } from '../types';
import { seededRandom } from './prng';

export function drawRealisticBuilding(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  cameraX: number,
  groundY: number,
  zoom: number,
  streetLightIntensity: number,
) {
  const collapse = getCollapseProgress(building.x, cameraX, building.collapses);
  const screenX = (building.x - cameraX) * zoom;
  const width = building.width * zoom;
  const height = building.height * zoom * (1 - collapse * 0.88);
  const x = screenX;
  const y = groundY - height;

  if (x + width < -160 || x > ctx.canvas.width + 160) return;

  ctx.save();
  if (collapse > 0) {
    ctx.translate(x + width / 2, groundY);
    ctx.rotate(collapse * 0.22);
    ctx.translate(-(x + width / 2), -groundY);
    ctx.globalAlpha = 1 - collapse * 0.35;
  }

  if (building.isPlayer) {
    drawPlayerLab(ctx, x, y, width, height);
    ctx.restore();
    return;
  }

  const style = height > 140 * zoom ? 'tower' : height > 70 * zoom ? 'midrise' : 'lowrise';
  if (style === 'tower') {
    drawGlassTower(ctx, building, x, y, width, height, streetLightIntensity);
  } else if (style === 'midrise') {
    drawMidrise(ctx, building, x, y, width, height, streetLightIntensity);
  } else {
    drawLowrise(ctx, building, x, y, width, height);
  }

  if (collapse > 0.35) {
    drawCollapseDust(ctx, x, groundY, width, collapse);
  }

  ctx.restore();
}

function drawGlassTower(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  x: number,
  y: number,
  width: number,
  height: number,
  nightIntensity: number,
) {
  const pedestalH = height * 0.08;
  ctx.fillStyle = '#57534e';
  ctx.fillRect(x, y + height - pedestalH, width, pedestalH);

  const facade = ctx.createLinearGradient(x, y, x + width, y);
  facade.addColorStop(0, shade(building.accent, -20));
  facade.addColorStop(0.15, building.color);
  facade.addColorStop(0.45, lighten(building.color, 25));
  facade.addColorStop(0.55, building.color);
  facade.addColorStop(0.85, shade(building.accent, -10));
  facade.addColorStop(1, shade(building.accent, -30));
  ctx.fillStyle = facade;
  ctx.fillRect(x, y, width, height - pedestalH);

  const reflection = ctx.createLinearGradient(x + width * 0.2, y, x + width * 0.35, y + height);
  reflection.addColorStop(0, 'rgba(255,255,255,0.22)');
  reflection.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  reflection.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = reflection;
  ctx.fillRect(x + width * 0.15, y, width * 0.22, height - pedestalH);

  const rows = Math.max(4, Math.floor((height - pedestalH) / 14));
  const cols = Math.max(3, Math.floor(width / 12));
  const rnd = seededRandom(building.id.charCodeAt(0) * 31);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const wx = x + 5 + col * (width / cols);
      const wy = y + 6 + row * ((height - pedestalH) / rows);
      const lit = rnd() > 0.35 + nightIntensity * 0.25;
      const warm = rnd() > 0.6;
      ctx.fillStyle = lit
        ? warm
          ? `rgba(254, 243, 199, ${0.55 + nightIntensity * 0.35})`
          : `rgba(186, 230, 253, ${0.45 + nightIntensity * 0.3})`
        : 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(wx, wy, Math.max(3, width / cols - 4), Math.max(4, (height - pedestalH) / rows - 5));
    }
  }

  drawCrownSign(ctx, building, x, y, width);
  drawRooftopDetail(ctx, building, x, y, width);
  drawBuildingShadow(ctx, x + width * 0.1, y + height, width * 0.8, 12);
}

function drawMidrise(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  x: number,
  y: number,
  width: number,
  height: number,
  nightIntensity: number,
) {
  const grad = ctx.createLinearGradient(x, y, x + width, y + height);
  grad.addColorStop(0, lighten(building.color, 15));
  grad.addColorStop(1, building.accent);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, width, height);

  const rnd = seededRandom(building.id.length * 13);
  const rows = Math.floor(height / 16);
  const cols = Math.floor(width / 14);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rnd() > 0.4) {
        ctx.fillStyle = `rgba(254, 249, 195, ${0.35 + nightIntensity * 0.4})`;
        ctx.fillRect(x + 4 + col * 14, y + 5 + row * 16, 8, 10);
      }
    }
  }
  drawCrownSign(ctx, building, x, y, width);
}

function drawLowrise(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = building.color;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = building.accent;
  ctx.fillRect(x, y + height * 0.75, width, height * 0.25);
  if (building.name) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `600 ${Math.max(8, width * 0.09)}px "Segoe UI", system-ui, sans-serif`;
    building.name.split('\n').forEach((line, i) => {
      ctx.fillText(line, x + 6, y + 14 + i * 12);
    });
  }
}

function drawPlayerLab(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, y + height * 0.7, width, height * 0.3);

  const walls = ctx.createLinearGradient(x, y, x, y + height);
  walls.addColorStop(0, '#e2e8f0');
  walls.addColorStop(1, '#94a3b8');
  ctx.fillStyle = walls;
  ctx.fillRect(x, y, width, height * 0.72);

  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.fillRect(x + width * 0.15, y + height * 0.25, width * 0.7, height * 0.35);

  ctx.fillStyle = '#0ea5e9';
  ctx.font = `700 ${Math.max(10, width * 0.11)}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillText('YOUR LAB', x + width * 0.12, y + height * 0.18);

  const glow = ctx.createRadialGradient(
    x + width / 2,
    y + height * 0.45,
    0,
    x + width / 2,
    y + height * 0.45,
    width * 0.8,
  );
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - width * 0.2, y, width * 1.4, height);
}

function drawCrownSign(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  x: number,
  y: number,
  width: number,
) {
  if (!building.name) return;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  const signH = 22;
  ctx.fillRect(x + 4, y + 6, width - 8, signH);
  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 ${Math.max(8, width * 0.08)}px "Segoe UI", system-ui, sans-serif`;
  building.name.split('\n').forEach((line, i) => {
    ctx.fillText(line, x + 8, y + 18 + i * 11);
  });
}

function drawRooftopDetail(ctx: CanvasRenderingContext2D, building: WorldBuilding, x: number, y: number, width: number) {
  if (!building.rooftop) return;
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.75)';
  ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
  if (building.rooftop === 'antenna') {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y - 22);
    ctx.stroke();
    ctx.fillRect(x + width / 2 - 2, y - 26, 4, 4);
  } else if (building.rooftop === 'helipad') {
    ctx.strokeRect(x + width / 2 - 14, y - 8, 28, 5);
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('H', x + width / 2 - 4, y - 1);
  } else if (building.rooftop === 'server') {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#22d3ee' : '#0f172a';
      ctx.fillRect(x + 10, y - 18 + i * 4, width - 20, 3);
    }
  }
}

function drawBuildingShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const shadow = ctx.createLinearGradient(x, y, x, y + height);
  shadow.addColorStop(0, 'rgba(0,0,0,0.25)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(x, y, width, height);
}

function drawCollapseDust(ctx: CanvasRenderingContext2D, x: number, groundY: number, width: number, collapse: number) {
  ctx.fillStyle = `rgba(148, 163, 184, ${0.4 + collapse * 0.4})`;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(x + (width / 8) * i, groundY - 4, 10 + collapse * 20, 4 + collapse * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawRealisticBillboard(
  ctx: CanvasRenderingContext2D,
  board: WorldBillboard,
  cameraX: number,
  groundY: number,
  zoom: number,
) {
  const x = (board.x - cameraX) * zoom;
  if (x < -160 || x > ctx.canvas.width + 160) return;
  const y = groundY - board.height - 100 * zoom;
  const w = board.width * zoom;
  const h = board.height * zoom;

  ctx.fillStyle = '#44403c';
  ctx.fillRect(x + w / 2 - 3, y + h, 6, 78 * zoom);

  const frame = ctx.createLinearGradient(x, y, x, y + h);
  frame.addColorStop(0, lighten(board.color, 20));
  frame.addColorStop(1, board.color);
  ctx.fillStyle = frame;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 ${Math.max(9, 10 * zoom)}px "Segoe UI", system-ui, sans-serif`;
  board.text.split('\n').forEach((line, index) => {
    ctx.fillText(line, x + 10, y + 18 + index * 14);
  });
}

function lighten(hex: string, amount: number): string {
  return shade(hex, amount);
}

function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}
