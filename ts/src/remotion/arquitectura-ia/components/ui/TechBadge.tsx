import type { CSSProperties } from 'react';

import { COLORS, FONTS, TYPE } from '../../constants/theme';
import { Reveal } from '../motion/Reveal';

/** Etiqueta técnica pequeña (SEO, CACHE…), mono en mayúsculas. */
export function TechBadge({
  label,
  at,
  out,
  active = false,
  style,
}: {
  label: string;
  at: number;
  out?: number;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <Reveal at={at} out={out} rise={10} style={style}>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
          background: active ? COLORS.accentWash : COLORS.surface,
          fontFamily: FONTS.mono,
          fontSize: TYPE.micro,
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: active ? COLORS.accent : COLORS.textMuted,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </Reveal>
  );
}
