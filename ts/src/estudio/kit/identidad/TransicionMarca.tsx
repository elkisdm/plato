import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { useMarca } from '../../marca';
import { useCuadro } from '../tiempo';
import { useUnidad } from './unidad';

type Props = {
  /** Cuadro (base 30) en que arranca el barrido. */
  en?: number;
  duracion?: number;
};

/** Barrido corto en índigo de la marca, inclinado, que cruza el cuadro de izquierda a derecha. */
export const TransicionMarca: React.FC<Props> = ({ en = 0, duracion = 16 }) => {
  const { colores } = useMarca();
  const frame = useCuadro();
  const { u } = useUnidad();
  const t = (frame - en) / duracion;
  if (t <= 0 || t >= 1) return null;
  const x = Easing.inOut(Easing.cubic)(t);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          bottom: '-10%',
          width: '150%',
          left: `${-150 + x * 250}%`,
          transform: 'skewX(-12deg)',
          background: `linear-gradient(90deg, ${colores.indigo}, ${colores.navy})`,
          borderRight: `${10 * u}px solid ${colores.cian}`,
        }}
      />
    </AbsoluteFill>
  );
};
