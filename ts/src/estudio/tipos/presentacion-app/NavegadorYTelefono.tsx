import React from 'react';
import { NavegadorYTelefono as Encuadre } from '../../kit/NavegadorYTelefono';
import { Plano } from '../../kit/Plano';
import { framesDe, useAsset, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';
import { punteroDe, resaltadosDe, zonaRef } from './zonas';

/** Escritorio en un navegador (opcionalmente recortado) y su versión móvil entrando por la derecha. */
export const NavegadorYTelefono: React.FC<{
  escena: Escena;
  props: PropsDe<'navegadorYTelefono'>;
}> = ({ escena, props }) => {
  const { voz } = useProyecto();
  const escritorio = useAsset(props.escritorio);
  const movil = useAsset(props.movil);
  return (
    <Plano escena={escena}>
      <Encuadre
        url={props.url}
        escritorio={escritorio}
        recorte={props.recorte ? zonaRef(escritorio, props.recorte) : undefined}
        movil={movil}
        colorBarraMovil={props.colorBarraMovil}
        duracion={framesDe(escena, voz)}
        inicioTelefono={props.inicioTelefono}
        topTelefono={props.topTelefono}
        resaltados={resaltadosDe(escritorio, props.resaltados)}
        resaltadosMovil={resaltadosDe(movil, props.resaltadosMovil)}
        puntero={punteroDe(escritorio, props.puntero)}
      />
    </Plano>
  );
};
