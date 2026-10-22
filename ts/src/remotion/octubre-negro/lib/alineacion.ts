/** Palabras y tiempos de la voz, derivados de la alineación por carácter de ElevenLabs. */

import { FPS } from '../constants/theme';
import alineacionJson from '../data/alineacion.json';

export type Palabra = { texto: string; inicio: number; fin: number; linea: number };

export type Alineacion = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

/** Corta por espacios; cada `\n` incrementa `linea`. Tiempos en segundos. */
export function palabrasDesdeAlineacion(al: Alineacion): Palabra[] {
  const palabras: Palabra[] = [];
  let linea = 0;
  let texto = '';
  let inicio = 0;
  let fin = 0;

  const cerrar = () => {
    if (texto) palabras.push({ texto, inicio, fin, linea });
    texto = '';
  };

  al.characters.forEach((c, i) => {
    if (c === '\n') {
      cerrar();
      linea += 1;
    } else if (/\s/.test(c)) {
      cerrar();
    } else {
      if (!texto) inicio = al.character_start_times_seconds[i] ?? 0;
      texto += c;
      fin = al.character_end_times_seconds[i] ?? fin;
    }
  });
  cerrar();
  return palabras;
}

export const PALABRAS: Palabra[] = palabrasDesdeAlineacion(alineacionJson as Alineacion);

/** Minúsculas y sin `¿?¡!.,…:"“”`; conserva tildes. */
export function normalizar(t: string): string {
  return t.toLowerCase().replace(/[¿?¡!.,…:"“”]/g, '');
}

/** Primera palabra que coincide (en esa línea si se da). Lanza si no existe: un cambio de guion rompe en test. */
export function palabra(texto: string, linea?: number): Palabra {
  const buscada = normalizar(texto);
  const p = PALABRAS.find(
    (w) => normalizar(w.texto) === buscada && (linea === undefined || w.linea === linea),
  );
  if (!p) {
    throw new Error(
      `Palabra no encontrada: ${texto}${linea === undefined ? '' : ` (línea ${linea})`}`,
    );
  }
  return p;
}

function deLinea(n: number): Palabra[] {
  const ps = PALABRAS.filter((w) => w.linea === n);
  if (ps.length === 0) throw new Error(`Línea no encontrada: ${n}`);
  return ps;
}

export const inicioLinea = (n: number): number => deLinea(n)[0]!.inicio;
export const finLinea = (n: number): number => {
  const ps = deLinea(n);
  return ps[ps.length - 1]!.fin;
};

export const aFrame = (seg: number, fps: number = FPS): number => Math.round(seg * fps);
