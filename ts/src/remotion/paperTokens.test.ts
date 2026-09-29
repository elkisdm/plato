import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ENTER,
  DEFAULT_LIFE,
  DEFAULT_LIFT,
  DEFAULT_TREATMENT,
  paperTokens,
} from './paperTokens';

describe('paperTokens', () => {
  it('el papel trae el gradient crema y las tintas del análisis', () => {
    expect(paperTokens.paper.gradient).toContain('#f3eede');
    expect(paperTokens.paper.gradient).toContain('#e7e0cd');
    expect(paperTokens.paper.gradient).toContain('#ded5bf');
    expect(paperTokens.paper.ink).toBe('#141109');
    expect(paperTokens.paper.inkMuted).toBe('#5a554c');
    expect(paperTokens.paper.highlightGold).toBe('#E8B84B');
  });

  it('el grano es un data-uri SVG con feTurbulence baseFrequency 0.85', () => {
    expect(paperTokens.grain.dataUri.startsWith('data:image/svg+xml')).toBe(true);
    const decoded = decodeURIComponent(paperTokens.grain.dataUri);
    expect(decoded).toContain('feTurbulence');
    expect(decoded).toContain('baseFrequency="0.85"');
    expect(paperTokens.grain.opacity).toBe(0.55);
    expect(paperTokens.grain.blend).toBe('multiply');
  });

  it('la viñeta oscurece solo los bordes (transparente al centro)', () => {
    expect(paperTokens.vignette).toContain('transparent 58%');
    expect(paperTokens.vignette).toContain('rgba(60,45,25,0.12)');
  });

  it('tipografía a dos niveles: énfasis 800 ink, conector 300 inkMuted', () => {
    expect(paperTokens.typography.emphasisWeight).toBe(800);
    expect(paperTokens.typography.connectorWeight).toBe(300);
    expect(paperTokens.typography.letterSpacing).toBe('-0.025em');
  });
});

describe('defaults de props (del videospec de referencia)', () => {
  it('lift: despegue 0.82 en 27 frames con out-cubic', () => {
    expect(DEFAULT_LIFT).toEqual({ target: 0.82, durationInFrames: 27, easing: 'out-cubic' });
  });

  it('life: respiración con las frecuencias del análisis', () => {
    expect(DEFAULT_LIFE).toEqual({
      amplitude: 0.65,
      bobHz: 0.33,
      tiltHz: 0.22,
      leanHz: 0.43,
      bobPx: 4,
      tiltDeg: 2,
      leanDeg: 1.4,
    });
  });

  it('enter y treatment neutros por defecto', () => {
    expect(DEFAULT_ENTER).toEqual({ fadeInFrames: 8, mode: 'fade' });
    expect(DEFAULT_TREATMENT).toEqual({ grain: false, halftone: 'none', sepia: 0, contrast: 1 });
  });
});
