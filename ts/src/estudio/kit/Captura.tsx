import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import type { Zona } from '../assets';
import type { AssetServido as DatosCaptura } from '../proyecto';
import { kenBurns, porTramos } from './animacion';
import { Puntero, type TramoPuntero } from './Puntero';
import { Resaltado, type ResaltadoConfig } from './Resaltado';

/** En `frame`, la proporción `foco` de la imagen queda centrada en la ventana visible. */
export type Desplazamiento = { frame: number; foco: number };

type Props = {
  captura: DatosCaptura;
  /** Ancho en pantalla, en px. */
  ancho: number;
  /** Alto de la ventana visible; por defecto, la imagen completa (o el recorte). */
  altoVisible?: number;
  /** Muestra solo esta parte de la imagen, escalada al `ancho`. */
  recorte?: Zona;
  desplazamiento?: Desplazamiento[];
  resaltados?: ResaltadoConfig[];
  puntero?: TramoPuntero[];
  /** Duración de la toma para el zoom lento; sin valor, no hay zoom. */
  kenBurnsFrames?: number;
};

/**
 * Captura real con recorte, scroll, zoom lento, resaltados y puntero.
 * Las zonas del resaltado y del puntero siempre están en proporción a la imagen completa.
 */
export const Captura: React.FC<Props> = ({
  captura,
  ancho,
  altoVisible,
  recorte = { x: 0, y: 0, w: 1, h: 1 },
  desplazamiento = [],
  resaltados = [],
  puntero,
  kenBurnsFrames,
}) => {
  const frame = useCurrentFrame();
  // Tamaño de la imagen completa a la escala en que se ve el recorte.
  const anchoImagen = ancho / recorte.w;
  const altoImagen = (anchoImagen * captura.alto) / captura.ancho;
  const visible = altoVisible ?? altoImagen * recorte.h;
  const maximo = Math.max(0, altoImagen - visible);
  const offsets = desplazamiento.map((d) =>
    Math.min(maximo, Math.max(0, d.foco * altoImagen - visible / 2)),
  );
  const offsetY =
    desplazamiento.length > 1
      ? porTramos(
          frame,
          desplazamiento.map((d) => d.frame),
          offsets,
        )
      : (offsets[0] ?? recorte.y * altoImagen);
  const escala = kenBurnsFrames ? kenBurns(frame, kenBurnsFrames) : 1;

  return (
    <div style={{ position: 'relative', width: ancho, height: visible, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${escala})`, transformOrigin: '50% 50%', height: visible }}>
        <div
          style={{
            position: 'relative',
            width: anchoImagen,
            height: altoImagen,
            transform: `translate(${-recorte.x * anchoImagen}px, ${-offsetY}px)`,
          }}
        >
          <Img
            src={captura.src}
            style={{ display: 'block', width: anchoImagen, height: altoImagen }}
          />
          {resaltados.map((r, i) => (
            <Resaltado key={i} {...r} ancho={anchoImagen} alto={altoImagen} />
          ))}
          {puntero ? <Puntero tramos={puntero} ancho={anchoImagen} alto={altoImagen} /> : null}
        </div>
      </div>
    </div>
  );
};
