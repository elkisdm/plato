import { useCurrentFrame } from 'remotion';

import { estadoOnda } from '../../lib/fx/efectos';

type Props = {
  /** Frame global del impacto. */
  inicio: number;
  /** Centro en px del lienzo; si falta, se centra en el contenedor padre (que debe ser `position: relative`). */
  x?: number;
  y?: number;
  color: string;
  /** Diámetro final en px. Por defecto 1100. */
  tamano?: number;
  /** Frames de vida. Por defecto 18. */
  duracion?: number;
  /** Grosor inicial del anillo en px. Por defecto 14. */
  grosor?: number;
};

/** Anillo que se expande desde un punto y se desvanece; un segundo anillo más tenue lo sigue 3 frames después. */
export const OndaChoque = ({ inicio, x, y, color, tamano = 1100, duracion = 18, grosor = 14 }: Props) => {
  const frame = useCurrentFrame();
  const anillo = (retraso: number, escala: number, k: number) => {
    const e = estadoOnda(frame - inicio - retraso, duracion);
    if (!e) return null;
    const d = Math.max(2, e.radio * tamano * escala);
    return (
      <div
        key={retraso}
        style={{
          position: 'absolute',
          left: x ?? '50%',
          top: y ?? '50%',
          width: d,
          height: d,
          marginLeft: -d / 2,
          marginTop: -d / 2,
          borderRadius: '50%',
          border: `${Math.max(1, grosor * e.grosor * k)}px solid ${color}`,
          boxShadow: `0 0 28px ${color}, inset 0 0 28px ${color}`,
          opacity: e.opacidad * k,
          pointerEvents: 'none',
        }}
      />
    );
  };
  return (
    <>
      {anillo(0, 1, 1)}
      {anillo(3, 0.72, 0.5)}
    </>
  );
};
