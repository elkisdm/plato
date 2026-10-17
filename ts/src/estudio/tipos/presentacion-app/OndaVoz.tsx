import React from 'react';
import { Aparicion } from '../../kit/Aparicion';
import { useVertical } from '../../kit/formato';
import { OndaVoz as Onda } from '../../kit/OndaVoz';
import { Plano } from '../../kit/Plano';
import type { Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

export const OndaVoz: React.FC<{ escena: Escena; props: PropsDe<'ondaVoz'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  return (
    <Plano escena={escena}>
      <Aparicion inicio={4}>
        <Onda
          ancho={vertical ? 940 : 1000}
          vertical={vertical}
          mejoras={props.mejoras}
          lineasAntes={props.lineasAntes}
          lineasAhora={props.lineasAhora}
        />
      </Aparicion>
    </Plano>
  );
};
