/**
 * Marcador de rodillo (E01): cada dígito es una columna que gira y frena hasta aterrizar sobre su valor.
 * `posicion` se mide en dígitos recorridos (continuo); el dígito visible es `Math.round(pos) % 10`.
 */

/** Frames que tarda en asentarse el rebote posterior al aterrizaje. */
const ASENTAR = 18;

/** Posición continua del rodillo: 0 antes de `ini`, frena en curva hasta `total` en `aterriza` y rebasa un poco. */
export function posicionRodillo(frame: number, ini: number, aterriza: number, total: number): number {
  if (frame <= ini) return 0;
  if (frame < aterriza) {
    const p = (frame - ini) / (aterriza - ini);
    return total * (1 - Math.pow(1 - p, 3.2));
  }
  const k = frame - aterriza;
  if (k >= ASENTAR) return total;
  return total + 0.22 * Math.exp(-k / 3.5) * Math.sin(k * 0.9);
}

/** Dígitos por frame (valor absoluto): sirve para el desenfoque de movimiento. */
export function velocidadRodillo(frame: number, ini: number, aterriza: number, total: number): number {
  if (frame <= ini || frame >= aterriza + ASENTAR) return 0;
  return Math.abs(
    posicionRodillo(frame, ini, aterriza, total) - posicionRodillo(frame - 1, ini, aterriza, total),
  );
}
