import React from 'react';
import { Aparicion } from '../../kit/Aparicion';
import { useVertical } from '../../kit/formato';
import { IlustracionScribe } from '../../kit/IlustracionScribe';
import { Plano } from '../../kit/Plano';
import { useAsset, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

export const Videollamada: React.FC<{ escena: Escena; props: PropsDe<'videollamada'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const captura = useAsset(props.captura);
  return (
    <Plano escena={escena}>
      <Aparicion inicio={4}>
        <IlustracionScribe
          captura={captura}
          ancho={vertical ? 940 : 1070}
          tiempos={props.tiempos}
        />
      </Aparicion>
    </Plano>
  );
};
