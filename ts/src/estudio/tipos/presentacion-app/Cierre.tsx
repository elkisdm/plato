import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { useVertical } from '../../kit/formato';
import { TituloSerif } from '../../kit/TituloSerif';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

/** Cierre simple: el título y, después, el logo. */
export const Cierre: React.FC<{ escena: Escena; props: PropsDe<'cierre'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const marca = useMarca();
  const logo = useAsset(logoDe(marca, 'blanco'));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <TituloSerif
        titulo={escena.titulo}
        tamano={vertical ? 112 : 128}
        alineacion="center"
        anchoMaximo={vertical ? 900 : 1600}
      />
      <Aparicion inicio={props.logoEn} desdeY={20} style={{ marginTop: vertical ? 140 : 110 }}>
        <Img src={logo.src} style={{ width: 150, display: 'block' }} />
      </Aparicion>
    </AbsoluteFill>
  );
};
