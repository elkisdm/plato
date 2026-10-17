import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { BotonLlamado } from '../../kit/BotonLlamado';
import { useVertical } from '../../kit/formato';
import { TarjetaIcono } from '../../kit/TarjetaIcono';
import { TituloSerif } from '../../kit/TituloSerif';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { tiempos } from '../../tema';
import type { PropsDe } from './esquemas';

/** Cierre: pasos para activarse, el botón de llamado a la acción, la URL (texto de la escena) y el logo. */
export const Llamado: React.FC<{ escena: Escena; props: PropsDe<'llamado'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const marca = useMarca();
  const { colores, fuentes } = marca;
  const logo = useAsset(logoDe(marca, 'blanco'));
  const ancho = vertical ? 940 : 540;
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 56,
        padding: vertical ? '0 70px' : '0 90px',
      }}
    >
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        tamano={vertical ? 100 : 96}
        alineacion="center"
        anchoMaximo={vertical ? 940 : 1500}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: vertical ? '1fr' : 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {props.pasos.map((p, i) => (
          <TarjetaIcono
            key={p.titulo}
            punto={p}
            ancho={ancho}
            inicio={props.inicioPasos + i * tiempos.escalonado * 3}
          />
        ))}
      </div>
      <Aparicion
        inicio={props.inicioBoton}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}
      >
        <BotonLlamado texto={props.boton} />
        <span
          style={{
            fontFamily: fuentes.ui,
            fontSize: 30,
            fontWeight: 500,
            color: colores.indigoSuave,
          }}
        >
          {escena.texto}
        </span>
      </Aparicion>
      <Aparicion inicio={props.inicioLogo} desdeY={20}>
        <Img src={logo.src} style={{ width: 150, display: 'block' }} />
      </Aparicion>
    </AbsoluteFill>
  );
};
