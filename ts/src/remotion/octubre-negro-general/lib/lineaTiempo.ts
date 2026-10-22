/** Ventanas de escena en frames globales, derivadas de las líneas del guion. */

import { aFrame, finLinea, inicioLinea } from './alineacion';

export const NOMBRES_ESCENAS = [
  'E01Gancho',
  'E02Mezcla',
  'E03Fuente',
  'E04Casa',
  'E05Puerta',
  'E06TresPasos',
  'E07Cta',
] as const;

export type IdEscena = (typeof NOMBRES_ESCENAS)[number];

/** Frames de cierre tras la última palabra (2,5 s). */
const COLA = 75;
/** Cuánto antes de la primera palabra de la línea entra la escena. */
const ANTICIPO = 8;
/** Solape entre escenas contiguas: ventana de la transición (cámara con desenfoque y separación cromática). */
export const SOLAPE = 14;

export const DURACION = aFrame(finLinea(NOMBRES_ESCENAS.length - 1)) + COLA;

const desdes: number[] = NOMBRES_ESCENAS.map((_, l) =>
  Math.max(0, aFrame(inicioLinea(l)) - ANTICIPO),
);

export const ESCENAS: { id: IdEscena; linea: number; desde: number; hasta: number }[] =
  NOMBRES_ESCENAS.map((id, linea) => ({
    id,
    linea,
    desde: desdes[linea]!,
    hasta: linea === desdes.length - 1 ? DURACION : desdes[linea + 1]! + SOLAPE,
  }));
