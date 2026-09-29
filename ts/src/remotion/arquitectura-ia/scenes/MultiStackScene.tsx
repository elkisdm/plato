/**
 * 05 — El insight. Pantalla limpia: "Pero muchas veces…" / "No eliges uno."
 * "Combinas varios." sube a titular mientras la cámara se abre y el sistema
 * multi-superficie se construye conexión por conexión. Al completarse, la
 * cámara se aleja un poco y el sistema empieza a trabajar solo.
 */

import { interpolate, useCurrentFrame } from 'remotion';

import { COLORS, SPACING, TYPE } from '../constants/theme';
import { WIDTH } from '../constants/timings';
import { Diagram } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { Headline } from '../components/typography/Headline';
import {
  AUTH_CHECK_AT,
  SYSTEM_EDGES,
  SYSTEM_NODES,
  SYSTEM_POSES,
  systemPulses,
} from '../diagram/system';
import { cameraAt, progress } from '../lib/motion';

const BEAT = {
  style: { position: 'absolute' as const, top: 600, left: SPACING.safeX, right: SPACING.safeX },
};

export function MultiStackScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const rise = progress(frame, 96, 26);

  const pose = cameraAt(frame, [
    { frame: 95, x: 700, y: 520, zoom: 1 },
    { frame: 205, ...SYSTEM_POSES.full },
    { frame: 285, ...SYSTEM_POSES.full },
    { frame: 335, ...SYSTEM_POSES.wide },
  ]);

  return (
    <SceneFrame duration={duration}>
      <Camera pose={pose}>
        <Diagram
          nodes={SYSTEM_NODES}
          edges={SYSTEM_EDGES}
          pulses={systemPulses(262, duration + 20)}
          signals={{ vps: { onlineAt: 240 }, supa: { checkAt: AUTH_CHECK_AT } }}
        />
      </Camera>

      <Headline text="Pero muchas veces…" at={6} out={40} size={TYPE.headline + 12} {...BEAT} />
      <Headline text="No eliges uno." at={46} out={76} size={TYPE.headline + 12} {...BEAT} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: WIDTH,
          top: interpolate(rise, [0, 1], [600, 150]),
          transform: `scale(${interpolate(rise, [0, 1], [1, 0.84])})`,
        }}
      >
        <Headline text="Combinas varios." at={80} size={TYPE.headline + 12} accent={['varios.']} />
      </div>

      <Caption
        text="Ya no tienes una app."
        at={290}
        size={TYPE.caption + 2}
        style={{ position: 'absolute', top: 1096, left: SPACING.safeX, right: SPACING.safeX }}
      />
      <Caption
        text="Tienes varias superficies trabajando juntas."
        at={318}
        size={TYPE.caption + 2}
        color={COLORS.text}
        style={{ position: 'absolute', top: 1148, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
