// Audio system using Web Audio API
// Generates sounds procedurally - no external audio files needed

type SoundType = 'click' | 'success' | 'warning' | 'error' | 'cash' | 'research' | 'levelup' | 'notification';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterVolume = 0.3;
  private sfxVolume = 0.5;
  private muted = false;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.3) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  play(sound: SoundType) {
    if (this.muted) return;

    switch (sound) {
      case 'click':
        this.playTone(800, 0.05, 'square', 0.15);
        break;
      case 'success':
        this.playTone(523, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(659, 0.1, 'square', 0.2), 80);
        setTimeout(() => this.playTone(784, 0.15, 'square', 0.2), 160);
        break;
      case 'warning':
        this.playTone(330, 0.15, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(262, 0.2, 'sawtooth', 0.15), 150);
        break;
      case 'error':
        this.playTone(200, 0.15, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(150, 0.25, 'sawtooth', 0.2), 100);
        break;
      case 'cash':
        this.playTone(1047, 0.06, 'square', 0.15);
        setTimeout(() => this.playTone(1319, 0.08, 'square', 0.15), 50);
        break;
      case 'research':
        this.playTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(554, 0.1, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 200);
        setTimeout(() => this.playTone(880, 0.2, 'sine', 0.25), 300);
        break;
      case 'levelup':
        this.playTone(523, 0.08, 'square', 0.25);
        setTimeout(() => this.playTone(659, 0.08, 'square', 0.25), 80);
        setTimeout(() => this.playTone(784, 0.08, 'square', 0.25), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'square', 0.3), 240);
        break;
      case 'notification':
        this.playTone(880, 0.08, 'sine', 0.15);
        setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.12), 80);
        break;
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }
}

let instance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!instance) {
    instance = new AudioManager();
  }
  return instance;
}

// Helper to play a sound from anywhere
export function playSound(sound: SoundType) {
  getAudioManager().play(sound);
}
