/**
 * E01 · Gancho (línea 0). Tarjeta-lista propia (rayas, sin texto). Golpe: «veintisiete» → el 27
 * gigante en ámbar cuenta 0→27 con rótulo HACKEOS. «cuarenta» → chip 48 h. «agente» → nodo Mi agente
 * con una lupa que lo conecta a la lista. «revisara» → sello turquesa REVISAR.
 */

import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Lupa } from '../components/Lupa';
import { NodoAgente } from '../components/NodoAgente';
import {
  COLORS,
  FONTS,
  FPS,
  SPACING,
  SPRINGS,
  W,
  H,
  WARN,
  WARN_GLOW,
  WARN_WASH,
} from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { fsMinimo } from '../lib/layout';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 0;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const TARJETA = { x: 270, y: 260, ancho: 540, alto: 460 };
/** Anchos (0..1) de las rayas de la tarjeta-lista: fijos, sin azar. */
const RAYAS = [0.85, 0.62, 0.78, 0.5, 0.7, 0.9, 0.58];
const Y_NUMERO = 290;
const Y_CHIP = 830;
const Y_AGENTE = 1130;
const Y_SELLO = 1250;

export const E01Gancho = (_: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tLista = ancla('lista');
  const golpe = ancla('veintisiete');
  const tHackeos = ancla('hackeos');
  const tCuarenta = ancla('cuarenta');
  const tAgente = ancla('agente');
  const tRevisara = ancla('revisara.');

  const k = rebote(frame, golpe, FPS);
  const cuenta = Math.round(27 * entrada(frame, golpe, 20));
  const tarjeta = entrada(frame, tLista, 10);
  const atenuada = 1 - 0.7 * entre(frame, golpe, golpe + 8);
  const kChip = rebote(frame, tCuarenta, FPS);
  const kSello = rebote(frame, tRevisara, FPS);
  const build = spring({ frame: frame - tAgente, fps, config: SPRINGS.build });
  const enlace = entre(frame, tAgente + 4, tAgente + 20);
  const yLinea0 = Y_CHIP + 112;
  const yLinea1 = Y_AGENTE - 58;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 200,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(32),
          letterSpacing: '0.1em',
          color: COLORS.textMuted,
          opacity: entrada(frame, 0, 10),
        }}
      >
        LISTA VIRAL · SIN REVISAR
      </div>

      <div
        style={{
          position: 'absolute',
          left: TARJETA.x,
          top: TARJETA.y,
          width: TARJETA.ancho,
          height: TARJETA.alto,
          boxSizing: 'border-box',
          borderRadius: SPACING.radius + 6,
          background: COLORS.surface,
          border: `1.5px solid ${COLORS.borderStrong}`,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          opacity: Math.max(tarjeta, 0.01) * atenuada,
          transform: `translateY(${(1 - tarjeta) * 14}px)`,
        }}
      >
        {RAYAS.map((ancho, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `2px solid ${WARN}`,
                background: WARN_WASH,
                flexShrink: 0,
              }}
            />
            <div
              style={{ height: 14, borderRadius: 7, background: COLORS.idle, width: `${ancho * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_NUMERO,
          textAlign: 'center',
          fontFamily: FONTS.sans,
          fontSize: 440,
          fontWeight: 900,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: WARN,
          textShadow: `0 0 90px ${WARN_GLOW}`,
          opacity: entrada(frame, golpe, 4),
          transform: `scale(${0.7 + 0.3 * k})`,
        }}
      >
        {cuenta}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 750,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 52,
          letterSpacing: '0.12em',
          color: COLORS.text,
          opacity: entrada(frame, tHackeos, 8),
        }}
      >
        HACKEOS
      </div>

      <div
        style={{
          position: 'absolute',
          left: W / 2 - 150,
          top: Y_CHIP,
          width: 300,
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
          transform: `scale(${0.7 + 0.3 * kChip})`,
        }}
      >
        48 h
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line
          x1={W / 2}
          y1={yLinea0}
          x2={W / 2}
          y2={yLinea0 + (yLinea1 - yLinea0) * enlace}
          stroke={COLORS.line}
          strokeWidth={3}
          strokeDasharray="10 10"
        />
      </svg>
      <Lupa
        x={W / 2 - 14}
        y={(yLinea0 + yLinea1) / 2 - 8}
        radio={22}
        color={COLORS.accent}
        relleno={COLORS.bg}
        opacidad={enlace}
      />

      <NodoAgente x={W / 2} y={Y_AGENTE} build={build} />

      <div
        style={{
          position: 'absolute',
          left: W / 2 - 230,
          top: Y_SELLO,
          width: 460,
          boxSizing: 'border-box',
          padding: '16px 0',
          textAlign: 'center',
          borderRadius: SPACING.radiusSmall,
          border: `4px solid ${COLORS.accent}`,
          background: COLORS.bg,
          boxShadow: `0 0 34px ${COLORS.accentGlow}`,
          fontFamily: FONTS.mono,
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: COLORS.accent,
          opacity: entrada(frame, tRevisara, 4),
          transform: `translateY(${(1 - kSello) * -200}px) rotate(-4deg) scale(${1 + (1 - kSello) * 0.6})`,
        }}
      >
        REVISAR
      </div>
    </AbsoluteFill>
  );
};
