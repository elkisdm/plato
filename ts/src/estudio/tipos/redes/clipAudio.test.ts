import { describe, expect, it } from 'vitest';
import { tramosVoz, volumenMusica } from '../../mezcla';
import { guionSchema, type Escena } from '../../proyecto';
import {
  encuadreRecorte,
  errorLocucion,
  esClipConAudio,
  palabrasDeClip,
  vozDeClip,
} from './clipAudio';

const escena = (props: object, extra: object = {}): Escena =>
  guionSchema.parse({
    escenas: [{ id: 'ana', escena: 'clip', segundos: 1, titulo: 'x', props, ...extra }],
  }).escenas[0]!;

const PALABRAS = [
  { texto: 'Hola', desde: 0.1, hasta: 0.5 },
  { texto: 'soy', desde: 0.5, hasta: 0.8 },
  { texto: 'Ana', desde: 1.2, hasta: 1.8 },
];

describe('esClipConAudio', () => {
  it('solo una escena clip con audio:true', () => {
    expect(esClipConAudio(escena({ video: 'v', audio: true }))).toBe(true);
    expect(esClipConAudio(escena({ video: 'v' }))).toBe(false);
    expect(esClipConAudio({ ...escena({ audio: true }), escena: 'foto' })).toBe(false);
  });
});

describe('palabrasDeClip', () => {
  it('adapta {texto, desde, hasta} al formato de voz.json {texto, inicio, fin}', () => {
    expect(palabrasDeClip(PALABRAS, 0)).toEqual([
      { texto: 'Hola', inicio: 0.1, fin: 0.5 },
      { texto: 'soy', inicio: 0.5, fin: 0.8 },
      { texto: 'Ana', inicio: 1.2, fin: 1.8 },
    ]);
  });
  it('con `desde` de la toma, mueve los tiempos y descarta lo que ya pasó', () => {
    const r = palabrasDeClip(PALABRAS, 0.6);
    expect(r.map((p) => p.texto)).toEqual(['soy', 'Ana']);
    expect(r[1]!.inicio).toBeCloseTo(0.6);
    expect(r[1]!.fin).toBeCloseTo(1.2);
    expect(r[0]!.inicio).toBe(0);
  });
});

describe('vozDeClip: el audio del clip cuenta como voz', () => {
  it('la escena dura al menos el clip: segundos = duración del asset − desde', () => {
    const e = escena({ video: 'v', audio: true, desde: 1, palabras: PALABRAS });
    const v = vozDeClip(e, 4.53);
    expect(v.asset).toBe('v');
    expect(v.segundos).toBeCloseTo(3.53);
  });
  it('sin palabras no hay subtítulos', () => {
    expect(vozDeClip(escena({ video: 'v', audio: true }), 3).palabras).toBeUndefined();
  });
  it('falla si `desde` no deja nada de clip', () => {
    expect(() => vozDeClip(escena({ video: 'v', audio: true, desde: 5 }), 4)).toThrow(/desde/);
  });
  it('la música baja bajo ese tramo igual que bajo una locución', () => {
    const e = escena({ video: 'v', audio: true }, { vozDesde: 0.3 });
    const guion = { escenas: [e] };
    const voz = { ana: vozDeClip(e, 4) };
    const tramos = tramosVoz(guion, voz);
    expect(tramos).toHaveLength(1);
    const total = 200;
    const bajo = volumenMusica(60, total, tramos);
    const libre = volumenMusica(60, total, []);
    expect(bajo).toBeLessThan(libre);
  });
});

describe('errorLocucion', () => {
  it('clip con audio y locución no vacía es inválido', () => {
    expect(errorLocucion(escena({ video: 'v', audio: true }, { locucion: 'Hola' }))).toMatch(
      /locuci/,
    );
    expect(errorLocucion(escena({ video: 'v', audio: true }))).toBeNull();
    expect(errorLocucion(escena({ video: 'v' }, { locucion: 'Hola' }))).toBeNull();
  });
});

describe('encuadreRecorte', () => {
  it('sin recorte cubre la caja como object-fit: cover', () => {
    const e = encuadreRecorte(576, 1024, { arriba: 0, abajo: 1 }, 1080, 1920);
    expect(e.ancho).toBeCloseTo(1080);
    expect(e.alto).toBeCloseTo(1920);
    expect(e.left).toBeCloseTo(0);
    expect(e.top).toBeCloseTo(0);
  });
  it('conservar el 70 % de arriba: la banda visible llena la caja y el resto queda fuera', () => {
    const e = encuadreRecorte(576, 1024, { arriba: 0, abajo: 0.7 }, 800, 1000);
    // La banda visible mide e.alto * 0,7 y debe cubrir la caja.
    expect(e.alto * 0.7).toBeGreaterThanOrEqual(1000 - 0.001);
    expect(e.ancho).toBeGreaterThanOrEqual(800 - 0.001);
    // Arriba coincide con el borde superior de la caja (o lo desborda, centrado).
    expect(e.top).toBeLessThanOrEqual(0);
    // El borde del recorte inferior nunca queda dentro de la caja.
    expect(e.top + e.alto * 0.7).toBeGreaterThanOrEqual(1000 - 0.001);
  });
});
