import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Fondo } from '../../kit/Fondo';
import { useCuadro } from '../../kit/tiempo';
import { useMarca } from '../../marca';

/**
 * Fondo del tipo «comercial»: el de la marca con profundidad. Dos luces de color derivan muy lento y
 * una grilla de puntos se desliza apenas por detrás (paralaje), así el fondo respira sin distraer.
 */
export const FondoComercial: React.FC = () => {
  const frame = useCuadro();
  const { colores } = useMarca();
  const luz = (color: string, alfa: string, fase: number, ancho: number) =>
    `radial-gradient(${ancho}% ${ancho * 0.8}% at ${50 + Math.sin(frame / 160 + fase) * 34}% ${50 + Math.cos(frame / 200 + fase * 1.7) * 30}%, ${color}${alfa}, transparent 70%)`;
  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill
        style={{
          background: `${luz(colores.indigo, '2E', 0, 42)}, ${luz(colores.cian, '14', 2.4, 34)}`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(233, 237, 255, 0.07) 1.4px, transparent 1.6px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `${-frame * 0.12}px ${-frame * 0.06}px`,
          maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent 85%)',
        }}
      />
    </AbsoluteFill>
  );
};
