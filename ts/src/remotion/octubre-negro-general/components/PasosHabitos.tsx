import type { ReactNode } from 'react';
import { interpolateColors, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../constants/theme';
import { fsMinimo } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';

const FILA_ALTO = 230;
const ESPACIO = 36;
const Y_BASE = 130;

type Paso = { texto: ReactNode; icono: 'lupa' | 'llave' | 'flecha'; entra: number };

type Props = {
  pasos: [Paso, Paso, Paso];
  /** Frame del golpe «alcanza»: las tres filas se marcan con check turquesa. */
  alcanza: number;
};

const Icono = ({ tipo, color }: { tipo: Paso['icono']; color: string }) => {
  const trazo = {
    stroke: color,
    strokeWidth: 7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {tipo === 'lupa' && (
        <>
          <circle cx="41" cy="41" r="24" {...trazo} />
          <path d="M60 60l22 22" {...trazo} />
        </>
      )}
      {tipo === 'llave' && (
        <>
          <circle cx="29" cy="48" r="17" {...trazo} />
          <path d="M46 48h38M70 48v14M82 48v10" {...trazo} />
        </>
      )}
      {tipo === 'flecha' && <path d="M48 84V16M20 42l28-28 28 28" {...trazo} />}
    </svg>
  );
};

const Fila = ({
  paso,
  numero,
  alcanza,
  y,
}: {
  paso: Paso;
  numero: number;
  alcanza: number;
  y: number;
}) => {
  const frame = useCurrentFrame();
  const aparece = entrada(frame, paso.entra, 14);
  const marcada = rebote(frame, alcanza + (numero - 1) * 6, FPS);
  const hecho = Math.min(1, marcada);
  const color = interpolateColors(hecho, [0, 1], [COLORS.textMuted, COLORS.accent]);
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        width: '100%',
        height: FILA_ALTO,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '0 36px',
        borderRadius: 24,
        border: `3px solid ${interpolateColors(hecho, [0, 1], [COLORS.borderStrong, COLORS.accent])}`,
        background: interpolateColors(hecho, [0, 1], [COLORS.surface, COLORS.surfaceRaised]),
        opacity: aparece,
        transform: `translateX(${(1 - aparece) * 60}px)`,
        fontFamily: FONTS.sans,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          flexShrink: 0,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          background: hecho > 0.5 ? COLORS.accent : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(40),
          fontWeight: 700,
          color: COLORS.textMuted,
          transform: `scale(${1 + 0.25 * Math.sin(Math.PI * Math.min(1, hecho))})`,
        }}
      >
        {hecho > 0.5 ? (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M8 23l10 10 18-22"
              stroke={COLORS.bg}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          numero
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        <Icono tipo={paso.icono} color={color} />
      </div>
      <div
        style={{
          flex: 1,
          fontSize: fsMinimo(44),
          fontWeight: 700,
          lineHeight: 1.18,
          letterSpacing: '-0.015em',
          color: COLORS.text,
        }}
      >
        {paso.texto}
      </div>
    </div>
  );
};

/**
 * Lista de tres hábitos que entran con cada verbo; en `alcanza` las filas pasan a turquesa
 * con check y aparece un sello `ALCANZA`. Ocupa el ancho del contenedor (840 px).
 */
export const PasosHabitos = ({ pasos, alcanza }: Props) => {
  const frame = useCurrentFrame();
  const sello = rebote(frame, alcanza + 14, FPS);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {pasos.map((p, i) => (
        <Fila
          key={i}
          paso={p}
          numero={i + 1}
          alcanza={alcanza}
          y={Y_BASE + i * (FILA_ALTO + ESPACIO)}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: Y_BASE + 3 * (FILA_ALTO + ESPACIO) + 20,
          left: '50%',
          transform: `translateX(-50%) scale(${sello})`,
          opacity: Math.min(1, sello * 2),
          padding: '12px 36px',
          borderRadius: 999,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.accentWash,
          boxShadow: `0 0 36px ${COLORS.accentGlow}`,
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(40),
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: COLORS.accent,
        }}
      >
        ALCANZA
      </div>
    </div>
  );
};
