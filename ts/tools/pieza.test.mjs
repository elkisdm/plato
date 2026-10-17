import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { argsRender, buscarBloques, generarPieza, origenDePieza, resolverBloque, validarVariables, variablesDeMarca } from './pieza.mjs';

/** Catálogo falso: registry/{blocks,components,examples}/<nombre>/registry-item.json. */
const catalogo = () => {
  const raiz = mkdtempSync(join(tmpdir(), 'pieza-'));
  const poner = (grupo, nombre, item) => {
    const dir = join(raiz, 'registry', grupo, nombre);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'registry-item.json'), JSON.stringify({ name: nombre, ...item }));
    writeFileSync(join(dir, `${nombre}.html`), '<html></html>');
  };
  poner('blocks', 'barras', { title: 'Bar Chart', description: 'Ranked bars', tags: ['chart'], variables: [{ id: 'accent', type: 'color', default: '#000' }, { id: 'title', type: 'string', default: 'x' }] });
  poner('components', 'cursor', { title: 'Cursor', description: 'Agent cursor', tags: ['ui'] });
  poner('examples', 'promo', { title: 'Promo', description: 'Product promo', tags: ['video'] });
  return raiz;
};

const declaradas = [
  { id: 'accent', type: 'color' },
  { id: 'background', type: 'color' },
  { id: 'title', type: 'string' },
];
const marca = { colores: { indigo: '#5271FF', noche: '#12183A' } };

describe('resolverBloque', () => {
  it('encuentra bloques, componentes y ejemplos', () => {
    const raiz = catalogo();
    expect(resolverBloque('barras', raiz).grupo).toBe('blocks');
    expect(resolverBloque('cursor', raiz).grupo).toBe('components');
    expect(resolverBloque('promo', raiz).grupo).toBe('examples');
    expect(resolverBloque('barras', raiz).item.title).toBe('Bar Chart');
  });
  it('falla con mensaje claro si no existe', () => {
    expect(() => resolverBloque('nada', catalogo())).toThrow(/nada/);
  });
});

describe('variablesDeMarca', () => {
  it('mapea indigo→accent y noche→background solo si el bloque los declara como color', () => {
    expect(variablesDeMarca(marca, declaradas)).toEqual({ accent: '#5271FF', background: '#12183A' });
    expect(variablesDeMarca(marca, [{ id: 'accent', type: 'color' }])).toEqual({ accent: '#5271FF' });
    expect(variablesDeMarca(marca, [{ id: 'accent', type: 'string' }, { id: 'title', type: 'string' }])).toEqual({});
  });
  it('--var explícito gana sobre la marca (al mezclar)', () => {
    const v = { ...variablesDeMarca(marca, declaradas), accent: '#FF0000' };
    expect(v.accent).toBe('#FF0000');
  });
});

describe('validarVariables', () => {
  it('acepta ids declarados', () => {
    expect(() => validarVariables({ title: 'a' }, declaradas)).not.toThrow();
  });
  it('rechaza una variable no declarada y lista las válidas', () => {
    expect(() => validarVariables({ foo: '1' }, declaradas)).toThrow(/foo.*accent, background, title/s);
  });
});

describe('origenDePieza', () => {
  const base = { bloque: 'barras', upstream: 'abc123', variables: { accent: '#5271FF' }, item: {}, calidad: 'looks', formato: 'mp4' };
  it('arma el origen con motor, bloque, upstream, variables como JSON y licencia', () => {
    const o = origenDePieza(base);
    expect(o).toMatchObject({ motor: 'hyperframes', bloque: 'barras', upstream: 'abc123', calidad: 'looks', formato: 'mp4' });
    expect(JSON.parse(o.variables)).toEqual({ accent: '#5271FF' });
    expect(o.licencia).toMatch(/Apache-2\.0 \(catálogo HyperFrames\)/);
  });
  it('usa la licencia que declare el bloque', () => {
    expect(origenDePieza({ ...base, item: { license: 'Apache-2.0 AND MIT' } }).licencia).toBe('Apache-2.0 AND MIT');
  });
});

describe('argsRender', () => {
  const r = { dir: '/d', variablesFile: '/d/v.json', salida: '/d/out.mp4', calidad: 'looks' };
  it('mp4 sin alfa, siempre --strict-variables', () => {
    const a = argsRender({ ...r, alfa: false });
    expect(a).toContain('--strict-variables');
    expect(a[a.indexOf('--format') + 1]).toBe('mp4');
    expect(a[a.indexOf('-q') + 1]).toBe('looks');
  });
  it('webm con alfa', () => {
    expect(argsRender({ ...r, salida: '/d/out.webm', alfa: true })[argsRender({ ...r, alfa: true }).indexOf('--format') + 1]).toBe('webm');
  });
  it('nunca 4k con alfa', () => {
    expect(argsRender({ ...r, alfa: true })).not.toContain('--resolution');
    expect(() => argsRender({ ...r, alfa: true, resolucion: '4k' })).toThrow(/alfa/);
  });
  it('rechaza una calidad desconocida', () => {
    expect(() => argsRender({ ...r, alfa: false, calidad: 'ultra' })).toThrow(/calidad/);
  });
});

describe('buscarBloques', () => {
  it('busca en name, title, description y tags', () => {
    const raiz = catalogo();
    expect(buscarBloques('chart', raiz).map((b) => b.nombre)).toEqual(['barras']);
    expect(buscarBloques('PROMO', raiz).map((b) => b.nombre)).toEqual(['promo']);
    expect(buscarBloques('zzz', raiz)).toEqual([]);
  });
});

describe('generarPieza (falla cerrado)', () => {
  const base = (extra) => ({
    espacio: 'biblioteca', bloque: 'barras', nombre: 'g/x', marca: marca, vars: {}, alfa: false, calidad: 'draft',
    raizCatalogo: catalogo(), trabajo: mkdtempSync(join(tmpdir(), 'trabajo-')), commit: 'abc', ...extra,
  });
  it('registra solo si el render sale bien', () => {
    const llamadas = [];
    generarPieza(base({
      renderizar: (_args, salida) => writeFileSync(salida, 'video'),
      registrar: (...a) => llamadas.push(a),
    }));
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0][0]).toBe('biblioteca');
    expect(llamadas[0][2]).toBe('g/x');
  });
  it('no registra y borra el temporal si el render falla', () => {
    const llamadas = [];
    const o = base({
      renderizar: (_args, salida) => {
        writeFileSync(salida, 'a medias');
        throw new Error('render roto');
      },
      registrar: (...a) => llamadas.push(a),
    });
    expect(() => generarPieza(o)).toThrow(/render roto/);
    expect(llamadas).toHaveLength(0);
  });
  it('no renderiza ni registra con una variable no declarada', () => {
    let renderizo = false;
    expect(() => generarPieza(base({ vars: { foo: '1' }, renderizar: () => { renderizo = true; }, registrar: () => {} }))).toThrow(/foo/);
    expect(renderizo).toBe(false);
  });
});
