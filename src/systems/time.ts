import { useGameStore } from '../store/gameStore';

export class TimeSystem {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private lastUpdate: number = 0;

  start() {
    const store = useGameStore.getState();
    if (store.isPaused) return;

    this.lastUpdate = Date.now();
    this.tick();
  }

  stop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private tick() {
    const store = useGameStore.getState();

    if (store.isPaused || store.gameSpeed === 0) {
      this.timerId = setTimeout(() => this.tick(), 100);
      return;
    }

    const now = Date.now();
    const delta = now - this.lastUpdate;

    // Base tick rate: 1 second per day at 1x speed
    const baseTickRate = 1000; // 1 second = 1 day
    const tickRate = baseTickRate / store.gameSpeed;

    if (delta >= tickRate) {
      store.advanceDay();
      this.lastUpdate = now;
    }

    this.timerId = setTimeout(() => this.tick(), 16); // ~60fps update loop
  }
  
  update() {
    // Restart with new settings
    this.stop();
    this.start();
  }
}

let timeSystemInstance: TimeSystem | null = null;

export const getTimeSystem = () => {
  if (!timeSystemInstance) {
    timeSystemInstance = new TimeSystem();
  }
  return timeSystemInstance;
};
