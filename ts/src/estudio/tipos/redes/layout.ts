/**
 * Disposición común del tipo «redes»: cada escena es una composición centrada en el espacio sobre
 * una banda de subtítulos fija, que el contenido nunca pisa.
 */

/** Centro de la banda de subtítulos, como fracción del alto (banda de ~72 % a ~87 %). */
export const CENTRO_SUBTITULOS = 0.795;
const TOPE_CON_SUBTITULOS = 0.72;
const TOPE_SIN_SUBTITULOS = 0.94;
const MARGEN_SUPERIOR = 0.04;

/** Franja vertical (px) donde se compone el contenido de la escena. */
export const areaContenido = (
  alto: number,
  conSubtitulos: boolean,
): { top: number; alto: number } => {
  const top = alto * MARGEN_SUPERIOR;
  const fin = alto * (conSubtitulos ? TOPE_CON_SUBTITULOS : TOPE_SIN_SUBTITULOS);
  return { top, alto: fin - top };
};

/** Alto aproximado de un título serif: líneas estimadas por su largo, más el antetítulo si lo lleva. */
export const alturaTitulo = (
  titulo: string,
  tamano: number,
  ancho: number,
  conAntetitulo = false,
): number => {
  const caracteres = titulo.replaceAll('*', '').length;
  const porLinea = Math.max(1, Math.floor(ancho / (tamano * 0.34)));
  const lineas = Math.ceil(caracteres / porLinea);
  return lineas * tamano * 1.04 + (conAntetitulo ? tamano * 0.55 : 0);
};

/** Teléfono (alto/ancho de la captura = `ratio`) que llena el espacio disponible sin pasarse del ancho. */
export const escalaTelefono = (
  ratio: number,
  disponibleAlto: number,
  disponibleAncho: number,
): { escala: number; alto: number; ancho: number } => {
  const NATURAL = 420;
  const BISEL = 24;
  const BARRA = 44;
  const altoNatural = NATURAL * ratio + BARRA + BISEL;
  const escala = Math.min(disponibleAlto / altoNatural, disponibleAncho / (NATURAL + BISEL));
  return { escala, alto: altoNatural * escala, ancho: (NATURAL + BISEL) * escala };
};

const GAP = 28;
const DESFASE = 130;
const INCLINACION = (7 * Math.PI) / 180;

/**
 * Medidas del mosaico inclinado: columnas, tamaño natural del grupo (en la unidad de 1080), la caja
 * que ocupa ya inclinado y la escala que hace caber esa caja en `areaAncho` × `areaAlto`.
 * `ratios` es alto/ancho de cada pieza.
 */
export const medidasMosaico = (
  ratios: number[],
  areaAncho: number,
  areaAlto: number,
): {
  cols: number;
  anchoPieza: number;
  ancho: number;
  alto: number;
  cajaAncho: number;
  cajaAlto: number;
  escala: number;
} => {
  const n = ratios.length;
  const cols = n === 1 ? 1 : n <= 4 ? 2 : 3;
  const anchoPieza = cols === 1 ? 640 : cols === 2 ? 440 : 300;
  const alturas = Array.from({ length: cols }, (_, c) => {
    const propias = ratios.filter((_, i) => i % cols === c).map((r) => r * anchoPieza);
    return (
      propias.reduce((a, h) => a + h, 0) +
      GAP * Math.max(0, propias.length - 1) +
      (c % 2 === 1 ? DESFASE : 0)
    );
  });
  const ancho = cols * anchoPieza + GAP * (cols - 1);
  const alto = Math.max(...alturas);
  const cos = Math.cos(INCLINACION);
  const sen = Math.sin(INCLINACION);
  const cajaAncho = ancho * cos + alto * sen;
  const cajaAlto = alto * cos + ancho * sen;
  return {
    cols,
    anchoPieza,
    ancho,
    alto,
    cajaAncho,
    cajaAlto,
    escala: Math.min(areaAncho / cajaAncho, areaAlto / cajaAlto, 1.2),
  };
};
