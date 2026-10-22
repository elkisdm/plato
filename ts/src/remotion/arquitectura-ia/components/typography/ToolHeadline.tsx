import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import { WIDTH } from '../../constants/timings';
import { progress } from '../../lib/motion';
import { Reveal } from '../motion/Reveal';
import { Headline } from './Headline';

/**
 * "Si <condición>" + flecha que se traza + herramienta en acento.
 * La flecha es SVG (el subset latin de Geist no trae →) y se dibuja con
 * strokeDashoffset antes de que llegue el nombre de la herramienta.
 */
export function ToolHeadline({
  condition,
  tool,
  at,
  out,
  top = 130,
}: {
  condition: string;
  tool: string;
  at: number;
  out?: number;
  top?: number;
}) {
  const frame = useCurrentFrame();
  const size = TYPE.headline;
  const draw = progress(frame, at + 10, 14);
  const arrowW = size * 1.1;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: SPACING.safeX,
        width: WIDTH - SPACING.safeX * 2,
      }}
    >
      <Headline text={condition} at={at} out={out} />
      <Reveal
        at={at + 16}
        out={out}
        rise={10}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}
      >
        <svg width={arrowW} height={size * 0.6} viewBox="0 0 66 40" style={{ overflow: 'visible' }}>
          <path
            d="M 2 20 H 60 M 44 6 L 60 20 L 44 34"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
        </svg>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: size,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: COLORS.accent,
            textShadow: `0 0 28px ${COLORS.accentGlow}`,
          }}
        >
          {tool}
        </span>
      </Reveal>
    </div>
  );
}
