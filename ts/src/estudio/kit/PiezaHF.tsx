import React from 'react';
import { AbsoluteFill, OffthreadVideo, useVideoConfig } from 'remotion';
import { useAsset } from '../proyecto';

/** ¿El archivo es un formato con canal alfa (webm/mov)? Decide si el video se pinta con transparencia. */
export const esAlfa = (archivo: string): boolean => /\.(webm|mov)$/i.test(archivo);

type Props = {
  /** Id del asset de video (pieza renderizada con HyperFrames). */
  asset: string;
  /** Segundo del clip desde el que arranca. */
  desde?: number;
  velocidad?: number;
  ajuste?: 'cover' | 'contain';
};

/** Pieza de HyperFrames dentro de una escena: sin sonido, y con transparencia si el archivo es webm/mov. */
export const PiezaHF: React.FC<Props> = ({
  asset,
  desde = 0,
  velocidad = 1,
  ajuste = 'contain',
}) => {
  const { fps } = useVideoConfig();
  const pieza = useAsset(asset);
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <OffthreadVideo
        src={pieza.src}
        muted
        transparent={esAlfa(pieza.archivo)}
        trimBefore={Math.round(desde * fps)}
        playbackRate={velocidad}
        style={{ width: '100%', height: '100%', objectFit: ajuste }}
      />
    </AbsoluteFill>
  );
};
