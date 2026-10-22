import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { colorAnimo, pesosAnimo } from '../../lib/fx/animo';
import { GOLPES_CAMARA, type Golpe } from '../../lib/fx/golpes';
import { Destello } from './Destello';
import { OndaChoque } from './OndaChoque';

type Props = {
  /** Golpes que disparan efectos. Por defecto `GOLPES_CAMARA`. */
  golpes?: Golpe[];
};

/** Vida máxima de los efectos de un golpe (frames): solo se montan los golpes dentro de esa ventana. */
const VIDA = 24;
const FUERZA_DESTELLO = 0.6;
const FUERZA_ONDA = 0.5;

/**
 * Capa global de impactos: por cada golpe de `GOLPES_CAMARA` dispara una `OndaChoque` (fuerza ≥ 0.5)
 * y un `Destello` (fuerza ≥ 0.6), teñidos con el ánimo vigente (ámbar/turquesa) y centrados en su punto.
 */
export const CapaGolpes = ({ golpes = GOLPES_CAMARA }: Props) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {golpes
        .filter((g) => frame >= g.frame && frame < g.frame + VIDA)
        .map((g) => {
          const [r, gr, b] = colorAnimo(pesosAnimo(g.frame));
          const color = `rgb(${r},${gr},${b})`;
          return (
            <div key={g.frame}>
              {g.fuerza >= FUERZA_ONDA ? (
                <OndaChoque inicio={g.frame} x={g.x ?? 540} y={g.y ?? 860} color={color} tamano={700 + 500 * g.fuerza} />
              ) : null}
              {g.fuerza >= FUERZA_DESTELLO ? (
                <Destello inicio={g.frame} color={`rgb(${Math.round((r + 255) / 2)},${Math.round((gr + 255) / 2)},${Math.round((b + 255) / 2)})`} intensidad={0.1 + 0.2 * g.fuerza} />
              ) : null}
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
