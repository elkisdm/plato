import { AbsoluteFill, interpolateColors, useCurrentFrame } from 'remotion';

import { Reveal } from '../../arquitectura-ia/components/motion/Reveal';
import { CtaParche } from '../components/CtaParche';
import { CtaTesis } from '../components/CtaTesis';
import { Onda } from '../components/Onda';
import { COLORS, FONTS, TYPE } from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { W_V, YFIN_V, YINI_V } from '../lib/layout';
import { entrada } from '../lib/motion';
import type { PropsEscena } from './tipos';

/** Margen lateral seguro del brief (120 px). */
const LADO = 120;
const LINEA = 6;
const en = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
const COMENTA = en('comenta');
/** Golpe: PARCHE entra letra por letra. */
const PARCHE = en('parche');
const PASO = en('paso');
const CLAUDE = en('claude');

/** E07 (línea 6): CTA. PARCHE golpea en "PARCHE"; en "Claude" el ≠ de la tesis se resuelve en =. */
export const E07Cta = ({ desde }: PropsEscena) => {
  const frame = useCurrentFrame();
  const colorClaude = interpolateColors(
    entrada(frame, CLAUDE, 8),
    [0, 1],
    [COLORS.text, COLORS.accent],
  );

  return (
    <AbsoluteFill
      style={{
        top: YINI_V,
        left: LADO,
        width: W_V - LADO * 2,
        height: YFIN_V - YINI_V,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Reveal at={desde + 4}>
        <CtaTesis cambio={CLAUDE} />
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <Reveal at={COMENTA}>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: TYPE.title,
              letterSpacing: '0.12em',
              color: COLORS.textMuted,
            }}
          >
            comenta
          </span>
        </Reveal>
        <CtaParche golpe={PARCHE} />
        <Reveal at={PASO}>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: TYPE.caption + 4,
              fontWeight: 500,
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              textAlign: 'center',
              color: COLORS.text,
            }}
          >
            te paso el prompt
            <br />
            para que <span style={{ color: colorClaude }}>Claude</span> revise
            <br />
            tus claves y tus versiones
          </div>
        </Reveal>
      </div>

      <Reveal at={COMENTA}>
        <Onda alto={110} ancho={600} barras={40} />
      </Reveal>
    </AbsoluteFill>
  );
};
