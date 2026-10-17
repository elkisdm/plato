import React from 'react';
import { useCurrentFrame } from 'remotion';
import { centro } from '../../assets';
import { Aparicion } from '../../kit/Aparicion';
import { avance, porTramos } from '../../kit/animacion';
import { Captura } from '../../kit/Captura';
import { useVertical } from '../../kit/formato';
import { MarcoNavegador } from '../../kit/MarcoNavegador';
import { Plano } from '../../kit/Plano';
import type { TramoPuntero } from '../../kit/Puntero';
import type { ResaltadoConfig } from '../../kit/Resaltado';
import { useMarca } from '../../marca';
import { framesDe, useAsset, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';
import { zonaRef } from './zonas';

type Seccion = PropsDe<'recorrido'>['secciones'][number];

/** Nombre y descripción de la sección actual, con un fundido corto entre una y otra. */
const TextoSeccion: React.FC<{ secciones: Seccion[] }> = ({ secciones }) => {
  const frame = useCurrentFrame();
  const { colores, fuentes } = useMarca();
  return (
    <div style={{ position: 'relative', marginTop: 44, height: 140 }}>
      {secciones.map((s, i) => {
        const siguiente = secciones[i + 1]?.inicio;
        const t =
          avance(frame, s.inicio, 14) *
          (siguiente === undefined ? 1 : 1 - avance(frame, siguiente - 6, 10));
        return (
          <div
            key={s.titulo}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: t,
              transform: `translateY(${(1 - t) * 12}px)`,
            }}
          >
            <div
              style={{
                fontFamily: fuentes.serif,
                fontStyle: 'italic',
                fontSize: 50,
                color: colores.cian,
                lineHeight: 1.1,
              }}
            >
              {s.titulo}
            </div>
            <div
              style={{
                fontFamily: fuentes.ui,
                fontSize: 30,
                lineHeight: 1.4,
                color: 'rgba(233, 237, 255, 0.86)',
              }}
            >
              {s.texto}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Leve perspectiva que se endereza durante la escena (el navegador «se acomoda» frente a la cámara). */
const Perspectiva: React.FC<{ activa: boolean; duracion: number; children: React.ReactNode }> = ({
  activa,
  duracion,
  children,
}) => {
  const frame = useCurrentFrame();
  if (!activa) return <>{children}</>;
  const t = porTramos(frame, [0, duracion], [0, 1]);
  return (
    <div style={{ perspective: 2400 }}>
      <div
        style={{
          transform: `rotateY(${-9 + 6 * t}deg) rotateX(${4 - 3 * t}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Recorrido por las secciones de una pantalla: resaltados y un clic por sección. */
export const Recorrido: React.FC<{ escena: Escena; props: PropsDe<'recorrido'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const { voz } = useProyecto();
  const captura = useAsset(props.captura);
  const ancho = vertical ? 940 : 1070;
  const { secciones } = props;
  const resaltados: ResaltadoConfig[] = secciones.flatMap((s, i) =>
    s.resaltar.map((ref, j) => ({
      zona: zonaRef(captura, ref),
      inicio: s.inicio + 8 + j * 8,
      fin: secciones[i + 1]?.inicio,
    })),
  );
  const puntero: TramoPuntero[] = secciones.flatMap((s) => {
    if (!s.clic) return [];
    const c = centro(zonaRef(captura, s.clic));
    return [{ frame: s.inicio + 4, x: c.x - 0.02, y: c.y, clic: true }];
  });
  return (
    <Plano escena={escena} texto={<TextoSeccion secciones={secciones} />}>
      <Aparicion inicio={0}>
        <Perspectiva activa={props.perspectiva} duracion={framesDe(escena, voz)}>
          <MarcoNavegador url={props.url} ancho={ancho}>
            <Captura
              captura={captura}
              ancho={ancho}
              resaltados={resaltados}
              puntero={puntero}
              kenBurnsFrames={framesDe(escena, voz)}
            />
          </MarcoNavegador>
        </Perspectiva>
      </Aparicion>
    </Plano>
  );
};
