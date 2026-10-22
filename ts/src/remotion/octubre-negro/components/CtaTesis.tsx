import { interpolateColors, useCurrentFrame } from 'remotion';

import { EqualityGlyph } from '../../arquitectura-ia/components/typography/EqualityGlyph';
import { COLORS, FONTS, TYPE } from '../constants/theme';
import { entre } from '../lib/motion';

const DURACION_CAMBIO = 18;

/**
 * Recuerdo de la tesis: "Construir con IA ≠ no revisar de dónde viene".
 * Desde `cambio` el ≠ pierde la barra y la frase pierde el "no": queda "revisar de dónde viene".
 */
export const CtaTesis = ({ cambio }: { cambio: number }) => {
  const frame = useCurrentFrame();
  const r = entre(frame, cambio, cambio + DURACION_CAMBIO);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: TYPE.headline - 6,
          fontWeight: 650,
          letterSpacing: '-0.035em',
          color: COLORS.text,
        }}
      >
        Construir con IA
      </span>
      <EqualityGlyph resolve={r} size={84} />
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: TYPE.title,
          fontWeight: 550,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          color: interpolateColors(r, [0, 1], [COLORS.textMuted, COLORS.accent]),
        }}
      >
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'bottom',
            overflow: 'hidden',
            lineHeight: 1.3,
            paddingRight: '0.28em',
            maxWidth: `${1.6 * (1 - r)}em`,
            opacity: 1 - Math.min(1, r * 2),
          }}
        >
          no
        </span>
        revisar de dónde viene
      </span>
    </div>
  );
};
