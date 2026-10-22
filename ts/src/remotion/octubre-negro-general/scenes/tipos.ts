/**
 * Firma común de las escenas E01–E07.
 *
 * - `desde`/`hasta`: ventana de la escena en frames GLOBALES (vienen de `ESCENAS` en `lib/lineaTiempo`).
 * - El frame global se lee con `useCurrentFrame()` de remotion: las escenas NO van dentro de
 *   `<Sequence>`, así que ese frame es el de la composición (el mismo que usa `aFrame(palabra(...).inicio)`).
 * - Las anclas a la voz se piden con `palabra(texto, linea)` y `aFrame` de `../lib/alineacion`;
 *   `palabra` lanza si el guion cambió. Pasa siempre la `linea` de la escena (n ↔ línea n−1)
 *   para no coincidir con la misma palabra en otra línea.
 *
 * Ejemplo (golpe anclado a "veintisiete", línea 0):
 *
 *   const frame = useCurrentFrame();
 *   const golpe = aFrame(palabra('veintisiete', 0).inicio);
 *   const k = rebote(frame, golpe, FPS);   // lib/motion; 0 antes del golpe, overshoot corto después
 *
 * Una escena solo dibuja dentro de la zona segura (`YINI_V`…`YFIN_V`, margen `MARGEN_V`; `lib/layout`)
 * y nunca baja de 28 px de texto (`fsMinimo`).
 */
export type PropsEscena = { desde: number; hasta: number };
