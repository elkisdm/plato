import type { CSSProperties } from 'react';

import { COLORS, FONTS } from '../constants/theme';
import { CAJAS, CASA, ETIQUETAS_CAJAS, VENTANAS } from '../lib/casaLlaves';
import { fsMinimo, W_V } from '../lib/layout';
import { trazoOnduloso } from '../lib/trazos';

export type EstadoCaja = {
  /** Aparición 0..1 (con overshoot permitido en el desplazamiento). */
  aparece: number;
  /** Giro de la puerta de la caja fuerte en grados (0 = cerrada). */
  puerta: number;
  /** Color del borde de la caja. */
  borde: string;
};

type PropsCasa = {
  /** Trazado del contorno 0..1 (la casa se construye a trazos). */
  construye: number;
  /** Relleno de las paredes 0..1 (tras terminar los trazos). */
  relleno: number;
  /** Color del contorno (ámbar en la alerta, turquesa al cambiar las llaves). */
  borde: string;
  /** Intensidad 0..1 del brillo de alerta. */
  pulso: number;
  glow: string;
  wash: string;
  /** Brillo 0..1 y color de cada ventana. */
  ventanas: { luz: number; color: string }[];
  cajas: EstadoCaja[];
  /** Posición y de la banda de la onda de alerta; null = sin banda. */
  banda: number | null;
  colorBanda: string;
};

const BASE = CASA.yCuerpo + CASA.altoCuerpo;
const CX = W_V / 2;
/** Contorno: base izquierda → pared → alero → cumbrera → alero → pared → base derecha. */
const CONTORNO = `M ${CASA.x} ${BASE} L ${CASA.x} ${CASA.yCuerpo} L ${CX} ${CASA.yTecho} L ${CASA.x + CASA.ancho} ${CASA.yCuerpo} L ${CASA.x + CASA.ancho} ${BASE}`;

/** Casa ajena que se construye a trazos, con ventanas que se encienden y tres cajas fuertes que abren su puerta. */
export const Casa = ({ construye, relleno, borde, pulso, glow, wash, ventanas, cajas, banda, colorBanda }: PropsCasa) => {
  const chimenea = trazoOnduloso(CASA.x + CASA.ancho - 150, CASA.yCuerpo - 40, CASA.x + CASA.ancho - 150, CASA.yCuerpo - 110, 'chimenea', 2, 2);
  return (
    <>
      {/* Capa de fondo: silueta grande y desenfocada con paralaje */}
      <svg
        width={W_V}
        height={BASE + 40}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 0.18 * construye, filter: 'blur(6px)', transform: 'scale(1.16)', transformOrigin: `${CX}px ${CASA.yCuerpo + 200}px` }}
      >
        <path d={CONTORNO} fill="none" stroke={borde} strokeWidth={6} />
      </svg>

      <svg width={W_V} height={BASE + 40} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <polygon
          points={`${CASA.x},${CASA.yCuerpo} ${CX},${CASA.yTecho} ${CASA.x + CASA.ancho},${CASA.yCuerpo}`}
          fill={pulso > 0.05 ? wash : COLORS.surface}
          opacity={relleno}
        />
        <path
          d={chimenea.d}
          fill="none"
          stroke={borde}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={construye}
        />
        <path
          d={CONTORNO}
          pathLength={1}
          fill="none"
          stroke={borde}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - construye}
          style={{ filter: `drop-shadow(0 0 ${6 + 18 * pulso}px ${pulso > 0.05 ? glow : 'rgba(255,255,255,0.25)'})` }}
        />
        <line x1={CASA.x} y1={BASE} x2={CASA.x + CASA.ancho * Math.max(0, construye * 1.4 - 0.4)} y2={BASE} stroke={borde} strokeWidth={5} strokeLinecap="round" />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CASA.x + 2,
          top: CASA.yCuerpo,
          width: CASA.ancho - 4,
          height: CASA.altoCuerpo,
          background: COLORS.surface,
          opacity: relleno,
          boxShadow: `0 0 ${CASA.brillo * pulso}px ${glow}`,
          overflow: 'hidden',
        }}
      >
        {banda !== null ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: banda - CASA.yCuerpo - 60,
              height: 120,
              background: `linear-gradient(180deg, transparent, ${colorBanda} 60%, transparent)`,
              opacity: 0.55,
            }}
          />
        ) : null}
      </div>

      {VENTANAS.map((v, i) => {
        const w = ventanas[i]!;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: v.x,
              top: v.y,
              width: v.ancho,
              height: v.alto,
              boxSizing: 'border-box',
              borderRadius: 8,
              border: `3px solid ${w.luz > 0.5 ? w.color : COLORS.idle}`,
              background: `${w.color}${Math.round(w.luz * 48).toString(16).padStart(2, '0')}`,
              boxShadow: `0 0 ${34 * w.luz}px ${w.color}88`,
              opacity: relleno,
            }}
          >
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: w.luz > 0.5 ? w.color : COLORS.idle, opacity: 0.8 }} />
          </div>
        );
      })}

      {CAJAS.map((c, i) => {
        const e = cajas[i]!;
        return (
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
              border: `3px solid ${e.borde}`,
              background: COLORS.surfaceRaised,
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              padding: '0 24px',
              fontFamily: FONTS.mono,
              fontSize: fsMinimo(36),
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: COLORS.text,
              opacity: Math.min(1, e.aparece * 1.5),
              transform: `translateX(${(1 - e.aparece) * -90}px)`,
            }}
          >
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0, perspective: 300 }}>
              {/* Interior de la caja, que se ve al abrirse la puerta */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: COLORS.bg, boxShadow: `inset 0 0 ${e.puerta * 0.3}px ${COLORS.accentGlow}`, border: `2px solid ${COLORS.idle}` }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 10,
                  border: `3px solid ${COLORS.textMuted}`,
                  background: COLORS.surface,
                  transformOrigin: 'left center',
                  transform: `rotateY(${-e.puerta}deg)`,
                }}
              >
                <svg width={58} height={58} viewBox="0 0 56 56">
                  <circle cx={28} cy={28} r={18} fill="none" stroke={COLORS.textMuted} strokeWidth={4} />
                  <circle cx={28} cy={28} r={5} fill={COLORS.textMuted} />
                  <line x1={28} y1={28} x2={28} y2={14} stroke={COLORS.textMuted} strokeWidth={4} strokeLinecap="round" transform={`rotate(${e.puerta * 2} 28 28)`} style={{ transformOrigin: '28px 28px' }} />
                </svg>
              </div>
            </div>
            {ETIQUETAS_CAJAS[i]}
          </div>
        );
      })}
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

/** Llave de 210×105 (viewBox 140×70, escala 1,5) con formas propias (anillo, caña y dos dientes). */
export const Llave = ({ x, y, color, estilo }: PropsLlave) => (
  <svg width={210} height={105} viewBox="0 0 140 70" style={{ position: 'absolute', left: x - 105, top: y - 52, overflow: 'visible', ...estilo }}>
    <circle cx={30} cy={35} r={21} fill="none" stroke={color} strokeWidth={9} />
    <line x1={51} y1={35} x2={128} y2={35} stroke={color} strokeWidth={9} strokeLinecap="round" />
    <line x1={100} y1={35} x2={100} y2={56} stroke={color} strokeWidth={9} strokeLinecap="round" />
    <line x1={120} y1={35} x2={120} y2={52} stroke={color} strokeWidth={9} strokeLinecap="round" />
  </svg>
);

/** Llave inglesa tachada con un trazo a mano: «no puedes arreglarla». `tachado` 0..1 dibuja la raya diagonal. */
export const Herramienta = ({
  x,
  y,
  color,
  raya,
  tachado,
  opacidad,
  giro = 0,
}: {
  x: number;
  y: number;
  color: string;
  raya: string;
  tachado: number;
  opacidad: number;
  giro?: number;
}) => {
  const trazo = trazoOnduloso(-62, 62, 62, -62, 'e04-herramienta', 5, 4);
  return (
    <svg width={240} height={240} viewBox="-80 -80 160 160" style={{ position: 'absolute', left: x - 120, top: y - 120, opacity: opacidad, overflow: 'visible' }}>
      <g transform={`rotate(${-45 + giro})`} fill={color}>
        <rect x={-11} y={-4} width={22} height={74} rx={11} />
        <circle cx={0} cy={-22} r={30} />
        <rect x={-11} y={-62} width={22} height={34} fill={COLORS.bg} />
      </g>
      <path d={trazo.d} fill="none" stroke={raya} strokeWidth={10} strokeLinecap="round" strokeDasharray={trazo.largo} strokeDashoffset={trazo.largo * (1 - tachado)} />
    </svg>
  );
};

/** Marca de verificado: check turquesa sobre un círculo. */
export const CheckInsignia = ({ x, y, escala }: { x: number; y: number; escala: number }) => (
  <svg
    width={52}
    height={52}
    viewBox="0 0 52 52"
    style={{ position: 'absolute', left: x - 26, top: y - 26, opacity: Math.min(1, escala), transform: `scale(${escala})` }}
  >
    <circle cx={26} cy={26} r={24} fill={COLORS.bg} stroke={COLORS.accent} strokeWidth={4} />
    <path d="M14 27 L23 36 L39 17" fill="none" stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
