import { COLORS, FONTS } from '../constants/theme';
import { posicionFicha, TOTAL_FICHAS } from '../lib/fichas27';
import { fsMinimo } from '../lib/layout';

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
  /** Etiqueta mono dentro de la ficha. */
  etiqueta?: string;
  etiquetaColor?: string;
};

type Props = {
  x0: number;
  y0: number;
  estado: (i: number) => EstadoFicha;
};

/** Las 27 fichas de la «lista»: formas propias, sin texto salvo la etiqueta que pone la escena. */
export const GrupoFichas = ({ x0, y0, estado }: Props) => (
  <>
    {Array.from({ length: TOTAL_FICHAS }, (_, i) => {
      const p = posicionFicha(i, x0, y0);
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
            borderRadius: 14,
            border: `2px solid ${e.borde}`,
            background: e.fondo,
            opacity: e.opacidad,
            boxShadow: `0 0 ${24 * e.brillo}px ${e.brilloColor}`,
            transform: `scale(${e.escala ?? 1})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.mono,
            fontSize: fsMinimo(28),
            fontWeight: 700,
            letterSpacing: '-0.07em',
            whiteSpace: 'nowrap',
            color: e.etiquetaColor ?? COLORS.text,
          }}
        >
          {e.etiqueta}
        </div>
      );
    })}
  </>
);
