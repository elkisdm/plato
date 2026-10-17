import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { BotonLlamado } from '../../kit/BotonLlamado';
import { useVertical } from '../../kit/formato';
import { IconoMarca } from '../../kit/TarjetaIcono';
import { TelefonoCaptura } from '../../kit/TelefonoCaptura';
import { TituloSerif } from '../../kit/TituloSerif';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { tiempos } from '../../tema';
import type { PropsDe } from './esquemas';
import { zonaRef } from './zonas';

/** Cierre que vuelve al teléfono del inicio: la tarjeta de la persona de contacto, los pasos, el botón, la URL y el logo. */
export const Regreso: React.FC<{ escena: Escena; props: PropsDe<'regreso'> }> = ({
  escena,
  props,
}) => {
  useCurrentFrame();
  const vertical = useVertical();
  const marca = useMarca();
  const { colores, fuentes } = marca;
  const captura = useAsset(props.captura);
  const logo = useAsset(logoDe(marca, 'color'));
  const tarjeta = captura.zonas.tarjeta ? zonaRef(captura, 'tarjeta') : undefined;
  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 60 : 110,
        padding: vertical ? '90px 70px' : '0 150px',
      }}
    >
      <Aparicion enfoque desdeY={40}>
        <div style={{ transform: 'rotate(-2deg)' }}>
          <TelefonoCaptura
            captura={captura}
            ancho={vertical ? 340 : 400}
            resaltados={tarjeta ? [{ zona: tarjeta, inicio: 20 }] : []}
          />
        </div>
      </Aparicion>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          alignItems: vertical ? 'center' : 'flex-start',
          maxWidth: 820,
        }}
      >
        <TituloSerif
          titulo={escena.titulo}
          tamano={vertical ? 88 : 92}
          alineacion={vertical ? 'center' : 'left'}
          anchoMaximo={820}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: vertical ? 14 : 22,
          }}
        >
          {props.pasos.map((p, i) => (
            <Aparicion
              key={p.titulo}
              inicio={props.pasosEn?.[i] ?? 24 + i * tiempos.escalonado * 3}
              desdeY={20}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {p.icono ? <IconoMarca nombre={p.icono} tamano={52} /> : null}
                <span
                  style={{
                    fontFamily: fuentes.ui,
                    fontSize: 26,
                    fontWeight: 600,
                    color: colores.noche,
                  }}
                >
                  {p.titulo}
                </span>
              </div>
            </Aparicion>
          ))}
        </div>
        <Aparicion
          inicio={props.botonEn}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: vertical ? 'center' : 'flex-start',
            gap: 18,
          }}
        >
          <BotonLlamado texto={props.boton} />
          <span
            style={{ fontFamily: fuentes.ui, fontSize: 28, fontWeight: 500, color: colores.navy }}
          >
            {escena.texto}
          </span>
        </Aparicion>
        <Aparicion inicio={props.logoEn} desdeY={16}>
          <Img src={logo.src} style={{ width: 150, display: 'block' }} />
        </Aparicion>
      </div>
    </AbsoluteFill>
  );
};
