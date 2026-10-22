/**
 * Zonas seguras del lienzo vertical 1080×1920. Mismos valores que el layout vertical de
 * `tips-ia-local` (Instagram tapa 120 px arriba y 260 px abajo), sin la lógica de orientación:
 * este reel solo existe en vertical.
 */

export const W_V = 1080;
export const H_V = 1920;
/** Instagram tapa los 120 px de arriba y los 260 px de abajo con su interfaz. */
export const ARRIBA_V = 120;
export const ABAJO_V = 260;
/** Márgenes fijos de la serie: 120 px arriba y a cada lado. */
export const MARGEN_V = 120;
export const MARGEN_LATERAL = 120;
/** Ancho útil del contenido. */
export const ANCHO_V = W_V - MARGEN_LATERAL * 2;
/** Primera y última fila ocupables por el contenido (bajo la zona tapada de arriba y sobre la de abajo). */
export const YINI_V = 200;
export const YFIN_V = H_V - ABAJO_V - 20;
/** Límite inferior del contenido de las escenas: los subtítulos ocupan y 1480–1640. */
export const YFIN_ESCENA = 1450;
/** Tamaño mínimo de texto: se lee en un teléfono. */
export const MIN_TEXTO_V = 28;

/** Sube a `MIN_TEXTO_V` los textos chicos. */
export const fsMinimo = (px: number): number => Math.max(MIN_TEXTO_V, px);
