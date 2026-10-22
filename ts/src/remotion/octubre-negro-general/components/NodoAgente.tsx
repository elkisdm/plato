import { interpolate } from 'remotion';

import { NodeIcon } from '../../arquitectura-ia/components/architecture/NodeIcon';
import { COLORS, FONTS, SPACING, TYPE } from '../constants/theme';
import { fsMinimo } from '../lib/layout';

type Props = {
  /** Centro del nodo en el lienzo. */
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
  /** Construcción 0..1 (la escena la saca de un spring). */
  build: number;
  /** Color del borde. */
  borde?: string;
};

/** Nodo «Mi agente». Solo texto e icono propio. */
export const NodoAgente = ({
  x,
  y,
  ancho = 380,
  alto = 116,
  build,
  borde = COLORS.borderStrong,
}: Props) => {
  const b = Math.min(1, Math.max(0, build));
  return (
    <div
      style={{
        position: 'absolute',
        left: x - ancho / 2,
        top: y - alto / 2,
        width: ancho,
        height: alto,
        boxSizing: 'border-box',
        borderRadius: SPACING.radius,
        border: `2px solid ${borde}`,
        background: COLORS.surface,
        boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 26px',
        opacity: b,
        transform: `translateY(${interpolate(b, [0, 1], [10, 0])}px) scale(${0.96 + 0.04 * b})`,
      }}
    >
      <NodeIcon type="agent" color={COLORS.accent} />
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: fsMinimo(TYPE.title - 6),
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: COLORS.text,
          whiteSpace: 'nowrap',
        }}
      >
        Mi agente
      </span>
    </div>
  );
};
