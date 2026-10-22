/** Geometría pura de la cuadrícula de 27 fichas (la «lista» del hilo, dibujada con formas propias). */

export const TOTAL_FICHAS = 27;
/** Margen lateral fijo de la serie. */
export const MARGEN_LATERAL_FICHAS = 120;

export type VarianteFichas = 'grande' | 'compacta';

const VARIANTES = {
  /** 5 columnas × 6 filas (la última con 2): cabe una etiqueta mono de 28 px dentro de la ficha. */
  grande: { cols: 5, ancho: 156, alto: 124, gapX: 15, gapY: 26 },
  /** 9 columnas × 3 filas: versión decorativa sin texto. */
  compacta: { cols: 9, ancho: 80, alto: 56, gapX: 15, gapY: 14 },
} as const;

/** Rectángulo de la ficha `i` con la cuadrícula anclada en (x0, y0). */
export function posicionFicha(i: number, variante: VarianteFichas, x0: number, y0: number) {
  if (!Number.isInteger(i) || i < 0 || i >= TOTAL_FICHAS) {
    throw new Error(`Ficha fuera de rango: ${i}`);
  }
  const v = VARIANTES[variante];
  const col = i % v.cols;
  const fila = Math.floor(i / v.cols);
  return {
    x: x0 + col * (v.ancho + v.gapX),
    y: y0 + fila * (v.alto + v.gapY),
    ancho: v.ancho,
    alto: v.alto,
  };
}

/** Ancho y alto totales de la cuadrícula. */
export function tamanoCuadricula(variante: VarianteFichas) {
  const v = VARIANTES[variante];
  const filas = Math.ceil(TOTAL_FICHAS / v.cols);
  return {
    ancho: v.cols * v.ancho + (v.cols - 1) * v.gapX,
    alto: filas * v.alto + (filas - 1) * v.gapY,
  };
}
