/**
 * "Arquitectura > Código" — video LinkedIn 4:5 (1080×1350, 30 fps, 60 s).
 * Motion design editorial + visualización de sistemas: la IA escribe código;
 * la arquitectura decide qué construir. Spec: docs/specs/arquitectura-ia-linkedin.md
 *
 * Cada escena se monta en su ventana (constants/timings) con solape para la
 * continuidad. Sin audio: los markers de sonido y voz están en soundCues.ts.
 */

import type { ComponentType } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';

import { GridBackground } from './components/ui/GridBackground';
import { SCENES, sceneWindow, type SceneId } from './constants/timings';
import { loadFonts } from './lib/fonts';
import { AstroScene } from './scenes/AstroScene';
import { CriteriaScene } from './scenes/CriteriaScene';
import { Intro } from './scenes/Intro';
import { LatencyScene } from './scenes/LatencyScene';
import { MultiStackScene } from './scenes/MultiStackScene';
import { NextScene } from './scenes/NextScene';
import { Outro } from './scenes/Outro';
import { TanStackScene } from './scenes/TanStackScene';

loadFonts();

const SCENE_COMPONENTS: Record<SceneId, ComponentType<{ duration: number }>> = {
  intro: Intro,
  astro: AstroScene,
  next: NextScene,
  tanstack: TanStackScene,
  multistack: MultiStackScene,
  latency: LatencyScene,
  criteria: CriteriaScene,
  outro: Outro,
};

export function ArquitecturaIA() {
  return (
    <AbsoluteFill>
      <GridBackground />
      {SCENES.map(({ id, duration }) => {
        const Scene = SCENE_COMPONENTS[id];
        const win = sceneWindow(id);
        return (
          <Sequence key={id} name={id} from={win.from} durationInFrames={win.duration}>
            <Scene duration={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
