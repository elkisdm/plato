import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { DURATIONS, SPRINGS } from '../../constants/theme';
import { HEIGHT, WIDTH } from '../../constants/timings';
import {
  NODE_DEFAULTS,
  type ArchitectureNodeSpec,
  type ConnectionSpec,
  type NodeSignals,
} from '../../diagram/types';
import { edgeCurve, type Box } from '../../lib/geometry';
import { travel } from '../../lib/motion';
import { arrivals, type PulseSpec } from '../../lib/pulses';
import type { NodeVisuals } from './ArchitectureNode';
import { AnimatedConnection } from './AnimatedConnection';
import { Connection } from './Connection';
import { DataPulse } from './DataPulse';
import { NodeByType } from './typedNodes';

export function boxOf(node: ArchitectureNodeSpec): Box {
  return {
    x: node.x,
    y: node.y,
    width: node.width ?? NODE_DEFAULTS.width,
    height: node.height ?? NODE_DEFAULTS.height,
  };
}

/**
 * Renderiza un diagrama declarativo: nodos que se construyen en su `at`,
 * conexiones calculadas desde los nodos (si un nodo se mueve, la línea se
 * estira sola) y pulsos de datos. Las llegadas de los pulsos alimentan las
 * microinteracciones (la DB late, el agente procesa).
 */
export function Diagram({
  nodes,
  edges,
  pulses = [],
  signals = {},
  visuals = {},
  hidden = [],
}: {
  nodes: ArchitectureNodeSpec[];
  edges: ConnectionSpec[];
  pulses?: PulseSpec[];
  signals?: Record<string, NodeSignals>;
  visuals?: Record<string, Partial<NodeVisuals>>;
  hidden?: string[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const get = (id: string) => {
    const n = byId.get(id);
    if (!n) throw new Error(`Conexión hacia un nodo inexistente: ${id}`);
    return n;
  };
  const emphasisOf = (id: string) => visuals[id]?.emphasis ?? 1;
  const isHidden = (id: string) => hidden.includes(id);
  const arrived = arrivals(pulses, edges);

  return (
    <>
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        {edges.map((e, i) => {
          if (isHidden(e.from) || isHidden(e.to)) return null;
          const curve = edgeCurve(boxOf(get(e.from)), boxOf(get(e.to)), e);
          const opacity = Math.min(emphasisOf(e.from), emphasisOf(e.to));
          return e.at === undefined || e.animated === false ? (
            <Connection key={i} curve={curve} direction={e.direction} opacity={opacity} />
          ) : (
            <AnimatedConnection
              key={i}
              curve={curve}
              at={e.at}
              direction={e.direction}
              opacity={opacity}
            />
          );
        })}
        {pulses.map((p, i) => {
          const e = edges[p.edge];
          if (!e || isHidden(e.from) || isHidden(e.to)) return null;
          if (e.at !== undefined && frame < e.at + DURATIONS.edgeDraw) return null;
          const t = travel(frame, p.start, p.duration);
          if (t === null) return null;
          const curve = edgeCurve(boxOf(get(e.from)), boxOf(get(e.to)), e);
          return (
            <DataPulse
              key={i}
              curve={curve}
              at={t}
              reverse={p.reverse}
              label={p.label}
              opacity={Math.min(emphasisOf(e.from), emphasisOf(e.to))}
            />
          );
        })}
      </svg>
      {nodes.map((n) => {
        if (isHidden(n.id)) return null;
        const build =
          n.at === undefined ? 1 : spring({ frame: frame - n.at, fps, config: SPRINGS.build });
        const s = signals[n.id] ?? {};
        const extra = arrived[n.id] ?? [];
        return (
          <NodeByType
            key={n.id}
            node={n}
            build={build}
            signals={{
              ...s,
              hits: [...(s.hits ?? []), ...extra],
              busy: [...(s.busy ?? []), ...extra],
            }}
            {...visuals[n.id]}
          />
        );
      })}
    </>
  );
}
