import { describe, expect, it } from 'vitest';

import { empujeBloqueado } from './LeccionBloqueo';

describe('empujeBloqueado', () => {
  it('vale 0 antes de empezar', () => {
    expect(empujeBloqueado(90, 100)).toBe(0);
  });

  it('llega a 1 al chocar con el candado', () => {
    expect(empujeBloqueado(110, 100)).toBe(1);
  });

  it('vuelve a 0 tras rebotar y se queda ahí', () => {
    expect(empujeBloqueado(120, 100)).toBe(0);
    expect(empujeBloqueado(400, 100)).toBe(0);
  });
});
