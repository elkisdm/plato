import { useCurrentFrame } from 'remotion';

import { Reveal } from '../../arquitectura-ia/components/motion/Reveal';
import { COLORS, FONTS, SPACING, TYPE, WARN, WARN_WASH } from '../constants/theme';
import { fsMinimo } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';

const COLUMNAS = 9;
const TOTAL = 27;
const CELDA = 80;
const HUECO = 10;
/** Las 3 fichas que sobreviven (las que le tocan a quien construye con IA). */
const ELEGIDAS = [4, 13, 22];

/**
 * La cuadrícula de 27 fichas: ámbar hasta `golpe`; ahí 24 se apagan y 3 pasan a turquesa con rebote.
 */
export const TresRejilla = ({ entra, golpe }: { entra: number; golpe: number }) => {
  const frame = useCurrentFrame();
  const apaga = entrada(frame, golpe, 12);
  const k = rebote(frame, golpe, 30);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNAS}, ${CELDA}px)`,
        gap: HUECO,
      }}
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const elegida = ELEGIDAS.includes(i);
        const aparece = entrada(frame, entra + (i % COLUMNAS) * 1.5, 10);
        return (
          <div
            key={i}
            style={{
              height: CELDA,
              borderRadius: SPACING.radiusSmall,
              border: `2px solid ${elegida && apaga > 0 ? COLORS.accent : WARN}`,
              background: elegida && apaga > 0 ? COLORS.accentWash : WARN_WASH,
              opacity: aparece * (elegida ? 1 : 1 - 0.82 * apaga),
              boxShadow: elegida && apaga > 0 ? `0 0 ${32 * k}px ${COLORS.accentGlow}` : 'none',
              transform: elegida ? `scale(${1 + 0.1 * k})` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

/** Tarjeta de una de las 3 fichas: número, qué es y qué revisar. */
export const TresTarjeta = ({
  at,
  numero,
  titulo,
  detalle,
}: {
  at: number;
  numero: string;
  titulo: string;
  detalle: string;
}) => (
  <Reveal at={at}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        padding: '34px 40px',
        borderRadius: SPACING.radius,
        border: `1px solid ${COLORS.accent}`,
        background: COLORS.surface,
        boxShadow: `0 0 36px ${COLORS.accentGlow}`,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(TYPE.title),
          color: COLORS.accent,
          letterSpacing: '0.06em',
        }}
      >
        {numero}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: TYPE.headline - 10,
            fontWeight: 650,
            letterSpacing: '-0.03em',
            color: COLORS.text,
          }}
        >
          {titulo}
        </span>
        <span style={{ fontFamily: FONTS.mono, fontSize: fsMinimo(TYPE.caption), color: COLORS.textMuted }}>
          {detalle}
        </span>
      </div>
    </div>
  </Reveal>
);
