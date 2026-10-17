import React from 'react';
import type { Zona } from '../assets';
import type { AssetServido as DatosCaptura } from '../proyecto';
import { radios, sombraTarjeta } from '../tema';
import { Aparicion } from './Aparicion';
import { Captura } from './Captura';
import type { TramoPuntero } from './Puntero';
import type { ResaltadoConfig } from './Resaltado';

type Props = {
  captura: DatosCaptura;
  /** Parte de la captura que se amplía. */
  zona: Zona;
  ancho: number;
  inicio: number;
  resaltados?: ResaltadoConfig[];
  puntero?: TramoPuntero[];
  style?: React.CSSProperties;
};

/** Detalle ampliado de una captura real: la misma imagen, más grande, en una tarjeta que entra encima. */
export const Lupa: React.FC<Props> = ({
  captura,
  zona,
  ancho,
  inicio,
  resaltados,
  puntero,
  style,
}) => (
  <Aparicion inicio={inicio} desdeY={60} style={style}>
    <div
      style={{
        borderRadius: radios.tarjeta,
        overflow: 'hidden',
        boxShadow: `${sombraTarjeta}, 0 0 0 1px rgba(255, 255, 255, 0.12)`,
      }}
    >
      <Captura
        captura={captura}
        ancho={ancho}
        recorte={zona}
        resaltados={resaltados}
        puntero={puntero}
      />
    </div>
  </Aparicion>
);
