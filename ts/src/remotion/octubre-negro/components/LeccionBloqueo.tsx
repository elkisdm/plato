import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS, SPACING, WARN, WARN_WASH } from '../constants/theme';
import { fsMinimo } from '../lib/layout';
import { entre } from '../lib/motion';

const IDA = 10;
const VUELTA = 10;
const AVANCE = 46;
const CLAVES = ['API_KEY', 'TOKEN'];

/** 0→1 al chocar con el candado (`IDA` frames) y 1→0 al rebotar (`VUELTA` frames); 0 antes y después. */
export function empujeBloqueado(frame: number, inicio: number): number {
  return entre(frame, inicio, inicio + IDA) * (1 - entre(frame, inicio + IDA, inicio + IDA + VUELTA));
}

/** Candado de línea (forma propia): el arco baja y se cierra con `cierre` 0..1. */
const Candado = ({ cierre }: { cierre: number }) => (
  <svg width={96} height={96} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <g fill="none" stroke={COLORS.accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        transform={`translate(0 ${-3 * (1 - cierre)})`}
      />
      <rect x={5} y={11} width={14} height={9.5} rx={2} fill={COLORS.accentWash} />
    </g>
  </svg>
);

/**
 * Llaves genéricas que empujan hacia una herramienta desconocida y el candado las frena.
 * `golpe` es el frame en que empiezan a empujar (la palabra "claves").
 */
export const LeccionBloqueo = ({ golpe }: { golpe: number }) => {
  const frame = useCurrentFrame();
  const empuje = empujeBloqueado(frame, golpe);
  const cierre = entre(frame, golpe + IDA - 4, golpe + IDA + 2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CLAVES.map((nombre) => (
          <div
            key={nombre}
            style={{
              padding: '16px 28px',
              borderRadius: SPACING.radiusSmall,
              border: `1px solid ${COLORS.borderStrong}`,
              background: COLORS.surfaceRaised,
              fontFamily: FONTS.mono,
              fontSize: fsMinimo(32),
              color: COLORS.text,
              letterSpacing: '0.06em',
              transform: `translateX(${empuje * AVANCE}px)`,
            }}
          >
            {nombre}
          </div>
        ))}
      </div>
      <Candado cierre={cierre} />
      <div
        style={{
          width: 330,
          height: 170,
          borderRadius: SPACING.radius,
          border: `2px dashed ${WARN}`,
          background: WARN_WASH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(30),
          color: WARN,
          lineHeight: 1.3,
        }}
      >
        cualquier
        <br />
        herramienta
      </div>
    </div>
  );
};
