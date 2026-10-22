import { describe, expect, it } from 'vitest';

import { anguloPuerta, CAJAS, CASA, LLAVES_X, luzVentana, VENTANAS, Y_LLAVES } from './casaLlaves';
import { MARGEN_LATERAL, W_V, YFIN_ESCENA, YINI_V } from './layout';

describe('geometría de la casa y las llaves', () => {
  it('la casa (con holgura para el brillo) queda dentro de los márgenes laterales', () => {
    expect(CASA.x - CASA.brillo).toBeGreaterThanOrEqual(MARGEN_LATERAL);
    expect(CASA.x + CASA.ancho + CASA.brillo).toBeLessThanOrEqual(W_V - MARGEN_LATERAL);
  });

  it('las tres cajas caben dentro del cuerpo de la casa y no se solapan', () => {
    expect(CAJAS).toHaveLength(3);
    const cuerpoFin = CASA.yCuerpo + CASA.altoCuerpo;
    CAJAS.forEach((c, i) => {
      expect(c.y).toBeGreaterThanOrEqual(CASA.yCuerpo);
      expect(c.y + c.alto).toBeLessThanOrEqual(cuerpoFin);
      expect(c.x).toBeGreaterThanOrEqual(CASA.x);
      expect(c.x + c.ancho).toBeLessThanOrEqual(CASA.x + CASA.ancho);
      if (i > 0) expect(c.y).toBeGreaterThanOrEqual(CAJAS[i - 1]!.y + CAJAS[i - 1]!.alto);
    });
  });

  it('el tejado arranca bajo la zona tapada y las llaves terminan sobre los subtítulos', () => {
    expect(CASA.yTecho).toBeGreaterThanOrEqual(YINI_V);
    expect(Y_LLAVES + 140).toBeLessThanOrEqual(YFIN_ESCENA);
  });

  it('las llaves quedan dentro de los márgenes', () => {
    for (const x of LLAVES_X) {
      expect(x - 105).toBeGreaterThanOrEqual(MARGEN_LATERAL);
      expect(x + 105).toBeLessThanOrEqual(W_V - MARGEN_LATERAL);
    }
  });
});

describe('ventanas y luces', () => {
  it('las ventanas caben en la franja alta del cuerpo, sobre la primera caja y sin solaparse', () => {
    expect(VENTANAS).toHaveLength(3);
    VENTANAS.forEach((v, i) => {
      expect(v.x).toBeGreaterThanOrEqual(CASA.x);
      expect(v.x + v.ancho).toBeLessThanOrEqual(CASA.x + CASA.ancho);
      expect(v.y).toBeGreaterThanOrEqual(CASA.yCuerpo);
      expect(v.y + v.alto).toBeLessThanOrEqual(CAJAS[0]!.y);
      if (i > 0) expect(v.x).toBeGreaterThanOrEqual(VENTANAS[i - 1]!.x + VENTANAS[i - 1]!.ancho);
    });
  });

  it('luzVentana: apagada antes, parpadea al encender y queda fija en 1', () => {
    expect(luzVentana(99, 100, 0)).toBe(0);
    const serie = Array.from({ length: 8 }, (_, k) => luzVentana(100 + k, 100, 0));
    expect(Math.min(...serie)).toBeLessThan(0.5);
    expect(luzVentana(120, 100, 0)).toBe(1);
  });
});

describe('anguloPuerta', () => {
  it('cerrada antes y después, abierta ~78° a mitad y vuelve a cerrar', () => {
    expect(anguloPuerta(99, 100)).toBe(0);
    expect(anguloPuerta(114, 100)).toBeCloseTo(78, 0);
    expect(Math.abs(anguloPuerta(140, 100))).toBe(0);
  });

  it('abre de forma creciente y cierra de forma decreciente', () => {
    expect(anguloPuerta(108, 100)).toBeGreaterThan(anguloPuerta(105, 100));
    expect(anguloPuerta(120, 100)).toBeLessThan(anguloPuerta(117, 100));
  });
});
