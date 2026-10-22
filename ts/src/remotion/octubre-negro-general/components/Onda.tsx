import { useCurrentFrame } from 'remotion';

import { COLORS } from '../constants/theme';
import onda from '../data/onda.json';

type Props = { alto: number; ancho: number; barras: number };

const valores = onda as number[];

/** Barras de la forma de onda real de la voz: ventana centrada en el frame actual. */
export const Onda = ({ alto, ancho, barras }: Props) => {
  const frame = useCurrentFrame();
  const paso = ancho / barras;
  const mitad = Math.floor(barras / 2);

  return (
    <div style={{ width: ancho, height: alto, display: 'flex', alignItems: 'center' }}>
      {Array.from({ length: barras }, (_, i) => {
        const v = valores[frame + i - mitad] ?? 0;
        return (
          <div
            key={i}
            style={{
              width: Math.max(2, paso * 0.6),
              marginRight: paso * 0.4,
              height: Math.max(4, v * alto),
              borderRadius: 2,
              backgroundColor: i === mitad ? COLORS.accentSoft : COLORS.accent,
              opacity: i === mitad ? 1 : 0.85,
            }}
          />
        );
      })}
    </div>
  );
};
