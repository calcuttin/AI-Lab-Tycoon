export const FILM_DURATION = 36;
type Point = readonly [number, number, number];
export interface FilmShot {
  start: number;
  end: number;
  place: string;
  title: string;
  caption: string;
  from: Point;
  to: Point;
  lookFrom: Point;
  lookTo: Point;
  lens: number;
}

// An original fictional geography inspired by the peninsula, in meters.
export const filmShots: FilmShot[] = [
  {
    start: 0,
    end: 6,
    place: "01 / THE PENINSULA",
    title: "Welcome to the Valley.",
    caption: "Where every exit is an opportunity.",
    from: [138, 112, 155],
    to: [74, 74, 113],
    lookFrom: [0, 0, -15],
    lookTo: [3, 3, -18],
    lens: 42,
  },
  {
    start: 6,
    end: 12,
    place: "02 / THE CAMPUS",
    title: "Making the world a better place.",
    caption: "One proprietary ecosystem at a time.",
    from: [47, 27, 27],
    to: [-7, 20, 16],
    lookFrom: [17, 5, -25],
    lookTo: [20, 7, -29],
    lens: 47,
  },
  {
    start: 12,
    end: 18,
    place: "03 / THE NEXT BIG THING",
    title: "Infinite growth. Finite parking.",
    caption: "The valuation is mostly architectural.",
    from: [128, 46, 30],
    to: [61, 57, 30],
    lookFrom: [79, 15, -27],
    lookTo: [80, 19, -29],
    lens: 46,
  },
  {
    start: 18,
    end: 24,
    place: "04 / THE NEIGHBORHOOD",
    title: "Every empire starts somewhere.",
    caption: "Usually in a residential zoning violation.",
    from: [-99, 29, 43],
    to: [-70, 16, 28],
    lookFrom: [-52, 2, -8],
    lookTo: [-48, 2, -8],
    lens: 46,
  },
  {
    start: 24,
    end: 30,
    place: "05 / YOUR HEADQUARTERS",
    title: "Big ideas. Small runway.",
    caption: "A garage. A laptop. An unreasonable amount of confidence.",
    from: [-60, 9, 17],
    to: [-43, 5, 9],
    lookFrom: [-48, 2.4, -9],
    lookTo: [-48, 2.2, -9],
    lens: 43,
  },
  {
    start: 30,
    end: FILM_DURATION,
    place: "06 / THE FIRST COMMIT",
    title: "Make something worth the hype.",
    caption: "The world-changing part is still on the whiteboard.",
    from: [-48, 3.8, -2], to: [-48, 3.2, -5],
    lookFrom: [-48, 2, -9], lookTo: [-48, 2, -9], lens: 52,
  },
];

export function getFilmFrame(time: number) {
  const elapsed = Math.max(
    0,
    Math.min(FILM_DURATION, Number.isFinite(time) ? time : 0),
  );
  const index = filmShots.findIndex((shot) => elapsed < shot.end);
  const shotIndex = index < 0 ? filmShots.length - 1 : index;
  const shot = filmShots[shotIndex];
  const progress = (elapsed - shot.start) / (shot.end - shot.start);
  const eased = progress * progress * (3 - 2 * progress);
  const mix = (a: Point, b: Point): [number, number, number] =>
    a.map((v, i) => v + (b[i] - v) * eased) as [number, number, number];
  const local = elapsed - shot.start;
  const remaining = shot.end - elapsed;
  return {
    elapsed,
    shotIndex,
    shot,
    progress,
    position: mix(shot.from, shot.to),
    target: mix(shot.lookFrom, shot.lookTo),
    // Short dips between camera setups, with a clear first frame on the title menu.
    curtain:
      elapsed >= FILM_DURATION
        ? 0
        : Math.max(
            0,
            1 - local / 0.5,
            shotIndex < filmShots.length - 1 ? 1 - remaining / 0.35 : 0,
          ),
  };
}
