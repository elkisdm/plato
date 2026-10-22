/**
 * E03 · Fuente (línea 2). Dos extremos tachados (TODO ES EL FIN DEL MUNDO en «ni», TODO ES MENTIRA en
 * el segundo «ni»); entre ambos, una línea con el punto en el centro. «compartirla» → un interruptor
 * COMPARTIR que se apaga. Golpe: «dónde» → una lupa sobre la ficha ¿FUENTE? que pasa a turquesa.
 */

import type { CSSProperties } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { Lupa } from '../components/Lupa';
import { COLORS, FONTS, FPS, SPACING, W, WARN, WARN_WASH } from '../constants/theme';
import { aFrame, normalizar, PALABRAS, palabra } from '../lib/alineacion';
import { ANCHO_V, fsMinimo, MARGEN_LATERAL } from '../lib/layout';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 2;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
/** n-ésima aparición (0 = primera) de una palabra dentro de la línea. */
const anclaN = (texto: string, n: number) =>
  aFrame(
    PALABRAS.filter((w) => w.linea === LINEA && normalizar(w.texto) === normalizar(texto))[n]!.inicio,
  );

const Y_A = 260;
const Y_EJE = 490;
const Y_B = 620;
const Y_INTERRUPTOR = 830;
const Y_FUENTE = 1030;
const ALTO_EXTREMO = 104;
const FUENTE = { x: 320, ancho: 440, alto: 130 };

const Extremo = ({
  y,
  texto,
  aparece,
  tachado,
}: {
  y: number;
  texto: string;
  aparece: number;
  tachado: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: MARGEN_LATERAL,
      top: y,
      width: ANCHO_V,
      height: ALTO_EXTREMO,
      boxSizing: 'border-box',
      borderRadius: SPACING.radius,
      border: `2px solid ${WARN}`,
      background: WARN_WASH,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONTS.sans,
      fontSize: 44,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: COLORS.text,
      opacity: aparece * (1 - 0.35 * tachado),
      transform: `translateY(${(1 - aparece) * 14}px)`,
    }}
  >
    {texto}
    <div
      style={{
        position: 'absolute',
        left: 28,
        width: (ANCHO_V - 56) * tachado,
        top: ALTO_EXTREMO / 2 - 3,
        height: 6,
        borderRadius: 3,
        background: WARN,
      }}
    />
  </div>
);

export const E03Fuente = (_: PropsEscena) => {
  const frame = useCurrentFrame();

  const tSea = ancla('sea,');
  const tNi1 = anclaN('ni', 0);
  const tMundo = ancla('mundo,');
  const tNi2 = anclaN('ni', 1);
  const tMentira = ancla('mentira.');
  const tNoticia = ancla('noticia');
  const tAsustarte = ancla('asustarte');
  const tCompartirla = ancla('compartirla');
  const tSin = ancla('sin');
  const tMirar = ancla('mirar');
  const golpe = ancla('dónde');

  const eje = entrada(frame, tSea, 10);
  const calma = entrada(frame, tNoticia, 8);
  const interruptor = entrada(frame, tAsustarte, 8);
  const apagado = entre(frame, tCompartirla, tCompartirla + 8);
  const ficha = entrada(frame, tSin, 8);
  const lupa = entre(frame, tMirar, golpe);
  const k = rebote(frame, golpe, FPS);
  const verificada = entrada(frame, golpe, 4);
  const colorFicha = verificada > 0.5 ? COLORS.accent : WARN;

  const fichaEstilo: CSSProperties = {
    position: 'absolute',
    left: FUENTE.x,
    top: Y_FUENTE,
    width: FUENTE.ancho,
    height: FUENTE.alto,
    boxSizing: 'border-box',
    borderRadius: SPACING.radius,
    border: `4px solid ${colorFicha}`,
    background: verificada > 0.5 ? COLORS.accentWash : WARN_WASH,
    boxShadow: `0 0 ${34 * verificada}px ${COLORS.accentGlow}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    fontFamily: FONTS.mono,
    fontSize: 54,
    fontWeight: 800,
    color: colorFicha,
    opacity: ficha,
    transform: `scale(${1 + 0.1 * Math.max(0, k)})`,
  };

  return (
    <AbsoluteFill>
      <Extremo
        y={Y_A}
        texto="TODO ES EL FIN DEL MUNDO"
        aparece={entrada(frame, tNi1, 8)}
        tachado={entre(frame, tMundo, tMundo + 10)}
      />

      <div
        style={{
          position: 'absolute',
          left: MARGEN_LATERAL,
          top: Y_EJE,
          width: ANCHO_V * eje,
          height: 4,
          borderRadius: 2,
          background: COLORS.line,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 24,
          top: Y_EJE - 22,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: calma > 0.5 ? COLORS.accent : COLORS.idle,
          boxShadow: `0 0 ${30 * calma}px ${COLORS.accentGlow}`,
          opacity: eje,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_EJE + 44,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          letterSpacing: '0.1em',
          color: COLORS.accent,
          opacity: calma,
        }}
      >
        CON CALMA
      </div>

      <Extremo
        y={Y_B}
        texto="TODO ES MENTIRA"
        aparece={entrada(frame, tNi2, 8)}
        tachado={entre(frame, tMentira, tMentira + 10)}
      />

      <div
        style={{
          position: 'absolute',
          left: W / 2 - 230,
          top: Y_INTERRUPTOR,
          width: 460,
          height: 100,
          boxSizing: 'border-box',
          borderRadius: 50,
          border: `3px solid ${apagado > 0.5 ? COLORS.idle : WARN}`,
          background: COLORS.surface,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '0 26px',
          fontFamily: FONTS.mono,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: apagado > 0.5 ? COLORS.idle : COLORS.text,
          opacity: interruptor,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 92,
            height: 48,
            borderRadius: 24,
            background: apagado > 0.5 ? COLORS.idle : WARN,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6 + (1 - apagado) * 44,
              width: 36,
              height: 36,
              borderRadius: 18,
              background: COLORS.bg,
            }}
          />
        </div>
        COMPARTIR
      </div>

      <div style={fichaEstilo}>
        <svg
          width={46}
          height={46}
          viewBox="0 0 46 46"
          style={{ opacity: verificada, flexShrink: 0 }}
        >
          <path
            d="M7 24 L19 36 L40 10"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        ¿FUENTE?
      </div>
      <Lupa
        x={FUENTE.x + FUENTE.ancho + 20 + (1 - lupa) * 70}
        y={Y_FUENTE - 14 + (1 - lupa) * 150}
        radio={46}
        color={colorFicha}
        relleno="rgba(9,13,15,0.35)"
        opacidad={ficha}
      />
    </AbsoluteFill>
  );
};
