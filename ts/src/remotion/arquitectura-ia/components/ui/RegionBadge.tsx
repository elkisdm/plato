import { COLORS, FONTS, TYPE } from '../../constants/theme';

/**
 * Etiqueta geográfica de un servidor. `swap` 0..1 cambia de `previous` a
 * `region` (Supabase se muda de BRASIL a USA) con un cruce vertical.
 */
export function RegionBadge({
  region,
  previous,
  swap = 1,
  x,
  y,
  opacity = 1,
  highlight = 0,
}: {
  region: string;
  previous?: string;
  swap?: number;
  x: number;
  y: number;
  opacity?: number;
  highlight?: number;
}) {
  const color = highlight > 0.5 ? COLORS.accent : COLORS.textMuted;
  const word = (text: string, o: number, dy: number) => (
    <span style={{ position: 'absolute', left: 0, opacity: o, transform: `translateY(${dy}px)` }}>
      {text}
    </span>
  );
  const width = Math.max(region.length, previous?.length ?? 0) * 13 + 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px 6px 10px',
        borderRadius: 999,
        border: `1px solid ${highlight > 0.5 ? COLORS.accent : COLORS.border}`,
        background: COLORS.bg,
        opacity,
        fontFamily: FONTS.mono,
        fontSize: TYPE.micro,
        letterSpacing: '0.1em',
        color,
      }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16">
        <circle cx={8} cy={8} r={6.2} fill="none" stroke={color} strokeWidth={1.3} />
        <path
          d="M1.8 8h12.4M8 1.8c2 2 2 10.4 0 12.4M8 1.8c-2 2-2 10.4 0 12.4"
          fill="none"
          stroke={color}
          strokeWidth={1.1}
        />
      </svg>
      <span style={{ position: 'relative', width, height: 24, overflow: 'hidden' }}>
        {previous && swap < 1 && word(previous, 1 - swap, -swap * 20)}
        {word(region, previous ? swap : 1, previous ? (1 - swap) * 20 : 0)}
      </span>
    </div>
  );
}
