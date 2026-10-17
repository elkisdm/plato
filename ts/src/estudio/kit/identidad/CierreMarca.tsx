import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { logoDe, useMarca } from '../../marca';
import { useAsset } from '../../proyecto';
import { Aparicion } from '../Aparicion';
import { TituloSerif } from '../TituloSerif';
import { useUnidad } from './unidad';

type Props = {
  /** Texto del llamado (admite *cursiva*); por defecto `marca.identidad.llamado`. */
  llamado?: string;
  /** Dirección web; por defecto `marca.identidad.url`. */
  url?: string;
  /** Usuario de redes; por defecto `marca.identidad.handle`. */
  handle?: string;
  /** Id del logo; por defecto el logo blanco de la marca. */
  logo?: string;
  /** Hay una toma de video bajo el cierre: el fondo de marca pasa a ser un velo semitransparente. */
  sobreVideo?: boolean;
};

/** Cierre de marca: fondo con los colores de la marca, logo, llamado a la acción y url o handle. */
export const CierreMarca: React.FC<Props> = ({
  llamado,
  url,
  handle,
  logo,
  sobreVideo = false,
}) => {
  const marca = useMarca();
  const { colores, fuentes, identidad } = marca;
  const { u, alto } = useUnidad();
  const imagen = useAsset(logo ?? logoDe(marca, 'blanco'));
  const textoLlamado = llamado ?? identidad?.llamado;
  const textoUrl = url ?? identidad?.url;
  const textoHandle = handle ?? identidad?.handle;

  return (
    <AbsoluteFill
      style={{
        background: sobreVideo
          ? `radial-gradient(90% 55% at 50% 28%, ${colores.indigo}55, transparent 70%), ${colores.noche}59`
          : `radial-gradient(90% 55% at 50% 28%, ${colores.indigo}66, transparent 70%), linear-gradient(180deg, ${colores.navy} 0%, ${colores.noche} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          width: 936 * u,
          marginLeft: -468 * u,
          top: 0,
          height: alto,
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 56 * u,
          textAlign: 'center',
        }}
      >
        <Aparicion desdeY={30 * u}>
          <Img src={imagen.src} style={{ width: 460 * u }} />
        </Aparicion>
        {textoLlamado ? (
          <TituloSerif
            titulo={textoLlamado}
            tamano={116 * u}
            alineacion="center"
            anchoMaximo={936 * u}
            inicio={10}
          />
        ) : null}
        {textoUrl ? (
          <Aparicion inicio={30} desdeY={24 * u}>
            <div
              style={{
                padding: `${22 * u}px ${54 * u}px`,
                borderRadius: 999,
                background: colores.indigo,
                color: colores.blanco,
                fontFamily: fuentes.ui,
                fontWeight: 700,
                fontSize: 44 * u,
                letterSpacing: '0.01em',
              }}
            >
              {textoUrl}
            </div>
          </Aparicion>
        ) : null}
        {textoHandle ? (
          <Aparicion inicio={38} desdeY={20 * u}>
            <div
              style={{
                fontFamily: fuentes.ui,
                fontWeight: 600,
                fontSize: 38 * u,
                letterSpacing: '0.04em',
                color: colores.antetitulo,
              }}
            >
              {textoHandle}
            </div>
          </Aparicion>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
