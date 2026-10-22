import { describe, expect, it } from 'vitest';

import { CAJAS, CASA, LLAVES_X, Y_LLAVES } from './casaLlaves';
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
    expect(Y_LLAVES + 90).toBeLessThanOrEqual(YFIN_ESCENA);
  });

  it('las llaves quedan dentro de los márgenes', () => {
    for (const x of LLAVES_X) {
      expect(x - 80).toBeGreaterThanOrEqual(MARGEN_LATERAL);
      expect(x + 80).toBeLessThanOrEqual(W_V - MARGEN_LATERAL);
    }
  });
});
