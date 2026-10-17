import React from 'react';
import { AbsoluteFill, interpolate, random } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { useMarca } from '../marca';

/**
 * Glitch de cinta VHS: las dos escenas tiemblan con separación de color y una franja de tracking
 * cruza la pantalla; el cambio ocurre en el centro del glitch.
 */
const Vhs: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const { colores } = useMarca();
  const sale = presentationDirection === 'exiting';
  const fuerza = 1 - Math.abs(p * 2 - 1); // máxima a mitad del cruce
  const paso = Math.floor(p * 24);
  const dx = (random(`vx${paso}`) - 0.5) * 90 * fuerza;
  const sep = 14 * fuerza;
  const opacidad = sale
    ? interpolate(p, [0.4, 0.55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(p, [0.45, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <AbsoluteFill
        // Sin glitch, sin filtro: un filtro activo rasteriza los halos de texto en rectángulos.
        style={
          fuerza > 0.02
            ? {
                transform: `translateX(${dx}px) skewX(${(random(`vs${paso}`) - 0.5) * 8 * fuerza}deg)`,
                filter: `drop-shadow(${sep}px 0 0 ${colores.indigo}) drop-shadow(${-sep}px 0 0 ${colores.cian})`,
              }
            : undefined
        }
      >
        {children}
      </AbsoluteFill>
      {sale ? null : (
        <AbsoluteFill
          style={{
            top: `${(random(`vt${paso}`) * 90).toFixed(1)}%`,
            height: `${(4 + 10 * fuerza).toFixed(1)}%`,
            background: `repeating-linear-gradient(90deg, color-mix(in srgb, ${colores.blanco} 35%, transparent) 0 3px, transparent 3px 9px)`,
            opacity: fuerza,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const vhs = (): TransitionPresentation<Record<string, never>> => ({
  component: Vhs,
  props: {},
});
