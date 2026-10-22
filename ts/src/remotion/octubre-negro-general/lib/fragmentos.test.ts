import { describe, expect, it } from 'vitest';

import { estadoFragmento } from './fragmentos';

const base = { semilla: 'test', velocidad: 12, gravedad: 0.8, vida: 24 };

describe('estadoFragmento', () => {
  it('nace en el origen y es null fuera de su vida', () => {
    const e = estadoFragmento(0, 3, base)!;
    expect(e.x).toBeCloseTo(0);
    expect(e.y).toBeCloseTo(0);
    expect(estadoFragmento(-1, 3, base)).toBeNull();
    expect(estadoFragmento(24, 3, base)).toBeNull();
  });

  it('se aleja y con gravedad termina más abajo de lo que iría sin ella', () => {
    const con = estadoFragmento(20, 5, base)!;
    const sin = estadoFragmento(20, 5, { ...base, gravedad: 0 })!;
    expect(con.y).toBeGreaterThan(sin.y);
    expect(Math.hypot(sin.x, sin.y)).toBeGreaterThan(50);
  });

  it('la opacidad baja con el tiempo', () => {
    expect(estadoFragmento(2, 1, base)!.opacidad).toBeGreaterThan(estadoFragmento(20, 1, base)!.opacidad);
  });

  it('es determinista y cada fragmento tiene su propio rumbo', () => {
    expect(estadoFragmento(9, 2, base)).toEqual(estadoFragmento(9, 2, base));
    const a = estadoFragmento(9, 2, base)!;
    const b = estadoFragmento(9, 3, base)!;
    expect(a.x === b.x && a.y === b.y).toBe(false);
  });
});
