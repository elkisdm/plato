import { COLORS } from '../../constants/theme';

/**
 * Signo ≠ que se vuelve =: la barra diagonal se retrae según `resolve` (0..1)
 * y el signo pasa del gris al acento. SVG porque Geist latin no trae ≠.
 */
export function EqualityGlyph({ resolve, size = 64 }: { resolve: number; size?: number }) {
  const color = resolve > 0.5 ? COLORS.accent : COLORS.textMuted;
  const slash = 1 - resolve;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <g stroke={color} strokeWidth={5} strokeLinecap="round">
        <line x1={12} y1={24} x2={52} y2={24} />
        <line x1={12} y1={40} x2={52} y2={40} />
        <line
          x1={32 - 12 * slash}
          y1={32 + 22 * slash}
          x2={32 + 12 * slash}
          y2={32 - 22 * slash}
          opacity={slash > 0.02 ? 1 : 0}
        />
      </g>
    </svg>
  );
}
