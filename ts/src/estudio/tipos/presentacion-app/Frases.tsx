import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { useVertical } from '../../kit/formato';
import { IconoMarca } from '../../kit/TarjetaIcono';
import { useMarca } from '../../marca';
import { framesDe, inicioVoz, useProyecto, type Escena } from '../../proyecto';
import { suave } from '../../tema';
import { tintas, useTono } from '../../tono';
import type { PropsDe } from './esquemas';

const ENTRA = 18;
const SALE = 12;

/** Frases cinéticas, una por pantalla: cada una sube y se enfoca; al terminar su turno, sube y se desenfoca. */
export const Frases: React.FC<{ escena: Escena; props: PropsDe<'frases'> }> = ({
  escena,
  props,
}) => {
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const { colores, fuentes } = useMarca();
  const tinta = tintas(colores, useTono());
  const { voz } = useProyecto();
  const desde = inicioVoz(escena);
  const hasta = framesDe(escena, voz) - 12;
  const turno = (hasta - desde) / props.frases.length;
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: vertical ? '0 70px' : '0 200px',
      }}
    >
      {props.frases.map((f, i) => {
        const inicio = desde + i * turno;
        const fin = inicio + turno;
        const ultima = i === props.frases.length - 1;
        const opciones = {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: suave,
        } as const;
        const entra = interpolate(frame, [inicio, inicio + ENTRA], [0, 1], opciones);
        const sale = ultima ? 0 : interpolate(frame, [fin - SALE, fin], [0, 1], opciones);
        const t = entra * (1 - sale);
        if (t <= 0) return null;
        return (
          <div
            key={f.texto}
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
              opacity: t,
              transform: `translateY(${(1 - entra) * 40 - sale * 40}px)`,
              filter: `blur(${(1 - t) * 10}px)`,
            }}
          >
            {f.icono ? <IconoMarca nombre={f.icono} tamano={vertical ? 104 : 96} /> : null}
            <span
              style={{
                fontFamily: fuentes.serif,
                fontSize: vertical ? 104 : 112,
                lineHeight: 1.05,
                color: tinta.titulo,
                textAlign: 'center',
                maxWidth: vertical ? 900 : 1400,
              }}
            >
              {f.texto}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
