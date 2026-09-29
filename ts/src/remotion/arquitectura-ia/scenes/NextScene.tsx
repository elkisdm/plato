/**
 * 03 — Next.js. El nodo Astro se transforma en APP y baja al centro; a su
 * alrededor aparecen, una a una, las responsabilidades de una app que crece.
 * La cámara se abre a medida que el sistema se agranda.
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, SPACING, SPRINGS } from '../constants/theme';
import { Diagram } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { ToolHeadline } from '../components/typography/ToolHeadline';
import type { ArchitectureNodeSpec, ConnectionSpec, NodeType } from '../diagram/types';
import { cameraAt, progress } from '../lib/motion';
import type { PulseSpec } from '../lib/pulses';
import { ASTRO_NODE } from './AstroScene';

const CORE = { x: 540, y: 760, width: 300, height: 110 };
const ORBIT = { rx: 320, ry: 290 };

const SATELLITES: { id: string; label: string; type: NodeType; angle: number }[] = [
  { id: 'auth', label: 'AUTH', type: 'service', angle: -90 },
  { id: 'users', label: 'USUARIOS', type: 'user', angle: -38 },
  { id: 'dashboard', label: 'DASHBOARD', type: 'frontend', angle: 14 },
  { id: 'routes', label: 'RUTAS', type: 'frontend', angle: 66 },
  { id: 'api', label: 'API', type: 'backend', angle: 114 },
  { id: 'services', label: 'SERVICIOS', type: 'backend', angle: 166 },
  { id: 'db', label: 'DB', type: 'database', angle: 218 },
];
const FIRST = 40;
const STEP = 14;

const SAT_NODES: ArchitectureNodeSpec[] = SATELLITES.map((s, i) => ({
  id: s.id,
  label: s.label,
  type: s.type,
  x: Math.round(CORE.x + ORBIT.rx * Math.cos((s.angle * Math.PI) / 180)),
  y: Math.round(CORE.y + ORBIT.ry * Math.sin((s.angle * Math.PI) / 180)),
  width: 250,
  height: 68,
  at: FIRST + i * STEP,
}));

const EDGES: ConnectionSpec[] = [
  ...SATELLITES.map((s, i) => ({ from: 'app', to: s.id, at: FIRST + 4 + i * STEP })),
  { from: 'auth', to: 'users', at: 142 },
  { from: 'api', to: 'services', at: 148 },
  { from: 'services', to: 'db', at: 154 },
];

/** Dos rondas de peticiones desde el núcleo hacia cada responsabilidad. */
const PULSES: PulseSpec[] = [150, 178].flatMap((round) =>
  SATELLITES.map((_, i) => ({ edge: i, start: round + i * 4, duration: 16 })),
);

export function NextScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const move = spring({ frame, fps, config: SPRINGS.move });

  const app: ArchitectureNodeSpec = {
    id: 'app',
    label: 'APP',
    subtitle: 'NEXT.JS',
    type: 'service',
    x: CORE.x,
    y: interpolate(move, [0, 1], [ASTRO_NODE.y, CORE.y]),
    width: interpolate(move, [0, 1], [ASTRO_NODE.width!, CORE.width]),
    height: interpolate(move, [0, 1], [ASTRO_NODE.height!, CORE.height]),
  };

  const pose = cameraAt(frame, [
    { frame: 0, x: 540, y: 675, zoom: 1 },
    { frame: 34, x: 540, y: 700, zoom: 1.08 },
    { frame: 160, x: 540, y: 675, zoom: 1 },
  ]);

  return (
    <SceneFrame duration={duration} enter="none" exit="panLeft">
      <Camera pose={pose}>
        <Diagram
          nodes={[app, ...SAT_NODES]}
          edges={EDGES}
          pulses={PULSES}
          signals={{ auth: { checkAt: 162 } }}
          visuals={{
            app: {
              previous: { label: ASTRO_NODE.label, subtitle: ASTRO_NODE.subtitle },
              swap: progress(frame, 6, 18),
              glow: 0.5 + 0.5 * progress(frame, 20, 20),
            },
          }}
        />
      </Camera>

      <ToolHeadline condition="Si la app crece" tool="Next.js" at={12} />
      <Caption
        text={'Ecosistema maduro.\nMuchas piezas trabajando juntas.'}
        at={128}
        color={COLORS.text}
        style={{ position: 'absolute', top: 1110, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
