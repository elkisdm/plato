import React from 'react';
import type { Zona } from '../assets';
import type { AssetServido as DatosCaptura } from '../proyecto';
import { Aparicion } from './Aparicion';
import { Captura } from './Captura';
import { useVertical } from './formato';
import { MarcoNavegador } from './MarcoNavegador';
import { MarcoTelefono } from './MarcoTelefono';
import type { TramoPuntero } from './Puntero';
import type { ResaltadoConfig } from './Resaltado';

type Props = {
  url: string;
  escritorio: DatosCaptura;
  recorte?: Zona;
  movil: DatosCaptura;
  colorBarraMovil: string;
  resaltados: ResaltadoConfig[];
  resaltadosMovil?: ResaltadoConfig[];
  puntero?: TramoPuntero[];
  inicioTelefono: number;
  /** Distancia desde arriba a la que se ubica el teléfono, en px. */
  topTelefono: { horizontal: number; vertical: number };
  duracion: number;
};

/** Versión de escritorio en un navegador y la de celular entrando por la derecha. */
export const NavegadorYTelefono: React.FC<Props> = ({
  url,
  escritorio,
  recorte,
  movil,
  colorBarraMovil,
  resaltados,
  resaltadosMovil,
  puntero,
  inicioTelefono,
  topTelefono,
  duracion,
}) => {
  const vertical = useVertical();
  const anchoNavegador = vertical ? 940 : 920;
  const anchoMovil = vertical ? 300 : 250;
  const ancho = vertical ? 940 : 1070;
  const alto = vertical ? 1140 : 900;

  return (
    <div style={{ position: 'relative', width: ancho, height: alto }}>
      <Aparicion inicio={6} style={{ position: 'absolute', left: 0, top: 0 }}>
        <MarcoNavegador url={url} ancho={anchoNavegador}>
          <Captura
            captura={escritorio}
            ancho={anchoNavegador}
            recorte={recorte}
            resaltados={resaltados}
            puntero={puntero}
            kenBurnsFrames={duracion}
          />
        </MarcoNavegador>
      </Aparicion>
      <Aparicion
        inicio={inicioTelefono}
        desdeX={320}
        desdeY={0}
        style={{
          position: 'absolute',
          right: 0,
          top: vertical ? topTelefono.vertical : topTelefono.horizontal,
        }}
      >
        <MarcoTelefono
          ancho={anchoMovil}
          alto={(anchoMovil * movil.alto) / movil.ancho}
          colorBarra={colorBarraMovil}
        >
          <Captura captura={movil} ancho={anchoMovil} resaltados={resaltadosMovil} />
        </MarcoTelefono>
      </Aparicion>
    </div>
  );
};
