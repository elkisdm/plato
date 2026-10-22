import { useCurrentFrame } from 'remotion';

import { COLORS } from '../constants/theme';
import { entre } from '../lib/motion';

type Props = {
  /** Centro del reloj en px del lienzo. */
  x: number;
  y: number;
  diametro?: number;
  color: string;
  /** Frames global en que el anillo empieza a barrer y en que completa la vuelta. */
  inicio: number;
  fin: number;
};

/** Reloj dibujado con formas: anillo que se cierra a lo largo de [inicio, fin], marcas y una aguja que no para. */
export const RelojAnillo = ({ x, y, diametro = 130, color, inicio, fin }: Props) => {
  const frame = useCurrentFrame();
  const r = diametro / 2 - 8;
  const c = 2 * Math.PI * r;
  const p = entre(frame, inicio, fin);
  const aparece = Math.min(1, Math.max(0, (frame - inicio + 6) / 6));
  // Antes de cerrar, la aguja gira rápido con el barrido; después sigue lenta (nada queda quieto).
  const giro = p < 1 ? p * 720 : 720 + (frame - fin) * 6;
  return (
    <svg
      width={diametro}
      height={diametro}
      viewBox={`0 0 ${diametro} ${diametro}`}
      style={{ position: 'absolute', left: x - diametro / 2, top: y - diametro / 2, opacity: aparece, overflow: 'visible' }}
    >
      <circle cx={diametro / 2} cy={diametro / 2} r={r} fill={COLORS.surface} stroke={COLORS.idle} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = r - 6;
        const r2 = r - (i % 3 === 0 ? 16 : 11);
        return (
          <line
            key={i}
            x1={diametro / 2 + Math.sin(a) * r1}
            y1={diametro / 2 - Math.cos(a) * r1}
            x2={diametro / 2 + Math.sin(a) * r2}
            y2={diametro / 2 - Math.cos(a) * r2}
            stroke={color}
            strokeWidth={3}
            opacity={0.8}
          />
        );
      })}
      <circle
        cx={diametro / 2}
        cy={diametro / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        transform={`rotate(-90 ${diametro / 2} ${diametro / 2})`}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      <g transform={`rotate(${giro} ${diametro / 2} ${diametro / 2})`}>
        <line x1={diametro / 2} y1={diametro / 2} x2={diametro / 2} y2={diametro / 2 - r + 14} stroke={color} strokeWidth={5} strokeLinecap="round" />
      </g>
      <circle cx={diametro / 2} cy={diametro / 2} r={6} fill={color} />
    </svg>
  );
};
