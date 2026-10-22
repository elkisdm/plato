import type { ComponentType } from 'react';
import { AbsoluteFill } from 'remotion';

import { GridBackground } from '../arquitectura-ia/components/ui/GridBackground';
import { loadFonts } from '../arquitectura-ia/lib/fonts';
import { Escena } from './components/Escena';
import { Sonido } from './components/Sonido';
import { Subtitulos } from './components/Subtitulos';
import { FPS, H, W } from './constants/theme';
import { DURACION, ESCENAS, type IdEscena } from './lib/lineaTiempo';
import { E01Gancho } from './scenes/E01Gancho';
import { E02Mezcla } from './scenes/E02Mezcla';
import { E03Fuente } from './scenes/E03Fuente';
import { E04Casa } from './scenes/E04Casa';
import { E05Puerta } from './scenes/E05Puerta';
import { E06TresPasos } from './scenes/E06TresPasos';
import { E07Cta } from './scenes/E07Cta';
import type { PropsEscena } from './scenes/tipos';

void loadFonts();

export const W_OCTUBRE_NEGRO_GENERAL = W;
export const H_OCTUBRE_NEGRO_GENERAL = H;
export const FPS_OCTUBRE_NEGRO_GENERAL = FPS;
export const DURACION_OCTUBRE_NEGRO_GENERAL = DURACION;

const COMPONENTES: Record<IdEscena, ComponentType<PropsEscena>> = {
  E01Gancho,
  E02Mezcla,
  E03Fuente,
  E04Casa,
  E05Puerta,
  E06TresPasos,
  E07Cta,
};

/** Reel "Octubre Negro, para todos": escenas en tiempo global sobre la voz de ElevenLabs, con subtítulos siempre. */
export const OctubreNegroGeneral = () => (
  <AbsoluteFill>
    <Sonido />
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
    <Subtitulos />
  </AbsoluteFill>
);
