import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { grano } from '../../kit/Fondo';
import { useCuadro } from '../../kit/tiempo';
import { useMarca } from '../../marca';

/**
 * Fondo del tipo «redes»: degradado noche → navy de la marca con dos luces (índigo y cian) que
 * derivan muy lento, y un grano de película que vibra cada dos cuadros. Todo sale de la marca.
 */
export const FondoRedes: React.FC = () => {
  const { colores } = useMarca();
  const frame = useCuadro();
  const paso = Math.floor(frame / 2);
  const dx = Math.round(random(`rx${paso}`) * 256);
  const dy = Math.round(random(`ry${paso}`) * 256);
  const luz = (color: string, alfa: string, fase: number, ancho: number) =>
    `radial-gradient(${ancho}% ${ancho * 0.7}% at ${50 + Math.sin(frame / 140 + fase) * 36}% ${50 + Math.cos(frame / 180 + fase * 1.7) * 32}%, ${color}${alfa}, transparent 70%)`;
  return (
    <AbsoluteFill
      style={{
        background: `${luz(colores.indigo, '55', 0, 60)}, ${luz(colores.cian, '24', 2.4, 46)}, linear-gradient(170deg, ${colores.navy} 0%, ${colores.noche} 75%)`,
      }}
    >
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
