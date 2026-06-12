import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import type { Caption, CaptionPreset } from '../types';

interface KaraokeCaptionProps {
  caption: Caption;
  preset: CaptionPreset;
}

/**
 * Aplica el casing del preset a una palabra.
 * - "title": capitaliza la primera letra (Title Case por palabra).
 * - "mixed": respeta el texto original.
 */
function applyCasing(word: string, casing: CaptionPreset['casing']): string {
  switch (casing) {
    case 'lowercase':
      return word.toLowerCase();
    case 'uppercase':
      return word.toUpperCase();
    case 'title':
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    case 'mixed':
    default:
      return word;
  }
}

/**
 * Caption estilo KARAOKE (talking-head). Las palabras se revelan una a una
 * sincronizadas al tiempo; la palabra activa (última revelada) se resalta con
 * glow dorado, las anteriores quedan en el color base.
 *
 * Se monta DENTRO de un <Sequence>, por lo que useCurrentFrame() es RELATIVO
 * al inicio del caption (frame 0 = caption.startMs).
 */
export const KaraokeCaption: React.FC<KaraokeCaptionProps> = ({ caption, preset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duración del caption en frames, derivada de su ventana temporal.
  // Mínimo 1 para evitar división por cero en captions muy cortos.
  const durationInFrames = Math.max(
    1,
    Math.round(((caption.endMs - caption.startMs) / 1000) * fps),
  );

  // Separamos en palabras descartando espacios extra.
  const words = caption.text.trim().split(/\s+/).filter(Boolean);
  const nWords = words.length;

  // progress 0..1 a lo largo del caption.
  const progress = frame / durationInFrames;

  // Cuántas palabras están visibles en este frame.
  // floor(progress * nWords) + 1 → empieza en 1 palabra y crece; clamp a nWords.
  const visibleCount = Math.min(nWords, Math.max(1, Math.floor(progress * nWords) + 1));

  // Índice de la palabra ACTIVA = la última revelada.
  const activeIndex = visibleCount - 1;

  // Posición del bloque: usa positionNorm o, por defecto, centrado abajo.
  const x = caption.positionNorm?.x ?? 0.5;
  const y = caption.positionNorm?.y ?? 0.8;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: 'translate(-50%, -50%)',
          // Las palabras fluyen en línea con wrap, centradas.
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.25em',
          maxWidth: '90%',
          fontFamily: preset.fontFamily,
          fontSize: 48,
          fontWeight: 600,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {words.slice(0, visibleCount).map((word, index) => {
          const isActive = index === activeIndex;

          // Frame en que esta palabra se revela (reparte la duración entre palabras).
          const revealFrame = nWords > 0 ? (index / nWords) * durationInFrames : 0;
          const localFrame = frame - revealFrame;

          // Fade rápido de entrada (~3 frames) sobre la opacidad.
          const opacity = interpolate(localFrame, [0, 3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <span
              key={index}
              style={{
                opacity,
                color: isActive ? preset.highlightColor : preset.color,
                // Glow dorado solo en la palabra activa.
                textShadow: isActive ? `0 0 12px ${preset.highlightColor}` : 'none',
                transition: 'color 0.1s linear',
              }}
            >
              {applyCasing(word, preset.casing)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
