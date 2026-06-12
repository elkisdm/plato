// Composición data-driven (ADR-0009): arma los "legos" regida por el VideoSpec.
// Recibe (spec, presets, videoSrc) y renderiza captions/overlays sobre el video fuente
// (o un fondo de mundo de color si no hay video). Solo le falta el mp4 para el render real.

import { AbsoluteFill, OffthreadVideo, Sequence, useVideoConfig } from 'remotion';

import { ColorWorldBackground } from './components/ColorWorldBackground';
import { KaraokeCaption } from './components/KaraokeCaption';
import { FlashCut } from './components/transitions';
import { TwoTierOverlay } from './components/TwoTierOverlay';
import type { SpecCompositionProps } from './types';

export const SpecComposition = ({ spec, presets, videoSrc }: SpecCompositionProps) => {
  const { fps } = useVideoConfig();
  const msToFrame = (ms: number) => Math.round((ms / 1000) * fps);

  const captions = spec.captions ?? [];
  const overlays = spec.textOverlays ?? [];
  // Los flashes blancos van al nivel de composición (frame absoluto); cada uno se
  // auto-recorta a su ventana de ~2 frames.
  const flashes = (spec.shots ?? []).filter((s) => s.transitionIn?.type === 'flash_cut');

  return (
    <AbsoluteFill>
      {videoSrc ? (
        <OffthreadVideo src={videoSrc} />
      ) : (
        <ColorWorldBackground world={presets.colorWorlds.talkingHead} />
      )}

      {captions.map((caption) => {
        const from = msToFrame(caption.startMs);
        const durationInFrames = Math.max(1, msToFrame(caption.endMs) - from);
        return (
          <Sequence key={caption.id} from={from} durationInFrames={durationInFrames}>
            <KaraokeCaption caption={caption} preset={presets.caption} />
          </Sequence>
        );
      })}

      {overlays.map((overlay) => {
        const from = msToFrame(overlay.startMs);
        const durationInFrames = Math.max(1, msToFrame(overlay.endMs) - from);
        return (
          <Sequence key={overlay.id} from={from} durationInFrames={durationInFrames}>
            <TwoTierOverlay overlay={overlay} preset={presets.overlay} />
          </Sequence>
        );
      })}

      {flashes.map((shot) => (
        <FlashCut key={shot.id} atFrame={msToFrame(shot.startMs)} durationInFrames={2} />
      ))}
    </AbsoluteFill>
  );
};
