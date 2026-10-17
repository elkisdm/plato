import React from 'react';
import type { AssetServido as DatosCaptura } from '../proyecto';
import { radios, sombraTarjeta } from '../tema';
import { Captura, type Desplazamiento } from './Captura';
import type { TramoPuntero } from './Puntero';
import type { ResaltadoConfig } from './Resaltado';

type Props = {
  captura: DatosCaptura;
  ancho: number;
  altoVisible: number;
  desplazamiento: Desplazamiento[];
  resaltados: ResaltadoConfig[];
  puntero?: TramoPuntero[];
  duracion: number;
};

/** Un correo real en una tarjeta, recortado a una ventana que se desplaza hacia lo importante. */
export const Correo: React.FC<Props> = ({ duracion, ...props }) => (
  <div
    style={{
      borderRadius: radios.tarjeta + 4,
      overflow: 'hidden',
      boxShadow: `${sombraTarjeta}, 0 0 0 1px rgba(255, 255, 255, 0.08)`,
    }}
  >
    <Captura {...props} kenBurnsFrames={duracion} />
  </div>
);
