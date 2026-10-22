/**
 * Línea de tiempo del video concepto ORED ("El registro que sabe decir no").
 *
 * Módulo puro: las duraciones de VO y clips están MEDIDAS (ffprobe) sobre los
 * assets reales de public/ored/. La duración de cada escena la manda el VO
 * (voDesde + voDur + colchon); el clip se adapta con playbackRate <= 1 — el
 * metraje se ralentiza para llenar la escena, nunca se acelera.
 */

export const FPS_ORED = 30;

export interface EscenaOred {
  id: string;
  /** Etiqueta de claqueta en pantalla (ruta + tesis). Null = sin claqueta. */
  claqueta: string | null;
  /** Asset bajo public/ored/, null si la escena es tarjeta pura (cold open / cierre). */
  clip: string | null;
  /** Duración medida del clip en segundos. */
  clipDur: number;
  /** Segundos a saltar del inicio del clip (carga, esperas). */
  recorte: number;
  /** Asset de VO bajo public/ored/, null si la escena continúa el VO anterior. */
  vo: string | null;
  /** Duración medida del VO en segundos. */
  voDur: number;
  /** Silencio antes de que entre el VO, en segundos. */
  voDesde: number;
  /** Aire después del VO, en segundos. */
  colchon: number;
  /** Texto del VO de la escena — se parte en subtítulos. */
  guion: string;
  /** Empuje de cámara: escala inicial → final y origen del zoom (0..1). */
  zoom: { desde: number; hasta: number; origenX: number; origenY: number };
  /**
   * Corta la escena antes de que termine su VO — el audio y los subtítulos
   * siguen sobre la escena siguiente (mercado → payload comparten el VO 03).
   */
  duracionSeg?: number;
}

export const ESCENAS_ORED: EscenaOred[] = [
  {
    id: 'cold',
    claqueta: null,
    clip: 'ored/mercado.mp4',
    clipDur: 12.17,
    recorte: 4.8,
    vo: 'ored/01-cold.wav',
    voDur: 10.76,
    voDesde: 1.0,
    colchon: 1.5,
    guion:
      'Hoy, la información de tu inmobiliaria la intermedian otros. Te la venden de vuelta… o se la muestran a tu competencia. Nadie le preguntó al gremio cómo debería gobernarse.',
    zoom: { desde: 1.06, hasta: 1.12, origenX: 0.5, origenY: 0.45 },
  },
  {
    id: 'intro',
    claqueta: '/entrar — la sesión',
    clip: 'ored/entrar.mp4',
    clipDur: 9.93,
    recorte: 0,
    vo: 'ored/02-intro.wav',
    voDur: 14.76,
    voDesde: 0.5,
    colchon: 1.2,
    guion:
      'Esto es ORED: un registro neutral de stock inmobiliario. Las inmobiliarias aportan su data, el sistema publica agregados con reglas verificables, y el dato individual solo lo ve su dueño. Te lo muestro corriendo. No en diapositivas.',
    zoom: { desde: 1.0, hasta: 1.05, origenX: 0.5, origenY: 0.4 },
  },
  {
    id: 'mercado',
    claqueta: '/mercado — el agregado gobernado',
    clip: 'ored/mercado.mp4',
    clipDur: 12.17,
    recorte: 0.8,
    vo: 'ored/03-mercado.wav',
    voDur: 23.04,
    voDesde: 0.4,
    colchon: 0,
    guion:
      'Esta es la matriz del mercado: precio mediano y absorción por comuna y tipología. Y esta celda gris no es un error. Es la regla. Si aportan menos de cinco inmobiliarias, o una sola domina la celda, el número no se publica. Y no está borroneado: abre las herramientas del navegador. La cifra nunca llegó. El servidor decidió no enviarla.',
    zoom: { desde: 1.0, hasta: 1.22, origenX: 0.55, origenY: 0.6 },
    duracionSeg: 13.0,
  },
  {
    id: 'payload',
    claqueta: 'la respuesta real del servidor',
    clip: 'ored/payload.mp4',
    clipDur: 9.27,
    recorte: 0,
    vo: null,
    voDur: 0,
    voDesde: 0,
    colchon: 0,
    guion: '',
    zoom: { desde: 1.0, hasta: 1.1, origenX: 0.25, origenY: 0.2 },
  },
  {
    id: 'stock',
    claqueta: '/stock — la vista del dueño',
    clip: 'ored/stock.mp4',
    clipDur: 25.17,
    recorte: 2.2,
    vo: 'ored/04-stock.wav',
    voDur: 18.76,
    voDesde: 0.4,
    colchon: 1.4,
    guion:
      'Tu inventario, en cambio, lo ves completo: unidad, piso, estado, precio. Eres el dueño de esa data. Bloqueas con motivo, el sistema no acepta cambios sin motivo, y todo queda en el historial de auditoría. El mercado ve el agregado; tú ves todo lo tuyo.',
    zoom: { desde: 1.0, hasta: 1.14, origenX: 0.6, origenY: 0.35 },
  },
  {
    id: 'config',
    claqueta: '/configuracion — el gobierno hecho pantalla',
    clip: 'ored/configuracion.mp4',
    clipDur: 13.73,
    recorte: 0.6,
    vo: 'ored/05-config.wav',
    voDur: 20.04,
    voDesde: 0.4,
    colchon: 1.2,
    guion:
      '¿Y quién ve qué? Está escrito en pantalla, no en un contrato que nadie lee. Mira la celda del desarrollador competidor: nunca identificada a un competidor. Las mismas reglas que viste operando en el mercado, escritas como política. Auditables por un tercero.',
    zoom: { desde: 1.0, hasta: 1.18, origenX: 0.62, origenY: 0.45 },
  },
  {
    id: 'agente',
    claqueta: '/agente — el momento clave',
    clip: 'ored/agente.mp4',
    clipDur: 22.07,
    recorte: 1.8,
    vo: 'ored/06-agente.wav',
    voDur: 22.16,
    voDesde: 0.6,
    colchon: 2.4,
    guion:
      'Le pregunté al sistema cuánto vendió la inmobiliaria líder. Lee su respuesta: Esa información identifica a un aportante. ORED publica agregados con n mayor o igual a cinco y control de dominancia; el dato individual solo lo ve su dueño. Un registro que sabe decir que no. Ese es el punto.',
    zoom: { desde: 1.0, hasta: 1.32, origenX: 0.52, origenY: 0.16 },
  },
  {
    id: 'cierre',
    claqueta: null,
    clip: null,
    clipDur: 0,
    recorte: 0,
    vo: 'ored/07-cierre.wav',
    voDur: 10.08,
    voDesde: 0.8,
    colchon: 2.6,
    guion:
      'ORED. El registro neutral del mercado inmobiliario chileno. Las reglas a la vista, el dato con su dueño, y el gremio gobernando las reglas, no la plataforma.',
    zoom: { desde: 1.0, hasta: 1.0, origenX: 0.5, origenY: 0.5 },
  },
];

export interface TramoOred {
  escena: EscenaOred;
  desdeFrame: number;
  duracionFrames: number;
  /** Velocidad del clip para llenar la escena exacta — nunca sobre 1. */
  rate: number;
}

function duracionEscenaSeg(e: EscenaOred): number {
  return e.voDesde + e.voDur + e.colchon;
}

export function compilarLinea(escenas: EscenaOred[]): TramoOred[] {
  const tramos: TramoOred[] = [];
  let cursor = 0;
  for (const escena of escenas) {
    // La escena sin VO propio (payload) llena el resto del VO de la anterior:
    // su duración es el metraje disponible del clip a rate natural.
    const segundos =
      escena.duracionSeg ??
      (escena.vo === null && escena.voDur === 0
        ? escena.clipDur - escena.recorte + 1.9
        : duracionEscenaSeg(escena));
    const duracionFrames = Math.round(segundos * FPS_ORED);
    const disponible = escena.clipDur - escena.recorte;
    const rate = escena.clip === null ? 1 : Math.min(1, disponible / (duracionFrames / FPS_ORED));
    tramos.push({ escena, desdeFrame: cursor, duracionFrames, rate });
    cursor += duracionFrames;
  }
  return tramos;
}

export function duracionTotalFrames(escenas: EscenaOred[]): number {
  return compilarLinea(escenas).reduce((acc, t) => acc + t.duracionFrames, 0);
}

export interface SubtituloOred {
  texto: string;
  desdeFrame: number;
  hastaFrame: number;
}

const MAX_SUBTITULO = 58;

/** Parte el guion en frases y las reagrupa en líneas que quepan en pantalla. */
function partirGuion(guion: string): string[] {
  const frases = guion
    .split(/(?<=[.;:…?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
  const lineas: string[] = [];
  for (const frase of frases) {
    if (frase.length <= MAX_SUBTITULO) {
      lineas.push(frase);
      continue;
    }
    let resto = frase;
    while (resto.length > MAX_SUBTITULO) {
      const corte = resto.lastIndexOf(' ', MAX_SUBTITULO);
      lineas.push(resto.slice(0, corte));
      resto = resto.slice(corte + 1);
    }
    lineas.push(resto);
  }
  return lineas;
}

/**
 * Subtítulos de una escena, en frames RELATIVOS a su inicio: reparten el
 * tramo del VO proporcionalmente al largo de cada línea.
 */
export function subtitulosDeEscena(escena: EscenaOred): SubtituloOred[] {
  const lineas = partirGuion(escena.guion);
  const totalChars = lineas.reduce((acc, l) => acc + l.length, 0);
  const inicio = Math.round(escena.voDesde * FPS_ORED);
  const duracionVo = Math.round(escena.voDur * FPS_ORED);
  const subs: SubtituloOred[] = [];
  let cursor = inicio;
  let charsAcumulados = 0;
  for (const [i, texto] of lineas.entries()) {
    charsAcumulados += texto.length;
    const hastaFrame =
      i === lineas.length - 1
        ? inicio + duracionVo
        : inicio + Math.round((charsAcumulados / totalChars) * duracionVo);
    subs.push({ texto, desdeFrame: cursor, hastaFrame });
    cursor = hastaFrame;
  }
  return subs;
}
