/** Curvas puras de los efectos de impacto: destello, onda de choque, letras que caen y sello. */

import { random, spring } from 'remotion';

import { entre } from '../motion';

const sinRuido = (n: number): number => (Math.abs(n) < 0.005 ? 0 : n);

/** Intensidad 0–1 del destello: sube en 1 frame (pico 1 en dt=1) y cae a 0 en `dur` frames. */
export function intensidadDestello(dt: number, dur: number): number {
  if (dt < 0 || dt >= dur) return 0;
  if (dt <= 1) return 0.4 + 0.6 * dt;
  return Math.pow(1 - (dt - 1) / (dur - 1), 1.5);
}

export type EstadoOnda = { radio: number; opacidad: number; grosor: number };

/** Anillo que se expande: `radio` 0–1 (fracción del tamaño máximo), `opacidad` y `grosor` relativos bajan. null fuera de ventana. */
export function estadoOnda(dt: number, dur: number): EstadoOnda | null {
  if (dt < 0 || dt >= dur) return null;
  const p = dt / dur;
  return { radio: 1 - Math.pow(1 - p, 3), opacidad: Math.pow(1 - p, 1.5), grosor: 1 - 0.85 * p };
}

export type EstadoLetra = { y: number; rot: number; blur: number; opacity: number; scale: number };

const SPRING_LETRA = { damping: 8, stiffness: 170, mass: 0.6 };

/** Letra (o palabra) número `i`: cae 80 px con giro alterno, rebota por debajo de su sitio y se asienta. */
export function estadoLetra(
  frame: number,
  inicio: number,
  i: number,
  escalon: number,
  fps: number,
): EstadoLetra {
  const s = spring({ frame: frame - inicio - i * escalon, fps, config: SPRING_LETRA });
  const dir = random(`letra-${i}`) < 0.5 ? -1 : 1;
  return {
    y: sinRuido((s - 1) * 80),
    rot: sinRuido((1 - s) * 18 * dir),
    blur: sinRuido(Math.max(0, 1 - s) * 6),
    opacity: Math.min(1, s * 3),
    scale: 1 + sinRuido((1 - s) * 0.25),
  };
}

/** Frames desde el inicio del sello hasta que golpea (en ese frame nace la onda de choque). */
export const FRAME_IMPACTO_SELLO = 6;

export type EstadoSello = { scale: number; rot: number; opacity: number };

/** Sello: cae desde escala 2.6 y 22° de más, golpea a escala 1 y rebota (aplasta/estira) hasta `rotFinal`. */
export function estadoSello(frame: number, inicio: number, rotFinal: number): EstadoSello {
  const dt = frame - inicio;
  if (dt < 0) return { scale: 2.6, rot: rotFinal + 22, opacity: 0 };
  if (dt < FRAME_IMPACTO_SELLO) {
    const p = dt / FRAME_IMPACTO_SELLO;
    return { scale: 2.6 - 1.6 * p * p, rot: rotFinal + 22 * (1 - p), opacity: Math.min(1, 0.3 + p * 1.5) };
  }
  const k = dt - FRAME_IMPACTO_SELLO;
  const amort = Math.exp(-k / 4);
  return {
    scale: 1 - sinRuido(0.14 * amort * Math.sin(k * 0.85)),
    rot: rotFinal + 4 * amort * Math.cos(k * 0.7),
    opacity: 1,
  };
}

/** Progreso 0–1 de una línea que se dibuja (subrayados, brillos). */
export const dibujo = (frame: number, inicio: number, dur: number): number => entre(frame, inicio, inicio + dur);
