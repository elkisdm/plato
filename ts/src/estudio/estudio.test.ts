import { describe, expect, it } from 'vitest';
import { asset, crearIndice, zonaDe } from './assets';
import { manifiestos, marcas, proyectos } from './datos.generated';
import { tramosEfectivos } from './kit/Puntero';
import { lineasDe, trozosDe } from './kit/Subtitulos';
import { esquemas } from './tipos/presentacion-app/esquemas';
import { logoDe, marcaSchema, violacionesRestricciones } from './marca';
import { inicioMusica, tramosVoz, VOLUMEN, volumenMusica } from './mezcla';
import {
  duracionTotal,
  framesDe,
  guionSchema,
  iniciosEscenas,
  inicioVoz,
  proyectoSchema,
  vozSchema,
  type Formato,
  type Guion,
} from './proyecto';
import { resolverProyecto } from './resolver';
import { resolverGuion, tipos, validarFormatos } from './tipos';
import { FPS } from './tema';

// El proyecto de ejemplo (estudio/proyectos/ejemplo) no trae voz: la locución de estas pruebas es
// una ficha sintética por escena, con duraciones distintas para que haya pausas entre tomas.
const ejemplo = proyectos['ejemplo'];
if (!ejemplo) throw new Error('falta el proyecto ejemplo en el índice');
const tipo = (ejemplo.proyecto as { tipo: string }).tipo;
const guion = guionSchema.parse(ejemplo.guion);
const voz = vozSchema.parse(
  Object.fromEntries(
    guion.escenas.map((e, i) => [e.id, { asset: `ejemplo/voz-${e.id}`, segundos: 2 + i * 0.7 }]),
  ),
);
const ficha = (id: string, extra: object = {}) => ({
  id,
  archivo: `${id}.png`,
  tipo: 'imagen',
  sha256: '0'.repeat(64),
  origen: {},
  ...extra,
});

describe('proyecto', () => {
  it('el proyecto de ejemplo resuelve completo sin assets ni voz (marca, formatos, fps y guion)', () => {
    const r = resolverProyecto('ejemplo');
    expect(r.escenas).toHaveLength(guion.escenas.length);
    expect(r.marca.id).toBe('ejemplo');
  });

  it('el guion del ejemplo valida contra el catálogo de su tipo', () => {
    expect(resolverGuion(guion, tipo)).toHaveLength(guion.escenas.length);
  });

  it('rechaza una escena que no está en el catálogo, con su id', () => {
    const malo: Guion = { escenas: [{ ...guion.escenas[0]!, id: 'x', escena: 'noExiste' }] };
    expect(() => resolverGuion(malo, tipo)).toThrow(/Escena x: «noExiste»/);
  });

  it('rechaza props inválidas, con el id de la escena', () => {
    const malo: Guion = { escenas: [{ ...guion.escenas[0]!, id: 'y', props: { logo: 'si' } }] };
    expect(() => resolverGuion(malo, tipo)).toThrow(
      new RegExp(`Escena y \\(${guion.escenas[0]!.escena}\\): props inválidas`),
    );
  });

  it('cada escena dura lo que pide su animación o su locución, lo que sea mayor', () => {
    for (const e of guion.escenas) {
      const s = voz[e.id]?.segundos ?? 0;
      expect(framesDe(e, voz)).toBeGreaterThanOrEqual(Math.round(e.segundos * FPS));
      expect(framesDe(e, voz)).toBeGreaterThanOrEqual(inicioVoz(e) + Math.ceil(s * FPS));
    }
  });

  it('rechaza ids de escena repetidos y escenas más cortas que 1 s', () => {
    const e0 = guion.escenas[0]!;
    expect(guionSchema.safeParse({ escenas: [e0, e0] }).success).toBe(false);
    expect(guionSchema.safeParse({ escenas: [{ ...e0, segundos: 0.5 }] }).success).toBe(false);
  });

  it('sin voz, cada escena dura su mínimo', () => {
    for (const e of guion.escenas) expect(framesDe(e, {})).toBe(Math.round(e.segundos * FPS));
  });
});

describe('assets', () => {
  const indice = crearIndice(manifiestos);

  it('todo asset que usan los proyectos está en un manifiesto', () => {
    // Mismos campos que `idsDeAssets` de la CLI: nunca textos ni URLs (un «24/7» no es un asset).
    const campos = new Set(['captura', 'encabezado', 'escritorio', 'movil', 'asset', 'musica']);
    const recoger = (v: unknown): string[] =>
      Array.isArray(v)
        ? v.flatMap(recoger)
        : v && typeof v === 'object'
          ? Object.entries(v).flatMap(([k, x]) =>
              campos.has(k) && typeof x === 'string' ? [x] : recoger(x),
            )
          : [];
    // El ejemplo público no usa assets: el chequeo cubre los proyectos que se sumen.
    const ids = Object.values(proyectos).flatMap((p) => recoger(p));
    for (const id of ids) expect(() => asset(indice, id)).not.toThrow();
  });

  it('un id inexistente falla con el id', () => {
    expect(() => asset(indice, 'ejemplo/no-existe')).toThrow(/ejemplo\/no-existe/);
  });

  it('una zona inexistente falla con su nombre y el asset', () => {
    const conZona = crearIndice([
      {
        assets: [ficha('ejemplo/portal-inicio', { zonas: { menu: { x: 0, y: 0, w: 1, h: 0.1 } } })],
      },
    ]);
    expect(zonaDe(asset(conZona, 'ejemplo/portal-inicio'), 'menu').h).toBe(0.1);
    expect(() => zonaDe(asset(conZona, 'ejemplo/portal-inicio'), 'nada')).toThrow(
      /«nada».*portal-inicio/,
    );
  });

  it('un id repetido entre manifiestos es un error', () => {
    const m = { assets: [ficha('ejemplo/logo')] };
    expect(() => crearIndice([m])).not.toThrow();
    expect(() => crearIndice([m, m])).toThrow(/duplicado/);
  });
});

describe('mezcla', () => {
  const total = duracionTotal(guion, voz);
  const tramos = tramosVoz(guion, voz);

  it('ubica cada locución dentro de su escena, sin pisarse', () => {
    const inicios = iniciosEscenas(guion, voz);
    tramos.forEach(([desde], i) =>
      expect(desde).toBe((inicios[i] ?? 0) + inicioVoz(guion.escenas[i]!)),
    );
    tramos.slice(1).forEach(([desde], i) => expect(desde).toBeGreaterThan(tramos[i]?.[1] ?? 0));
  });

  it('baja la música bajo la voz y la sube en la pausa más larga', () => {
    const [primero] = tramos;
    if (!primero) throw new Error('sin voz');
    expect(volumenMusica(Math.round((primero[0] + primero[1]) / 2), total, tramos)).toBeCloseTo(
      VOLUMEN.bajoVoz,
    );
    const pausas = tramos.slice(1).map(([desde], i) => [tramos[i]?.[1] ?? 0, desde] as const);
    const [a, b] = pausas.reduce((m, p) => (p[1] - p[0] > m[1] - m[0] ? p : m));
    expect(volumenMusica(Math.round((a + b) / 2), total, tramos)).toBeCloseTo(VOLUMEN.sinVoz);
  });

  it('parte y termina en silencio, y la pista cierra con su final', () => {
    expect(volumenMusica(0, total, tramos)).toBe(0);
    expect(volumenMusica(total, total, tramos)).toBe(0);
    expect(inicioMusica(95.11, total) + total).toBe(Math.round(95.11 * FPS));
  });

  it('con `musicaInicio`, la pista entra desde ese segundo en vez de alinear su final', () => {
    expect(inicioMusica(137.35, 800, 12.75)).toBe(Math.round(12.75 * FPS));
  });

  it('una pista cortada antes de su final se despide con un fundido largo, no con un golpe', () => {
    const t = 800;
    // A 1 s del final, con final natural ya está casi entera; con corte, va a media salida.
    expect(volumenMusica(t - FPS, t, [])).toBeCloseTo(VOLUMEN.sinVoz);
    expect(volumenMusica(t - FPS, t, [], { corte: true })).toBeLessThan(VOLUMEN.sinVoz * 0.75);
  });
});

describe('subtítulos', () => {
  it('corta la locución en la puntuación y en frases de hasta 8 palabras', () => {
    expect(trozosDe('Uno dos tres, cuatro cinco seis siete ocho nueve diez once doce.')).toEqual([
      'Uno dos tres,',
      'cuatro cinco seis siete ocho nueve diez once',
      'doce.',
    ]);
  });

  it('con voz, cada frase cae dentro del tramo en que suena la voz de su escena', () => {
    const inicios = iniciosEscenas(guion, voz);
    const lineas = lineasDe(guion, voz);
    guion.escenas.forEach((e, i) => {
      const s = voz[e.id]?.segundos;
      if (!s) return;
      const desde = (inicios[i] ?? 0) + inicioVoz(e);
      const hasta = desde + Math.ceil(s * FPS);
      const propias = lineas.filter((l) => l.desde >= (inicios[i] ?? 0) && l.desde < hasta);
      expect(propias.length).toBeGreaterThan(0);
      for (const l of propias) {
        expect(l.desde).toBeGreaterThanOrEqual(desde);
        expect(l.hasta).toBeLessThanOrEqual(hasta + 0.001);
      }
    });
  });

  it('cada línea cae dentro del video', () => {
    for (const l of lineasDe(guion, voz))
      expect(l.hasta).toBeLessThanOrEqual(duracionTotal(guion, voz));
  });
});

describe('redacción de la marca', () => {
  for (const [id, datos] of Object.entries(proyectos)) {
    it(`${id} cumple las reglas de redacción de su marca`, () => {
      const p = datos.proyecto as { marca: string };
      const marca = marcaSchema.parse(marcas[p.marca]);
      // Un proyecto a medio armar (guion vacío) no se revisa aquí: el Studio ya lo omite y avisa.
      const r = guionSchema.safeParse(datos.guion);
      if (!r.success) return;
      const g = r.data;
      const textos = JSON.stringify(
        g.escenas.map((e) => [e.titulo, e.texto, e.locucion, e.antetitulo, e.props]),
      );
      for (const regla of marca.redaccion)
        expect(textos, regla.motivo).not.toMatch(new RegExp(regla.patron, 'i'));
    });
  }
});

describe('restricciones de la marca', () => {
  for (const [id, datos] of Object.entries(proyectos)) {
    it(`${id} respeta las restricciones de su marca`, () => {
      const p = datos.proyecto as { marca: string };
      const marca = marcaSchema.parse(marcas[p.marca]);
      const r = guionSchema.safeParse(datos.guion);
      if (!r.success) return;
      const v = violacionesRestricciones(r.data, marca.restricciones);
      expect(v.map((x) => `${x.escena}: ${x.motivo}`)).toEqual([]);
    });
  }

  const restricciones = [{ siAsset: 'embajador', prohibido: '\\$\\s?\\d', motivo: 'sin precios' }];
  const escena = (props: unknown, locucion = '') => ({ id: 'e1', escena: 'foto', locucion, props });
  const foto = 'ejemplo/fotos/embajador-sonriendo';

  it('foto del embajador más «$6.000» es una violación que nombra escena y motivo', () => {
    const v = violacionesRestricciones(
      { escenas: [escena({ asset: foto }, 'Desde $6.000')] },
      restricciones,
    );
    expect(v).toEqual([{ escena: 'e1', motivo: 'sin precios' }]);
  });
  it('el mismo texto sin la foto pasa', () => {
    const otra = 'ejemplo/fotos/oficina';
    expect(
      violacionesRestricciones(
        { escenas: [escena({ asset: otra }, 'Desde $6.000')] },
        restricciones,
      ),
    ).toEqual([]);
  });
  it('la foto sin texto de precio pasa', () => {
    expect(
      violacionesRestricciones(
        { escenas: [escena({ asset: foto }, 'Agenda tu reunión')] },
        restricciones,
      ),
    ).toEqual([]);
  });
});

describe('formatos por tipo', () => {
  it('comercial no admite retrato', () => {
    expect(() => validarFormatos('comercial', ['retrato'])).toThrow(
      'El tipo comercial no admite el formato retrato',
    );
  });
  it('por defecto admite horizontal y vertical', () => {
    expect(() => validarFormatos('comercial', ['horizontal', 'vertical'])).not.toThrow();
  });
  it('un tipo que declara retrato lo acepta', () => {
    const stub = { ...tipos.comercial!, formatos: ['vertical', 'retrato'] as Formato[] };
    expect(() => validarFormatos('fake', ['retrato'], { fake: stub })).not.toThrow();
  });
  it('el esquema del proyecto acepta retrato', () => {
    expect(
      proyectoSchema.safeParse({
        id: 'p',
        nombre: 'P',
        version: '1.0.0',
        marca: 'm',
        tipo: 't',
        formatos: ['retrato'],
      }).success,
    ).toBe(true);
  });
});

describe('bordes de las escenas', () => {
  it('un puntero con un solo fotograma clave queda quieto (dos puntos crecientes)', () => {
    const [a, b] = tramosEfectivos([{ frame: 30, x: 0.5, y: 0.5, clic: true }]);
    expect(b!.frame).toBeGreaterThan(a!.frame);
    expect([b!.x, b!.y, b!.clic]).toEqual([0.5, 0.5, false]);
  });

  it('rechaza un enfocarEn que dejaría el scroll sin fotogramas crecientes', () => {
    const base = {
      correo: { captura: 'x/y', zona: 'z', enfocarEn: 40 },
      encabezado: 'x/y',
      mensajes: [{ captura: 'x/y', inicio: 0 }],
    };
    expect(esquemas.correoYWhatsapp.safeParse(base).success).toBe(false);
    expect(
      esquemas.correoYWhatsapp.safeParse({ ...base, correo: { ...base.correo, enfocarEn: 70 } })
        .success,
    ).toBe(true);
  });

  it('rechaza secciones de un recorrido que no avanzan en el tiempo', () => {
    const seccion = (inicio: number) => ({ titulo: 't', texto: 'x', inicio, clic: 'menu#0' });
    const base = { captura: 'x/y', url: 'u' };
    expect(
      esquemas.recorrido.safeParse({ ...base, secciones: [seccion(120), seccion(60)] }).success,
    ).toBe(false);
    expect(
      esquemas.recorrido.safeParse({ ...base, secciones: [seccion(60), seccion(60)] }).success,
    ).toBe(false);
    expect(
      esquemas.recorrido.safeParse({ ...base, secciones: [seccion(60), seccion(120)] }).success,
    ).toBe(true);
  });
});

describe('marca sin logo', () => {
  it('una marca puede no tener logo, y pedirlo falla con el id de la marca', () => {
    const m = marcaSchema.parse({ ...(marcas['ejemplo'] as object), id: 'fiesta', logos: {} });
    expect(() => logoDe(m, 'blanco')).toThrow(/fiesta no tiene logo/);
    const conLogos = marcaSchema.parse({
      ...(marcas['ejemplo'] as object),
      logos: { blanco: 'ejemplo/logo-blanco', color: 'ejemplo/logo-color' },
    });
    expect(logoDe(conLogos, 'blanco')).toBe('ejemplo/logo-blanco');
    expect(logoDe(conLogos, 'color')).toBe('ejemplo/logo-color');
    const soloBlanco = marcaSchema.parse({
      ...(marcas['ejemplo'] as object),
      logos: { blanco: 'ejemplo/logo-blanco' },
    });
    expect(logoDe(soloBlanco, 'color')).toBe('ejemplo/logo-blanco');
  });
});
