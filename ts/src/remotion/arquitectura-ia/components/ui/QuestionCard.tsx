import { interpolateColors } from 'remotion';

import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import { Reveal } from '../motion/Reveal';

/** Pregunta de criterio. `active` 0..1 la resalta mientras ilumina el sistema. */
export function QuestionCard({
  index,
  question,
  at,
  active,
}: {
  index: number;
  question: string;
  at: number;
  active: number;
}) {
  return (
    <Reveal at={at} rise={14}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '16px 24px',
          borderRadius: SPACING.radius,
          border: `1px solid ${interpolateColors(active, [0, 1], [COLORS.border, COLORS.accent])}`,
          background: interpolateColors(active, [0, 1], [COLORS.surface, COLORS.surfaceRaised]),
          boxShadow: `0 0 ${24 * active}px ${COLORS.accentWash}`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE.micro,
            color: interpolateColors(active, [0, 1], [COLORS.textMuted, COLORS.accent]),
            letterSpacing: '0.08em',
          }}
        >
          {String(index).padStart(2, '0')}
        </span>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: TYPE.label + 4,
            fontWeight: 550,
            letterSpacing: '-0.02em',
            color: interpolateColors(active, [0, 1], [COLORS.textMuted, COLORS.text]),
          }}
        >
          {question}
        </span>
      </div>
    </Reveal>
  );
}
