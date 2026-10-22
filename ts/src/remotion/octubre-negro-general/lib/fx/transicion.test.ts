import { describe, expect, it } from 'vitest';

import { estadoTransicion, varianteTransicion, type VarianteTransicion } from './transicion';

const base = { desde: 100, hasta: 300, solape: 14, variante: 'zoom' as VarianteTransicion };
const ident = { opacity: 1, scale: 1, x: 0, blurX: 0, blurY: 0, cromatica: 0, flash: 0 };

describe('varianteTransicion', () => {
  it('rota entre las tres variantes sin repetir dos seguidas', () => {
    const vs = Array.from({ length: 12 }, (_, i) => varianteTransicion(i));
    expect(new Set(vs)).toEqual(new Set(['zoom', 'whip', 'flash']));
    vs.slice(1).forEach((v, i) => expect(v).not.toBe(vs[i]));
  });
});

describe('estadoTransicion', () => {
  it('a mitad de escena no toca nada', () => {
    const e = estadoTransicion({ ...base, frame: 200, entra: true, sale: true });
    expect(e).toMatchObject(ident);
  });

  it('sin entrada (primera escena) el primer cuadro está completo', () => {
    const e = estadoTransicion({ ...base, frame: 100, entra: false, sale: true });
    expect(e.opacity).toBe(1);
    expect(e.scale).toBe(1);
  });

  it('la entrante arranca invisible a escala 0.94 y termina limpia', () => {
    const ini = estadoTransicion({ ...base, frame: 100, entra: true, sale: true });
    expect(ini.opacity).toBe(0);
    expect(ini.scale).toBeCloseTo(0.94, 6);
    const fin = estadoTransicion({ ...base, frame: 114, entra: true, sale: true });
    expect(fin).toMatchObject(ident);
  });

  it('la saliente crece hasta 1.08, se desenfoca hasta 10 px y separa los canales ≤ 6 px', () => {
    let maxBlur = 0;
    let maxCrom = 0;
    let maxScale = 0;
    for (let f = 286; f <= 300; f++) {
      const e = estadoTransicion({ ...base, frame: f, entra: true, sale: true });
      maxBlur = Math.max(maxBlur, e.blurX, e.blurY);
      maxCrom = Math.max(maxCrom, e.cromatica);
      maxScale = Math.max(maxScale, e.scale);
      expect(e.cromatica).toBeLessThanOrEqual(6);
      expect(e.blurX).toBeLessThanOrEqual(10);
      expect(e.blurY).toBeLessThanOrEqual(10);
    }
    expect(maxBlur).toBeGreaterThan(6);
    expect(maxCrom).toBeGreaterThan(3);
    expect(maxScale).toBeLessThanOrEqual(1.08 + 1e-9);
    expect(maxScale).toBeGreaterThan(1.04);
    expect(estadoTransicion({ ...base, frame: 300, entra: true, sale: true }).opacity).toBe(0);
  });

  it('la saliente se mantiene visible al inicio y se apaga al final', () => {
    const a = estadoTransicion({ ...base, frame: 287, entra: true, sale: true });
    const b = estadoTransicion({ ...base, frame: 299, entra: true, sale: true });
    expect(a.opacity).toBeGreaterThan(0.9);
    expect(b.opacity).toBeLessThan(0.15);
  });

  it('whip mueve en horizontal con desenfoque horizontal', () => {
    const w = { ...base, variante: 'whip' as const };
    const sale = estadoTransicion({ ...w, frame: 296, entra: true, sale: true });
    const entra = estadoTransicion({ ...w, frame: 104, entra: true, sale: true });
    expect(sale.x).toBeLessThan(-50);
    expect(entra.x).toBeGreaterThan(50);
    expect(sale.blurX).toBeGreaterThan(sale.blurY);
  });

  it('flash enciende el destello a media transición', () => {
    const f = { ...base, variante: 'flash' as const };
    const mid = estadoTransicion({ ...f, frame: 107, entra: true, sale: true });
    const ini = estadoTransicion({ ...f, frame: 100, entra: true, sale: true });
    expect(mid.flash).toBeGreaterThan(0.3);
    expect(ini.flash).toBe(0);
    expect(estadoTransicion({ ...base, frame: 107, entra: true, sale: true }).flash).toBe(0);
  });

  it('el barrido de luz recorre 0→1 durante la entrada', () => {
    expect(estadoTransicion({ ...base, frame: 100, entra: true, sale: true }).barrido).toBe(0);
    expect(estadoTransicion({ ...base, frame: 107, entra: true, sale: true }).barrido).toBeCloseTo(0.5, 6);
    expect(estadoTransicion({ ...base, frame: 200, entra: true, sale: true }).barrido).toBe(1);
  });
});
