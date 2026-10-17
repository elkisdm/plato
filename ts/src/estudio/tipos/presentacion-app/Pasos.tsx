import React from 'react';
import { useVertical } from '../../kit/formato';
import { Plano } from '../../kit/Plano';
import { TarjetaIcono } from '../../kit/TarjetaIcono';
import type { Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

/** Pasos numerados que entran uno a uno, al ritmo de la locución. */
export const Pasos: React.FC<{ escena: Escena; props: PropsDe<'pasos'> }> = ({ escena, props }) => {
  const vertical = useVertical();
  return (
    <Plano escena={escena}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {props.pasos.map((p, i) => (
          <TarjetaIcono
            key={p.titulo}
            punto={p}
            numero={i + 1}
            ancho={vertical ? 940 : 1070}
            inicio={props.primerPaso + i * props.entrePasos}
          />
        ))}
      </div>
    </Plano>
  );
};
