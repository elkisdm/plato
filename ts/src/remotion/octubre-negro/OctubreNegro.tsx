import type { ComponentType } from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';

import { GridBackground } from '../arquitectura-ia/components/ui/GridBackground';
import { loadFonts } from '../arquitectura-ia/lib/fonts';
import { Escena } from './components/Escena';
import { FPS, H, W } from './constants/theme';
import { DURACION, ESCENAS, type IdEscena } from './lib/lineaTiempo';
import { E01Gancho } from './scenes/E01Gancho';
import { E02Lista } from './scenes/E02Lista';
import { E03Verifica } from './scenes/E03Verifica';
import { E04Mezcla } from './scenes/E04Mezcla';
import { E05Tres } from './scenes/E05Tres';
import { E06Leccion } from './scenes/E06Leccion';
import { E07Cta } from './scenes/E07Cta';
import type { PropsEscena } from './scenes/tipos';

void loadFonts();

export const W_OCTUBRE_NEGRO = W;
export const H_OCTUBRE_NEGRO = H;
export const FPS_OCTUBRE_NEGRO = FPS;
export const DURACION_OCTUBRE_NEGRO = DURACION;

const COMPONENTES: Record<IdEscena, ComponentType<PropsEscena>> = {
  E01Gancho,
  E02Lista,
  E03Verifica,
  E04Mezcla,
  E05Tres,
  E06Leccion,
  E07Cta,
};

/** Reel "Octubre Negro, verificado": escenas en tiempo global sobre la voz de ElevenLabs. */
export const OctubreNegro = () => (
  <AbsoluteFill>
    <Audio src={staticFile('octubre-negro/voz.mp3')} />
    <GridBackground />
    {ESCENAS.map((e, i) => {
      const Componente = COMPONENTES[e.id];
      return (
        <Escena
          key={e.id}
          desde={e.desde}
          hasta={e.hasta}
          fundirEntrada={i > 0}
          fundirSalida={i < ESCENAS.length - 1}
        >
          <Componente desde={e.desde} hasta={e.hasta} />
        </Escena>
      );
    })}
  </AbsoluteFill>
);
