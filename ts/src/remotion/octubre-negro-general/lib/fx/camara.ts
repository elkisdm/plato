/** Lógica pura de la cámara: empuje lento por escena, deriva mínima y shake de impacto por golpe. */

import { random } from 'remotion';

import { ESCENAS } from '../lineaTiempo';
import { entre } from '../motion';
import { GOLPES_CAMARA, type Golpe } from './golpes';

type Ventana = { desde: number; hasta: number };

/** Constante de tiempo del decaimiento exponencial (frames): ~7 % restante a los 9 frames. */
const TAU = 3.2;
/** Pasados estos frames el golpe se corta a 0. */
const VENTANA_GOLPE = 12;
/** Amplitud máxima del shake (px) con fuerza 1. */
const AMP = 16;
/** Empuje de cámara por escena: 1.00 → 1.045. El golpe suma hasta 0.012 → tope 1.06 con margen. */
const EMPUJE = 0.045;
const ESCALA_MAX = 1.06;
const MOVE = 0.012;

/** 1 en el golpe, decae exponencialmente; 0 antes y pasados 12 frames. */
export function decaimiento(dt: number): number {
  if (dt < 0 || dt >= VENTANA_GOLPE) return 0;
  return Math.exp(-dt / TAU);
}

export type Shake = { x: number; y: number; rot: number; zoom: number };

/** Suma de los golpes activos: desplazamiento oscilante en una dirección propia de cada golpe, giro y pulso de zoom. */
export function shakeGolpes(frame: number, golpes: Golpe[]): Shake {
  const s: Shake = { x: 0, y: 0, rot: 0, zoom: 0 };
  golpes.forEach((g) => {
    const dt = frame - g.frame;
    const d = decaimiento(dt) * g.fuerza;
    if (d === 0) return;
    const ang = random(`golpe-dir-${g.frame}`) * Math.PI * 2;
    const osc = Math.cos(dt * 2.3);
    const signo = random(`golpe-rot-${g.frame}`) < 0.5 ? -1 : 1;
    s.x += AMP * d * osc * Math.cos(ang);
    s.y += AMP * d * osc * Math.sin(ang);
    s.rot += signo * 0.55 * d * Math.cos(dt * 1.7);
    s.zoom += MOVE * d;
  });
  return s;
}

const suave = (t: number): number => t * t * (3 - 2 * t);

/**
 * Escala base de la cámara: crece 1.00→1.045 a lo largo de cada escena y, durante la transición,
 * vuelve a 1.00 (suave) mientras la entrante termina de entrar: sin saltos.
 */
export function escalaEmpuje(frame: number, escenas: Ventana[] = ESCENAS): number {
  let i = 0;
  escenas.forEach((e, k) => {
    if (frame >= e.desde) i = k;
  });
  const e = escenas[i]!;
  const previa = escenas[i - 1];
  if (previa && frame < previa.hasta) {
    return 1 + EMPUJE * (1 - suave(entre(frame, e.desde, previa.hasta)));
  }
  const ini = previa ? previa.hasta : 0;
  const fin = escenas[i + 1] ? escenas[i + 1]!.desde : e.hasta;
  return 1 + EMPUJE * suave(entre(frame, ini, fin));
}

export type TransformCamara = { scale: number; x: number; y: number; rot: number };

/** Transformación total de la cámara en un frame (se aplica con origen en el centro del lienzo). */
export function transformCamara(
  frame: number,
  escenas: Ventana[] = ESCENAS,
  golpes: Golpe[] = GOLPES_CAMARA,
): TransformCamara {
  const s = shakeGolpes(frame, golpes);
  return {
    scale: Math.min(ESCALA_MAX, escalaEmpuje(frame, escenas) + s.zoom),
    x: 5 * Math.sin(frame / 57) + s.x,
    y: 4 * Math.sin(frame / 71 + 1) + s.y,
    rot: 0.2 * Math.sin(frame / 89) + s.rot,
  };
}
