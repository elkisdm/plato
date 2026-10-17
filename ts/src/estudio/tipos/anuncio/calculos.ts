/** Funciones puras del tipo «anuncio»: sin Date.now() ni azar, así cada render es idéntico. */

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Pesos chilenos con separador de miles de punto: 23000 → «$23.000». */
export const formatoCLP = (monto: number): string => {
  const entero = Math.round(Math.abs(monto));
  const miles = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${monto < 0 ? '-' : ''}$${miles}`;
};

/** Contador de 0 a `monto` (entero), con salida suave: monótono y exacto en el último cuadro. */
export const valorContador = (
  frame: number,
  inicio: number,
  duracion: number,
  monto: number,
): number => {
  const t = acotar((frame - inicio) / duracion, 0, 1);
  return Math.round(monto * (1 - (1 - t) ** 3));
};

export type Cuenta = { dias: number; horas: number; minutos: number };

/** Tiempo entre dos fechas ISO en días, horas y minutos. Nunca negativo (si `hasta` ya pasó, ceros). */
export const cuentaRegresiva = (desde: string, hasta: string): Cuenta => {
  const a = Date.parse(desde);
  const b = Date.parse(hasta);
  if (Number.isNaN(a) || Number.isNaN(b))
    throw new Error(`Fecha ISO inválida: ${desde} / ${hasta}`);
  const minutosTotales = Math.max(0, Math.floor((b - a) / 60000));
  return {
    dias: Math.floor(minutosTotales / 1440),
    horas: Math.floor((minutosTotales % 1440) / 60),
    minutos: minutosTotales % 60,
  };
};

/** Dígitos de `n` rellenos con ceros hasta `largo` (nunca menos dígitos de los que tiene). */
export const digitos = (n: number, largo = 2): number[] =>
  String(Math.max(0, Math.floor(n)))
    .padStart(largo, '0')
    .split('')
    .map(Number);

/**
 * Posición continua de un rodillo de dígitos: avanza `vueltas` vueltas completas más lo que falta
 * para caer en `objetivo`, frenando al final. `posicion mod 10 === objetivo` al terminar.
 */
export const posicionRodillo = (
  frame: number,
  inicio: number,
  duracion: number,
  objetivo: number,
  vueltas = 2,
): number => {
  const t = acotar((frame - inicio) / duracion, 0, 1);
  return (1 - (1 - t) ** 4) * (vueltas * 10 + objetivo);
};

/** Temblor que se apaga: desplazamiento (x, y) en px; cero antes de `inicio` y pasada la `duracion`. */
export const temblor = (
  frame: number,
  inicio: number,
  amplitud: number,
  duracion = 14,
): { x: number; y: number } => {
  const t = (frame - inicio) / duracion;
  if (t < 0 || t >= 1) return { x: 0, y: 0 };
  const caida = (1 - t) ** 2 * amplitud;
  return { x: Math.sin(t * 47) * caida, y: Math.cos(t * 61) * caida * 0.7 };
};

/** Palabra sin signos de puntuación y en minúsculas, para comparar con las palabras de acento. */
export const normalizar = (palabra: string): string =>
  palabra.toLowerCase().replace(/[.,;:!?¡¿"'()]/g, '');

/** ¿Esta palabra es de acento? Compara sin mayúsculas ni puntuación. */
export const esAcento = (palabra: string, acentos: string[]): boolean =>
  acentos.some((a) => normalizar(a) === normalizar(palabra));

/**
 * Tamaño de fuente (px) con el que `texto` ocupa `ancho` px, dado lo que mide cada carácter en
 * Barlow Condensed en mayúsculas (`k` × el tamaño). Acotado a `max`.
 */
export const ajustarTam = (texto: string, ancho: number, k = 0.39, max = 400): number =>
  Math.min(max, ancho / (Math.max(1, texto.length) * k));

/**
 * Posición (0–1) del encuadre de una imagen de fondo: `foco` fijo, o un paneo horizontal que va de
 * `paneo.desde` a `paneo.hasta` según el `progreso` de la escena (0–1, con salida suave).
 */
export const posicionFondo = (
  foco: { x: number; y: number },
  paneo: { desde: number; hasta: number } | undefined,
  progreso: number,
): { x: number; y: number } => {
  if (!paneo) return foco;
  const p = acotar(progreso, 0, 1);
  const suave = p * p * (3 - 2 * p);
  return { x: paneo.desde + (paneo.hasta - paneo.desde) * suave, y: foco.y };
};

export type PalabraDicha = { texto: string; inicio: number; fin: number };
export type GrupoPalabras = { palabras: PalabraDicha[]; inicio: number; fin: number };

/**
 * Agrupa las palabras dichas en trozos cortos para subtitular: hasta `max` palabras y
 * `maxCaracteres` letras, y corta siempre después de un signo de cierre (. , ? ! ;).
 */
export const gruposDe = (
  palabras: PalabraDicha[],
  max = 3,
  maxCaracteres = 24,
): GrupoPalabras[] => {
  const grupos: GrupoPalabras[] = [];
  let actual: PalabraDicha[] = [];
  const cerrar = () => {
    const primera = actual[0];
    const ultima = actual[actual.length - 1];
    if (primera && ultima)
      grupos.push({ palabras: actual, inicio: primera.inicio, fin: ultima.fin });
    actual = [];
  };
  for (const p of palabras) {
    const largo = [...actual, p].map((x) => x.texto).join(' ').length;
    if (actual.length >= max || (actual.length > 0 && largo > maxCaracteres)) cerrar();
    actual.push(p);
    if (/[.,;!?]$/.test(p.texto)) cerrar();
  }
  cerrar();
  return grupos;
};

/** Índice del grupo visible en el segundo `t` (queda un instante después de su última palabra), o -1. */
export const grupoActivo = (grupos: GrupoPalabras[], t: number): number => {
  let activo = -1;
  grupos.forEach((g, i) => {
    const siguiente = grupos[i + 1];
    const limite = Math.min(g.fin + 0.3, siguiente ? siguiente.inicio - 0.02 : Infinity);
    if (t >= g.inicio - 0.04 && t < limite) activo = i;
  });
  return activo;
};

/** Índice de la palabra que se está diciendo (la última que ya empezó) dentro de un grupo; -1 si aún no. */
export const palabraActiva = (grupo: GrupoPalabras, t: number): number => {
  let activa = -1;
  grupo.palabras.forEach((p, i) => {
    if (t >= p.inicio) activa = i;
  });
  return activa;
};

/** «Golpe» de cámara (0–~0.02) que se apaga rápido tras el inicio de cada grupo de palabras. */
export const punchDe = (t: number, grupos: GrupoPalabras[], fuerza = 0.02): number => {
  let ultimo = -Infinity;
  for (const g of grupos) if (g.inicio <= t) ultimo = g.inicio;
  return ultimo === -Infinity ? 0 : fuerza * Math.exp(-(t - ultimo) * 10);
};

export type Particula = { x: number; y: number; alfa: number; tam: number };

const hash = (n: number): number => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Chispas de un estallido: `t` (0–1) es el avance; vacío fuera de ese rango. Determinista. */
export const particulas = (n: number, t: number, radio: number): Particula[] => {
  if (t <= 0 || t >= 1) return [];
  const salida = 1 - (1 - t) ** 3;
  return Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 + hash(i) * 0.6;
    const vel = radio * (0.45 + hash(i + 50) * 0.75);
    return {
      x: Math.cos(ang) * vel * salida,
      y: Math.sin(ang) * vel * salida + radio * 0.3 * t * t,
      alfa: 1 - t,
      tam: (6 + hash(i + 99) * 12) * (1 - t * 0.6),
    };
  });
};

export type Reemplazo = { dice: string; muestra: string };

/** Comparación laxa: sin tildes, mayúsculas ni puntuación. */
const llave = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9$]/g, '');

/**
 * Colapsa cada secuencia de palabras habladas que calza con `dice` en UN token con el texto
 * `muestra`, que dura desde el inicio de la primera hasta el fin de la última. Si la última palabra
 * cerraba con puntuación (. , ; ! ?), el token la conserva para que el subtitulado siga cortando ahí.
 */
export const aplicarReemplazos = (
  palabras: PalabraDicha[],
  reemplazos: Reemplazo[],
): PalabraDicha[] => {
  const reglas = reemplazos
    .map((r) => ({ llaves: r.dice.split(/\s+/).filter(Boolean).map(llave), muestra: r.muestra }))
    .filter((r) => r.llaves.length > 0)
    .sort((a, b) => b.llaves.length - a.llaves.length);
  const salida: PalabraDicha[] = [];
  let i = 0;
  while (i < palabras.length) {
    const regla = reglas.find((r) =>
      r.llaves.every((k, j) => palabras[i + j] && llave(palabras[i + j]?.texto ?? '') === k),
    );
    const primera = palabras[i];
    if (!regla || !primera) {
      if (primera) salida.push(primera);
      i += 1;
      continue;
    }
    const ultima = palabras[i + regla.llaves.length - 1] ?? primera;
    const cierre = /[.,;!?]$/.exec(ultima.texto)?.[0] ?? '';
    salida.push({
      texto: regla.muestra.endsWith(cierre) ? regla.muestra : regla.muestra + cierre,
      inicio: primera.inicio,
      fin: ultima.fin,
    });
    i += regla.llaves.length;
  }
  return salida;
};

/** Índice de la escena en pantalla en el cuadro `frame` (la última que ya empezó; 0 antes del primer inicio). */
export const indiceActivo = (inicios: number[], frame: number): number => {
  let activa = 0;
  inicios.forEach((inicio, i) => {
    if (frame >= inicio) activa = i;
  });
  return activa;
};

/**
 * Opacidad (0–1) de la franja de marca: sigue a `encendidas` por escena y cambia suavemente a lo
 * largo del cruce de `transicion` cuadros con que entra cada escena.
 */
export const alfaFranja = (
  encendidas: boolean[],
  inicios: number[],
  frame: number,
  transicion: number,
): number => {
  const i = indiceActivo(inicios, frame);
  const actual = encendidas[i] ? 1 : 0;
  const inicio = inicios[i] ?? 0;
  if (i === 0 || frame >= inicio + transicion) return actual;
  const previa = encendidas[i - 1] ? 1 : 0;
  return previa + (actual - previa) * Math.max(0, (frame - inicio) / transicion);
};

const FPS_BASE = 30;

/**
 * Cuadros (base 30) en que cambia el clip de un montaje: siempre arranca en 0, corta al comienzo de
 * las palabras de la voz que queden al menos `minimo` cuadros después del corte anterior (y `cola`
 * antes del final) y parte en tramos iguales cualquier hueco mayor que `maximo`.
 */
export const cortesPorPalabras = (
  palabras: { inicio: number }[],
  inicioVozFrames: number,
  total: number,
  minimo = 30,
  maximo = 60,
  cola = 20,
): number[] => {
  const cortes = [0];
  for (const p of palabras) {
    const f = Math.round(p.inicio * FPS_BASE) + inicioVozFrames;
    if (f - cortes[cortes.length - 1]! >= minimo && total - f >= cola) cortes.push(f);
  }
  const salida: number[] = [];
  cortes.forEach((inicio, i) => {
    const fin = cortes[i + 1] ?? total;
    const partes = Math.max(1, Math.ceil((fin - inicio) / maximo));
    for (let k = 0; k < partes; k++)
      salida.push(Math.round(inicio + ((fin - inicio) * k) / partes));
  });
  return salida;
};

/** Índice (rotando) del clip del montaje que se ve en `frame`; `desfase` mueve dónde empieza la rotación. */
export const clipDe = (cortes: number[], clips: number, frame: number, desfase = 0): number =>
  (indiceActivo(cortes, frame) + desfase) % Math.max(1, clips);

/**
 * Golpe de un corte del montaje: `fuerza` baja de 1 a 0 en `duracion` cuadros desde el corte más
 * reciente (el primero, que es la entrada de la escena, no golpea) y `destello` dura 2 cuadros.
 */
export const impactoCorte = (
  cortes: number[],
  frame: number,
  duracion = 5,
): { fuerza: number; destello: boolean } => {
  const i = indiceActivo(cortes, frame);
  if (i === 0) return { fuerza: 0, destello: false };
  const dt = frame - cortes[i]!;
  return { fuerza: acotar(1 - dt / duracion, 0, 1), destello: dt < 2 };
};

/**
 * Rueda de dígitos tipo tragamonedas para un monto como «$54.990»: cada dígito gira y frena uno
 * tras otro (de izquierda a derecha); lo que no es dígito se queda fijo (`posicion` nulo).
 */
export const ruedaPrecio = (
  frame: number,
  inicio: number,
  texto: string,
): { caracter: string; posicion: number | null }[] => {
  let k = 0;
  return texto.split('').map((caracter) => {
    if (!/\d/.test(caracter)) return { caracter, posicion: null };
    const i = k++;
    return {
      caracter,
      posicion: posicionRodillo(frame, inicio + i * 3, 16 + i * 4, Number(caracter), 2),
    };
  });
};

/** Cuadro en que frena el último dígito de `ruedaPrecio` (el momento del impacto del precio). */
export const frenaRueda = (inicio: number, texto: string): number => {
  const n = (texto.match(/\d/g) ?? []).length;
  return n === 0 ? inicio : inicio + (n - 1) * 3 + 16 + (n - 1) * 4;
};

/**
 * Cuadro de entrada (base 30) de cada una de `n` palabras mostradas, según cuándo se dicen: si
 * `n` y las palabras de la voz coinciden es una a una; si no, se reparten en proporción.
 */
export const entradasPorVoz = (
  n: number,
  palabras: { inicio: number }[],
  inicioVozFrames: number,
  anticipo = 2,
): number[] =>
  Array.from({ length: n }, (_, k) => {
    const j = Math.round((k * (palabras.length - 1)) / Math.max(1, n - 1));
    const p = palabras[j];
    return p ? Math.max(0, Math.round(p.inicio * FPS_BASE) + inicioVozFrames - anticipo) : k * 9;
  });

/** Salida exponencial (equivale a cubic-bezier(0.16, 1, 0.3, 1)): arranca rápido y frena largo. `t` en 0–1. */
export const expoOut = (t: number): number => {
  const x = acotar(t, 0, 1);
  return x >= 1 ? 1 : 1 - 2 ** (-10 * x);
};

/** Ancho, en «em», de un precio como «$54.990»: dígitos tabulares, signos angostos y `$` en superíndice. */
export const anchoPrecioEm = (texto: string): number =>
  texto.split('').reduce((suma, c) => {
    if (/\d/.test(c)) return suma + 0.62;
    if (c === '$') return suma + 0.36;
    if (c === '.' || c === ',') return suma + 0.28;
    return suma + 0.6;
  }, 0);

/**
 * Reparto horizontal de la franja de marca: tile, bloque de texto fijo y precio. Devuelve el tamaño de
 * fuente más grande (hasta `maximo`) con el que el precio cabe en lo que queda, sin tocar el bloque
 * de texto, y el ancho que ocupa. Todo en unidades de diseño (1080 de ancho).
 */
export const layoutFranja = (
  ancho: number,
  relleno: number,
  tile: number,
  hueco: number,
  textoAncho: number,
  precio: string,
  maximo = 130,
): { tam: number; anchoPrecio: number; disponible: number } => {
  const disponible = ancho - 2 * relleno - tile - textoAncho - 2 * hueco;
  const tam = Math.max(1, Math.min(maximo, disponible / anchoPrecioEm(precio)));
  return { tam, anchoPrecio: tam * anchoPrecioEm(precio), disponible };
};

/**
 * Cuenta regresiva «en vivo»: a partir de `inicio` resta un segundo cada `cuadros` cuadros. Devuelve
 * los segundos que quedan y los del tick anterior, con el progreso (0–1) del último cambio durante
 * `duracion` cuadros, para animar el dígito que se acaba de mover.
 */
export const cuentaViva = (
  base: number,
  frame: number,
  inicio: number,
  cuadros: number,
  duracion = 4,
): { segundos: number; anterior: number; progreso: number } => {
  const ticks = Math.max(0, Math.floor((frame - inicio) / cuadros));
  const desde = (frame - inicio) % cuadros;
  const segundos = Math.max(0, base - ticks);
  const progreso = frame < inicio || ticks === 0 ? 1 : acotar(desde / duracion, 0, 1);
  return { segundos, anterior: Math.min(base, segundos + (ticks > 0 ? 1 : 0)), progreso };
};

/** Días, horas, minutos y segundos de un total de segundos. */
export const partesDeSegundos = (
  total: number,
): { dias: number; horas: number; minutos: number; segundos: number } => ({
  dias: Math.floor(total / 86400),
  horas: Math.floor((total % 86400) / 3600),
  minutos: Math.floor((total % 3600) / 60),
  segundos: total % 60,
});
