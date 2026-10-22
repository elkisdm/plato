import type { CSSProperties } from 'react';

import { COLORS, FONTS } from '../constants/theme';
import { CAJAS, CASA, ETIQUETAS_CAJAS } from '../lib/casaLlaves';
import { fsMinimo, W_V } from '../lib/layout';

type PropsCasa = {
  /** Color del contorno de la casa (ámbar durante el pulso). */
  borde: string;
  /** Intensidad 0..1 del brillo ámbar. */
  pulso: number;
  glow: string;
  wash: string;
  /** Aparición 0..1 de la casa y de cada caja fuerte. */
  casa: number;
  cajas: [number, number, number];
};

/** Casa ajena de formas simples con tres cajas fuertes rotuladas. */
export const Casa = ({ borde, pulso, glow, wash, casa, cajas }: PropsCasa) => {
  const cx = W_V / 2;
  return (
    <>
      <svg
        width={W_V}
        height={CASA.yCuerpo + 10}
        style={{ position: 'absolute', left: 0, top: 0, opacity: casa, overflow: 'visible' }}
      >
        <polygon
          points={`${CASA.x},${CASA.yCuerpo} ${cx},${CASA.yTecho} ${CASA.x + CASA.ancho},${CASA.yCuerpo}`}
          fill={pulso > 0.05 ? wash : COLORS.surface}
          stroke={borde}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CASA.x,
          top: CASA.yCuerpo,
          width: CASA.ancho,
          height: CASA.altoCuerpo,
          boxSizing: 'border-box',
          border: `4px solid ${borde}`,
          borderTop: 'none',
          background: COLORS.surface,
          boxShadow: `0 0 ${CASA.brillo * pulso}px ${glow}`,
          opacity: casa,
        }}
      />
      {CAJAS.map((c, i) => (
        <div
          key={ETIQUETAS_CAJAS[i]}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: c.ancho,
            height: c.alto,
            boxSizing: 'border-box',
            borderRadius: 14,
            border: `3px solid ${COLORS.borderStrong}`,
            background: COLORS.surfaceRaised,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            padding: '0 28px',
            fontFamily: FONTS.mono,
            fontSize: fsMinimo(36),
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: COLORS.text,
            opacity: cajas[i],
            transform: `translateX(${(1 - (cajas[i] ?? 0)) * -24}px)`,
          }}
        >
          <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
            <circle cx={28} cy={28} r={24} fill="none" stroke={COLORS.textMuted} strokeWidth={4} />
            <circle cx={28} cy={28} r={6} fill={COLORS.textMuted} />
            <line x1={28} y1={28} x2={28} y2={12} stroke={COLORS.textMuted} strokeWidth={4} strokeLinecap="round" />
          </svg>
          {ETIQUETAS_CAJAS[i]}
        </div>
      ))}
    </>
  );
};

type PropsLlave = {
  /** Centro de la llave. */
  x: number;
  y: number;
  color: string;
  estilo?: CSSProperties;
};

/** Llave de 140×70 con formas propias (anillo, caña y dos dientes). */
export const Llave = ({ x, y, color, estilo }: PropsLlave) => (
  <svg
    width={140}
    height={70}
    viewBox="0 0 140 70"
    style={{ position: 'absolute', left: x - 70, top: y - 35, ...estilo }}
  >
    <circle cx={30} cy={35} r={21} fill="none" stroke={color} strokeWidth={9} />
    <line x1={51} y1={35} x2={128} y2={35} stroke={color} strokeWidth={9} strokeLinecap="round" />
    <line x1={100} y1={35} x2={100} y2={56} stroke={color} strokeWidth={9} strokeLinecap="round" />
    <line x1={120} y1={35} x2={120} y2={52} stroke={color} strokeWidth={9} strokeLinecap="round" />
  </svg>
);

/** Llave inglesa tachada: «no puedes arreglarla». `tachado` 0..1 dibuja la raya diagonal. */
export const Herramienta = ({
  x,
  y,
  color,
  raya,
  tachado,
  opacidad,
}: {
  x: number;
  y: number;
  color: string;
  raya: string;
  tachado: number;
  opacidad: number;
}) => (
  <svg
    width={240}
    height={240}
    viewBox="-80 -80 160 160"
    style={{ position: 'absolute', left: x - 120, top: y - 120, opacity: opacidad }}
  >
    <g transform="rotate(-45)" fill={color}>
      <rect x={-11} y={-4} width={22} height={74} rx={11} />
      <circle cx={0} cy={-22} r={30} />
      <rect x={-11} y={-62} width={22} height={34} fill={COLORS.bg} />
    </g>
    <line
      x1={-62}
      y1={62}
      x2={-62 + 124 * tachado}
      y2={62 - 124 * tachado}
      stroke={raya}
      strokeWidth={10}
      strokeLinecap="round"
    />
  </svg>
);

/** Marca de verificado: check turquesa sobre un círculo. */
export const CheckInsignia = ({ x, y, escala }: { x: number; y: number; escala: number }) => (
  <svg
    width={52}
    height={52}
    viewBox="0 0 52 52"
    style={{
      position: 'absolute',
      left: x - 26,
      top: y - 26,
      opacity: Math.min(1, escala),
      transform: `scale(${escala})`,
    }}
  >
    <circle cx={26} cy={26} r={24} fill={COLORS.bg} stroke={COLORS.accent} strokeWidth={4} />
    <path
      d="M14 27 L23 36 L39 17"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
