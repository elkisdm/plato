/**
 * E03 · Fuente (línea 2). Una balanza física: cae «TODO ES EL FIN DEL MUNDO» y la viga se inclina, se tacha con
 * un trazo; cae «TODO ES MENTIRA» y se inclina al otro lado, se tacha; con «noticia» oscila y se equilibra
 * (CON CALMA). «compartirla» → el interruptor COMPARTIR se desliza con rebote. Golpe: «dónde» → la lupa barre y
 * un haz de luz revela la ficha ¿FUENTE?, que se verifica con anillo y check (shake + destello + onda).
 */

import type { CSSProperties } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Balanza } from '../components/Balanza';
import { Fragmentos } from '../components/Fragmentos';
import { Lupa } from '../components/Lupa';
import { COLORS, FONTS, SPACING, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, normalizar, PALABRAS, palabra } from '../lib/alineacion';
import { fsMinimo } from '../lib/layout';
import { entrada, entre } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 2;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
/** n-ésima aparición (0 = primera) de una palabra dentro de la línea. */
const anclaN = (texto: string, n: number) =>
  aFrame(PALABRAS.filter((w) => w.linea === LINEA && normalizar(w.texto) === normalizar(texto))[n]!.inicio);

const Y_CALMA = 772;
const Y_INTERRUPTOR = 905;
const FUENTE = { x: 320, y: 1130, ancho: 440, alto: 130 };
const CENTRO_FUENTE = { x: FUENTE.x + FUENTE.ancho / 2, y: FUENTE.y + FUENTE.alto / 2 };
/** Posición de la lupa al aterrizar sobre la ficha. */
const LUPA_FIN = { x: CENTRO_FUENTE.x + 70, y: CENTRO_FUENTE.y - 10 };
const RADIO_LUPA = 54;

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

export const E03Fuente = ({ desde }: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tNi1 = anclaN('ni', 0);
  const tMundo = ancla('mundo,');
  const tNi2 = anclaN('ni', 1);
  const tMentira = ancla('mentira.');
  const tNoticia = ancla('noticia');
  const tAsustarte = ancla('asustarte');
  const tCompartirla = ancla('compartirla');
  const tSin = ancla('sin');
  const golpe = ancla('dónde');

  const calma = spring({ frame: frame - tNoticia, fps, config: { damping: 11, stiffness: 120 } });

  // Interruptor: entra con spring y se apaga deslizándose con rebote.
  const pop = spring({ frame: frame - tAsustarte, fps, config: { damping: 10, stiffness: 130 } });
  const desliza = spring({ frame: frame - (tCompartirla + 2), fps, config: { damping: 7, stiffness: 220, mass: 0.6 } });
  const apagado = frame >= tCompartirla + 2 ? desliza : 0;
  const mitad = apagado > 0.5;

  // Lupa: barre en zigzag desde la izquierda y aterriza sobre la ficha en el golpe.
  const p = entre(frame, tSin, golpe);
  const barre = frame >= tSin && frame <= golpe;
  const flota = frame > golpe ? 1 : 0;
  const lupa = barre
    ? {
        x: 150 + (LUPA_FIN.x - 150) * easeOut(p) + Math.sin(p * Math.PI * 3) * 70 * (1 - p),
        y: LUPA_FIN.y + Math.sin(p * Math.PI * 2.5) * 130 * (1 - p),
      }
    : { x: LUPA_FIN.x + flota * Math.sin(frame / 9) * 8, y: LUPA_FIN.y + flota * Math.cos(frame / 7) * 6 };
  const lupaVisible = frame >= tSin - 3;
  const k = spring({ frame: frame - golpe, fps, config: { damping: 8, stiffness: 150, mass: 0.7 } });
  const verificada = frame >= golpe;
  const colorFicha = verificada ? COLORS.accent : WARN;
  const radioReveal = verificada ? 170 + 900 * entre(frame, golpe, golpe + 8) : frame < tSin - 3 ? 0.01 : 170;
  const cx = lupa.x - FUENTE.x;
  const cy = lupa.y - FUENTE.y;
  const mascara = `radial-gradient(circle ${radioReveal}px at ${cx}px ${cy}px, #000 55%, transparent 100%)`;
  const check = entre(frame, golpe + 3, golpe + 13);

  const fichaEstilo: CSSProperties = {
    position: 'absolute',
    left: FUENTE.x,
    top: FUENTE.y,
    width: FUENTE.ancho,
    height: FUENTE.alto,
    boxSizing: 'border-box',
    borderRadius: SPACING.radius,
    border: `4px solid ${colorFicha}`,
    background: verificada ? COLORS.accentWash : WARN_WASH,
    boxShadow: `0 0 ${verificada ? 34 + 8 * Math.sin(frame / 8) : 18}px ${verificada ? COLORS.accentGlow : WARN_GLOW}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    fontFamily: FONTS.mono,
    fontSize: 54,
    fontWeight: 800,
    color: colorFicha,
    WebkitMaskImage: mascara,
    maskImage: mascara,
    opacity: frame < tSin - 3 ? 0 : 1,
    transform: `scale(${verificada ? 1 + 0.12 * Math.max(0, 1 - k) * 2 : 1})`,
  };

  // Cono de luz desde arriba a la derecha hasta el cristal de la lupa.
  const fuente = { x: lupa.x + 330, y: lupa.y - 340 };
  const lx = lupa.x - 6;
  const ly = lupa.y - 6;
  const luzOpacidad = lupaVisible ? 0.5 * (frame > golpe + 18 ? Math.max(0.25, 1 - (frame - golpe - 18) / 20) : 1) : 0;

  return (
    <AbsoluteFill>
      <Balanza desde={desde} tNi={[tNi1, tNi2]} tTachado={[tMundo, tMentira]} tCalma={tNoticia} />

      <div
        style={{
          position: 'absolute',
          left: W / 2 - 150,
          width: 300,
          top: Y_CALMA,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          letterSpacing: '0.1em',
          color: COLORS.accent,
          opacity: Math.min(1, calma * 1.5),
          transform: `translateY(${(1 - Math.min(1, calma)) * 18}px) scale(${0.9 + 0.1 * calma})`,
        }}
      >
        CON CALMA
      </div>

      {/* Interruptor COMPARTIR */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 230,
          top: Y_INTERRUPTOR,
          width: 460,
          height: 100,
          boxSizing: 'border-box',
          borderRadius: 50,
          border: `3px solid ${mitad ? COLORS.idle : WARN}`,
          background: COLORS.surface,
          boxShadow: mitad ? undefined : `0 0 ${14 + 8 * Math.sin(frame / 6)}px ${WARN_GLOW}`,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '0 26px',
          fontFamily: FONTS.mono,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: mitad ? COLORS.idle : COLORS.text,
          opacity: Math.min(1, pop * 2),
          transform: `scale(${0.7 + 0.3 * pop}) translateY(${(1 - Math.min(1, pop)) * 30}px)`,
        }}
      >
        <div style={{ position: 'relative', width: 92, height: 48, borderRadius: 24, background: mitad ? COLORS.idle : WARN, flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6 + (1 - apagado) * 44,
              width: 36,
              height: 36,
              borderRadius: 18,
              background: COLORS.bg,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          />
        </div>
        COMPARTIR
      </div>

      {/* Ficha ¿FUENTE?: hueco punteado hasta que la luz la revela */}
      <div
        style={{
          position: 'absolute',
          left: FUENTE.x,
          top: FUENTE.y,
          width: FUENTE.ancho,
          height: FUENTE.alto,
          boxSizing: 'border-box',
          borderRadius: SPACING.radius,
          border: `3px dashed ${COLORS.idle}`,
          opacity: entrada(frame, tAsustarte, 8) * 0.7,
        }}
      />
      <div style={fichaEstilo}>
        <svg width={46} height={46} viewBox="0 0 46 46" style={{ flexShrink: 0, opacity: check > 0 ? 1 : 0 }}>
          <path
            d="M7 24 L19 36 L40 10"
            pathLength={1}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - check}
          />
        </svg>
        ¿FUENTE?
      </div>

      {/* Haz de luz y lupa */}
      {lupaVisible ? (
        <>
          <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: luzOpacidad }}>
            <defs>
              <linearGradient id="haz-e03" x1={fuente.x} y1={fuente.y} x2={lx} y2={ly} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
                <stop offset="1" stopColor={verificada ? COLORS.accent : '#FFFFFF'} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <polygon points={`${fuente.x - 40},${fuente.y + 20} ${fuente.x + 40},${fuente.y - 20} ${lx + 90},${ly + 20} ${lx - 70},${ly - 60}`} fill="url(#haz-e03)" />
            <circle cx={lx} cy={ly} r={RADIO_LUPA * 2.4} fill={verificada ? COLORS.accentGlow : 'rgba(255,255,255,0.10)'} style={{ filter: 'blur(14px)' }} />
          </svg>
          <Lupa x={lupa.x} y={lupa.y} radio={RADIO_LUPA} color={colorFicha} relleno="rgba(9,13,15,0.25)" opacidad={Math.min(1, entre(frame, tSin - 3, tSin + 3))} />
        </>
      ) : null}

      {/* Anillo de verificación y chispas */}
      {verificada ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: CENTRO_FUENTE.x - 260,
              top: CENTRO_FUENTE.y - 260,
              width: 520,
              height: 520,
              borderRadius: '50%',
              border: `6px solid ${COLORS.accent}`,
              opacity: Math.max(0, 1 - entre(frame, golpe, golpe + 14)) * 0.8,
              transform: `scale(${0.3 + 0.7 * entre(frame, golpe, golpe + 14)})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: CENTRO_FUENTE.x - 300,
              top: CENTRO_FUENTE.y - 300,
              width: 600,
              height: 600,
              borderRadius: '50%',
              border: `3px dashed ${COLORS.accent}`,
              opacity: 0.35,
              transform: `rotate(${(frame - golpe) * 3}deg)`,
            }}
          />
        </>
      ) : null}
      <Fragmentos inicio={golpe} x={CENTRO_FUENTE.x} y={CENTRO_FUENTE.y} color={COLORS.accent} semilla="e03-fuente" cantidad={18} velocidad={20} gravedad={0.5} />
    </AbsoluteFill>
  );
};
