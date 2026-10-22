/** Posiciones fijas de la escena E04: casa ajena con tres cajas fuertes y la fila de llaves. */

import { MARGEN_LATERAL, W_V } from './layout';

const ANCHO_CASA = 760;
const X_CASA = (W_V - ANCHO_CASA) / 2;

export const CASA = {
  x: X_CASA,
  ancho: ANCHO_CASA,
  yTecho: 230,
  altoTecho: 150,
  yCuerpo: 380,
  altoCuerpo: 500,
  /** Holgura del brillo ámbar del pulso, que no debe cruzar x = 120. */
  brillo: 30,
} as const;

const ALTO_CAJA = 100;
const GAP_CAJA = 20;
const X_CAJA = CASA.x + 50;

/** Tres cajas fuertes dentro del cuerpo de la casa. */
export const CAJAS = [0, 1, 2].map((i) => ({
  x: X_CAJA,
  y: CASA.yCuerpo + 100 + i * (ALTO_CAJA + GAP_CAJA),
  ancho: CASA.ancho - 100,
  alto: ALTO_CAJA,
}));

export const ETIQUETAS_CAJAS = ['TUS CUENTAS', 'TUS CONTRASEÑAS', 'TUS ARCHIVOS'] as const;

/** Centro (y) de la fila de llaves y x de cada una. */
export const Y_LLAVES = 1210;
export const LLAVES_X = [MARGEN_LATERAL + 160, W_V / 2, W_V - MARGEN_LATERAL - 160] as const;

/** Tres ventanas en la franja alta del cuerpo, sobre las cajas fuertes. */
export const VENTANAS = [0, 1, 2].map((i) => ({
  x: CASA.x + 90 + i * 220,
  y: CASA.yCuerpo + 18,
  ancho: 120,
  alto: 56,
}));

/**
 * Brillo 0..1 de una ventana que se enciende en `t`: parpadea (tubo fluorescente) durante 8 frames y queda fija.
 * `i` desfasa el parpadeo de cada ventana.
 */
export function luzVentana(frame: number, t: number, i: number): number {
  const dt = frame - t;
  if (dt < 0) return 0;
  if (dt >= 8) return 1;
  const patron = [1, 0.15, 0.9, 0.2, 0.6, 0.1, 1, 0.8];
  return patron[(dt + i) % patron.length]!;
}

/** Giro (grados) de la puerta de una caja fuerte: abre con rebote desde `t+3` y vuelve a cerrar hacia `t+22`. */
export function anguloPuerta(frame: number, t: number): number {
  const dt = frame - t;
  if (dt < 3 || dt >= 26) return 0;
  if (dt < 12) return 78 * (1 - Math.pow(1 - (dt - 3) / 9, 3));
  if (dt < 16) return 78;
  if (dt < 22) return 78 * (1 - Math.pow((dt - 16) / 6, 2));
  // Rebote al cerrar: cabecea un par de grados y se asienta.
  return 6 * Math.exp(-(dt - 22) / 1.5) * Math.sin((dt - 22) * 2);
}
