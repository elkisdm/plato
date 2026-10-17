import React from 'react';
import { DiagramaConexion } from '../../kit/DiagramaConexion';
import { useVertical } from '../../kit/formato';
import { Plano } from '../../kit/Plano';
import type { Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

export const Diagrama: React.FC<{ escena: Escena; props: PropsDe<'diagrama'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  return (
    <Plano escena={escena}>
      <DiagramaConexion
        ancho={vertical ? 940 : 1070}
        alto={vertical ? 680 : 760}
        nodos={props.nodos}
        conexiones={props.conexiones}
      />
    </Plano>
  );
};
