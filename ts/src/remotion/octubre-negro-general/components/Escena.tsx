import type { ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';

import type { VarianteTransicion } from '../lib/fx/transicion';
import { TransicionEscena } from './fx/TransicionEscena';

type Props = {
  desde: number;
  hasta: number;
  /** false en la primera escena: el cuadro 0 es la miniatura del reel y no puede salir vacío. */
  fundirEntrada?: boolean;
  /** false en la última escena: el cierre se sostiene completo, sin apagarse a negro. */
  fundirSalida?: boolean;
  /** Variante de la transición con la escena anterior (frontera de entrada). Por defecto 'zoom'. */
  varianteEntra?: VarianteTransicion;
  /** Variante de la transición con la escena siguiente (frontera de salida). Por defecto 'zoom'. */
  varianteSale?: VarianteTransicion;
  children: ReactNode;
};

/**
 * Monta los hijos solo con el frame global en [desde, hasta) y los envuelve en `TransicionEscena`
 * (movimiento de cámara con desenfoque y separación cromática en los `SOLAPE` frames de cada borde).
 * No usa <Sequence>: los hijos siguen leyendo el frame global.
 */
export const Escena = ({
  desde,
  hasta,
  fundirEntrada = true,
  fundirSalida = true,
  varianteEntra = 'zoom',
  varianteSale = 'zoom',
  children,
}: Props) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= hasta) return null;
  return (
    <TransicionEscena
      desde={desde}
      hasta={hasta}
      entra={fundirEntrada}
      sale={fundirSalida}
      varianteEntra={varianteEntra}
      varianteSale={varianteSale}
    >
      {children}
    </TransicionEscena>
  );
};
