/** Vuelo de la ficha «19 OCT» (E02): trayectoria que acelera hacia su sitio y rastro de posiciones pasadas. */

type Punto = { x: number; y: number };

/** Posición en `frame`: ease-in cuadrático de A a B entre `ini` y `aterriza`, con un arco lateral suave. */
export function posicionVuelo(frame: number, ini: number, aterriza: number, a: Punto, b: Punto): Punto {
  if (frame <= ini) return { ...a };
  if (frame >= aterriza) return { ...b };
  const p = (frame - ini) / (aterriza - ini);
  const t = p * p * (0.4 + 0.6 * p);
  const arco = Math.sin(p * Math.PI) * 90;
  return { x: a.x + (b.x - a.x) * t + arco, y: a.y + (b.y - a.y) * t };
}

/** Fantasmas del rastro: `n` posiciones de los frames anteriores con opacidad decreciente. Vacío fuera del vuelo. */
export function rastroVuelo(
  frame: number,
  ini: number,
  aterriza: number,
  a: Punto,
  b: Punto,
  n: number,
): (Punto & { opacidad: number })[] {
  if (frame <= ini || frame > aterriza) return [];
  return Array.from({ length: n }, (_, k) => ({
    ...posicionVuelo(frame - (k + 1), ini, aterriza, a, b),
    opacidad: 0.5 * (1 - k / n),
  }));
}
