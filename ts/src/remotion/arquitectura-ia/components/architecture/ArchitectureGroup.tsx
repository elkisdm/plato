import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import type { Box } from '../../lib/geometry';

/**
 * Región que agrupa módulos (TanStack: Query + Router + Table + Start).
 * Borde punteado que se abre desde el centro y etiqueta en la esquina.
 */
export function ArchitectureGroup({
  box,
  build,
  label,
}: {
  box: Box;
  build: number;
  label: string;
}) {
  const b = Math.min(1, Math.max(0, build));
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x - box.width / 2,
        top: box.y - box.height / 2,
        width: box.width,
        height: box.height,
        borderRadius: SPACING.radius + 8,
        border: `1.5px dashed ${COLORS.borderStrong}`,
        background: COLORS.accentWash,
        opacity: b,
        transform: `scale(${0.94 + 0.06 * b})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: -16,
          padding: '4px 12px',
          borderRadius: 6,
          background: COLORS.bg,
          border: `1px solid ${COLORS.accent}`,
          fontFamily: FONTS.mono,
          fontSize: TYPE.micro,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: COLORS.accent,
        }}
      >
        {label}
      </div>
    </div>
  );
}
