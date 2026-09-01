import { seededRandom } from './prng';

export function applyCinematicPostProcess(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  time: number,
) {
  const vignette = ctx.createRadialGradient(
    width / 2,
    height * 0.48,
    width * 0.15,
    width / 2,
    height * 0.48,
    width * 0.78,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, `rgba(0,0,0,${0.35 + progress * 0.2})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const rnd = seededRandom(Math.floor(time * 24));
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 800; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(rnd() * width, rnd() * height, 1, 1);
  }
  ctx.globalAlpha = 1;

  if (progress > 0.88) {
    const zoomGlow = ctx.createRadialGradient(
      width / 2,
      height * 0.55,
      0,
      width / 2,
      height * 0.55,
      width * 0.35,
    );
    zoomGlow.addColorStop(0, `rgba(56, 189, 248, ${(progress - 0.88) * 0.35})`);
    zoomGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = zoomGlow;
    ctx.fillRect(0, 0, width, height);
  }
}
