import React from 'react';

/**
 * Sunset background matching the splash animation gradient:
 * Dark purples/blues at top (space) → warm oranges → bright sun at bottom (domain)
 * Includes twinkling stars and rare comets.
 */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Stars for upper portion (dark sky area) — fewer, slower twinkle
const STARS = Array.from({ length: 36 }, (_, i) => ({
  x: seededRandom(i * 3 + 1) * 100,
  y: seededRandom(i * 3 + 2) * 55,
  r: 0.45 + seededRandom(i * 3 + 3) * 1.4,
  brightness: 0.35 + seededRandom(i * 7) * 0.6,
  speed: 4.5 + seededRandom(i * 5) * 4.5,  // 4.5–9s (slower)
  delay: seededRandom(i * 11) * 8,
  hue: seededRandom(i * 13) > 0.85 ? (seededRandom(i * 17) > 0.5 ? '220' : '35') : '0',
}));

// Comets: rare, slow diagonal streaks (start off-screen, drift across)
const COMETS = [
  { id: 1, startX: -8, startY: 12, endX: 108, endY: 55, dur: 28, delay: 0 },
  { id: 2, startX: 95, startY: -5, endX: -10, endY: 45, dur: 35, delay: 12 },
  { id: 3, startX: -5, startY: 35, endX: 105, endY: 8, dur: 40, delay: 22 },
];

const SunsetBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.7); }
          50% { opacity: 0.95; transform: scale(1.15); }
        }
        @keyframes comet-drift {
          0% { opacity: 0; transform: translate(var(--cx1), var(--cy1)); }
          8% { opacity: 0.9; }
          92% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(var(--cx2), var(--cy2)); }
        }
      `}</style>

      {/* Sunset gradient: same pattern as splash animation */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            #020617 0%,
            #050a1a 4%,
            #0a0f2e 9%,
            #0f1340 14%,
            #14174d 18%,
            #1e1b5e 23%,
            #2d1f6b 28%,
            #3b2278 33%,
            #4c2882 38%,
            #5c2d7e 43%,
            #6d3070 48%,
            #7c3058 52%,
            #8b3040 56%,
            #9a3412 60%,
            #b45309 64%,
            #d97706 68%,
            #f59e0b 73%,
            #fbbf24 78%,
            #fcd34d 83%,
            #fde68a 88%,
            #fef9c3 93%,
            #fffef5 97%,
            #fffef8 100%
          )`,
        }}
      />

      {/* Subtle sun glow at very bottom (near domain nodes) */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: '22%',
          bottom: 0,
          background: 'radial-gradient(ellipse 70% 90% at 50% 100%, rgba(253,224,71,0.18), rgba(251,146,60,0.08), transparent 65%)',
        }}
      />

      {/* Stars SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r * 0.2}
            fill={star.hue === '0'
              ? `rgba(255,255,255,${star.brightness})`
              : `hsla(${star.hue},80%,88%,${star.brightness})`
            }
            style={{
              animation: `star-twinkle ${star.speed}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </svg>

      {/* Comets — rare diagonal streaks across the sky */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {COMETS.map((c) => {
          const dx = c.endX - c.startX;
          const dy = c.endY - c.startY;
          return (
            <g
              key={c.id}
              style={{
                ['--cx1' as string]: '0',
                ['--cy1' as string]: '0',
                ['--cx2' as string]: String(dx),
                ['--cy2' as string]: String(dy),
                animation: `comet-drift ${c.dur}s linear infinite`,
                animationDelay: `${c.delay}s`,
              } as React.CSSProperties}
            >
              <line
                x1={c.startX}
                y1={c.startY}
                x2={c.startX - dx * 0.12}
                y2={c.startY - dy * 0.12}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.22"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SunsetBackground;
