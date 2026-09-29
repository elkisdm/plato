/**
 * Geometría de las conexiones del diagrama.
 *
 * Una conexión es una bezier cúbica entre el centro de un lado del nodo origen
 * y el de un lado del destino; los puntos de control salen perpendiculares a
 * cada lado. La longitud y los puntos por fracción de arco se calculan con una
 * tabla muestreada: así el trazo (strokeDashoffset) y los pulsos dependen solo
 * del frame, sin medir el DOM.
 */

export interface Point {
  x: number;
  y: number;
}

/** Caja de un nodo: x,y es el CENTRO. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface Curve {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

const NORMALS: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function anchor(box: Box, side: Side): Point {
  const n = NORMALS[side];
  return { x: box.x + (n.x * box.width) / 2, y: box.y + (n.y * box.height) / 2 };
}

/** Lados de salida y llegada según hacia dónde está el destino. */
export function chooseSides(from: Box, to: Box): [Side, Side] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dy) >= Math.abs(dx) * 0.5) return dy > 0 ? ['bottom', 'top'] : ['top', 'bottom'];
  return dx > 0 ? ['right', 'left'] : ['left', 'right'];
}

export function edgeCurve(
  from: Box,
  to: Box,
  sides: { fromSide?: Side; toSide?: Side } = {},
): Curve {
  const [autoFrom, autoTo] = chooseSides(from, to);
  const s0 = sides.fromSide ?? autoFrom;
  const s1 = sides.toSide ?? autoTo;
  const p0 = anchor(from, s0);
  const p3 = anchor(to, s1);
  const d = Math.max(30, Math.hypot(p3.x - p0.x, p3.y - p0.y) * 0.45);
  const n0 = NORMALS[s0];
  const n1 = NORMALS[s1];
  return {
    p0,
    p1: { x: p0.x + n0.x * d, y: p0.y + n0.y * d },
    p2: { x: p3.x + n1.x * d, y: p3.y + n1.y * d },
    p3,
  };
}

export function pointAt({ p0, p1, p2, p3 }: Curve, t: number): Point {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/** Derivada de la curva en t (sin normalizar). */
export function tangentAt({ p0, p1, p2, p3 }: Curve, t: number): Point {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

const SAMPLES = 64;

/** Longitudes acumuladas en SAMPLES tramos iguales de t. */
function lengthTable(c: Curve): number[] {
  const table = [0];
  let prev = c.p0;
  for (let i = 1; i <= SAMPLES; i++) {
    const p = pointAt(c, i / SAMPLES);
    table.push(table[i - 1]! + Math.hypot(p.x - prev.x, p.y - prev.y));
    prev = p;
  }
  return table;
}

export function curveLength(c: Curve): number {
  return lengthTable(c)[SAMPLES]!;
}

/** Parámetro t que corresponde a una fracción f (0..1) de la longitud de arco. */
export function tAtFraction(c: Curve, f: number): number {
  const table = lengthTable(c);
  const target = Math.min(1, Math.max(0, f)) * table[SAMPLES]!;
  let i = 1;
  while (i < SAMPLES && table[i]! < target) i++;
  const segment = table[i]! - table[i - 1]!;
  const local = segment === 0 ? 0 : (target - table[i - 1]!) / segment;
  return (i - 1 + local) / SAMPLES;
}

export function pointAtFraction(c: Curve, f: number): Point {
  return pointAt(c, tAtFraction(c, f));
}

export function curvePath({ p0, p1, p2, p3 }: Curve): string {
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}
