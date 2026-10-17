import React, { createContext, useContext } from 'react';
import { AbsoluteFill } from 'remotion';

/** Opacidad del primer plano de la escena actual (la fija el envoltorio del tipo; ver `visibilidad.ts`). */
export const PrimerPlanoContexto = createContext(1);

/**
 * Todo lo que NO es fondo (títulos, tarjetas, zócalo, subtítulos) va aquí: se oculta durante la
 * mitad del cruce que le toca a la escena, de modo que nunca coexisten textos de dos escenas.
 */
export const PrimerPlano: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const opacidad = useContext(PrimerPlanoContexto);
  return (
    <AbsoluteFill style={{ opacity: opacidad, visibility: opacidad > 0 ? 'visible' : 'hidden' }}>
      {children}
    </AbsoluteFill>
  );
};
