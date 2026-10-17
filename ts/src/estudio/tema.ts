import { Easing } from 'remotion';

/**
 * Tokens de movimiento y forma comunes a todas las marcas. Los colores y las tipografías
 * NO van aquí: vienen de la marca del proyecto (`useMarca`).
 */
export const FPS = 30;

/** Curva única del estudio: salida rápida, llegada muy suave. */
export const suave = Easing.bezier(0.16, 1, 0.3, 1);

/** Duraciones de movimiento, en frames. */
export const tiempos = {
  entrada: 22,
  entradaCorta: 18,
  transicion: 18,
  escalonado: 5,
} as const;

/** Resorte sin rebote para entradas de tarjetas y capturas. */
export const resorte = { damping: 200, mass: 0.9, stiffness: 120 } as const;

export const radios = { tarjeta: 24, telefono: 56 } as const;

export const sombraTarjeta =
  '0 40px 90px -30px rgba(3, 6, 25, 0.75), 0 18px 40px -20px rgba(3, 6, 25, 0.55)';
