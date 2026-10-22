import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { entre } from '../lib/motion';

const FUNDIDO = 10;

type Props = {
  desde: number;
  hasta: number;
  /** false en la primera escena: el cuadro 0 es la miniatura del reel y no puede salir vacío. */
  fundirEntrada?: boolean;
  /** false en la última escena: el cierre se sostiene completo, sin apagarse a negro. */
  fundirSalida?: boolean;
  children: ReactNode;
};

/**
 * Monta los hijos solo con el frame global en [desde, hasta) y aplica un fundido de 10 frames
 * en la entrada y la salida (salvo que se desactiven). No usa <Sequence>: los hijos siguen leyendo el frame global.
 */
export const Escena = ({
  desde,
  hasta,
  fundirEntrada = true,
  fundirSalida = true,
  children,
}: Props) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= hasta) return null;
  const opacity = Math.min(
    fundirEntrada ? entre(frame, desde, desde + FUNDIDO) : 1,
    fundirSalida ? 1 - entre(frame, hasta - FUNDIDO, hasta) : 1,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
