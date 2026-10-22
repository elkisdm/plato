/**
 * 08 — Cierre. El sistema completo vuelve a trabajar, tranquilo. "Desarrollar
 * con IA ≠ delegar decisiones" se transforma: el ≠ pierde la barra y la frase
 * pasa a "= entender qué decisiones estás delegando". Repo y fade limpio.
 */

import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS, SPACING, TYPE } from '../constants/theme';
import { WIDTH } from '../constants/timings';
import { Diagram } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { Reveal } from '../components/motion/Reveal';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { EqualityGlyph } from '../components/typography/EqualityGlyph';
import { Headline } from '../components/typography/Headline';
import { BUILT_EDGES, BUILT_NODES, systemPulses } from '../diagram/system';
import { progress } from '../lib/motion';

const CENTERED = { position: 'absolute' as const, left: SPACING.safeX, right: SPACING.safeX };
const FADE_OUT = 22;

export function Outro({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const fadeOut = progress(frame, duration - FADE_OUT, FADE_OUT);

  return (
    <SceneFrame duration={duration} exit="none">
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
        <Camera pose={{ x: 555, y: 694, zoom: 0.54 }}>
          <Diagram nodes={BUILT_NODES} edges={BUILT_EDGES} pulses={systemPulses(0, duration)} />
        </Camera>

        <Headline
          text="Desarrollar con IA"
          at={8}
          size={TYPE.headline - 2}
          style={{ ...CENTERED, top: 130 }}
        />
        <Reveal
          at={18}
          style={{
            position: 'absolute',
            top: 212,
            left: 0,
            width: WIDTH,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <EqualityGlyph resolve={progress(frame, 62, 18)} />
        </Reveal>
        <Headline
          text="delegar decisiones"
          at={24}
          out={64}
          size={TYPE.title + 12}
          color={COLORS.textMuted}
          style={{ ...CENTERED, top: 290 }}
        />
        <Headline
          text={'entender qué decisiones\nestás delegando.'}
          at={74}
          size={TYPE.title + 12}
          accent={['entender']}
          style={{ ...CENTERED, top: 290 }}
        />

        <Caption
          text="Repo de estándares de desarrollo"
          at={118}
          size={TYPE.small + 2}
          style={{ ...CENTERED, top: 1030 }}
        />
        <Reveal
          at={124}
          style={{ ...CENTERED, top: 1076, display: 'flex', justifyContent: 'center' }}
        >
          <div
            style={{
              padding: '12px 26px',
              borderRadius: SPACING.radius,
              border: `1px solid ${COLORS.accent}`,
              background: COLORS.accentWash,
              fontFamily: FONTS.mono,
              fontSize: TYPE.label + 2,
              fontWeight: 500,
              color: COLORS.accent,
              boxShadow: `0 0 26px ${COLORS.accentWash}`,
            }}
          >
            github.com/elkisdm/devground
          </div>
        </Reveal>
        <Caption
          text={'Para personas que construyen con IA\nsin venir de un background técnico.'}
          at={140}
          size={TYPE.small}
          style={{ ...CENTERED, top: 1150 }}
        />
      </div>
    </SceneFrame>
  );
}
