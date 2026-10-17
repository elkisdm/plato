import React from 'react';
import { useMarca } from '../marca';
import { interpolate, useCurrentFrame } from 'remotion';
import type { Zona } from '../assets';
import { tiempos } from '../tema';
import { avance } from './animacion';

export type ResaltadoConfig = { zona: Zona; inicio: number; fin?: number };

type Props = ResaltadoConfig & {
  /** Tamaño en px de la imagen sobre la que se dibuja; la zona está en proporción a ella. */
  ancho: number;
  alto: number;
  /** Aire alrededor del elemento, en px. */
  margen?: number;
};

/** Rectángulo índigo que se dibuja sobre el elemento clave, con un halo que respira. */
export const Resaltado: React.FC<Props> = ({ zona, inicio, fin, ancho, alto, margen = 10 }) => {
  const { colores } = useMarca();
  const frame = useCurrentFrame();
  const trazo = avance(frame, inicio, tiempos.entrada + 6);
  const salida = fin === undefined ? 1 : 1 - avance(frame, fin, tiempos.entradaCorta);
  if (frame < inicio || salida <= 0) return null;

  const w = zona.w * ancho + margen * 2;
  const h = zona.h * alto + margen * 2;
  const radio = Math.min(22, h / 2);
  const respiro = 0.75 + 0.25 * Math.sin(((frame - inicio) / 30) * Math.PI);
  const halo = interpolate(trazo, [0.6, 1], [0, 1], { extrapolateLeft: 'clamp' }) * respiro;

  return (
    <div
      style={{
        position: 'absolute',
        left: zona.x * ancho - margen,
        top: zona.y * alto - margen,
        width: w,
        height: h,
        borderRadius: radio,
        opacity: salida,
        background: `rgba(82, 113, 255, ${0.07 * trazo})`,
        boxShadow: `0 0 0 ${8 * halo}px rgba(82, 113, 255, 0.16), 0 0 ${48 * halo}px rgba(82, 113, 255, ${0.45 * halo})`,
        pointerEvents: 'none',
      }}
    >
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <rect
          x={1.5}
          y={1.5}
          width={w - 3}
          height={h - 3}
          rx={radio}
          fill="none"
          stroke={colores.indigo}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - trazo}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
