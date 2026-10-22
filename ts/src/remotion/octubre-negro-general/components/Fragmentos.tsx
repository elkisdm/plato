import { useCurrentFrame } from 'remotion';

import { estadoFragmento, type OpcionesFragmento } from '../lib/fragmentos';

type Props = Partial<Omit<OpcionesFragmento, 'semilla'>> & {
  /** Frame global del nacimiento. */
  inicio: number;
  /** Origen en px del lienzo (el padre debe ser `position: absolute/relative` a pantalla completa). */
  x: number;
  y: number;
  color: string;
  semilla: string;
  cantidad?: number;
  /** Lado mayor de cada fragmento en px. */
  tamano?: number;
};

/** Ráfaga de chispas rectangulares con gravedad: impactos, glitch y roturas. Determinista (`random(semilla)`). */
export const Fragmentos = ({
  inicio,
  x,
  y,
  color,
  semilla,
  cantidad = 14,
  tamano = 14,
  velocidad = 16,
  gravedad = 0.7,
  vida = 24,
  rumbo,
  apertura,
}: Props) => {
  const frame = useCurrentFrame();
  const dt = frame - inicio;
  if (dt < 0 || dt >= vida) return null;
  return (
    <>
      {Array.from({ length: cantidad }, (_, i) => {
        const e = estadoFragmento(dt, i, { semilla, velocidad, gravedad, vida, rumbo, apertura });
        if (!e) return null;
        const l = tamano * (0.6 + 0.4 * ((i * 7) % 5) / 4) * e.escala;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + e.x - l / 2,
              top: y + e.y - l * 0.2,
              width: l,
              height: l * 0.4,
              borderRadius: 3,
              background: color,
              boxShadow: `0 0 10px ${color}`,
              opacity: e.opacidad,
              transform: `rotate(${e.rot}deg)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};
