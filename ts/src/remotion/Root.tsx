// Registro de composiciones (ADR-0009). Cablea SpecComposition al spec de @olyasuharska
// (el golden, ya versionado) y extrae sus presets. Queda lista: solo falta pasar el mp4
// (poné el video en public/ y seteá videoSrc = staticFile("...") en los props).

import { Composition } from 'remotion';

import specJson from '../../../fixtures/olyasuharska/videospec-olyasuharska.json';
import { extractPresets } from './presets';
import { SpecComposition } from './SpecComposition';
import type { SpecCompositionProps, VideoSpec } from './types';

const spec = specJson as unknown as VideoSpec;
const presets = extractPresets(spec);

export const RemotionRoot = () => {
  return (
    <Composition
      id="SpecComposition"
      component={SpecComposition}
      // Fallback estático; calculateMetadata lo sobrescribe desde el spec.
      width={spec.source.width}
      height={spec.source.height}
      fps={spec.source.fps}
      durationInFrames={Math.max(1, Math.round((spec.source.durationMs / 1000) * spec.source.fps))}
      defaultProps={{ spec, presets, videoSrc: null } satisfies SpecCompositionProps}
      calculateMetadata={({ props }) => {
        const s = props.spec.source;
        return {
          width: s.width,
          height: s.height,
          fps: s.fps,
          durationInFrames: Math.max(1, Math.round((s.durationMs / 1000) * s.fps)),
        };
      }}
    />
  );
};
