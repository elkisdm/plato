import { describe, expect, it } from 'vitest';

import { DURACION } from '../lineaTiempo';
import { inclinacionTarjeta } from './tarjeta';

describe('inclinacionTarjeta', () => {
  it('nunca pasa de 8° en ningún eje', () => {
    for (let f = 0; f < DURACION; f += 3) {
      const t = inclinacionTarjeta(f, f % 5);
      expect(Math.abs(t.rotX)).toBeLessThanOrEqual(8);
      expect(Math.abs(t.rotY)).toBeLessThanOrEqual(8);
    }
  });

  it('respira: cambia con el frame y difiere con la fase', () => {
    expect(inclinacionTarjeta(10, 0)).not.toEqual(inclinacionTarjeta(40, 0));
    expect(inclinacionTarjeta(10, 0)).not.toEqual(inclinacionTarjeta(10, 3));
  });

  it('reacciona a un golpe de cámara', () => {
    const g = [{ frame: 100, fuerza: 1 }];
    expect(inclinacionTarjeta(100, 0, g)).not.toEqual(inclinacionTarjeta(100, 0, []));
  });
});
