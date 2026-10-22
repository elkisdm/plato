/**
 * Puntos de sincronía para diseño sonoro y voz en off.
 *
 * El video no lleva audio en esta versión: estos markers son el contrato para
 * montarlo después (en Remotion con <Audio> o en la mezcla con ffmpeg). Los
 * frames son ABSOLUTOS; cada cue se declara relativo a su escena para que
 * sobreviva a un reajuste de la timeline.
 */

import { SCENES, sceneWindow, type SceneId } from './timings';

export type SoundCueType = 'click' | 'tick' | 'whoosh' | 'connect' | 'confirm';

export interface SoundCue {
  frame: number;
  type: SoundCueType;
  note: string;
}

const at = (scene: SceneId, local: number) => sceneWindow(scene).from + local;

export const SOUND_CUES: SoundCue[] = (
  [
    [at('intro', 12), 'click', 'aparece la primera frase'],
    [at('intro', 58), 'whoosh', 'ARQUITECTURA > CÓDIGO'],
    [at('intro', 88), 'tick', 'CÓDIGO se reduce'],
    [at('intro', 165), 'connect', 'la palabra se vuelve nodo'],
    [at('astro', 30), 'connect', 'Usuario → Astro'],
    [at('astro', 50), 'connect', 'Astro → HTML'],
    [at('astro', 100), 'tick', 'islas JS'],
    [at('next', 40), 'connect', 'primera responsabilidad'],
    [at('next', 150), 'confirm', 'auth valida'],
    [at('tanstack', 0), 'whoosh', 'paneo horizontal'],
    [at('tanstack', 110), 'tick', 'módulos se acoplan'],
    [at('multistack', 45), 'click', 'No eliges uno.'],
    [at('multistack', 80), 'whoosh', 'la cámara se abre'],
    [at('multistack', 110), 'connect', 'fuentes → leads'],
    [at('multistack', 205), 'connect', 'agentes'],
    [at('multistack', 250), 'confirm', 'sistema completo'],
    [at('latency', 25), 'whoosh', 'los servidores se separan'],
    [at('latency', 70), 'tick', 'SELECT viaja'],
    [at('latency', 180), 'whoosh', 'los servidores se acercan'],
    [at('latency', 205), 'confirm', 'compute cerca de los datos'],
    [at('criteria', 95), 'click', 'pregunta 1'],
    [at('criteria', 123), 'click', 'pregunta 2'],
    [at('criteria', 151), 'click', 'pregunta 3'],
    [at('criteria', 179), 'click', 'pregunta 4'],
    [at('outro', 60), 'tick', '≠ se vuelve ='],
    [at('outro', 120), 'confirm', 'repo'],
  ] as const
)
  .map(([frame, type, note]) => ({ frame, type, note }))
  .sort((a, b) => a.frame - b.frame);

/** Un marker por escena para alinear la voz en off (si se graba). */
export const VO_MARKERS = SCENES.map((s) => ({ frame: sceneWindow(s.id).from, scene: s.id }));
