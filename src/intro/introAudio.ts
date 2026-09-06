// Original understated electronic cue: syncopated bass, plucked chords and soft
// percussion. Synthesized locally; no soundtrack samples or network requests.
class IntroAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | undefined;
  private fadeTimer: number | undefined;
  private nodes = new Set<OscillatorNode>();
  private step = 0;
  private nextTime = 0;
  private started = false;

  start(muted = false, offsetSeconds = 0) {
    if (muted || this.started) return;
    window.clearTimeout(this.fadeTimer);
    try {
      this.ctx ??= new AudioContext();
      if (this.ctx.state === "suspended")
        void this.ctx.resume().catch(() => {});
      this.master ??= this.ctx.createGain();
      this.master.disconnect();
      this.master.connect(this.ctx.destination);
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.6);
      this.started = true;
      this.step = Math.floor(offsetSeconds / (60 / 112 / 2));
      this.nextTime = this.ctx.currentTime + 0.05;
      this.schedule();
      this.timer = window.setInterval(() => this.schedule(), 80);
    } catch {
      this.stop();
    }
  }
  private note(
    frequency: number,
    at: number,
    length: number,
    volume: number,
    type: OscillatorType = "sine",
    slide?: number,
  ) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator(),
      gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    if (slide)
      osc.frequency.exponentialRampToValueAtTime(slide, at + length * 0.8);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain);
    gain.connect(this.master);
    this.nodes.add(osc);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      this.nodes.delete(osc);
    };
    osc.start(at);
    osc.stop(at + length + 0.03);
  }
  private schedule() {
    if (!this.ctx || !this.started || this.ctx.state !== "running") return;
    // Avoid scheduling a backlog when a background browser throttles timers.
    if (this.nextTime < this.ctx.currentTime - 0.3)
      this.nextTime = this.ctx.currentTime + 0.03;
    const eighth = 60 / 112 / 2;
    while (this.nextTime < this.ctx.currentTime + 0.22) {
      const beat = this.step % 16;
      const root = [55, 65.406, 49, 73.416][Math.floor(this.step / 16) % 4];
      if ([0, 3, 6, 8, 11, 14].includes(beat))
        this.note(
          root * (beat === 14 ? 2 : 1),
          this.nextTime,
          0.23,
          0.33,
          "triangle",
        );
      if (beat % 4 === 0) this.note(130, this.nextTime, 0.16, 0.48, "sine", 42);
      if (beat % 4 === 2) {
        this.note(185, this.nextTime, 0.075, 0.12, "triangle", 80);
        this.note(3300, this.nextTime, 0.045, 0.028, "square");
      }
      if (beat % 2 === 1)
        this.note(6700, this.nextTime, 0.025, 0.016, "square");
      if ([1, 7, 10, 15].includes(beat)) {
        for (const ratio of [4, 5, 6])
          this.note(root * ratio, this.nextTime, 0.5, 0.05, "sine");
      }
      this.nextTime += eighth;
      this.step++;
    }
  }
  fadeOut(durationMs = 900) {
    if (!this.master || !this.ctx) return;
    window.clearInterval(this.timer);
    window.clearTimeout(this.fadeTimer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.0001, now + durationMs / 1000);
    this.fadeTimer = window.setTimeout(() => this.stop(), durationMs + 30);
  }
  stop() {
    window.clearInterval(this.timer);
    window.clearTimeout(this.fadeTimer);
    for (const osc of this.nodes) {
      try {
        osc.stop();
      } catch {
        /* already ended */
      }
    }
    this.nodes.clear();
    this.started = false;
  }
}
let instance: IntroAudio | null = null;
export function getIntroAudio() {
  return (instance ??= new IntroAudio());
}
