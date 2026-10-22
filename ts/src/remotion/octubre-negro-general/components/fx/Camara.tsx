import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { transformCamara } from '../../lib/fx/camara';
import { GOLPES_CAMARA, type Golpe } from '../../lib/fx/golpes';

type Props = {
  children: ReactNode;
  /** Golpes de impacto que sacuden la cámara. Por defecto `GOLPES_CAMARA`. */
  golpes?: Golpe[];
};

/**
 * Cámara: envuelve las escenas con empuje lento (1.00→1.045 por escena), deriva mínima y shake por golpe.
 * Tope de escala 1.06 desde el centro: el contenido a escala 1 (x 120–960) nunca sale del lienzo.
 */
export const Camara = ({ children, golpes = GOLPES_CAMARA }: Props) => {
  const frame = useCurrentFrame();
  const t = transformCamara(frame, undefined, golpes);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rot}deg) scale(${t.scale})`,
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
