/**
 * 06 — Latencia. Del sistema se separan Vercel, VPS y Supabase; el resto se
 * retira. Supabase queda lejos (BRASIL): cada SELECT/INSERT/UPDATE hace ida y
 * vuelta lenta y acumula "+latencia". Luego Supabase se muda junto al
 * compute, las líneas se acortan y los mismos viajes pasan en un parpadeo.
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { SPACING, SPRINGS, TYPE } from '../constants/theme';
import { Diagram } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { Headline } from '../components/typography/Headline';
import { Callout } from '../components/ui/Callout';
import { LatencyIndicator } from '../components/ui/LatencyIndicator';
import { RegionBadge } from '../components/ui/RegionBadge';
import { BUILT_EDGES, BUILT_NODES, SYSTEM_POSES } from '../diagram/system';
import type { ArchitectureNodeSpec, ConnectionSpec } from '../diagram/types';
import type { Point } from '../lib/geometry';
import { cameraAt, progress } from '../lib/motion';
import type { PulseSpec } from '../lib/pulses';

const KEEP = ['crm', 'vps', 'supa'];
/** Posiciones separadas (compute en USA, datos en Brasil) y la mudanza final. */
const APART: Record<string, Point> = {
  crm: { x: 300, y: 520 },
  vps: { x: 300, y: 800 },
  supa: { x: 800, y: 1030 },
};
const CLOSE: Point = { x: 720, y: 660 };
const SPLIT_AT = 16;
const MOVE_AT = 188;

const EDGES: ConnectionSpec[] = [
  ...BUILT_EDGES,
  { from: 'crm', to: 'supa', direction: 'two-way', at: 40 },
];
const VPS_SUPA = EDGES.findIndex((e) => e.from === 'vps' && e.to === 'supa');
const CRM_SUPA = EDGES.length - 1;

function roundTrip(edge: number, start: number, leg: number, label?: string): PulseSpec[] {
  return [
    { edge, start, duration: leg, label },
    { edge, start: start + leg, duration: leg, reverse: true, label },
  ];
}
const OPS: [number, string][] = [
  [CRM_SUPA, 'SELECT'],
  [VPS_SUPA, 'SELECT'],
  [CRM_SUPA, 'INSERT'],
  [VPS_SUPA, 'UPDATE'],
];
const SLOW_LEG = 32;
const SLOW = OPS.flatMap(([edge, label], i) => roundTrip(edge, 62 + i * 18, SLOW_LEG, label));
// En la fase rápida las líneas son tan cortas que la etiqueta taparía el nodo: solo el pulso.
const FAST = OPS.flatMap(([edge], i) => roundTrip(edge, 218 + i * 8, 7));
/** Cada ida y vuelta lenta que se completa suma un "+latencia". */
const SLOW_RETURNS = OPS.map((_, i) => 62 + i * 18 + SLOW_LEG * 2);

export function LatencyScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const split = spring({ frame: frame - SPLIT_AT, fps, config: SPRINGS.move });
  const move = spring({ frame: frame - MOVE_AT, fps, config: SPRINGS.move });
  const retire = 1 - progress(frame, 14, 22);

  const lerp = (a: Point, b: Point, t: number): Point => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const nodes: ArchitectureNodeSpec[] = BUILT_NODES.map((n) => {
    if (!KEEP.includes(n.id)) return n;
    let p = lerp(n, APART[n.id]!, split);
    if (n.id === 'supa') p = lerp(p, CLOSE, move);
    return n.id === 'crm'
      ? { ...n, ...p, label: 'Vercel', subtitle: 'CRM · NEXT.JS' }
      : { ...n, ...p };
  });
  const at = (id: string) => nodes.find((n) => n.id === id)!;
  const badge = (id: string) => ({ x: at(id).x, y: at(id).y - (at(id).height ?? 88) / 2 - 30 });

  const visuals = Object.fromEntries(
    BUILT_NODES.filter((n) => !KEEP.includes(n.id)).map((n) => [n.id, { emphasis: retire }]),
  );

  const pose = cameraAt(frame, [
    { frame: 14, ...SYSTEM_POSES.wide },
    { frame: 44, x: 540, y: 675, zoom: 1 },
  ]);
  const regionsIn = (i: number) => progress(frame, 44 + i * 6, 12);
  const moved = progress(frame, MOVE_AT + 8, 16);

  return (
    <SceneFrame duration={duration} enter="none">
      <Camera pose={pose}>
        <Diagram
          nodes={nodes}
          edges={EDGES}
          pulses={[...SLOW, ...FAST]}
          hidden={
            frame > 36 ? BUILT_NODES.filter((n) => !KEEP.includes(n.id)).map((n) => n.id) : []
          }
          visuals={{
            ...visuals,
            crm: {
              previous: { label: 'CRM', subtitle: 'NEXT.JS · TANSTACK' },
              swap: progress(frame, 22, 16),
            },
            vps: { glow: moved * 0.6 },
            supa: { glow: moved * 0.6 },
          }}
        />
        <RegionBadge region="USA" {...badge('crm')} opacity={regionsIn(0)} />
        <RegionBadge region="USA" {...badge('vps')} opacity={regionsIn(1)} />
        <RegionBadge
          region="USA"
          previous="BRASIL"
          swap={moved}
          {...badge('supa')}
          opacity={regionsIn(2)}
          highlight={moved}
        />
        <LatencyIndicator x={760} y={430} arrivals={SLOW_RETURNS} clearAt={MOVE_AT - 4} />
      </Camera>

      <Caption
        text={'Y aquí aparece algo que\nnunca había considerado.'}
        at={40}
        out={116}
        size={TYPE.caption + 2}
        style={{ position: 'absolute', top: 160, left: SPACING.safeX, right: SPACING.safeX }}
      />
      <Headline
        text="LA REGIÓN IMPORTA."
        at={120}
        size={TYPE.headline + 14}
        weight={750}
        accent={['REGIÓN']}
        style={{
          position: 'absolute',
          top: 170,
          left: SPACING.safeX,
          right: SPACING.safeX,
          transform: `scale(${interpolate(progress(frame, 120, 20), [0, 1], [1.04, 1])})`,
        }}
      />
      <Callout
        rule="Compute cerca de los datos."
        detail="Cada ida y vuelta cuenta."
        at={222}
        style={{ position: 'absolute', top: 1040, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
