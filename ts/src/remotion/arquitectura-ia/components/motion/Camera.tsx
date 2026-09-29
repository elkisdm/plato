import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

import { HEIGHT, WIDTH } from '../../constants/timings';
import type { CameraPose } from '../../lib/motion';

/**
 * Cámara 2D: pone el punto (x, y) del mundo en el centro del canvas con el
 * zoom dado. Todo lo que va dentro usa coordenadas del mundo.
 */
export function Camera({ pose, children }: { pose: CameraPose; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${pose.zoom}) translate(${-pose.x}px, ${-pose.y}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}

/** Pose en reposo: el mundo coincide con el canvas. */
export const REST_POSE: CameraPose = { x: WIDTH / 2, y: HEIGHT / 2, zoom: 1 };
