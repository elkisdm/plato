import React from 'react';
import { useMarca } from '../marca';
import { Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { useAsset } from '../proyecto';
import { radios } from '../tema';
import { entrada } from './animacion';

/** Un punto de una lista: título, una línea de texto y, opcional, un ícono de la marca (por nombre). */
export type Punto = { titulo: string; texto: string; icono?: string };

/** Ícono de la marca por nombre (marca.json → iconos → id de asset). */
export const IconoMarca: React.FC<{ nombre: string; tamano: number }> = ({ nombre, tamano }) => {
  const { iconos } = useMarca();
  const id = iconos[nombre];
  if (!id) throw new Error(`La marca no tiene el ícono «${nombre}»`);
  const icono = useAsset(id);
  return <Img src={icono.src} style={{ width: tamano, height: tamano, flexShrink: 0 }} />;
};

type Props = { punto: Punto; inicio: number; ancho: number; numero?: number };

/** Tarjeta con ícono de marca (o número), título y una línea de texto. */
export const TarjetaIcono: React.FC<Props> = ({ punto, inicio, ancho, numero }) => {
  const { colores, fuentes } = useMarca();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = entrada(frame, fps, inicio);
  // Los íconos de marca miden 112 px: a 64 px CSS quedan casi 1:1 en el render 4K.
  const tamanoIcono = 64;

  return (
    <div
      style={{
        width: ancho,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '28px 32px',
        borderRadius: radios.tarjeta,
        background: colores.blanco,
        boxShadow: '0 30px 70px -30px rgba(3, 6, 25, 0.8)',
        opacity: t,
        transform: `translateY(${(1 - t) * 40}px) scale(${0.97 + 0.03 * t})`,
      }}
    >
      {punto.icono ? (
        <IconoMarca nombre={punto.icono} tamano={tamanoIcono} />
      ) : (
        <div
          style={{
            width: tamanoIcono,
            height: tamanoIcono,
            flexShrink: 0,
            borderRadius: tamanoIcono * 0.28,
            background: colores.indigoSuave,
            color: colores.indigo,
            fontFamily: fuentes.serif,
            fontSize: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {numero}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{ fontFamily: fuentes.ui, fontSize: 28, fontWeight: 600, color: colores.texto }}
        >
          {punto.titulo}
        </span>
        <span
          style={{
            fontFamily: fuentes.ui,
            fontSize: 23,
            lineHeight: 1.4,
            color: colores.textoSecundario,
          }}
        >
          {punto.texto}
        </span>
      </div>
    </div>
  );
};
