import { interpolate, interpolateColors, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import { NODE_DEFAULTS, type ArchitectureNodeSpec } from '../../diagram/types';
import { NodeIcon } from './NodeIcon';

export interface NodeVisuals {
  /** Construcción 0..1 (spring): el borde se traza, luego el relleno y el texto. */
  build: number;
  /** 1 = presente; menos = atenuado al fondo. */
  emphasis?: number;
  /** 0..1: halo de acento sutil. */
  glow?: number;
  /** null = sin status; 0..1 = gris → verde. */
  status?: number | null;
  /** 0..1: late un 3 % (llegada de datos). */
  bump?: number;
  /** Procesando: tres puntos. */
  busy?: boolean;
  /** 0..1: check pequeño de validación. */
  check?: number;
  /** Etiqueta anterior para transformar un nodo en otro (Astro → APP). */
  previous?: { label: string; subtitle?: string };
  /** 0..1: avance de previous → etiqueta actual. */
  swap?: number;
}

/**
 * Nodo de arquitectura. No "aparece": el contorno se dibuja, el cuerpo se
 * llena y el contenido se asienta, todo en función de `build`.
 */
export function ArchitectureNode({
  node,
  build,
  emphasis = 1,
  glow = 0,
  status = null,
  bump = 0,
  busy = false,
  check = 0,
  previous,
  swap = 1,
}: { node: ArchitectureNodeSpec } & NodeVisuals) {
  const frame = useCurrentFrame();
  const w = node.width ?? NODE_DEFAULTS.width;
  const h = node.height ?? NODE_DEFAULTS.height;
  const b = Math.max(0, build);
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const draw = interpolate(b, [0, 0.6], [0, 1], clamp);
  const fill = interpolate(b, [0.3, 0.8], [0, 1], clamp);
  const content = interpolate(b, [0.5, 1], [0, 1], clamp);
  const scale = 0.96 + 0.04 * b + 0.03 * bump;
  const iconColor = glow > 0.3 ? COLORS.accent : COLORS.textMuted;
  const labelSize = h < 76 ? TYPE.small + 2 : TYPE.label;

  const texts = (label: string, subtitle: string | undefined, opacity: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity, minWidth: 0 }}>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: labelSize,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: COLORS.text,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE.micro - 1,
            letterSpacing: '0.06em',
            color: glow > 0.3 ? COLORS.accentSoft : COLORS.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: node.x - w / 2,
        top: node.y - h / 2,
        width: w,
        height: h,
        opacity: (b > 0 ? 1 : 0) * emphasis,
        transform: `translateY(${(1 - Math.min(1, b)) * 10}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: SPACING.radius,
          background: COLORS.surface,
          opacity: fill,
          boxShadow: `0 18px 40px rgba(0,0,0,0.35), 0 0 ${28 * glow}px ${COLORS.accentGlow}`,
        }}
      />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <rect
          x={0.75}
          y={0.75}
          width={w - 1.5}
          height={h - 1.5}
          rx={SPACING.radius}
          fill="none"
          stroke={interpolateColors(glow, [0, 1], [COLORS.borderStrong, COLORS.accent])}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 22px',
          opacity: content,
          transform: `translateY(${(1 - content) * 6}px)`,
        }}
      >
        <NodeIcon type={node.type} color={iconColor} />
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {previous && swap < 1 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              {texts(previous.label, previous.subtitle, 1 - swap)}
            </div>
          )}
          {texts(node.label, node.subtitle, previous ? swap : 1)}
        </div>
      </div>
      {status !== null && check < 0.05 && (
        <div
          style={{
            position: 'absolute',
            right: 14,
            top: 14,
            width: 10,
            height: 10,
            borderRadius: 5,
            opacity: content,
            background: interpolateColors(status, [0, 1], [COLORS.idle, COLORS.accent]),
            boxShadow: `0 0 ${10 * status}px ${COLORS.accentGlow}`,
          }}
        />
      )}
      {check > 0 && (
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          style={{ position: 'absolute', right: 10, top: 10 }}
        >
          <path
            d="M3.5 9.5l3.5 3.5 7-8"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - check}
          />
        </svg>
      )}
      {busy && (
        <div style={{ position: 'absolute', right: 16, bottom: 12, display: 'flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: COLORS.accent,
                opacity: 0.3 + 0.7 * Math.max(0, Math.sin((frame - i * 4) * 0.35)),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
