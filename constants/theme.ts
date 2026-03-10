/**
 * Theme constants for AI Horizon
 * Centralized color palette and styling values based on the "Sunrise" theme
 */

// ============================================================================
// COLOR PALETTE - Sunrise Theme
// ============================================================================

export const NODE_COLORS: Record<string, string> = {
  'CORE': '#f97316',        // Orange 500 - The Horizon Sun
  'TOOL': '#fbbf24',        // Amber 400 - Light/Rays
  'INFRASTRUCTURE': '#22d3ee', // Cyan 400 - Cool/Foundation/Water
  'CONCEPT': '#a855f7',     // Purple 500 - The Sky/Atmosphere
  'SKILL': '#f43f5e',       // Rose 500 - The Dawn
  'default': '#94a3b8',     // Slate 400
};

export const COLORS = {
  // Node category colors
  node: NODE_COLORS,

  // Link colors
  link: {
    default: '#fbbf24',     // Amber 400 - gold
    highlight: '#fcd34d',  // Amber 300 - brighter when selected
  },

  // Background colors
  background: {
    primary: '#0f172a',    // Slate 900
    secondary: '#1e293b',  // Slate 800
    tertiary: '#334155',   // Slate 700
  },

  // Text colors
  text: {
    primary: '#e2e8f0',    // Slate 200
    secondary: '#94a3b8',  // Slate 400
    muted: '#64748b',      // Slate 500
  },
};

// ============================================================================
// NODE STYLING
// ============================================================================

export const NODE_RADII: Record<string, number> = {
  'CORE': 35,
  'CONCEPT': 25,
  'INFRASTRUCTURE': 22,
  'SKILL': 20,
  'TOOL': 18,
  'default': 18,
};

export const NODE_STROKE_WIDTH: Record<string, number> = {
  'CORE': 4,
  'default': 2,
};

export const NODE_ICONS: Record<string, string> = {
  'CORE': '☀️',
  'TOOL': '🛠️',
  'INFRASTRUCTURE': '🏗️',
  'CONCEPT': '🧠',
  'SKILL': '⚡',
};

// ============================================================================
// FORCE SIMULATION PARAMETERS
// ============================================================================

export const SIMULATION = {
  link: {
    distance: 180,
    strength: 0.4,
  },
  charge: {
    strength: -800,
  },
  collide: {
    padding: 30,
    iterations: 2,
  },
  yForce: {
    strength: 1.2,
  },
  xForce: {
    strength: 0.05,
  },
};

// ============================================================================
// LAYOUT PARAMETERS
// ============================================================================

export const LAYOUT = {
  verticalPadding: 100,
  arrowMarker: {
    refX: 28,
    markerWidth: 6,
    markerHeight: 6,
  },
};

// ============================================================================
// ANIMATION DURATIONS (ms)
// ============================================================================

export const ANIMATION = {
  selectionTransition: 300,
  fadeIn: 300,
  fadeOut: 200,
};

// ============================================================================
// TAILWIND CLASS MAPPINGS
// ============================================================================

export const CATEGORY_CLASSES: Record<string, string> = {
  'CORE': 'text-orange-500 border-orange-500/20 bg-orange-500/5',
  'TOOL': 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  'INFRASTRUCTURE': 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
  'CONCEPT': 'text-purple-400 border-purple-400/20 bg-purple-400/5',
  'SKILL': 'text-rose-400 border-rose-400/20 bg-rose-400/5',
  'default': 'text-slate-400 border-slate-400/20 bg-slate-400/5',
};

