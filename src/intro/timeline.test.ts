import { describe, expect, it } from 'vitest';
import { INTRO_DURATION, cameraKeyframes } from './worldData';
import { getActiveEra, getIntroRenderState, interpolateCamera } from './timeline';

describe('intro timeline', () => {
  it('interpolates camera position across keyframes', () => {
    const start = interpolateCamera(0);
    const mid = interpolateCamera(INTRO_DURATION / 2);
    const end = interpolateCamera(INTRO_DURATION);

    expect(start.x).toBe(cameraKeyframes[0].x);
    expect(mid.x).toBeGreaterThan(start.x);
    expect(end.x).toBe(cameraKeyframes[cameraKeyframes.length - 1].x);
    expect(end.zoom).toBeGreaterThan(start.zoom);
  });

  it('returns era beats for matching timestamps', () => {
    const era = getActiveEra(12);
    expect(era?.label).toContain('GARAGE');
  });

  it('builds render state with normalized progress', () => {
    const state = getIntroRenderState(INTRO_DURATION);
    expect(state.progress).toBe(1);
    expect(state.camera.zoom).toBeGreaterThan(1);
  });
});
