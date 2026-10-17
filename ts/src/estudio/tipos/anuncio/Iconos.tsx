import React from 'react';

type Props = { tam: number; color: string; acento: string };

const base = (tam: number): React.SVGProps<SVGSVGElement> => ({
  width: tam,
  height: tam,
  viewBox: '0 0 64 64',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

/** Cuenta / usuario: cabeza y hombros dentro de un círculo. */
export const IconoCuenta: React.FC<Props> = ({ tam, color, acento }) => (
  <svg {...base(tam)} stroke={color} strokeWidth={3.4}>
    <circle cx={32} cy={32} r={27} />
    <circle cx={32} cy={25} r={9} stroke={acento} />
    <path d="M14 50 C18 39 26 36 32 36 C38 36 46 39 50 50" stroke={acento} />
  </svg>
);

/** Escudo con visto. */
export const IconoEscudo: React.FC<Props> = ({ tam, color, acento }) => (
  <svg {...base(tam)} stroke={color} strokeWidth={3.4}>
    <path d="M32 6 L54 14 V31 C54 44 44 54 32 59 C20 54 10 44 10 31 V14 Z" />
    <path d="M21 32 L29 40 L44 23" stroke={acento} strokeWidth={3.4} />
  </svg>
);

/** Rayo (entrega inmediata). */
export const IconoRayo: React.FC<Props> = ({ tam, color, acento }) => (
  <svg {...base(tam)} stroke={color} strokeWidth={3.4}>
    <circle cx={32} cy={32} r={27} />
    <path
      d="M35 11 L19 36 H31 L28 53 L45 26 H33 Z"
      stroke={acento}
      fill={acento}
      fillOpacity={0.2}
    />
  </svg>
);

/** Reloj. */
export const IconoReloj: React.FC<Props> = ({ tam, color, acento }) => (
  <svg {...base(tam)} stroke={color} strokeWidth={3.4}>
    <circle cx={32} cy={32} r={27} />
    <path d="M32 16 V32 L43 39" stroke={acento} strokeWidth={3.4} />
  </svg>
);

export const iconos = {
  cuenta: IconoCuenta,
  escudo: IconoEscudo,
  rayo: IconoRayo,
  reloj: IconoReloj,
} satisfies Record<string, React.FC<Props>>;
