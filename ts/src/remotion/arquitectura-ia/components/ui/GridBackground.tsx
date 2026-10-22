import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { COLORS } from '../../constants/theme';

/**
 * Lienzo de fondo: retícula de puntos muy tenue con deriva lenta (parallax
 * leve) y viñeta suave. Da la sensación de "canvas de herramienta" sin ruido.
 */
export function GridBackground() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.3px, transparent 1.3px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `0px ${-frame * 0.12}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${COLORS.bg} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}
