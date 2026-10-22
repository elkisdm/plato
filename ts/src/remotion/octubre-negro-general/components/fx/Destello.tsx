import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { intensidadDestello } from '../../lib/fx/efectos';

type Props = {
  /** Frame global en que estalla. */
  inicio: number;
  /** Frames de vida (≤ 6). Por defecto 6. */
  duracion?: number;
  /** Color del destello (blanco por defecto; ámbar/turquesa para teñirlo). */
  color?: string;
  /** Opacidad máxima 0–1. Por defecto 0.5. */
  intensidad?: number;
};

/** Flash a pantalla completa: sube en 1 frame y cae en ≤ 6. Se dibuja encima de las escenas, debajo de los subtítulos. */
export const Destello = ({ inicio, duracion = 6, color = '#FFFFFF', intensidad = 0.5 }: Props) => {
  const frame = useCurrentFrame();
  const i = intensidadDestello(frame - inicio, Math.min(6, duracion));
  if (i <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: i * intensidad, pointerEvents: 'none' }} />;
};
