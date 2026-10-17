import { tiempos } from '../../tema';

/** Mitad del cruce entre escenas (cuadros base): lo que cada escena cede al vecino. */
const MEDIO_CRUCE = Math.round(tiempos.transicion / 2);
/** Cuadros que tarda el primer plano en aparecer una vez abierta su mitad del cruce. */
const APARICION = 12;

const fijar = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * Opacidad del primer plano (títulos, tarjetas, subtítulos) de una escena en el cuadro `frame` (base
 * 30) de un tramo de `total` cuadros. Solo el fondo y la foto se cruzan; el primer plano de cada
 * escena se oculta durante su mitad del cruce, así nunca hay textos de dos escenas a la vez.
 * La primera escena no tiene cruce de entrada ni la última de salida.
 */
export const opacidadPrimerPlano = (
  frame: number,
  total: number,
  conCruceEntra: boolean,
  conCruceSale: boolean,
): number => {
  const inicio = conCruceEntra ? MEDIO_CRUCE : 0;
  const fin = conCruceSale ? total - MEDIO_CRUCE : total;
  if (frame < inicio || frame >= fin) return 0;
  const entra = conCruceEntra ? fijar((frame - inicio) / APARICION) : 1;
  const sale = conCruceSale ? fijar((fin - frame) / MEDIO_CRUCE) : 1;
  return Math.min(entra, sale);
};
