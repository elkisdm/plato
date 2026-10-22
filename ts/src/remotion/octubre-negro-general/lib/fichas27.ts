/** Geometría pura de la cuadrícula de 27 fichas (la «lista» que circuló, dibujada con formas propias). */

export const TOTAL_FICHAS = 27;
/** Margen lateral fijo de la serie. */
export const MARGEN_LATERAL_FICHAS = 120;

/** 5 columnas × 6 filas (la última con 2): cabe una etiqueta mono de 28 px dentro de la ficha. */
const V = { cols: 5, ancho: 156, alto: 124, gapX: 15, gapY: 26 } as const;

export type ClaseFicha = 'real' | 'exagerada' | 'neutra';

/** Fichas que pasan a «real». Fijas (sin azar). */
export const REALES: readonly number[] = [0, 2, 6, 10, 14, 19, 22, 25];
/** Fichas que se hinchan como «exageradas»: solo columnas interiores, para no cruzar los márgenes. */
export const EXAGERADAS: readonly number[] = [1, 8, 13, 17, 23];

export function claseFicha(i: number): ClaseFicha {
  if (REALES.includes(i)) return 'real';
  if (EXAGERADAS.includes(i)) return 'exagerada';
  return 'neutra';
}

/** Rectángulo de la ficha `i` con la cuadrícula anclada en (x0, y0). */
export function posicionFicha(i: number, x0: number, y0: number) {
  if (!Number.isInteger(i) || i < 0 || i >= TOTAL_FICHAS) {
    throw new Error(`Ficha fuera de rango: ${i}`);
  }
  const col = i % V.cols;
  const fila = Math.floor(i / V.cols);
  return {
    x: x0 + col * (V.ancho + V.gapX),
    y: y0 + fila * (V.alto + V.gapY),
    ancho: V.ancho,
    alto: V.alto,
  };
}

/** Ancho y alto totales de la cuadrícula. */
export function tamanoCuadricula() {
  const filas = Math.ceil(TOTAL_FICHAS / V.cols);
  return {
    ancho: V.cols * V.ancho + (V.cols - 1) * V.gapX,
    alto: filas * V.alto + (filas - 1) * V.gapY,
  };
}

/** Retraso (en unidades de escalón) de la ficha `i` en la ola de entrada: diagonal desde la esquina superior izquierda. */
export function retrasoOla(i: number): number {
  if (!Number.isInteger(i) || i < 0 || i >= TOTAL_FICHAS) {
    throw new Error(`Ficha fuera de rango: ${i}`);
  }
  return (i % V.cols) + Math.floor(i / V.cols);
}
