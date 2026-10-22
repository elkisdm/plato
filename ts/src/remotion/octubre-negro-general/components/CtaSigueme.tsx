import { interpolateColors, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../constants/theme';
import { barridoPeriodico, progresoSigueme } from '../lib/golpesFinales';
import { fsMinimo } from '../lib/layout';
import { entre, rebote } from '../lib/motion';
import { MotasFlotando, RafagaChispas } from './ChispasEscena';
import { LetrasCaen, TextoCinetico } from './fx/TextoCinetico';
import { OndaChoque } from './fx/OndaChoque';

const W = 840;
const H = 1250;
const TAMANO = 190;
/** Escala final (texto mínimo 28 px: 56·0,6 ≈ 34) del bloque «comenta PARCHE» cuando entra «sígueme». */
const ESCALA_FINAL = 0.6;
/** Frames de un ciclo del pulso (≈2 s). */
const CICLO = 60;
/** Frames tras «sígueme» en que el botón pasa de «+» a «✓». */
const SIGUE_A_CHECK = 30;

const Y_GRUPO = 230;
/** Centro vertical aproximado de PARCHE dentro del contenedor (de ahí nacen las chispas). */
const Y_PARCHE = Y_GRUPO + 64 * 1.1 + 26 + TAMANO / 2;
const Y_SIGUEME = 560;
const Y_PILL = 760;
const Y_BOTON = 910;
const BOTON_W = 400;
const BOTON_H = 104;

type Props = {
  comenta: number;
  parche: number;
  paso: number;
  sigueme: number;
};

/**
 * Botón de seguir dibujado con formas (sin logo): «+» que gira y se vuelve «✓» con una onda; sigue respirando
 * mientras dura el final.
 */
const BotonSeguir = ({ sigueme }: { sigueme: number }) => {
  const frame = useCurrentFrame();
  const entra = rebote(frame, sigueme + 8, FPS);
  const t0 = sigueme + SIGUE_A_CHECK;
  const giro = entre(frame, t0, t0 + 10);
  const check = entre(frame, t0 + 4, t0 + 14);
  const hecho = giro >= 1 ? 1 : giro;
  const respira = Math.sin(frame / 12);
  const brilloBoton = barridoPeriodico(frame, t0 + 20, 60, 24);
  const fondo = interpolateColors(hecho, [0, 1], [COLORS.accent, COLORS.surfaceRaised]);
  const texto = interpolateColors(hecho, [0, 1], [COLORS.bg, COLORS.accent]);
  const salto = frame >= t0 ? Math.sin(Math.PI * entre(frame, t0, t0 + 10)) * 0.12 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: Y_BOTON,
        left: (W - BOTON_W) / 2,
        width: BOTON_W,
        height: BOTON_H,
        boxSizing: 'border-box',
        borderRadius: 999,
        border: `4px solid ${COLORS.accent}`,
        background: fondo,
        boxShadow: `0 0 ${34 + 12 * respira}px ${COLORS.accentGlow}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        opacity: Math.min(1, entra * 3),
        transform: `scale(${(0.6 + 0.4 * entra) * (1 + salto) * (1 + 0.012 * respira)})`,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ overflow: 'visible' }}>
        <g
          style={{
            transformOrigin: '24px 24px',
            transform: `rotate(${giro * 180}deg) scale(${1 - giro})`,
          }}
        >
          <path d="M24 6v36M6 24h36" stroke={texto} strokeWidth="8" strokeLinecap="round" />
        </g>
        <path
          d="M7 26l12 12 22-26"
          pathLength={1}
          stroke={texto}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - check}
        />
      </svg>
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: fsMinimo(46),
          fontWeight: 800,
          color: texto,
          letterSpacing: '-0.01em',
        }}
      >
        {frame < t0 + 5 ? 'Seguir' : 'Siguiendo'}
      </span>
      {brilloBoton !== null && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            left: `${-30 + brilloBoton * 150}%`,
            width: '24%',
            transform: 'skewX(-20deg)',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
          }}
        />
      )}
    </div>
  );
};

/**
 * Cierre de la serie dentro de un contenedor de 840 px: `comenta` + PARCHE gigante turquesa que cae letra por
 * letra con rebote y un barrido de luz, con chispas turquesa; «te paso una guía paso a paso» debajo y, en
 * `sigueme`, el bloque se reduce y sube para dar paso a SÍGUEME con subrayado que se dibuja, el pill @elkis.dev
 * pulsando y un botón de seguir. Todo sigue en movimiento hasta el último frame. Solo texto y formas.
 */
export const CtaSigueme = ({ comenta, parche, paso, sigueme }: Props) => {
  const frame = useCurrentFrame();
  const p = progresoSigueme(frame, sigueme);
  const escala = 1 - (1 - ESCALA_FINAL) * p;
  const sube = -190 * p;
  const pulso = frame > sigueme + 18 ? Math.sin(((frame - sigueme - 18) / CICLO) * Math.PI * 2) : 0;
  const ent = rebote(frame, sigueme + 4, FPS);
  const brilloParche = 10 + 6 * Math.sin(frame / 10);
  const pill = rebote(frame, sigueme + 10, FPS);

  return (
    <div style={{ position: 'relative', width: W, height: H, fontFamily: FONTS.sans, overflow: 'hidden' }}>
      {/* Fondo: halo turquesa que respira y polvo luminoso */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 120,
          width: W,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.accentGlow}, transparent 65%)`,
          opacity: 0.5 + 0.2 * Math.sin(frame / 22),
          transform: `translateY(${p * 160}px)`,
        }}
      />
      <MotasFlotando n={30} semilla="cta-motas" ancho={W} alto={H} color={COLORS.accent} alfaMax={0.6} />

      <div
        style={{
          position: 'absolute',
          top: Y_GRUPO,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26,
          transformOrigin: 'top center',
          transform: `translateY(${sube}px) scale(${escala})`,
        }}
      >
        <TextoCinetico
          texto="comenta"
          inicio={comenta - 4}
          fontSize={64}
          fontWeight={500}
          color={COLORS.textMuted}
        />
        <div style={{ filter: `drop-shadow(0 0 ${brilloParche}px ${COLORS.accentGlow})` }}>
          <LetrasCaen
            texto="PARCHE"
            inicio={parche - 7}
            escalon={2}
            fontSize={TAMANO}
            color={COLORS.accent}
            brillo
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <TextoCinetico texto="te paso una guía" inicio={paso} escalon={4} fontSize={56} fontWeight={500} />
          <TextoCinetico texto="paso a paso" inicio={paso + 14} escalon={4} fontSize={56} fontWeight={500} />
        </div>
      </div>

      {/* Chispas turquesa al caer PARCHE */}
      <RafagaChispas inicio={parche + 2} x={W / 2} y={Y_PARCHE} color={COLORS.accent} n={26} semilla="parche" />
      <RafagaChispas inicio={parche + 8} x={W / 2} y={Y_PARCHE} color={COLORS.accentSoft} n={14} semilla="parche2" tamano={0.7} />

      {/* SÍGUEME + @elkis.dev + botón */}
      <div
        style={{
          position: 'absolute',
          top: Y_SIGUEME,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, ent * 3),
          transform: `scale(${0.7 + 0.3 * ent})`,
        }}
      >
        <TextoCinetico
          texto="SÍGUEME"
          inicio={sigueme}
          fontSize={150}
          color={COLORS.text}
          subrayado={COLORS.accent}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: Y_PILL,
          left: '50%',
          transform: `translateX(-50%) scale(${(0.6 + 0.4 * pill) * (1 + 0.03 * pulso)})`,
          opacity: Math.min(1, pill * 3),
          padding: '18px 48px',
          borderRadius: 999,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.accentWash,
          boxShadow: `0 0 ${24 + 10 * pulso}px ${COLORS.accentGlow}`,
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(64),
          fontWeight: 600,
          color: COLORS.accent,
          whiteSpace: 'nowrap',
        }}
      >
        @elkis.dev
      </div>
      <BotonSeguir sigueme={sigueme} />

      <OndaChoque
        inicio={sigueme + SIGUE_A_CHECK}
        x={W / 2}
        y={Y_BOTON + BOTON_H / 2}
        color={COLORS.accent}
        tamano={440}
        duracion={18}
        grosor={10}
      />
      <RafagaChispas
        inicio={sigueme + SIGUE_A_CHECK + 2}
        x={W / 2}
        y={Y_BOTON + BOTON_H / 2}
        color={COLORS.accent}
        n={16}
        semilla="seguir"
        tamano={0.8}
      />
    </div>
  );
};
