// Registro de composiciones (ADR-0009). Dos vistas del mismo spec completo de @olyasuharska
// (18 captions + 31 overlays + style + narrative):
//   - SpecComposition: captions/overlays sobre el fondo del mundo de color (sin video).
//   - SpecOverVideo: lo mismo ENCIMA del mp4 fuente (public/source.mp4, gitignored).
// El spec completo vive en src/fixtures/ como fixture de render; el golden sigue en /fixtures.

import { Composition, staticFile } from 'remotion';

import fullSpecJson from '../fixtures/olyasuharska.full.json';
import { extractPresets } from './presets';
import { SpecComposition } from './SpecComposition';
import type { SpecCompositionProps, VideoSpec } from './types';

const spec = fullSpecJson as unknown as VideoSpec;
const presets = extractPresets(spec);
const s = spec.source;
const durationInFrames = Math.max(1, Math.round((s.durationMs / 1000) * s.fps));

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SpecComposition"
        component={SpecComposition}
        width={s.width}
        height={s.height}
        fps={s.fps}
        durationInFrames={durationInFrames}
        defaultProps={{ spec, presets, videoSrc: null } satisfies SpecCompositionProps}
      />
      <Composition
        id="SpecOverVideo"
        component={SpecComposition}
        width={s.width}
        height={s.height}
        fps={s.fps}
        durationInFrames={durationInFrames}
        defaultProps={
          { spec, presets, videoSrc: staticFile('source.mp4') } satisfies SpecCompositionProps
        }
      />
    </>
  );
};
