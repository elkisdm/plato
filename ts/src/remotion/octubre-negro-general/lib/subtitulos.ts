/** Subtítulos: agrupa las palabras de la voz en frases cortas (3–5 palabras) sin cruzar líneas del guion. */

import { PALABRAS, type Palabra } from './alineacion';

export type Frase = { texto: string; palabras: Palabra[]; inicio: number; fin: number };

const MIN = 3;
const MAX = 5;
const PUNTUACION = /[.,;:!?…]["”]?$/;

function crearFrase(palabras: Palabra[]): Frase {
  return {
    texto: palabras.map((w) => w.texto).join(' '),
    palabras,
    inicio: palabras[0]!.inicio,
    fin: palabras[palabras.length - 1]!.fin,
  };
}

/** Corta una línea: tras puntuación con ≥ 3 palabras o al llegar a 5. Una cola de 1 palabra se une a la anterior (o toma una prestada). */
function agruparLinea(palabras: Palabra[]): Palabra[][] {
  const grupos: Palabra[][] = [];
  let actual: Palabra[] = [];
  palabras.forEach((w) => {
    actual.push(w);
    if (actual.length === MAX || (actual.length >= MIN && PUNTUACION.test(w.texto))) {
      grupos.push(actual);
      actual = [];
    }
  });
  if (actual.length) grupos.push(actual);

  const ultimo = grupos[grupos.length - 1]!;
  const previo = grupos[grupos.length - 2];
  if (grupos.length > 1 && ultimo.length === 1) {
    if (previo!.length < MAX) previo!.push(...grupos.pop()!);
    else ultimo.unshift(previo!.pop()!);
  }
  return grupos;
}

/** Agrupa en frases de 3–5 palabras, respetando el límite de línea y cortando preferentemente tras puntuación. Tiempos en segundos. */
export function agruparFrases(palabras: Palabra[]): Frase[] {
  const lineas = new Map<number, Palabra[]>();
  palabras.forEach((w) => lineas.set(w.linea, [...(lineas.get(w.linea) ?? []), w]));
  return [...lineas.values()].flatMap((l) => agruparLinea(l).map(crearFrase));
}

export const FRASES: Frase[] = agruparFrases(PALABRAS);
