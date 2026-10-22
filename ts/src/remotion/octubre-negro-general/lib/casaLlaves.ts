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
  altoCuerpo: 450,
  /** Holgura del brillo ámbar del pulso, que no debe cruzar x = 120. */
  brillo: 30,
} as const;

const ALTO_CAJA = 100;
const GAP_CAJA = 26;
const X_CAJA = CASA.x + 50;

/** Tres cajas fuertes dentro del cuerpo de la casa. */
export const CAJAS = [0, 1, 2].map((i) => ({
  x: X_CAJA,
  y: CASA.yCuerpo + 44 + i * (ALTO_CAJA + GAP_CAJA),
  ancho: CASA.ancho - 100,
  alto: ALTO_CAJA,
}));

export const ETIQUETAS_CAJAS = ['TUS CUENTAS', 'TUS CONTRASEÑAS', 'TUS ARCHIVOS'] as const;

/** Centro (y) de la fila de llaves y x de cada una. */
export const Y_LLAVES = 1210;
export const LLAVES_X = [MARGEN_LATERAL + 160, W_V / 2, W_V - MARGEN_LATERAL - 160] as const;
