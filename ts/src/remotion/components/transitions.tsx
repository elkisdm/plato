import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface FlashCutProps {
  /** Frame absoluto (en la composición) donde ocurre el flash. */
  atFrame: number;
  /** Duración del flash en frames. Default 2 (firma de @olyasuharska: ~1-2 frames). */
  durationInFrames?: number;
}

/**
 * Lego de transición: el FLASH BLANCO del corte (firma de @olyasuharska).
 * Renderiza un velo blanco cuya opacidad sube y baja con pico en el medio
 * de la ventana. Fuera de la ventana del flash no renderiza nada.
 */
export const FlashCut = (props: FlashCutProps) => {
  const { atFrame, durationInFrames = 2 } = props;
  const frame = useCurrentFrame();

  // Fuera de la ventana [atFrame, atFrame + duration): no pintamos nada.
  if (frame < atFrame || frame >= atFrame + durationInFrames) {
    return null;
  }

  // Triángulo de opacidad: 0 → 1 (pico en el medio) → 0.
  const opacity = interpolate(
    frame,
    [atFrame, atFrame + durationInFrames / 2, atFrame + durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return <AbsoluteFill style={{ backgroundColor: '#ffffff', opacity }} />;
};
