import type { ReactNode } from 'react';
import { interpolate } from 'remotion';

import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import type { Box } from '../../lib/geometry';

const BAR = 46;

/** Ventana de navegador que se construye (borde → barra → contenido). */
export function BrowserWindow({
  box,
  build,
  url,
  children,
}: {
  box: Box;
  build: number;
  url: string;
  children?: ReactNode;
}) {
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const b = Math.max(0, build);
  const draw = interpolate(b, [0, 0.6], [0, 1], clamp);
  const fill = interpolate(b, [0.3, 0.9], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x - box.width / 2,
        top: box.y - box.height / 2,
        width: box.width,
        height: box.height,
        opacity: b > 0 ? 1 : 0,
        transform: `translateY(${(1 - Math.min(1, b)) * 14}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: SPACING.radius + 4,
          background: COLORS.surface,
          opacity: fill,
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        }}
      />
      <svg width={box.width} height={box.height} style={{ position: 'absolute', inset: 0 }}>
        <rect
          x={0.75}
          y={0.75}
          width={box.width - 1.5}
          height={box.height - 1.5}
          rx={SPACING.radius + 4}
          fill="none"
          stroke={COLORS.borderStrong}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <line
          x1={0}
          x2={box.width * fill}
          y1={BAR}
          y2={BAR}
          stroke={COLORS.border}
          strokeWidth={1}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: BAR,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 18px',
          opacity: fill,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ width: 10, height: 10, borderRadius: 5, background: COLORS.idle }}
          />
        ))}
        <div
          style={{
            marginLeft: 16,
            padding: '4px 14px',
            borderRadius: 6,
            background: COLORS.surfaceRaised,
            fontFamily: FONTS.mono,
            fontSize: TYPE.micro - 2,
            color: COLORS.textMuted,
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: BAR }}>{children}</div>
    </div>
  );
}
