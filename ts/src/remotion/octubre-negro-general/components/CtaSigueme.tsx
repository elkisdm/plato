import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../constants/theme';
import { progresoSigueme } from '../lib/golpesFinales';
import { fsMinimo } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';

const PALABRA = 'PARCHE';
const TAMANO = 190;
const ENTRE_LETRAS = 2;
/** Escala final (texto mínimo 28 px: 56·0,6 ≈ 34) del bloque «comenta PARCHE» cuando entra «sígueme». */
const ESCALA_FINAL = 0.6;
/** Frames de un ciclo del pulso (≈2 s). */
const CICLO = 60;

type Props = {
  comenta: number;
  parche: number;
  paso: number;
  sigueme: number;
};

/**
 * Cierre de la serie dentro de un contenedor de 840 px: `comenta` + PARCHE gigante turquesa
 * letra por letra, «te paso una guía paso a paso» debajo y, en `sigueme`, el bloque se reduce
 * y sube para dar paso a SÍGUEME + @elkis.dev con un pulso suave. Solo texto y formas.
 */
export const CtaSigueme = ({ comenta, parche, paso, sigueme }: Props) => {
  const frame = useCurrentFrame();
  const p = progresoSigueme(frame, sigueme);
  const escala = 1 - (1 - ESCALA_FINAL) * p;
  const sube = -190 * p;
  const pulso = frame > sigueme + 18 ? Math.sin(((frame - sigueme - 18) / CICLO) * Math.PI * 2) : 0;
  const ent = entrada(frame, sigueme + 6, 14);
  const k = rebote(frame, sigueme + 6, FPS);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: FONTS.sans }}>
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26,
          transformOrigin: 'top center',
          transform: `translateY(${sube}px) scale(${escala})`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 56,
            letterSpacing: '0.12em',
            color: COLORS.textMuted,
            opacity: entrada(frame, comenta, 12),
          }}
        >
          comenta
        </span>
        <div
          style={{
            display: 'flex',
            fontSize: TAMANO,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: COLORS.accent,
            textShadow: `0 0 36px ${COLORS.accentGlow}`,
          }}
        >
          {[...PALABRA].map((letra, i) => {
            const r = rebote(frame, parche + i * ENTRE_LETRAS, FPS);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: Math.min(1, r * 2.5),
                  transform: `translateY(${(1 - r) * 70}px) scale(${0.5 + 0.5 * r})`,
                }}
              >
                {letra}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.015em',
            textAlign: 'center',
            color: COLORS.text,
            opacity: entrada(frame, paso, 14),
          }}
        >
          te paso una guía
          <br />
          paso a paso
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
          opacity: ent,
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: COLORS.text,
            transform: `scale(${0.7 + 0.3 * k})`,
          }}
        >
          SÍGUEME
        </div>
        <div
          style={{
            padding: '18px 48px',
            borderRadius: 999,
            border: `3px solid ${COLORS.accent}`,
            background: COLORS.accentWash,
            boxShadow: `0 0 ${24 + 10 * pulso}px ${COLORS.accentGlow}`,
            transform: `scale(${1 + 0.03 * pulso})`,
            fontFamily: FONTS.mono,
            fontSize: fsMinimo(64),
            fontWeight: 600,
            color: COLORS.accent,
          }}
        >
          @elkis.dev
        </div>
      </div>
    </div>
  );
};
