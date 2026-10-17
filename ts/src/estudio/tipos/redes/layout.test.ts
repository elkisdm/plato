import { describe, expect, it } from 'vitest';
import { opacidadPrimerPlano } from './visibilidad';
import { alturaTitulo, areaContenido, escalaTelefono, medidasMosaico } from './layout';

describe('primer plano de una escena durante el cruce', () => {
  it('la primera escena entra visible y la última no se desvanece', () => {
    expect(opacidadPrimerPlano(0, 100, false, true)).toBe(1);
    expect(opacidadPrimerPlano(99, 100, true, false)).toBe(1);
  });
  it('una escena con cruce de entrada espera media transición y aparece gradualmente', () => {
    expect(opacidadPrimerPlano(3, 100, true, false)).toBe(0);
    expect(opacidadPrimerPlano(15, 100, true, false)).toBeGreaterThan(0);
    expect(opacidadPrimerPlano(15, 100, true, false)).toBeLessThan(1);
    expect(opacidadPrimerPlano(40, 100, true, false)).toBe(1);
  });
  it('con cruce de salida se oculta por completo a mitad de la transición', () => {
    expect(opacidadPrimerPlano(70, 100, false, true)).toBe(1);
    expect(opacidadPrimerPlano(95, 100, false, true)).toBe(0);
  });
  it('INVARIANTE: dos escenas contiguas nunca tienen primer plano a la vez', () => {
    const TA = 120;
    const TB = 90;
    const cruce = 18; // tiempos.transicion
    const desfase = TA - cruce; // B empieza cuando A entra en su cruce
    for (let g = 0; g < TA + TB; g += 0.5) {
      const a = g < TA ? opacidadPrimerPlano(g, TA, false, true) : 0;
      const b = g >= desfase ? opacidadPrimerPlano(g - desfase, TB, true, false) : 0;
      expect(a > 0 && b > 0).toBe(false);
    }
  });
});

describe('área de contenido', () => {
  it('con subtítulos deja libre la banda inferior; sin ellos usa casi todo el alto', () => {
    const con = areaContenido(1920, true);
    const sin = areaContenido(1920, false);
    expect(con.top + con.alto).toBeLessThanOrEqual(0.72 * 1920);
    expect(sin.alto).toBeGreaterThan(con.alto);
  });
});

describe('alturaTitulo', () => {
  it('un título largo ocupa más líneas que uno corto', () => {
    const corto = alturaTitulo('Elige tu hora', 120, 936);
    const largo = alturaTitulo('Te acompañamos en cada paso de tu proyecto', 120, 936);
    expect(largo).toBeGreaterThan(corto);
  });
  it('el antetítulo suma alto', () => {
    expect(alturaTitulo('Hola', 120, 936, true)).toBeGreaterThan(alturaTitulo('Hola', 120, 936));
  });
});

describe('escalaTelefono', () => {
  it.each([
    [1920, 120],
    [1350, 120],
  ])('con subtítulos el teléfono ocupa ≥ 55 %% del alto (lienzo de %i)', (alto, titulo) => {
    const area = areaContenido(alto, true);
    const th = alturaTitulo('Tu perfil, a un toque', titulo, 936);
    const { alto: altoTelefono } = escalaTelefono(3376 / 1560, area.alto - th - 40, 936);
    expect(altoTelefono / alto).toBeGreaterThanOrEqual(0.55);
  });
  it('no se pasa del ancho disponible', () => {
    const { ancho } = escalaTelefono(1, 5000, 500);
    expect(ancho).toBeLessThanOrEqual(500);
  });
});

describe('medidasMosaico', () => {
  it('cabe en el área tras escalar e inclinar', () => {
    const m = medidasMosaico([1.25, 1.25, 1.25, 1.25, 1.25, 1.25], 936, 800);
    expect(m.cols).toBe(3);
    expect(m.cajaAncho * m.escala).toBeLessThanOrEqual(936 + 0.5);
    expect(m.cajaAlto * m.escala).toBeLessThanOrEqual(800 + 0.5);
    expect(m.cajaAlto).toBeGreaterThan(m.alto);
  });
  it('una sola pieza usa una columna', () => {
    expect(medidasMosaico([1.25], 936, 800).cols).toBe(1);
  });
});
