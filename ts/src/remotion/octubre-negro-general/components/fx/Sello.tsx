import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS } from '../../constants/theme';
import { estadoSello, FRAME_IMPACTO_SELLO } from '../../lib/fx/efectos';
import { OndaChoque } from './OndaChoque';

type Props = {
  /** Texto del sello (en mayúsculas). */
  children: ReactNode;
  /** Frame global en que empieza a caer; golpea FRAME_IMPACTO_SELLO (6) frames después. */
  inicio: number;
  /** Color del borde, texto y onda. Por defecto turquesa. */
  color?: string;
  /** Giro final en grados. Por defecto -8. */
  rotacion?: number;
  /** Tamaño de letra en px (≥ 28). Por defecto 72. */
  fontSize?: number;
  /** Dibuja la onda de choque en el impacto. Por defecto true. */
  onda?: boolean;
  style?: CSSProperties;
};

/**
 * Sello (stamp): entra grande y girado, golpea en su sitio con rebote y suelta una onda de choque.
 * Posición: la decide el padre (el sello es inline-block); la onda nace en su centro.
 */
export const Sello = ({ children, inicio, color = COLORS.accent, rotacion = -8, fontSize = 72, onda = true, style }: Props) => {
  const frame = useCurrentFrame();
  const e = estadoSello(frame, inicio, rotacion);
  const dt = frame - inicio;
  const blur = dt >= 0 && dt < FRAME_IMPACTO_SELLO ? (FRAME_IMPACTO_SELLO - dt) * 0.9 : 0;
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div
        style={{
          transform: `rotate(${e.rot}deg) scale(${e.scale})`,
          opacity: e.opacity,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          border: `8px solid ${color}`,
          borderRadius: 18,
          padding: '8px 36px',
          color,
          fontFamily: FONTS.sans,
          fontWeight: 900,
          fontSize,
          letterSpacing: 6,
          lineHeight: 1.1,
          background: `${COLORS.bg}CC`,
          boxShadow: `0 0 0 3px ${COLORS.bg}, 0 0 40px ${color}55`,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
      {onda ? <OndaChoque inicio={inicio + FRAME_IMPACTO_SELLO} color={color} tamano={560} duracion={16} grosor={10} /> : null}
    </div>
  );
};
