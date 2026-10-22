import { useCurrentFrame } from 'remotion';

import { crearChispas, crearMotas, posicionChispa, posicionMota } from '../lib/chispas';

type RafagaProps = {
  /** Frame global en que nace la ráfaga. */
  inicio: number;
  /** Origen en px del contenedor (que debe ser `position: relative`). */
  x: number;
  y: number;
  color: string;
  n?: number;
  semilla: string;
  /** Multiplica el tamaño de las chispas. Por defecto 1. */
  tamano?: number;
};

/** Ráfaga de chispas que salen de un punto, frenan y se apagan. Determinista. */
export const RafagaChispas = ({ inicio, x, y, color, n = 16, semilla, tamano = 1 }: RafagaProps) => {
  const frame = useCurrentFrame();
  const chispas = crearChispas(n, semilla);
  return (
    <>
      {chispas.map((c, i) => {
        const p = posicionChispa(c, frame - inicio);
        if (!p) return null;
        const d = c.radio * 2 * p.escala * tamano;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + p.x - d / 2,
              top: y + p.y - d / 2,
              width: d,
              height: d,
              borderRadius: '50%',
              background: color,
              opacity: p.alfa,
              boxShadow: `0 0 ${d * 2}px ${color}`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

type MotasProps = {
  n: number;
  semilla: string;
  ancho: number;
  alto: number;
  color: string;
  /** Opacidad máxima de cada mota 0–1. Por defecto 0.7. */
  alfaMax?: number;
};

/** Polvo o ascuas a la deriva dentro de un recuadro; nunca se queda quieto. */
export const MotasFlotando = ({ n, semilla, ancho, alto, color, alfaMax = 0.7 }: MotasProps) => {
  const frame = useCurrentFrame();
  const motas = crearMotas(n, semilla, ancho, alto);
  return (
    <>
      {motas.map((m, i) => {
        const p = posicionMota(m, frame, ancho, alto);
        const d = m.radio * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - m.radio,
              top: p.y - m.radio,
              width: d,
              height: d,
              borderRadius: '50%',
              background: color,
              opacity: p.alfa * alfaMax,
              boxShadow: `0 0 ${d * 2.5}px ${color}`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};
