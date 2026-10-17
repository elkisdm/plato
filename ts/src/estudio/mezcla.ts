import { interpolate } from 'remotion';
import { iniciosEscenas, inicioVoz, type Guion, type Voz } from './proyecto';
import { FPS } from './tema';

/**
 * Mezcla de audio: la música baja cuando habla la voz (ducking) y termina con su propio final.
 * La pista y su duración vienen del asset de música del proyecto (manifiesto).
 */

export const VOLUMEN = { sinVoz: 0.22, bajoVoz: 0.07 } as const;
const RAMPA = 10;
const FUNDIDO_ENTRADA = 30;
const FUNDIDO_SALIDA = 12;
/** Una pista cortada antes de su final necesita despedirse con un fundido largo. */
const FUNDIDO_CORTE = 75;

const fijar = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** [desde, hasta] de cada locución, en frames globales del video. */
export const tramosVoz = (guion: Guion, voz: Voz): [number, number][] => {
  const inicios = iniciosEscenas(guion, voz);
  return guion.escenas.flatMap((e, i) => {
    const s = voz[e.id]?.segundos ?? 0;
    if (s <= 0) return [];
    const desde = (inicios[i] ?? 0) + inicioVoz(e);
    return [[desde, desde + Math.ceil(s * FPS)] as [number, number]];
  });
};

/**
 * Frames que se saltan del inicio de la pista: por defecto, los necesarios para que su final natural
 * caiga en el cierre del video; con `desdeSegundo`, la pista entra desde ese punto (p. ej. para que un
 * drop coincida con una escena) y se corta al final con un fundido largo.
 */
export const inicioMusica = (
  segundosMusica: number,
  totalFrames: number,
  desdeSegundo?: number,
): number =>
  desdeSegundo === undefined
    ? Math.max(0, Math.round(segundosMusica * FPS) - totalFrames)
    : Math.round(desdeSegundo * FPS);

/** Volumen de la música en un frame: sube en las pausas y baja bajo la voz, con rampas suaves. */
export const volumenMusica = (
  frame: number,
  totalFrames: number,
  tramos: [number, number][],
  { corte = false }: { corte?: boolean } = {},
): number => {
  const salida = corte ? FUNDIDO_CORTE : FUNDIDO_SALIDA;
  const bajo = Math.max(
    0,
    ...tramos.map(([desde, hasta]) =>
      interpolate(frame, [desde - RAMPA, desde, hasta, hasta + RAMPA], [0, 1, 1, 0], fijar),
    ),
  );
  const base = VOLUMEN.sinVoz - (VOLUMEN.sinVoz - VOLUMEN.bajoVoz) * bajo;
  const bordes = interpolate(
    frame,
    [0, FUNDIDO_ENTRADA, totalFrames - salida, totalFrames],
    [0, 1, 1, 0],
    fijar,
  );
  return base * bordes;
};
