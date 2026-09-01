import { describe, expect, it } from 'vitest';
import {
  GARAGE_PLATE_CROSSFADE,
  GARAGE_PLATE_DURATION,
  getFlyoverBlend,
  getGaragePlateOpacity,
} from './videoPlate';

describe('videoPlate', () => {
  it('holds full opacity through the plate segment', () => {
    expect(getGaragePlateOpacity(0)).toBe(1);
    expect(getGaragePlateOpacity(GARAGE_PLATE_DURATION)).toBe(1);
  });

  it('fades out during the crossfade window', () => {
    const midFade = GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE / 2;
    expect(getGaragePlateOpacity(midFade)).toBeGreaterThan(0);
    expect(getGaragePlateOpacity(midFade)).toBeLessThan(1);
    expect(getGaragePlateOpacity(GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE)).toBe(0);
  });

  it('ramps flyover in as the plate fades', () => {
    expect(getFlyoverBlend(0)).toBe(0);
    expect(getFlyoverBlend(GARAGE_PLATE_DURATION)).toBeGreaterThan(0);
    expect(getFlyoverBlend(GARAGE_PLATE_DURATION + GARAGE_PLATE_CROSSFADE)).toBe(1);
  });
});
