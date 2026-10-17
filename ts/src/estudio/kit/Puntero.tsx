import React from 'react';
import { useMarca } from '../marca';
import { interpolate, useCurrentFrame } from 'remotion';
import { avance, porTramos } from './animacion';

/** Posición del puntero en proporción a la imagen, en un frame dado. `clic` lo hace pulsar ahí. */
export type TramoPuntero = { frame: number; x: number; y: number; clic?: boolean };

type Props = { tramos: TramoPuntero[]; ancho: number; alto: number };

/**
 * `interpolate` necesita al menos dos puntos: con uno solo, el puntero queda quieto en él.
 */
export const tramosEfectivos = (tramos: TramoPuntero[]): TramoPuntero[] => {
  const [unico] = tramos;
  return tramos.length === 1 && unico
    ? [unico, { ...unico, frame: unico.frame + 1, clic: false }]
    : tramos;
};

const DURACION_CLIC = 14;

/** Puntero que viaja entre fotogramas clave y hace clic con una onda índigo. */
export const Puntero: React.FC<Props> = ({ tramos, ancho, alto }) => {
  const { colores } = useMarca();
  const frame = useCurrentFrame();
  const primero = tramos[0];
  const ultimo = tramos[tramos.length - 1];
  if (!primero || !ultimo) return null;

  const recorrido = tramosEfectivos(tramos);
  const cuadros = recorrido.map((t) => t.frame);
  const x =
    porTramos(
      frame,
      cuadros,
      recorrido.map((t) => t.x),
    ) * ancho;
  const y =
    porTramos(
      frame,
      cuadros,
      recorrido.map((t) => t.y),
    ) * alto;
  const opacidad =
    avance(frame, primero.frame - 12, 12) * (1 - avance(frame, ultimo.frame + 24, 14));
  if (opacidad <= 0) return null;

  const clic = tramos.find(
    (t) => t.clic && frame >= t.frame && frame < t.frame + DURACION_CLIC * 2,
  );
  const tClic = clic ? (frame - clic.frame) / DURACION_CLIC : -1;
  const pulsacion = tClic >= 0 && tClic < 1 ? 1 - 0.14 * Math.sin(tClic * Math.PI) : 1;
  const onda = clic ? interpolate(frame - clic.frame, [0, DURACION_CLIC * 2], [0, 1]) : 0;

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, opacity: opacidad, pointerEvents: 'none' }}
    >
      {clic ? (
        <div
          style={{
            position: 'absolute',
            left: -40 * onda,
            top: -40 * onda,
            width: 80 * onda,
            height: 80 * onda,
            borderRadius: '50%',
            border: `3px solid ${colores.indigo}`,
            opacity: 1 - onda,
          }}
        />
      ) : null}
      <svg
        width={34}
        height={40}
        viewBox="0 0 34 40"
        style={{
          position: 'absolute',
          left: -4,
          top: -3,
          transform: `scale(${pulsacion})`,
          transformOrigin: '4px 3px',
          filter: 'drop-shadow(0 6px 10px rgba(3, 6, 25, 0.45))',
        }}
      >
        <path
          d="M4 3 L4 32 L11.5 25 L16.5 36.5 L21.5 34.3 L16.6 23 L27 23 Z"
          fill={colores.blanco}
          stroke={colores.noche}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
