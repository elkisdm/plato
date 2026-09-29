import { COLORS, FONTS } from '../../constants/theme';
import { pointAtFraction, tangentAt, tAtFraction, type Curve } from '../../lib/geometry';

const TAIL = [0.03, 0.06, 0.09];

/**
 * Dato viajando por una conexión (va dentro de un <svg>). `at` es la fracción
 * de arco recorrida (0..1). Sin etiqueta: punto luminoso con estela corta.
 * Con etiqueta: paquete (SELECT, INSERT…) que se orienta con la línea.
 */
export function DataPulse({
  curve,
  at,
  label,
  reverse = false,
  opacity = 1,
}: {
  curve: Curve;
  at: number;
  label?: string;
  reverse?: boolean;
  opacity?: number;
}) {
  const f = reverse ? 1 - at : at;
  const p = pointAtFraction(curve, f);
  // Aparece y se apaga en los extremos para no "saltar" desde el nodo.
  const edgeFade = Math.min(1, at / 0.08, (1 - at) / 0.08);

  if (label) {
    const tan = tangentAt(curve, tAtFraction(curve, f));
    const flip = tan.x < 0;
    const angle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI + (flip ? 180 : 0);
    const w = label.length * 12.5 + 26;
    return (
      <g
        transform={`translate(${p.x} ${p.y}) rotate(${angle})`}
        opacity={opacity * Math.max(0.2, edgeFade)}
      >
        <rect
          x={-w / 2}
          y={-17}
          width={w}
          height={34}
          rx={8}
          fill={COLORS.surfaceRaised}
          stroke={COLORS.accent}
          strokeWidth={1.4}
        />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={FONTS.mono}
          fontSize={19}
          fontWeight={600}
          letterSpacing="0.04em"
          fill={COLORS.accent}
        >
          {label}
        </text>
      </g>
    );
  }

  return (
    <g opacity={opacity * edgeFade}>
      {TAIL.map((d, i) => {
        const tf = reverse ? f + d : f - d;
        if (tf < 0 || tf > 1) return null;
        const tp = pointAtFraction(curve, tf);
        return (
          <circle
            key={i}
            cx={tp.x}
            cy={tp.y}
            r={3.4 - i * 0.8}
            fill={COLORS.accent}
            opacity={0.5 - i * 0.14}
          />
        );
      })}
      <circle cx={p.x} cy={p.y} r={11} fill={COLORS.accent} opacity={0.16} />
      <circle cx={p.x} cy={p.y} r={4.6} fill={COLORS.accentSoft} />
    </g>
  );
}
