import type { ReactNode } from 'react';
import { interpolateColors, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../constants/theme';
import { barridoPeriodico, poseAbanico } from '../lib/golpesFinales';
import { fsMinimo } from '../lib/layout';
import { entre, rebote } from '../lib/motion';
import { RafagaChispas, MotasFlotando } from './ChispasEscena';
import { Sello } from './fx/Sello';
import { TarjetaProfunda } from './fx/TarjetaProfunda';

const W = 840;
const H = 1250;
const FILA_ALTO = 250;
const ESPACIO = 36;
const Y_BASE = 90;
const Y_SELLO = Y_BASE + 3 * (FILA_ALTO + ESPACIO) + 30;
/** Frames entre el check de una fila y el de la siguiente (cada uno suena con su `check_1`). */
const ESCALON_CHECK = 4;
/** Frames que tarda en dibujarse un check. */
const TRAZO_CHECK = 8;
/** Frames que tarda el barrido de brillo en cruzar las tres filas. */
const BARRIDO = 16;

type Paso = { texto: ReactNode; icono: 'lupa' | 'llave' | 'flecha'; entra: number };

type Props = {
  pasos: [Paso, Paso, Paso];
  /** Frame del golpe «alcanza»: las tres filas se marcan con check turquesa. */
  alcanza: number;
};

const yFila = (i: number): number => Y_BASE + i * (FILA_ALTO + ESPACIO);

/** Icono con microanimación continua: la lupa rastrea, la llave se mece, la flecha sube y baja. */
const Icono = ({ tipo, color, fase }: { tipo: Paso['icono']; color: string; fase: number }) => {
  const frame = useCurrentFrame();
  const t = frame / 14 + fase;
  const trazo = {
    stroke: color,
    strokeWidth: 7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  const movimiento =
    tipo === 'lupa'
      ? `translate(${6 * Math.cos(t)}px, ${6 * Math.sin(t * 1.3)}px)`
      : tipo === 'llave'
        ? `rotate(${12 * Math.sin(t)}deg)`
        : `translateY(${-8 * Math.abs(Math.sin(t * 0.8))}px)`;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" style={{ overflow: 'visible' }}>
      <g style={{ transform: movimiento, transformOrigin: '48px 48px' }}>
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
      </g>
    </svg>
  );
};

/** Ranura punteada donde caerá cada tarjeta: da contenido a la escena desde el primer cuadro. */
const Ranura = ({ i, llega }: { i: number; llega: number }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top: yFila(i),
        left: 0,
        width: '100%',
        height: FILA_ALTO,
        boxSizing: 'border-box',
        borderRadius: 28,
        border: `3px dashed ${COLORS.idle}`,
        opacity: (1 - Math.min(1, llega * 1.5)) * (0.8 + 0.2 * Math.sin(frame / 10 + i * 2)),
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          border: `3px dashed ${COLORS.idle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(40),
          color: COLORS.idle,
        }}
      >
        {i + 1}
      </div>
    </div>
  );
};

const Fila = ({ paso, i, alcanza }: { paso: Paso; i: number; alcanza: number }) => {
  const frame = useCurrentFrame();
  // La tarjeta entra en abanico: parte inclinada y desplazada y cae en su fila con overshoot.
  const entra = rebote(frame, paso.entra - 3, FPS);
  const pose = poseAbanico(i, entra);
  const inicioCheck = alcanza + i * ESCALON_CHECK;
  const hecho = Math.min(1, rebote(frame, inicioCheck, FPS));
  const trazoCheck = entre(frame, inicioCheck + 1, inicioCheck + 1 + TRAZO_CHECK);
  const color = interpolateColors(hecho, [0, 1], [COLORS.textMuted, COLORS.accent]);
  return (
    <>
      <Ranura i={i} llega={entra} />
      <div
        style={{
          position: 'absolute',
          top: yFila(i),
          left: 0,
          width: '100%',
          height: FILA_ALTO,
          opacity: Math.min(1, entra * 3),
          transformOrigin: '50% 100%',
          transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rot}deg)`,
        }}
      >
        <TarjetaProfunda fase={i * 1.3} color={COLORS.textMuted} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              border: `4px solid ${COLORS.accent}`,
              background: `linear-gradient(160deg, ${COLORS.accentGlow}, transparent 70%)`,
              opacity: hecho,
            }}
          />
          <div
            style={{
              position: 'relative',
              height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              padding: '0 36px',
              fontFamily: FONTS.sans,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                flexShrink: 0,
                borderRadius: '50%',
                boxSizing: 'border-box',
                border: `3px solid ${color}`,
                background: hecho > 0.5 ? COLORS.accent : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.mono,
                fontSize: fsMinimo(40),
                fontWeight: 700,
                color: COLORS.textMuted,
                transform: `scale(${1 + 0.25 * Math.sin(Math.PI * hecho)})`,
              }}
            >
              {hecho > 0.01 ? (
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path
                    d="M8 23l10 10 18-22"
                    pathLength={1}
                    stroke={COLORS.bg}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={1}
                    strokeDashoffset={1 - trazoCheck}
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              <Icono tipo={paso.icono} color={color} fase={i * 2} />
            </div>
            <div
              style={{
                flex: 1,
                fontSize: fsMinimo(44),
                fontWeight: 700,
                lineHeight: 1.18,
                letterSpacing: '-0.015em',
                color: COLORS.text,
                textWrap: 'balance',
              }}
            >
              {paso.texto}
            </div>
          </div>
        </TarjetaProfunda>
      </div>
      <RafagaChispas
        inicio={inicioCheck + 2}
        x={36 + 38}
        y={yFila(i) + FILA_ALTO / 2}
        color={COLORS.accent}
        n={12}
        semilla={`check-${i}`}
        tamano={0.9}
      />
    </>
  );
};

/** Franja de brillo que baja cruzando las filas; `fuerza` la apaga en los barridos repetidos. */
const Barrido = ({ t, fuerza }: { t: number; fuerza: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: Y_BASE,
      width: '100%',
      height: 3 * (FILA_ALTO + ESPACIO) - ESPACIO,
      overflow: 'hidden',
      mixBlendMode: 'screen',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: -60,
        right: -60,
        top: -120 + t * (3 * (FILA_ALTO + ESPACIO) + 100),
        height: 120,
        transform: 'skewY(-6deg)',
        background: `linear-gradient(180deg, transparent, rgba(255,255,255,${0.55 * fuerza}), transparent)`,
      }}
    />
  </div>
);

/**
 * Tres hábitos que caen en abanico, uno por verbo, sobre ranuras punteadas; las tarjetas respiran en 3D y sus
 * iconos se mueven solos. En `alcanza` cada fila se marca con un check que se dibuja (con chispas), un brillo
 * recorre las tres filas y cae el sello `ALCANZA`. Ocupa un contenedor de 840 px.
 */
export const PasosHabitos = ({ pasos, alcanza }: Props) => {
  const frame = useCurrentFrame();
  const barrido = entre(frame, alcanza - 3, alcanza - 3 + BARRIDO);
  const repetido = barridoPeriodico(frame, alcanza + 40, 70, 26);
  return (
    <div style={{ position: 'relative', width: W, height: H, fontFamily: FONTS.sans, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 160,
          width: W,
          height: 840,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.accentGlow}, transparent 65%)`,
          opacity: 0.45 + 0.2 * Math.sin(frame / 24),
        }}
      />
      <MotasFlotando n={24} semilla="pasos-motas" ancho={W} alto={H} color={COLORS.accent} alfaMax={0.5} />
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
          color: COLORS.accent,
          opacity: 0.8 + 0.2 * Math.sin(frame * 0.2),
        }}
      >
        TRES HÁBITOS
      </div>

      {pasos.map((p, i) => (
        <Fila key={i} paso={p} i={i} alcanza={alcanza} />
      ))}

      {barrido > 0 && barrido < 1 ? <Barrido t={barrido} fuerza={1} /> : null}
      {repetido !== null ? <Barrido t={repetido} fuerza={0.3} /> : null}

      <div
        style={{
          position: 'absolute',
          top: Y_SELLO,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 18,
              border: `4px dashed ${COLORS.borderStrong}`,
              opacity: frame < alcanza + 4 ? 0.5 + 0.3 * Math.sin(frame / 8) : 0,
            }}
          />
          <Sello inicio={alcanza + 4} fontSize={72} rotacion={-6}>
            ALCANZA
          </Sello>
        </div>
      </div>
    </div>
  );
};
