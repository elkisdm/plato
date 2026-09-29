import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';

import { enterOpacityAt, liftProgressAt, microAt, scaleAt, shadowAt } from '../paperMotion';
import type { LifeConfig, LiftConfig } from '../paperMotion';
import {
  DEFAULT_ENTER,
  DEFAULT_LIFE,
  DEFAULT_LIFT,
  DEFAULT_TREATMENT,
  paperTokens,
} from '../paperTokens';

export interface PaperCutoutProps {
  /** PNG con alpha o SVG. El asset es estático; toda la vida es animación. */
  src: string;
  /** Ancho en px de la composición. */
  width?: number;
  /** Posición normalizada 0-1, independiente de resolución. */
  position?: { xNorm: number; yNorm: number };
  /** Frame (relativo a la Sequence) en que aparece. */
  enterAt?: number;
  lift?: LiftConfig;
  life?: LifeConfig;
  enter?: { fadeInFrames: number; mode: 'fade' | 'rise' | 'clipReveal' };
  /** sepia/contrast como CSS filter; grain superpone ruido enmascarado al alpha
   * del propio asset. (halftone queda para una iteración futura.) */
  treatment?: { grain: boolean; sepia: number; contrast: number };
  /** Pivote bajo por defecto = sensación de objeto apoyado que se levanta. */
  transformOrigin?: string;
}

/**
 * Un recorte de papel que "cobra vida": entra plano (2D), se despega del papel
 * vía drop-shadow animada + leve scale (lift), y respira con micro-movimiento
 * sinusoidal (life). Todo derivado de useCurrentFrame() — determinístico y
 * scrubbeable; la matemática vive (probada) en paperMotion.ts.
 */
export const PaperCutout = ({
  src,
  width = 210,
  position = { xNorm: 0.5, yNorm: 0.56 },
  enterAt = 0,
  lift = DEFAULT_LIFT,
  life = DEFAULT_LIFE,
  enter = DEFAULT_ENTER,
  treatment = DEFAULT_TREATMENT,
  transformOrigin = '50% 88%',
}: PaperCutoutProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const liftProgress = liftProgressAt(frame, enterAt, lift);
  const shadow = shadowAt(liftProgress);
  const scale = scaleAt(liftProgress);
  const micro = microAt(frame, enterAt, fps, life);
  const enterProgress = enterOpacityAt(frame, enterAt, enter.fadeInFrames);

  // Modo de entrada: fade (opacity), rise (fade + sube 26px) o clipReveal
  // (se descubre de arriba hacia abajo, sin fade).
  const opacity = enter.mode === 'clipReveal' ? (frame < enterAt ? 0 : 1) : enterProgress;
  const riseOffset = enter.mode === 'rise' ? (1 - enterProgress) * 26 : 0;
  const clipPath =
    enter.mode === 'clipReveal' ? `inset(0 0 ${(1 - enterProgress) * 100}% 0)` : undefined;

  const filters: string[] = [];
  if (treatment.sepia > 0) filters.push(`sepia(${treatment.sepia})`);
  if (treatment.contrast !== 1) filters.push(`contrast(${treatment.contrast})`);
  filters.push(
    `drop-shadow(${shadow.dx}px ${shadow.dy}px ${shadow.blur}px rgba(20,16,9,${shadow.opacity}))`,
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: `${position.xNorm * 100}%`,
          top: `${position.yNorm * 100}%`,
          width,
          opacity,
          clipPath,
          transformOrigin,
          transform: `translate(-50%, -50%) translateY(${micro.bob + riseOffset}px) rotate(${micro.tilt}deg) skewX(${micro.lean * 0.3}deg) scale(${scale})`,
          filter: filters.join(' '),
        }}
      >
        <Img src={src} style={{ width: '100%', display: 'block' }} />
        {treatment.grain ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${paperTokens.grain.dataUri}")`,
              backgroundRepeat: 'repeat',
              opacity: 0.35,
              mixBlendMode: 'multiply',
              // El ruido solo existe donde el asset tiene alpha.
              WebkitMaskImage: `url("${src}")`,
              WebkitMaskSize: '100% 100%',
              maskImage: `url("${src}")`,
              maskSize: '100% 100%',
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
