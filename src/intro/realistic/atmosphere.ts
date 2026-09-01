/** Time-of-day palette keyed to intro progress (0–1). */

export interface Atmosphere {
  skyTop: string;
  skyHorizon: string;
  skyBottom: string;
  sunX: number;
  sunY: number;
  sunRadius: number;
  sunCore: string;
  sunGlow: string;
  haze: string;
  hazeStrength: number;
  ambient: string;
  mountainFar: string;
  mountainMid: string;
  mountainNear: string;
  showStars: boolean;
  streetLightIntensity: number;
}

export function getAtmosphere(progress: number, width: number, height: number): Atmosphere {
  const horizonY = height * 0.58;

  if (progress < 0.12) {
    return {
      skyTop: '#0a1628',
      skyHorizon: '#1e3a5f',
      skyBottom: '#334155',
      sunX: width * 0.15,
      sunY: horizonY + 40,
      sunRadius: 0,
      sunCore: '#fef3c7',
      sunGlow: 'rgba(251, 191, 36, 0)',
      haze: 'rgba(148, 163, 184, 0.15)',
      hazeStrength: 0.35,
      ambient: '#94a3b8',
      mountainFar: '#1e293b',
      mountainMid: '#334155',
      mountainNear: '#475569',
      showStars: true,
      streetLightIntensity: 0.2,
    };
  }

  if (progress < 0.28) {
    const t = (progress - 0.12) / 0.16;
    return {
      skyTop: lerpColor('#0a1628', '#3b82f6', t),
      skyHorizon: lerpColor('#1e3a5f', '#fb923c', t),
      skyBottom: lerpColor('#334155', '#fdba74', t),
      sunX: width * (0.12 + t * 0.25),
      sunY: horizonY + 20 - t * 60,
      sunRadius: 18 + t * 28,
      sunCore: '#fff7ed',
      sunGlow: `rgba(251, 146, 60, ${0.25 + t * 0.35})`,
      haze: `rgba(253, 186, 116, ${0.12 + t * 0.2})`,
      hazeStrength: 0.25 + t * 0.15,
      ambient: '#fcd34d',
      mountainFar: '#475569',
      mountainMid: '#64748b',
      mountainNear: '#78716c',
      showStars: t < 0.4,
      streetLightIntensity: 0.15,
    };
  }

  if (progress < 0.62) {
    return {
      skyTop: '#2563eb',
      skyHorizon: '#7dd3fc',
      skyBottom: '#bae6fd',
      sunX: width * 0.72,
      sunY: horizonY - 80,
      sunRadius: 42,
      sunCore: '#fffbeb',
      sunGlow: 'rgba(254, 240, 138, 0.45)',
      haze: 'rgba(186, 230, 253, 0.18)',
      hazeStrength: 0.22,
      ambient: '#ffffff',
      mountainFar: '#64748b',
      mountainMid: '#78716c',
      mountainNear: '#57534e',
      showStars: false,
      streetLightIntensity: 0.05,
    };
  }

  if (progress < 0.82) {
    const t = (progress - 0.62) / 0.2;
    return {
      skyTop: lerpColor('#2563eb', '#7c3aed', t),
      skyHorizon: lerpColor('#7dd3fc', '#fb7185', t),
      skyBottom: lerpColor('#bae6fd', '#fda4af', t),
      sunX: width * (0.72 + t * 0.12),
      sunY: horizonY - 80 + t * 90,
      sunRadius: 42 - t * 10,
      sunCore: '#fff7ed',
      sunGlow: `rgba(251, 113, 133, ${0.35 + t * 0.2})`,
      haze: `rgba(251, 146, 60, ${0.2 + t * 0.15})`,
      hazeStrength: 0.28,
      ambient: '#fecdd3',
      mountainFar: '#57534e',
      mountainMid: '#44403c',
      mountainNear: '#292524',
      showStars: false,
      streetLightIntensity: 0.2 + t * 0.25,
    };
  }

  const t = (progress - 0.82) / 0.18;
  return {
    skyTop: lerpColor('#7c3aed', '#0f172a', t),
    skyHorizon: lerpColor('#fb7185', '#1e293b', t),
    skyBottom: lerpColor('#fda4af', '#334155', t),
    sunX: width * 0.9,
    sunY: horizonY + 30,
    sunRadius: Math.max(0, 20 - t * 20),
    sunCore: '#fef3c7',
    sunGlow: `rgba(251, 191, 36, ${0.15 * (1 - t)})`,
    haze: `rgba(15, 23, 42, ${0.1 + t * 0.25})`,
    hazeStrength: 0.35 + t * 0.2,
    ambient: '#cbd5e1',
    mountainFar: '#292524',
    mountainMid: '#1c1917',
    mountainNear: '#0f172a',
    showStars: t > 0.35,
    streetLightIntensity: 0.45 + t * 0.55,
  };
}

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
