import { INTRO_DURATION, cameraKeyframes, eraBeats } from './worldData';
import type { CameraKeyframe, CameraState, EraBeat, IntroRenderState } from './types';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function interpolateCamera(time: number, keyframes: CameraKeyframe[] = cameraKeyframes): CameraState {
  const clamped = Math.max(0, Math.min(time, INTRO_DURATION));
  const nextIndex = keyframes.findIndex((frame) => frame.time > clamped);
  if (nextIndex === -1) {
    const last = keyframes[keyframes.length - 1];
    return { x: last.x, zoom: last.zoom };
  }
  if (nextIndex === 0) {
    return { x: keyframes[0].x, zoom: keyframes[0].zoom };
  }

  const prev = keyframes[nextIndex - 1];
  const next = keyframes[nextIndex];
  const span = next.time - prev.time;
  const localT = span === 0 ? 1 : (clamped - prev.time) / span;
  const eased = easeInOutCubic(localT);

  return {
    x: prev.x + (next.x - prev.x) * eased,
    zoom: prev.zoom + (next.zoom - prev.zoom) * eased,
  };
}

export function getActiveEra(time: number, beats: EraBeat[] = eraBeats): EraBeat | null {
  for (const beat of beats) {
    if (time >= beat.time && time < beat.time + beat.duration) {
      return beat;
    }
  }
  return null;
}

export function getIntroRenderState(time: number): IntroRenderState {
  const clamped = Math.max(0, Math.min(time, INTRO_DURATION));
  return {
    time: clamped,
    progress: clamped / INTRO_DURATION,
    camera: interpolateCamera(clamped),
    era: getActiveEra(clamped),
  };
}

export function getCollapseProgress(buildingX: number, cameraX: number, collapses?: boolean): number {
  if (!collapses) return 0;
  const trigger = buildingX - 200;
  if (cameraX < trigger) return 0;
  return Math.min(1, (cameraX - trigger) / 260);
}
