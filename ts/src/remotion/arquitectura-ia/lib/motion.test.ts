import { describe, expect, it } from 'vitest';

import { cameraAt, progress, travel } from './motion';

describe('progress', () => {
  it('va de 0 a 1 en la ventana y se sujeta fuera', () => {
    expect(progress(0, 10, 20)).toBe(0);
    expect(progress(30, 10, 20)).toBe(1);
    expect(progress(100, 10, 20)).toBe(1);
    expect(progress(20, 10, 20, (t) => t)).toBeCloseTo(0.5);
  });
});

describe('travel', () => {
  it('devuelve null antes de salir y después de llegar', () => {
    expect(travel(5, 10, 20)).toBeNull();
    expect(travel(31, 10, 20)).toBeNull();
  });

  it('recorre 0..1 durante el viaje', () => {
    expect(travel(10, 10, 20)).toBe(0);
    expect(travel(30, 10, 20)).toBe(1);
  });
});

describe('cameraAt', () => {
  const keys = [
    { frame: 0, x: 540, y: 675, zoom: 1 },
    { frame: 30, x: 600, y: 675, zoom: 0.8 },
  ];

  it('mantiene la primera y la última pose fuera del rango', () => {
    expect(cameraAt(-10, keys)).toEqual({ x: 540, y: 675, zoom: 1 });
    expect(cameraAt(99, keys)).toEqual({ x: 600, y: 675, zoom: 0.8 });
  });

  it('interpola entre poses', () => {
    const mid = cameraAt(15, keys);
    expect(mid.x).toBeGreaterThan(540);
    expect(mid.x).toBeLessThan(600);
    expect(mid.zoom).toBeLessThan(1);
  });
});
