class IntroAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private started = false;

  private getContext() {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 900;
        this.filter.Q.value = 0.7;
        this.master.gain.value = 0.2;
        this.filter.connect(this.master);
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  start(muted = false) {
    if (this.started || muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.master || !this.filter) return;

    this.stop(false);
    this.started = true;

    const now = ctx.currentTime;
    this.filter.frequency.setValueAtTime(600, now);
    this.filter.frequency.exponentialRampToValueAtTime(2800, now + 18);
    this.filter.frequency.exponentialRampToValueAtTime(1200, now + 55);

    const padNotes = [55, 82.41, 110, 138.59, 164.81];
    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.035;
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();
      this.oscillators.push(osc);
    }

    const warmth = ctx.createOscillator();
    const warmthGain = ctx.createGain();
    warmth.type = 'triangle';
    warmth.frequency.value = 55;
    warmthGain.gain.value = 0.025;
    warmth.connect(warmthGain);
    warmthGain.connect(this.filter);
    warmth.start();
    this.oscillators.push(warmth);

    const lead = ctx.createOscillator();
    const leadGain = ctx.createGain();
    lead.type = 'sine';
    lead.frequency.value = 220;
    leadGain.gain.value = 0.018;
    lead.connect(leadGain);
    leadGain.connect(this.filter);
    lead.start();
    this.oscillators.push(lead);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain);
    lfoGain.connect(lead.frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  fadeOut(durationMs = 1400) {
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.001, now + durationMs / 1000);
    window.setTimeout(() => this.stop(), durationMs + 50);
  }

  stop(resetStarted = true) {
    for (const osc of this.oscillators) {
      try {
        osc.stop();
      } catch {
        // oscillator may already be stopped
      }
    }
    this.oscillators = [];
    if (resetStarted) this.started = false;
  }
}

let instance: IntroAudio | null = null;

export function getIntroAudio() {
  if (!instance) instance = new IntroAudio();
  return instance;
}
