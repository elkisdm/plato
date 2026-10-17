import React, { createContext, useContext } from 'react';
import type { Colores } from './marca';

/** Mundo visual de una escena: «noche» (el del equipo) o «dia» (el del cliente, papel cálido). */
export type Tono = 'noche' | 'dia';

const TonoContexto = createContext<Tono>('noche');

export const TonoProvider: React.FC<{ tono: Tono; children: React.ReactNode }> = ({
  tono,
  children,
}) => React.createElement(TonoContexto.Provider, { value: tono }, children);

export const useTono = (): Tono => useContext(TonoContexto);

/** Colores de texto según el tono: sobre noche, blanco e índigo claro; sobre día, tinta navy e índigo. */
export const tintas = (c: Colores, tono: Tono) =>
  tono === 'dia'
    ? {
        titulo: c.noche,
        cursiva: c.indigo,
        antetitulo: c.indigo,
        texto: c.textoSecundario,
        regla: c.cian,
      }
    : {
        titulo: c.blanco,
        cursiva: c.cursiva,
        antetitulo: c.antetitulo,
        texto: 'rgba(233, 237, 255, 0.78)',
        regla: c.cian,
      };
