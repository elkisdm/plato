import { describe, expect, it } from 'vitest';

import { ESCENAS } from './lineaTiempo';
import {
  ANGULO_ABIERTA,
  anguloPuerta,
  barridoPeriodico,
  FRAMES_CIERRE,
  poseAbanico,
  GOLPES_E05,
  GOLPES_E06,
  GOLPES_E07,
  OSCILACION_PUERTA,
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
  const inicioCierre = 100 - FRAMES_CIERRE;

  it('oscila alrededor de la apertura base mientras espera y nunca queda fija', () => {
    const valores = Array.from({ length: 80 }, (_, f) => anguloPuerta(f, 400));
    for (const a of valores) {
      expect(Math.abs(a - ANGULO_ABIERTA)).toBeLessThanOrEqual(OSCILACION_PUERTA + 1e-9);
    }
    expect(new Set(valores.map((a) => a.toFixed(3))).size).toBeGreaterThan(40);
  });

  it('baja a 0 exactamente en «cierra» sin saltos al empezar el cierre', () => {
    expect(anguloPuerta(100, 100)).toBeCloseTo(0, 5);
    const antes = anguloPuerta(inicioCierre - 1, 100);
    const arranque = anguloPuerta(inicioCierre, 100);
    expect(Math.abs(arranque - antes)).toBeLessThan(2);
    let previo = Infinity;
    for (let f = inicioCierre; f <= 100; f++) {
      const a = anguloPuerta(f, 100);
      expect(a).toBeLessThanOrEqual(previo + 1e-9);
      previo = a;
    }
  });

  it('rebota un poco tras el portazo sin cruzar 0 y se asienta', () => {
    const rebotes = Array.from({ length: 30 }, (_, k) => anguloPuerta(101 + k, 100));
    expect(Math.max(...rebotes)).toBeGreaterThan(1);
    expect(Math.min(...rebotes)).toBeGreaterThanOrEqual(0);
    expect(anguloPuerta(140, 100)).toBeCloseTo(0, 1);
  });
});

describe('barridoPeriodico', () => {
  it('es null fuera del barrido y avanza 0→1 dentro, repitiéndose cada periodo', () => {
    expect(barridoPeriodico(99, 100, 60, 20)).toBeNull();
    expect(barridoPeriodico(100, 100, 60, 20)).toBe(0);
    expect(barridoPeriodico(110, 100, 60, 20)).toBeCloseTo(0.5);
    expect(barridoPeriodico(125, 100, 60, 20)).toBeNull();
    expect(barridoPeriodico(170, 100, 60, 20)).toBeCloseTo(0.5);
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

describe('poseAbanico', () => {
  it('cada tarjeta parte de una pose distinta (abanico) y termina en su sitio', () => {
    const iniciales = [0, 1, 2].map((i) => poseAbanico(i, 0));
    expect(new Set(iniciales.map((p) => p.rot)).size).toBe(3);
    for (const p of iniciales) expect(Math.abs(p.rot)).toBeGreaterThan(5);
    for (const i of [0, 1, 2]) expect(poseAbanico(i, 1)).toEqual({ rot: 0, x: 0, y: 0 });
  });

  it('con overshoot del spring (s > 1) se pasa al otro lado antes de asentarse', () => {
    const antes = poseAbanico(1, 0);
    const pasada = poseAbanico(1, 1.1);
    expect(Math.sign(pasada.rot)).toBe(-Math.sign(antes.rot));
  });

  it('ninguna pose inicial saca la tarjeta por encima de la zona segura', () => {
    for (const i of [0, 1, 2]) expect(poseAbanico(i, 0).y).toBeGreaterThanOrEqual(-60 * (i + 1));
  });
});
