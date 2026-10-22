import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../constants/theme';
import { rebote } from '../lib/motion';

const PALABRA = 'PARCHE';
const TAMANO = 200;
const ENTRE_LETRAS = 2;
/** Frames de un ciclo del loop de reposo (≈2,5 s). */
const CICLO = 75;

/**
 * La palabra clave gigante: entra letra por letra con rebote desde `golpe` y después
 * respira (escala y brillo) con un loop determinista que dura lo que dure la escena.
 */
export const CtaParche = ({ golpe }: { golpe: number }) => {
  const frame = useCurrentFrame();
  const entra = frame - (golpe + PALABRA.length * ENTRE_LETRAS);
  const onda = entra > 0 ? Math.sin((entra / CICLO) * Math.PI * 2) : 0;
  return (
    <div
      style={{
        display: 'flex',
        transform: `scale(${1 + 0.012 * onda})`,
        fontFamily: FONTS.sans,
        fontSize: TAMANO,
        fontWeight: 900,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: COLORS.accent,
        textShadow: `0 0 ${56 + 28 * onda}px ${COLORS.accentGlow}`,
      }}
    >
      {[...PALABRA].map((letra, i) => {
        const k = rebote(frame, golpe + i * ENTRE_LETRAS, FPS);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: Math.min(1, k * 2.5),
              transform: `translateY(${(1 - k) * 70}px) scale(${0.5 + 0.5 * k})`,
            }}
          >
            {letra}
          </span>
        );
      })}
    </div>
  );
};
