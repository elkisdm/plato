import type { CSSProperties, ReactNode } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { DURATIONS, SPRINGS } from '../../constants/theme';
import { progress } from '../../lib/motion';

/**
 * Entrada física (sube, se enfoca, aparece) en `at` y salida en `out`.
 * Frames locales a la escena.
 */
export function Reveal({
  at,
  out,
  rise = 18,
  style,
  children,
}: {
  at: number;
  out?: number;
  rise?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: SPRINGS.soft });
  const o = out === undefined ? 0 : progress(frame, out, DURATIONS.fadeOut);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p) * (1 - o),
        transform: `translateY(${(1 - p) * rise - o * rise * 0.6}px)`,
        filter: `blur(${(1 - Math.min(1, p)) * 6 + o * 4}px)`,
      }}
    >
      {children}
    </div>
  );
}
