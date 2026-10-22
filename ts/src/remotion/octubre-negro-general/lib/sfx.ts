/**
 * Plan de sonido del reel: eventos de efectos y curva de volumen (ducking) de la música.
 *
 * Todos los frames salen de la alineación de la voz (`aFrame(palabra(...).inicio)`) o de las ventanas de
 * `lineaTiempo`; nunca hay números a mano salvo desfases pequeños respecto de un ancla (≤ 20 frames).
 * Cada efecto va anclado al cuadro exacto de su golpe visual (los anclajes son los mismos de las escenas).
 */

import { FPS } from '../constants/theme';
import { aFrame, finLinea, normalizar, PALABRAS, palabra } from './alineacion';
import { DURACION, ESCENAS } from './lineaTiempo';

/** Carpeta de los efectos dentro de `public/`. */
export const DIR_SFX = 'octubre-negro-general/sfx';

/** Duración real (s) de cada efecto, medida con ffprobe. Los risers deben empezar esta duración antes de su golpe. */
export const DURACION_SFX: Record<string, number> = {
  'alerta_1.mp3': 1.2,
  'cerrojo_1.mp3': 1.6,
  'check_1.mp3': 1.0,
  'glitch_1.mp3': 0.6,
  'glitch_2.mp3': 0.6,
  'impacto_fuerte_1.mp3': 1.48,
  'impacto_fuerte_2.mp3': 1.48,
  'impacto_suave_1.mp3': 0.8,
  'impacto_suave_2.mp3': 0.8,
  'impacto_suave_3.mp3': 0.8,
  'llaves_1.mp3': 1.36,
  'pop_1.mp3': 0.48,
  'pop_2.mp3': 0.48,
  'riser_1.mp3': 1.0,
  'riser_2.mp3': 1.0,
  'shimmer_1.mp3': 1.48,
  'shimmer_2.mp3': 1.48,
  'tick_1.mp3': 0.48,
  'tick_2.mp3': 0.48,
  'tick_3.mp3': 0.48,
  'whoosh_corto_1.mp3': 0.48,
  'whoosh_corto_2.mp3': 0.48,
  'whoosh_corto_3.mp3': 0.48,
  'whoosh_largo_1.mp3': 1.0,
  'whoosh_largo_2.mp3': 1.0,
};

export type EfectoSfx = {
  /** Frame global en que arranca el archivo. */
  frame: number;
  archivo: string;
  /** Volumen 0–1. */
  volumen: number;
  /** Frames de adelanto (negativo) o retraso respecto del ancla, ya incluidos en `frame`. */
  desfase?: number;
  /** Golpe visual al que corresponde (documentación). */
  golpe: string;
};

/** Pesos de volumen por tipo: impactos arriba, ticks abajo. */
const V = {
  impactoFuerte: 0.3,
  impactoSuave: 0.4,
  riser: 0.3,
  llaves: 0.4,
  cerrojo: 0.45,
  whoosh: 0.3,
  whooshLargo: 0.35,
  pop: 0.35,
  glitch: 0.35,
  alerta: 0.35,
  shimmer: 0.3,
  check: 0.3,
  tick: 0.25,
};

/** Frame del inicio de una palabra de la línea; `n` = aparición (0 = primera) si se repite. */
const en = (texto: string, linea: number, n = 0): number => {
  const buscada = normalizar(texto);
  const coincide = PALABRAS.filter((w) => w.linea === linea && normalizar(w.texto) === buscada);
  const p = coincide[n] ?? palabra(texto, linea);
  return aFrame(p.inicio);
};

/** Un whoosh de transición entra 3 frames antes del corte de cada escena (variantes rotadas). */
const WHOOSH_TRANSICION = ['whoosh_corto_2.mp3', 'whoosh_corto_3.mp3', 'whoosh_corto_1.mp3'];
const ANTICIPO_WHOOSH = 3;

const rd = (n: number): number => Math.round(n);
const dur = (archivo: string): number => rd(DURACION_SFX[archivo]! * FPS);

const ef = (
  frame: number,
  archivo: string,
  volumen: number,
  golpe: string,
  desfase?: number,
): EfectoSfx => ({ frame, archivo, volumen, golpe, ...(desfase === undefined ? {} : { desfase }) });

/** Riser de 1 s que TERMINA en `golpeFrame`. */
const riser = (archivo: string, golpeFrame: number, golpe: string): EfectoSfx =>
  ef(golpeFrame - dur(archivo), archivo, V.riser, golpe, -dur(archivo));

function construir(): EfectoSfx[] {
  const lista: EfectoSfx[] = [];
  const add = (...e: EfectoSfx[]) => lista.push(...e);

  // Línea 0 · gancho
  const lista0 = en('lista', 0);
  const g27 = en('veintisiete', 0);
  add(ef(lista0 - ANTICIPO_WHOOSH, 'whoosh_corto_1.mp3', V.whoosh, 'entrada de la lista', -ANTICIPO_WHOOSH));
  // El conteo del 27 sube durante los 18 frames previos a la palabra y cae sobre ella:
  // los ticks (cada 3 frames) anticipan el golpe, que va anclado al cuadro de «veintisiete».
  for (let k = 6; k >= 1; k--) {
    add(ef(g27 - k * 3, 'tick_1.mp3', V.tick, 'conteo del 27', -k * 3));
  }
  add(ef(g27, 'impacto_fuerte_1.mp3', V.impactoFuerte, 'aterriza el 27'));
  add(ef(en('cuarenta', 0), 'pop_1.mp3', V.pop, '48 h'));
  add(ef(en('agente', 0), 'shimmer_1.mp3', V.shimmer, 'Mi agente'));
  add(ef(en('revisara.', 0), 'impacto_suave_1.mp3', V.impactoSuave, 'sello REVISAR'));

  // Línea 1 · mezcla (la entrada de escena va en las transiciones)
  const reales = en('reales.', 1);
  // Máx. 4 fichas REAL sonando, escalonadas 3 frames, y un brillo al cerrar el grupo.
  (['pop_2.mp3', 'tick_2.mp3', 'pop_2.mp3', 'tick_2.mp3'] as const).forEach((a, i) => {
    add(ef(reales + i * 3, a, a.startsWith('pop') ? V.pop : V.tick, `ficha REAL ${i + 1}`, i * 3));
  });
  add(ef(reales + 9, 'shimmer_2.mp3', V.shimmer, 'fichas REAL encendidas', 9));
  const exag = en('exageraciones.', 1);
  add(ef(exag, 'glitch_1.mp3', V.glitch, 'exageraciones'));
  add(ef(exag, 'alerta_1.mp3', V.alerta, 'exageraciones'));
  const reportado = en('reportado', 1);
  add(ef(reportado, 'impacto_suave_2.mp3', V.impactoSuave, 'cae la ficha 19 OCT'));
  add(ef(reportado - ANTICIPO_WHOOSH, 'whoosh_corto_2.mp3', V.whoosh, 'cruce de la ficha 19 OCT', -ANTICIPO_WHOOSH));

  // Línea 2 · fuente
  for (const t of ['mundo,', 'mentira.']) {
    const f = en(t, 2);
    add(ef(f, 'whoosh_corto_3.mp3', V.whoosh, `tachado «${t}»`));
    add(ef(f, 'tick_2.mp3', V.tick, `tachado «${t}»`));
  }
  add(ef(en('compartirla', 2) + 6, 'tick_3.mp3', V.tick, 'se apaga COMPARTIR', 6));
  const donde = en('dónde', 2);
  add(ef(donde - 8, 'whoosh_largo_1.mp3', V.whooshLargo, 'barrido de la lupa', -8));
  add(ef(donde, 'check_1.mp3', V.check, 'fuente verificada'));
  add(ef(donde, 'shimmer_1.mp3', V.shimmer, 'fuente verificada'));

  // Línea 3 · casa
  const pasa = en('pasa', 3);
  add(ef(pasa, 'alerta_1.mp3', V.alerta, 'a la casa le pasa algo'));
  add(ef(en('arreglarla.', 3), 'glitch_2.mp3', V.glitch, 'herramienta tachada'));
  const tusLlaves = en('tus', 3, 2);
  add(ef(tusLlaves, 'llaves_1.mp3', V.llaves, 'llaves nuevas'));
  add(ef(tusLlaves + 10, 'check_1.mp3', V.check, 'llaves encajan', 10));

  // Línea 4 · puerta. El riser termina en «cierra», donde cae el cerrojo; el brillo llega cuando la puerta
  // termina de cerrarse (14 frames) y el candado hace click.
  const cierra = en('cierra', 4);
  add(riser('riser_1.mp3', cierra, 'cierra la puerta'));
  add(ef(cierra, 'cerrojo_1.mp3', V.cerrojo, 'portazo y cerrojo'));
  add(ef(cierra + 14, 'shimmer_2.mp3', V.shimmer, 'candado turquesa', 14));

  // Línea 5 · tres pasos
  add(ef(en('Verifica', 5), 'pop_1.mp3', V.pop, 'paso 1'));
  add(ef(en('cambia', 5), 'pop_2.mp3', V.pop, 'paso 2'));
  add(ef(en('actualiza.', 5), 'pop_1.mp3', V.pop, 'paso 3'));
  const alcanza = en('alcanza.', 5);
  for (let i = 0; i < 3; i++) add(ef(alcanza + i * 4, 'check_1.mp3', V.check, `check ${i + 1}`, i * 4));
  add(ef(alcanza, 'shimmer_1.mp3', V.shimmer, 'barrido de brillo'));
  add(ef(alcanza + 10, 'impacto_suave_3.mp3', V.impactoSuave, 'sello ALCANZA', 10));

  // Línea 6 · CTA. Riser_2 termina en PARCHE y cae el impacto.
  const parche = en('PARCHE', 6);
  add(riser('riser_2.mp3', parche, 'PARCHE'));
  add(ef(parche, 'impacto_fuerte_2.mp3', V.impactoFuerte, 'cae PARCHE'));
  const sigueme = en('sígueme', 6);
  add(ef(sigueme - 6, 'whoosh_largo_2.mp3', V.whooshLargo, 'sube el bloque', -6));
  add(ef(sigueme, 'pop_1.mp3', V.pop, 'entra SÍGUEME'));
  add(ef(sigueme + 6, 'shimmer_2.mp3', V.shimmer, 'botón seguir', 6));

  // Transiciones de escena: un whoosh por corte (líneas 1–6)
  ESCENAS.slice(1).forEach((e, i) => {
    const a = WHOOSH_TRANSICION[i % WHOOSH_TRANSICION.length]!;
    add(ef(e.desde - ANTICIPO_WHOOSH, a, V.whoosh, `transición a ${e.id}`, -ANTICIPO_WHOOSH));
  });

  return lista.sort((a, b) => a.frame - b.frame);
}

export const EFECTOS: EfectoSfx[] = construir();

/* ------------------------------------------------------------------ música */

/*
 * Ajuste tras medir la mezcla (brief: 0,20 / 0,14 / 0,35): con esos valores la música quedaba ~35 dB bajo
 * la voz, inaudible. Se suben a 0,28 / 0,20 / 0,45 (cama ~16 dB bajo la voz) y se compensa el nivel
 * integrado con VOLUMEN_VOZ.
 */
export const MUSICA_BASE = 0.28;
export const MUSICA_HABLA = 0.2;
export const MUSICA_ARRANQUE = 0.45;

/**
 * Ganancia de la voz. Su pico en PARCHE es −1,1 dBFS: subirla (1,2 dio +0,1 dBFS) satura al coincidir con el
 * impacto, así que se deja por debajo de 1 y el nivel se logra con efectos y música.
 */
export const VOLUMEN_VOZ = 0.95;

/** Primer 0,6 s de música a volumen alto, luego baja. */
const ARRANQUE = aFrame(0.6);
/** Último segundo tras la voz con la música arriba. */
const COLA_ALTA = FPS;
/** Una pausa de la voz menor a esto cuenta como "sigue hablando". */
const PAUSA_MIN = 12;
/** Frames de la rampa entre "habla" y "pausa". */
const RAMPA = 6;
/** Fundido final de la música (frames). */
const FUNDIDO_FINAL = 45;

const FIN_VOZ = aFrame(finLinea(ESCENAS.length - 1));

/** Tramos [inicio, fin] en frames donde la voz está sonando (pausas cortas unidas). */
const TRAMOS_VOZ: [number, number][] = (() => {
  const tramos: [number, number][] = [];
  for (const w of PALABRAS) {
    const ini = aFrame(w.inicio);
    const fin = aFrame(w.fin);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ini - ultimo[1] < PAUSA_MIN) ultimo[1] = Math.max(ultimo[1], fin);
    else tramos.push([ini, fin]);
  }
  return tramos;
})();

const lerp = (x: number, x0: number, x1: number, y0: number, y1: number): number => {
  const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
  return y0 + (y1 - y0) * t;
};

/** Volumen (0–1) de la música en el frame global `frame`, con ducking bajo la voz. */
export function volumenMusica(frame: number): number {
  const distancia = Math.min(
    ...TRAMOS_VOZ.map(([ini, fin]) => (frame < ini ? ini - frame : frame > fin ? frame - fin : 0)),
  );
  let v = lerp(distancia, 0, RAMPA, MUSICA_HABLA, MUSICA_BASE);

  // Arranque: alta el primer 0,6 s y baja suave.
  v = Math.max(v, lerp(frame, ARRANQUE, ARRANQUE + 12, MUSICA_ARRANQUE, 0));
  // Cola: sube al terminar la voz, se mantiene un segundo y vuelve a la base.
  const subida = lerp(frame, FIN_VOZ, FIN_VOZ + 8, 0, 1);
  const bajada = lerp(frame, FIN_VOZ + COLA_ALTA, FIN_VOZ + COLA_ALTA + 15, 1, 0);
  v = Math.max(v, MUSICA_ARRANQUE * Math.min(subida, bajada));

  return v * lerp(frame, DURACION - FUNDIDO_FINAL, DURACION, 1, 0);
}
