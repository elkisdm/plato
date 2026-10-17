import React from 'react';
import { useMarca } from '../../marca';
import { avance } from '../animacion';
import { useCuadro } from '../tiempo';
import { useUnidad } from './unidad';

type Props = {
  nombre: string;
  /** Segunda línea, p. ej. «Fuente: El Mercurio». */
  detalle?: string;
  /** Cuadro (base 30) en que entra. */
  inicio?: number;
};

/** Zócalo (lower third), pegado sobre la banda de subtítulos: una barra de acento de la marca y el nombre, que se desliza desde la izquierda. */
export const Zocalo: React.FC<Props> = ({ nombre, detalle, inicio = 14 }) => {
  const { colores, fuentes } = useMarca();
  const frame = useCuadro();
  const { u, alto } = useUnidad();
  const t = avance(frame, inicio, 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56 * u,
        bottom: alto * 0.29,
        display: 'flex',
        alignItems: 'stretch',
        opacity: t,
        transform: `translateX(${(t - 1) * 120 * u}px)`,
        clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`,
      }}
    >
      <div
        style={{
          width: 10 * u,
          borderRadius: 6 * u,
          background: `linear-gradient(180deg, ${colores.indigo}, ${colores.cian})`,
        }}
      />
      <div
        style={{
          padding: `${18 * u}px ${34 * u}px`,
          background: `${colores.noche}D9`,
          borderRadius: `0 ${14 * u}px ${14 * u}px 0`,
          fontFamily: fuentes.ui,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 44 * u, color: colores.blanco, lineHeight: 1.1 }}>
          {nombre}
        </div>
        {detalle ? (
          <div
            style={{
              marginTop: 6 * u,
              fontWeight: 500,
              fontSize: 30 * u,
              color: colores.antetitulo,
              letterSpacing: '0.02em',
            }}
          >
            {detalle}
          </div>
        ) : null}
      </div>
    </div>
  );
};
