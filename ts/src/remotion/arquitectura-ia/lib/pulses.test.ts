import { describe, expect, it } from 'vitest';

import { arrivals, chainPulses } from './pulses';

describe('chainPulses', () => {
  it('encadena los tramos de una cadena, uno tras otro', () => {
    const p = chainPulses([[0, 1]], { from: 10, until: 30, period: 100, hop: 5, offsets: [0] });
    expect(p).toEqual([
      { edge: 0, start: 10, duration: 5 },
      { edge: 1, start: 15, duration: 5 },
    ]);
  });

  it('repite cada periodo mientras la salida quede antes de until', () => {
    const p = chainPulses([[2]], { from: 0, until: 25, period: 10, hop: 4, offsets: [3] });
    expect(p.map((x) => x.start)).toEqual([3, 13, 23]);
  });
});

describe('arrivals', () => {
  const edges = [
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
  ];

  it('marca la llegada en el nodo destino al terminar el viaje', () => {
    const r = arrivals([{ edge: 1, start: 10, duration: 6 }], edges);
    expect(r).toEqual({ c: [16] });
  });

  it('un pulso de vuelta llega al nodo origen', () => {
    const r = arrivals([{ edge: 0, start: 0, duration: 4, reverse: true }], edges);
    expect(r).toEqual({ a: [4] });
  });
});
