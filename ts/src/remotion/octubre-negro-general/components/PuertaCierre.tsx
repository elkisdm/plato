import { interpolateColors, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS, WARN, WARN_GLOW } from '../constants/theme';
import { anguloPuerta, FRAMES_CIERRE } from '../lib/golpesFinales';
import { fsMinimo } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';

const PUERTA_W = 380;
const PUERTA_H = 640;
const PUERTA_TOP = 330;
const BORDE = 6;

type Props = {
  /** Frame en que empieza a bajar la flecha ACTUALIZAR («actualización»). */
  actualizacion: number;
  /** Frame en que la puerta se cierra («cierra»): el golpe de la escena. */
  cierra: number;
};

/**
 * Puerta entreabierta en ámbar con un hueco de luz. Una flecha `ACTUALIZAR` baja sobre ella y,
 * en `cierra`, la puerta se cierra y pasa a turquesa con candado. Se dibuja dentro de un
 * contenedor de 840 px (el llamador lo centra entre los márgenes de 120).
 */
export const PuertaCierre = ({ actualizacion, cierra }: Props) => {
  const frame = useCurrentFrame();
  const cerrada = entrada(frame, cierra, FRAMES_CIERRE);
  const color = interpolateColors(cerrada, [0, 1], [WARN, COLORS.accent]);
  const luz = interpolateColors(
    cerrada,
    [0, 1],
    ['rgba(245,165,36,0.62)', 'rgba(56,230,193,0.10)'],
  );
  const brillo = interpolateColors(cerrada, [0, 1], [WARN_GLOW, COLORS.accentGlow]);
  const angulo = anguloPuerta(frame, cierra);

  const aparece = entrada(frame, actualizacion - 14, 12);
  const baja = entrada(frame, actualizacion, 16);
  const pastilla = aparece * (1 - entrada(frame, cierra + 8, 8));
  const candado = rebote(frame, cierra + 8, FPS);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: FONTS.sans }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(38),
          letterSpacing: '0.14em',
          color,
        }}
      >
        {cerrada < 0.5 ? 'PUERTA ABIERTA' : 'PUERTA CERRADA'}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 90 + baja * 150,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: pastilla,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '14px 30px',
          borderRadius: 999,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.surfaceRaised,
          boxShadow: `0 0 36px ${COLORS.accentGlow}`,
          color: COLORS.accent,
          fontSize: fsMinimo(40),
          fontWeight: 800,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        ACTUALIZAR
        <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
          <path
            d="M17 3v30M5 21l12 14 12-14"
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          top: PUERTA_TOP,
          left: (840 - PUERTA_W) / 2,
          width: PUERTA_W,
          height: PUERTA_H,
          perspective: 1400,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxSizing: 'border-box',
            border: `${BORDE}px solid ${color}`,
            borderRadius: 18,
            background: `linear-gradient(90deg, ${luz}, ${COLORS.bg})`,
            boxShadow: `0 0 56px ${brillo}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: BORDE,
            transformOrigin: 'left center',
            transform: `rotateY(${angulo}deg)`,
            boxSizing: 'border-box',
            border: `3px solid ${color}`,
            borderRadius: 12,
            background: COLORS.surfaceRaised,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 34,
              border: `2px solid ${COLORS.border}`,
              borderRadius: 8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 26,
              top: '50%',
              width: 26,
              height: 26,
              marginTop: -13,
              borderRadius: '50%',
              background: color,
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${candado * 1.6})`,
            opacity: Math.min(1, candado * 2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              boxSizing: 'border-box',
              border: `12px solid ${COLORS.accent}`,
              borderBottom: 'none',
              borderRadius: '28px 28px 0 0',
            }}
          />
          <div
            style={{
              width: 100,
              height: 78,
              borderRadius: 14,
              background: COLORS.accent,
              boxShadow: `0 0 40px ${COLORS.accentGlow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
