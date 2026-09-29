/**
 * 04 — TanStack. Paneo horizontal hacia un flujo de datos. Los módulos
 * (Query, Router, Table, Start) llegan separados y se acoplan en un grupo.
 * La primera petición recorre todo el flujo; las siguientes salen del CACHE.
 */

import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, SPACING, SPRINGS } from '../constants/theme';
import { ArchitectureGroup } from '../components/architecture/ArchitectureGroup';
import { Diagram } from '../components/architecture/Diagram';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { ToolHeadline } from '../components/typography/ToolHeadline';
import type { ArchitectureNodeSpec, ConnectionSpec, NodeType } from '../diagram/types';
import type { PulseSpec } from '../lib/pulses';

const FLOW: { id: string; label: string; type: NodeType }[] = [
  { id: 'data', label: 'DATA', type: 'database' },
  { id: 'query', label: 'QUERY', type: 'service' },
  { id: 'cache', label: 'CACHE', type: 'database' },
  { id: 'table', label: 'TABLE', type: 'frontend' },
  { id: 'ui', label: 'UI', type: 'frontend' },
];
const FLOW_NODES: ArchitectureNodeSpec[] = FLOW.map((n, i) => ({
  ...n,
  x: 300,
  y: 410 + i * 160,
  width: 250,
  height: 80,
  at: 18 + i * 10,
}));
const FLOW_EDGES: ConnectionSpec[] = FLOW.slice(1).map((n, i) => ({
  from: FLOW[i]!.id,
  to: n.id,
  at: 26 + i * 10,
}));

const MODULES = [
  { id: 'mQuery', label: 'Query', subtitle: 'CACHE · SYNC' },
  { id: 'mRouter', label: 'Router', subtitle: 'ROUTING' },
  { id: 'mTable', label: 'Table', subtitle: 'TABLE' },
  { id: 'mStart', label: 'Start', subtitle: 'FULL-STACK' },
];
const MODULE = { x: 790, width: 290, height: 84, gap: 8, top: 560 };
/** Desalineación inicial de cada módulo antes de acoplarse. */
const LOOSE = [
  { dx: 40, dy: -64 },
  { dx: -34, dy: -22 },
  { dx: 30, dy: 22 },
  { dx: -40, dy: 64 },
];
const DOCK_AT = 104;

/** Primera petición: recorre todo. Luego, aciertos de caché: CACHE → TABLE → UI. */
const CACHE_HITS = [118, 140, 162, 184];
const PULSES: PulseSpec[] = [
  ...[0, 1, 2, 3].map((edge) => ({ edge, start: 70 + edge * 12, duration: 12 })),
  ...CACHE_HITS.flatMap((s) => [
    { edge: 2, start: s, duration: 10 },
    { edge: 3, start: s + 10, duration: 10 },
  ]),
];

export function TanStackScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dock = spring({ frame: frame - DOCK_AT, fps, config: SPRINGS.move });
  const step = MODULE.height + MODULE.gap;

  const modules: ArchitectureNodeSpec[] = MODULES.map((m, i) => ({
    ...m,
    type: 'service',
    x: MODULE.x + LOOSE[i]!.dx * (1 - dock),
    y: MODULE.top + i * step + LOOSE[i]!.dy * (1 - dock),
    width: MODULE.width,
    height: MODULE.height,
    at: 48 + i * 10,
  }));
  const stackHeight = MODULES.length * step - MODULE.gap;

  return (
    <SceneFrame duration={duration} enter="panFromRight">
      <ArchitectureGroup
        box={{
          x: MODULE.x,
          y: MODULE.top - MODULE.height / 2 + stackHeight / 2,
          width: MODULE.width + 36,
          height: stackHeight + 56,
        }}
        build={spring({ frame: frame - DOCK_AT - 14, fps, config: SPRINGS.soft })}
        label="TANSTACK"
      />
      <Diagram
        nodes={[...FLOW_NODES, ...modules]}
        edges={FLOW_EDGES}
        pulses={PULSES}
        signals={{ cache: { hits: CACHE_HITS } }}
      />

      <ToolHeadline condition="Si el dato manda" tool="TanStack" at={10} />
      <Caption
        text={'Más control sobre cómo consultas\ny presentas datos.'}
        at={132}
        color={COLORS.text}
        style={{ position: 'absolute', top: 1120, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
