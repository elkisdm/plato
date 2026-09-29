import React from 'react';
import { staticFile } from 'remotion';

import { PaperBackground } from '../components/PaperBackground';
import { PaperCutout } from '../components/PaperCutout';
import { TwoTierText } from '../components/TwoTierText';

/**
 * Escena de ejemplo del sistema "papel que cobra vida": compone el lienzo
 * (PaperBackground), tipografía dirigida (TwoTierText) y un recorte que se
 * despega y respira (PaperCutout). Sirve de referencia de uso; las escenas
 * reales reemplazan el asset demo por recortes sourceados en public/.
 */
export const PaperScene = () => (
  <PaperBackground>
    <TwoTierText
      lines={[
        {
          text: 'desde que eres niño',
          tier: 'emphasis',
          position: { xNorm: 0.08, yNorm: 0.1 },
          align: 'left',
          enterAt: 8,
        },
        {
          text: 'y por fin',
          tier: 'connector',
          position: { xNorm: 0.92, yNorm: 0.25 },
          align: 'right',
          enterAt: 30,
        },
        {
          text: 'después de mil caídas',
          tier: 'emphasis',
          position: { xNorm: 0.92, yNorm: 0.3 },
          align: 'right',
          enterAt: 40,
        },
      ]}
    />
    <PaperCutout
      src={staticFile('cutout-demo.svg')}
      width={220}
      position={{ xNorm: 0.5, yNorm: 0.58 }}
      enterAt={12}
      lift={{ target: 0.85, durationInFrames: 27, easing: 'out-cubic' }}
      life={{
        amplitude: 0.65,
        bobHz: 0.33,
        tiltHz: 0.22,
        leanHz: 0.43,
        bobPx: 4,
        tiltDeg: 2,
        leanDeg: 1.4,
      }}
    />
  </PaperBackground>
);
