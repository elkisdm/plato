export type Movimiento = 'acercar' | 'alejar' | 'paneo-izq' | 'paneo-der';

export type Encuadre = {
  /** `cubrir` llena el lienzo; `contener` muestra la foto entera sobre una copia desenfocada. */
  modo: 'cubrir' | 'contener';
  ancho: number;
  alto: number;
  zoom: number;
  /** Desplazamiento horizontal en px (nunca deja ver el borde de la foto en modo `cubrir`). */
  desplazamiento: number;
};

/** Zoom máximo del acercar/alejar y zoom fijo del paneo (deja holgura para recorrer la foto). */
const ZOOM = 0.14;
const ZOOM_PANEO = 1.12;

/**
 * Dónde y cuán grande va una foto de `iw`×`ih` en un lienzo `W`×`H` cuando la escena lleva
 * avanzado `p` (0–1). Una foto mucho más angosta que el lienzo (un 4:5 en 16:9) se muestra entera;
 * en los demás casos cubre, y el paneo recorre el ancho sobrante.
 */
export const encuadreFoto = (
  iw: number,
  ih: number,
  W: number,
  H: number,
  movimiento: Movimiento,
  p: number,
): Encuadre => {
  const cubrir = Math.max(W / iw, H / ih);
  const contener = Math.min(W / iw, H / ih);
  const modo = iw / ih < W / H && cubrir / contener > 1.5 ? 'contener' : 'cubrir';
  const k = modo === 'cubrir' ? cubrir : contener;
  const ancho = iw * k;
  const alto = ih * k;
  const zoom =
    movimiento === 'acercar'
      ? 1 + ZOOM * p
      : movimiento === 'alejar'
        ? 1 + ZOOM * (1 - p)
        : ZOOM_PANEO;
  const holgura = Math.max(0, (ancho * zoom - W) / 2) * 0.8;
  // paneo-izq: la cámara va hacia la izquierda, así que la foto se corre hacia la derecha.
  const desplazamiento =
    movimiento === 'paneo-izq'
      ? holgura * (2 * p - 1)
      : movimiento === 'paneo-der'
        ? holgura * (1 - 2 * p)
        : 0;
  return { modo, ancho, alto, zoom, desplazamiento };
};
