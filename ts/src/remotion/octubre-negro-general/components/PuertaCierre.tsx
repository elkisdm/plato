import { interpolateColors, random, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS, WARN } from '../constants/theme';
import { anguloPuerta, ANGULO_ABIERTA, barridoPeriodico, FRAMES_CIERRE } from '../lib/golpesFinales';
import { intensidadDestello } from '../lib/fx/efectos';
import { fsMinimo } from '../lib/layout';
import { entrada, entre, rebote } from '../lib/motion';
import { OndaChoque } from './fx/OndaChoque';
import { MotasFlotando, RafagaChispas } from './ChispasEscena';

const W = 840;
const H = 1250;
const PUERTA_W = 400;
const PUERTA_H = 700;
const PUERTA_TOP = 340;
const PUERTA_LEFT = (W - PUERTA_W) / 2;
const BORDE = 6;
const CX = W / 2;
const CY = PUERTA_TOP + PUERTA_H / 2;
/** Borde derecho del marco: de ahí sale la luz por la rendija. */
const RENDIJA_X = PUERTA_LEFT + PUERTA_W;

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** Frame (relativo al portazo) en que el candado hace click. */
const CLICK = 14;
const RADIO_ANILLO = 30;
const LARGO_ANILLO = 2 * Math.PI * RADIO_ANILLO;

type Props = {
  /** Frame en que empieza a bajar la flecha ACTUALIZAR («actualización»). */
  actualizacion: number;
  /** Frame en que la puerta golpea el marco («cierra»): el golpe de la escena. */
  cierra: number;
};

/**
 * Puerta entreabierta en ámbar, en perspectiva 3D que oscila, con rayos de luz por la rendija y polvo flotando.
 * Una pastilla `ACTUALIZAR` baja con un anillo de progreso; cuando el anillo se completa la puerta se cierra y
 * golpea en `cierra` (la luz ámbar se apaga) y, `CLICK` frames después, el candado hace click con un destello
 * turquesa. Se dibuja dentro de un contenedor de 840 px (el llamador lo centra entre los márgenes de 120).
 */
export const PuertaCierre = ({ actualizacion, cierra }: Props) => {
  const frame = useCurrentFrame();
  const click = cierra + CLICK;
  const angulo = anguloPuerta(frame, cierra);

  // Color: ámbar → apagado (portazo) → turquesa (click del candado).
  const apagado = entrada(frame, cierra, 5);
  const hecho = entrada(frame, click, 8);
  const color = interpolateColors(
    hecho,
    [0, 1],
    [interpolateColors(apagado, [0, 1], [WARN, COLORS.idle]), COLORS.accent],
  );
  const brillo = interpolateColors(
    hecho,
    [0, 1],
    [interpolateColors(apagado, [0, 1], [`${WARN}55`, `${WARN}00`]), `${COLORS.accent}55`],
  );

  // Luz que entra por la rendija: crece con la apertura, parpadea y se apaga de golpe en el portazo apagándose.
  const parpadeo = 0.85 + 0.15 * Math.sin(frame * 0.35) * random(`luz-${Math.floor(frame / 3)}`);
  const luz = clamp01(angulo / ANGULO_ABIERTA) * (1 - apagado) * parpadeo;
  const titileoCierre = frame > cierra && frame < cierra + 8 ? 0.4 * random(`ap-${frame}`) : 0;
  const luzTotal = Math.min(1, luz + titileoCierre * (1 - hecho));

  // Cámara de la puerta: balanceo 3D lento y un empujón en el portazo.
  const k = frame - cierra;
  const empujon = k >= 0 ? Math.exp(-k / 5) * Math.cos(k * 0.9) : 0;
  const giroY = 7 * Math.sin(frame / 38) - 7 * empujon;
  const giroX = 3 * Math.sin(frame / 52 + 1) + 2.5 * empujon;
  const escalaGolpe = 1 - 0.03 * (k >= 0 ? Math.exp(-k / 4) : 0);

  // Pastilla ACTUALIZAR con anillo de progreso.
  const cierraInicio = cierra - FRAMES_CIERRE;
  const aparece = rebote(frame, actualizacion - 22, FPS);
  const baja = entrada(frame, actualizacion - 12, 18);
  const anillo = entre(frame, actualizacion - 10, cierraInicio - 1);
  const presionada = entre(frame, cierraInicio - 1, cierraInicio + 2);
  const sale = entrada(frame, cierra, 5);
  const pastilla = Math.min(1, aparece * 2) * (1 - sale);
  const flecha = Math.sin(frame * 0.28) * 4 * (1 - anillo);

  // Candado.
  const candado = rebote(frame, cierra + 3, FPS);
  const arco = entre(frame, cierra + 8, click);
  const destello = intensidadDestello(frame - click, 7);
  // Con la puerta cerrada, un brillo turquesa recorre la hoja cada 1,5 s para que la escena siga viva.
  const brilloHoja = barridoPeriodico(frame, click + 20, 45, 22);
  const resplandor = frame >= click ? 1 - entre(frame, click, click + 12) : 0;

  // Rótulo de estado.
  const rotulo = rebote(frame, cierra, FPS);
  const cerrada = frame >= cierra;

  return (
    <div style={{ position: 'relative', width: W, height: H, fontFamily: FONTS.sans, overflow: 'hidden' }}>
      {/* Capa de fondo: halo de la habitación y muro desenfocado */}
      <div
        style={{
          position: 'absolute',
          left: CX - 420,
          top: CY - 420,
          width: 840,
          height: 840,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brillo} 0%, transparent 65%)`,
          opacity: 0.8 + 0.2 * Math.sin(frame / 20),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: PUERTA_TOP - 60,
          width: W - 60,
          height: PUERTA_H + 120,
          borderRadius: 40,
          border: `3px solid ${COLORS.border}`,
          background: `linear-gradient(180deg, ${COLORS.surface}, transparent)`,
          filter: 'blur(5px)',
          opacity: 0.7,
        }}
      />
      <MotasFlotando n={26} semilla="puerta-polvo" ancho={W} alto={H} color={color} alfaMax={0.55} />

      {/* Rótulo */}
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
          opacity: cerrada ? 1 : 0.8 + 0.2 * Math.sin(frame * 0.2),
          transform: cerrada ? `scale(${0.8 + 0.2 * rotulo})` : undefined,
        }}
      >
        {cerrada ? 'PUERTA CERRADA' : 'PUERTA ABIERTA'}
      </div>

      {/* Suelo: charco de luz bajo la puerta */}
      <div
        style={{
          position: 'absolute',
          left: CX - 330,
          top: PUERTA_TOP + PUERTA_H - 20,
          width: 660,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${brillo}, transparent 70%)`,
          opacity: 0.6 + 0.4 * luzTotal,
        }}
      />

      {/* Puerta en 3D */}
      <div
        style={{
          position: 'absolute',
          top: PUERTA_TOP,
          left: PUERTA_LEFT,
          width: PUERTA_W,
          height: PUERTA_H,
          perspective: 1400,
          perspectiveOrigin: `${50 + 6 * Math.sin(frame / 38)}% 50%`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${giroY}deg) rotateX(${giroX}deg) scale(${escalaGolpe})`,
          }}
        >
          {/* Marco con la habitación iluminada detrás */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxSizing: 'border-box',
              border: `${BORDE}px solid ${color}`,
              borderRadius: 18,
              background: `linear-gradient(90deg, ${WARN}${Math.round(40 + 130 * luzTotal)
                .toString(16)
                .padStart(2, '0')}, ${COLORS.bg})`,
              boxShadow: `0 0 56px ${brillo}`,
            }}
          />
          {/* Núcleo brillante de la rendija */}
          <div
            style={{
              position: 'absolute',
              top: BORDE + 20,
              bottom: BORDE + 20,
              right: BORDE + 4,
              width: 14 + 50 * luzTotal,
              borderRadius: 10,
              background: `linear-gradient(180deg, transparent, ${WARN}, transparent)`,
              filter: 'blur(6px)',
              opacity: luzTotal,
            }}
          />
          {/* Hoja de la puerta */}
          <div
            style={{
              position: 'absolute',
              inset: BORDE,
              transformOrigin: 'left center',
              transform: `rotateY(${angulo}deg)`,
              boxSizing: 'border-box',
              border: `3px solid ${color}`,
              borderRadius: 12,
              background: `linear-gradient(90deg, ${COLORS.surface}, ${COLORS.surfaceRaised} 60%, ${COLORS.surface})`,
              boxShadow: `inset 0 0 40px rgba(0,0,0,0.5)`,
              overflow: 'hidden',
            }}
          >
            {brilloHoja !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  bottom: -40,
                  left: `${-40 + brilloHoja * 160}%`,
                  width: '30%',
                  transform: 'skewX(-18deg)',
                  background: `linear-gradient(90deg, transparent, ${COLORS.accent}55, transparent)`,
                }}
              />
            )}
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 34,
                  right: 34,
                  top: i === 0 ? 36 : '53%',
                  height: i === 0 ? '41%' : '40%',
                  boxSizing: 'border-box',
                  border: `2px solid ${COLORS.borderStrong}`,
                  borderRadius: 8,
                  background: `linear-gradient(160deg, rgba(255,255,255,0.05), transparent)`,
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                right: 22,
                top: '50%',
                width: 26,
                height: 26,
                marginTop: -13,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 16px ${brillo}`,
              }}
            />
            {/* Candado sobre la hoja */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '45%',
                transform: `translate(-50%, -50%) scale(${candado})`,
                opacity: Math.min(1, candado * 2),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 74,
                  boxSizing: 'border-box',
                  border: `14px solid ${color}`,
                  borderBottom: 'none',
                  borderRadius: '45px 45px 0 0',
                  transformOrigin: 'right bottom',
                  transform: `translateY(${-18 * (1 - arco * arco)}px) rotate(${-24 * (1 - arco * arco)}deg)`,
                }}
              />
              <div
                style={{
                  width: 160,
                  height: 122,
                  borderRadius: 16,
                  background: color,
                  boxShadow: `0 0 ${20 + 40 * resplandor}px ${brillo}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: COLORS.bg }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rayos de luz que salen por la rendija (sobre la puerta, mezcla aditiva) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'screen',
          opacity: luzTotal * 0.7,
          background: `repeating-conic-gradient(from ${frame * 0.12}deg at ${RENDIJA_X - 40}px ${CY}px, ${WARN}00 0deg, ${WARN}77 3deg, ${WARN}00 7deg, ${WARN}00 19deg)`,
          WebkitMaskImage: `radial-gradient(circle at ${RENDIJA_X - 40}px ${CY}px, black 0, transparent 560px)`,
          maskImage: `radial-gradient(circle at ${RENDIJA_X - 40}px ${CY}px, black 0, transparent 560px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Pastilla ACTUALIZAR con anillo de progreso */}
      <div
        style={{
          position: 'absolute',
          top: 90 + baja * 130 + 8 * presionada,
          left: '50%',
          transform: `translateX(-50%) scale(${(0.5 + 0.5 * aparece) * (1 - 0.1 * presionada)})`,
          opacity: pastilla,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '12px 34px 12px 16px',
          borderRadius: 999,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.surfaceRaised,
          boxShadow: `0 0 ${36 + 18 * anillo}px ${COLORS.accentGlow}`,
          color: COLORS.accent,
          fontSize: fsMinimo(40),
          fontWeight: 800,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
          <circle cx="38" cy="38" r={RADIO_ANILLO} stroke={COLORS.border} strokeWidth="7" />
          <circle
            cx="38"
            cy="38"
            r={RADIO_ANILLO}
            stroke={COLORS.accent}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={LARGO_ANILLO}
            strokeDashoffset={LARGO_ANILLO * (1 - anillo)}
            transform="rotate(-90 38 38)"
          />
          <path
            d={`M38 ${24 + flecha}v24M28 ${40 + flecha}l10 11 10-11`}
            stroke={COLORS.accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        ACTUALIZAR
      </div>

      {/* Chispas: ámbar al golpear, turquesa al hacer click */}
      <RafagaChispas inicio={cierra} x={RENDIJA_X - 20} y={CY} color={WARN} n={18} semilla="portazo" />
      <RafagaChispas inicio={click} x={CX} y={CY - 30} color={COLORS.accent} n={20} semilla="click" />
      <OndaChoque inicio={click} x={CX} y={CY - 30} color={COLORS.accent} tamano={420} duracion={16} grosor={10} />
      {destello > 0 && (
        <div
          style={{
            position: 'absolute',
            left: CX - 260,
            top: CY - 290,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.accent}, transparent 70%)`,
            opacity: destello * 0.55,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
