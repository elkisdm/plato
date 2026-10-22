import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS } from '../constants/theme';
import { posicionRodillo, velocidadRodillo } from '../lib/rodillo';

type Props = {
  /** Centro del marcador en px del lienzo. */
  x: number;
  y: number;
  /** Alto de cada dígito (tamaño de letra) en px. */
  tamano: number;
  /** Valor final de dos dígitos. */
  valor: number;
  /** Frame global en que empiezan a girar. */
  inicio: number;
  /** Frame global en que aterriza cada columna: decenas primero, unidades después. */
  aterrizaDecenas: number;
  aterrizaUnidades: number;
  color: string;
  glow: string;
};

const ANCHO_REL = 0.62;

type PropsColumna = {
  pos: number;
  vel: number;
  tamano: number;
  color: string;
  id: string;
  glow: string;
};

/** Una columna de dígitos que gira: se pintan los 4 vecinos de la posición continua. */
const Columna = ({ pos, vel, tamano, color, id, glow }: PropsColumna) => {
  const base = Math.floor(pos);
  const blur = Math.min(34, vel * tamano * 0.16);
  return (
    <div
      style={{
        position: 'relative',
        width: tamano * ANCHO_REL,
        height: tamano,
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
      }}
    >
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id}>
          <feGaussianBlur stdDeviation={`0 ${blur}`} />
        </filter>
      </svg>
      <div style={{ filter: blur > 0.6 ? `url(#${id})` : undefined }}>
        {[-1, 0, 1, 2].map((d) => {
          const k = base + d;
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                top: (k - pos) * tamano,
                height: tamano,
                textAlign: 'center',
                fontFamily: FONTS.sans,
                fontWeight: 900,
                fontSize: tamano,
                lineHeight: 1,
                color,
                textShadow: `0 0 ${tamano * 0.2}px ${glow}`,
              }}
            >
              {((k % 10) + 10) % 10}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Marcador de dos dígitos tipo rodillo: giran con desenfoque de movimiento y aterrizan con rebote. */
export const MarcadorRodillo = ({
  x,
  y,
  tamano,
  valor,
  inicio,
  aterrizaDecenas,
  aterrizaUnidades,
  color,
  glow,
}: Props) => {
  const frame = useCurrentFrame();
  const decenas = Math.floor(valor / 10);
  const unidades = valor % 10;
  const totalD = decenas + 10;
  const totalU = unidades + 30;
  const ancho = tamano * ANCHO_REL * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - ancho / 2,
        top: y - tamano / 2,
        width: ancho,
        height: tamano,
        display: 'flex',
        color: COLORS.text,
      }}
    >
      <Columna
        id="rod-d"
        pos={posicionRodillo(frame, inicio + 4, aterrizaDecenas, totalD)}
        vel={velocidadRodillo(frame, inicio + 4, aterrizaDecenas, totalD)}
        tamano={tamano}
        color={color}
        glow={glow}
      />
      <Columna
        id="rod-u"
        pos={posicionRodillo(frame, inicio, aterrizaUnidades, totalU)}
        vel={velocidadRodillo(frame, inicio, aterrizaUnidades, totalU)}
        tamano={tamano}
        color={color}
        glow={glow}
      />
    </div>
  );
};
