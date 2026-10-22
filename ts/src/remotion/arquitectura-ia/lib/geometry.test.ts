import { describe, expect, it } from 'vitest';

import {
  anchor,
  chooseSides,
  edgeCurve,
  curveLength,
  pointAtFraction,
  tangentAt,
} from './geometry';

const a = { x: 100, y: 100, width: 200, height: 80 };
const below = { x: 100, y: 400, width: 200, height: 80 };
const right = { x: 600, y: 120, width: 200, height: 80 };

describe('geometry', () => {
  it('ancla en el centro de cada lado (x,y es el centro del nodo)', () => {
    expect(anchor(a, 'top')).toEqual({ x: 100, y: 60 });
    expect(anchor(a, 'bottom')).toEqual({ x: 100, y: 140 });
    expect(anchor(a, 'left')).toEqual({ x: 0, y: 100 });
    expect(anchor(a, 'right')).toEqual({ x: 200, y: 100 });
  });

  it('elige lados verticales cuando el destino está debajo', () => {
    expect(chooseSides(a, below)).toEqual(['bottom', 'top']);
  });

  it('elige lados horizontales cuando el destino está al lado', () => {
    expect(chooseSides(a, right)).toEqual(['right', 'left']);
    expect(chooseSides(right, a)).toEqual(['left', 'right']);
  });

  it('una conexión vertical alineada mide la distancia entre anclas', () => {
    const c = edgeCurve(a, below);
    expect(curveLength(c)).toBeCloseTo(400 - 40 - (100 + 40), 0);
  });

  it('el punto por fracción de arco recorre de ancla a ancla', () => {
    const c = edgeCurve(a, below);
    expect(pointAtFraction(c, 0)).toEqual({ x: 100, y: 140 });
    expect(pointAtFraction(c, 1).y).toBeCloseTo(360, 5);
    expect(pointAtFraction(c, 0.5).y).toBeCloseTo(250, 0);
  });

  it('la tangente al final apunta hacia el nodo destino', () => {
    const t = tangentAt(edgeCurve(a, below), 1);
    expect(t.y).toBeGreaterThan(0);
    expect(Math.abs(t.x)).toBeLessThan(1e-6);
  });

  it('respeta lados forzados', () => {
    const c = edgeCurve(a, right, { fromSide: 'bottom', toSide: 'bottom' });
    expect(c.p0).toEqual({ x: 100, y: 140 });
    expect(c.p3).toEqual({ x: 600, y: 160 });
  });
});
