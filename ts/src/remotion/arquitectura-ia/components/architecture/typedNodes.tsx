import { useCurrentFrame } from 'remotion';

import type { ArchitectureNodeSpec, NodeSignals } from '../../diagram/types';
import { progress } from '../../lib/motion';
import { ArchitectureNode, type NodeVisuals } from './ArchitectureNode';

type TypedNodeProps = { node: ArchitectureNodeSpec; signals?: NodeSignals } & NodeVisuals;

/** Campana corta (0 → 1 → 0) que empieza en cada llegada. */
function bell(frame: number, hits: number[], length: number): number {
  let v = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d <= length) v = Math.max(v, Math.sin((d / length) * Math.PI));
  }
  return v;
}

/** Base de datos: late un 3 % con cada petición que llega; check cuando Auth valida. */
export function DatabaseNode({ signals, ...props }: TypedNodeProps) {
  const frame = useCurrentFrame();
  return (
    <ArchitectureNode
      {...props}
      bump={bell(frame, signals?.hits ?? [], 10)}
      glow={Math.max(props.glow ?? 0, 0.6 * bell(frame, signals?.hits ?? [], 14))}
      check={signals?.checkAt === undefined ? 0 : progress(frame, signals.checkAt, 10)}
    />
  );
}

/** Agente: tres puntos mientras procesa lo que le llegó. */
export function AgentNode({ signals, ...props }: TypedNodeProps) {
  const frame = useCurrentFrame();
  const busy = (signals?.busy ?? []).some((f) => frame >= f && frame < f + 24);
  return <ArchitectureNode {...props} busy={busy} />;
}

/** Servidor: status dot de gris a verde cuando queda en línea. */
export function ServerNode({ signals, ...props }: TypedNodeProps) {
  const frame = useCurrentFrame();
  const online = signals?.onlineAt === undefined ? 1 : progress(frame, signals.onlineAt, 10);
  return <ArchitectureNode {...props} status={online} />;
}

/** Elige el nodo con la microinteracción que corresponde a su tipo. */
export function NodeByType(props: TypedNodeProps) {
  const frame = useCurrentFrame();
  switch (props.node.type) {
    case 'database':
      return <DatabaseNode {...props} />;
    case 'agent':
      return <AgentNode {...props} />;
    case 'server':
      return <ServerNode {...props} />;
    default: {
      const { signals, ...rest } = props;
      const check = signals?.checkAt === undefined ? 0 : progress(frame, signals.checkAt, 10);
      return <ArchitectureNode {...rest} check={check} />;
    }
  }
}
