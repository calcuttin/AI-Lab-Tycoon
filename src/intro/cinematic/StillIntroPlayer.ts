import { FILM_DURATION } from "./shots";

type Callbacks = {
  onComplete: () => void;
  onTick: (time: number) => void;
  onReady: () => void;
  onError: () => void;
  onPlayback: (playing: boolean) => void;
};

/** A pausable presentation clock; hidden tabs never consume a chapter. */
export class StillIntroPlayer {
  private time = 0;
  private anchor = 0;
  private frame = 0;
  private wanted = false;
  private ready = false;
  private destroyed = false;
  private image: HTMLImageElement;
  private callbacks: Callbacks;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
    this.image = new Image();
    this.image.onload = () => {
      if (this.destroyed) return;
      this.ready = true;
      callbacks.onReady();
      if (this.wanted && !document.hidden) this.play();
    };
    this.image.onerror = () => {
      if (this.destroyed) return;
      this.pauseAt();
      callbacks.onError();
    };
    this.image.src = "/images/locations/peninsula-1600.jpg";
    document.addEventListener("visibilitychange", this.visibility);
  }

  private play() {
    if (this.destroyed || !this.ready || document.hidden || this.frame) return;
    this.anchor = performance.now();
    this.callbacks.onTick(this.time);
    this.callbacks.onPlayback(true);
    this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (now: number) => {
    this.frame = 0;
    if (this.destroyed || !this.wanted || document.hidden) return;
    this.time = Math.min(FILM_DURATION, this.time + Math.max(0, now - this.anchor) / 1000);
    this.anchor = now;
    this.callbacks.onTick(this.time);
    if (this.time >= FILM_DURATION) {
      this.wanted = false;
      this.callbacks.onPlayback(false);
      this.callbacks.onComplete();
    } else this.frame = requestAnimationFrame(this.tick);
  };
  private visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.callbacks.onPlayback(false);
    } else if (this.wanted) this.play();
  };
  start(time?: number) {
    if (this.destroyed) return;
    if (time !== undefined) {
      this.time = Math.min(FILM_DURATION, Math.max(0, Number.isFinite(time) ? time : 0));
      this.anchor = performance.now();
      this.callbacks.onTick(this.time);
    }
    this.wanted = true;
    this.play();
  }
  pauseAt(time?: number) {
    this.wanted = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (time !== undefined) {
      this.time = Math.min(FILM_DURATION, Math.max(0, Number.isFinite(time) ? time : 0));
      this.callbacks.onTick(this.time);
    }
    this.callbacks.onPlayback(false);
  }
  skipToEnd() {
    this.pauseAt(FILM_DURATION);
    this.callbacks.onComplete();
  }
  destroy() {
    this.destroyed = true;
    this.pauseAt();
    this.image.onload = null;
    this.image.onerror = null;
    document.removeEventListener("visibilitychange", this.visibility);
  }
}
