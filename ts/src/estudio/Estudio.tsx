import React from 'react';
import { AbsoluteFill, Html5Audio, Sequence, useVideoConfig } from 'remotion';
import { linearTiming, TransitionSeries, type TransitionPresentation } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Fondo } from './kit/Fondo';
import { FondoDia } from './kit/FondoDia';
import { desenfoque } from './kit/desenfoque';
import { aReales, cuadroBase } from './kit/tiempo';
import { vhs } from './kit/vhs';
import { zoom } from './kit/zoom';
import { Subtitulos } from './kit/Subtitulos';
import { MarcaProvider } from './marca';
import { esClipConAudio } from './tipos/redes/clipAudio';
import { inicioMusica, tramosVoz, volumenMusica } from './mezcla';
import {
  framesDe,
  inicioVoz,
  ProyectoProvider,
  servir,
  useProyecto,
  type Escena,
} from './proyecto';
import { resolverProyecto } from './resolver';
import { tipos } from './tipos';
import { suave, tiempos } from './tema';
import { TonoProvider } from './tono';

export type PropsEstudio = { proyecto: string; subtitulos: boolean };

/** Música del proyecto con ducking bajo la voz; arranca desplazada para terminar con su final natural. */
const Musica: React.FC<{ id: string }> = ({ id }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const { proyecto, guion, voz, indice } = useProyecto();
  // La mezcla se calcula en la base del estudio (30); la pista se recorta y se lee en cuadros reales.
  const totalBase = cuadroBase(durationInFrames, fps);
  const musica = servir(indice, id);
  const tramos = React.useMemo(() => tramosVoz(guion, voz), [guion, voz]);
  return (
    <Html5Audio
      src={musica.src}
      trimBefore={aReales(
        inicioMusica(musica.segundos ?? 0, totalBase, proyecto.musicaInicio),
        fps,
      )}
      volume={(f) =>
        volumenMusica(cuadroBase(f, fps), totalBase, tramos, {
          corte: proyecto.musicaInicio !== undefined,
        })
      }
    />
  );
};

/** Locución de una escena (el asset que indica voz.json), desde su `vozDesde`. */
const Voz: React.FC<{ escena: Escena }> = ({ escena }) => {
  const { voz, indice } = useProyecto();
  const { fps } = useVideoConfig();
  const entrada = voz[escena.id];
  // El clip con audio suena por sí mismo (su escena lo reproduce): aquí no hay locución.
  if (!entrada || esClipConAudio(escena)) return null;
  return (
    <Sequence from={aReales(inicioVoz(escena), fps)} layout="none" name={`Voz: ${escena.id}`}>
      <Html5Audio src={servir(indice, entrada.asset).src} />
    </Sequence>
  );
};

/** Efectos de sonido de la escena, cada uno en su frame. */
const Sonidos: React.FC<{ escena: Escena }> = ({ escena }) => {
  const { indice } = useProyecto();
  const { fps } = useVideoConfig();
  return (
    <>
      {escena.sonidos.map((s, i) => (
        <Sequence key={i} from={aReales(s.en, fps)} layout="none" name={`Sonido: ${s.asset}`}>
          <Html5Audio src={servir(indice, s.asset).src} volume={s.volumen} />
        </Sequence>
      ))}
    </>
  );
};

/** Cada tipo de entrada, como presentación de transición (se tipa como genérica para mezclarlas). */
const presentacion = (
  entrada: Escena['entrada'],
): TransitionPresentation<Record<string, unknown>> =>
  (entrada === 'desliza'
    ? slide({ direction: 'from-right' })
    : entrada === 'zoom'
      ? zoom()
      : entrada === 'vhs'
        ? vhs()
        : entrada === 'desenfoque'
          ? desenfoque()
          : fade()) as TransitionPresentation<Record<string, unknown>>;

/** Video genérico de un proyecto del estudio: la misma historia para todas sus composiciones. */
export const Estudio: React.FC<PropsEstudio> = ({ proyecto: id, subtitulos }) => {
  const r = resolverProyecto(id);
  const { fps } = useVideoConfig();
  // Duraciones del guion en la base del estudio (30), llevadas a cuadros reales del render.
  const temporizacion = linearTiming({
    durationInFrames: aReales(tiempos.transicion, fps),
    easing: suave,
  });
  const FondoTipo = tipos[r.proyecto.tipo]?.fondo ?? Fondo;
  return (
    <ProyectoProvider valor={r}>
      <MarcaProvider marca={r.marca}>
        <AbsoluteFill>
          <FondoTipo />
          <TransitionSeries>
            {r.escenas.map(({ escena, props, Componente }, i) => (
              <React.Fragment key={escena.id}>
                {i > 0 ? (
                  <TransitionSeries.Transition
                    presentation={presentacion(escena.entrada)}
                    timing={temporizacion}
                  />
                ) : null}
                <TransitionSeries.Sequence
                  durationInFrames={aReales(framesDe(escena, r.voz), fps)}
                  name={escena.antetitulo || escena.id}
                >
                  <TonoProvider tono={escena.tono}>
                    {escena.tono === 'dia' ? <FondoDia /> : null}
                    <Componente escena={escena} props={props as never} />
                  </TonoProvider>
                  <Voz escena={escena} />
                  <Sonidos escena={escena} />
                </TransitionSeries.Sequence>
              </React.Fragment>
            ))}
          </TransitionSeries>
          {subtitulos ? <Subtitulos /> : null}
          {r.proyecto.musica ? <Musica id={r.proyecto.musica} /> : null}
        </AbsoluteFill>
      </MarcaProvider>
    </ProyectoProvider>
  );
};
