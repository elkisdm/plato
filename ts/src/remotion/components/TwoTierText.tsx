import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { wordOpacityAt } from '../paperMotion';
import { paperTokens } from '../paperTokens';

export interface TwoTierLine {
  text: string;
  /** emphasis = bold tinta; connector = fino tinta apagada. */
  tier: 'emphasis' | 'connector';
  position: { xNorm: number; yNorm: number };
  align?: 'left' | 'right';
  /** Frame (relativo a la Sequence) en que la línea empieza a entrar. */
  enterAt: number;
}

export interface TwoTierTextProps {
  lines: TwoTierLine[];
  /** Frames de fade por palabra (append). 3 ≈ 80ms a 30fps, el pacing del análisis. */
  wordFadeFrames?: number;
}

/**
 * Tipografía cinética a dos niveles, DIRIGIDA por props (a diferencia de
 * TwoTierOverlay, que es data-driven desde el VideoSpec). Cada línea se
 * posiciona normalizada y sus palabras entran escalonadas con fade append,
 * sincronizables a la voz vía enterAt.
 */
export const TwoTierText = ({ lines, wordFadeFrames = 3 }: TwoTierTextProps) => {
  const frame = useCurrentFrame();
  const { typography, paper } = paperTokens;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {lines.map((line, lineIndex) => {
        const emphasis = line.tier === 'emphasis';
        const align = line.align ?? 'left';
        const words = line.text.split(/\s+/).filter((w) => w.length > 0);

        return (
          <div
            key={`${lineIndex}-${line.text}`}
            style={{
              position: 'absolute',
              left: `${line.position.xNorm * 100}%`,
              top: `${line.position.yNorm * 100}%`,
              transform: `translate(${align === 'right' ? '-100%' : '0'}, -50%)`,
              whiteSpace: 'nowrap',
              fontFamily: typography.family,
              fontWeight: emphasis ? typography.emphasisWeight : typography.connectorWeight,
              fontSize: emphasis ? '3.5rem' : '1.9rem',
              letterSpacing: typography.letterSpacing,
              color: emphasis ? paper.ink : paper.inkMuted,
              lineHeight: 1.1,
            }}
          >
            {words.map((word, wordIndex) => (
              <span
                key={`${wordIndex}-${word}`}
                style={{
                  display: 'inline-block',
                  marginRight: '0.32em',
                  opacity: wordOpacityAt(frame, line.enterAt, wordIndex, wordFadeFrames),
                }}
              >
                {word}
              </span>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
