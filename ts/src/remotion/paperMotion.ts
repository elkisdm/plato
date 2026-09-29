// Matemática del motion "papel que cobra vida". Funciones PURAS de (frame, config):
// mismo frame → mismo output, scrubbeable en ambas direcciones. Los componentes de
// paper/ son cáscaras delgadas sobre esto; los tests viven en paperMotion.test.ts.

import { Easing, interpolate } from 'remotion';

export type LiftEasing = 'out-cubic' | 'out-quad' | 'linear';

export interface LiftConfig {
  /** 0-1 = cuánto se despega del papel. */
  target: number;
  durationInFrames: number;
  easing: LiftEasing;
}

export interface LifeConfig {
  /** 0-1, escala global del micro-movimiento (0 = quieto total). */
  amplitude: number;
  bobHz: number;
  tiltHz: number;
  leanHz: number;
  bobPx: number;
  tiltDeg: number;
  leanDeg: number;
}

export interface ShadowState {
  dx: number;
  dy: number;
  blur: number;
  opacity: number;
}

export interface MicroState {
  /** px verticales (translateY). */
  bob: number;
  /** grados (rotate). */
  tilt: number;
  /** grados (skewX, atenuado por el componente). */
  lean: number;
}

const EASINGS: Record<LiftEasing, (t: number) => number> = {
  'out-cubic': Easing.out(Easing.cubic),
  'out-quad': Easing.out(Easing.quad),
  linear: Easing.linear,
};

/** Progreso del despegue en [0, lift.target], con ease-out y clamp en ambos extremos. */
export function liftProgressAt(frame: number, enterAt: number, lift: LiftConfig): number {
  return interpolate(frame, [enterAt, enterAt + lift.durationInFrames], [0, lift.target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASINGS[lift.easing],
  });
}

/** Sombra que "despega" el recorte: a lift 0 está pegada (dy 4, blur 1, tenue);
 * al crecer el lift se separa, se difumina y oscurece. */
export function shadowAt(liftProgress: number): ShadowState {
  return {
    dx: liftProgress * 9,
    dy: 4 + liftProgress * 20,
    blur: 1 + liftProgress * 17,
    opacity: 0.16 + liftProgress * 0.28,
  };
}

/** Leve acercamiento a cámara al despegar (refuerza la separación del plano). */
export function scaleAt(liftProgress: number): number {
  return 1 + liftProgress * 0.09;
}

/** Respiración sinusoidal (bob/tilt/lean). Gateada a 0 antes de enterAt.
 * El lean lleva fase +1 para no alinearse con el bob. */
export function microAt(frame: number, enterAt: number, fps: number, life: LifeConfig): MicroState {
  if (frame < enterAt) return { bob: 0, tilt: 0, lean: 0 };
  const tSec = (frame - enterAt) / fps;
  const TAU = 2 * Math.PI;
  // El `+ 0` normaliza el -0 de IEEE 754 (seno negativo × amplitud 0).
  return {
    bob: Math.sin(tSec * life.bobHz * TAU) * life.bobPx * life.amplitude + 0,
    tilt: Math.sin(tSec * life.tiltHz * TAU) * life.tiltDeg * life.amplitude + 0,
    lean: Math.sin(tSec * life.leanHz * TAU + 1) * life.leanDeg * life.amplitude + 0,
  };
}

/** Fade de entrada: 0 antes de enterAt, 1 al completar fadeInFrames. */
export function enterOpacityAt(frame: number, enterAt: number, fadeInFrames: number): number {
  return interpolate(frame, [enterAt, enterAt + fadeInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

/** Fade append por palabra: la palabra i arranca en enterAt + i·wordFadeFrames
 * y tarda wordFadeFrames en aparecer (~80ms a 30fps con el default 3). */
export function wordOpacityAt(
  frame: number,
  enterAt: number,
  wordIndex: number,
  wordFadeFrames: number,
): number {
  const start = enterAt + wordIndex * wordFadeFrames;
  return interpolate(frame, [start, start + wordFadeFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
