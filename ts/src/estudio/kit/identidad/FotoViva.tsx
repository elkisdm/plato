import React from 'react';
import { AbsoluteFill, Img, useVideoConfig } from 'remotion';
import { useMarca } from '../../marca';
import { useAsset } from '../../proyecto';
import { useCuadro } from '../tiempo';
import { encuadreFoto, type Movimiento } from './camara';
import { useUnidad } from './unidad';
import { capasVelo, type IntensidadVelo } from './velo';

/**
 * Velo de marca para que el texto se lea sobre una foto o un video (capas en `velo.ts`). Por defecto
 * es el velo largo de las fotos; sobre video real se usa `suave` o `fuerte`.
 */
export const VeloMarca: React.FC<{ intensidad?: IntensidadVelo }> = ({ intensidad = 'foto' }) => {
  const { colores } = useMarca();
  const capas = capasVelo(intensidad, colores);
  return (
    <>
      {capas.tinte ? (
        <AbsoluteFill style={{ background: capas.tinte, mixBlendMode: 'multiply' }} />
      ) : null}
      {capas.global ? <AbsoluteFill style={{ background: capas.global }} /> : null}
      <AbsoluteFill style={{ background: capas.degradados }} />
    </>
  );
};

type Props = {
  /** Id del asset de imagen. */
  asset: string;
  movimiento?: Movimiento;
  /** Contenido (títulos, tarjetas) que va sobre el velo. */
  children?: React.ReactNode;
};

/**
 * Foto con cámara lenta (acercar, alejar o paneo) que llena cualquier formato. Si la foto es mucho
 * más angosta que el lienzo se muestra entera sobre una copia suya desenfocada y escalada, que se
 * mueve en sentido contrario para dar paralaje.
 */
export const FotoViva: React.FC<Props> = ({ asset, movimiento = 'acercar', children }) => {
  const foto = useAsset(asset);
  const { colores } = useMarca();
  const frame = useCuadro();
  const { durationInFrames, fps } = useVideoConfig();
  const { ancho, alto, u } = useUnidad();
  const total = (durationInFrames * 30) / fps;
  const p = Math.min(1, Math.max(0, frame / total));
  const e = encuadreFoto(foto.ancho || ancho, foto.alto || alto, ancho, alto, movimiento, p);
  const posicion: React.CSSProperties = {
    position: 'absolute',
    left: (ancho - e.ancho) / 2,
    top: (alto - e.alto) / 2,
    width: e.ancho,
    height: e.alto,
  };
  return (
    <AbsoluteFill style={{ background: colores.noche, overflow: 'hidden' }}>
      {e.modo === 'contener' ? (
        <Img
          src={foto.src}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1.25 + 0.06 * p}) translateX(${-e.desplazamiento * 0.5}px)`,
            filter: `blur(${32 * u}px) brightness(0.65)`,
          }}
        />
      ) : null}
      <Img
        src={foto.src}
        style={{
          ...posicion,
          transform: `translateX(${e.desplazamiento}px) scale(${e.zoom})`,
        }}
      />
      <VeloMarca />
      {children}
    </AbsoluteFill>
  );
};
