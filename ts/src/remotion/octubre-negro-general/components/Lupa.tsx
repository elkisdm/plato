type Props = {
  /** Centro del círculo de la lupa. */
  x: number;
  y: number;
  radio?: number;
  color: string;
  /** Relleno del cristal (para tapar lo que hay debajo). */
  relleno?: string;
  opacidad?: number;
};

/** Lupa dibujada con formas propias: círculo y mango. */
export const Lupa = ({ x, y, radio = 34, color, relleno = 'transparent', opacidad = 1 }: Props) => {
  const d = radio * 0.72;
  const caja = radio * 3;
  return (
    <svg
      width={caja}
      height={caja}
      style={{ position: 'absolute', left: x - radio - 6, top: y - radio - 6, opacity: opacidad, overflow: 'visible' }}
    >
      <circle cx={radio + 6} cy={radio + 6} r={radio} fill={relleno} stroke={color} strokeWidth={7} />
      <line
        x1={radio + 6 + d}
        y1={radio + 6 + d}
        x2={radio + 6 + d + radio * 0.9}
        y2={radio + 6 + d + radio * 0.9}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
      />
    </svg>
  );
};
