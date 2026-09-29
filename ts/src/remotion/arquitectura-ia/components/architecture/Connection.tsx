import { COLORS } from '../../constants/theme';
import { curveLength, curvePath, tangentAt, type Curve, type Point } from '../../lib/geometry';

function Arrowhead({ at, dir, color }: { at: Point; dir: Point; color: string }) {
  const angle = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;
  return (
    <path
      d="M -9 -6 L 0 0 L -9 6"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={`translate(${at.x} ${at.y}) rotate(${angle})`}
    />
  );
}

/**
 * Conexión estática entre dos nodos (va dentro de un <svg>). `progress` 0..1
 * controla cuánto de la línea está trazado (strokeDasharray/offset sobre la
 * longitud real de la curva); la punta de flecha aparece al completarse.
 */
export function Connection({
  curve,
  progress = 1,
  direction = 'one-way',
  color = COLORS.line,
  width = 1.6,
  opacity = 1,
}: {
  curve: Curve;
  progress?: number;
  direction?: 'one-way' | 'two-way';
  color?: string;
  width?: number;
  opacity?: number;
}) {
  if (progress <= 0) return null;
  const length = curveLength(curve);
  const headOpacity = Math.max(0, (progress - 0.9) / 0.1);
  const end = tangentAt(curve, 1);
  const start = tangentAt(curve, 0);
  return (
    <g opacity={opacity}>
      <path
        d={curvePath(curve)}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
      <g opacity={headOpacity}>
        <Arrowhead at={curve.p3} dir={end} color={color} />
        {direction === 'two-way' && (
          <Arrowhead at={curve.p0} dir={{ x: -start.x, y: -start.y }} color={color} />
        )}
      </g>
    </g>
  );
}
