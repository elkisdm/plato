import { describe, expect, it } from 'vitest';
import { estiloDesenfoque } from './kit/desenfoque';
import { aReales, cuadroBase } from './kit/tiempo';
import { proyectoSchema } from './proyecto';
import { validarFps } from './tipos';

describe('base de tiempo (las animaciones se miden en cuadros de 30 aunque el video vaya a 60)', () => {
  it('a 30 fps el cuadro base es el cuadro real', () => {
    expect(cuadroBase(45, 30)).toBe(45);
    expect(aReales(45, 30)).toBe(45);
  });
  it('a 60 fps cada cuadro real es medio cuadro base: el movimiento cae entre medio', () => {
    expect(cuadroBase(45, 60)).toBe(22.5);
    expect(aReales(22.5, 60)).toBe(45);
    expect(aReales(18, 60)).toBe(36);
  });
});

describe('fps del proyecto', () => {
  const base = {
    id: 'p',
    nombre: 'P',
    version: '1.0.0',
    marca: 'm',
    tipo: 't',
    formatos: ['horizontal'],
  };
  it('por defecto es 30 (los proyectos existentes no cambian)', () => {
    expect(proyectoSchema.parse(base).fps).toBe(30);
  });
  it('acepta 60 y rechaza cualquier otra tasa', () => {
    expect(proyectoSchema.parse({ ...base, fps: 60 }).fps).toBe(60);
    expect(proyectoSchema.safeParse({ ...base, fps: 45 }).success).toBe(false);
  });
  it('solo un tipo con escenas medidas en tiempo puede ir a 60', () => {
    expect(() => validarFps('comercial', 60)).not.toThrow();
    expect(() => validarFps('presentacion-app', 30)).not.toThrow();
    expect(() => validarFps('presentacion-app', 60)).toThrow(/presentacion-app.*60/);
  });
});

describe('transición «desenfoque»', () => {
  it('la escena que sale se acerca, se desenfoca y se apaga', () => {
    expect(estiloDesenfoque(0, true)).toEqual({ opacidad: 1, escala: 1, desenfoque: 0 });
    const fin = estiloDesenfoque(1, true);
    expect(fin.opacidad).toBe(0);
    expect(fin.escala).toBeGreaterThan(1);
    expect(fin.desenfoque).toBeGreaterThan(0);
  });
  it('la que entra llega desde un poco más atrás y termina nítida', () => {
    const ini = estiloDesenfoque(0, false);
    expect(ini.opacidad).toBe(0);
    expect(ini.escala).toBeLessThan(1);
    expect(estiloDesenfoque(1, false)).toEqual({ opacidad: 1, escala: 1, desenfoque: 0 });
  });
});
