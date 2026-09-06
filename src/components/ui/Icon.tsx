import type { CSSProperties } from "react";

const paths = {
  office: "M3 21V5l9-3 9 3v16M8 21v-5h8v5M7 7h2m6 0h2M7 11h2m6 0h2M2 21h20",
  projects: "M3 7h7l2-3h9v16H3zM3 10h18",
  research: "M9 3h6m-5 0v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M8 15h8",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8m6 9v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  chart: "M3 3v18h18M7 15l4-5 4 3 6-8",
  flag: "M4 22V3m0 1c5-5 11 5 16 0v10c-5 5-11-5-16 0",
  learn: "m2 9 10-6 10 6-10 6zM6 12v6c4 3 8 3 12 0v-6m4-3v8",
  settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6",
  contract: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h5",
  trophy:
    "M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 14v7m-4 0h8",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  play: "m8 4 12 8-12 8z",
  pause: "M8 4v16M16 4v16",
  save: "M5 3h12l4 4v14H3V3h2m2 0v6h10V3M7 21v-8h10v8",
  volume: "m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  muted: "m11 4-6 5H2v6h3l6 5zM16 9l6 6m-6 0 6-6",
  check: "m5 12 4 4L19 6",
  rotate: "M3 11a9 9 0 1 1 2 7M3 4v7h7",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11",
  zoom: "M11 7v8m-4-4h8m1 5 5 5M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  minus: "M5 12h14",
  coffee:
    "M3 7h13v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM16 8h2a3 3 0 0 1 0 6h-2M6 2v2m4-2v2m4-2v2",
  chip: "M6 6h12v12H6zM9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4",
  leaf: "M20 3C8 1 1 8 5 16s16 4 15-13M4 21 15 10",
  box: "m3 6 9-4 9 4v12l-9 4-9-4zM3 6l9 5 9-5M12 11v11",
  more: "M5 12h.01M12 12h.01M19 12h.01",
} satisfies Record<string, string>;
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  size = 18,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
