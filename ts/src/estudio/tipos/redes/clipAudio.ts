import type { Escena, Voz } from '../../proyecto';
import type { PropsDe } from './esquemas';

type PropsClip = PropsDe<'clip'>;
type Palabras = NonNullable<PropsClip['palabras']>;
type RecorteClip = NonNullable<PropsClip['recorte']>;

/** Una escena `clip` con `audio: true`: la voz es la del propio clip, no una locución. */
export const esClipConAudio = (escena: Escena): boolean =>
  escena.escena === 'clip' && escena.props.audio === true;

/** `{texto, desde, hasta}` del guion → `{texto, inicio, fin}` de voz.json, con tiempos relativos a `desde` de la toma. */
export const palabrasDeClip = (palabras: Palabras, desde: number) =>
  palabras
    .filter((p) => p.hasta > desde)
    .map((p) => ({
      texto: p.texto,
      inicio: Math.max(0, p.desde - desde),
      fin: p.hasta - desde,
    }));

/**
 * Entrada de voz equivalente para un clip con audio: así la duración de la escena (al menos lo que
 * queda del clip), el ducking de la música y los subtítulos usan la misma mecánica que la locución.
 */
export const vozDeClip = (escena: Escena, segundosAsset: number): Voz[string] => {
  const props = escena.props as Partial<PropsClip> & { video: string };
  const desde = props.desde ?? 0;
  const segundos = segundosAsset - desde;
  if (segundos <= 0)
    throw new Error(
      `Escena ${escena.id}: \`desde\` (${desde} s) no deja nada del clip (dura ${segundosAsset} s)`,
    );
  return {
    asset: props.video,
    segundos,
    ...(props.palabras ? { palabras: palabrasDeClip(props.palabras, desde) } : {}),
  };
};

/** Un clip con audio no lleva locución (hablarían dos voces a la vez): devuelve el motivo, o null. */
export const errorLocucion = (escena: Escena): string | null =>
  esClipConAudio(escena) && escena.locucion.trim() !== ''
    ? `Escena ${escena.id}: un clip con audio propio no lleva locución (hablarían dos voces a la vez)`
    : null;

/**
 * Caja (px) en que se dibuja la toma completa para que la banda conservada por `recorte` cubra
 * `cajaAncho × cajaAlto` (como object-fit: cover): el resto de la toma desborda y se oculta.
 */
export const encuadreRecorte = (
  srcAncho: number,
  srcAlto: number,
  recorte: RecorteClip,
  cajaAncho: number,
  cajaAlto: number,
): { ancho: number; alto: number; left: number; top: number } => {
  const banda = srcAlto * (recorte.abajo - recorte.arriba);
  const escala = Math.max(cajaAncho / srcAncho, cajaAlto / banda);
  const ancho = srcAncho * escala;
  const alto = srcAlto * escala;
  return {
    ancho,
    alto,
    left: (cajaAncho - ancho) / 2,
    top: (cajaAlto - banda * escala) / 2 - recorte.arriba * alto,
  };
};
