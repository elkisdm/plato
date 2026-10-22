import type { NodeType } from '../../diagram/types';

/** Glifo de línea por tipo de nodo: diagramático, sin iconografía de marca. */
export function NodeIcon({
  type,
  color,
  size = 30,
}: {
  type: NodeType;
  color: string;
  size?: number;
}) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {type === 'user' && (
        <>
          <circle cx={12} cy={8} r={3.5} {...common} />
          <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" {...common} />
        </>
      )}
      {type === 'frontend' && (
        <>
          <rect x={3} y={4.5} width={18} height={15} rx={2.5} {...common} />
          <path d="M3 9h18" {...common} />
        </>
      )}
      {(type === 'backend' || type === 'service') && (
        <>
          <rect x={4} y={4} width={7} height={7} rx={1.6} {...common} />
          <rect x={13} y={4} width={7} height={7} rx={1.6} {...common} />
          <rect x={4} y={13} width={7} height={7} rx={1.6} {...common} />
          <rect x={13} y={13} width={7} height={7} rx={1.6} {...common} />
        </>
      )}
      {type === 'database' && (
        <>
          <ellipse cx={12} cy={6} rx={7} ry={2.6} {...common} />
          <path
            d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"
            {...common}
          />
        </>
      )}
      {type === 'agent' && (
        <>
          <path d="M12 3.5l7.4 4.25v8.5L12 20.5l-7.4-4.25v-8.5z" {...common} />
          <circle cx={12} cy={12} r={2.4} {...common} />
        </>
      )}
      {type === 'server' && (
        <>
          <rect x={4} y={4} width={16} height={6.5} rx={1.6} {...common} />
          <rect x={4} y={13.5} width={16} height={6.5} rx={1.6} {...common} />
          <path d="M7.5 7.25h3M7.5 16.75h3" {...common} />
        </>
      )}
      {type === 'source' && (
        <>
          <path d="M4 12h11M11 7.5L15.5 12 11 16.5" {...common} />
          <path d="M19 5v14" {...common} />
        </>
      )}
    </svg>
  );
}
