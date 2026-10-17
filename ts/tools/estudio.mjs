#!/usr/bin/env node
// CLI del estudio de video (ADR-0011). Proyectos = datos en estudio/; binarios en ts/public/estudio/
// (fuera de git) descritos por manifiestos assets.json con sha256 y procedencia.
//
//   node tools/estudio.mjs registrar <espacio> <archivo> <nombre> [--origen clave=valor ...] [--deriva id]
//   node tools/estudio.mjs verificar [proyecto]
//   node tools/estudio.mjs indexar
//   node tools/estudio.mjs nuevo <proyecto> --marca <marca> --tipo <tipo>
//   node tools/estudio.mjs clonar <origen> <nuevo>
//   node tools/estudio.mjs voz <proyecto> [--forzar e1,e2]   (OPENAI_API_KEY o ELEVENLABS_API_KEY en el entorno; ver estudio/README.md)
//   node tools/estudio.mjs render <proyecto> [--4k] [--correo] [--solo horizontal|vertical|poster]
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const TS = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAIZ = join(TS, '..');
const ESTUDIO = join(RAIZ, 'estudio');
const PUBLICO = join(TS, 'public', 'estudio');
const DATOS = join(TS, 'src', 'estudio', 'datos.generated.ts');

const leer = (p) => JSON.parse(readFileSync(p, 'utf8'));
const escribir = (p, datos) => {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(datos, null, 2) + '\n');
};
const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const fallar = (msj) => {
  console.error(`✖ ${msj}`);
  process.exit(1);
};
const opcion = (args, nombre) => {
  const i = args.indexOf(`--${nombre}`);
  return i === -1 ? undefined : args[i + 1];
};

/** Subcarpetas de `dir` que tienen su archivo principal (ignora .DS_Store y carpetas a medias). */
/** Ids de marca y proyecto: minúsculas, números y guiones (también son identificadores en el índice). */
const ID_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const avisadas = new Set();
const carpetasCon = (dir, archivos) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .filter((d) => {
          const faltan = archivos.filter((f) => !existsSync(join(dir, d.name, f)));
          const valida = faltan.length === 0 && ID_VALIDO.test(d.name);
          if (!valida && !avisadas.has(d.name)) {
            avisadas.add(d.name);
            console.warn(`⚠ omito ${relative(RAIZ, join(dir, d.name))}: ${faltan.length ? `faltan ${faltan.join(', ')}` : 'id inválido'}`);
          }
          return valida;
        })
        .map((d) => d.name)
        .sort()
    : [];
const marcas = () => carpetasCon(join(ESTUDIO, 'marcas'), ['marca.json', 'assets.json']);
const proyectos = () =>
  carpetasCon(join(ESTUDIO, 'proyectos'), ['proyecto.json', 'guion.json', 'assets.json', 'voz.json']);
/** Tipos de video con catálogo en el código (ts/src/estudio/tipos/<tipo>/index.ts). */
const tiposDisponibles = () => carpetasCon(join(TS, 'src', 'estudio', 'tipos'), ['index.ts']);
/** Nombre de asset: lo mismo que acepta assetSchema (sin «..», sin espacios ni puntos). */
const NOMBRE_ASSET = /^[a-zA-Z0-9-]+(\/[a-zA-Z0-9-]+)*(@\d+)?$/;
const validarId = (id) => {
  if (!id || !ID_VALIDO.test(id)) fallar(`Id inválido «${id}»: usa minúsculas, números y guiones`);
};

/** Dónde vive el manifiesto de un espacio de ids: una marca, un proyecto o la biblioteca. */
const manifiestoDe = (espacio) => {
  if (espacio === 'biblioteca') return join(ESTUDIO, 'biblioteca', 'assets.json');
  if (marcas().includes(espacio)) return join(ESTUDIO, 'marcas', espacio, 'assets.json');
  if (proyectos().includes(espacio)) return join(ESTUDIO, 'proyectos', espacio, 'assets.json');
  return fallar(`El espacio «${espacio}» no es una marca, un proyecto ni «biblioteca»`);
};
const todosLosManifiestos = () =>
  [
    join(ESTUDIO, 'biblioteca', 'assets.json'),
    ...marcas().map((m) => join(ESTUDIO, 'marcas', m, 'assets.json')),
    ...proyectos().map((p) => join(ESTUDIO, 'proyectos', p, 'assets.json')),
  ].filter(existsSync);

/** Tipo de asset según la extensión: lo que no es imagen, fuente ni datos se mide como audio. */
export const tipoDeArchivo = (archivo) =>
  /\.(png|jpe?g|webp)$/i.test(archivo)
    ? 'imagen'
    : /\.(ttf|otf|woff2?)$/i.test(archivo)
      ? 'fuente'
      : /\.json$/i.test(archivo)
        ? 'datos'
        : /\.(mp4|mov|webm|m4v)$/i.test(archivo)
          ? 'video'
          : 'audio';

/** Dimensiones o duración con ffprobe (las fuentes y los datos no se miden). */
export const medir = (archivo) => {
  const tipo = tipoDeArchivo(archivo);
  if (tipo === 'fuente' || tipo === 'datos') return { tipo };
  const salida = JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', archivo]).toString(),
  );
  const s = salida.streams?.find((x) => x.width) ?? {};
  const segundos = Math.round(Number(salida.format.duration) * 100) / 100;
  if (tipo === 'video') return { tipo: 'video', ancho: s.width, alto: s.height, segundos };
  return tipo === 'imagen'
    ? { tipo: 'imagen', ancho: s.width, alto: s.height }
    : { tipo: 'audio', segundos: Math.round(Number(salida.format.duration) * 100) / 100 };
};

/** Copia un binario al estudio y lo registra (o actualiza) en el manifiesto de su espacio. */
const registrar = (espacio, origen, nombre, extra = {}) => {
  if (!existsSync(origen)) fallar(`No existe ${origen}`);
  const ruta = manifiestoDe(espacio); // falla antes de copiar si el espacio no existe
  if (!NOMBRE_ASSET.test(nombre)) fallar(`Nombre de asset inválido «${nombre}»: usa letras, números, guiones y «/» (y «@n» para tomas)`);
  const existente = existsSync(ruta) ? leer(ruta).assets.find((a) => a.id === `${espacio}/${nombre}`) : undefined;
  if (existente && existente.sha256 !== sha256(origen)) {
    fallar(`${espacio}/${nombre} ya existe con otro contenido: los assets son inmutables. Registra otro nombre (p. ej. ${nombre}@2) con --deriva ${espacio}/${nombre}`);
  }
  const medidas = medir(origen); // antes de copiar: un archivo ilegible no deja un binario huérfano
  const archivo = `${espacio}/${nombre}${extname(origen).toLowerCase()}`;
  const destino = join(PUBLICO, archivo);
  mkdirSync(dirname(destino), { recursive: true });
  copyFileSync(origen, destino);
  const manifiesto = existsSync(ruta) ? leer(ruta) : { assets: [] };
  const id = `${espacio}/${nombre}`;
  const previo = manifiesto.assets.find((a) => a.id === id);
  const asset = {
    id,
    archivo,
    ...medidas,
    sha256: sha256(destino),
    origen: { ...(previo?.origen ?? {}), ...extra.origen, registrado: new Date().toISOString().slice(0, 10) },
    ...(extra.deriva ? { deriva: extra.deriva } : {}),
    zonas: extra.zonas ?? previo?.zonas ?? {},
    cortes: extra.cortes ?? previo?.cortes ?? {},
  };
  manifiesto.assets = [...manifiesto.assets.filter((a) => a.id !== id), asset].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  escribir(ruta, manifiesto);
  return asset;
};

/** Campos del proyecto, el guion y voz.json que guardan ids de assets (ver los esquemas en ts/src/estudio). */
const CAMPOS_ASSET = new Set(['captura', 'encabezado', 'escritorio', 'movil', 'asset', 'musica']);

/** Ids de assets que referencia un objeto: solo los valores de CAMPOS_ASSET, nunca textos, URLs ni modelos. */
export const idsDeAssets = (valor) => {
  if (Array.isArray(valor)) return valor.flatMap(idsDeAssets);
  if (!valor || typeof valor !== 'object') return [];
  return Object.entries(valor).flatMap(([clave, v]) =>
    CAMPOS_ASSET.has(clave) && typeof v === 'string' && v ? [v] : idsDeAssets(v),
  );
};

/** Revisa que cada asset exista y que su hash coincida. Con proyecto, solo lo que ese proyecto usa. */
const verificar = (proyecto) => {
  const indice = new Map();
  for (const ruta of todosLosManifiestos()) for (const a of leer(ruta).assets) indice.set(a.id, a);
  let usados = [...indice.keys()];
  if (proyecto) {
    const dir = join(ESTUDIO, 'proyectos', proyecto);
    if (!existsSync(dir)) fallar(`No existe el proyecto ${proyecto}`);
    const datos = ['proyecto.json', 'guion.json', 'voz.json'].map((f) => (existsSync(join(dir, f)) ? leer(join(dir, f)) : {}));
    const p = datos[0];
    const marca = leer(join(ESTUDIO, 'marcas', p.marca, 'marca.json'));
    const idsMarca = [...Object.values(marca.logos), ...Object.values(marca.iconos)];
    usados = [...new Set([...datos.flatMap(idsDeAssets), ...idsMarca])];
  }
  const errores = [];
  for (const id of usados) {
    const a = indice.get(id);
    if (!a) errores.push(`${id}: no está en ningún manifiesto`);
    else if (!existsSync(join(PUBLICO, a.archivo))) errores.push(`${id}: falta el binario ts/public/estudio/${a.archivo}`);
    else if (sha256(join(PUBLICO, a.archivo)) !== a.sha256) errores.push(`${id}: el binario no coincide con su sha256`);
  }
  if (errores.length) fallar(`verificar ${proyecto ?? '(todo)'}:\n  ${errores.join('\n  ')}`);
  console.log(`✓ ${usados.length} assets verificados${proyecto ? ` para ${proyecto}` : ''}`);
};

/** Regenera datos.generated.ts: importa marcas, proyectos y manifiestos para Remotion. */
const indexar = () => {
  const rel = (p) => relative(dirname(DATOS), p).split('\\').join('/');
  const ident = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  // Dos ids distintos no pueden dar el mismo identificador (p. ej. «a-1» y «a1»).
  for (const lista of [marcas(), proyectos()]) {
    const vistos = new Map();
    for (const x of lista) {
      const previo = vistos.get(ident(x));
      if (previo) fallar(`«${x}» y «${previo}» dan el mismo identificador en el índice: renombra uno`);
      vistos.set(ident(x), x);
    }
  }
  const lineas = [
    '// GENERADO por `node tools/estudio.mjs indexar`. No editar a mano.',
    '/* eslint-disable */',
  ];
  const biblioteca = join(ESTUDIO, 'biblioteca', 'assets.json');
  lineas.push(existsSync(biblioteca) ? `import biblioteca from '${rel(biblioteca)}';` : 'const biblioteca = { assets: [] };');
  for (const m of marcas()) {
    lineas.push(`import marca_${ident(m)} from '${rel(join(ESTUDIO, 'marcas', m, 'marca.json'))}';`);
    lineas.push(`import assetsMarca_${ident(m)} from '${rel(join(ESTUDIO, 'marcas', m, 'assets.json'))}';`);
  }
  for (const p of proyectos()) {
    const d = join(ESTUDIO, 'proyectos', p);
    for (const [n, f] of [['proyecto', 'proyecto.json'], ['guion', 'guion.json'], ['assets', 'assets.json'], ['voz', 'voz.json']]) {
      lineas.push(`import ${n}_${ident(p)} from '${rel(join(d, f))}';`);
    }
  }
  lineas.push('', 'export const manifiestos: unknown[] = [', '  biblioteca,');
  for (const m of marcas()) lineas.push(`  assetsMarca_${ident(m)},`);
  for (const p of proyectos()) lineas.push(`  assets_${ident(p)},`);
  lineas.push('];', '', 'export const marcas: Record<string, unknown> = {');
  for (const m of marcas()) lineas.push(`  '${m}': marca_${ident(m)},`);
  lineas.push('};', '', 'export const proyectos: Record<string, { proyecto: unknown; guion: unknown; voz: unknown }> = {');
  for (const p of proyectos()) lineas.push(`  '${p}': { proyecto: proyecto_${ident(p)}, guion: guion_${ident(p)}, voz: voz_${ident(p)} },`);
  lineas.push('};', '');
  writeFileSync(DATOS, lineas.join('\n'));
  console.log(`✓ índice: ${marcas().length} marca(s), ${proyectos().length} proyecto(s)`);
};

const nuevo = (id, marca, tipo) => {
  validarId(id);
  const dir = join(ESTUDIO, 'proyectos', id);
  if (existsSync(dir)) fallar(`Ya existe ${id}`);
  if (!marcas().includes(marca)) fallar(`No existe la marca ${marca}`);
  if (!tiposDisponibles().includes(tipo)) fallar(`Tipo desconocido: ${tipo} (disponibles: ${tiposDisponibles().join(', ')})`);
  escribir(join(dir, 'proyecto.json'), {
    id, nombre: id, version: '0.1.0', marca, tipo, descripcion: '', formatos: ['horizontal', 'vertical'],
    poster: { antetitulo: '', titulo: id, captura: '' },
  });
  escribir(join(dir, 'guion.json'), { escenas: [] });
  escribir(join(dir, 'assets.json'), { assets: [] });
  escribir(join(dir, 'voz.json'), {});
  writeFileSync(join(dir, 'CHANGELOG.md'), `# ${id}\n\n## 0.1.0\n\n- Proyecto creado.\n`);
  indexar();
  console.log(`✓ proyecto ${id} (${marca}, ${tipo}) en estudio/proyectos/${id}`);
  console.log('  Falta: escenas en guion.json y poster.captura. Hasta entonces el Studio lo omite (y lo dice en consola).');
};

/** Clona un proyecto: copia sus datos y referencia los mismos assets (no duplica binarios). */
const clonar = (origen, id) => {
  validarId(id);
  const desde = join(ESTUDIO, 'proyectos', origen);
  const dir = join(ESTUDIO, 'proyectos', id);
  if (!existsSync(desde)) fallar(`No existe ${origen}`);
  if (existsSync(dir)) fallar(`Ya existe ${id}`);
  const p = leer(join(desde, 'proyecto.json'));
  escribir(join(dir, 'proyecto.json'), { ...p, id, nombre: `${p.nombre} (copia)`, version: '0.1.0', clonadoDe: `${origen}@${p.version}` });
  for (const f of ['guion.json', 'voz.json']) copyFileSync(join(desde, f), join(dir, f));
  escribir(join(dir, 'assets.json'), { assets: [] });
  writeFileSync(join(dir, 'CHANGELOG.md'), `# ${id}\n\n## 0.1.0\n\n- Clonado de ${origen}@${p.version}.\n`);
  indexar();
  console.log(`✓ ${id} clonado de ${origen}@${p.version}: reutiliza sus assets y su voz`);
};

/**
 * Locución según proyecto.json: OpenAI genera una toma por escena; ElevenLabs, una sola toma de toda
 * la narración que se corta por escena (ver `vozTomaUnica`). Registra los audios y escribe voz.json.
 */
const voz = async (id, args = []) => {
  // --forzar e1,e2: regenera esas escenas aunque su texto no haya cambiado (p. ej. si el TTS truncó la toma).
  const forzar = new Set((opcion(args, 'forzar') ?? '').split(',').filter(Boolean));
  const dir = join(ESTUDIO, 'proyectos', id);
  const p = leer(join(dir, 'proyecto.json'));
  if (!p.voz) fallar(`${id} no define "voz" en proyecto.json`);
  try {
    pedidoVoz(p.voz, '', process.env);
  } catch (error) {
    fallar(error.message);
  }
  const guion = leer(join(dir, 'guion.json'));
  const vozJson = existsSync(join(dir, 'voz.json')) ? leer(join(dir, 'voz.json')) : {};
  const tmp = join(TS, 'out', 'estudio', '.voz');
  mkdirSync(tmp, { recursive: true });
  const escenas = new Map(guion.escenas.map((e) => [e.id, e]));
  // Escenas borradas o que ya no tienen locución: su voz deja de sonar y de estirar la escena.
  for (const escenaId of Object.keys(vozJson)) {
    if (decidirVoz(vozJson[escenaId], escenas.get(escenaId), id, p.voz) === 'quitar') delete vozJson[escenaId];
  }
  // voz.json se guarda tras cada paso: si una llamada falla a mitad, lo ya generado queda registrado.
  escribir(join(dir, 'voz.json'), vozJson);
  const pendientes = guion.escenas.filter((e) => forzar.has(e.id) || decidirVoz(vozJson[e.id], e, id, p.voz) === 'regenerar');
  if (p.voz.proveedor === 'elevenlabs') {
    // Una escena distinta cambia la entonación de las vecinas: se rehace la toma completa.
    if (pendientes.length) await vozTomaUnica(id, p.voz, guion.escenas, vozJson, tmp);
  } else {
    for (const e of pendientes) await vozPorEscena(id, p.voz, e, vozJson, tmp);
  }
  escribir(join(dir, 'voz.json'), vozJson);
  indexar();
};

/** Una toma nueva es un asset nuevo (<escena>@n): la anterior sigue sirviendo a clones y versiones viejas. */
const registrarToma = (id, config, escena, wav, extra = {}) => {
  const filtro = filtroRitmo(config);
  const a = registrar(id, wav, siguienteNombre(manifiestoDe(id), `voz/${escena.id}`), {
    origen: { proveedor: config.proveedor, modelo: config.modelo, voz: config.voz, ...(filtro ? { ajuste: filtro } : {}) },
  });
  console.log(`  ${escena.id}: ${a.segundos} s → ${a.id}`);
  return { asset: a.id, segundos: a.segundos, texto: textoVoz(escena), config: firmaVoz(config), ...extra };
};

/** OpenAI: una llamada por escena, con el ajuste de ritmo opcional en post. */
const vozPorEscena = async (id, config, e, vozJson, tmp) => {
  const pedido = pedidoVoz(config, pronunciable(textoVoz(e)), process.env);
  const r = await fetch(pedido.url, pedido.init);
  if (!r.ok) fallar(`${config.proveedor} ${r.status} en ${e.id}: ${(await r.text()).slice(0, 200)}`);
  const crudo = join(tmp, `${e.id}.crudo.wav`);
  writeFileSync(crudo, Buffer.from(await r.arrayBuffer()));
  const wav = join(tmp, `${e.id}.wav`);
  const filtro = filtroRitmo(config);
  if (filtro) run('ffmpeg', ['-y', '-v', 'error', '-i', crudo, '-af', filtro, wav]);
  else copyFileSync(crudo, wav);
  vozJson[e.id] = registrarToma(id, config, e, wav);
  escribir(join(ESTUDIO, 'proyectos', id, 'voz.json'), vozJson);
};

/**
 * ElevenLabs: toda la narración en una sola toma (la voz no arranca en frío en cada escena), cortada
 * por escena a mitad de los silencios. Cada escena guarda sus palabras con tiempos relativos a su corte
 * (para sincronizar texto con la voz).
 */
const vozTomaUnica = async (id, config, escenas, vozJson, tmp) => {
  const { texto, rangos } = narracion(escenas.map((e) => ({ ...e, locucion: e.locucion && pronunciable(e.locucion) })));
  const pedido = pedidoVoz(config, texto, process.env);
  const r = await fetch(pedido.url, pedido.init);
  if (!r.ok) fallar(`${config.proveedor} ${r.status} en la toma única: ${(await r.text()).slice(0, 200)}`);
  const { audio_base64: audio, alignment: al } = await r.json();
  const mp3 = join(tmp, 'toma-unica.mp3');
  const completa = join(tmp, 'toma-unica.wav');
  writeFileSync(mp3, Buffer.from(audio, 'base64'));
  run('ffmpeg', ['-y', '-v', 'error', '-i', mp3, completa]);
  const duracion = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', completa]).toString());
  const porId = new Map(escenas.map((e) => [e.id, e]));
  for (const corte of cortesTomaUnica(al, rangos, duracion)) {
    const e = porId.get(corte.id);
    const rango = rangos.find((x) => x.id === corte.id);
    const wav = join(tmp, `${e.id}.wav`);
    run('ffmpeg', ['-y', '-v', 'error', '-i', completa, '-ss', String(corte.inicio), '-to', String(corte.fin), wav]);
    vozJson[e.id] = registrarToma(id, config, e, wav, { palabras: palabrasDeAlineacion(al, rango.desde, rango.hasta, corte.inicio) });
    escribir(join(ESTUDIO, 'proyectos', id, 'voz.json'), vozJson);
  }
};

/**
 * El pedido HTTP de una toma según el proveedor de proyecto.json. Falla si el proveedor no existe
 * o falta su clave en `entorno`. OpenAI devuelve un wav; ElevenLabs, un JSON con el mp3 en base64 y la
 * alineación de cada carácter (de ahí salen las palabras sincronizadas).
 */
export const pedidoVoz = (v, texto, entorno) => {
  const clave = (nombre) => {
    if (!entorno[nombre]) throw new Error(`Falta ${nombre} (ver estudio/README.md)`);
    return entorno[nombre];
  };
  if (v.proveedor === 'openai') {
    return {
      url: 'https://api.openai.com/v1/audio/speech',
      extension: 'wav',
      init: {
        method: 'POST',
        headers: { Authorization: `Bearer ${clave('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: v.modelo, voice: v.voz, input: texto, instructions: v.instruccion, response_format: 'wav' }),
      },
      formato: 'wav',
    };
  }
  if (v.proveedor === 'elevenlabs') {
    // Las marcas de tiempo son del audio tal cual sale: recortar pausas en post las dejaría corridas.
    if (filtroRitmo(v)) throw new Error('ElevenLabs no admite el ajuste de ritmo (tempo/pausaMaxima): desincronizaría las palabras');
    return {
      url: `https://api.elevenlabs.io/v1/text-to-speech/${v.voz}/with-timestamps?output_format=mp3_44100_192`,
      init: {
        method: 'POST',
        headers: { 'xi-api-key': clave('ELEVENLABS_API_KEY'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: texto,
          model_id: v.modelo,
          language_code: 'es',
          ...(v.ajustes ? { voice_settings: v.ajustes } : {}),
          ...(v.semilla !== undefined ? { seed: v.semilla } : {}),
        }),
      },
      formato: 'json',
    };
  }
  throw new Error(`Proveedor de voz no soportado: ${v.proveedor}`);
};

/** Huella de la configuración de voz: si cambia la voz, el modelo o la instrucción, hay que regenerar. */
export const firmaVoz = (v) => {
  const base = [v.proveedor, v.modelo, v.voz, v.instruccion];
  // El ajuste de ritmo cambia el audio: entra en la firma solo si está declarado (no altera proyectos previos).
  const ajuste = v.tempo !== undefined || v.pausaMaxima !== undefined ? [v.tempo ?? 1, v.pausaMaxima ?? null] : [];
  // Igual con los ajustes del proveedor (ElevenLabs): sin declararlos, la firma de antes no cambia.
  const ajustes = v.ajustes !== undefined ? [v.ajustes] : [];
  const semilla = v.semilla !== undefined ? [{ semilla: v.semilla }] : [];
  return createHash('sha256').update(JSON.stringify([...base, ...ajuste, ...ajustes, ...semilla])).digest('hex').slice(0, 12);
};

/**
 * Filtro de ffmpeg que ajusta el ritmo de una toma: recorta silencios de los bordes, limita las
 * pausas internas a `pausaMaxima` y aplica `tempo`. Sin ajuste declarado, devuelve null.
 */
export const filtroRitmo = (v) => {
  if (v.tempo === undefined && v.pausaMaxima === undefined) return null;
  const umbral = '-42dB';
  const filtros = [
    `silenceremove=start_periods=1:start_threshold=${umbral}:start_silence=0.04`,
    'areverse',
    `silenceremove=start_periods=1:start_threshold=${umbral}:start_silence=0.12`,
    'areverse',
  ];
  if (v.pausaMaxima !== undefined) {
    filtros.push(`silenceremove=stop_periods=-1:stop_threshold=${umbral}:stop_duration=${v.pausaMaxima}`);
  }
  if (v.tempo !== undefined && v.tempo !== 1) filtros.push(`atempo=${v.tempo}`);
  return filtros.join(',');
};

/**
 * Qué hacer con la voz de una escena: 'mantener', 'regenerar' o 'quitar'.
 * Se regenera si falta, si es heredada de otro proyecto (clon), si cambió el texto o la configuración.
 */
export const decidirVoz = (vigente, escena, proyecto, config) => {
  if (!escena || !escena.locucion) return vigente ? 'quitar' : 'mantener';
  if (!vigente) return 'regenerar';
  const propia = vigente.asset.startsWith(`${proyecto}/voz/`);
  const mismoTexto = vigente.texto === textoVoz(escena);
  // Sin firma no se sabe con qué voz se generó: se trata como distinta.
  const mismaConfig = vigente.config === firmaVoz(config);
  return propia && mismoTexto && mismaConfig ? 'mantener' : 'regenerar';
};

/** Lo que se le manda al TTS por escena: la dirección de actuación (etiquetas de v4) y la locución. */
export const textoVoz = (escena) => (escena.direccion ? `${escena.direccion} ${escena.locucion}` : escena.locucion);

/**
 * Toda la narración como un solo texto (una sola toma: la entonación fluye de una escena a la otra
 * en vez de arrancar en frío en cada una) y el rango de caracteres de cada escena dentro de él.
 */
export const narracion = (escenas) => {
  let texto = '';
  const rangos = [];
  for (const e of escenas.filter((x) => x.locucion)) {
    if (texto) texto += ' ';
    const desde = texto.length;
    texto += textoVoz(e);
    rangos.push({ id: e.id, desde, hasta: texto.length });
  }
  return { texto, rangos };
};

const redondear = (n) => Math.round(n * 1000) / 1000;

/**
 * Palabras dichas entre los caracteres [desde, hasta) de la alineación de ElevenLabs, con sus
 * tiempos relativos a `origen` (el inicio del corte de la escena). Las etiquetas [..] no se dicen.
 */
export const palabrasDeAlineacion = (al, desde, hasta, origen) => {
  const palabras = [];
  let actual = null;
  let enEtiqueta = false;
  for (let i = desde; i < hasta; i += 1) {
    const c = al.characters[i];
    if (c === '[') enEtiqueta = true;
    const separa = enEtiqueta || /\s/.test(c);
    if (c === ']') enEtiqueta = false;
    if (separa) {
      if (actual) palabras.push(actual);
      actual = null;
      continue;
    }
    const inicio = redondear(al.character_start_times_seconds[i] - origen);
    const fin = redondear(al.character_end_times_seconds[i] - origen);
    actual = actual ? { ...actual, texto: actual.texto + c, fin } : { texto: c, inicio, fin };
  }
  if (actual) palabras.push(actual);
  return palabras;
};

/** Dónde cortar la toma única: cada escena termina a mitad del silencio que la separa de la siguiente. */
export const cortesTomaUnica = (al, rangos, duracion) => {
  const primero = (r) => al.character_start_times_seconds[r.desde];
  const ultimo = (r) => al.character_end_times_seconds[r.hasta - 1];
  const bordes = rangos.slice(1).map((r, i) => redondear((ultimo(rangos[i]) + primero(r)) / 2));
  return rangos.map((r, i) => ({ id: r.id, inicio: i === 0 ? 0 : bordes[i - 1], fin: i === rangos.length - 1 ? duracion : bordes[i] }));
};

/** «voz/escena» si está libre en el manifiesto; si no, la siguiente toma «voz/escena@n». */
export const siguienteNombre = (rutaManifiesto, nombre) => {
  const ids = existsSync(rutaManifiesto) ? leer(rutaManifiesto).assets.map((a) => a.id.split('/').slice(1).join('/')) : [];
  if (!ids.includes(nombre)) return nombre;
  let n = 2;
  while (ids.includes(`${nombre}@${n}`)) n += 1;
  return `${nombre}@${n}`;
};

/**
 * Todo lo que impediría un render correcto, revisado antes del primer frame (invariante 7).
 * Devuelve la lista de problemas (vacía si se puede renderizar).
 */
export const precondicionesRender = (p, guion, vozJson, args) => {
  const problemas = [];
  const solo = opcion(args, 'solo');
  const validos = [...p.formatos, ...(p.poster ? ['poster'] : [])];
  if (solo && !validos.includes(solo)) problemas.push(`--solo ${solo}: usa ${validos.join(', ')}`);
  if (args.includes('--correo') && (!p.formatos.includes('horizontal') || (solo && solo !== 'horizontal'))) {
    problemas.push('--correo necesita renderizar el formato horizontal en la misma corrida');
  }
  if (solo === 'poster' && !p.poster) problemas.push('el proyecto no define poster');
  if (p.poster && (!solo || solo === 'poster') && !p.poster.captura) problemas.push('falta poster.captura en proyecto.json');
  if (!guion.escenas?.length) problemas.push('el guion no tiene escenas');
  if (p.voz) {
    const escenas = new Map((guion.escenas ?? []).map((e) => [e.id, e]));
    const desactualizadas = [...new Set([...escenas.keys(), ...Object.keys(vozJson)])].filter(
      (eid) => decidirVoz(vozJson[eid], escenas.get(eid), p.id, p.voz) !== 'mantener',
    );
    if (desactualizadas.length) problemas.push(`la voz no está al día en: ${desactualizadas.join(', ')} (corre «estudio voz ${p.id}»)`);
  }
  return problemas;
};

/** Lo que el TTS lee mal escrito tal cual. */
const pronunciable = (t) => t.replace(/\bCRM\b/g, 'ce erre eme');

const run = (cmd, args) => execFileSync(cmd, args, { cwd: TS, stdio: 'inherit' });
const remotion = join(TS, 'node_modules', '.bin', 'remotion');

/** Normaliza el audio a -16 LUFS / -1,5 dBTP en dos pasadas, sin recodificar la imagen. */
/** loudnorm mide «-inf» en una pista silenciosa (Remotion siempre escribe audio): no hay nada que normalizar. */
export const esAudioSilencioso = (medida) => !Number.isFinite(Number(medida.input_i));

const normalizar = (entrada, salida) => {
  const audio = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', entrada], { encoding: 'utf8' });
  if (audio.error || audio.status !== 0) fallar(`ffprobe no pudo leer ${entrada}: ${audio.error?.message ?? audio.stderr}`);
  if (!audio.stdout.trim()) {
    // Proyecto sin voz ni música: el video va tal cual, con faststart.
    run('ffmpeg', ['-y', '-v', 'error', '-i', entrada, '-c', 'copy', '-movflags', '+faststart', salida]);
    return;
  }
  // ffmpeg escribe la medición de loudnorm en stderr.
  const medicion = spawnSync('ffmpeg', ['-hide_banner', '-i', entrada, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  if (medicion.error || medicion.status !== 0) fallar(`ffmpeg no pudo medir ${entrada}: ${medicion.error?.message ?? ''}`);
  const medida = medicion.stderr;
  const bloque = medida.slice(medida.lastIndexOf('Parsed_loudnorm')).match(/\{[\s\S]*?\}/);
  if (!bloque) fallar(`No pude medir el audio de ${entrada}`);
  const j = JSON.parse(bloque[0]);
  if (esAudioSilencioso(j)) {
    run('ffmpeg', ['-y', '-v', 'error', '-i', entrada, '-an', '-c:v', 'copy', '-movflags', '+faststart', salida]);
    return;
  }
  const filtro = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', entrada, '-c:v', 'copy', '-af', filtro, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', salida]);
};

const render = (id, args) => {
  verificar(id);
  indexar();
  const p = leer(join(ESTUDIO, 'proyectos', id, 'proyecto.json'));
  const out = join(TS, 'out', 'estudio', id, p.version);
  mkdirSync(out, { recursive: true });
  const escala = args.includes('--4k') ? '2' : '1';
  const sufijo = escala === '2' ? '-4k' : '';
  const solo = opcion(args, 'solo');
  const entry = 'src/remotion/index.ts';
  // Precondiciones antes del primer frame: un error aquí no debe llegar después de minutos de render.
  const dir = join(ESTUDIO, 'proyectos', id);
  const problemas = precondicionesRender(p, leer(join(dir, 'guion.json')), leer(join(dir, 'voz.json')), args);
  if (problemas.length) fallar(`render ${id}:\n  ${problemas.join('\n  ')}`);
  for (const formato of p.formatos) {
    if (solo && solo !== formato) continue;
    const crudo = join(out, `.${id}-${formato}${sufijo}.mp4`);
    run(remotion, ['render', entry, `${id}-${formato}`, crudo, `--scale=${escala}`, '--codec=h264', `--crf=${escala === '2' ? 17 : 18}`]);
    normalizar(crudo, join(out, `${id}-${formato}${sufijo}.mp4`));
    unlinkSync(crudo);
  }
  if (p.poster && (!solo || solo === 'poster')) {
    run(remotion, ['still', entry, `${id}-poster`, join(out, 'poster.png'), '--frame=60']);
    run(remotion, ['still', entry, `${id}-poster`, join(out, 'poster-correo.png'), '--frame=60', '--scale=0.92', '--props={"conDuracion":false}']);
  }
  if (args.includes('--correo')) {
    // La versión de correo sale del horizontal de ESTA corrida (validado arriba), nunca de uno viejo.
    const fuente = join(out, `${id}-horizontal${sufijo}.mp4`);
    const log = join(out, '.x264');
    const base = ['-y', '-v', 'error', '-i', fuente, '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-b:v', '1750k', '-passlogfile', log];
    run('ffmpeg', [...base, '-pass', '1', '-an', '-f', 'mp4', '/dev/null']);
    run('ffmpeg', [...base, '-maxrate', '2600k', '-bufsize', '3500k', '-pass', '2', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', join(out, `${id}-correo.mp4`)]);
  }
  console.log(`✓ ${id}@${p.version} → ${relative(RAIZ, out)}`);
};

/** «clave=valor» → [clave, valor]; el valor puede contener «=» (p. ej. una URL con query). */
export const parsearOrigen = (texto) => {
  const i = texto.indexOf('=');
  return i === -1 ? [texto, ''] : [texto.slice(0, i), texto.slice(i + 1)];
};

const [cmd, ...args] = process.argv.slice(2);
// Solo corre como CLI: importado (tests) expone las funciones puras sin ejecutar comandos.
const esCli = process.argv[1] === fileURLToPath(import.meta.url);
const origenes = () =>
  Object.fromEntries(args.flatMap((a, i) => (args[i - 1] === '--origen' ? [parsearOrigen(a)] : [])));
if (esCli) switch (cmd) {
  case 'registrar': {
    const [espacio, archivo, nombre] = args;
    const a = registrar(espacio, archivo, nombre, { origen: origenes(), deriva: opcion(args, 'deriva') });
    console.log(`✓ ${a.id} → ts/public/estudio/${a.archivo}`);
    break;
  }
  case 'verificar': verificar(args[0]); break;
  case 'indexar': indexar(); break;
  case 'nuevo': nuevo(args[0], opcion(args, 'marca'), opcion(args, 'tipo')); break;
  case 'clonar': clonar(args[0], args[1]); break;
  case 'voz': await voz(args[0], args); break;
  case 'render': render(args[0], args); break;
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
}
