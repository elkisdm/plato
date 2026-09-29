import { useCurrentFrame } from 'remotion';

import { DURATIONS } from '../../constants/theme';
import type { Curve } from '../../lib/geometry';
import { progress } from '../../lib/motion';
import { Connection } from './Connection';

/** Conexión que se traza sola desde `at` durante `duration` frames. */
export function AnimatedConnection({
  curve,
  at,
  duration = DURATIONS.edgeDraw,
  direction,
  color,
  opacity,
}: {
  curve: Curve;
  at: number;
  duration?: number;
  direction?: 'one-way' | 'two-way';
  color?: string;
  opacity?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <Connection
      curve={curve}
      progress={progress(frame, at, duration)}
      direction={direction}
      color={color}
      opacity={opacity}
    />
  );
}
