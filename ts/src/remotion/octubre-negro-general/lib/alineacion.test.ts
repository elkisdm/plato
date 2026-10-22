import { describe, expect, it } from 'vitest';

import {
  aFrame,
  finLinea,
  inicioLinea,
  normalizar,
  palabra,
  PALABRAS,
  palabrasDesdeAlineacion,
} from './alineacion';

describe('palabrasDesdeAlineacion', () => {
  const al = {
    characters: ['H', 'i', ' ', 'y', 'o', '\n', 'a', 'h'],
    character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  };

  it('corta por espacios y \\n incrementa la línea', () => {
    expect(palabrasDesdeAlineacion(al)).toEqual([
      { texto: 'Hi', inicio: 0, fin: 0.2, linea: 0 },
      { texto: 'yo', inicio: 0.3, fin: 0.5, linea: 0 },
      { texto: 'ah', inicio: 0.6, fin: 0.8, linea: 1 },
    ]);
  });

  it('un \\n final no crea palabras', () => {
    const conFinal = {
      characters: ['a', '\n'],
      character_start_times_seconds: [0, 0.1],
      character_end_times_seconds: [0.1, 0.2],
    };
    expect(palabrasDesdeAlineacion(conFinal)).toHaveLength(1);
  });
});

describe('PALABRAS reales', () => {
  it('tiene 7 líneas (0–6)', () => {
    expect(new Set(PALABRAS.map((p) => p.linea)).size).toBe(7);
    expect(Math.max(...PALABRAS.map((p) => p.linea))).toBe(6);
  });

  it('la primera palabra es "Esta" en 0 s', () => {
    expect(PALABRAS[0]!.texto).toBe('Esta');
    expect(PALABRAS[0]!.inicio).toBe(0);
  });
});

describe('normalizar', () => {
  it('quita signos y conserva tildes', () => {
    expect(normalizar('¿Está')).toBe('está');
    expect(normalizar('Railway,')).toBe('railway');
    expect(normalizar('contraseñas.')).toBe('contraseñas');
  });
});

describe('palabra', () => {
  it('encuentra "veintisiete" en la línea 0 y "llaves" en la 3', () => {
    expect(palabra('veintisiete').linea).toBe(0);
    expect(palabra('llaves', 3).linea).toBe(3);
  });

  it('encuentra "PARCHE" en la línea 6', () => {
    expect(palabra('PARCHE').linea).toBe(6);
    expect(palabra('PARCHE', 6).linea).toBe(6);
  });

  it('con línea distinta de la real lanza', () => {
    expect(() => palabra('PARCHE', 0)).toThrow('Palabra no encontrada: PARCHE (línea 0)');
  });

  it('lanza si no existe', () => {
    expect(() => palabra('inexistente')).toThrow('Palabra no encontrada: inexistente');
  });
});

describe('inicioLinea / finLinea / aFrame', () => {
  it('la línea 0 empieza en 0 y termina antes de la 1', () => {
    expect(inicioLinea(0)).toBe(0);
    expect(finLinea(0)).toBeLessThanOrEqual(inicioLinea(1));
    expect(finLinea(0)).toBeGreaterThan(0);
  });

  it('la última línea termina en 58,64 s', () => {
    expect(finLinea(6)).toBeCloseTo(58.64, 2);
  });

  it('aFrame redondea a 30 fps por defecto', () => {
    expect(aFrame(1)).toBe(30);
    expect(aFrame(0.5)).toBe(15);
    expect(aFrame(1, 60)).toBe(60);
  });
});
