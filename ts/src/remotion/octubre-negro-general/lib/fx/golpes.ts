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
  // E01 — «veintisiete»: el 27 del marcador aterriza (la onda nace en su centro, y 520)
  { frame: aFrame(palabra('veintisiete', 0).inicio), fuerza: 0.9, x: 540, y: 520 },
  // E01 — «revisara»: el sello REVISAR golpea (`FRAME_IMPACTO_SELLO` = 6 después de empezar a caer)
  { frame: aFrame(palabra('revisara.', 0).inicio), fuerza: 0.55, x: 540, y: 1340 },

  // E02 — «exageraciones» hincha las fichas ámbar (la onda nace en el centro de la cuadrícula)
  { frame: aFrame(palabra('exageraciones', 1).inicio), fuerza: 0.8, x: 540, y: 640 },
  // E02 — «reportado»: la ficha 19 OCT aterriza sobre la línea de tiempo (termina su vuelo de 14 frames)
  { frame: aFrame(palabra('reportado', 1).inicio), fuerza: 0.6, x: 355, y: 1280 },

  // E03 — «viene» (de dónde viene): la lupa revela la fuente
  { frame: aFrame(palabra('viene', 2).inicio), fuerza: 0.7, x: 540, y: 820 },
  // (E03: agrega aquí los demás golpes de la escena)

  // E04 — «llaves» (cambiar tus llaves)
  { frame: aFrame(palabra('llaves', 3).inicio), fuerza: 0.85, x: 540, y: 800 },
  // (E04: agrega aquí los demás golpes de la escena)

  // E05 — «cierra» la puerta
  { frame: aFrame(palabra('cierra', 4).inicio), fuerza: 1, x: 540, y: 900 },
  // E05 — el candado hace click 14 frames después (solo shake leve; el destello turquesa es de la escena)
  { frame: aFrame(palabra('cierra', 4).inicio) + 14, fuerza: 0.3, x: 540, y: 870 },

  // E06 — «alcanza» sella los tres pasos
  { frame: aFrame(palabra('alcanza', 5).inicio), fuerza: 0.8, x: 540, y: 700 },
  // E06 — el sello ALCANZA golpea 10 frames después (su onda propia nace en el sello; aquí solo shake)
  { frame: aFrame(palabra('alcanza', 5).inicio) + 10, fuerza: 0.45, x: 540, y: 1230 },

  // E07 — «PARCHE» cae
  { frame: aFrame(palabra('PARCHE', 6).inicio), fuerza: 0.9, x: 540, y: 760 },
  // (E07: agrega aquí los demás golpes de la escena)
];
