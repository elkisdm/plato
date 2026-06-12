// Extracción de presets (ADR-0009): VideoSpec → bundle de tokens reutilizables ("legos").
// Pura. Con cada video que pasa por el workflow, su bundle se guarda en src/presets/<videoId>.json
// y alimenta la librería componible.

import type { CaptionPreset, ColorWorld, DesignPresets, OverlayPreset, VideoSpec } from './types';

const DEFAULT_CAPTION: CaptionPreset = {
  fontFamily: 'sans-serif',
  color: '#FFFFFF',
  highlightColor: '#E8B84B',
  casing: 'lowercase',
  animation: 'fade_in_word',
};

const DEFAULT_OVERLAY: OverlayPreset = {
  system: 'two_tier',
  connectors: '#AAAAAA',
  emphasis: '#111111',
  animation: 'word_pop',
};

// El style es permisivo (catchall any); leemos defensivamente con acceso laxo.
type Loose = Record<string, any>;

function captionPreset(spec: VideoSpec): CaptionPreset {
  const typo = (spec.style as Loose | undefined)?.typography?.talkingHead as Loose | undefined;
  if (typo) {
    return {
      fontFamily: typo.family ?? typo.fontFamilyGuess ?? DEFAULT_CAPTION.fontFamily,
      color: typo.color ?? DEFAULT_CAPTION.color,
      highlightColor: typo.highlight ?? typo.highlightColor ?? DEFAULT_CAPTION.highlightColor,
      casing: typo.casing ?? DEFAULT_CAPTION.casing,
      animation: typo.animation ?? DEFAULT_CAPTION.animation,
    };
  }
  const first = spec.captions?.[0]?.style as Loose | undefined;
  if (first) {
    return {
      fontFamily: first.fontFamilyGuess ?? DEFAULT_CAPTION.fontFamily,
      color: first.color ?? DEFAULT_CAPTION.color,
      highlightColor: first.highlightColor ?? DEFAULT_CAPTION.highlightColor,
      casing: first.casing ?? DEFAULT_CAPTION.casing,
      animation: first.animation ?? DEFAULT_CAPTION.animation,
    };
  }
  return { ...DEFAULT_CAPTION };
}

function overlayPreset(spec: VideoSpec): OverlayPreset {
  const typo = (spec.style as Loose | undefined)?.typography?.collage as Loose | undefined;
  if (typo) {
    return {
      system: typo.system ?? DEFAULT_OVERLAY.system,
      connectors: typo.connectors ?? DEFAULT_OVERLAY.connectors,
      emphasis: typo.emphasis ?? DEFAULT_OVERLAY.emphasis,
      animation: typo.animation ?? DEFAULT_OVERLAY.animation,
    };
  }
  return { ...DEFAULT_OVERLAY };
}

function colorWorlds(spec: VideoSpec): { talkingHead?: ColorWorld; collage?: ColorWorld } {
  const grade = (spec.style as Loose | undefined)?.colorGrade as Loose | undefined;
  const out: { talkingHead?: ColorWorld; collage?: ColorWorld } = {};
  for (const key of ['talkingHead', 'collage'] as const) {
    const w = grade?.[key] as Loose | undefined;
    if (w?.temperature && w?.saturation) {
      out[key] = { temperature: w.temperature, saturation: w.saturation, look: w.look };
    }
  }
  return out;
}

export function extractPresets(spec: VideoSpec): DesignPresets {
  const { id, fps, width, height, durationMs } = spec.source;
  const vocab = ((spec.style as Loose | undefined)?.transitionVocabulary ?? {}) as Record<
    string,
    number
  >;
  return {
    videoId: id,
    fps,
    width,
    height,
    durationMs,
    caption: captionPreset(spec),
    overlay: overlayPreset(spec),
    colorWorlds: colorWorlds(spec),
    transitionVocabulary: { ...vocab },
  };
}
