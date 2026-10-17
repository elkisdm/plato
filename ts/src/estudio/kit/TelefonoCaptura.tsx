import React from 'react';
import type { AssetServido } from '../proyecto';
import { Captura } from './Captura';
import { MarcoTelefono } from './MarcoTelefono';
import type { TramoPuntero } from './Puntero';
import type { ResaltadoConfig } from './Resaltado';

type Props = {
  captura: AssetServido;
  ancho: number;
  colorBarra?: string;
  resaltados?: ResaltadoConfig[];
  puntero?: TramoPuntero[];
};

/** Un teléfono con una captura móvil real a pantalla completa. */
export const TelefonoCaptura: React.FC<Props> = ({
  captura,
  ancho,
  colorBarra = '#101341',
  resaltados,
  puntero,
}) => (
  <MarcoTelefono
    ancho={ancho}
    alto={(ancho * captura.alto) / captura.ancho}
    colorBarra={colorBarra}
  >
    <Captura captura={captura} ancho={ancho} resaltados={resaltados} puntero={puntero} />
  </MarcoTelefono>
);
