import { describe, expect, it } from 'vitest';

import { crearChispas, crearMotas, posicionChispa, posicionMota } from './chispas';

describe('crearChispas', () => {
  it('es determinista y devuelve la cantidad pedida', () => {
    const a = crearChispas(20, 'x');
    expect(a).toHaveLength(20);
    expect(crearChispas(20, 'x')).toEqual(a);
    expect(crearChispas(20, 'y')).not.toEqual(a);
  });

  it('reparte los ángulos por todo el círculo', () => {
    const angulos = crearChispas(24, 'x').map((c) => c.angulo);
    expect(Math.max(...angulos) - Math.min(...angulos)).toBeGreaterThan(Math.PI * 1.5);
  });
});

describe('posicionChispa', () => {
  const c = { angulo: 0, velocidad: 10, radio: 4, vida: 20 };

  it('no existe antes de nacer ni después de su vida', () => {
    expect(posicionChispa(c, -1)).toBeNull();
    expect(posicionChispa(c, 20)).toBeNull();
  });

  it('nace en el origen, se aleja frenando y se apaga', () => {
    const p0 = posicionChispa(c, 0)!;
    expect(p0.x).toBeCloseTo(0);
    const p5 = posicionChispa(c, 5)!;
    const p10 = posicionChispa(c, 10)!;
    const p19 = posicionChispa(c, 19)!;
    expect(p5.x).toBeGreaterThan(0);
    expect(p10.x).toBeGreaterThan(p5.x);
    expect(p10.x - p5.x).toBeLessThan(p5.x - p0.x);
    expect(p19.alfa).toBeLessThan(p5.alfa);
  });
});

describe('motas', () => {
  it('son deterministas y quedan dentro del recuadro en cualquier frame', () => {
    const m = crearMotas(30, 'polvo', 840, 1250);
    expect(crearMotas(30, 'polvo', 840, 1250)).toEqual(m);
    for (const f of [0, 77, 400, 1500]) {
      for (const mota of m) {
        const p = posicionMota(mota, f, 840, 1250);
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(840);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(1250);
        expect(p.alfa).toBeGreaterThanOrEqual(0);
        expect(p.alfa).toBeLessThanOrEqual(1);
      }
    }
  });

  it('se mueven con el tiempo (nada congelado)', () => {
    const [mota] = crearMotas(1, 'polvo', 840, 1250);
    const a = posicionMota(mota!, 10, 840, 1250);
    const b = posicionMota(mota!, 40, 840, 1250);
    expect(a.y === b.y && a.x === b.x).toBe(false);
  });
});
