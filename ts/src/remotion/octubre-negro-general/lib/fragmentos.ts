/** Física determinista de fragmentos/chispas lanzados desde un punto (impactos, glitch, llaves rotas). */

import { random } from 'remotion';

export type OpcionesFragmento = {
  /** Semilla del grupo: mismo grupo + mismo índice = mismo recorrido. */
  semilla: string;
  /** Rapidez inicial en px/frame (cada fragmento usa entre 45 % y 100 % de este valor). */
  velocidad: number;
  /** Aceleración hacia abajo en px/frame². */
  gravedad: number;
  /** Frames de vida. */
  vida: number;
  /** Rumbo central en radianes y apertura total del abanico; por defecto todo el círculo. */
  rumbo?: number;
  apertura?: number;
};

export type EstadoFragmento = { x: number; y: number; rot: number; opacidad: number; escala: number };

/** Estado del fragmento `i` a `dt` frames de su nacimiento; null si todavía no nace o ya murió. */
export function estadoFragmento(dt: number, i: number, o: OpcionesFragmento): EstadoFragmento | null {
  if (dt < 0 || dt >= o.vida) return null;
  const rumbo = o.rumbo ?? 0;
  const apertura = o.apertura ?? Math.PI * 2;
  const ang = rumbo + (random(`${o.semilla}-ang-${i}`) - 0.5) * apertura;
  const v = o.velocidad * (0.45 + 0.55 * random(`${o.semilla}-vel-${i}`));
  const giro = (random(`${o.semilla}-giro-${i}`) - 0.5) * 40;
  const p = dt / o.vida;
  return {
    x: Math.cos(ang) * v * dt,
    y: Math.sin(ang) * v * dt + 0.5 * o.gravedad * dt * dt,
    rot: giro * dt,
    opacidad: 1 - p * p,
    escala: 1 - 0.6 * p,
  };
}
