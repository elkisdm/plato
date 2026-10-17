import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useMarca } from '../marca';

const grano = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** El mundo del cliente: papel hueso cálido, luz suave arriba a la izquierda y grano estático sutil. */
export const FondoDia: React.FC = () => {
  const { colores } = useMarca();
  return (
    <AbsoluteFill style={{ background: colores.hueso }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(90% 80% at 18% 12%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 60%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, rgba(0, 0, 0, 0) 55%, rgba(60, 48, 30, 0.10) 100%)',
        }}
      />
      <AbsoluteFill style={{ backgroundImage: grano, opacity: 0.35, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};
