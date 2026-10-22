/** Temblor y corte de glitch de una ficha «exagerada» (E02): amplitud que decae tras el golpe y un resto leve que nunca para. */

import { random } from 'remotion';

export type Temblor = { dx: number; dy: number; rot: number; corte: number };

const SIN_TEMBLOR: Temblor = { dx: 0, dy: 0, rot: 0, corte: 0 };

/** Desplazamiento (px), giro (°) y desfase de la franja de glitch (px) de la ficha `i` en `frame`. */
export function temblor(frame: number, golpe: number, i: number): Temblor {
  const k = frame - golpe;
  if (k < 0) return SIN_TEMBLOR;
  const amp = 1 + 7 * Math.exp(-k / 14);
  const r = (s: string) => random(`glitch-${s}-${i}-${frame}`) * 2 - 1;
  const hayCorte = random(`glitch-c-${i}-${Math.floor(frame / 2)}`) > (k < 30 ? 0.45 : 0.85);
  return { dx: r('x') * amp, dy: r('y') * amp * 0.6, rot: r('r') * amp * 0.25, corte: hayCorte ? r('k') * 16 : 0 };
}
