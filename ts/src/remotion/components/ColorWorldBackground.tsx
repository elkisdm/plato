import { AbsoluteFill } from 'remotion';

import type { ReactNode } from 'react';

import type { ColorWorld } from '../types';

interface ColorWorldBackgroundProps {
  /** Mundo de color del shot. Si no se pasa, se usa un fondo neutro oscuro. */
  world?: ColorWorld;
  children?: ReactNode;
}

/**
 * Opacidad del tinte de color según la saturación del mundo.
 * High satura al máximo; low casi neutraliza el color dejando ver el base oscuro.
 */
function saturationOpacity(saturation: ColorWorld['saturation']): number {
  switch (saturation) {
    case 'high':
      return 1;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.4;
  }
}

/**
 * Construye el `background` CSS según la temperatura del mundo de color.
 * Cada temperatura evoca un "look" distinto de la firma visual:
 * - warm: low-key cálido (talking-head íntimo).
 * - neutral: crema/papel (collage de papel).
 * - cool: azulado oscuro.
 */
function temperatureBackground(temperature: ColorWorld['temperature']): string {
  switch (temperature) {
    case 'warm':
      return 'radial-gradient(circle at 50% 40%, #2a1d12 0%, #0d0805 100%)';
    case 'neutral':
      return 'radial-gradient(circle at 50% 40%, #efe9dd 0%, #d8cfbd 100%)';
    case 'cool':
      return 'radial-gradient(circle at 50% 40%, #16243a 0%, #060b14 100%)';
  }
}

/**
 * Lego de fondo: pinta un mundo de color (gradiente/tinte) y renderiza
 * los children encima. Sin `world`, cae a un gris oscuro neutro.
 */
export const ColorWorldBackground = (props: ColorWorldBackgroundProps) => {
  const { world, children } = props;

  // Sin mundo definido: fondo gris oscuro neutro, sin tinte de color.
  if (!world) {
    return <AbsoluteFill style={{ backgroundColor: '#111' }}>{children}</AbsoluteFill>;
  }

  return (
    <AbsoluteFill>
      {/* Capa base oscura: garantiza un piso parejo bajo el tinte. */}
      <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }} />
      {/* Capa de color: el gradiente del mundo, modulado por la saturación. */}
      <AbsoluteFill
        style={{
          background: temperatureBackground(world.temperature),
          opacity: saturationOpacity(world.saturation),
        }}
      />
      {/* Contenido encima del fondo. */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
