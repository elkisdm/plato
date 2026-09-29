import type { CSSProperties } from 'react';

import { COLORS, FONTS, TYPE } from '../../constants/theme';
import { Reveal } from '../motion/Reveal';

/** Texto secundario: una idea, pocas palabras. `\n` parte líneas. */
export function Caption({
  text,
  at,
  out,
  size = TYPE.caption,
  color = COLORS.textMuted,
  align = 'center',
  style,
}: {
  text: string;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
  style?: CSSProperties;
}) {
  return (
    <Reveal at={at} out={out} rise={12} style={style}>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: size,
          fontWeight: 450,
          letterSpacing: '-0.012em',
          lineHeight: 1.3,
          color,
          textAlign: align,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </Reveal>
  );
}
