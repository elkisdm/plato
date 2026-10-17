#!/usr/bin/env node
// Piezas de HyperFrames para el estudio (ADR-0013): renderiza un bloque del catálogo y lo registra
// como asset de video (ADR-0011), para que Remotion lo use como un clip más.
//
//   node tools/pieza.mjs <espacio> <bloque> <nombre> [--marca m] [--var k=v ...] [--alfa] [--calidad draft|looks|delivery]
//   node tools/pieza.mjs buscar <texto>
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TS = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAIZ = join(TS, '..');
const HF = join(RAIZ, 'hyperframes');
const UPSTREAM = join(HF, 'upstream');
const CLI = join(HF, 'node_modules', '.bin', 'hyperframes');
const GRUPOS = ['blocks', 'components', 'examples'];
const CALIDADES = ['draft', 'looks', 'delivery'];
const LICENCIA_POR_DEFECTO = 'Apache-2.0 (catálogo HyperFrames); revisar assets del bloque';

const leer = (p) => JSON.parse(readFileSync(p, 'utf8'));
const fallar = (msj) => {
  console.error(`✖ ${msj}`);
  process.exit(1);
};
const opcion = (args, nombre) => {
  const i = args.indexOf(`--${nombre}`);
  return i === -1 ? undefined : args[i + 1];
};

/**
 * Busca un bloque, componente o ejemplo del catálogo por nombre.
 * @param {string} nombre
 * @param {string} raizCatalogo carpeta que contiene `registry/` (por defecto hyperframes/upstream)
 * @returns {{ grupo: string, dir: string, item: object }}
 */
export const resolverBloque = (nombre, raizCatalogo = UPSTREAM) => {
  for (const grupo of GRUPOS) {
    const dir = join(raizCatalogo, 'registry', grupo, nombre);
    if (existsSync(join(dir, 'registry-item.json'))) return { grupo, dir, item: leer(join(dir, 'registry-item.json')) };
  }
  throw new Error(`El bloque «${nombre}» no existe en el catálogo (busca con: node tools/pieza.mjs buscar <texto>)`);
};

/** Bloques cuyo name, title, description o tags contienen el texto (sin distinguir mayúsculas). */
export const buscarBloques = (texto, raizCatalogo = UPSTREAM) => {
  const q = texto.toLowerCase();
  return GRUPOS.flatMap((grupo) => {
    const base = join(raizCatalogo, 'registry', grupo);
    if (!existsSync(base)) return [];
    return readdirSync(base)
      .filter((n) => existsSync(join(base, n, 'registry-item.json')))
      .map((n) => ({ grupo, nombre: n, item: leer(join(base, n, 'registry-item.json')) }))
      .filter(({ nombre, item }) =>
        [nombre, item.title, item.description, ...(item.tags ?? [])].some((c) => String(c ?? '').toLowerCase().includes(q)),
      );
  }).sort((a, b) => a.nombre.localeCompare(b.nombre));
};

/** Colores de marca para las variables `color` que el bloque declara: indigo→accent, noche→background. */
export const variablesDeMarca = (marca, declaradas) => {
  const mapa = { accent: marca?.colores?.indigo, background: marca?.colores?.noche };
  return Object.fromEntries(
    Object.entries(mapa).filter(([id, valor]) => valor && declaradas.some((d) => d.id === id && d.type === 'color')),
  );
};

/** Solo comprueba que cada id esté declarado; los tipos los valida la CLI con --strict-variables. */
export const validarVariables = (vars, declaradas) => {
  const validas = declaradas.map((d) => d.id);
  const ajenas = Object.keys(vars).filter((k) => !validas.includes(k));
  if (ajenas.length) {
    throw new Error(`Variable(s) no declarada(s) por el bloque: ${ajenas.join(', ')}. Válidas: ${validas.join(', ') || '(ninguna)'}`);
  }
};

/** `origen` del asset: solo string/number/boolean (assetSchema), por eso `variables` va como JSON. */
export const origenDePieza = ({ bloque, upstream, variables, item, calidad, formato }) => ({
  motor: 'hyperframes',
  bloque,
  upstream,
  variables: JSON.stringify(variables),
  licencia: item?.license ?? LICENCIA_POR_DEFECTO,
  calidad,
  formato,
});

/** Argumentos de `hyperframes render`. Alfa = webm; nunca 4k con alfa. */
export const argsRender = ({ dir, variablesFile, salida, calidad, alfa, resolucion }) => {
  if (!CALIDADES.includes(calidad)) throw new Error(`La calidad «${calidad}» es inválida: usa ${CALIDADES.join(', ')}`);
  if (alfa && resolucion === '4k') throw new Error('El alfa no se combina con 4k');
  return [
    'render', dir,
    '--variables-file', variablesFile,
    '--strict-variables',
    '-q', calidad,
    '--format', alfa ? 'webm' : 'mp4',
    ...(resolucion ? ['--resolution', resolucion] : []),
    '-o', salida,
  ];
};

/** Los --var llegan como texto: los números se pasan como número (la CLI estricta valida el tipo). */
const tipar = (vars, declaradas) =>
  Object.fromEntries(
    Object.entries(vars).map(([k, v]) => {
      const tipo = declaradas.find((d) => d.id === k)?.type;
      return [k, tipo === 'number' && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : tipo === 'boolean' || tipo === 'toggle' ? v === 'true' : v];
    }),
  );

const renderizarConCli = (args) => {
  if (!existsSync(CLI)) throw new Error('Falta la CLI de HyperFrames: ejecuta «pnpm -C hyperframes install»');
  execFileSync(CLI, args, { stdio: 'inherit', env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1' } });
};

const registrarConEstudio = (espacio, archivo, nombre, origen) =>
  execFileSync(
    'node',
    [join(TS, 'tools', 'estudio.mjs'), 'registrar', espacio, archivo, nombre, ...Object.entries(origen).flatMap(([k, v]) => ['--origen', `${k}=${v}`])],
    { stdio: 'inherit' },
  );

/**
 * Flujo completo: variables → validar → copiar carpeta → renderizar → registrar.
 * Falla cerrado: si el render falla se borra la salida y no se llama a `registrar`.
 * `renderizar(args, salida)` y `registrar(espacio, archivo, nombre, origen)` son inyectables.
 */
export const generarPieza = ({
  espacio, bloque, nombre, marca, vars = {}, alfa = false, calidad = 'looks', resolucion,
  raizCatalogo = UPSTREAM, trabajo, commit,
  renderizar = (args) => renderizarConCli(args),
  registrar = registrarConEstudio,
}) => {
  const { dir, item } = resolverBloque(bloque, raizCatalogo);
  const declaradas = item.variables ?? [];
  validarVariables(vars, declaradas);
  const variables = tipar({ ...variablesDeMarca(marca, declaradas), ...vars }, declaradas);

  rmSync(trabajo, { recursive: true, force: true });
  mkdirSync(dirname(trabajo), { recursive: true });
  cpSync(dir, trabajo, { recursive: true });
  if (existsSync(join(trabajo, `${bloque}.html`))) renameSync(join(trabajo, `${bloque}.html`), join(trabajo, 'index.html'));

  const formato = alfa ? 'webm' : 'mp4';
  const variablesFile = join(trabajo, 'variables.json');
  const salida = join(trabajo, `salida.${formato}`);
  writeFileSync(variablesFile, JSON.stringify(variables, null, 2));
  try {
    renderizar(argsRender({ dir: trabajo, variablesFile, salida, calidad, alfa, resolucion }), salida);
    if (!existsSync(salida)) throw new Error('El render terminó sin generar el archivo de salida');
    registrar(espacio, salida, nombre, origenDePieza({ bloque, upstream: commit, variables, item, calidad, formato }));
  } finally {
    rmSync(salida, { force: true });
  }
};

const [cmd, ...args] = process.argv.slice(2);
// Solo corre como CLI: importado (tests) expone las funciones puras sin ejecutar comandos.
const esCli = process.argv[1] === fileURLToPath(import.meta.url);
if (esCli) {
  try {
    if (cmd === 'buscar') {
      if (!args[0]) fallar('Uso: node tools/pieza.mjs buscar <texto>');
      for (const b of buscarBloques(args[0])) console.log(`${b.nombre}  (${b.grupo})  ${b.item.title ?? ''} — ${(b.item.description ?? '').slice(0, 90)}`);
    } else {
      const [espacio, bloque, nombre] = [cmd, args[0], args[1]];
      if (!espacio || !bloque || !nombre) fallar('Uso: node tools/pieza.mjs <espacio> <bloque> <nombre> [--marca m] [--var k=v ...] [--alfa] [--calidad draft|looks|delivery]');
      const idMarca = opcion(args, 'marca');
      const rutaMarca = idMarca && join(RAIZ, 'estudio', 'marcas', idMarca, 'marca.json');
      if (idMarca && !existsSync(rutaMarca)) fallar(`No existe la marca «${idMarca}»`);
      const vars = Object.fromEntries(
        args.flatMap((a, i) => {
          if (args[i - 1] !== '--var') return [];
          const j = a.indexOf('=');
          return [j === -1 ? [a, ''] : [a.slice(0, j), a.slice(j + 1)]];
        }),
      );
      const commit = execFileSync('git', ['-C', UPSTREAM, 'rev-parse', 'HEAD']).toString().trim();
      generarPieza({
        espacio, bloque, nombre, vars, alfa: args.includes('--alfa'), calidad: opcion(args, 'calidad') ?? 'looks',
        marca: rutaMarca ? leer(rutaMarca) : undefined, commit,
        trabajo: join(HF, 'piezas', espacio, nombre),
      });
    }
  } catch (e) {
    fallar(e.message);
  }
}
