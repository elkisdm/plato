/**
 * 01 — Hook. Pantalla casi vacía; una red de nodos se conecta lento al fondo.
 * ARQUITECTURA > CÓDIGO; CÓDIGO se encoge. La palabra ARQUITECTURA se reduce
 * hacia el centro del primer nodo (AstroScene la recoge y la vuelve contorno).
 */

import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, FONTS, SPACING, SPRINGS, TYPE } from '../constants/theme';
import { WIDTH } from '../constants/timings';
import { Connection } from '../components/architecture/Connection';
import { SceneFrame } from '../components/motion/SceneFrame';
import { Caption } from '../components/typography/Caption';
import { EASE, progress } from '../lib/motion';
import { edgeCurve } from '../lib/geometry';

/** Centro de la palabra ARQUITECTURA: coincide con el nodo Astro. */
export const WORD_CENTER = { x: 540, y: 530 };
export const WORD_BOX = { width: 860, height: 150 };

const NET = [
  { x: 170, y: 260 },
  { x: 420, y: 330 },
  { x: 880, y: 250 },
  { x: 760, y: 420 },
  { x: 150, y: 980 },
  { x: 390, y: 1100 },
  { x: 900, y: 1060 },
  { x: 660, y: 1180 },
];
const NET_EDGES: [number, number, number][] = [
  [0, 1, 20],
  [1, 3, 42],
  [3, 2, 60],
  [4, 5, 76],
  [5, 7, 96],
  [7, 6, 112],
  [1, 5, 130],
];
const DOT = { width: 16, height: 16 };

function BackgroundNetwork() {
  const frame = useCurrentFrame();
  return (
    <svg
      width={WIDTH}
      height={1350}
      style={{ position: 'absolute', inset: 0, opacity: 0.55 * (1 - progress(frame, 150, 40)) }}
    >
      {NET_EDGES.map(([a, b, at], i) => (
        <Connection
          key={i}
          curve={edgeCurve({ ...NET[a]!, ...DOT }, { ...NET[b]!, ...DOT })}
          progress={progress(frame, at, 40)}
          color={COLORS.border}
        />
      ))}
      {NET.map((p, i) => {
        const on = progress(frame, 8 + i * 9, 20);
        const lit = NET_EDGES.some(([a, b, at]) => (a === i || b === i) && frame > at + 40);
        return (
          <rect
            key={i}
            x={p.x - 8}
            y={p.y - 8}
            width={16}
            height={16}
            rx={4}
            fill={COLORS.surface}
            stroke={lit ? COLORS.accent : COLORS.borderStrong}
            strokeWidth={1.4}
            opacity={on}
          />
        );
      })}
    </svg>
  );
}

export function Intro({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bigIn = spring({ frame: frame - 55, fps, config: SPRINGS.soft });
  const shrinkCode = progress(frame, 86, 22);
  const codeOut = progress(frame, 128, 12);
  // Salida: la palabra se contrae hacia el centro del futuro nodo.
  const morph = progress(frame, 158, duration + 15 - 158, EASE);
  const wordScale = interpolate(morph, [0, 1], [1, 0.3]);

  return (
    <SceneFrame duration={duration} enter="none" exit="none">
      <BackgroundNetwork />

      <Caption
        text="Desarrollar con IA cambió algo para mí."
        at={10}
        out={48}
        size={TYPE.caption + 2}
        color={COLORS.text}
        style={{ position: 'absolute', top: 620, left: SPACING.safeX, right: SPACING.safeX }}
      />

      <div
        style={{
          position: 'absolute',
          left: WORD_CENTER.x - WORD_BOX.width / 2,
          top: WORD_CENTER.y - WORD_BOX.height / 2,
          width: WORD_BOX.width,
          height: WORD_BOX.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.sans,
          fontSize: TYPE.display,
          fontWeight: 700,
          letterSpacing: '-0.045em',
          color: COLORS.text,
          opacity: Math.min(1, bigIn) * (1 - morph),
          filter: `blur(${(1 - Math.min(1, bigIn)) * 10 + morph * 6}px)`,
          transform: `translateY(${(1 - bigIn) * 30}px) scale(${wordScale})`,
        }}
      >
        ARQUITECTURA
      </div>

      <div
        style={{
          position: 'absolute',
          top: 620,
          left: 0,
          width: WIDTH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
          fontFamily: FONTS.sans,
          fontWeight: 700,
          letterSpacing: '-0.045em',
          opacity:
            Math.min(1, spring({ frame: frame - 64, fps, config: SPRINGS.soft })) * (1 - codeOut),
        }}
      >
        <span
          style={{
            fontSize: TYPE.display,
            color: interpolateColors(shrinkCode, [0, 1], [COLORS.textMuted, COLORS.accent]),
          }}
        >
          &gt;
        </span>
        <span
          style={{
            fontSize: TYPE.display,
            color: interpolateColors(shrinkCode, [0, 1], [COLORS.text, COLORS.textMuted]),
            transform: `scale(${interpolate(shrinkCode, [0, 1], [1, 0.42])})`,
            transformOrigin: 'left center',
            display: 'inline-block',
            width: interpolate(shrinkCode, [0, 1], [520, 220]),
          }}
        >
          CÓDIGO
        </span>
      </div>

      <Caption
        text="antes de pedirle a la IA que construya."
        at={96}
        out={128}
        style={{ position: 'absolute', top: 820, left: SPACING.safeX, right: SPACING.safeX }}
      />
      <Caption
        text="Entender arquitectura mejora tu criterio."
        at={134}
        out={170}
        color={COLORS.text}
        style={{ position: 'absolute', top: 720, left: SPACING.safeX, right: SPACING.safeX }}
      />
    </SceneFrame>
  );
}
