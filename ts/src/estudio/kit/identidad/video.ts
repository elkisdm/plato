/** Cuadros reales de la composición que equivalen a `segundos` del video de origen. */
export const cuadrosDesde = (segundos: number, fps: number): number => Math.round(segundos * fps);

/** Empuje lento de cámara: de 1,00 a 1,06 a lo largo de la escena (`p` de 0 a 1). */
export const empuje = (p: number): number => 1 + 0.06 * Math.min(1, Math.max(0, p));
