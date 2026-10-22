import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, FONTS, SPACING, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { anguloBalanza, type PasoBalanza } from '../lib/balanza';
import { trazoOnduloso } from '../lib/trazos';
import { entre } from '../lib/motion';
import { Fragmentos } from './Fragmentos';

type Props = {
  /** Frame global de inicio (la balanza se arma desde aquí). */
  desde: number;
  /** Frame en que cae cada platillo y frame en que se tacha su texto. */
  tNi: [number, number];
  tTachado: [number, number];
  /** Frame en que se equilibra en el centro. */
  tCalma: number;
};

const PIVOTE = { x: W / 2, y: 430 };
const MITAD = 255;
const CARTA = { ancho: 300, alto: 130, colgado: 170 };
const TEXTOS = [
  ['TODO ES EL', 'FIN DEL MUNDO'],
  ['TODO ES', 'MENTIRA'],
] as const;

/** Balanza física: la viga oscila con resorte amortiguado entre los dos extremos y termina equilibrada en el centro. */
export const Balanza = ({ desde, tNi, tTachado, tCalma }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pasos: PasoBalanza[] = [
    { frame: tNi[0] + 5, grados: -13 },
    { frame: tNi[1] + 5, grados: 13 },
    { frame: tCalma, grados: 0 },
  ];
  // Antes del primer peso la viga cabecea apenas, para no quedar quieta.
  const ang = anguloBalanza(frame, pasos) + (frame < tNi[0] + 5 ? 1.6 * Math.sin(frame / 7) : 0);
  const rad = (ang * Math.PI) / 180;
  const arma = spring({ frame: frame - desde - 2, fps, config: { damping: 12, stiffness: 110 } });
  const trazoPie = entre(frame, desde, desde + 22);
  const calma = frame >= tCalma;
  const color = calma ? COLORS.accent : COLORS.textMuted;

  const extremo = (lado: -1 | 1) => ({
    x: PIVOTE.x + lado * MITAD * Math.cos(rad),
    y: PIVOTE.y + lado * MITAD * Math.sin(rad),
  });

  return (
    <>
      <svg width={W} height={800} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: Math.min(1, arma * 2) }}>
        <polygon
          points={`${PIVOTE.x},${PIVOTE.y} ${PIVOTE.x - 64},730 ${PIVOTE.x + 64},730`}
          fill={COLORS.surface}
          stroke={color}
          strokeWidth={4}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - trazoPie}
          style={{ fillOpacity: trazoPie }}
        />
        <rect x={PIVOTE.x - 110} y={730} width={220} height={16} rx={8} fill={COLORS.surfaceRaised} stroke={color} strokeWidth={3} />
        {([-1, 1] as const).map((lado, k) => {
          const e = extremo(lado);
          const cx = e.x;
          const cy = e.y + CARTA.colgado;
          const caida = spring({ frame: frame - tNi[k], fps, config: { damping: 9, stiffness: 130, mass: 0.8 } });
          const vis = frame >= tNi[k];
          if (!vis) return null;
          const dy = (1 - caida) * -240;
          return (
            <g key={k} opacity={Math.min(1, caida * 3)}>
              <line x1={e.x} y1={e.y} x2={cx - CARTA.ancho / 2 + 24} y2={cy - CARTA.alto / 2 + dy} stroke={COLORS.line} strokeWidth={3} />
              <line x1={e.x} y1={e.y} x2={cx + CARTA.ancho / 2 - 24} y2={cy - CARTA.alto / 2 + dy} stroke={COLORS.line} strokeWidth={3} />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: PIVOTE.x - MITAD - 12,
          top: PIVOTE.y - 8,
          width: MITAD * 2 + 24,
          height: 16,
          borderRadius: 8,
          background: `linear-gradient(90deg, ${COLORS.borderStrong}, ${color}, ${COLORS.borderStrong})`,
          boxShadow: calma ? `0 0 24px ${COLORS.accentGlow}` : undefined,
          transform: `rotate(${ang}deg) scaleX(${Math.min(1, arma)})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: PIVOTE.x - 24,
          top: PIVOTE.y - 24,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: calma ? COLORS.accent : COLORS.idle,
          boxShadow: `0 0 ${calma ? 30 + 10 * Math.sin(frame / 7) : 0}px ${COLORS.accentGlow}`,
          transform: `scale(${arma})`,
        }}
      />

      {([-1, 1] as const).map((lado, k) => {
        if (frame < tNi[k]) return null;
        const e = extremo(lado);
        const caida = spring({ frame: frame - tNi[k], fps, config: { damping: 9, stiffness: 130, mass: 0.8 } });
        const t = entre(frame, tTachado[k], tTachado[k] + 8);
        const golpeado = frame >= tTachado[k] && frame < tTachado[k] + 7;
        const sacude = golpeado ? Math.sin(frame * 3.1) * 4 : 0;
        const sway = -ang * 0.25 + Math.sin(frame / 11 + k * 2) * 1.2;
        const trazo = trazoOnduloso(18, 62, 282, 58, `e03-a-${k}`, 6, 5);
        const trazo2 = trazoOnduloso(30, 84, 270, 74, `e03-b-${k}`, 5, 4);
        const fin = entre(frame, tTachado[k] + 6, tTachado[k] + 14);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: e.x - CARTA.ancho / 2 + sacude,
              top: e.y + CARTA.colgado - CARTA.alto / 2 + (1 - caida) * -240,
              width: CARTA.ancho,
              height: CARTA.alto,
              boxSizing: 'border-box',
              borderRadius: SPACING.radius,
              border: `2px solid ${WARN}`,
              background: WARN_WASH,
              boxShadow: `0 0 20px ${WARN_GLOW}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.sans,
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: COLORS.text,
              opacity: Math.min(1, caida * 3) * (1 - 0.5 * Math.max(t, calma ? 1 : 0)),
              transform: `rotate(${sway}deg)`,
              transformOrigin: '50% -60px',
            }}
          >
            <span>{TEXTOS[k][0]}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{TEXTOS[k][1]}</span>
            <svg width={CARTA.ancho} height={CARTA.alto} style={{ position: 'absolute', left: -2, top: -2, overflow: 'visible' }}>
              <path d={trazo.d} fill="none" stroke={WARN} strokeWidth={9} strokeLinecap="round" strokeDasharray={trazo.largo} strokeDashoffset={trazo.largo * (1 - t)} />
              <path d={trazo2.d} fill="none" stroke={WARN} strokeWidth={5} strokeLinecap="round" opacity={0.7} strokeDasharray={trazo2.largo} strokeDashoffset={trazo2.largo * (1 - fin)} />
            </svg>
            <div style={{ position: 'absolute', left: 0, top: 0 }}>
              <Fragmentos inicio={tTachado[k] + 8} x={282} y={58} color={WARN} semilla={`e03-tacha-${k}`} cantidad={8} velocidad={10} gravedad={0.4} vida={14} tamano={11} />
            </div>
          </div>
        );
      })}
    </>
  );
};
