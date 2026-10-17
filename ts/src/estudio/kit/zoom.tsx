import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

/**
 * «Zoom-through»: la escena que sale crece hacia la cámara y se desvanece; la que entra llega desde
 * un poco más lejos. Se siente como entrar en la pantalla anterior (corte por coincidencia).
 */
const Zoom: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const sale = presentationDirection === 'exiting';
  const escala = sale ? interpolate(p, [0, 1], [1, 1.35]) : interpolate(p, [0, 1], [0.92, 1]);
  const opacidad = sale
    ? interpolate(p, [0, 0.7], [1, 0], { extrapolateRight: 'clamp' })
    : interpolate(p, [0.2, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const desenfoque = sale ? interpolate(p, [0, 1], [0, 12]) : interpolate(p, [0, 1], [8, 0]);
  return (
    <AbsoluteFill
      style={{ transform: `scale(${escala})`, opacity: opacidad, filter: `blur(${desenfoque}px)` }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoom = (): TransitionPresentation<Record<string, never>> => ({
  component: Zoom,
  props: {},
});
