/**
 * Tokens del video "Arquitectura > Código": dark editorial, developer tooling.
 * Ningún componente escribe un color, tamaño o spring a mano: todo sale de acá.
 */

export const COLORS = {
  bg: '#090D0F',
  surface: '#10171B',
  surfaceRaised: '#151D21',
  text: '#F4F4F1',
  textMuted: '#8E9BA3',
  accent: '#38E6C1',
  accentSoft: '#6BEBD0',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.20)',
  line: 'rgba(244,244,241,0.28)',
  idle: '#4A565D',
  accentGlow: 'rgba(56,230,193,0.32)',
  accentWash: 'rgba(56,230,193,0.08)',
} as const;

export const SPACING = {
  /** Márgenes seguros para móvil (canvas 1080×1350). */
  safeX: 80,
  safeTop: 110,
  safeBottom: 140,
  radius: 14,
  radiusSmall: 8,
} as const;

export const FONTS = {
  sans: 'Geist, system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
} as const;

export const TYPE = {
  display: 104,
  headline: 66,
  title: 44,
  caption: 36,
  label: 30,
  small: 24,
  micro: 20,
} as const;

/** Configs de spring(): controladas, overshoot mínimo. */
export const SPRINGS = {
  /** Entrada de texto: sin rebote. */
  soft: { damping: 200, stiffness: 90, mass: 1 },
  /** Construcción de nodos: llega con un 1–2 % de overshoot. */
  build: { damping: 18, stiffness: 120, mass: 0.9 },
  /** Reorganizaciones de posición: firmes, sin rebote visible. */
  move: { damping: 26, stiffness: 90, mass: 1 },
} as const;

/** Duraciones base (frames). */
export const DURATIONS = {
  edgeDraw: 18,
  hop: 16,
  stagger: 3,
  fadeOut: 12,
} as const;
