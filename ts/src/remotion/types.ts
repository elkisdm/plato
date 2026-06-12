// Tipos del subsistema Remotion (ADR-0009). El VideoSpec es la fuente de verdad (ADR-0001);
// acá derivamos sus sub-formas y los "presets" (tokens reutilizables) que extraemos del spec.

import type { VideoSpec } from '../index';

export type { VideoSpec };
export type Shot = VideoSpec['shots'][number];
export type Caption = NonNullable<VideoSpec['captions']>[number];
export type TextOverlay = NonNullable<VideoSpec['textOverlays']>[number];

/** Estilo de caption karaoke (talking-head) — un "lego" de diseño. */
export interface CaptionPreset {
  fontFamily: string;
  color: string;
  highlightColor: string;
  casing: 'lowercase' | 'uppercase' | 'title' | 'mixed';
  animation: string;
}

/** Estilo de overlay gráfico (collage two-tier) — un "lego" de diseño. */
export interface OverlayPreset {
  system: string;
  connectors: string;
  emphasis: string;
  animation: string;
}

/** Un mundo de color (cálido talking-head vs neutro collage). */
export interface ColorWorld {
  temperature: 'warm' | 'neutral' | 'cool';
  saturation: 'high' | 'medium' | 'low';
  look?: string;
}

/** Bundle de presets extraído de UN spec. Se acumula en src/presets/<videoId>.json. */
export interface DesignPresets {
  videoId: string;
  fps: number;
  width: number;
  height: number;
  durationMs: number;
  caption: CaptionPreset;
  overlay: OverlayPreset;
  colorWorlds: { talkingHead?: ColorWorld; collage?: ColorWorld };
  transitionVocabulary: Record<string, number>;
}

/** Props de la composición data-driven. `videoSrc` null → fondo sólido.
 * Es un `type` (no `interface`) para que satisfaga `Record<string, unknown>`,
 * que es lo que exige el genérico de `<Composition>` de Remotion. */
export type SpecCompositionProps = {
  spec: VideoSpec;
  presets: DesignPresets;
  videoSrc: string | null;
};
