import { describe, expect, it } from 'vitest';
import { esAlfa } from './PiezaHF';

describe('esAlfa (piezas HyperFrames con canal alfa)', () => {
  it('webm y mov llevan alfa, sin importar mayúsculas', () => {
    expect(esAlfa('pieza.webm')).toBe(true);
    expect(esAlfa('carpeta/Pieza.MOV')).toBe(true);
  });
  it('mp4 y otros formatos no llevan alfa', () => {
    expect(esAlfa('pieza.mp4')).toBe(false);
    expect(esAlfa('webm')).toBe(false);
    expect(esAlfa('pieza.webm.png')).toBe(false);
  });
});
