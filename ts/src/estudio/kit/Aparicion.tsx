import React from 'react';
import { FPS } from '../tema';
import { entrada } from './animacion';
import { useCuadro } from './tiempo';

type Props = {
  inicio?: number;
  /** Desde dónde llega, en px. */
  desdeX?: number;
  desdeY?: number;
  style?: React.CSSProperties;
  /** Gesto firma de la v3: además de subir, pasa de desenfocado a nítido. */
  enfoque?: boolean;
  children: React.ReactNode;
};

/** Entrada sin rebote: sube (o llega de lado), se aclara y termina de crecer. */
export const Aparicion: React.FC<Props> = ({
  inicio = 0,
  desdeX = 0,
  desdeY = 50,
  style,
  enfoque = false,
  children,
}) => {
  const frame = useCuadro();
  const t = entrada(frame, FPS, inicio);
  return (
    <div
      style={{
        ...style,
        opacity: t,
        transform: `translate(${(1 - t) * desdeX}px, ${(1 - t) * desdeY}px) scale(${0.97 + 0.03 * t})`,
        ...(enfoque ? { filter: `blur(${(1 - t) * 10}px)` } : {}),
      }}
    >
      {children}
    </div>
  );
};
