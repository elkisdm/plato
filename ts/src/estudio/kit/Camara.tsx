import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { suave } from '../tema';

type Props = {
  /** Escala al inicio y al final del tramo (1 = sin zoom). */
  desde?: number;
  hasta: number;
  /** Punto hacia el que empuja la cámara, en % del cuadro. */
  origen?: { x: number; y: number };
  /** Frames del tramo; fuera de él la escala queda fija. */
  inicio?: number;
  fin: number;
  children: React.ReactNode;
};

/** Cámara con dirección: empuja (o se aleja) hacia un punto, con la curva de marca. Nunca lineal. */
export const Camara: React.FC<Props> = ({
  desde = 1,
  hasta,
  origen = { x: 50, y: 50 },
  inicio = 0,
  fin,
  children,
}) => {
  const frame = useCurrentFrame();
  const escala = interpolate(frame, [inicio, fin], [desde, hasta], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: suave,
  });
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${escala})`,
        transformOrigin: `${origen.x}% ${origen.y}%`,
      }}
    >
      {children}
    </div>
  );
};
