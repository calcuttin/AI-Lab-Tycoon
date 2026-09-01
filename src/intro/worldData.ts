import type { EraBeat, WorldBillboard, WorldBuilding, WorldTree } from './types';

export const INTRO_DURATION = 72;
export const WORLD_WIDTH = 9200;
export const GROUND_Y = 0.72;

export const cameraKeyframes = [
  { time: 0, x: 0, zoom: 1 },
  { time: 6, x: 320, zoom: 1 },
  { time: 14, x: 780, zoom: 1 },
  { time: 22, x: 1380, zoom: 1.02 },
  { time: 30, x: 2100, zoom: 1.04 },
  { time: 38, x: 2900, zoom: 1.05 },
  { time: 46, x: 3900, zoom: 1.06 },
  { time: 54, x: 5200, zoom: 1.08 },
  { time: 62, x: 6600, zoom: 1.12 },
  { time: 68, x: 7600, zoom: 1.22 },
  { time: INTRO_DURATION, x: 8050, zoom: 1.48 },
];

export const eraBeats: EraBeat[] = [
  { time: 1, duration: 5.5, label: 'SILICON VALLEY, 1960s', subtitle: 'WHERE IT ALL BEGAN' },
  { time: 10, duration: 5.5, label: 'THE GARAGE ERA', subtitle: 'A DREAM AND A SOLDERING IRON' },
  { time: 18, duration: 5.5, label: 'THE ENTERPRISE ERA', subtitle: 'DATABASES AND DATACENTERS' },
  { time: 28, duration: 6, label: 'THE DOT-COM BOOM', subtitle: '"THIS CHANGES EVERYTHING"' },
  { time: 38, duration: 6, label: 'THE SOCIAL ERA', subtitle: 'CONNECTING THE WORLD (AND SELLING ADS)' },
  { time: 48, duration: 6, label: 'THE PLATFORM ERA', subtitle: "THERE'S AN APP FOR THAT" },
  { time: 58, duration: 6, label: 'THE AI BOOM', subtitle: 'WHAT COULD POSSIBLY GO WRONG?' },
  { time: 66, duration: 6, label: "AND THEN THERE'S YOU", subtitle: 'A LAPTOP AND A DREAM', highlight: true },
];

export const buildings: WorldBuilding[] = [
  { id: 'barn', name: '', x: 120, width: 70, height: 42, color: '#92400e', accent: '#78350f' },
  { id: 'shed', name: '', x: 260, width: 52, height: 34, color: '#a16207', accent: '#854d0e' },
  { id: 'hp', name: 'HEWLETT\nPACKARD', x: 620, width: 88, height: 52, color: '#6b7280', accent: '#4b5563', rooftop: 'antenna' },
  { id: 'fairchild', name: 'FAIRCHILD', x: 780, width: 72, height: 64, color: '#475569', accent: '#334155' },
  { id: 'oracle', name: 'ORACLE', x: 1080, width: 68, height: 118, color: '#dc2626', accent: '#991b1b', rooftop: 'dish' },
  { id: 'sun', name: 'SUN\nMICRO', x: 1240, width: 62, height: 98, color: '#7c3aed', accent: '#5b21b6', rooftop: 'dish' },
  { id: 'cisco', name: 'CISCO', x: 1380, width: 58, height: 86, color: '#0891b2', accent: '#0e7490' },
  { id: 'intel', name: 'INTEL', x: 1510, width: 62, height: 102, color: '#2563eb', accent: '#1d4ed8', rooftop: 'antenna' },
  { id: 'yahoo', name: 'YAHOO', x: 1720, width: 72, height: 148, color: '#7c3aed', accent: '#6d28d9', rooftop: 'antenna' },
  { id: 'pets', name: 'PETS.COM', x: 1880, width: 58, height: 86, color: '#f97316', accent: '#ea580c', collapses: true },
  { id: 'webvan', name: 'WEBVAN', x: 1980, width: 54, height: 72, color: '#64748b', accent: '#475569', collapses: true },
  { id: 'google', name: 'GOOGLE', x: 2100, width: 78, height: 168, color: '#4285f4', accent: '#1d4ed8', rooftop: 'helipad' },
  { id: 'paypal', name: 'PAYPAL', x: 2260, width: 58, height: 92, color: '#2563eb', accent: '#1e40af' },
  { id: 'facebook', name: 'FACEBOOK', x: 2420, width: 86, height: 210, color: '#1877f2', accent: '#1d4ed8', rooftop: 'helipad' },
  { id: 'twitter', name: 'TWITTER', x: 2580, width: 56, height: 108, color: '#1da1f2', accent: '#0284c7' },
  { id: 'theranos', name: 'THERANOS', x: 2720, width: 64, height: 118, color: '#991b1b', accent: '#7f1d1d', collapses: true },
  { id: 'snap', name: 'SNAPCHAT', x: 2840, width: 54, height: 84, color: '#facc15', accent: '#ca8a04' },
  { id: 'uber', name: 'UBER', x: 3000, width: 62, height: 128, color: '#111827', accent: '#000000' },
  { id: 'airbnb', name: 'AIRBNB', x: 3160, width: 62, height: 112, color: '#ff5a5f', accent: '#e11d48' },
  { id: 'stripe', name: 'STRIPE', x: 3320, width: 58, height: 98, color: '#635bff', accent: '#4f46e5' },
  { id: 'hooli', name: 'HOOLI', x: 3480, width: 82, height: 188, color: '#ef4444', accent: '#b91c1c', rooftop: 'helipad' },
  { id: 'openai', name: 'OPENAI', x: 3680, width: 88, height: 228, color: '#10a37f', accent: '#047857', rooftop: 'server' },
  { id: 'nvidia', name: 'NVIDIA', x: 3880, width: 82, height: 218, color: '#76b900', accent: '#4d7c0f', rooftop: 'server' },
  { id: 'cortex', name: 'CORTEX', x: 4080, width: 78, height: 198, color: '#22c55e', accent: '#15803d', rooftop: 'server' },
  { id: 'nexus', name: 'NEXUS', x: 4280, width: 88, height: 238, color: '#3b82f6', accent: '#1d4ed8', rooftop: 'server' },
  { id: 'anthropic', name: 'ANTHROPIC', x: 5200, width: 84, height: 220, color: '#d97706', accent: '#b45309', rooftop: 'server' },
  { id: 'meta', name: 'META AI', x: 5840, width: 90, height: 205, color: '#2563eb', accent: '#1d4ed8', rooftop: 'helipad' },
  { id: 'xai', name: 'xAI', x: 6480, width: 72, height: 198, color: '#f8fafc', accent: '#94a3b8', rooftop: 'server' },
  { id: 'deepmind', name: 'DEEPMIND', x: 7120, width: 86, height: 214, color: '#38bdf8', accent: '#0284c7', rooftop: 'server' },
  { id: 'player', name: 'YOU', x: 7980, width: 96, height: 72, color: '#0ea5e9', accent: '#0284c7', isPlayer: true },
];

export const billboards: WorldBillboard[] = [
  { text: 'MOVE FAST AND\nBREAK THINGS', x: 940, color: '#f59e0b', width: 92, height: 54 },
  { text: 'MAKING THE WORLD\nA BETTER PLACE', x: 1620, color: '#22c55e', width: 96, height: 54 },
  { text: 'PIVOT!', x: 2060, color: '#ef4444', width: 64, height: 42 },
  { text: 'SERIES F:\n$10B (PRE-REVENUE)', x: 2920, color: '#a855f7', width: 98, height: 54 },
  { text: 'WE USE AI', x: 3560, color: '#0ea5e9', width: 72, height: 42 },
  { text: 'AGI?', x: 4520, color: '#f43f5e', width: 58, height: 42 },
  { text: 'NOT A\nCRYPTO SCAM', x: 5120, color: '#f97316', width: 86, height: 48 },
];

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function generateTrees(): WorldTree[] {
  const rng = seededRandom(42);
  const trees: WorldTree[] = [];
  let x = 40;
  while (x < WORLD_WIDTH) {
    trees.push({
      x,
      height: 18 + Math.floor(rng() * 26),
      type: rng() > 0.45 ? 'pine' : 'round',
    });
    x += 28 + Math.floor(rng() * 36);
  }
  return trees;
}

export function generateHills() {
  const rng = seededRandom(7);
  return Array.from({ length: 18 }).map((_, index) => ({
    x: index * 520 + rng() * 80,
    width: 240 + rng() * 180,
    height: 70 + rng() * 90,
  }));
}

export function generateStars(count = 120) {
  const rng = seededRandom(99);
  return Array.from({ length: count }).map(() => ({
    x: rng(),
    y: rng() * 0.42,
    size: rng() > 0.7 ? 2.2 : 1.4,
    twinkle: 0.4 + rng() * 0.6,
    phase: rng() * Math.PI * 2,
  }));
}
