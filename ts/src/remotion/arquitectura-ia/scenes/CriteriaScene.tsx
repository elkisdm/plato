/**
 * 07 — Criterio. El sistema completo se aleja y queda de fondo. Cuatro
 * preguntas entran una a una; cada una ilumina la parte del sistema a la que
 * se le haría esa pregunta.
 */

import { useCurrentFrame } from 'remotion';

import { SPACING, TYPE } from '../constants/theme';
import { Diagram } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Headline } from '../components/typography/Headline';
import { QuestionCard } from '../components/ui/QuestionCard';
import { BUILT_EDGES, BUILT_NODES, systemPulses } from '../diagram/system';
import { cameraAt, progress } from '../lib/motion';

const QUESTIONS: { text: string; lights: string[] }[] = [
  { text: '¿Qué es?', lights: ['crm'] },
  { text: '¿Para qué sirve?', lights: ['agentIA', 'agentBrowser'] },
  { text: '¿Qué problema resuelve?', lights: ['fb', 'form', 'ref', 'leads'] },
  { text: '¿Cuándo lo usaría y cuándo no?', lights: ['vps', 'supa'] },
];
const FIRST_Q = 88;
const Q_STEP = 28;
const BACKGROUND = 0.3;

export function CriteriaScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();

  const activeOf = (i: number) => {
    const start = FIRST_Q + i * Q_STEP;
    const next = i < QUESTIONS.length - 1 ? progress(frame, start + Q_STEP, 10) : 0;
    return progress(frame, start, 10) * (1 - next);
  };
  const recede = progress(frame, 0, 40);

  const visuals = Object.fromEntries(
    BUILT_NODES.map((n) => {
      const light = Math.max(
        0,
        ...QUESTIONS.map((q, i) => (q.lights.includes(n.id) ? activeOf(i) : 0)),
      );
      const base = 1 - (1 - BACKGROUND) * progress(frame, FIRST_Q - 30, 20);
      return [n.id, { emphasis: Math.max(base, light), glow: light }];
    }),
  );

  const pose = cameraAt(frame, [
    { frame: 0, x: 555, y: 560, zoom: 0.7 },
    { frame: 40, x: 555, y: 324, zoom: 0.52 },
  ]);

  return (
    <SceneFrame duration={duration}>
      <Camera pose={pose}>
        <div style={{ opacity: 0.4 + 0.6 * recede }}>
          <Diagram
            nodes={BUILT_NODES}
            edges={BUILT_EDGES}
            pulses={systemPulses(0, duration)}
            visuals={visuals}
          />
        </div>
      </Camera>

      <Headline
        text={'No necesitas memorizar\ntodo esto.'}
        at={8}
        out={52}
        size={TYPE.headline - 2}
        style={{ position: 'absolute', top: 150, left: SPACING.safeX, right: SPACING.safeX }}
      />
      <Headline
        text="Necesitas criterio."
        at={56}
        size={TYPE.headline + 8}
        accent={['criterio.']}
        style={{ position: 'absolute', top: 180, left: SPACING.safeX, right: SPACING.safeX }}
      />
      <div
        style={{
          position: 'absolute',
          top: 330,
          left: SPACING.safeX + 40,
          right: SPACING.safeX + 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {QUESTIONS.map((q, i) => (
          <QuestionCard
            key={q.text}
            index={i + 1}
            question={q.text}
            at={FIRST_Q + i * Q_STEP}
            active={activeOf(i)}
          />
        ))}
      </div>
    </SceneFrame>
  );
}
