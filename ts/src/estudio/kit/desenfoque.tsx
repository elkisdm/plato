import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

const fijar = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Estilo de cada escena en el cruce «desenfoque»: la que sale se acerca a la cámara, se desenfoca y
 * se apaga; la que entra llega desde un poco más atrás, desenfocada, y se asienta nítida.
 */
export const estiloDesenfoque = (p: number, sale: boolean) =>
  // `p` ya viene con la curva del estudio (la temporización del cruce): no se vuelve a suavizar, o el
  // cruce se come en su primer tercio y la escena que sale desaparece antes de tiempo.
  sale
    ? {
        // Se apaga en la segunda mitad y la que entra aparece en la primera: el cuadro nunca queda vacío.
        opacidad: interpolate(p, [0.45, 1], [1, 0], fijar),
        escala: interpolate(p, [0, 1], [1, 1.1]),
        desenfoque: interpolate(p, [0, 1], [0, 12]),
      }
    : {
        opacidad: interpolate(p, [0, 0.55], [0, 1], fijar),
        escala: interpolate(p, [0, 1], [0.92, 1]),
        desenfoque: interpolate(p, [0, 1], [10, 0]),
      };

const Desenfoque: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const e = estiloDesenfoque(presentationProgress, presentationDirection === 'exiting');
  return (
    <AbsoluteFill
      style={{
        opacity: e.opacidad,
        transform: `scale(${e.escala})`,
        filter: e.desenfoque > 0.05 ? `blur(${e.desenfoque}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Cruce moderno de cámara: salir hacia adelante y entrar desde atrás, con foco que se ajusta. */
export const desenfoque = (): TransitionPresentation<Record<string, never>> => ({
  component: Desenfoque,
  props: {},
});
