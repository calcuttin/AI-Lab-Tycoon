import { INTRO_DURATION } from './worldData';
import { drawIntroScene } from './drawScene';
import { getIntroRenderState } from './timeline';
import { loadGaragePlate } from './videoPlate';

export interface CanvasIntroEngineOptions {
  onComplete: () => void;
  onTick?: (elapsed: number) => void;
  showHud?: boolean;
}

export class CanvasIntroEngine {
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId = 0;
  private startTime = 0;
  private elapsed = 0;
  private playing = false;
  private width = 0;
  private height = 0;
  private readonly showHud: boolean;
  private readonly canvas: HTMLCanvasElement;
  private readonly options: CanvasIntroEngineOptions;

  constructor(canvas: HTMLCanvasElement, options: CanvasIntroEngineOptions) {
    this.canvas = canvas;
    this.options = options;
    this.showHud = options.showHud ?? true;
    this.ctx = canvas.getContext('2d');
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.render(this.elapsed);
  }

  start(fromTime = 0) {
    this.cancel();
    void loadGaragePlate().catch(() => {
      // Flyover still works if the plate asset fails to load.
    });
    this.elapsed = fromTime;
    this.startTime = performance.now() - fromTime * 1000;
    this.playing = true;
    this.resize();
    this.loop();
  }

  pauseAt(time: number) {
    this.cancel();
    this.elapsed = time;
    this.playing = false;
    this.render(time);
  }

  skipToEnd() {
    this.pauseAt(INTRO_DURATION);
    this.options.onComplete();
  }

  getElapsed() {
    return this.elapsed;
  }

  isPlaying() {
    return this.playing;
  }

  destroy() {
    this.cancel();
  }

  private cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.playing = false;
  }

  private loop = () => {
    if (!this.playing) return;
    this.elapsed = (performance.now() - this.startTime) / 1000;
    if (this.elapsed >= INTRO_DURATION) {
      this.elapsed = INTRO_DURATION;
      this.render(this.elapsed);
      this.playing = false;
      this.options.onComplete();
      return;
    }
    this.render(this.elapsed);
    this.options.onTick?.(this.elapsed);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private render(time: number) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;
    const state = getIntroRenderState(time);
    drawIntroScene(this.ctx, this.width, this.height, state, this.showHud);
  }
}
