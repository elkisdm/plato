/**
 * E03 · Verifica (línea 2). Mi agente consulta una pila de AVISOS OFICIALES; algunas fichas pasan a
 * turquesa (VERIFICADO) y el resto queda gris. "no se sostiene" tacha el chip `48 h`. Golpe:
 * "diecinueve" → cae la ficha `19 OCT · OVHcloud` antes del marcador INICIO DE LA CUENTA.
 * Cierra con `usar ≠ estar afectado` y `depende de tu versión`.
 */

import { AbsoluteFill, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { EqualityGlyph } from '../../arquitectura-ia/components/typography/EqualityGlyph';
import { AgenteNodo } from '../components/AgenteNodo';
import { FichasLista, type EstadoFicha } from '../components/FichasLista';
import {
  COLORS,
  FONTS,
  FPS,
  H,
  SPACING,
  SPRINGS,
  W,
  WARN,
  WARN_GLOW,
  WARN_WASH,
} from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { MARGEN_LATERAL_FICHAS } from '../lib/fichas27';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 2;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const Y_AGENTE = 290;
const X_AGENTE = 310;
const X_PILA = 790;
const Y_GRID = 470;
const Y_LEYENDA = 700;
const Y_48 = 800;
const Y_LINEA = 1130;
const X_MARCADOR = 640;
const Y_TARJETA = 1290;
const Y_DEPENDE = 1450;

/** Fichas que el agente confirma en los avisos (fijas, sin azar). El resto queda sin verificar. */
const VERIFICADAS = new Set([1, 4, 5, 9, 12, 16, 20, 23]);

export const E03Verifica = (_: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tAgente = ancla('agente');
  const tAvisos = ancla('avisos');
  const tVarios = ancla('Varios');
  const tReales = ancla('reales.');
  const tCuarenta = ancla('cuarenta');
  const tNo = ancla('no');
  const tSostiene = ancla('sostiene.');
  const tReporto = ancla('reportó');
  const golpe = ancla('diecinueve,');
  const tAntes = ancla('antes');
  const tUsar = ancla('usar');
  const tDepende = ancla('depende');

  const build = (desde: number) => spring({ frame: frame - desde, fps, config: SPRINGS.build });
  const kGolpe = rebote(frame, golpe, FPS);
  const tachado = entre(frame, tNo, tNo + 10);
  const kMarcador = rebote(frame, tAntes, FPS);

  const estado = (i: number): EstadoFicha => {
    const t = tVarios + i;
    const p = entre(frame, t, t + 8);
    const destino = VERIFICADAS.has(i) ? COLORS.accent : COLORS.idle;
    const verificada = VERIFICADAS.has(i);
    return {
      borde: interpolateColors(p, [0, 1], [WARN, destino]),
      fondo: verificada ? interpolateColors(p, [0, 1], [WARN_WASH, COLORS.accentWash]) : 'transparent',
      opacidad: verificada ? 0.4 + 0.6 * p : 0.4 - 0.1 * p + 0.0,
      brillo: verificada ? p : 0,
      brilloColor: COLORS.accentGlow,
    };
  };

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line
          x1={X_AGENTE + 190 + 10}
          y1={Y_AGENTE}
          x2={X_AGENTE + 190 + 10 + 110 * entre(frame, tAvisos + 4, tAvisos + 18)}
          y2={Y_AGENTE}
          stroke={COLORS.accent}
          strokeWidth={3}
          strokeDasharray="10 10"
        />
        <line
          x1={120}
          x2={120 + 840 * entre(frame, tReporto, tReporto + 20)}
          y1={Y_LINEA}
          y2={Y_LINEA}
          stroke={COLORS.borderStrong}
          strokeWidth={4}
        />
        <line
          x1={X_MARCADOR}
          x2={X_MARCADOR}
          y1={Y_LINEA - 70}
          y2={Y_LINEA + 70}
          stroke={COLORS.text}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="1 0"
          opacity={entrada(frame, tAntes, 4)}
          transform={`translate(0 ${(1 - Math.min(1, kMarcador)) * -40})`}
        />
      </svg>

      <AgenteNodo x={X_AGENTE} y={Y_AGENTE} build={build(tAgente)} />

      {[16, 8, 0].map((dy, n) => (
        <div
          key={dy}
          style={{
            position: 'absolute',
            left: X_PILA - 170 + n * 6,
            top: Y_AGENTE - 58 - dy,
            width: 340 - n * 12,
            height: 116,
            boxSizing: 'border-box',
            borderRadius: SPACING.radius,
            border: `2px solid ${COLORS.borderStrong}`,
            background: COLORS.surface,
            opacity: entrada(frame, tAvisos + n * 3, 8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.mono,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: COLORS.text,
          }}
        >
          {n === 2 ? 'AVISOS OFICIALES' : ''}
        </div>
      ))}

      <FichasLista variante="compacta" x0={MARGEN_LATERAL_FICHAS} y0={Y_GRID} estado={estado} />

      <div
        style={{
          position: 'absolute',
          left: 120,
          width: 840,
          top: Y_LEYENDA,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.04em',
          opacity: entrada(frame, tReales, 8),
        }}
      >
        <span style={{ color: COLORS.accent }}>■ VERIFICADO</span>
        <span style={{ color: COLORS.textMuted }}>■ SIN VERIFICAR</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 120,
          top: Y_48,
          width: 270,
          boxSizing: 'border-box',
          padding: '8px 0',
          textAlign: 'center',
          borderRadius: SPACING.radius,
          border: `3px solid ${WARN}`,
          background: WARN_WASH,
          fontFamily: FONTS.mono,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          color: WARN,
          opacity: entrada(frame, tCuarenta, 5),
        }}
      >
        48 h
        <svg
          width={270}
          height={100}
          viewBox="0 0 270 100"
          style={{ position: 'absolute', left: -3, top: -3 }}
        >
          <line
            x1={6}
            y1={50}
            x2={264}
            y2={50}
            stroke={COLORS.text}
            strokeWidth={7}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - tachado}
          />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 430,
          top: Y_48 + 22,
          fontFamily: FONTS.sans,
          fontSize: 52,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: WARN,
          opacity: entrada(frame, tSostiene, 8),
        }}
      >
        NO SE SOSTIENE
      </div>

      <div
        style={{
          position: 'absolute',
          left: 130,
          top: Y_LINEA - 20 - 100,
          width: 440,
          boxSizing: 'border-box',
          padding: '18px 0',
          textAlign: 'center',
          borderRadius: SPACING.radius,
          border: `3px solid ${WARN}`,
          background: COLORS.surface,
          boxShadow: `0 0 40px ${WARN_GLOW}`,
          fontFamily: FONTS.mono,
          fontSize: 38,
          fontWeight: 800,
          color: WARN,
          opacity: entrada(frame, golpe, 3),
          transform: `translateY(${(1 - kGolpe) * -70}px) rotate(${(1 - kGolpe) * -3}deg) scale(${1 + (1 - kGolpe) * 0.18})`,
        }}
      >
        19 OCT · OVHcloud
      </div>
      <div
        style={{
          position: 'absolute',
          left: X_MARCADOR - 200,
          width: 400,
          top: Y_LINEA + 84,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: COLORS.text,
          opacity: entrada(frame, tAntes + 4, 8),
        }}
      >
        INICIO DE LA CUENTA
      </div>

      <div
        style={{
          position: 'absolute',
          left: 120,
          top: Y_TARJETA,
          width: 840,
          height: 130,
          boxSizing: 'border-box',
          borderRadius: SPACING.radius + 6,
          border: `2px solid ${COLORS.borderStrong}`,
          background: COLORS.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          fontFamily: FONTS.sans,
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: COLORS.text,
          opacity: entrada(frame, tUsar, 8),
          transform: `translateY(${(1 - entrada(frame, tUsar, 8)) * 16}px)`,
        }}
      >
        <span>usar</span>
        <EqualityGlyph resolve={0} size={72} />
        <span>estar afectado</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_DEPENDE,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: WARN,
          opacity: entrada(frame, tDepende, 8),
          transform: `translateY(${(1 - entrada(frame, tDepende, 8)) * 12}px)`,
        }}
      >
        depende de tu versión
      </div>
    </AbsoluteFill>
  );
};
