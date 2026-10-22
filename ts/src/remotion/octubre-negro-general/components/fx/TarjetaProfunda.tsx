import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';

import { COLORS } from '../../constants/theme';
import { inclinacionTarjeta } from '../../lib/fx/tarjeta';

type Props = {
  children: ReactNode;
  /** Desfasa la respiración de esta tarjeta (usa un número distinto por tarjeta). Por defecto 0. */
  fase?: number;
  /** Color del borde luminoso. Por defecto turquesa. */
  color?: string;
  /** Radio del borde en px. Por defecto 28. */
  radio?: number;
  style?: CSSProperties;
};

/**
 * Tarjeta con profundidad: inclinación 3D (perspective + rotateX/Y ≤ 8°) que respira sola y reacciona al shake
 * de la cámara, sombra proyectada, borde luminoso y un brillo que se desplaza con la inclinación.
 * El tamaño y la posición los fija el padre vía `style`.
 */
export const TarjetaProfunda = ({ children, fase = 0, color = COLORS.accent, radio = 28, style }: Props) => {
  const frame = useCurrentFrame();
  const { rotX, rotY } = inclinacionTarjeta(frame, fase);
  return (
    <div style={{ perspective: 1000, ...style }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          background: `linear-gradient(160deg, ${COLORS.surfaceRaised}, ${COLORS.surface})`,
          border: `2px solid ${color}88`,
          borderRadius: radio,
          boxShadow: `0 ${30 - rotX * 2}px 60px rgba(0,0,0,0.5), 0 0 36px ${color}33, inset 0 0 0 1px rgba(255,255,255,0.06)`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${50 + rotY * 5}% ${30 - rotX * 5}%, rgba(255,255,255,0.10), transparent 55%)`,
            pointerEvents: 'none',
          }}
        />
        {children}
      </div>
    </div>
  );
};
