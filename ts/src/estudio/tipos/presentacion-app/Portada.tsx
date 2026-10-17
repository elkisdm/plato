import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { useVertical } from '../../kit/formato';
import { TituloSerif } from '../../kit/TituloSerif';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

/** Portada: logo, título y subtítulo (el texto de la escena), centrados. */
export const Portada: React.FC<{ escena: Escena; props: PropsDe<'portada'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const marca = useMarca();
  const logo = useAsset(logoDe(marca, 'blanco'));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 90 }}>
      {props.logo ? (
        <Aparicion desdeY={20}>
          {/* El logo mide 300 px: a 150 px CSS queda 1:1 en el render 4K. */}
          <Img src={logo.src} style={{ width: 150, display: 'block', margin: '0 auto 80px' }} />
        </Aparicion>
      ) : null}
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        texto={escena.texto}
        inicio={8}
        tamano={vertical ? 118 : 128}
        alineacion="center"
        anchoMaximo={vertical ? 900 : 1600}
      />
    </AbsoluteFill>
  );
};
