import React from 'react';
import { Cuadricula as Encuadre } from '../../kit/Cuadricula';
import type { Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

export const Cuadricula: React.FC<{ escena: Escena; props: PropsDe<'cuadricula'> }> = ({
  escena,
  props,
}) => <Encuadre escena={escena} puntos={props.puntos} columnas={props.columnas} />;
