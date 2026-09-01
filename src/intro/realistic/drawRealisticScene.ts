import { getCollapseProgress } from '../timeline';
import {
  GROUND_Y,
  WORLD_WIDTH,
  billboards,
  buildings,
} from '../worldData';
import type { IntroRenderState } from '../types';
import {
  drawGaragePlate,
  getFlyoverBlend,
  getGaragePlateImage,
  isGaragePlateActive,
  GARAGE_PLATE_DURATION,
} from '../videoPlate';
import { getAtmosphere } from './atmosphere';
import { drawRealisticBillboard, drawRealisticBuilding } from './buildings';
import { drawHighway } from './highway';
import { applyCinematicPostProcess } from './postProcess';
import { drawSky } from './sky';
import { drawGroundBase, drawMountains } from './terrain';
import { drawVegetationStrip } from './vegetation';

function drawEraOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, state: IntroRenderState) {
  if (isGaragePlateActive(state.time) && state.time <= GARAGE_PLATE_DURATION) return;
  if (!state.era) return;
  const localT = state.time - state.era.time;
  const fadeIn = Math.min(1, localT / 0.9);
  const fadeOut = Math.min(1, (state.era.duration - localT) / 0.9);
  const opacity = Math.min(fadeIn, fadeOut);
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = state.era.highlight ? '#7dd3fc' : '#f8fafc';
  ctx.font = `600 ${state.era.highlight ? 30 : 26}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillText(state.era.label, width / 2, height * 0.2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.font = '400 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(state.era.subtitle, width / 2, height * 0.2 + 30);
  ctx.restore();
}

function drawProgressBar(ctx: CanvasRenderingContext2D, width: number, progress: number) {
  const barWidth = Math.min(300, width * 0.38);
  const x = (width - barWidth) / 2;
  const y = 26;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.fillRect(x - 1, y - 1, barWidth + 2, 8);
  const fill = ctx.createLinearGradient(x, y, x + barWidth, y);
  fill.addColorStop(0, '#38bdf8');
  fill.addColorStop(1, '#818cf8');
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, barWidth * progress, 6);
}

function drawVineDumpster(ctx: CanvasRenderingContext2D, cameraX: number, groundY: number, zoom: number) {
  const vineX = 2680;
  const collapse = getCollapseProgress(vineX, cameraX, false);
  if (collapse > 0) return;
  const x = (vineX - cameraX) * zoom;
  if (x < -80 || x > ctx.canvas.width + 80) return;

  ctx.fillStyle = '#374151';
  ctx.fillRect(x, groundY - 22 * zoom, 36 * zoom, 22 * zoom);
  ctx.fillStyle = '#166534';
  ctx.font = `bold ${11 * zoom}px system-ui`;
  ctx.fillText('VINE', x + 4 * zoom, groundY - 8 * zoom);
}

function drawFlyoverScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: IntroRenderState,
  alpha: number,
) {
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  const groundY = height * GROUND_Y;
  const cameraX = state.camera.x;
  const zoom = state.camera.zoom;
  const atmosphere = getAtmosphere(state.progress, width, height);

  drawSky(ctx, width, height, atmosphere, state.time, cameraX);
  drawMountains(ctx, width, groundY, cameraX, atmosphere);
  drawVegetationStrip(ctx, width, groundY - 8, cameraX, zoom);

  for (const building of buildings) {
    drawRealisticBuilding(ctx, building, cameraX, groundY, zoom, atmosphere.streetLightIntensity);
  }

  drawVineDumpster(ctx, cameraX, groundY, zoom);

  for (const board of billboards) {
    drawRealisticBillboard(ctx, board, cameraX, groundY, zoom);
  }

  drawGroundBase(ctx, width, groundY);
  drawHighway(ctx, width, groundY, cameraX, zoom, atmosphere.streetLightIntensity);
  applyCinematicPostProcess(ctx, width, height, state.progress, state.time);

  ctx.restore();
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

  const plate = getGaragePlateImage();
  const flyoverAlpha = getFlyoverBlend(state.time);

  if (flyoverAlpha > 0) {
    drawFlyoverScene(ctx, width, height, state, flyoverAlpha);
  } else {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
  }

  if (plate && isGaragePlateActive(state.time)) {
    drawGaragePlate(ctx, width, height, state.time, plate, state.era);
  }

  if (showHud) {
    drawEraOverlay(ctx, width, height, state);
    drawProgressBar(ctx, width, state.progress);
  }
}

export function getWorldWidth() {
  return WORLD_WIDTH;
}
