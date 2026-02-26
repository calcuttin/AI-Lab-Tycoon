import { useState, useEffect, useMemo, useRef } from 'react';

interface TitleScreenProps {
  onStartGame: () => void;
}

/* ─── HBO Silicon Valley–style continuous panorama flyover ───
 * All scrolling is done via a single CSS animation per parallax layer
 * (GPU-composited, no React re-renders during the animation).
 */

interface PanoBuilding {
  name: string;
  height: number;
  width: number;
  color: string;
  x: number;
  collapses?: boolean;
  isPlayer?: boolean;
  rooftop?: 'antenna' | 'dish' | 'helipad' | 'crane' | 'server';
}

interface PanoBillboard {
  text: string;
  x: number;
  color: string;
  rotates?: boolean;
}

const PANORAMA_WIDTH = 4200;
const SCROLL_DURATION = 14; // seconds

const panoramaBuildings: PanoBuilding[] = [
  // Farmland / early era
  { name: '', height: 30, width: 45, color: '#92400e', x: 80, rooftop: 'antenna' },
  { name: '', height: 25, width: 35, color: '#a16207', x: 180 },
  // Garage era
  { name: 'HEWLETT\nPACKARD', height: 38, width: 65, color: '#6b7280', x: 480, rooftop: 'antenna' },
  { name: 'FAIRCHILD', height: 50, width: 55, color: '#475569', x: 620 },
  // Early tech
  { name: 'ORACLE', height: 95, width: 60, color: '#dc2626', x: 850, rooftop: 'dish' },
  { name: 'SUN\nMICRO', height: 80, width: 55, color: '#7c3aed', x: 1000, rooftop: 'dish' },
  { name: 'CISCO', height: 70, width: 50, color: '#0891b2', x: 1130 },
  { name: 'INTEL', height: 85, width: 55, color: '#2563eb', x: 1260, rooftop: 'antenna' },
  // Dot-com boom
  { name: 'YAHOO', height: 120, width: 65, color: '#7c3aed', x: 1440, rooftop: 'antenna' },
  { name: 'PETS.COM', height: 70, width: 50, color: '#f97316', x: 1580, collapses: true },
  { name: 'WEBVAN', height: 55, width: 45, color: '#64748b', x: 1680, collapses: true },
  { name: 'GOOGLE', height: 140, width: 70, color: '#4285f4', x: 1800, rooftop: 'helipad' },
  { name: 'PAYPAL', height: 75, width: 50, color: '#2563eb', x: 1950 },
  // Social era
  { name: 'FACEBOOK', height: 180, width: 80, color: '#1877f2', x: 2080, rooftop: 'helipad' },
  { name: 'TWITTER', height: 90, width: 50, color: '#1da1f2', x: 2230 },
  { name: 'THERANOS', height: 100, width: 55, color: '#991b1b', x: 2380, collapses: true },
  { name: 'SNAPCHAT', height: 70, width: 45, color: '#fffc00', x: 2480 },
  // Mobile / sharing era
  { name: 'UBER', height: 110, width: 55, color: '#000000', x: 2600 },
  { name: 'AIRBNB', height: 95, width: 55, color: '#ff5a5f', x: 2740 },
  { name: 'STRIPE', height: 85, width: 50, color: '#635bff', x: 2870 },
  { name: 'HOOLI', height: 160, width: 70, color: '#ef4444', x: 3000, rooftop: 'helipad' },
  // AI boom
  { name: 'OPENAI', height: 200, width: 75, color: '#10a37f', x: 3150, rooftop: 'server' },
  { name: 'NVIDIA', height: 190, width: 70, color: '#76b900', x: 3310, rooftop: 'server' },
  { name: 'CORTEX', height: 170, width: 65, color: '#22c55e', x: 3460, rooftop: 'server' },
  { name: 'NEXUS', height: 210, width: 75, color: '#3b82f6', x: 3600, rooftop: 'server' },
  // Player's lab
  { name: 'YOU', height: 55, width: 70, color: '#0ea5e9', x: 3850, isPlayer: true },
];

const panoramaBillboards: PanoBillboard[] = [
  { text: 'MOVE FAST AND\nBREAK THINGS', x: 700, color: '#f59e0b' },
  { text: 'MAKING THE WORLD\nA BETTER PLACE', x: 1350, color: '#22c55e' },
  { text: 'PIVOT!', x: 1750, color: '#ef4444', rotates: true },
  { text: 'SERIES F:\n$10B (PRE-REVENUE)', x: 2500, color: '#a855f7' },
  { text: 'WE USE AI', x: 3050, color: '#0ea5e9' },
  { text: 'AGI?', x: 3750, color: '#f43f5e' },
];

// Era labels positioned at specific x offsets
const eraLabels = [
  { x: 0, label: 'SILICON VALLEY, 1960s', sub: 'WHERE IT ALL BEGAN' },
  { x: 400, label: 'THE GARAGE ERA', sub: 'A DREAM AND A SOLDERING IRON' },
  { x: 800, label: 'THE ENTERPRISE ERA', sub: 'DATABASES AND DATACENTERS' },
  { x: 1400, label: 'THE DOT-COM BOOM', sub: '"THIS CHANGES EVERYTHING"' },
  { x: 2000, label: 'THE SOCIAL ERA', sub: 'CONNECTING THE WORLD (AND SELLING ADS)' },
  { x: 2550, label: 'THE PLATFORM ERA', sub: "THERE'S AN APP FOR THAT" },
  { x: 3100, label: 'THE AI BOOM', sub: 'WHAT COULD POSSIBLY GO WRONG?' },
  { x: 3700, label: 'AND THEN THERE\'S YOU', sub: 'A LAPTOP AND A DREAM', isPlayer: true },
];

// The total camera travel distance
const CAMERA_TRAVEL = PANORAMA_WIDTH - 800;

export default function TitleScreen({ onStartGame }: TitleScreenProps) {
  const [phase, setPhase] = useState<'opening' | 'title' | 'menu'>('opening');
  const [titleVisible, setTitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const openingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize star positions
  const starPositions = useMemo(() =>
    Array.from({ length: 80 }).map(() => ({
      size: Math.random() > 0.5 ? 3 : 2,
      left: 5 + Math.random() * 90,
      top: 5 + Math.random() * 35,
      opacity: 0.3 + Math.random() * 0.5,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    })),
  []);

  // Memoize window patterns per building (lit or dark)
  const windowPatterns = useMemo(() =>
    panoramaBuildings.map(b => {
      const rows = Math.floor(b.height / 16);
      const cols = b.width > 60 ? 4 : b.width > 45 ? 3 : 2;
      return Array.from({ length: rows * cols }).map(() => Math.random() > 0.25);
    }),
  []);

  // Memoize tree positions
  const trees = useMemo(() => {
    const result: { x: number; height: number; type: 'pine' | 'round' }[] = [];
    let x = 20;
    while (x < 800) {
      result.push({ x, height: 15 + Math.floor(Math.random() * 20), type: Math.random() > 0.5 ? 'pine' : 'round' });
      x += 30 + Math.floor(Math.random() * 40);
    }
    return result;
  }, []);

  // Memoize hill positions
  const hills = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      x: i * 350,
      height: 60 + Math.floor(Math.random() * 80),
      width: 250 + Math.floor(Math.random() * 200),
    })),
  []);

  // Memoize cloud positions
  const clouds = useMemo(() =>
    Array.from({ length: 8 }).map(() => ({
      x: Math.floor(Math.random() * 4000),
      y: 5 + Math.floor(Math.random() * 20),
      width: 60 + Math.floor(Math.random() * 80),
      opacity: 0.15 + Math.random() * 0.15,
    })),
  []);

  // Memoize billboard heights so they don't jitter
  const billboardHeights = useMemo(() =>
    panoramaBillboards.map(() => 45 + Math.floor(Math.random() * 20)),
  []);

  // Memoize rubble pieces
  const rubblePieces = useMemo(() =>
    Array.from({ length: 5 }).map(() => ({
      width: 6 + Math.floor(Math.random() * 6),
      height: 4 + Math.floor(Math.random() * 4),
      rotate: Math.floor(Math.random() * 30),
    })),
  []);

  // Opening phase timer — after SCROLL_DURATION, transition to title
  useEffect(() => {
    if (phase !== 'opening') return;
    openingTimerRef.current = setTimeout(() => {
      setPhase('title');
      setTitleVisible(true);
    }, SCROLL_DURATION * 1000);
    return () => {
      if (openingTimerRef.current) clearTimeout(openingTimerRef.current);
    };
  }, [phase]);

  // Title to menu
  useEffect(() => {
    if (phase === 'title') {
      const timer = setTimeout(() => {
        setPhase('menu');
        setButtonsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const skipToMenu = () => {
    if (openingTimerRef.current) clearTimeout(openingTimerRef.current);
    setPhase('menu');
    setTitleVisible(true);
    setButtonsVisible(true);
  };

  // Dynamic CSS keyframes for the panorama scroll (generated once)
  const panoramaCSS = useMemo(() => {
    const dur = SCROLL_DURATION;
    // Each layer scrolls by: travel * parallaxFactor
    // Using CSS animations on translateX — runs on GPU compositor
    return `
      @keyframes panLayer0 {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${CAMERA_TRAVEL * 0.1}px); }
      }
      @keyframes panLayer1 {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${CAMERA_TRAVEL * 0.3}px); }
      }
      @keyframes panLayer2 {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${CAMERA_TRAVEL * 0.5}px); }
      }
      @keyframes panLayer3 {
        0% { transform: translateX(0); }
        85% { transform: translateX(-${CAMERA_TRAVEL * 0.85}px) scale(1); }
        100% { transform: translateX(-${CAMERA_TRAVEL}px) scale(1.3); }
      }
      @keyframes panLayer4 {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${CAMERA_TRAVEL * 1.2}px); }
      }
      @keyframes panProgress {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes skyShift {
        0% { background: linear-gradient(180deg, #020617 0%, #111827 50%, #1e293b 100%); }
        30% { background: linear-gradient(180deg, #020617 0%, #111827 50%, #1e293b 100%); }
        60% { background: linear-gradient(180deg, #0c1631 0%, #1e3a5f 50%, #334155 100%); }
        100% { background: linear-gradient(180deg, #1a103d 0%, #2d1b69 50%, #4a1d96 100%); }
      }
      .pano-layer-0 { animation: panLayer0 ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; will-change: transform; }
      .pano-layer-1 { animation: panLayer1 ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; will-change: transform; }
      .pano-layer-2 { animation: panLayer2 ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; will-change: transform; }
      .pano-layer-3 { animation: panLayer3 ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; will-change: transform; transform-origin: 85% 80%; }
      .pano-layer-4 { animation: panLayer4 ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; will-change: transform; }
      .pano-sky { animation: skyShift ${dur}s ease forwards; }
      .pano-progress-bar { animation: panProgress ${dur}s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      /* Collapse buildings: triggered by scroll-timeline approximation via animation-delay */
      @keyframes buildingCollapse {
        0%, 60% { transform: scaleY(1) rotate(0deg); opacity: 1; }
        80% { transform: scaleY(0.3) rotate(6deg); opacity: 0.5; }
        100% { transform: scaleY(0.1) rotate(10deg); opacity: 0.2; }
      }
      /* Era label fade in/out */
      @keyframes eraFadeIn {
        0% { opacity: 0; transform: translateY(12px) scale(0.9); }
        8% { opacity: 1; transform: translateY(0) scale(1); }
        15% { opacity: 1; }
        20% { opacity: 0; transform: translateY(-8px); }
        100% { opacity: 0; }
      }
      @keyframes eraFadeInLast {
        0% { opacity: 0; transform: translateY(12px) scale(0.9); }
        30% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 1; }
      }
    `;
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, #020617 0%, #111827 50%, #1e293b 100%)',
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        overflow: 'hidden',
        cursor: phase !== 'menu' ? 'pointer' : 'default',
      }}
      className={phase === 'opening' ? 'pano-sky' : undefined}
      onClick={phase !== 'menu' ? skipToMenu : undefined}
    >
      {/* Inject panorama CSS */}
      <style>{panoramaCSS}</style>

      {/* ===== OPENING: CSS-ANIMATED PARALLAX PANORAMA ===== */}
      {phase === 'opening' && (
        <>
          {/* LAYER 0: Stars + clouds (0.1x) */}
          <div className="pano-layer-0" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {starPositions.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: star.size,
                  height: star.size,
                  background: 'white',
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  opacity: star.opacity,
                  animation: `twinkle ${star.duration}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
              />
            ))}
            {/* Clouds */}
            {clouds.map((cloud, i) => (
              <div
                key={`c${i}`}
                style={{
                  position: 'absolute',
                  left: cloud.x,
                  top: `${cloud.y}%`,
                  width: cloud.width,
                  height: cloud.width * 0.35,
                  background: 'radial-gradient(ellipse, rgba(148,163,184,0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  opacity: cloud.opacity,
                }}
              />
            ))}
          </div>

          {/* LAYER 1: Distant hills (0.3x) */}
          <div className="pano-layer-1" style={{ position: 'absolute', bottom: '30%', left: 0, width: PANORAMA_WIDTH, height: 200, zIndex: 3 }}>
            {hills.map((hill, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: hill.x,
                  width: hill.width,
                  height: hill.height,
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '50% 50% 0 0',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* LAYER 2: Trees (0.5x) */}
          <div className="pano-layer-2" style={{ position: 'absolute', bottom: '18%', left: 0, width: PANORAMA_WIDTH, height: 60, zIndex: 4 }}>
            {trees.map((tree, i) => (
              <div key={i} style={{ position: 'absolute', bottom: 0, left: tree.x }}>
                {tree.type === 'pine' ? (
                  <>
                    <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `${tree.height}px solid #166534`, position: 'absolute', bottom: 8, left: -3 }} />
                    <div style={{ width: 5, height: 8, background: '#78350f', position: 'absolute', bottom: 0, left: 3 }} />
                  </>
                ) : (
                  <>
                    <div style={{ width: tree.height * 0.8, height: tree.height * 0.7, background: '#15803d', borderRadius: '50%', position: 'absolute', bottom: 8, left: -4 }} />
                    <div style={{ width: 4, height: 10, background: '#78350f', position: 'absolute', bottom: 0, left: 4 }} />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* LAYER 3: Main buildings + billboards (1x, with zoom at end) */}
          <div className="pano-layer-3" style={{ position: 'absolute', bottom: '8%', left: 0, width: PANORAMA_WIDTH + 200, height: '60%', zIndex: 6 }}>
            {/* Buildings */}
            {panoramaBuildings.map((building, idx) => {
              const cols = building.width > 60 ? 4 : building.width > 45 ? 3 : 2;
              // Collapse delay: building collapses when camera reaches it
              // At 1x parallax, camera reaches building.x at time = (building.x / CAMERA_TRAVEL) * SCROLL_DURATION
              const collapseDelay = building.collapses
                ? (building.x / CAMERA_TRAVEL) * SCROLL_DURATION - 1
                : 0;

              return (
                <div
                  key={`${building.name}-${idx}`}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: building.x,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transformOrigin: 'bottom center',
                    ...(building.collapses ? {
                      animation: `buildingCollapse 2s ease-in ${collapseDelay}s forwards`,
                    } : {}),
                  }}
                >
                  {/* Rooftop decorations */}
                  {building.rooftop === 'antenna' && (
                    <div style={{ width: 4, height: 18, background: '#475569', borderRadius: 2, marginBottom: -2 }}>
                      <div style={{ width: 4, height: 4, background: '#ef4444', borderRadius: '50%', position: 'relative', top: -2, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                  )}
                  {building.rooftop === 'dish' && (
                    <div style={{ width: 18, height: 10, border: '3px solid #64748b', borderBottom: 'none', borderRadius: '50% 50% 0 0', marginBottom: -2 }} />
                  )}
                  {building.rooftop === 'helipad' && (
                    <div style={{ width: 22, height: 4, background: '#374151', border: '1px solid #64748b', borderRadius: 2, marginBottom: -1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 3, color: '#94a3b8' }}>H</span>
                    </div>
                  )}
                  {building.rooftop === 'crane' && (
                    <div style={{ width: 3, height: 25, background: '#f59e0b', marginBottom: -2, position: 'relative' }}>
                      <div style={{ width: 20, height: 3, background: '#f59e0b', position: 'absolute', top: 0, left: -8 }} />
                    </div>
                  )}
                  {building.rooftop === 'server' && (
                    <div style={{ width: building.width * 0.6, height: 8, background: '#1e293b', border: '2px solid #22c55e', borderRadius: 2, marginBottom: -1, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 1, left: 2, right: 2, display: 'flex', gap: 2 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#22c55e', animation: `serverBlink 0.5s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Building body */}
                  <div
                    style={{
                      width: building.width,
                      height: building.height,
                      background: `linear-gradient(180deg, ${building.color} 0%, ${building.color}bb 100%)`,
                      borderRadius: '4px 4px 0 0',
                      border: `3px solid ${building.color}`,
                      borderBottom: 'none',
                      boxShadow: `inset -${Math.floor(building.width / 6)}px 0 0 rgba(0,0,0,0.2), 4px 4px 0 rgba(0,0,0,0.3)${building.isPlayer ? `, 0 0 40px rgba(14, 165, 233, 0.6)` : ''}`,
                      position: 'relative',
                    }}
                  >
                    {/* Windows */}
                    <div style={{ position: 'absolute', top: 6, left: 5, right: 5, bottom: 6, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3, overflow: 'hidden' }}>
                      {windowPatterns[idx]?.map((isLit, wi) => (
                        <div
                          key={wi}
                          style={{
                            background: isLit ? '#fef08a' : '#1e293b',
                            height: 7,
                            borderRadius: 1,
                            boxShadow: isLit ? '0 0 4px #fef08a' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Building name sign */}
                  {building.name && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: building.isPlayer ? 9 : 6,
                        color: building.isPlayer ? '#0ea5e9' : building.color,
                        textShadow: building.isPlayer
                          ? '0 0 20px rgba(14,165,233,0.8)'
                          : `0 0 8px ${building.color}88`,
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        letterSpacing: 1,
                        animation: building.isPlayer ? 'svPulseGlow 1.5s ease-in-out infinite' : 'signFlicker 3s ease-in-out infinite',
                        animationDelay: `${idx * 0.2}s`,
                      }}
                    >
                      {building.name}
                    </div>
                  )}

                  {/* Rubble indicator for collapsing buildings */}
                  {building.collapses && (
                    <div style={{ position: 'absolute', bottom: -4, display: 'flex', gap: 2, opacity: 0, animation: `fadeIn 0.5s ease ${collapseDelay + 1.5}s forwards` }}>
                      {rubblePieces.map((piece, i) => (
                        <div key={i} style={{ width: piece.width, height: piece.height, background: '#64748b', borderRadius: 1, opacity: 0.6, transform: `rotate(${piece.rotate}deg)` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Billboards */}
            {panoramaBillboards.map((bb, i) => (
              <div
                key={`bb${i}`}
                style={{
                  position: 'absolute',
                  bottom: billboardHeights[i] + 40,
                  left: bb.x,
                  animation: bb.rotates ? 'billboardRotate 3s ease-in-out infinite' : undefined,
                }}
              >
                {/* Billboard post */}
                <div style={{ width: 6, height: 60, background: '#475569', margin: '0 auto', borderRadius: 2 }} />
                {/* Billboard sign */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    border: `3px solid ${bb.color}`,
                    borderRadius: 5,
                    whiteSpace: 'pre-line',
                    textAlign: 'center',
                    fontSize: 9,
                    color: bb.color,
                    textShadow: `0 0 10px ${bb.color}`,
                    lineHeight: 1.4,
                    boxShadow: `0 0 20px ${bb.color}44, inset 0 0 15px ${bb.color}22`,
                    position: 'relative',
                    bottom: 60,
                    minWidth: 100,
                    letterSpacing: 1,
                  }}
                >
                  {bb.text}
                </div>
              </div>
            ))}

            {/* VINE dumpster easter egg */}
            <div style={{ position: 'absolute', bottom: 0, left: 2320, fontSize: 5, textAlign: 'center' }}>
              <div style={{ width: 22, height: 14, background: '#374151', borderRadius: '2px 2px 0 0', border: '2px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 8 }}>🗑️</span>
              </div>
              <div style={{ color: '#00b488', fontSize: 4, marginTop: 1 }}>VINE</div>
            </div>
          </div>

          {/* LAYER 4: Road + vehicles (1.2x) */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8%', minHeight: 40, background: '#1f2937', borderTop: '3px solid #374151', zIndex: 8 }}>
            <div className="pano-layer-4" style={{ position: 'absolute', top: '50%', left: 0, width: PANORAMA_WIDTH * 1.5, transform: 'translateY(-50%)', height: 4 }}>
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * 50,
                    width: 28,
                    height: 3,
                    background: '#fef08a',
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
            {/* Sky flying items (fixed position, CSS animated independently) */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 9, pointerEvents: 'none' }}>
              {[
                { emoji: '🚁', y: 12, dur: 20 },
                { emoji: '✈️', y: 6, dur: 28 },
                { emoji: '📦', y: 18, dur: 16 },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: `${item.y}%`,
                    left: '-5%',
                    fontSize: 18,
                    animation: `flyAcross ${item.dur}s linear infinite`,
                    animationDelay: `${i * 3}s`,
                  }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Era labels — each fades in at the right time via animation-delay */}
          <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center', zIndex: 15, pointerEvents: 'none' }}>
            {eraLabels.map((era, i) => {
              const delay = (era.x / CAMERA_TRAVEL) * SCROLL_DURATION;
              const isLast = !!era.isPlayer;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    opacity: 0,
                    animation: `${isLast ? 'eraFadeInLast' : 'eraFadeIn'} ${isLast ? `${SCROLL_DURATION - delay}s` : `${SCROLL_DURATION * 0.18}s`} ease-out ${delay}s forwards`,
                  }}
                >
                  <div
                    style={{
                      fontSize: isLast ? 16 : 14,
                      color: isLast ? '#0ea5e9' : '#f1f5f9',
                      textShadow: isLast
                        ? '0 0 30px rgba(14,165,233,0.8), 4px 4px 0 #0f172a'
                        : '4px 4px 0 #0f172a, 0 0 20px rgba(255,255,255,0.2)',
                      letterSpacing: 4,
                    }}
                  >
                    {era.label}
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: '#94a3b8',
                      marginTop: 10,
                      textShadow: '2px 2px 0 #0f172a',
                      letterSpacing: 2,
                    }}
                  >
                    {era.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ position: 'absolute', bottom: 50, left: '10%', right: '10%', height: 4, background: '#1e293b', borderRadius: 2, zIndex: 15, overflow: 'hidden' }}>
            <div
              className="pano-progress-bar"
              style={{
                width: 0,
                height: '100%',
                background: 'linear-gradient(90deg, #0ea5e9, #22c55e)',
                borderRadius: 2,
                boxShadow: '0 0 8px #0ea5e9',
              }}
            />
          </div>

          {/* Skip hint */}
          <div
            className="absolute bottom-6 left-0 right-0 text-center"
            style={{ fontSize: 8, color: '#64748b', animation: 'pulse 2s ease-in-out infinite', zIndex: 15 }}
          >
            CLICK TO SKIP
          </div>
        </>
      )}

      {/* ===== TITLE / MENU PHASES ===== */}

      {/* Stars (shown after opening) */}
      {phase !== 'opening' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {starPositions.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: star.size,
                height: star.size,
                background: 'white',
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
                animation: `twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Cityscape for title/menu */}
      {phase !== 'opening' && (
        <div
          style={{
            position: 'absolute',
            bottom: 50, left: 0, right: 0,
            height: '45%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 12,
            padding: '0 30px',
            zIndex: 5,
          }}
        >
          {[
            { name: 'HOOLI', color: '#ef4444', height: 200, width: 65 },
            { name: 'CORTEX', color: '#22c55e', height: 160, width: 58 },
            { name: 'NEXUS', color: '#3b82f6', height: 240, width: 70 },
            { name: 'RAVIGA', color: '#8b5cf6', height: 130, width: 52 },
            { name: 'ETHOS', color: '#f59e0b', height: 180, width: 60 },
            { name: 'OMNI', color: '#ec4899', height: 220, width: 65 },
            { name: 'COLLECTIVE', color: '#06b6d4', height: 120, width: 55 },
            { name: 'YOU', color: '#0ea5e9', height: 90, width: 70 },
          ].map((building, index) => (
            <div
              key={building.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: `svRise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
              }}
            >
              <div
                style={{
                  width: building.width,
                  height: building.height,
                  background: `linear-gradient(180deg, ${building.color} 0%, ${building.color}99 100%)`,
                  borderRadius: '6px 6px 0 0',
                  border: `4px solid ${building.color}`,
                  borderBottom: 'none',
                  boxShadow: `inset -10px 0 0 rgba(0,0,0,0.25), 6px 6px 0 rgba(0,0,0,0.3)`,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                  {Array.from({ length: Math.floor(building.height / 22) * 3 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: Math.random() > 0.25 ? '#fef08a' : '#1e293b',
                        height: 10,
                        borderRadius: 2,
                        boxShadow: Math.random() > 0.25 ? '0 0 6px #fef08a' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 6, height: 15, background: '#475569', borderRadius: 2 }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 7, color: building.color, textShadow: `0 0 10px ${building.color}`, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {building.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Street */}
      {phase !== 'opening' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 50,
            background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
            borderTop: '4px solid #374151',
            zIndex: 6,
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: 40 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: 40, height: 4, background: '#fef08a', opacity: 0.6, animation: `roadMove 2s linear infinite`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      {(phase === 'title' || phase === 'menu') && (
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: 0, right: 0,
            textAlign: 'center',
            zIndex: 10,
            transition: 'all 0.8s ease-out',
            transform: titleVisible ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.8)',
            opacity: titleVisible ? 1 : 0,
          }}
        >
          <h1 style={{ fontSize: 48, color: '#0ea5e9', textShadow: '4px 4px 0 #0369a1, 8px 8px 0 #1e3a5f, 0 0 60px rgba(14, 165, 233, 0.7)', margin: 0, marginBottom: 10, letterSpacing: 4, animation: titleVisible ? 'titlePulse 3s ease-in-out infinite' : 'none' }}>
            AI LAB
          </h1>
          <h1 style={{ fontSize: 64, color: '#22c55e', textShadow: '4px 4px 0 #15803d, 8px 8px 0 #14532d, 0 0 60px rgba(34, 197, 94, 0.7)', margin: 0, letterSpacing: 4, animation: titleVisible ? 'titlePulse 3s ease-in-out infinite 0.3s' : 'none' }}>
            TYCOON
          </h1>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 20, textShadow: '2px 2px 0 #0f172a', animation: titleVisible ? 'fadeInUp 0.8s ease-out 0.5s both' : 'none' }}>
            Build Your AI Empire
          </p>
        </div>
      )}

      {/* Buttons */}
      {phase === 'menu' && (
        <div
          style={{
            position: 'absolute',
            bottom: 70, left: '50%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            zIndex: 20,
            transition: 'all 0.5s ease-out',
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(30px)',
          }}
        >
          <button
            onClick={onStartGame}
            style={{
              padding: '20px 52px', fontSize: 16, fontWeight: 'bold',
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff', border: '6px solid #15803d', borderRadius: 12,
              boxShadow: '6px 6px 0 #14532d, 0 0 40px rgba(34, 197, 94, 0.5)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '8px 8px 0 #14532d, 0 0 50px rgba(34, 197, 94, 0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '6px 6px 0 #14532d, 0 0 40px rgba(34, 197, 94, 0.5)'; }}
          >
            NEW GAME
          </button>
          <button
            onClick={() => { const saved = localStorage.getItem('aiLabTycoonSave'); if (saved) { onStartGame(); } else { alert('No saved game found!'); } }}
            style={{
              padding: '16px 40px', fontSize: 12, fontWeight: 'bold',
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              color: '#94a3b8', border: '5px solid #475569', borderRadius: 10,
              boxShadow: '5px 5px 0 #0f172a', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#64748b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#475569'; }}
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Version */}
      {phase === 'menu' && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#64748b', zIndex: 30 }}>
          v1.0 - A SATIRICAL AI ADVENTURE
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes titlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes roadMove {
          from { transform: translateX(-40px); }
          to { transform: translateX(40px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes svRise {
          0% { transform: scaleY(0) translateY(20px); opacity: 0; transform-origin: bottom; }
          60% { transform: scaleY(1.1) translateY(0); opacity: 1; }
          100% { transform: scaleY(1) translateY(0); opacity: 1; transform-origin: bottom; }
        }
        @keyframes svPulseGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 20px currentColor; }
        }
        @keyframes signFlicker {
          0%, 90%, 100% { opacity: 1; }
          92% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
        }
        @keyframes serverBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes billboardRotate {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        @keyframes flyAcross {
          0% { transform: translateX(0); }
          100% { transform: translateX(110vw); }
        }
      `}</style>
    </div>
  );
}
