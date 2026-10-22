import { COLORS, FONTS } from '../constants/theme';
import { fsMinimo } from '../lib/layout';
import {
  posicionFicha,
  TOTAL_FICHAS,
  type VarianteFichas,
} from '../lib/fichas27';

/** Aspecto de una ficha en este cuadro; lo calcula la escena a partir del frame. */
export type EstadoFicha = {
  borde: string;
  fondo: string;
  /** 0..1 */
  opacidad: number;
  /** 0..1: intensidad del brillo. */
  brillo: number;
  brilloColor: string;
  /** Escala (1 = reposo). */
  escala?: number;
  /** Líneas de etiqueta mono dentro de la ficha (solo variante grande). */
  etiqueta?: string[];
  /** 0..1 */
  opacidadEtiqueta?: number;
};

type Props = {
  variante: VarianteFichas;
  x0: number;
  y0: number;
  estado: (i: number) => EstadoFicha;
};

/** Las 27 fichas de la «lista» del hilo: formas propias, sin texto salvo etiquetas de la escena. */
export const FichasLista = ({ variante, x0, y0, estado }: Props) => (
  <>
    {Array.from({ length: TOTAL_FICHAS }, (_, i) => {
      const p = posicionFicha(i, variante, x0, y0);
      const e = estado(i);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.ancho,
            height: p.alto,
            boxSizing: 'border-box',
            borderRadius: variante === 'grande' ? 14 : 8,
            border: `2px solid ${e.borde}`,
            background: e.fondo,
            opacity: e.opacidad,
            boxShadow: `0 0 ${34 * e.brillo}px ${e.brilloColor}`,
            transform: `scale(${e.escala ?? 1})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.mono,
            fontSize: fsMinimo(28),
            fontWeight: 700,
            lineHeight: 1.15,
            color: COLORS.text,
          }}
        >
          {e.etiqueta?.map((linea) => (
            <span key={linea} style={{ opacity: e.opacidadEtiqueta ?? 1 }}>
              {linea}
            </span>
          ))}
        </div>
      );
    })}
  </>
);
