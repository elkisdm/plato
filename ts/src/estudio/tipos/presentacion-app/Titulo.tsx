import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { avance } from '../../kit/animacion';
import { useVertical } from '../../kit/formato';
import { TituloSerif } from '../../kit/TituloSerif';
import { useMarca } from '../../marca';
import { framesDe, inicioVoz, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

/** Título editorial grande y solo, que entra con la voz; el hilo cian arranca y sale por la derecha. */
export const Titulo: React.FC<{ escena: Escena; props: PropsDe<'titulo'> }> = ({
  escena,
  props,
}) => {
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const { colores } = useMarca();
  const { voz } = useProyecto();
  const total = framesDe(escena, voz);
  const hilo = avance(frame, total - 34, 30);
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: vertical ? '0 70px' : '0 160px',
      }}
    >
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        inicio={Math.max(0, inicioVoz(escena) - 4)}
        tamano={vertical ? 104 : 112}
        alineacion="center"
        anchoMaximo={vertical ? 940 : 1450}
      />
      {props.hilo ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: vertical ? '70%' : '74%',
            height: 2,
            width: `${hilo * 50}%`,
            background: colores.cian,
            borderRadius: 2,
            boxShadow: `0 0 12px ${colores.cian}`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
