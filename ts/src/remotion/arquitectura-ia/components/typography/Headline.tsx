import type { CSSProperties } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, DURATIONS, FONTS, SPRINGS, TYPE } from '../../constants/theme';
import { progress } from '../../lib/motion';

/**
 * Titular con entrada palabra por palabra (stagger corto, sube y se enfoca).
 * `\n` parte líneas. Las palabras de `accent` van en el color de acento.
 */
export function Headline({
  text,
  at,
  out,
  size = TYPE.headline,
  weight = 650,
  color = COLORS.text,
  accent = [],
  align = 'center',
  style,
}: {
  text: string;
  at: number;
  out?: number;
  size?: number;
  weight?: number;
  color?: string;
  accent?: string[];
  align?: 'left' | 'center';
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = out === undefined ? 0 : progress(frame, out, DURATIONS.fadeOut);
  let index = 0;

  return (
    <div
      style={{
        fontFamily: FONTS.sans,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '-0.035em',
        lineHeight: 1.04,
        color,
        textAlign: align,
        opacity: 1 - o,
        filter: `blur(${o * 4}px)`,
        ...style,
      }}
    >
      {text.split('\n').map((line, li) => (
        <div key={li}>
          {line.split(' ').map((word, wi) => {
            const p = spring({
              frame: frame - at - index++ * DURATIONS.stagger,
              fps,
              config: SPRINGS.soft,
            });
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  marginRight: '0.24em',
                  opacity: Math.min(1, p),
                  transform: `translateY(${(1 - p) * 0.28 * size}px)`,
                  filter: `blur(${(1 - Math.min(1, p)) * 8}px)`,
                  color: accent.includes(word) ? COLORS.accent : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
