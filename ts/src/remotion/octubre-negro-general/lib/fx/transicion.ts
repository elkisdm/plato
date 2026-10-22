/** Lógica pura de las transiciones entre escenas: movimiento de cámara con desenfoque y separación cromática. */

import { entre } from '../motion';

export type VarianteTransicion = 'zoom' | 'whip' | 'flash';
const CICLO: VarianteTransicion[] = ['zoom', 'whip', 'flash'];

/** Variante de la frontera n (entre la escena n−1 y la n): rota sin repetir dos seguidas. */
export function varianteTransicion(indice: number): VarianteTransicion {
  return CICLO[((indice % CICLO.length) + CICLO.length) % CICLO.length]!;
}

export type EstadoTransicion = {
  opacity: number;
  scale: number;
  x: number;
  blurX: number;
  blurY: number;
  /** Separación horizontal R/B en px (≤ 6). */
  cromatica: number;
  /** Destello blanco 0–1 (solo variante flash, pico a media transición). */
  flash: number;
  /** Progreso 0–1 del barrido de luz diagonal durante la entrada (1 = terminado). */
  barrido: number;
};

type Entrada = {
  frame: number;
  desde: number;
  hasta: number;
  solape: number;
  variante: VarianteTransicion;
  entra: boolean;
  sale: boolean;
};

const IDENTIDAD: EstadoTransicion = { opacity: 1, scale: 1, x: 0, blurX: 0, blurY: 0, cromatica: 0, flash: 0, barrido: 1 };

const suave = (t: number): number => t * t * (3 - 2 * t);
const salidaCubica = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Estado visual de una escena en un frame. Entrada (primeros `solape` frames desde `desde`) y salida
 * (últimos `solape` antes de `hasta`) son simétricas entre escenas contiguas porque ambas usan la misma `variante`.
 * - saliente: escala 1→1.08, blur hasta 10 px, cromática hasta 6 px, se apaga en la segunda mitad.
 * - entrante: escala 0.94→1, parte desenfocada y entra rápido.
 * - zoom/flash empujan en profundidad; whip empuja en horizontal con desenfoque horizontal.
 */
export function estadoTransicion(i: Entrada): EstadoTransicion {
  const t = i.entra ? entre(i.frame, i.desde, i.desde + i.solape) : 1;
  const u = i.sale ? entre(i.frame, i.hasta - i.solape, i.hasta) : 0;
  const e: EstadoTransicion = { ...IDENTIDAD, barrido: t };

  if (t < 1) {
    const q = salidaCubica(t);
    e.opacity = Math.min(e.opacity, suave(Math.min(1, t / 0.55)));
    const resto = 1 - q;
    if (i.variante === 'whip') {
      e.x = 400 * Math.pow(1 - t, 2.2);
      e.blurX = 10 * resto;
      e.blurY = 1.5 * resto;
    } else {
      e.scale *= 0.94 + 0.06 * q;
      e.blurX = e.blurY = 5 * resto;
    }
    e.cromatica = Math.max(e.cromatica, 4.5 * resto);
  }

  if (u > 0) {
    const a = Math.min(1, u * 1.1) ** 2; // ease-in: la escala llega a 1.08 al final
    const g = Math.min(1, u / 0.8); // desenfoque y cromática alcanzan su máximo antes de apagarse
    e.opacity = Math.min(e.opacity, 1 - suave(Math.max(0, (u - 0.5) / 0.5)));
    if (i.variante === 'whip') {
      e.x += -400 * Math.pow(u, 2.2);
      e.blurX = Math.max(e.blurX, 10 * g);
      e.blurY = Math.max(e.blurY, 1.5 * g);
    } else {
      e.scale *= 1 + 0.08 * a;
      e.blurX = Math.max(e.blurX, 10 * g);
      e.blurY = Math.max(e.blurY, 10 * g);
    }
    e.cromatica = Math.max(e.cromatica, 6 * g);
  }

  if (i.variante === 'flash' && t < 1) e.flash = Math.sin(Math.PI * t) ** 4 * 0.7;
  return e;
}
