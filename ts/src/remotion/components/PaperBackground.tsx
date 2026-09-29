import React from 'react';
import { AbsoluteFill } from 'remotion';

import { paperTokens } from '../paperTokens';

interface PaperBackgroundProps {
  children?: React.ReactNode;
}

/**
 * El lienzo del sistema "papel que cobra vida": papel crema (gradient radial),
 * grano de imprenta (feTurbulence estático — el papel impreso no "hierve") y
 * viñeta sutil en los bordes. Va detrás de todo en la escena; los hijos se
 * renderizan ENCIMA del grano y la viñeta.
 */
export const PaperBackground = ({ children }: PaperBackgroundProps) => {
  return (
    <AbsoluteFill style={{ background: paperTokens.paper.gradient }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${paperTokens.grain.dataUri}")`,
          backgroundRepeat: 'repeat',
          opacity: paperTokens.grain.opacity,
          mixBlendMode: paperTokens.grain.blend,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: paperTokens.vignette,
          pointerEvents: 'none',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
