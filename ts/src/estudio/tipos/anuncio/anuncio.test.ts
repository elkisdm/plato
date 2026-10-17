import { describe, expect, it } from 'vitest';
import {
  aplicarReemplazos,
  anchoPrecioEm,
  clipDe,
  cuentaViva,
  expoOut,
  layoutFranja,
  partesDeSegundos,
  cortesPorPalabras,
  entradasPorVoz,
  frenaRueda,
  impactoCorte,
  ruedaPrecio,
  ajustarTam,
  cuentaRegresiva,
  digitos,
  esAcento,
  formatoCLP,
  alfaFranja,
  grupoActivo,
  gruposDe,
  indiceActivo,
  palabraActiva,
  particulas,
  posicionFondo,
  posicionRodillo,
  punchDe,
  temblor,
  valorContador,
} from './calculos';
import { assetSchema } from '../../assets';
import { esquemas } from './esquemas';
import { anuncio } from './index';

describe('formatoCLP', () => {
  it('usa punto como separador de miles y el signo $', () => {
    expect(formatoCLP(23000)).toBe('$23.000');
    expect(formatoCLP(1234567)).toBe('$1.234.567');
    expect(formatoCLP(950)).toBe('$950');
    expect(formatoCLP(0)).toBe('$0');
  });
  it('redondea decimales a pesos enteros', () => {
    expect(formatoCLP(78400.6)).toBe('$78.401');
  });
});

describe('valorContador', () => {
  it('vale 0 antes del inicio y el monto exacto al final', () => {
    expect(valorContador(0, 10, 40, 23000)).toBe(0);
    expect(valorContador(10, 10, 40, 23000)).toBe(0);
    expect(valorContador(50, 10, 40, 23000)).toBe(23000);
    expect(valorContador(500, 10, 40, 23000)).toBe(23000);
  });
  it('es monótono creciente', () => {
    let previo = -1;
    for (let f = 0; f <= 70; f++) {
      const v = valorContador(f, 10, 40, 23000);
      expect(v).toBeGreaterThanOrEqual(previo);
      previo = v;
    }
  });
});

describe('cuentaRegresiva', () => {
  it('calcula días, horas y minutos entre dos fechas ISO', () => {
    expect(cuentaRegresiva('2026-10-10T12:00:00Z', '2026-10-13T15:30:00Z')).toEqual({
      dias: 3,
      horas: 3,
      minutos: 30,
    });
  });
  it('nunca es negativa: si ya pasó, devuelve ceros', () => {
    expect(cuentaRegresiva('2026-10-13T00:00:00Z', '2026-10-10T00:00:00Z')).toEqual({
      dias: 0,
      horas: 0,
      minutos: 0,
    });
  });
  it('rechaza fechas que no son ISO', () => {
    expect(() => cuentaRegresiva('mañana', '2026-10-10')).toThrow();
  });
});

describe('rodillo, dígitos y temblor', () => {
  it('el rodillo cae exacto en el dígito objetivo', () => {
    expect(posicionRodillo(0, 5, 30, 7) % 10).toBe(0);
    expect(posicionRodillo(35, 5, 30, 7) % 10).toBe(7);
    expect(posicionRodillo(999, 5, 30, 7) % 10).toBe(7);
  });
  it('rellena con ceros a la izquierda', () => {
    expect(digitos(5)).toEqual([0, 5]);
    expect(digitos(123)).toEqual([1, 2, 3]);
  });
  it('el temblor es cero fuera de su ventana', () => {
    expect(temblor(0, 10, 8)).toEqual({ x: 0, y: 0 });
    expect(temblor(40, 10, 8)).toEqual({ x: 0, y: 0 });
    expect(temblor(14, 10, 8)).not.toEqual({ x: 0, y: 0 });
  });
  it('reconoce palabras de acento sin mayúsculas ni puntuación', () => {
    expect(esAcento('GRATIS!', ['gratis'])).toBe(true);
    expect(esAcento('ni', ['gratis'])).toBe(false);
  });
});

const dichas = [
  { texto: '¿Pagar', inicio: 0.06, fin: 0.32 },
  { texto: 'precio', inicio: 0.4, fin: 0.64 },
  { texto: 'completo', inicio: 0.72, fin: 1.28 },
  { texto: 'por', inicio: 1.36, fin: 1.44 },
  { texto: 'el', inicio: 1.52, fin: 1.84 },
  { texto: 'envío?', inicio: 1.92, fin: 2.48 },
];

describe('subtítulos palabra por palabra', () => {
  it('agrupa hasta 3 palabras y corta tras la puntuación', () => {
    const g = gruposDe(dichas);
    expect(g.map((x) => x.palabras.length)).toEqual([3, 3]);
    const c = gruposDe([
      { texto: 'Sin', inicio: 0, fin: 0.1 },
      { texto: 'filas.', inicio: 0.2, fin: 0.5 },
      { texto: 'En', inicio: 0.6, fin: 0.7 },
    ]);
    expect(c.map((x) => x.palabras.map((p) => p.texto))).toEqual([['Sin', 'filas.'], ['En']]);
  });
  it('un grupo vacío de palabras no produce grupos', () => {
    expect(gruposDe([])).toEqual([]);
  });
  it('elige el grupo visible según el segundo y ninguno antes de la voz', () => {
    const g = gruposDe(dichas);
    expect(grupoActivo(g, -1)).toBe(-1);
    expect(grupoActivo(g, 0.5)).toBe(0);
    expect(grupoActivo(g, 1.6)).toBe(1);
    expect(grupoActivo(g, 5)).toBe(-1);
  });
  it('la palabra activa es la última que ya empezó', () => {
    const [g0] = gruposDe(dichas);
    if (!g0) throw new Error('sin grupo');
    expect(palabraActiva(g0, 0)).toBe(-1);
    expect(palabraActiva(g0, 0.45)).toBe(1);
    expect(palabraActiva(g0, 1)).toBe(2);
  });
  it('el punch es máximo al arrancar una frase y se apaga', () => {
    const g = gruposDe(dichas);
    expect(punchDe(-1, g)).toBe(0);
    expect(punchDe(0.06, g)).toBeCloseTo(0.02);
    expect(punchDe(0.5, g)).toBeLessThan(punchDe(0.1, g));
  });
});

describe('aplicarReemplazos', () => {
  const w = (texto: string, inicio: number) => ({ texto, inicio, fin: inicio + 0.2 });
  const habladas = [
    w('Aquí,', 0),
    w('cincuenta', 1),
    w('y', 1.3),
    w('cuatro', 1.4),
    w('mil', 1.7),
    w('novecientos', 1.9),
    w('noventa.', 2.4),
  ];
  const regla = { dice: 'Cincuenta y cuatro mil novecientos noventa', muestra: '$54.990' };
  it('calza al final y conserva tiempos y la puntuación de cierre', () => {
    const r = aplicarReemplazos(habladas, [regla]);
    expect(r.map((p) => p.texto)).toEqual(['Aquí,', '$54.990.']);
    expect(r[1]).toMatchObject({ inicio: 1, fin: 2.6 });
  });
  it('calza al medio sin tocar el resto', () => {
    const r = aplicarReemplazos(
      [w('te', 0), w('ahorras', 0.3), w('veintitrés', 1), w('mil', 1.3), w('pesos.', 1.6)],
      [{ dice: 'veintitres MIL pesos', muestra: '$23.000' }],
    );
    expect(r.map((p) => p.texto)).toEqual(['te', 'ahorras', '$23.000.']);
  });
  it('no calza: devuelve las palabras intactas', () => {
    expect(aplicarReemplazos(habladas, [{ dice: 'ochenta dólares', muestra: 'x' }])).toEqual(
      habladas,
    );
    expect(aplicarReemplazos(habladas, [])).toEqual(habladas);
  });
  it('reemplaza varias ocurrencias', () => {
    const r = aplicarReemplazos(
      [w('punto', 0), w('com', 0.3), w('y', 0.6), w('punto', 1), w('com?', 1.3)],
      [{ dice: 'punto com', muestra: '.com' }],
    );
    expect(r.map((p) => p.texto)).toEqual(['.com', 'y', '.com?']);
  });
});

describe('encuadre del fondo y tipografía', () => {
  it('sin paneo devuelve el foco; con paneo recorre de desde a hasta', () => {
    const foco = { x: 0.5, y: 0.6 };
    expect(posicionFondo(foco, undefined, 0.7)).toEqual(foco);
    const paneo = { desde: 0.1, hasta: 0.8 };
    expect(posicionFondo(foco, paneo, 0)).toEqual({ x: 0.1, y: 0.6 });
    expect(posicionFondo(foco, paneo, 1).x).toBeCloseTo(0.8);
    expect(posicionFondo(foco, paneo, 9).x).toBeCloseTo(0.8);
  });
  it('ajustarTam: más caracteres, letra más chica, y respeta el máximo', () => {
    expect(ajustarTam('$54.990', 930)).toBeGreaterThan(ajustarTam('$154.990', 930));
    expect(ajustarTam('A', 930, 0.39, 300)).toBe(300);
  });
  it('las partículas existen solo durante el estallido', () => {
    expect(particulas(10, 0, 100)).toEqual([]);
    expect(particulas(10, 1, 100)).toEqual([]);
    const ps = particulas(10, 0.5, 100);
    expect(ps).toHaveLength(10);
    expect(ps.every((p) => p.alfa > 0 && p.tam > 0)).toBe(true);
    expect(particulas(10, 0.5, 100)).toEqual(ps);
  });
});

describe('esquemas del tipo anuncio', () => {
  it('gancho: exige líneas y admite acento y fondo opcionales', () => {
    expect(esquemas.gancho.safeParse({ lineas: ['Sin filas', 'ni esperas'] }).success).toBe(true);
    expect(esquemas.gancho.safeParse({ lineas: [] }).success).toBe(false);
  });
  it('precio-tachado: pide referencia y precio con monto', () => {
    const ok = {
      referencia: { etiqueta: 'Precio de lista', monto: 'US$79,99' },
      precio: { monto: '$55.000' },
    };
    expect(esquemas['precio-tachado'].safeParse(ok).success).toBe(true);
    expect(esquemas['precio-tachado'].safeParse({ ...ok, precio: {} }).success).toBe(false);
  });
  it('ahorro: el monto es un entero positivo', () => {
    expect(esquemas.ahorro.safeParse({ monto: 23000 }).success).toBe(true);
    expect(esquemas.ahorro.safeParse({ monto: -5 }).success).toBe(false);
    expect(esquemas.ahorro.safeParse({ monto: 10.5 }).success).toBe(false);
  });
  it('telefono-3d: la captura es obligatoria y el toque va en 0–1', () => {
    expect(esquemas['telefono-3d'].safeParse({ captura: 'ejemplo/ficha' }).success).toBe(true);
    expect(esquemas['telefono-3d'].safeParse({}).success).toBe(false);
    expect(
      esquemas['telefono-3d'].safeParse({ captura: 'a/b', toque: { x: 2, y: 0.5 } }).success,
    ).toBe(false);
  });
  it('sellos: entre 2 y 4, con ícono del catálogo', () => {
    const s = (icono: string) => ({ icono, texto: 'Compra segura' });
    expect(
      esquemas.sellos.safeParse({ sellos: [s('cuenta'), s('escudo'), s('rayo')] }).success,
    ).toBe(true);
    expect(esquemas.sellos.safeParse({ sellos: [s('cuenta')] }).success).toBe(false);
    expect(esquemas.sellos.safeParse({ sellos: [s('cuenta'), s('dragon')] }).success).toBe(false);
  });
  it('portada-monitor: la portada es obligatoria', () => {
    expect(esquemas['portada-monitor'].safeParse({ portada: 'ejemplo/portada' }).success).toBe(
      true,
    );
    expect(esquemas['portada-monitor'].safeParse({ logo: 'x/y' }).success).toBe(false);
  });
  it('cuenta-regresiva: fechas ISO válidas y hasta posterior a desde', () => {
    const ok = { desde: '2026-10-10T00:00:00Z', hasta: '2026-11-01T00:00:00Z' };
    expect(esquemas['cuenta-regresiva'].safeParse(ok).success).toBe(true);
    expect(esquemas['cuenta-regresiva'].safeParse({ ...ok, hasta: 'pronto' }).success).toBe(false);
    expect(
      esquemas['cuenta-regresiva'].safeParse({ desde: ok.hasta, hasta: ok.desde }).success,
    ).toBe(false);
  });
  it('cierre: el botón es obligatorio', () => {
    expect(esquemas.cierre.safeParse({ boton: 'Compra en example.com' }).success).toBe(true);
    expect(esquemas.cierre.safeParse({}).success).toBe(false);
  });
});

describe('props nuevas', () => {
  it('gancho: foco y paneo acotados a 0–1', () => {
    const base = { lineas: ['Hola'] };
    const ok = esquemas.gancho.parse({
      ...base,
      foco: { x: 0.3, y: 0.6 },
      paneo: { desde: 0, hasta: 0.8 },
    });
    expect(ok.subtitulos).toBe(true);
    expect(esquemas.gancho.parse(base).foco).toEqual({ x: 0.5, y: 0.5 });
    expect(esquemas.gancho.safeParse({ ...base, foco: { x: 1.5, y: 0 } }).success).toBe(false);
    expect(esquemas.gancho.safeParse({ ...base, paneo: { desde: -1, hasta: 0 } }).success).toBe(
      false,
    );
  });
  it('subtitulos: activos por defecto y desactivables; apagados en telefono-3d', () => {
    expect(esquemas.ahorro.parse({ monto: 1 }).subtitulos).toBe(true);
    expect(esquemas.ahorro.parse({ monto: 1, subtitulos: false }).subtitulos).toBe(false);
    expect(esquemas['telefono-3d'].parse({ captura: 'a/b' }).subtitulos).toBe(false);
    expect(esquemas.cierre.safeParse({ boton: 'x', subtitulos: 'si' }).success).toBe(false);
  });
  it('reemplazos: opcionales por escena y con dice/muestra no vacíos', () => {
    expect(esquemas.ahorro.parse({ monto: 1 }).reemplazos).toEqual([]);
    expect(
      esquemas.ahorro.safeParse({ monto: 1, reemplazos: [{ dice: 'a', muestra: 'b' }] }).success,
    ).toBe(true);
    expect(
      esquemas.ahorro.safeParse({ monto: 1, reemplazos: [{ dice: '', muestra: 'b' }] }).success,
    ).toBe(false);
  });
  it('fecha: día y mes obligatorios, antetítulo por defecto y año opcional', () => {
    const f = esquemas.fecha.parse({ dia: '19', mes: 'Noviembre' });
    expect(f.antetitulo).toBe('Sale el');
    expect(f.anio).toBeUndefined();
    expect(esquemas.fecha.safeParse({ dia: '', mes: 'x' }).success).toBe(false);
    expect(esquemas.fecha.safeParse({ dia: '19' }).success).toBe(false);
  });
  it('cierre: imagen opcional como id de asset', () => {
    expect(esquemas.cierre.parse({ boton: 'x', imagen: 'a/portada' }).imagen).toBe('a/portada');
    expect(esquemas.cierre.safeParse({ boton: 'x', imagen: '' }).success).toBe(false);
  });
});

describe('fondo y franja de marca', () => {
  it('indiceActivo: la última escena que ya empezó', () => {
    expect(indiceActivo([0, 30, 60], 0)).toBe(0);
    expect(indiceActivo([0, 30, 60], 45)).toBe(1);
    expect(indiceActivo([0, 30, 60], 200)).toBe(2);
  });
  it('alfaFranja: sigue a la escena y cruza suavemente al apagarse', () => {
    const inicios = [0, 30, 60];
    const on = [true, true, false];
    expect(alfaFranja(on, inicios, 10, 10)).toBe(1);
    expect(alfaFranja(on, inicios, 65, 10)).toBeCloseTo(0.5);
    expect(alfaFranja(on, inicios, 100, 10)).toBe(0);
  });
  it('esquemas: fondo, video, velo, desenfoque y franja en todas las escenas', () => {
    const e = esquemas.gancho.parse({ lineas: ['a'], fondo: 'p/x', fondoDesde: 1.5, velo: 0.5 });
    expect(e.fondo).toBe('p/x');
    expect(e.fondoDesde).toBe(1.5);
    expect(esquemas.cierre.parse({ boton: 'x', desenfoque: 26 }).desenfoque).toBe(26);
    expect(esquemas.cierre.safeParse({ boton: 'x', desenfoque: 99 }).success).toBe(false);
    expect(esquemas.ahorro.parse({ monto: 1, franja: false }).franja).toBe(false);
    expect(esquemas.ahorro.parse({ monto: 1, franja: { precio: '$1' } }).franja).toMatchObject({
      precio: '$1',
    });
  });
  it('assetSchema acepta tipo video con segundos', () => {
    expect(
      assetSchema.safeParse({
        id: 'p/v',
        tipo: 'video',
        sha256: 'a'.repeat(64),
        origen: { fuente: 'grabacion' },
        archivo: 'v.mp4',
        ancho: 1080,
        alto: 1920,
        segundos: 2,
      }).success,
    ).toBe(true);
  });
});

describe('montaje, rueda de precio y entradas por voz', () => {
  const voz = [0.1, 0.4, 0.7, 1.6, 2.0].map((inicio) => ({ inicio }));
  it('cortesPorPalabras: arranca en 0, respeta el mínimo y parte los huecos largos', () => {
    const c = cortesPorPalabras(voz, 0, 90);
    expect(c[0]).toBe(0);
    for (let i = 1; i < c.length; i++) expect(c[i]! - c[i - 1]!).toBeGreaterThanOrEqual(15);
    for (let i = 1; i < c.length; i++) expect(c[i]! - c[i - 1]!).toBeLessThanOrEqual(60);
    expect(c.every((f, i) => i === 0 || f > c[i - 1]!)).toBe(true);
  });
  it('cortesPorPalabras: sin palabras corta en tramos de a lo más 2 s', () => {
    expect(cortesPorPalabras([], 0, 150)).toEqual([0, 50, 100]);
  });
  it('clipDe: rota entre los clips y respeta el desfase', () => {
    expect(clipDe([0, 30, 60], 2, 0)).toBe(0);
    expect(clipDe([0, 30, 60], 2, 35)).toBe(1);
    expect(clipDe([0, 30, 60], 2, 70)).toBe(0);
    expect(clipDe([0, 30, 60], 3, 0, 2)).toBe(2);
  });
  it('impactoCorte: el primero no golpea; los demás decaen en 5 cuadros con destello de 2', () => {
    const c = [0, 30, 60];
    expect(impactoCorte(c, 10)).toEqual({ fuerza: 0, destello: false });
    expect(impactoCorte(c, 30)).toEqual({ fuerza: 1, destello: true });
    expect(impactoCorte(c, 32).destello).toBe(false);
    expect(impactoCorte(c, 33).fuerza).toBeCloseTo(0.4);
    expect(impactoCorte(c, 40).fuerza).toBe(0);
  });
  it('ruedaPrecio: dígitos que giran y frenan en el valor; el resto fijo', () => {
    const fin = frenaRueda(10, '$54.990');
    const r = ruedaPrecio(fin, 10, '$54.990');
    expect(r.map((x) => x.caracter).join('')).toBe('$54.990');
    expect(r[0]!.posicion).toBeNull();
    expect(r[3]!.posicion).toBeNull();
    for (const x of r)
      if (x.posicion !== null) expect(x.posicion % 10).toBeCloseTo(Number(x.caracter));
    const antes = ruedaPrecio(14, 10, '$54.990')[1]!.posicion!;
    expect(antes).toBeGreaterThan(0);
    expect(antes % 10).not.toBeCloseTo(5);
  });
  it('frenaRueda: el último dígito frena después que el primero', () => {
    expect(frenaRueda(0, '$54.990')).toBeGreaterThan(frenaRueda(0, '$5'));
    expect(frenaRueda(7, 'sin dígitos')).toBe(7);
  });
  it('entradasPorVoz: una a una si coinciden y en proporción si no', () => {
    expect(entradasPorVoz(5, voz, 0, 0)).toEqual([3, 12, 21, 48, 60]);
    const e = entradasPorVoz(7, voz, 0, 0);
    expect(e).toHaveLength(7);
    expect(e[0]).toBe(3);
    expect(e[6]).toBe(60);
    expect(e.every((f, i) => i === 0 || f >= e[i - 1]!)).toBe(true);
    expect(entradasPorVoz(2, [], 0)).toEqual([0, 9]);
  });
  it('temblor de 8 cuadros: se apaga por completo y decae', () => {
    const a = (f: number) => Math.hypot(temblor(f, 0, 20, 8).x, temblor(f, 0, 20, 8).y);
    expect(temblor(8, 0, 20, 8)).toEqual({ x: 0, y: 0 });
    expect(Math.max(a(5), a(6), a(7))).toBeLessThan(Math.max(a(0.5), a(1), a(2)) + 1e-9);
  });
});

describe('pulido visual: easing, franja y cuenta viva', () => {
  it('expoOut: 0 al inicio, 1 al final, monótono y rápido al arrancar', () => {
    expect(expoOut(0)).toBe(0);
    expect(expoOut(1)).toBe(1);
    expect(expoOut(0.2)).toBeGreaterThan(0.7);
    expect(expoOut(0.6)).toBeGreaterThan(expoOut(0.3));
    expect(expoOut(-1)).toBe(0);
  });
  it('layoutFranja: el precio nunca se sale de su espacio ni pisa el bloque de texto', () => {
    for (const precio of ['$54.990', '$1.234.567', '$990', '$79,99']) {
      const l = layoutFranja(960, 34, 124, 20, 320, precio);
      expect(l.anchoPrecio).toBeLessThanOrEqual(l.disponible + 1e-9);
      expect(l.tam).toBeGreaterThan(0);
      expect(34 + 124 + 20 + 320 + 20 + l.anchoPrecio + 34).toBeLessThanOrEqual(960 + 1e-9);
    }
  });
  it('layoutFranja: un precio corto se topa con el máximo', () => {
    expect(layoutFranja(960, 34, 124, 20, 320, '$9', 130).tam).toBe(130);
  });
  it('anchoPrecioEm: crece con cada dígito', () => {
    expect(anchoPrecioEm('$54.990')).toBeGreaterThan(anchoPrecioEm('$990'));
  });
  it('cuentaViva: quieta antes de arrancar y resta un segundo por tick con su progreso', () => {
    expect(cuentaViva(100, 10, 30, 5)).toEqual({ segundos: 100, anterior: 100, progreso: 1 });
    expect(cuentaViva(100, 30, 30, 5).segundos).toBe(100);
    const a = cuentaViva(100, 40, 30, 5);
    expect(a.segundos).toBe(98);
    expect(a.anterior).toBe(99);
    expect(a.progreso).toBe(0);
    expect(cuentaViva(100, 42, 30, 5).progreso).toBe(0.5);
    expect(cuentaViva(1, 300, 0, 5).segundos).toBe(0);
  });
  it('partesDeSegundos: descompone en d/h/m/s', () => {
    expect(partesDeSegundos(39 * 86400 + 12 * 3600 + 5 * 60 + 9)).toEqual({
      dias: 39,
      horas: 12,
      minutos: 5,
      segundos: 9,
    });
  });
});

describe('catálogo del tipo anuncio', () => {
  it('cada escena tiene esquema y componente, y admite 60 fps', () => {
    expect(Object.keys(anuncio.componentes).sort()).toEqual(Object.keys(anuncio.esquemas).sort());
    for (const c of Object.values(anuncio.componentes)) expect(c).toBeTypeOf('function');
    expect(anuncio.admite60).toBe(true);
  });
});
