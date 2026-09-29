import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

import { OVERLAP } from '../../constants/timings';
import { EASE, progress } from '../../lib/motion';

type Enter = 'none' | 'fade' | 'panFromRight';
type Exit = 'none' | 'fade' | 'panLeft';

const PAN = 260;

/**
 * Envoltorio de escena: resuelve la entrada y la salida durante el solape con
 * la escena vecina. `duration` es la duración propia (sin el solape).
 */
export function SceneFrame({
  duration,
  enter = 'fade',
  exit = 'fade',
  children,
}: {
  duration: number;
  enter?: Enter;
  exit?: Exit;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const inP = enter === 'none' ? 1 : progress(frame, 0, OVERLAP);
  const outP = exit === 'none' ? 0 : progress(frame, duration, OVERLAP, EASE);

  const x =
    (enter === 'panFromRight' ? (1 - inP) * PAN : 0) + (exit === 'panLeft' ? -outP * PAN : 0);
  const opacity = interpolate(inP, [0, 1], [enter === 'none' ? 1 : 0, 1]) * (1 - outP);

  return (
    <AbsoluteFill style={{ opacity, transform: `translateX(${x}px)` }}>{children}</AbsoluteFill>
  );
}
