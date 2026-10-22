/**
 * Balanza física (E03): el ángulo de la viga es la suma de respuestas de resorte amortiguado a cada
 * cambio de objetivo, así oscila y se asienta en vez de interpolar en línea recta.
 */

export type PasoBalanza = { frame: number; grados: number };

/** Constante de amortiguación (frames) y pulsación de la oscilación. */
const TAU = 9;
const OMEGA = 0.34;

/** Respuesta al escalón unitario de un oscilador subamortiguado: 0 en dt=0, rebasa 1 y se asienta. */
const escalon = (dt: number): number => (dt <= 0 ? 0 : 1 - Math.exp(-dt / TAU) * Math.cos(OMEGA * dt));

/** Ángulo (grados, + = baja el lado derecho) en `frame`, dados los objetivos sucesivos. */
export function anguloBalanza(frame: number, pasos: PasoBalanza[]): number {
  let previo = 0;
  let total = 0;
  for (const p of pasos) {
    total += (p.grados - previo) * escalon(frame - p.frame);
    previo = p.grados;
  }
  return total;
}
