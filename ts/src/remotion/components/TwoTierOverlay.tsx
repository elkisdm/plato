import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import type { OverlayPreset, TextOverlay } from '../types';

interface TwoTierOverlayProps {
  overlay: TextOverlay;
  preset: OverlayPreset;
}

/**
 * Stopwords (palabras conectoras) en español. Cualquier palabra que NO esté
 * acá y tenga longitud relevante se considera de énfasis. La lista replica
 * exactamente la pedida por el contrato del componente.
 */
const STOPWORDS = new Set([
  'por',
  'eso',
  'cuando',
  'y',
  'la',
  'el',
  'de',
  'a',
  'en',
  'que',
  'se',
  'un',
  'una',
]);

/**
 * HEURÍSTICA DE ÉNFASIS (two-tier):
 * una palabra es de ÉNFASIS si tiene 5 o más letras (medidas sin signos de
 * puntuación) O si NO es una stopword conocida; en cualquier otro caso es
 * CONECTORA. En la práctica esto manda al tier "fino/gris" solo a las
 * stopwords cortas (por, eso, y, la, el…) y deja todo lo demás en el tier
 * "negro/extra-bold". Es determinística y libre de estado.
 */
const isEmphasisWord = (raw: string): boolean => {
  const cleaned = raw.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  if (cleaned.length === 0) return false;
  if (cleaned.length >= 5) return true;
  return !STOPWORDS.has(cleaned);
};

/**
 * Valida si un string parece un color CSS usable (hex #rgb/#rrggbb o un nombre
 * CSS básico). Si no lo parece (p.ej. una descripción cualitativa del preset),
 * devolvemos null para caer al fallback.
 */
const asCssColor = (value: string | undefined): string | null => {
  if (!value) return null;
  const v = value.trim();
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v;
  // Heurística simple: una sola palabra alfabética la tratamos como nombre CSS
  // (black, gray, dimgray…). Frases con espacios son descripciones, no colores.
  if (/^[a-zA-Z]+$/.test(v)) return v;
  return null;
};

/**
 * Offset pseudo-aleatorio DETERMINÍSTICO por índice de palabra. Sin Math.random
 * para no romper el determinismo del render (mismo frame → mismo pixel). Usamos
 * dos senos con frecuencias distintas para dispersar en x e y de forma estable.
 */
const scatterOffset = (index: number): { dx: number; dy: number } => ({
  // amplitudes en px; números primos en la fase para evitar alineaciones obvias
  dx: Math.sin(index * 12.9898) * 46,
  dy: Math.sin(index * 78.233 + 1.3) * 30,
});

export const TwoTierOverlay = (props: TwoTierOverlayProps) => {
  const { overlay, preset } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duración del overlay en frames. useCurrentFrame() es RELATIVO al inicio del
  // <Sequence> que envuelve este overlay, así que `frame` ya arranca en 0.
  const durationInFrames = Math.max(
    1,
    Math.round(((overlay.endMs - overlay.startMs) / 1000) * fps),
  );

  // Colores de cada tier con fallback si el preset no trae algo "parseable".
  const emphasisColor = asCssColor(preset.emphasis) ?? '#111';
  const connectorColor = asCssColor(preset.connectors) ?? '#888';

  const words = overlay.text.split(/\s+/).filter((w) => w.length > 0);
  const nWords = words.length;

  // Revelado progresivo (word pop): en el frame relativo `frame`, cuántas
  // palabras ya están visibles. Clamp en [1, nWords].
  const visibleCount = Math.min(
    nWords,
    Math.max(1, Math.floor((frame / durationInFrames) * nWords) + 1),
  );

  // Posición base del bloque: positionNorm si existe, si no centro (0.5, 0.45).
  const baseX = overlay.positionNorm?.x ?? 0.5;
  const baseY = overlay.positionNorm?.y ?? 0.45;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${baseX * 100}%`,
          top: `${baseY * 100}%`,
          transform: 'translate(-50%, -50%)',
          // Bloque flexible que envuelve; el "esparcido" lo da cada palabra con
          // su offset determinístico, no el flujo del contenedor.
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '70%',
          gap: '0.15em 0.35em',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          lineHeight: 1.1,
        }}
      >
        {words.map((word, index) => {
          const emphasis = isEmphasisWord(word);
          const visible = index < visibleCount;

          // Frame local de esta palabra: cuántos frames lleva visible. El umbral
          // es el frame en que el revelado progresivo la "destapa".
          const revealFrame = nWords > 0 ? (index / nWords) * durationInFrames : 0;
          const localFrame = frame - revealFrame;

          // POP de entrada con overshoot: spring damping 12 da un rebote suave.
          // Si la palabra aún no debe verse, forzamos progreso 0.
          const pop = visible
            ? spring({
                frame: localFrame,
                fps,
                config: { damping: 12 },
                durationInFrames: 8,
              })
            : 0;

          const scale = interpolate(pop, [0, 1], [0.6, 1]);
          const opacity = interpolate(pop, [0, 1], [0, 1]);

          const { dx, dy } = scatterOffset(index);

          return (
            <span
              key={overlay.id + '-' + index}
              style={{
                display: 'inline-block',
                // El offset de "scatter" se aplica junto al pop de escala.
                transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
                opacity,
                color: emphasis ? emphasisColor : connectorColor,
                fontWeight: emphasis ? 900 : 300,
                // Tier de énfasis = más grande; conector = más chico/fino.
                fontSize: emphasis ? '5.5rem' : '2.6rem',
                letterSpacing: emphasis ? '-0.02em' : '0',
                whiteSpace: 'nowrap',
                willChange: 'transform, opacity',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
