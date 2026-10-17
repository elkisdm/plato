import React from 'react';
import { Composition } from 'remotion';
import { Estudio, type PropsEstudio } from './Estudio';
import { FRAME_POSTER, Poster, type PropsPoster } from './Poster';
import { duracionTotal } from './proyecto';
import { idsProyectos, resolverProyecto } from './resolver';
import { aReales } from './kit/tiempo';
import { FPS } from './tema';

const TAMANOS = {
  horizontal: [1920, 1080],
  vertical: [1080, 1920],
  retrato: [1080, 1350],
} as const;

/** Registra, por cada proyecto del estudio, sus composiciones (<id>-horizontal/-vertical/-retrato) y su poster. */
export const ComposicionesEstudio: React.FC = () => (
  <>
    {idsProyectos().map((id) => {
      // Un proyecto a medio armar (p. ej. recién creado con `estudio nuevo`) no debe impedir que
      // carguen las demás composiciones de Plató: se omite y se informa en la consola del Studio.
      let r: ReturnType<typeof resolverProyecto>;
      try {
        r = resolverProyecto(id);
      } catch (error) {
        console.error(`[estudio] Proyecto «${id}» omitido: ${(error as Error).message}`);
        return null;
      }
      const duracion = duracionTotal(r.guion, r.voz);
      return (
        <React.Fragment key={id}>
          {r.proyecto.formatos.map((formato) => (
            <Composition
              key={formato}
              id={`${id}-${formato}`}
              component={Estudio}
              durationInFrames={aReales(duracion, r.proyecto.fps)}
              fps={r.proyecto.fps}
              width={TAMANOS[formato][0]}
              height={TAMANOS[formato][1]}
              defaultProps={{ proyecto: id, subtitulos: false } satisfies PropsEstudio}
            />
          ))}
          {r.proyecto.poster ? (
            <Composition
              id={`${id}-poster`}
              component={Poster}
              durationInFrames={FRAME_POSTER + 1}
              fps={FPS}
              width={1200}
              height={675}
              defaultProps={{ proyecto: id, conDuracion: true } satisfies PropsPoster}
            />
          ) : null}
        </React.Fragment>
      );
    })}
  </>
);
