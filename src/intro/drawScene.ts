import { getCollapseProgress } from './timeline';
import {
  GROUND_Y,
  WORLD_WIDTH,
  billboards,
  buildings,
  generateHills,
  generateStars,
  generateTrees,
} from './worldData';
import type { IntroRenderState, WorldBuilding } from './types';

const hills = generateHills();
const trees = generateTrees();
const stars = generateStars();

function skyGradient(progress: number): [string, string, string] {
  if (progress < 0.25) return ['#020617', '#111827', '#1e293b'];
  if (progress < 0.55) return ['#0c1631', '#1e3a5f', '#334155'];
  if (progress < 0.8) return ['#1a103d', '#2d1b69', '#4a1d96'];
  return ['#1f1147', '#312e81', '#5b21b6'];
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, time: number) {
  const [top, mid, bottom] = skyGradient(progress);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.55, mid);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    const twinkle = 0.45 + Math.sin(time * 2 + star.phase) * 0.25 * star.twinkle;
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
  }
}

function drawHills(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number, parallax: number) {
  const ground = height * GROUND_Y;
  for (const hill of hills) {
    const screenX = hill.x - cameraX * parallax;
    if (screenX < -hill.width || screenX > width + hill.width) continue;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.ellipse(screenX + hill.width / 2, ground - hill.height * 0.35, hill.width / 2, hill.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, type: 'pine' | 'round') {
  ctx.fillStyle = '#14532d';
  if (type === 'pine') {
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x - height * 0.35, y);
    ctx.lineTo(x + height * 0.35, y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y - height * 0.45, height * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 3, y - height * 0.2, 6, height * 0.2);
  }
}

function drawRooftop(ctx: CanvasRenderingContext2D, building: WorldBuilding, x: number, y: number) {
  if (!building.rooftop) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  if (building.rooftop === 'antenna') {
    ctx.beginPath();
    ctx.moveTo(x + building.width / 2, y);
    ctx.lineTo(x + building.width / 2, y - 18);
    ctx.stroke();
    ctx.fillRect(x + building.width / 2 - 2, y - 20, 4, 4);
  } else if (building.rooftop === 'dish') {
    ctx.beginPath();
    ctx.arc(x + building.width / 2, y - 8, 10, Math.PI, 0);
    ctx.stroke();
  } else if (building.rooftop === 'helipad') {
    ctx.strokeStyle = '#f8fafc';
    ctx.strokeRect(x + building.width / 2 - 12, y - 10, 24, 4);
    ctx.font = 'bold 10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('H', x + building.width / 2 - 4, y - 2);
  } else if (building.rooftop === 'server') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#0f172a';
      ctx.fillRect(x + 8, y - 16 + i * 5, building.width - 16, 4);
    }
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: WorldBuilding,
  cameraX: number,
  groundY: number,
  zoom: number,
) {
  const collapse = getCollapseProgress(building.x, cameraX, building.collapses);
  const screenX = (building.x - cameraX) * zoom;
  const width = building.width * zoom;
  const height = building.height * zoom * (1 - collapse * 0.85);
  const x = screenX;
  const y = groundY - height;

  if (x + width < -120 || x > ctx.canvas.width + 120) return;

  ctx.save();
  if (collapse > 0) {
    ctx.translate(x + width / 2, groundY);
    ctx.rotate(collapse * 0.18);
    ctx.translate(-(x + width / 2), -groundY);
  }

  const gradient = ctx.createLinearGradient(x, y, x, groundY);
  gradient.addColorStop(0, building.color);
  gradient.addColorStop(1, building.accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  const rows = Math.max(2, Math.floor(height / 18));
  const cols = Math.max(2, Math.floor(width / 16));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lit = ((building.id.charCodeAt(0) + row * 7 + col * 11) % 5) !== 0;
      ctx.fillStyle = lit ? 'rgba(250, 204, 21, 0.85)' : 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(x + 6 + col * (width / cols), y + 6 + row * (height / rows), 5, 7);
    }
  }

  if (building.name) {
    ctx.fillStyle = building.isPlayer ? '#e0f2fe' : 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.max(9, 10 * zoom)}px "Segoe UI", system-ui, sans-serif`;
    const lines = building.name.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, x + 8, y + 16 + index * 14);
    });
  }

  if (building.isPlayer) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + width * 0.2, groundY - height * 0.35, width * 0.6, height * 0.22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + width * 0.28, groundY - height * 0.3, width * 0.44, height * 0.12);
  }

  drawRooftop(ctx, building, x, y);
  ctx.restore();

  if (collapse > 0.4) {
    ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + i * 12, groundY - 8, 8, 6);
    }
  }
}

function drawBillboards(ctx: CanvasRenderingContext2D, cameraX: number, groundY: number, zoom: number) {
  for (const board of billboards) {
    const x = (board.x - cameraX) * zoom;
    if (x < -140 || x > ctx.canvas.width + 140) continue;
    const y = groundY - board.height - 90 * zoom;

    ctx.fillStyle = '#334155';
    ctx.fillRect(x + board.width / 2 - 4, y + board.height, 8, 70 * zoom);
    ctx.fillStyle = board.color;
    ctx.fillRect(x, y, board.width, board.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeRect(x, y, board.width, board.height);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px "Segoe UI", system-ui, sans-serif';
    board.text.split('\n').forEach((line, index) => {
      ctx.fillText(line, x + 8, y + 18 + index * 13);
    });
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, width: number, groundY: number, cameraX: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, width, ctx.canvas.height - groundY);
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, groundY, width, 8);

  const dashSpacing = 42 * zoom;
  const offset = (-cameraX * zoom * 1.15) % dashSpacing;
  ctx.fillStyle = '#f8fafc';
  for (let x = offset; x < width; x += dashSpacing) {
    ctx.fillRect(x, groundY + 18, 20 * zoom, 4);
  }
}

function drawFlyingSprites(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const sprites = [
    { emoji: '🚁', y: height * 0.18, speed: 120, offset: 0 },
    { emoji: '✈️', y: height * 0.12, speed: 90, offset: 14 },
    { emoji: '📦', y: height * 0.24, speed: 150, offset: 28 },
  ];
  ctx.font = '24px system-ui';
  for (const sprite of sprites) {
    const x = ((time * sprite.speed + sprite.offset * 40) % (width + 80)) - 40;
    ctx.fillText(sprite.emoji, x, sprite.y);
  }
}

function drawEraOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, state: IntroRenderState) {
  if (!state.era) return;
  const localT = state.time - state.era.time;
  const fadeIn = Math.min(1, localT / 0.8);
  const fadeOut = Math.min(1, (state.era.duration - localT) / 0.8);
  const opacity = Math.min(fadeIn, fadeOut);
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.fillStyle = state.era.highlight ? '#38bdf8' : '#f8fafc';
  ctx.font = `700 ${state.era.highlight ? 28 : 24}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillText(state.era.label, width / 2, height * 0.22);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(state.era.subtitle, width / 2, height * 0.22 + 28);
  ctx.restore();
}

function drawProgressBar(ctx: CanvasRenderingContext2D, width: number, progress: number) {
  const barWidth = Math.min(280, width * 0.35);
  const x = (width - barWidth) / 2;
  const y = 24;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.fillRect(x, y, barWidth, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x, y, barWidth * progress, 6);
}

export function drawIntroScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: IntroRenderState,
  showHud: boolean,
) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const groundY = height * GROUND_Y;
  const cameraX = state.camera.x;
  const zoom = state.camera.zoom;

  drawSky(ctx, width, height, state.progress, state.time);
  drawHills(ctx, width, height, cameraX, 0.12);
  drawHills(ctx, width, height, cameraX, 0.28);

  for (const tree of trees) {
    const x = (tree.x - cameraX) * zoom * 0.55;
    if (x < -40 || x > width + 40) continue;
    drawTree(ctx, x, groundY - 6, tree.height * zoom, tree.type);
  }

  for (const building of buildings) {
    drawBuilding(ctx, building, cameraX, groundY, zoom);
  }

  drawBillboards(ctx, cameraX, groundY, zoom);
  drawRoad(ctx, width, groundY, cameraX, zoom);
  drawFlyingSprites(ctx, width, height, state.time);

  if (showHud) {
    drawEraOverlay(ctx, width, height, state);
    drawProgressBar(ctx, width, state.progress);
  }

  if (state.progress > 0.92) {
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }
}

export function getWorldWidth() {
  return WORLD_WIDTH;
}
