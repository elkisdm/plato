/**
 * 02 — Astro. La palabra ARQUITECTURA se contrae en el contorno del nodo
 * Astro. Usuario → Astro → un documento HTML grande y quieto; solo dos islas
 * pequeñas reciben JavaScript por dos ramas finas. Todo se siente liviano.
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, FONTS, SPACING, SPRINGS, TYPE } from '../constants/theme';
import { HEIGHT, WIDTH } from '../constants/timings';
import { AnimatedConnection } from '../components/architecture/AnimatedConnection';
import { BrowserWindow } from '../components/architecture/BrowserWindow';
import { DataPulse } from '../components/architecture/DataPulse';
import { Diagram, boxOf } from '../components/architecture/Diagram';
import { Camera } from '../components/motion/Camera';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { ToolHeadline } from '../components/typography/ToolHeadline';
import { TechBadge } from '../components/ui/TechBadge';
import type { ArchitectureNodeSpec } from '../diagram/types';
import { edgeCurve, type Box } from '../lib/geometry';
import { cameraAt, progress, travel } from '../lib/motion';
import { WORD_BOX, WORD_CENTER } from './Intro';

/** Nodo Astro: lo recoge NextScene para transformarlo en APP. */
export const ASTRO_NODE: ArchitectureNodeSpec = {
  id: 'astro',
  label: 'Astro',
  subtitle: 'SITIO ESTÁTICO',
  x: WORD_CENTER.x,
  y: WORD_CENTER.y,
  width: 300,
  height: 96,
  type: 'frontend',
};

const USER: ArchitectureNodeSpec = {
  id: 'user',
  label: 'Usuario',
  x: 540,
  y: 390,
  width: 230,
  height: 72,
  type: 'user',
  at: 24,
};
const WINDOW: Box = { x: 540, y: 840, width: 720, height: 380 };
const CONTENT_TOP = WINDOW.y - WINDOW.height / 2 + 46;
const CONTENT_LEFT = WINDOW.x - WINDOW.width / 2;
const ISLANDS: (Box & { at: number })[] = [
  { x: 780, y: 742, width: 160, height: 44, at: 108 },
  { x: 330, y: 955, width: 190, height: 50, at: 116 },
];
/** Esqueleto del documento, en coordenadas locales del contenido. */
const SKELETON = [
  { x: 40, y: 28, w: 300, h: 22 },
  { x: 40, y: 80, w: 640, h: 10 },
  { x: 40, y: 104, w: 590, h: 10 },
  { x: 40, y: 128, w: 612, h: 10 },
  { x: 40, y: 172, w: 300, h: 10 },
  { x: 40, y: 196, w: 270, h: 10 },
  { x: 380, y: 166, w: 300, h: 130 },
  { x: 40, y: 306, w: 640, h: 8 },
];

function Island({ box, frame, fps }: { box: Box & { at: number }; frame: number; fps: number }) {
  const p = spring({ frame: frame - box.at, fps, config: SPRINGS.build });
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x - box.width / 2 - CONTENT_LEFT,
        top: box.y - box.height / 2 - CONTENT_TOP,
        width: box.width,
        height: box.height,
        borderRadius: SPACING.radiusSmall,
        background: COLORS.surfaceRaised,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: SPACING.radiusSmall,
          border: `1.5px solid ${COLORS.accent}`,
          background: COLORS.accentWash,
          boxShadow: `0 0 22px ${COLORS.accentGlow}`,
          opacity: Math.min(1, p),
          transform: `scale(${0.9 + 0.1 * p})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.mono,
          fontSize: TYPE.micro - 1,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: COLORS.accent,
        }}
      >
        Isla JS
      </div>
    </div>
  );
}

export function AstroScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // La palabra del hook se vuelve el contorno del nodo.
  const morph = spring({ frame, fps, config: SPRINGS.move });
  const astro: ArchitectureNodeSpec = {
    ...ASTRO_NODE,
    width: interpolate(morph, [0, 1], [WORD_BOX.width, ASTRO_NODE.width!]),
    height: interpolate(morph, [0, 1], [WORD_BOX.height, ASTRO_NODE.height!]),
  };
  const astroBuild = progress(frame, 0, 26);
  const windowBuild = spring({ frame: frame - 64, fps, config: SPRINGS.build });
  const skeleton = (i: number) => progress(frame, 78 + i * 3, 14);

  const toWindow = edgeCurve(boxOf(ASTRO_NODE), WINDOW);
  const toIslands = [
    edgeCurve(boxOf(ASTRO_NODE), ISLANDS[0]!, { fromSide: 'right', toSide: 'top' }),
    edgeCurve(boxOf(ASTRO_NODE), ISLANDS[1]!, { fromSide: 'left', toSide: 'top' }),
  ];
  const pulses = [
    { curve: toWindow, t: travel(frame, 82, 16) },
    { curve: toIslands[0]!, t: travel(frame, 130, 18) },
    { curve: toIslands[1]!, t: travel(frame, 138, 18) },
    { curve: toIslands[0]!, t: travel(frame, 168, 18) },
    { curve: toIslands[1]!, t: travel(frame, 176, 18) },
  ];

  const pose = cameraAt(frame, [
    { frame: 96, x: 540, y: 675, zoom: 1 },
    { frame: 140, x: 540, y: 700, zoom: 1.03 },
    { frame: duration, x: 540, y: 675, zoom: 1 },
  ]);

  return (
    <SceneFrame duration={duration} enter="none">
      <Camera pose={pose}>
        <BrowserWindow box={WINDOW} build={windowBuild} url="html estático">
          {SKELETON.map((r, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: r.x,
                top: r.y,
                width: r.w * skeleton(i),
                height: r.h,
                borderRadius: r.h > 20 ? SPACING.radiusSmall : r.h / 2,
                background: i === 0 ? COLORS.borderStrong : COLORS.border,
              }}
            />
          ))}
          {ISLANDS.map((b, i) => (
            <Island key={i} box={b} frame={frame} fps={fps} />
          ))}
        </BrowserWindow>
        <svg
          width={WIDTH}
          height={HEIGHT}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <AnimatedConnection curve={toWindow} at={56} />
          <AnimatedConnection curve={toIslands[0]!} at={102} color={COLORS.accent} opacity={0.7} />
          <AnimatedConnection curve={toIslands[1]!} at={110} color={COLORS.accent} opacity={0.7} />
          {pulses.map((p, i) => p.t !== null && <DataPulse key={i} curve={p.curve} at={p.t} />)}
        </svg>
        <Diagram
          nodes={[USER, astro]}
          edges={[{ from: 'user', to: 'astro', at: 34 }]}
          pulses={[{ edge: 0, start: 54, duration: 14 }]}
          visuals={{ astro: { build: astroBuild, glow: progress(frame, 100, 20) * 0.8 } }}
        />
      </Camera>

      <ToolHeadline condition="Si el contenido manda" tool="Astro" at={14} />

      <div
        style={{
          position: 'absolute',
          top: 1080,
          left: 0,
          width: WIDTH,
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        {['SEO', 'BLOG', 'LANDING', 'DOCS'].map((l, i) => (
          <TechBadge key={l} label={l} at={132 + i * 5} />
        ))}
      </div>
      <Caption
        text="JavaScript solo donde hace falta."
        at={142}
        color={COLORS.text}
        style={{ position: 'absolute', top: 1150, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
