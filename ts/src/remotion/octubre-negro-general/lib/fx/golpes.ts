/**
 * Golpes de cámara del reel: cada uno dispara shake, y los fuertes también destello y onda de choque
 * (`CapaGolpes`). Lo leen `Camara` (shake) y `CapaGolpes` (destello/onda).
 *
 * - `frame`: cuadro global del golpe (siempre derivado de `aFrame(palabra(...).inicio)`, nunca a mano).
 * - `fuerza`: 0–1. Escala el shake; ≥ 0.6 añade destello, ≥ 0.5 añade onda de choque.
 * - `x`, `y` (opcionales): punto del lienzo desde donde nace la onda; por defecto el centro del contenido.
 *
 * Cada escena tiene su bloque: las tareas de escenas agregan ahí sus golpes (no en otro lugar).
 */

import { aFrame, palabra } from '../alineacion';

export type Golpe = { frame: number; fuerza: number; x?: number; y?: number };

export const GOLPES_CAMARA: Golpe[] = [
  // E01 — «veintisiete» aterriza el 27
  { frame: aFrame(palabra('veintisiete', 0).inicio), fuerza: 0.9, x: 540, y: 760 },
  // (E01: agrega aquí los demás golpes de la escena)

  // E02 — «exageraciones» hincha las fichas ámbar
  { frame: aFrame(palabra('exageraciones', 1).inicio), fuerza: 0.8, x: 540, y: 780 },
  // (E02: agrega aquí los demás golpes de la escena)

  // E03 — «viene» (de dónde viene): la lupa revela la fuente
  { frame: aFrame(palabra('viene', 2).inicio), fuerza: 0.7, x: 540, y: 820 },
  // (E03: agrega aquí los demás golpes de la escena)

  // E04 — «llaves» (cambiar tus llaves)
  { frame: aFrame(palabra('llaves', 3).inicio), fuerza: 0.85, x: 540, y: 800 },
  // (E04: agrega aquí los demás golpes de la escena)

  // E05 — «cierra» la puerta
  { frame: aFrame(palabra('cierra', 4).inicio), fuerza: 1, x: 540, y: 820 },
  // (E05: agrega aquí los demás golpes de la escena)

  // E06 — «alcanza» sella los tres pasos
  { frame: aFrame(palabra('alcanza', 5).inicio), fuerza: 0.8, x: 540, y: 820 },
  // (E06: agrega aquí los demás golpes de la escena)

  // E07 — «PARCHE» cae
  { frame: aFrame(palabra('PARCHE', 6).inicio), fuerza: 0.9, x: 540, y: 760 },
  // (E07: agrega aquí los demás golpes de la escena)
];
