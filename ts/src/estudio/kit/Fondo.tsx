import React from 'react';
import { useMarca } from '../marca';
import { AbsoluteFill, random } from 'remotion';
import { useCuadro } from './tiempo';

export const grano = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Degradado navy → noche con un grano leve que vibra cada dos frames, como película. */
export const Fondo: React.FC = () => {
  const { colores } = useMarca();
  const frame = useCuadro();
  const paso = Math.floor(frame / 2);
  const dx = Math.round(random(`gx${paso}`) * 256);
  const dy = Math.round(random(`gy${paso}`) * 256);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 78% 8%, ${colores.navy} 0%, ${colores.noche} 58%, #0A0E27 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at 12% 100%, rgba(82, 113, 255, 0.16), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: grano,
          backgroundPosition: `${dx}px ${dy}px`,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};
