import React from 'react';
import {
  getStaticFiles,
  Html5Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { AssetServido as Captura } from '../proyecto';
import { entrada } from './animacion';
import { Puntero, type TramoPuntero } from './Puntero';
import { Resaltado, type ResaltadoConfig } from './Resaltado';

const POP = 'assets/pop.mp3';
const VOLUMEN_POP = 0.5;

export type Mensaje = {
  captura: Captura;
  /** Franja de la captura que forma el globo, en proporción a su alto. */
  desde: number;
  hasta: number;
  inicio: number;
  /** Los globos del cliente llegan desde la derecha. */
  saliente?: boolean;
  resaltados?: ResaltadoConfig[];
  puntero?: TramoPuntero[];
};

type Props = Mensaje & { ancho: number };

/**
 * Un globo de WhatsApp real (una franja de la captura) que entra como mensaje nuevo.
 * Si existe public/assets/pop.mp3, suena al llegar; si no, entra en silencio.
 */
export const BurbujaEntrando: React.FC<Props> = ({
  captura,
  desde,
  hasta,
  inicio,
  saliente = false,
  resaltados = [],
  puntero,
  ancho,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = entrada(frame, fps, inicio);
  const alto = (ancho * captura.alto) / captura.ancho;
  const hayPop = getStaticFiles().some((f) => f.name === POP);

  return (
    <div
      style={{
        position: 'relative',
        width: ancho,
        height: (hasta - desde) * alto,
        opacity: t,
        transform: `translateY(${(1 - t) * 50}px) scale(${0.94 + 0.06 * t})`,
        transformOrigin: saliente ? '90% 30%' : '10% 30%',
      }}
    >
      <div
        style={{ position: 'absolute', left: 0, top: -desde * alto, width: ancho, height: alto }}
      >
        {/* El recorte va solo en la imagen, para que el halo del resaltado no se corte. */}
        <Img
          src={captura.src}
          style={{
            width: ancho,
            height: alto,
            clipPath: `inset(${desde * 100}% 0 ${(1 - hasta) * 100}% 0)`,
          }}
        />
        {resaltados.map((r, i) => (
          <Resaltado key={i} {...r} ancho={ancho} alto={alto} margen={6} />
        ))}
        {puntero ? <Puntero tramos={puntero} ancho={ancho} alto={alto} /> : null}
      </div>
      {hayPop ? (
        <Sequence from={inicio} durationInFrames={fps} layout="none">
          <Html5Audio src={staticFile(POP)} volume={VOLUMEN_POP} />
        </Sequence>
      ) : null}
    </div>
  );
};
