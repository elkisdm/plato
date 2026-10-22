import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, FONTS, SPRINGS, TYPE } from '../../constants/theme';
import { progress } from '../../lib/motion';

const ROW = 50;

/**
 * Acumulador de "+latencia": un chip por cada ida y vuelta completada y una
 * barra que crece. `clearAt` los colapsa cuando los servidores se acercan.
 */
export function LatencyIndicator({
  x,
  y,
  arrivals,
  clearAt,
}: {
  x: number;
  y: number;
  arrivals: number[];
  clearAt: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clear = progress(frame, clearAt, 14);
  const count = arrivals.filter((a) => frame >= a).length;
  const bar = spring({ frame: frame - (arrivals[count - 1] ?? 0), fps, config: SPRINGS.soft });
  const prevWidth = Math.max(0, count - 1) / arrivals.length;
  const width = count === 0 ? 0 : prevWidth + (count / arrivals.length - prevWidth) * bar;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 220, opacity: 1 - clear }}>
      {arrivals.map((a, i) => {
        const p = spring({ frame: frame - a, fps, config: SPRINGS.build });
        if (frame < a) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * ROW * (1 - clear),
              left: 0,
              opacity: Math.min(1, p),
              transform: `translateX(${(1 - p) * 18}px)`,
              fontFamily: FONTS.mono,
              fontSize: TYPE.small,
              fontWeight: 600,
              color: COLORS.accent,
              letterSpacing: '0.02em',
            }}
          >
            +latencia
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: arrivals.length * ROW + 6,
          left: 0,
          width: 220,
          height: 4,
          borderRadius: 2,
          background: COLORS.border,
          opacity: count > 0 ? 1 : 0,
        }}
      >
        <div
          style={{
            width: `${width * 100}%`,
            height: '100%',
            borderRadius: 2,
            background: COLORS.accent,
          }}
        />
      </div>
    </div>
  );
}
