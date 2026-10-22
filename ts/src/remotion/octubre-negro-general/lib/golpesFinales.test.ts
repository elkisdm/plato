import { describe, expect, it } from 'vitest';

import { ESCENAS } from './lineaTiempo';
import {
  ANGULO_ABIERTA,
  anguloPuerta,
  GOLPES_E05,
  GOLPES_E06,
  GOLPES_E07,
  progresoSigueme,
} from './golpesFinales';

const ventana = (id: string) => ESCENAS.find((e) => e.id === id)!;

describe('anclas de E05–E07', () => {
  it('E05: actualización llega antes de cierra y ambas caen en la ventana de la escena', () => {
    const { desde, hasta } = ventana('E05Puerta');
    expect(GOLPES_E05.actualizacion).toBeLessThan(GOLPES_E05.cierra);
    for (const f of Object.values(GOLPES_E05)) {
      expect(f).toBeGreaterThanOrEqual(desde);
      expect(f).toBeLessThan(hasta);
    }
  });

  it('E06: los verbos entran en orden y «alcanza» es el último golpe', () => {
    const { desde, hasta } = ventana('E06TresPasos');
    const { verifica, cambia, actualiza, alcanza } = GOLPES_E06;
    expect([verifica, cambia, actualiza, alcanza]).toEqual(
      [verifica, cambia, actualiza, alcanza].sort((a, b) => a - b),
    );
    expect(verifica).toBeGreaterThanOrEqual(desde);
    expect(alcanza).toBeLessThan(hasta);
  });

  it('E07: comenta, PARCHE, paso y sígueme en orden dentro de la ventana', () => {
    const { desde, hasta } = ventana('E07Cta');
    const { comenta, parche, paso, sigueme } = GOLPES_E07;
    expect(comenta).toBeLessThan(parche);
    expect(parche).toBeLessThan(paso);
    expect(paso).toBeLessThan(sigueme);
    expect(comenta).toBeGreaterThanOrEqual(desde);
    expect(sigueme).toBeLessThan(hasta);
  });
});

describe('anguloPuerta', () => {
  it('queda entreabierta hasta «cierra»', () => {
    expect(anguloPuerta(0, 100)).toBe(ANGULO_ABIERTA);
    expect(anguloPuerta(100, 100)).toBe(ANGULO_ABIERTA);
  });

  it('se cierra del todo sin pasarse de 0 y nunca crece', () => {
    let previo = Infinity;
    for (let f = 100; f < 140; f++) {
      const a = anguloPuerta(f, 100);
      expect(a).toBeLessThanOrEqual(previo);
      expect(a).toBeGreaterThanOrEqual(0);
      previo = a;
    }
    expect(anguloPuerta(140, 100)).toBe(0);
  });
});

describe('progresoSigueme', () => {
  it('0 antes de «sígueme», 1 después y creciente entre medias', () => {
    expect(progresoSigueme(99, 100)).toBe(0);
    expect(progresoSigueme(100, 100)).toBe(0);
    expect(progresoSigueme(200, 100)).toBe(1);
    expect(progresoSigueme(110, 100)).toBeGreaterThan(progresoSigueme(105, 100));
  });
});
