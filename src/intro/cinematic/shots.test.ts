import { describe, expect, it } from "vitest";
import { FILM_DURATION, filmShots, getFilmFrame } from "./shots";

describe("cinematic edit", () => {
  it("covers the full film with consecutive, nonempty shots", () => {
    expect(filmShots[0].start).toBe(0);
    filmShots.forEach((shot, i) => {
      expect(shot.end).toBeGreaterThan(shot.start);
      if (i) expect(shot.start).toBe(filmShots[i - 1].end);
      expect(getFilmFrame(shot.start).shot).toBe(shot);
    });
    expect(filmShots.at(-1)?.end).toBe(FILM_DURATION);
  });
  it("holds the final garage composition after the film and handles invalid seeks", () => {
    for (const time of [FILM_DURATION, FILM_DURATION + 100]) {
      const frame = getFilmFrame(time);
      expect(frame.position).toEqual(filmShots.at(-1)?.to);
      expect(frame.target).toEqual(filmShots.at(-1)?.lookTo);
      expect(frame.curtain).toBe(0);
    }
    expect(getFilmFrame(-20).elapsed).toBe(0);
    expect(getFilmFrame(NaN).elapsed).toBe(0);
  });
  it("keeps camera positions, transitions and progress finite throughout the edit", () => {
    for (let time = 0; time <= FILM_DURATION; time += 0.1) {
      const frame = getFilmFrame(time);
      expect([...frame.position, ...frame.target].every(Number.isFinite)).toBe(
        true,
      );
      expect(frame.curtain).toBeGreaterThanOrEqual(0);
      expect(frame.curtain).toBeLessThanOrEqual(1);
      expect(frame.progress).toBeGreaterThanOrEqual(0);
      expect(frame.progress).toBeLessThanOrEqual(1);
    }
  });
});
