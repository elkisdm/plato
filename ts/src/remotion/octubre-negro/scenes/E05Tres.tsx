import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { TresRejilla, TresTarjeta } from '../components/TresFichas';
import { COLORS, FONTS, TYPE } from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { W_V, YINI_V } from '../lib/layout';
import { rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

/** Margen lateral seguro del brief (120 px). */
const LADO = 120;
const LINEA = 4;
const en = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
/** Golpe: "tres" apaga 24 fichas y enciende el 3 gigante. */
const TRES = en('tres');
const VARIABLES = en('variables');
const PARCHES = en('parches');
const HERRAMIENTAS = en('herramientas');

/** E05 (línea 4): de 27 fichas quedan 3; cada frase deja su tarjeta. */
export const E05Tres = ({ desde }: PropsEscena) => {
  const frame = useCurrentFrame();
  const k = rebote(frame, TRES, 30);
  return (
    <AbsoluteFill
      style={{
        top: YINI_V,
        left: LADO,
        width: W_V - LADO * 2,
        alignItems: 'center',
        gap: 36,
      }}
    >
      <TresRejilla entra={desde + 4} golpe={TRES} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, height: 270 }}>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: 300,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: COLORS.accent,
            textShadow: `0 0 60px ${COLORS.accentGlow}`,
            opacity: Math.min(1, k * 2.5),
            transform: `scale(${0.5 + 0.5 * k})`,
          }}
        >
          3
        </span>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: TYPE.title,
            fontWeight: 550,
            color: COLORS.textMuted,
            opacity: Math.min(1, k * 2.5),
          }}
        >
          de 27 te tocan
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        <TresTarjeta at={VARIABLES} numero="01" titulo="Railway" detalle="variables de entorno" />
        <TresTarjeta at={PARCHES} numero="02" titulo="Node y PHP" detalle="parches" />
        <TresTarjeta at={HERRAMIENTAS} numero="03" titulo="Lo que ejecutas" detalle="¿de dónde salió?" />
      </div>
    </AbsoluteFill>
  );
};
