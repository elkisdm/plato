import React from 'react';
import { AbsoluteFill, OffthreadVideo, useVideoConfig } from 'remotion';
import { useAsset } from '../../proyecto';
import { useCuadro } from '../tiempo';
import { VeloMarca } from './FotoViva';
import { cuadrosDesde, empuje } from './video';

type Props = {
  /** Id del asset de video. */
  video: string;
  /** Segundo de la toma en que arranca. */
  desde?: number;
  velo?: 'suave' | 'fuerte';
  velocidad?: number;
};

/**
 * Toma de video real que llena el lienzo (cover, sin sonido) con un empuje de cámara muy lento
 * (1,00 → 1,06 a lo largo de la escena) para que hasta una toma fija se sienta viva, y el velo de
 * marca encima para que el texto se lea. No sabe de marcas: los colores salen de `VeloMarca`.
 */
export const VideoViva: React.FC<Props> = ({ video, desde = 0, velo = 'suave', velocidad = 1 }) => {
  const toma = useAsset(video);
  const frame = useCuadro();
  const { durationInFrames, fps } = useVideoConfig();
  const p = frame / ((durationInFrames * 30) / fps);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <OffthreadVideo
        src={toma.src}
        muted
        trimBefore={cuadrosDesde(desde, fps)}
        playbackRate={velocidad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${empuje(p)})`,
        }}
      />
      <VeloMarca intensidad={velo} />
    </AbsoluteFill>
  );
};
