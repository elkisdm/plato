import type { CSSProperties } from 'react';

import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import { Reveal } from '../motion/Reveal';

/** Regla destacada: barra de acento a la izquierda, regla + subtexto. */
export function Callout({
  rule,
  detail,
  at,
  style,
}: {
  rule: string;
  detail: string;
  at: number;
  style?: CSSProperties;
}) {
  return (
    <Reveal at={at} rise={16} style={style}>
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '26px 30px',
          borderRadius: SPACING.radius,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
        }}
      >
        <div
          style={{
            width: 4,
            borderRadius: 2,
            background: COLORS.accent,
            boxShadow: `0 0 16px ${COLORS.accentGlow}`,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: TYPE.title,
              fontWeight: 650,
              letterSpacing: '-0.03em',
              color: COLORS.text,
            }}
          >
            {rule}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: FONTS.sans,
              fontSize: TYPE.small + 4,
              color: COLORS.textMuted,
            }}
          >
            {detail}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
