import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SplashPageProps {
  onComplete: () => void;
}

// ============================================================================
// CONSTELLATION DATA
// The "center" node at y=48 sits at the bottom of the constellation — it IS
// the sun's avatar in the sky. Other nodes fan upward like branches growing
// from a star into the heavens.  SVG viewBox: 0 0 100 55.
// ============================================================================

// Labels & styles match FALLBACK_DATA from geminiService (main page)
const SPLASH_NODES = [
  // Core – Domain Knowledge
  { id: 'core',  x: 50, y: 48, color: '#f97316', glow: '#fb923c', icon: '☀️', label: 'Domain Knowledge', size: 'core' as const },
  // Ring 1 – infra + skill
  { id: 'r1a',   x: 28, y: 36, color: '#22d3ee', glow: '#67e8f9', icon: '🏗️', label: 'Automation', size: 'md' as const },
  { id: 'r1b',   x: 50, y: 32, color: '#f43f5e', glow: '#fb7185', icon: '⚡', label: 'Vibe Coding', size: 'md' as const },
  { id: 'r1c',   x: 72, y: 36, color: '#22d3ee', glow: '#67e8f9', icon: '🏗️', label: 'Version Control', size: 'md' as const },
  // Ring 2 – concepts
  { id: 'r2a',   x: 16, y: 22, color: '#a855f7', glow: '#c084fc', icon: '🧠', label: 'Cursor', size: 'sm' as const },
  { id: 'r2b',   x: 38, y: 18, color: '#a855f7', glow: '#c084fc', icon: '🧠', label: 'ChatGPT Codex', size: 'sm' as const },
  { id: 'r2c',   x: 62, y: 18, color: '#a855f7', glow: '#c084fc', icon: '🧠', label: 'Ollama', size: 'sm' as const },
  { id: 'r2d',   x: 84, y: 22, color: '#a855f7', glow: '#c084fc', icon: '🧠', label: 'Antigravity', size: 'sm' as const },
  // Ring 3 – tools
  { id: 'r3a',   x: 28, y: 7,  color: '#fbbf24', glow: '#fde68a', icon: '🛠️', label: 'Google Gemini', size: 'sm' as const },
  { id: 'r3b',   x: 50, y: 5,  color: '#fbbf24', glow: '#fde68a', icon: '🛠️', label: 'ChatGPT', size: 'sm' as const },
  { id: 'r3c',   x: 72, y: 7,  color: '#fbbf24', glow: '#fde68a', icon: '🛠️', label: 'Model Selection', size: 'sm' as const },
];

const SPLASH_LINKS = [
  [0,1],[0,2],[0,3],           // core → ring1
  [1,4],[1,5],[2,5],[2,6],[3,6],[3,7], // ring1 → ring2
  [4,8],[5,8],[5,9],[6,9],[6,10],[7,10], // ring2 → ring3
];

// ============================================================================
// SEEDED RANDOM & BACKGROUND STARS
// ============================================================================

function sr(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Stars placed in the upper 40% of the scene (= the dark/purple sky)
const BG_STARS = Array.from({ length: 160 }, (_, i) => ({
  x: sr(i * 3 + 1) * 100,
  y: sr(i * 3 + 2) * 38,       // 0–38% of scene
  r: 0.3 + sr(i * 3 + 3) * 1.8,
  brightness: 0.25 + sr(i * 7) * 0.75,
  speed: 1.5 + sr(i * 5) * 3.5,
  delay: sr(i * 11) * 5,
  hue: sr(i * 13) > 0.82 ? (sr(i * 17) > 0.5 ? '220' : '35') : '0',
}));

const SHOOTING_STARS = [
  { delay: 5.5, x1: 18, y1: 6,  x2: 35, y2: 16, dur: 0.7 },
  { delay: 7.2, x1: 80, y1: 4,  x2: 63, y2: 14, dur: 0.6 },
  { delay: 9.0, x1: 55, y1: 2,  x2: 40, y2: 12, dur: 0.8 },
];

// ============================================================================
// TIMING (ms) — Sun → Pan up → Stars → Nodes → Lattice → Exit
// ============================================================================

const T = {
  // Phase 1: Sun & title
  sunGlow:         0,       // sun immediate
  titleIn:         400,
  titleHold:       1200,
  subtitleIn:      1600,
  lineIn:          2200,
  // Phase 2: Pan up through sunset → purple → dark sky
  panStart:        3400,
  panEnd:          7000,
  // Phase 3: Nodes bloom (center/core first, radiates outward)
  nodeStart:       7200,
  nodeEnd:         9600,
  // Phase 4: Lattice
  latticeStart:    9600,
  latticeEnd:      12000,
  // Phase 5: Settle → exit
  exitStart:       12800,
  exitEnd:         13600,
};

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
function prog(elapsed: number, a: number, b: number): number {
  return clamp01((elapsed - a) / (b - a));
}
function baseR(s: 'core' | 'md' | 'sm'): number {
  return s === 'core' ? 4.5 : s === 'md' ? 2.8 : 2;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SplashPage: React.FC<SplashPageProps> = ({ onComplete }) => {
  const raf = useRef(0);
  const t0 = useRef(0);
  const done = useRef(false);

  const [s, setS] = useState({
    elapsed: 0,
    sunOp: 0,
    titleOp: 0,
    lineOp: 0,
    pan: 0,          // 0 = sun view, 1 = sky view
    nodeReveal: 0,
    latticeReveal: 0,
    exitOp: 0,
  });

  const tick = useCallback(() => {
    if (done.current) return;
    const el = Date.now() - t0.current;

    const sunOp = ease(prog(el, T.sunGlow, T.sunGlow + 800));
    const titleIn = ease(prog(el, T.titleIn, T.titleHold));
    const lineOp = ease(prog(el, T.lineIn, T.lineIn + 500));

    // Pan up
    const pan = ease(prog(el, T.panStart, T.panEnd));
    // Title fades during pan
    const titleFade = el > T.panStart ? ease(prog(el, T.panStart, T.panStart + 1400)) : 0;
    const titleOp = titleIn * (1 - titleFade);

    const nodeReveal = ease(prog(el, T.nodeStart, T.nodeEnd));
    const latticeReveal = ease(prog(el, T.latticeStart, T.latticeEnd));
    const exitOp = ease(prog(el, T.exitStart, T.exitEnd));

    setS({
      elapsed: el,
      sunOp,
      titleOp,
      lineOp: lineOp * (1 - titleFade),
      pan,
      nodeReveal,
      latticeReveal,
      exitOp,
    });

    if (el >= T.exitEnd) {
      done.current = true;
      onComplete();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [onComplete]);

  useEffect(() => {
    t0.current = Date.now();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  // ---- Node stagger: core (i=0) first, then by distance from core ----
  function nodeSt(i: number): number {
    const n = SPLASH_NODES[i];
    const dist = Math.sqrt((n.x - 50) ** 2 + (n.y - 48) ** 2);
    const delay = (dist / 55) * 0.55;
    return ease(clamp01((s.nodeReveal - delay) / (1 - delay)));
  }

  // ---- Link stagger: inner links first ----
  function linkSt(li: number): number {
    const [a, b] = SPLASH_LINKS[li];
    const nA = SPLASH_NODES[a], nB = SPLASH_NODES[b];
    const d = (Math.sqrt((nA.x-50)**2+(nA.y-48)**2) + Math.sqrt((nB.x-50)**2+(nB.y-48)**2)) / 2;
    const delay = (d / 55) * 0.5;
    return ease(clamp01((s.latticeReveal - delay) / (1 - delay)));
  }

  // ====================================================================
  // The scene is 300% tall. Camera pans from bottom to top.
  //   panY=0 → translateY(-66.67%) shows bottom third (sun area)
  //   panY=1 → translateY(0%)       shows top third (sky area)
  // ====================================================================
  const translateY = (1 - s.pan) * 66.67;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none" style={{ cursor: 'default' }}>

      {/* ---- Keyframes ---- */}
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.5}100%{transform:scale(3);opacity:0}}
        @keyframes sun-pulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.75;transform:scale(1.04)}}
        @keyframes ray-sway{0%,100%{opacity:.1;transform:rotate(-1deg)}50%{opacity:.18;transform:rotate(1deg)}}
        @keyframes drift{0%{transform:translateY(0)}100%{transform:translateY(-15px)}}
      `}</style>

      {/* ============================================================ */}
      {/* TALL SCENE (300% height, pans via translateY)                */}
      {/* ============================================================ */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: '300%',
          transform: `translateY(-${translateY}%)`,
          willChange: 'transform',
          transition: 'none',
        }}
      >
        {/* ---------- SKY GRADIENT ---------- */}
        {/* Top = dark space (#020617 matches main app bg-slate-950)
            Middle = rich purple
            Bottom = warm gold/orange (the sun zone) */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom,
            #020617 0%,
            #050a1a 3%,
            #0a0f2e 7%,
            #0f1340 12%,
            #14174d 17%,
            #1e1b5e 22%,
            #2d1f6b 27%,
            #3b2278 32%,
            #4c2882 37%,
            #5c2d7e 42%,
            #6d3070 47%,
            #7c3058 52%,
            #8b3040 57%,
            #9a3412 62%,
            #b45309 67%,
            #d97706 72%,
            #f59e0b 77%,
            #fbbf24 82%,
            #fcd34d 87%,
            #fde68a 92%,
            #fef9c3 97%,
            #fffef5 100%
          )`,
        }} />

        {/* ---------- THE SUN (bottom of scene) ---------- */}
        {/* This is "Your Domain" — the core. A massive, luminous solar disk. */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{
          bottom: '-2%',
          width: '110vw',
          height: '28%',
          opacity: s.sunOp,
        }}>
          {/* Outermost corona haze */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 50% 70% at 50% 100%, rgba(251,191,36,0.25), rgba(249,115,22,0.1), transparent 60%)',
            animation: 'sun-pulse 5s ease-in-out infinite',
          }} />
          {/* Mid corona */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 38% 55% at 50% 100%, rgba(253,224,71,0.55), rgba(251,191,36,0.35), rgba(249,115,22,0.15), transparent 55%)',
            animation: 'sun-pulse 3.5s ease-in-out infinite 0.5s',
          }} />
          {/* Inner disk — bright white-gold core */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 22% 38% at 50% 100%, rgba(255,255,248,0.98), rgba(254,243,199,0.95), rgba(251,191,36,0.8), rgba(249,115,22,0.4), transparent 48%)',
          }} />
          {/* Hot center line on horizon */}
          <div className="absolute left-[15%] right-[15%] h-[3px] rounded-full" style={{
            bottom: '0%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,240,0.9), transparent)',
            boxShadow: '0 0 40px 10px rgba(251,191,36,0.4)',
          }} />
        </div>

        {/* ---------- LIGHT RAYS from sun ---------- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 300" preserveAspectRatio="none"
          style={{ opacity: s.sunOp * 0.12 }}
        >
          {[15, 28, 38, 50, 62, 72, 85].map((x, i) => (
            <line key={i}
              x1="50" y1="300" x2={x} y2={180 - i * 3}
              stroke={i === 3 ? 'rgba(255,255,240,0.6)' : 'rgba(253,224,71,0.4)'}
              strokeWidth={i === 3 ? 0.8 : 0.4 + (i % 2) * 0.2}
              style={{ animation: `ray-sway ${3.5 + i * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>

        {/* ---------- Warm horizon glow band ---------- */}
        <div className="absolute left-0 right-0" style={{
          bottom: '0%',
          height: '22%',
          background: 'linear-gradient(to top, rgba(253,224,71,0.35), rgba(249,115,22,0.25), rgba(168,85,247,0.03), transparent)',
          opacity: s.sunOp,
        }} />

        {/* ---------- Purple atmospheric haze (middle zone) ---------- */}
        <div className="absolute left-0 right-0" style={{
          top: '35%',
          height: '18%',
          background: 'radial-gradient(ellipse 120% 100% at 50% 100%, rgba(99,80,180,0.12), rgba(59,34,120,0.06), transparent)',
          filter: 'blur(20px)',
        }} />

        {/* ---------- BACKGROUND STARS (top ~38% of scene) ---------- */}
        <svg
          className="absolute left-0 top-0 w-full pointer-events-none"
          style={{ height: '40%' }}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          {BG_STARS.map((star, i) => {
            // Stars fade in as camera approaches sky
            const starVis = clamp01((s.pan - 0.15) / 0.5);
            return (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.r * 0.13}
                fill={star.hue === '0'
                  ? `rgba(255,255,255,${star.brightness * starVis})`
                  : `hsla(${star.hue},80%,85%,${star.brightness * starVis})`
                }
                style={{
                  animation: `twinkle ${star.speed}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
              />
            );
          })}
        </svg>

        {/* ---------- SHOOTING STARS (appear once in sky) ---------- */}
        <svg className="absolute left-0 top-0 w-full pointer-events-none"
          style={{ height: '38%' }} viewBox="0 0 100 38" preserveAspectRatio="none"
        >
          {SHOOTING_STARS.map((ss, i) => {
            const show = s.elapsed > ss.delay * 1000 && s.elapsed < (ss.delay + ss.dur) * 1000 + 200;
            if (!show) return null;
            const t = clamp01((s.elapsed - ss.delay * 1000) / (ss.dur * 1000));
            const cx = ss.x1 + (ss.x2 - ss.x1) * t;
            const cy = ss.y1 + (ss.y2 - ss.y1) * t;
            const tx = ss.x1 + (ss.x2 - ss.x1) * Math.max(0, t - 0.25);
            const ty = ss.y1 + (ss.y2 - ss.y1) * Math.max(0, t - 0.25);
            return (
              <line key={i} x1={tx} y1={ty} x2={cx} y2={cy}
                stroke="rgba(255,255,255,0.9)" strokeWidth="0.2" strokeLinecap="round"
                opacity={t < 0.85 ? 0.9 : clamp01((1 - t) * 6.5)}
              />
            );
          })}
        </svg>

        {/* ---------- CONSTELLATION SVG (top 40% of scene) ---------- */}
        <svg
          className="absolute left-0 top-0 w-full pointer-events-none"
          style={{ height: '38%' }}
          viewBox="0 0 100 55"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Glow filter defs */}
          <defs>
            <filter id="g-or" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" />
            </filter>
            <filter id="g-ro" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
            <filter id="g-pu" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" />
            </filter>
            <filter id="g-am" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>

          {/* ---- Lattice links ---- */}
          {SPLASH_LINKS.map(([a, b], li) => {
            const nA = SPLASH_NODES[a], nB = SPLASH_NODES[b];
            const len = Math.sqrt((nB.x - nA.x) ** 2 + (nB.y - nA.y) ** 2);
            const dash = len * 2;
            const lt = linkSt(li);
            const off = (1 - lt) * dash;
            if (lt <= 0) return null;
            return (
              <g key={`lk-${li}`}>
                {/* Wide glow */}
                <line x1={nA.x} y1={nA.y} x2={nB.x} y2={nB.y}
                  stroke={nA.glow} strokeWidth="2.2" strokeLinecap="round"
                  opacity={0.15 * lt}
                  strokeDasharray={dash} strokeDashoffset={off}
                />
                {/* Mid gold */}
                <line x1={nA.x} y1={nA.y} x2={nB.x} y2={nB.y}
                  stroke="rgba(251,191,36,0.5)" strokeWidth="0.9" strokeLinecap="round"
                  strokeDasharray={dash} strokeDashoffset={off}
                />
                {/* Core bright */}
                <line x1={nA.x} y1={nA.y} x2={nB.x} y2={nB.y}
                  stroke="rgba(253,224,71,0.92)" strokeWidth="0.3" strokeLinecap="round"
                  strokeDasharray={dash} strokeDashoffset={off}
                />
              </g>
            );
          })}

          {/* ---- Nodes ---- */}
          {SPLASH_NODES.map((node, i) => {
            const nt = nodeSt(i);
            const isStar = nt < 0.05;
            const sz = baseR(node.size);
            const r = isStar ? 0.45 + Math.sin(s.elapsed / 300 + i) * 0.1 : sz * nt;
            const glR = sz * 2.2 * nt;

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                {/* Ambient glow */}
                <circle r={isStar ? 1 : glR} fill={node.glow}
                  opacity={isStar ? 0.05 : 0.15 * nt} />

                {/* Pulse on reveal */}
                {nt > 0.08 && nt < 0.85 && (
                  <circle r={sz * 1.3 * nt} fill="none" stroke={node.color}
                    strokeWidth="0.3" opacity={0.35 * (1 - nt)}
                    style={{ animation: 'pulse-ring 1.5s ease-out forwards' }}
                  />
                )}

                {/* Dark bg circle */}
                {!isStar && (
                  <circle r={r * 0.88} fill="#0a0f1f" opacity={0.92 * nt} />
                )}

                {/* Main body */}
                <circle
                  r={r}
                  fill={isStar
                    ? `rgba(255,255,255,${0.75 + Math.sin(s.elapsed / 250 + i * 2) * 0.25})`
                    : 'none'
                  }
                  stroke={isStar ? 'rgba(253,224,71,0.35)' : node.color}
                  strokeWidth={isStar ? 0.15 : 0.5 * nt}
                  style={{
                    filter: isStar
                      ? 'drop-shadow(0 0 1.5px rgba(253,224,71,0.5))'
                      : `drop-shadow(0 0 ${3 * nt}px ${node.glow})`,
                  }}
                />

                {/* Icon */}
                {!isStar && nt > 0.45 && (
                  <text y={sz * 0.35} textAnchor="middle" fontSize={sz * 0.85}
                    opacity={clamp01((nt - 0.45) * 1.8)}>
                    {node.icon}
                  </text>
                )}

                {/* Label */}
                {!isStar && nt > 0.65 && (
                  <text y={sz + 2.5} textAnchor="middle" fontSize="2.1" fontWeight="600"
                    fill="white" opacity={clamp01((nt - 0.65) * 2.9)}
                    style={{ textShadow: '0 1px 5px rgba(0,0,0,0.95)' } as React.CSSProperties}>
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ---------- Dust particles during pan ---------- */}
        {s.pan > 0.15 && s.pan < 0.92 && (
          <div className="absolute left-0 right-0 top-[25%] pointer-events-none overflow-hidden" style={{ height: '30%' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  left: `${sr(i * 97) * 100}%`,
                  top: `${sr(i * 53) * 100}%`,
                  width: 1 + sr(i * 37) * 2.5,
                  height: 1 + sr(i * 37) * 2.5,
                  background: `rgba(168,85,247,${0.06 + sr(i * 71) * 0.12})`,
                  animation: `drift ${3 + sr(i * 19) * 5}s ease-in-out infinite`,
                  animationDelay: `${sr(i * 41) * 3}s`,
                }}
              />
            ))}
          </div>
        )}

      </div>
      {/* ============================================================ */}
      {/* END OF TALL SCENE                                            */}
      {/* ============================================================ */}

      {/* ============ TITLE CARD (fixed overlay, fades out on pan) ============ */}
      <div
        className="absolute inset-0 flex flex-col items-center pointer-events-none"
        style={{
          justifyContent: 'center',
          paddingTop: '2vh',
          opacity: s.titleOp,
        }}
      >
        <div className="text-center px-8">
          {/* Main title — AI white, Horizons gradient */}
          <h1
            className="text-6xl sm:text-7xl md:text-9xl font-bold tracking-tight mb-3"
            style={{
              fontFamily: "'Poppins', sans-serif",
              filter: 'drop-shadow(0 0 30px rgba(249,115,22,0.35)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
            }}
          >
            <span style={{ color: 'white' }}>AI </span>
            <span
              style={{
                background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 40%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Horizons
            </span>
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center mt-5 gap-3" style={{ opacity: s.lineOp }}>
            <div className="h-px w-14 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6))' }} />
            <div className="w-2 h-2 rotate-45 border border-amber-400/60" />
            <div className="h-px w-14 md:w-20" style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.6), transparent)' }} />
          </div>
        </div>
      </div>

      {/* ============ SKIP BUTTON ============ */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 z-10 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-slate-400/70 hover:text-white/90 border border-slate-600/30 hover:border-amber-500/40 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/30"
      >
        Skip Intro
      </button>

      {/* ============ EXIT FADE (to main page sunset gradient for seamless transition) ============ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            #020617 0%, #050a1a 4%, #0a0f2e 9%, #0f1340 14%, #14174d 18%,
            #1e1b5e 23%, #2d1f6b 28%, #3b2278 33%, #4c2882 38%, #5c2d7e 43%,
            #6d3070 48%, #7c3058 52%, #8b3040 56%, #9a3412 60%, #b45309 64%,
            #d97706 68%, #f59e0b 73%, #fbbf24 78%, #fcd34d 83%, #fde68a 88%,
            #fef9c3 93%, #fffef5 97%, #fffef8 100%
          )`,
          opacity: s.exitOp,
        }}
      />
    </div>
  );
};

export default SplashPage;
