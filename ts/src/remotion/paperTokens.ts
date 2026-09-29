// Tokens del sistema "papel que cobra vida" — derivados del análisis del video de
// referencia (videospec-olyasuharska): papel crema + grano + viñeta + tipografía
// a dos niveles. Constantes puras; los componentes de paper/ las consumen.

/** SVG de ruido (feTurbulence) inline como data-uri. Estático a propósito:
 * el grano de papel impreso no "hierve" entre frames. */
const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`;

export const paperTokens = {
  paper: {
    gradient: 'radial-gradient(130% 80% at 50% -10%, #f3eede 0%, #e7e0cd 55%, #ded5bf 100%)',
    ink: '#141109',
    inkMuted: '#5a554c',
    highlightGold: '#E8B84B',
    shadowColor: 'rgba(20,16,9,1)',
  },
  grain: {
    opacity: 0.55,
    blend: 'multiply' as const,
    dataUri: `data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}`,
  },
  vignette: 'radial-gradient(125% 95% at 50% 42%, transparent 58%, rgba(60,45,25,0.12) 100%)',
  typography: {
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    emphasisWeight: 800,
    connectorWeight: 300,
    letterSpacing: '-0.025em',
  },
} as const;

// ——— Defaults de props (referencia de pacing: medianShotMs 2042, ease-out) ———

export const DEFAULT_LIFT = {
  target: 0.82,
  durationInFrames: 27,
  easing: 'out-cubic',
} as const;

export const DEFAULT_LIFE = {
  amplitude: 0.65,
  bobHz: 0.33,
  tiltHz: 0.22,
  leanHz: 0.43,
  bobPx: 4,
  tiltDeg: 2,
  leanDeg: 1.4,
} as const;

export const DEFAULT_ENTER = {
  fadeInFrames: 8,
  mode: 'fade',
} as const;

export const DEFAULT_TREATMENT = {
  grain: false,
  halftone: 'none',
  sepia: 0,
  contrast: 1,
} as const;
