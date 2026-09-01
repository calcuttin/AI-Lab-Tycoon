import type { EraBeat } from './types';

export const GARAGE_PLATE_PATH = '/intro/garage-era-plate.png';
export const GARAGE_PLATE_DURATION = 14;
export const GARAGE_PLATE_CROSSFADE = 2.5;

let plateImage: HTMLImageElement | null = null;
let loadPromise: Promise<HTMLImageElement> | null = null;

export function getGaragePlateImage() {
  return plateImage;
}

export function loadGaragePlate(): Promise<HTMLImageElement> {
  if (plateImage) return Promise.resolve(plateImage);
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        plateImage = image;
        resolve(image);
      };
      image.onerror = () => reject(new Error('Failed to load garage intro plate'));
      image.src = GARAGE_PLATE_PATH;
    });
  }
  return loadPromise;
}

export function isGaragePlateActive(time: number): boolean {
  return time < GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE;
}

export function getGaragePlateOpacity(time: number): number {
  if (time >= GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE) return 0;
  if (time <= GARAGE_PLATE_DURATION) return 1;
  const fade = (time - GARAGE_PLATE_DURATION) / GARAGE_PLATE_CROSSFADE;
  return 1 - easeInOutCubic(fade);
}

/** Flyover visibility while the garage plate crossfades out. */
export function getFlyoverBlend(time: number): number {
  const crossfadeStart = GARAGE_PLATE_DURATION - 1;
  const crossfadeEnd = GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE;
  if (time <= crossfadeStart) return 0;
  if (time >= crossfadeEnd) return 1;
  return easeInOutCubic((time - crossfadeStart) / (crossfadeEnd - crossfadeStart));
}

/** Ken Burns progress 0–1 across the plate segment. */
export function getPlateMotion(time: number) {
  const t = Math.min(1, Math.max(0, time / GARAGE_PLATE_DURATION));
  const eased = easeInOutCubic(t);
  return {
    scale: 1.06 + eased * 0.18,
    focusX: 0.32 + eased * 0.28,
    focusY: 0.42 + eased * 0.06,
    vignette: 0.35 + eased * 0.15,
  };
}

export function drawGaragePlate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  image: HTMLImageElement,
  era: EraBeat | null,
) {
  const opacity = getGaragePlateOpacity(time);
  if (opacity <= 0) return;

  const motion = getPlateMotion(time);
  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const imgAspect = image.width / image.height;
  const viewAspect = width / height;
  const baseScale = imgAspect > viewAspect ? height / image.height : width / image.width;
  const scale = baseScale * motion.scale;
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const offsetX = width * 0.5 - drawW * motion.focusX;
  const offsetY = height * 0.5 - drawH * motion.focusY;

  ctx.drawImage(image, offsetX, offsetY, drawW, drawH);

  const warmGlow = ctx.createRadialGradient(
    width * 0.55,
    height * 0.45,
    0,
    width * 0.55,
    height * 0.45,
    width * 0.65,
  );
  warmGlow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
  warmGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warmGlow;
  ctx.fillRect(0, 0, width, height);

  const letterbox = height * 0.06;
  const gradient = ctx.createLinearGradient(0, 0, 0, letterbox);
  gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, letterbox);
  ctx.fillStyle = gradient;
  ctx.translate(0, height);
  ctx.scale(1, -1);
  ctx.fillRect(0, 0, width, letterbox);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.1,
    width / 2,
    height / 2,
    width * motion.vignette,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  if (era && time < GARAGE_PLATE_DURATION) {
    drawPlateEraCaption(ctx, width, height, era, time);
  }

  ctx.restore();
}

function drawPlateEraCaption(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  era: EraBeat,
  time: number,
) {
  const localT = time - era.time;
  const fadeIn = Math.min(1, Math.max(0, localT / 1.2));
  const fadeOut = Math.min(1, Math.max(0, (era.duration - localT) / 1.2));
  const alpha = Math.min(fadeIn, fadeOut);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef3c7';
  ctx.font = '600 28px "Segoe UI", system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 16;
  ctx.fillText(era.label, width / 2, height * 0.82);
  ctx.font = '400 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
  ctx.fillText(era.subtitle, width / 2, height * 0.82 + 28);
  ctx.restore();
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
