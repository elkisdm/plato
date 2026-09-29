/**
 * Timeline del video "Arquitectura > Código" (LinkedIn 4:5).
 *
 * Duraciones en frames a 30 fps; suman exactamente 60 s. Cada escena se monta
 * con OVERLAP frames extra al final para que la siguiente entre encima y la
 * continuidad (palabra → nodo, Astro → APP, sistema → latencia) sea física,
 * no un corte.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;
export const OVERLAP = 15;

export type SceneId =
  | 'intro'
  | 'astro'
  | 'next'
  | 'tanstack'
  | 'multistack'
  | 'latency'
  | 'criteria'
  | 'outro';

export const SCENES: readonly { id: SceneId; duration: number }[] = [
  { id: 'intro', duration: 180 },
  { id: 'astro', duration: 195 },
  { id: 'next', duration: 190 },
  { id: 'tanstack', duration: 190 },
  { id: 'multistack', duration: 360 },
  { id: 'latency', duration: 270 },
  { id: 'criteria', duration: 215 },
  { id: 'outro', duration: 200 },
];

export const TOTAL_FRAMES = SCENES.reduce((acc, s) => acc + s.duration, 0);

/** Ventana de montaje de una escena: inicio absoluto y duración con solape. */
export function sceneWindow(id: SceneId): { from: number; duration: number } {
  let from = 0;
  for (const [i, s] of SCENES.entries()) {
    if (s.id === id) {
      const isLast = i === SCENES.length - 1;
      return { from, duration: s.duration + (isLast ? 0 : OVERLAP) };
    }
    from += s.duration;
  }
  throw new Error(`Escena desconocida: ${id}`);
}
