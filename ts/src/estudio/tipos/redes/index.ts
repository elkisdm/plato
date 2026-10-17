import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { SubtitulosPalabra, usePunch } from '../../kit/SubtitulosPalabra';
import { TransicionMarca } from '../../kit/identidad/TransicionMarca';
import { VideoViva } from '../../kit/identidad/VideoViva';
import { Zocalo } from '../../kit/identidad/Zocalo';
import { useCuadro } from '../../kit/tiempo';
import { useProyecto, type Escena } from '../../proyecto';
import type { Reemplazo } from '../anuncio/calculos';
import { Cierre, Cita, Clip, Dato, Firma, Foto, Mosaico, Pantalla } from './Escenas';
import { esquemas, type NombreEscena } from './esquemas';
import { fondoDeEscena, type FondoVideo } from './fondo';
import { FondoRedes } from './FondoRedes';
import { CENTRO_SUBTITULOS } from './layout';
import { PrimerPlano, PrimerPlanoContexto } from './PrimerPlano';
import { opacidadPrimerPlano } from './visibilidad';

type ComponenteEscena = React.FC<{ escena: Escena; props: never }>;

/**
 * Toda escena del tipo lleva, además de su contenido: el barrido de marca al entrar (salvo la
 * primera), un golpe de cámara en cada arranque de frase de la voz, el zócalo opcional y los
 * subtítulos palabra por palabra (se apagan con `subtitulos: false`). Solo el fondo y la foto se
 * cruzan entre escenas: el primer plano de cada una se oculta durante su mitad del cruce
 * (`PrimerPlano`), así nunca se ven títulos de dos escenas a la vez.
 */
const conExtras = (Escena_: React.FC<{ escena: Escena; props: never }>): ComponenteEscena => {
  const Envuelta: ComponenteEscena = ({ escena, props }) => {
    const { guion } = useProyecto();
    const frame = useCuadro();
    const { durationInFrames, fps } = useVideoConfig();
    const comunes = props as {
      subtitulos?: boolean;
      zocalo?: { nombre: string; detalle?: string };
      reemplazos?: Reemplazo[];
      fondo?: FondoVideo;
    };
    const fondo = fondoDeEscena(comunes);
    const punch = usePunch(escena, comunes.reemplazos);
    const esPrimera = guion.escenas[0]?.id === escena.id;
    const esUltima = guion.escenas[guion.escenas.length - 1]?.id === escena.id;
    const opacidad = opacidadPrimerPlano(
      frame,
      (durationInFrames * 30) / fps,
      !esPrimera,
      !esUltima,
    );
    return React.createElement(
      PrimerPlanoContexto.Provider,
      { value: opacidad },
      React.createElement(
        AbsoluteFill,
        null,
        // El fondo de video vive en la capa de la escena (cruza en la transición) y no recibe el
        // golpe de cámara; el primer plano sí se oculta durante el cruce.
        fondo ? React.createElement(VideoViva, fondo) : null,
        React.createElement(
          AbsoluteFill,
          { style: { transform: `scale(${punch})` } },
          React.createElement(Escena_, { escena, props }),
        ),
        esPrimera ? null : React.createElement(TransicionMarca),
        React.createElement(
          PrimerPlano,
          null,
          comunes.zocalo ? React.createElement(Zocalo, comunes.zocalo) : null,
          comunes.subtitulos === false
            ? null
            : React.createElement(SubtitulosPalabra, {
                escena,
                reemplazos: comunes.reemplazos,
                centro: CENTRO_SUBTITULOS,
              }),
        ),
      ),
    );
  };
  return Envuelta;
};

/** Catálogo del tipo «redes»: piezas de marca para Instagram, TikTok y LinkedIn (9:16, 4:5 y 16:9). */
export const redes = {
  id: 'redes',
  esquemas,
  fondo: FondoRedes,
  admite60: true,
  formatos: ['vertical', 'retrato', 'horizontal'] as ('vertical' | 'retrato' | 'horizontal')[],
  componentes: {
    firma: conExtras(Firma as unknown as ComponenteEscena),
    foto: conExtras(Foto as unknown as ComponenteEscena),
    pantalla: conExtras(Pantalla as unknown as ComponenteEscena),
    cita: conExtras(Cita as unknown as ComponenteEscena),
    dato: conExtras(Dato as unknown as ComponenteEscena),
    mosaico: conExtras(Mosaico as unknown as ComponenteEscena),
    clip: conExtras(Clip as unknown as ComponenteEscena),
    cierre: conExtras(Cierre as unknown as ComponenteEscena),
  } satisfies Record<NombreEscena, unknown> as unknown as Record<NombreEscena, ComponenteEscena>,
};
