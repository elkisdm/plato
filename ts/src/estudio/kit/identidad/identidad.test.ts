import { describe, expect, it } from 'vitest';
import { encuadreFoto } from './camara';
import { capasVelo } from './velo';
import { analizarCifra, formatearCifra } from './cifra';

describe('analizarCifra / formatearCifra', () => {
  it('lee decimales con coma y conserva el sufijo', () => {
    const c = analizarCifra('8,5 %');
    expect(c).toMatchObject({ valor: 8.5, decimales: 1, sufijo: ' %', separadorDecimal: ',' });
    expect(formatearCifra(c!, 8.5)).toBe('8,5 %');
    expect(formatearCifra(c!, 4.25)).toBe('4,3 %');
  });
  it('lee miles con punto y prefijo', () => {
    const c = analizarCifra('$1.200.000');
    expect(c).toMatchObject({ prefijo: '$', valor: 1200000, miles: true, decimales: 0 });
    expect(formatearCifra(c!, 350)).toBe('$350');
    expect(formatearCifra(c!, 1200000)).toBe('$1.200.000');
  });
  it('un punto con otra cantidad de dígitos es decimal', () => {
    expect(analizarCifra('2.5x')).toMatchObject({ valor: 2.5, separadorDecimal: '.', sufijo: 'x' });
  });
  it('la puntuación final no es parte del número', () => {
    expect(analizarCifra('30.')).toMatchObject({ valor: 30, sufijo: '.' });
  });
  it('sin dígitos no hay cifra', () => {
    expect(analizarCifra('Mucho')).toBeNull();
  });
});

describe('encuadreFoto', () => {
  it('una foto horizontal en vertical cubre y el paneo recorre el ancho sobrante', () => {
    const ini = encuadreFoto(1920, 1080, 1080, 1920, 'paneo-izq', 0);
    const fin = encuadreFoto(1920, 1080, 1080, 1920, 'paneo-izq', 1);
    expect(ini.modo).toBe('cubrir');
    expect(ini.desplazamiento).toBeLessThan(0);
    expect(fin.desplazamiento).toBeGreaterThan(0);
    // Nunca deja ver el borde: el desplazamiento cabe en la holgura.
    expect(Math.abs(fin.desplazamiento)).toBeLessThanOrEqual((fin.ancho * fin.zoom - 1080) / 2);
    expect(encuadreFoto(1920, 1080, 1080, 1920, 'paneo-der', 0).desplazamiento).toBeGreaterThan(0);
  });
  it('acercar crece y alejar decrece con el avance', () => {
    expect(encuadreFoto(1000, 1000, 1080, 1350, 'acercar', 1).zoom).toBeGreaterThan(
      encuadreFoto(1000, 1000, 1080, 1350, 'acercar', 0).zoom,
    );
    expect(encuadreFoto(1000, 1000, 1080, 1350, 'alejar', 1).zoom).toBeLessThan(
      encuadreFoto(1000, 1000, 1080, 1350, 'alejar', 0).zoom,
    );
  });
  it('una foto 4:5 en un lienzo 16:9 se muestra entera', () => {
    const e = encuadreFoto(540, 675, 1920, 1080, 'acercar', 0);
    expect(e.modo).toBe('contener');
    expect(e.alto).toBeLessThanOrEqual(1080);
  });
});

describe('capasVelo', () => {
  const c = { noche: '#000010', indigo: '#4040ff' };
  it('suave: sin tinte índigo y con solo 10 % de oscurecimiento global', () => {
    const v = capasVelo('suave', c);
    expect(v.tinte).toBeNull();
    expect(v.global).toBe('#0000101A');
    expect(v.degradados).toContain('transparent 35%');
  });
  it('fuerte oscurece más que suave y menos que antes (25 %)', () => {
    expect(capasVelo('fuerte', c).global).toBe('#00001040');
  });
  it('foto conserva el velo de siempre (tinte índigo y degradados largos)', () => {
    const v = capasVelo('foto', c);
    expect(v.tinte).toBe('#4040ff22');
    expect(v.global).toBeNull();
    expect(v.degradados).toContain('transparent 62%');
  });
});
