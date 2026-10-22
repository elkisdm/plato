import { describe, expect, it } from 'vitest';

import { crearParticulas, posicionParticula } from './particulas';

describe('crearParticulas', () => {
  it('es determinista y respeta la cantidad', () => {
    const a = crearParticulas(40, 'x');
    expect(a).toHaveLength(40);
    expect(crearParticulas(40, 'x')).toEqual(a);
    expect(crearParticulas(40, 'y')).not.toEqual(a);
  });

  it('cada partícula tiene parámetros acotados', () => {
    crearParticulas(60, 'z').forEach((p) => {
      expect(p.x0).toBeGreaterThanOrEqual(0);
      expect(p.x0).toBeLessThanOrEqual(1080);
      expect(p.radio).toBeGreaterThanOrEqual(1);
      expect(p.radio).toBeLessThanOrEqual(5);
      expect(p.velocidad).toBeGreaterThan(0);
    });
  });
});

describe('posicionParticula', () => {
  const [p] = crearParticulas(1, 'q');

  it('sube con el tiempo y se reinicia por abajo (envuelve)', () => {
    const a = posicionParticula(p!, 0);
    const b = posicionParticula(p!, 30);
    const dy = (b.y - a.y + 2300) % 2300;
    expect(dy).toBeGreaterThan(0);
    for (let f = 0; f < 2000; f += 13) {
      const q = posicionParticula(p!, f);
      expect(q.y).toBeGreaterThanOrEqual(-100);
      expect(q.y).toBeLessThanOrEqual(2020);
      expect(q.x).toBeGreaterThan(-100);
      expect(q.x).toBeLessThan(1180);
      expect(q.alfa).toBeGreaterThanOrEqual(0);
      expect(q.alfa).toBeLessThanOrEqual(1);
    }
  });

  it('es determinista', () => {
    expect(posicionParticula(p!, 77)).toEqual(posicionParticula(p!, 77));
  });
});
