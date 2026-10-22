/**
 * E02 · Mezcla (línea 1). Las 27 fichas entran en ola 3D desde el inicio de la escena. «reales» → las REAL se
 * voltean a turquesa y dibujan su check. Golpe: «exageraciones» → las EXAGERADAS se hinchan, tiemblan y sueltan
 * glitch ámbar (shake + destello + onda). «estos dos días» → la cuadrícula retrocede y la línea de tiempo se
 * dibuja; en «reportado» la ficha 19 OCT cruza con estela y aterriza antes del marcador (golpe + onda).
 */

import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { CuadriculaFichas } from '../components/CuadriculaFichas';
import { Fragmentos } from '../components/Fragmentos';
import { TextoCinetico } from '../components/fx/TextoCinetico';
import { COLORS, FONTS, SPACING, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { fsMinimo, MARGEN_LATERAL, W_V } from '../lib/layout';
import { entrada, entre } from '../lib/motion';
import { posicionVuelo, rastroVuelo } from '../lib/vuelo';
import type { PropsEscena } from './tipos';

const LINEA = 1;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const Y_GRID = 230;
const Y_LINEA = 1280;
const X_MARCA = 560;
const FICHA = { ancho: 250, alto: 100 };
/** Centro final de la ficha 19 OCT: sobre la línea, antes del marcador. */
const DESTINO = { x: 355, y: Y_LINEA };
const ORIGEN = { x: 930, y: 300 };
const VUELO = 14;
const MARCAS_X = [150, 230, 310, 390, 470];

export const E02Mezcla = ({ desde }: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tReales = ancla('reales.');
  const golpe = ancla('exageraciones.');
  const tEstos = ancla('estos');
  const tReportado = ancla('reportado');
  const tAntes = ancla('antes.');

  const retrocede = entrada(frame, tEstos, 12);
  const marca = spring({ frame: frame - tEstos, fps, config: { damping: 12, stiffness: 120 } });
  const linea = entre(frame, tEstos, tEstos + 16);

  const aterriza = tReportado;
  const ini = aterriza - VUELO;
  const pos = posicionVuelo(frame, ini, aterriza, ORIGEN, DESTINO);
  const rastro = rastroVuelo(frame, ini, aterriza, ORIGEN, DESTINO, 6);
  const kF = spring({ frame: frame - aterriza, fps, config: { damping: 7, stiffness: 160, mass: 0.7 } });
  const enVuelo = frame >= ini;
  const giro = frame < aterriza ? -22 * (1 - entre(frame, ini, aterriza)) : 0;
  const escalaF = frame < aterriza ? 1.25 - 0.25 * entre(frame, ini, aterriza) : 1 + 0.2 * Math.max(0, 1 - kF);

  const fichaFecha = (cx: number, cy: number, opacidad: number, escala: number, rot: number, glow: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx - FICHA.ancho / 2,
        top: cy - FICHA.alto / 2,
        width: FICHA.ancho,
        height: FICHA.alto,
        boxSizing: 'border-box',
        borderRadius: SPACING.radius,
        border: `3px solid ${COLORS.accent}`,
        background: COLORS.bg,
        boxShadow: `0 0 ${28 + glow}px ${COLORS.accentGlow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.mono,
        fontSize: 52,
        fontWeight: 800,
        color: COLORS.accent,
        opacity: opacidad,
        transform: `rotate(${rot}deg) scale(${escala})`,
      }}
    >
      19 OCT
    </div>
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          opacity: 1 - 0.78 * retrocede,
          filter: `blur(${3 * retrocede}px)`,
          transform: `scale(${1 - 0.07 * retrocede})`,
          transformOrigin: '540px 640px',
        }}
      >
        <CuadriculaFichas y0={Y_GRID} inicioOla={desde + 2} tReales={tReales} golpe={golpe} />
      </div>

      {/* Línea de tiempo: se dibuja desde la izquierda hasta el marcador */}
      <div
        style={{
          position: 'absolute',
          left: MARGEN_LATERAL,
          top: Y_LINEA - 1.5,
          width: (X_MARCA - MARGEN_LATERAL) * linea,
          height: 3,
          background: COLORS.line,
          boxShadow: `0 0 14px ${COLORS.line}`,
        }}
      />
      {MARCAS_X.map((x, i) => {
        const a = entre(frame, tEstos + 4 + i * 2, tEstos + 12 + i * 2);
        return (
          <div
            key={x}
            style={{ position: 'absolute', left: x - 1.5, top: Y_LINEA - 12 * a, width: 3, height: 24 * a, borderRadius: 2, background: COLORS.line }}
          />
        );
      })}
      {/* Pulso de luz que viaja por la línea (nunca queda quieta) */}
      {linea >= 1 ? (
        <div
          style={{
            position: 'absolute',
            left: MARGEN_LATERAL + ((frame / 36) % 1) * (X_MARCA - MARGEN_LATERAL) - 30,
            top: Y_LINEA - 2,
            width: 60,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: X_MARCA,
          top: Y_LINEA - 60,
          width: W_V - MARGEN_LATERAL - X_MARCA,
          height: 120,
          boxSizing: 'border-box',
          borderLeft: `4px solid ${WARN}`,
          borderRadius: `0 ${SPACING.radius}px ${SPACING.radius}px 0`,
          background: WARN_WASH,
          boxShadow: `0 0 ${14 + 8 * Math.sin(frame / 8)}px ${WARN_GLOW}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          fontWeight: 700,
          color: WARN,
          opacity: Math.min(1, marca * 1.5),
          transform: `translateX(${(1 - Math.min(1.1, marca)) * 120}px)`,
        }}
      >
        ESTOS DOS DÍAS
      </div>

      {/* Estela y ficha 19 OCT */}
      {rastro.map((r, i) => fichaFecha(r.x, r.y, r.opacidad * 0.7, 1.2 - 0.04 * i, giro * 1.1, 0))}
      {enVuelo ? fichaFecha(pos.x, pos.y, entrada(frame, ini, 3), escalaF, giro, 20 * Math.max(0, 1 - kF)) : null}
      <Fragmentos inicio={aterriza} x={DESTINO.x} y={DESTINO.y} color={COLORS.accent} semilla="e02-fecha" cantidad={12} velocidad={14} gravedad={0.5} />

      <div style={{ position: 'absolute', left: DESTINO.x - 200, top: Y_LINEA + 70, width: 400, display: 'flex', justifyContent: 'center' }}>
        <TextoCinetico texto="ANTES" inicio={tAntes} fontSize={fsMinimo(40)} fontWeight={800} />
      </div>
    </AbsoluteFill>
  );
};
