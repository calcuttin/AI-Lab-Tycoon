import { FILM_DURATION } from './shots';

type Callbacks = {
  onComplete: () => void;
  onTick: (time: number) => void;
  onReady: () => void;
  onError: () => void;
  onPlayback: (playing: boolean) => void;
  onAutoplayBlocked: () => void;
};

/** The native media clock owns the edit, including seeks and background pauses. */
export class RenderedIntroPlayer {
  private desiredPlaying = false;
  private destroyed = false;
  private frame = 0;
  private lastTick = -1;
  private generation = 0;
  private listeners: [string, EventListener][] = [];

  private video: HTMLVideoElement;
  private callbacks: Callbacks;
  private pendingSeek: number | null = null;
  constructor(video: HTMLVideoElement, callbacks: Callbacks) {
    this.video = video;
    this.callbacks = callbacks;
    const listen = (event: string, fn: () => void) => {
      video.addEventListener(event, fn);
      this.listeners.push([event, fn]);
    };
    listen('loadeddata', callbacks.onReady);
    listen('loadedmetadata', () => { if (this.pendingSeek !== null) { const time = this.pendingSeek; this.pendingSeek = null; this.seek(time); } });
    listen('error', () => { this.pauseAt(); callbacks.onError(); });
    listen('ended', () => { this.pauseAt(); callbacks.onComplete(); });
    listen('timeupdate', () => callbacks.onTick(video.currentTime));
    listen('playing', () => callbacks.onPlayback(true));
    listen('waiting', () => callbacks.onPlayback(false));
    listen('pause', () => callbacks.onPlayback(false));
    document.addEventListener('visibilitychange', this.visibility);
    if (video.readyState >= 2) callbacks.onReady();
    this.tick();
  }
  private tick = () => {
    if (this.destroyed) return;
    if (!document.hidden && Math.abs(this.video.currentTime - this.lastTick) > 0.08) {
      this.lastTick = this.video.currentTime;
      this.callbacks.onTick(this.lastTick);
    }
    this.frame = this.desiredPlaying && !document.hidden ? requestAnimationFrame(this.tick) : 0;
  };
  private play() {
    const generation = ++this.generation;
    if (!this.frame) this.tick();
    void this.video.play().catch((error: unknown) => {
      if (this.destroyed || generation !== this.generation) return;
      if (error instanceof DOMException && error.name === 'AbortError') return;
      // Autoplay restrictions leave a usable Play button, never a blank screen.
      this.desiredPlaying = false;
      this.callbacks.onPlayback(false);
      this.callbacks.onAutoplayBlocked();
    });
  }
  private visibility = () => {
    if (document.hidden) {
      ++this.generation;
      this.video.pause();
    } else if (this.desiredPlaying) this.play();
  };
  start(time?: number) {
    if (time !== undefined) this.seek(time);
    this.desiredPlaying = true;
    if (!document.hidden) this.play();
  }
  private seek(time: number) {
    const limit = Number.isFinite(this.video.duration) ? this.video.duration : FILM_DURATION;
    const clamped = Math.min(Math.max(0, Number.isFinite(time) ? time : 0), Math.max(0, limit - 0.04));
    if (this.video.readyState === 0) { this.pendingSeek = clamped; return; }
    this.video.currentTime = clamped;
    this.callbacks.onTick(this.video.currentTime);
  }
  pauseAt(time?: number) {
    this.desiredPlaying = false;
    ++this.generation;
    this.video.pause();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (time !== undefined) this.seek(time);
  }
  skipToEnd() {
    this.pauseAt(FILM_DURATION);
    this.callbacks.onComplete();
  }
  destroy() {
    this.destroyed = true;
    this.pauseAt();
    cancelAnimationFrame(this.frame);
    document.removeEventListener('visibilitychange', this.visibility);
    this.listeners.forEach(([event, fn]) => this.video.removeEventListener(event, fn));

  }
}
