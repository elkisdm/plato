import type { CSSProperties } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS, FONTS, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { claseFicha, MARGEN_LATERAL_FICHAS, posicionFicha, REALES, retrasoOla, TOTAL_FICHAS } from '../lib/fichas27';
import { temblor } from '../lib/glitch';
import { fsMinimo } from '../lib/layout';
import { entre } from '../lib/motion';
import { Fragmentos } from './Fragmentos';

type Props = {
  y0: number;
  /** Frame global de inicio de la ola de entrada. */
  inicioOla: number;
  /** Frame en que la primera ficha REAL se voltea. */
  tReales: number;
  /** Frame del golpe en que las EXAGERADAS se hinchan. */
  golpe: number;
};

const CAPA_ENTRADA = { damping: 11, stiffness: 110, mass: 0.8 };
const CARA: CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', boxSizing: 'border-box', borderRadius: 14 };

/** Las 27 fichas: ola 3D de entrada, REAL que se voltea con check dibujado y EXAGERADO que se hincha, tiembla y suelta glitch. */
export const CuadriculaFichas = ({ y0, inicioOla, tReales, golpe }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {/* Capa de fondo: contornos desenfocados más grandes con paralaje */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(5px)',
          opacity: 0.2 * Math.min(1, entre(frame, inicioOla, inicioOla + 12)),
          transform: `translate(${Math.sin(frame / 40) * 10}px, ${Math.cos(frame / 50) * 8}px) scale(1.12)`,
          transformOrigin: `540px ${y0 + 440}px`,
        }}
      >
        {Array.from({ length: TOTAL_FICHAS }, (_, i) => {
          const p = posicionFicha(i, MARGEN_LATERAL_FICHAS, y0);
          return (
            <div
              key={i}
              style={{ position: 'absolute', left: p.x, top: p.y, width: p.ancho, height: p.alto, borderRadius: 14, border: `2px solid ${WARN}` }}
            />
          );
        })}
      </div>

      {Array.from({ length: TOTAL_FICHAS }, (_, i) => {
        const p = posicionFicha(i, MARGEN_LATERAL_FICHAS, y0);
        const clase = claseFicha(i);
        const s = spring({ frame: frame - inicioOla - retrasoOla(i) * 1.5, fps, config: CAPA_ENTRADA });
        const aparece = Math.min(1, s * 2.5);
        const flota = Math.sin(frame / 18 + i * 0.9) * 4;
        // Ola de brillo que recorre la cuadrícula en diagonal: nada queda quieto entre eventos.
        const brilla = 0.5 + 0.5 * Math.sin(retrasoOla(i) * 0.7 - frame / 5);

        const rIdx = REALES.indexOf(i);
        const tReal = tReales + Math.round(rIdx * 1.6);
        const flip = rIdx >= 0 ? spring({ frame: frame - tReal, fps, config: { damping: 13, stiffness: 140, mass: 0.7 } }) : 0;
        const check = entre(frame, tReal + 7, tReal + 16);

        const exag = clase === 'exagerada';
        const kE = spring({ frame: frame - golpe, fps, config: { damping: 6, stiffness: 150, mass: 0.7 } });
        const t = exag ? temblor(frame, golpe, i) : { dx: 0, dy: 0, rot: 0, corte: 0 };
        const hinchada = exag && frame >= golpe;
        const escala = hinchada ? 1 + 0.2 * kE : 1;

        const caraNeutra = (
          <div style={{ ...CARA, border: `2px solid ${WARN}`, background: hinchada ? WARN_WASH : 'transparent', opacity: hinchada ? 1 : 0.5 + 0.35 * brilla, boxShadow: hinchada ? `0 0 ${30 * kE}px ${WARN_GLOW}` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {hinchada ? (
              <span style={{ fontFamily: FONTS.mono, fontSize: fsMinimo(28), fontWeight: 700, letterSpacing: '-0.07em', color: WARN, whiteSpace: 'nowrap' }}>EXAGERADO</span>
            ) : (
              <>
                <div style={{ width: '58%', height: 10, borderRadius: 5, background: COLORS.textMuted, opacity: 0.55 }} />
                <div style={{ width: '38%', height: 10, borderRadius: 5, background: COLORS.textMuted, opacity: 0.55 }} />
              </>
            )}
          </div>
        );

        return (
          <div
            key={i}
            style={{ position: 'absolute', left: p.x, top: p.y, width: p.ancho, height: p.alto, perspective: 700, opacity: aparece, zIndex: hinchada ? 5 : 1 }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transform: `translate(${t.dx}px, ${flota + t.dy + (1 - Math.min(1, s)) * 50}px) rotateX(${(1 - Math.min(1, s)) * -85}deg) rotateY(${flip * 180}deg) rotate(${t.rot}deg) scale(${escala})`,
              }}
            >
              <div style={{ ...CARA }}>{caraNeutra}</div>
              {rIdx >= 0 ? (
                <div
                  style={{
                    ...CARA,
                    transform: 'rotateY(180deg)',
                    border: `3px solid ${COLORS.accent}`,
                    background: COLORS.accentWash,
                    boxShadow: `0 0 ${26 * Math.min(1, flip)}px ${COLORS.accentGlow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <svg width={48} height={40} viewBox="0 0 48 40">
                    <path
                      d="M6 21 L19 33 L42 7"
                      pathLength={1}
                      fill="none"
                      stroke={COLORS.accent}
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={1}
                      strokeDashoffset={1 - check}
                    />
                  </svg>
                  <span style={{ fontFamily: FONTS.mono, fontSize: fsMinimo(28), fontWeight: 700, letterSpacing: '-0.07em', color: COLORS.accent }}>REAL</span>
                </div>
              ) : null}
              {/* Glitch: copias del contorno desplazadas en turquesa y ámbar */}
              {hinchada && (t.corte !== 0 || frame - golpe < 12) ? (
                <>
                  <div style={{ ...CARA, border: `3px solid ${COLORS.accent}`, opacity: 0.55, transform: `translateX(${-6 - Math.abs(t.corte) * 0.3}px)`, mixBlendMode: 'screen' }} />
                  <div style={{ ...CARA, border: `3px solid ${WARN}`, opacity: 0.6, transform: `translateX(${6 + Math.abs(t.corte) * 0.3}px)`, mixBlendMode: 'screen' }} />
                  <div style={{ position: 'absolute', left: -8, right: -8, top: `${40 + (i % 3) * 14}%`, height: 14, background: WARN, opacity: 0.55, transform: `translateX(${t.corte}px)` }} />
                </>
              ) : null}
            </div>
            {exag ? (
              <Fragmentos
                inicio={golpe}
                x={p.ancho / 2}
                y={p.alto / 2}
                color={WARN}
                semilla={`e02-glitch-${i}`}
                cantidad={7}
                velocidad={9}
                gravedad={0.3}
                vida={18}
                tamano={11}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
};
