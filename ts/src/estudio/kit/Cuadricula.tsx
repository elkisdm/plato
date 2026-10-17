import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Escena } from '../proyecto';
import { tiempos } from '../tema';
import { useVertical } from './formato';
import { TarjetaIcono, type Punto } from './TarjetaIcono';
import { TituloSerif } from './TituloSerif';

type Props = { escena: Escena; puntos: Punto[]; columnas: number; inicio?: number };

/** Título centrado y tarjetas con ícono que entran en cascada. En vertical, una sola columna. */
export const Cuadricula: React.FC<Props> = ({ escena, puntos, columnas, inicio = 16 }) => {
  const vertical = useVertical();
  const cols = vertical ? 1 : columnas;
  const ancho = vertical ? 940 : (1680 - 28 * (cols - 1)) / cols;
  const desliza = escena.entrada === 'desliza';
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 64,
        padding: vertical ? '0 70px' : '0 120px',
      }}
    >
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        inicio={desliza ? 0 : undefined}
        tamano={vertical ? 96 : 92}
        alineacion="center"
        anchoMaximo={vertical ? 940 : 1500}
      />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${ancho}px)`, gap: 28 }}>
        {puntos.map((p, i) => (
          <TarjetaIcono
            key={p.titulo}
            punto={p}
            ancho={ancho}
            inicio={(desliza ? 0 : inicio) + i * tiempos.escalonado * 3}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
