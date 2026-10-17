import { describe, expect, it } from 'vitest';
import { tipos, validarFormatos, validarFps } from '..';
import { esquemas, type NombreEscena } from './esquemas';
import { redes } from './index';

const ID = 'ejemplo/fotos/retrato-horizontal';

/** Props mínimas válidas de cada escena. */
const validas: Record<NombreEscena, unknown> = {
  firma: {},
  foto: { asset: ID, movimiento: 'acercar' },
  pantalla: { captura: 'ejemplo/perfil-movil' },
  cita: { texto: 'Decidir con datos es decidir mejor.', autor: 'Ana' },
  dato: { cifra: '8,5 %', etiqueta: 'rentabilidad anual' },
  mosaico: { piezas: [ID] },
  clip: { video: 'ejemplo/clips/demo' },
  cierre: {},
};

describe('esquemas del tipo redes', () => {
  it.each(Object.keys(validas) as NombreEscena[])('«%s» acepta sus props mínimas', (n) => {
    expect(esquemas[n].safeParse(validas[n]).success).toBe(true);
  });

  it('todas aceptan subtitulos:false y un zócalo, y subtitulos vale true por defecto', () => {
    for (const n of Object.keys(validas) as NombreEscena[]) {
      const r = esquemas[n].safeParse({
        ...(validas[n] as object),
        subtitulos: false,
        zocalo: { nombre: 'El Mercurio', detalle: 'Fuente' },
      });
      expect(r.success).toBe(true);
      expect(esquemas[n].parse(validas[n]).subtitulos).toBe(n !== 'cierre');
    }
  });

  it('cierre no lleva subtítulos por defecto (el llamado ya está en pantalla) pero admite activarlos', () => {
    expect(esquemas.cierre.parse({}).subtitulos).toBe(false);
    expect(esquemas.cierre.parse({ subtitulos: true }).subtitulos).toBe(true);
  });

  it('toda escena admite `reemplazos` (lo dicho → lo mostrado) y rechaza los mal formados', () => {
    for (const n of Object.keys(validas) as NombreEscena[]) {
      const base = validas[n] as object;
      const r = [{ dice: 'cincuenta mil', muestra: '50.000' }];
      expect(esquemas[n].parse({ ...base, reemplazos: r }).reemplazos).toEqual(r);
      expect(esquemas[n].parse(base).reemplazos).toEqual([]);
      expect(
        esquemas[n].safeParse({ ...base, reemplazos: [{ dice: '', muestra: 'x' }] }).success,
      ).toBe(false);
    }
  });

  it('el zócalo exige nombre', () => {
    expect(esquemas.firma.safeParse({ zocalo: { detalle: 'x' } }).success).toBe(false);
  });

  it('foto exige asset y un movimiento del catálogo', () => {
    expect(esquemas.foto.safeParse({ movimiento: 'acercar' }).success).toBe(false);
    expect(esquemas.foto.safeParse({ asset: ID, movimiento: 'girar' }).success).toBe(false);
    expect(esquemas.foto.parse({ asset: ID }).movimiento).toBe('acercar');
  });

  it('pantalla exige captura', () => {
    expect(esquemas.pantalla.safeParse({}).success).toBe(false);
  });

  it('cita exige texto y autor', () => {
    expect(esquemas.cita.safeParse({ texto: 'x' }).success).toBe(false);
    expect(esquemas.cita.safeParse({ autor: 'x' }).success).toBe(false);
  });

  it('dato: exactamente una de cifra o lista', () => {
    expect(esquemas.dato.safeParse({ cifra: '8 %', lista: ['a'] }).success).toBe(false);
    expect(esquemas.dato.safeParse({}).success).toBe(false);
    expect(esquemas.dato.safeParse({ lista: ['a', 'b'] }).success).toBe(true);
  });

  it('dato: la lista admite entre 1 y 5 ítems', () => {
    expect(esquemas.dato.safeParse({ lista: [] }).success).toBe(false);
    expect(esquemas.dato.safeParse({ lista: ['a', 'b', 'c', 'd', 'e', 'f'] }).success).toBe(false);
  });

  it('mosaico lleva de 1 a 6 piezas', () => {
    expect(esquemas.mosaico.safeParse({ piezas: [] }).success).toBe(false);
    expect(esquemas.mosaico.safeParse({ piezas: Array(7).fill(ID) }).success).toBe(false);
    expect(esquemas.mosaico.safeParse({ piezas: Array(6).fill(ID) }).success).toBe(true);
  });

  it('clip exige video', () => {
    expect(esquemas.clip.safeParse({}).success).toBe(false);
  });

  it('cierre admite llamado y url opcionales', () => {
    expect(esquemas.cierre.safeParse({ llamado: 'Escríbenos', url: 'example.com' }).success).toBe(
      true,
    );
    expect(esquemas.cierre.safeParse({ llamado: 3 }).success).toBe(false);
  });
});

describe('fondo de video (fase 1b)', () => {
  const FONDO = { video: 'ejemplo/tomas/oficina' };
  const conFondo = ['firma', 'pantalla', 'cita', 'dato', 'mosaico', 'cierre'] as NombreEscena[];

  it.each(conFondo)('«%s» acepta `fondo` con sus valores por defecto', (n) => {
    const r = esquemas[n].parse({ ...(validas[n] as object), fondo: FONDO }) as { fondo: unknown };
    expect(r.fondo).toEqual({ ...FONDO, desde: 0, velo: 'suave', velocidad: 1 });
  });

  it('`fondo` es opcional: sin él la escena queda como hoy', () => {
    for (const n of conFondo) {
      expect((esquemas[n].parse(validas[n]) as { fondo?: unknown }).fondo).toBeUndefined();
    }
  });

  it('rechaza velocidad fuera de 0,25–2, velo desconocido, desde negativo y video vacío', () => {
    const base = { ...(validas.firma as object) };
    const prueba = (fondo: object) =>
      esquemas.firma.safeParse({ ...base, fondo: { ...FONDO, ...fondo } }).success;
    expect(prueba({ velocidad: 0.2 })).toBe(false);
    expect(prueba({ velocidad: 2.5 })).toBe(false);
    expect(prueba({ velocidad: 0.25 })).toBe(true);
    expect(prueba({ velocidad: 2 })).toBe(true);
    expect(prueba({ velo: 'medio' })).toBe(false);
    expect(prueba({ velo: 'fuerte' })).toBe(true);
    expect(prueba({ desde: -1 })).toBe(false);
    expect(prueba({ video: '' })).toBe(false);
  });

  it('foto, clip y cita con `asset` ya traen su propio fondo: `fondo` se rechaza con mensaje claro', () => {
    for (const [n, props] of [
      ['foto', validas.foto],
      ['clip', validas.clip],
      ['cita', { ...(validas.cita as object), asset: ID }],
    ] as const) {
      const r = esquemas[n].safeParse({ ...(props as object), fondo: FONDO });
      expect(r.success).toBe(false);
      expect(JSON.stringify(r.error?.issues)).toContain('ya trae su propio fondo');
    }
  });

  it('dato usa `asset` para su foto (el nombre `fondo` es del video)', () => {
    expect(esquemas.dato.safeParse({ cifra: '8 %', asset: ID }).success).toBe(true);
  });
});

describe('clip con audio propio (fase 1c)', () => {
  const base = { video: 'ejemplo/tomas/presentacion' };
  const ok = (extra: object) => esquemas.clip.safeParse({ ...base, ...extra }).success;

  it('por defecto: sin audio, presentación completa y sin recorte ni palabras', () => {
    const r = esquemas.clip.parse(base);
    expect(r.audio).toBe(false);
    expect(r.presentacion).toBe('completa');
    expect(r.recorte).toBeUndefined();
    expect(r.palabras).toBeUndefined();
  });

  it('recorte: fracciones entre 0 y 1 con arriba < abajo', () => {
    expect(ok({ recorte: { arriba: 0, abajo: 0.7 } })).toBe(true);
    expect(esquemas.clip.parse({ ...base, recorte: { abajo: 0.7 } }).recorte).toEqual({
      arriba: 0,
      abajo: 0.7,
    });
    expect(ok({ recorte: { arriba: -0.1, abajo: 0.7 } })).toBe(false);
    expect(ok({ recorte: { arriba: 0, abajo: 1.2 } })).toBe(false);
    expect(ok({ recorte: { arriba: 0.7, abajo: 0.7 } })).toBe(false);
    expect(ok({ recorte: { arriba: 0.8, abajo: 0.2 } })).toBe(false);
  });

  it('presentación: completa o tarjeta', () => {
    expect(ok({ presentacion: 'tarjeta' })).toBe(true);
    expect(ok({ presentacion: 'mosaico' })).toBe(false);
  });

  it('palabras: texto y tiempos válidos (hasta > desde)', () => {
    expect(ok({ palabras: [{ texto: 'Hola', desde: 0.1, hasta: 0.5 }] })).toBe(true);
    expect(ok({ palabras: [{ texto: '', desde: 0.1, hasta: 0.5 }] })).toBe(false);
    expect(ok({ palabras: [{ texto: 'Hola', desde: 0.5, hasta: 0.5 }] })).toBe(false);
    expect(ok({ palabras: [{ texto: 'Hola', desde: -1, hasta: 0.5 }] })).toBe(false);
  });
});

describe('catálogo del tipo redes', () => {
  it('registra una escena por esquema, está en el catálogo y admite 60 fps', () => {
    expect(Object.keys(redes.componentes).sort()).toEqual(Object.keys(esquemas).sort());
    expect(tipos.redes).toBe(redes);
    expect(() => validarFps('redes', 60)).not.toThrow();
  });

  it('admite vertical, retrato y horizontal', () => {
    expect(() => validarFormatos('redes', ['vertical', 'retrato', 'horizontal'])).not.toThrow();
  });
});
