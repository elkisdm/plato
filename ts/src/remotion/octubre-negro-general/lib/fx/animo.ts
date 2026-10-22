/**
 * Ánimo de cada escena: gobierna el color del halo, las ascuas y los destellos de `FondoVivo`.
 * alerta = ámbar, calma = turquesa (hábito), neutro = frío sin color.
 *
 * - `animoEn(frame)`: el ánimo discreto en ese frame global.
 * - `pesosAnimo(frame)`: mezcla continua {alerta, calma, neutro} (suma 1) con un fundido de 20 frames
 *   al cambiar de ánimo; es lo que usa `FondoVivo` para no pegar saltos de color.
 */

import { aFrame, palabra } from '../alineacion';
import { ESCENAS } from '../lineaTiempo';
import { entre } from '../motion';

export type Animo = 'alerta' | 'calma' | 'neutro';
export type PesosAnimo = Record<Animo, number>;

/** Frames que dura el fundido entre un ánimo y el siguiente. */
const FUNDIDO_ANIMO = 20;

const base = (i: number): number => ESCENAS[i]!.desde;

/** Tramos ordenados por frame: desde ese frame rige ese ánimo. */
const TRAMOS: { desde: number; animo: Animo }[] = [
  { desde: base(0), animo: 'alerta' }, // E01
  { desde: base(1), animo: 'alerta' }, // E02
  { desde: base(2), animo: 'neutro' }, // E03
  { desde: base(3), animo: 'alerta' }, // E04 empieza en alerta…
  { desde: aFrame(palabra('cambiar', 3).inicio), animo: 'calma' }, // …y pasa a calma al cambiar las llaves
  { desde: base(4), animo: 'alerta' }, // E05 empieza en alerta…
  { desde: aFrame(palabra('cierra', 4).inicio), animo: 'calma' }, // …y pasa a calma al cerrar
  { desde: base(5), animo: 'calma' }, // E06
  { desde: base(6), animo: 'calma' }, // E07
];

const indiceTramo = (frame: number): number => {
  let idx = 0;
  TRAMOS.forEach((t, i) => {
    if (frame >= t.desde) idx = i;
  });
  return idx;
};

export function animoEn(frame: number): Animo {
  return TRAMOS[indiceTramo(frame)]!.animo;
}

export function pesosAnimo(frame: number): PesosAnimo {
  const i = indiceTramo(frame);
  const actual = TRAMOS[i]!;
  const previo = TRAMOS[Math.max(0, i - 1)]!;
  const p = i === 0 ? 1 : entre(frame, actual.desde, actual.desde + FUNDIDO_ANIMO);
  const pesos: PesosAnimo = { alerta: 0, calma: 0, neutro: 0 };
  pesos[previo.animo] += 1 - p;
  pesos[actual.animo] += p;
  return pesos;
}
