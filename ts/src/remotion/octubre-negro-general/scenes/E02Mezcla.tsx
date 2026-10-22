/**
 * E02 · Mezcla (línea 1). Cuadrícula de 27 fichas. «reales» → algunas pasan a turquesa con etiqueta
 * REAL. Golpe: «exageraciones» → otras se hinchan en ámbar con etiqueta EXAGERADO. En «reportado» una
 * ficha 19 OCT cae a la izquierda del marcador ESTOS DOS DÍAS (la grilla se atenúa en «estos»).
 */

import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { GrupoFichas, type EstadoFicha } from '../components/GrupoFichas';
import {
  COLORS,
  FONTS,
  FPS,
  SPACING,
  WARN,
  WARN_GLOW,
  WARN_WASH,
} from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { claseFicha, MARGEN_LATERAL_FICHAS } from '../lib/fichas27';
import { fsMinimo, MARGEN_LATERAL, W_V } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 1;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const Y_GRID = 230;
const Y_LINEA = 1280;
const X_MARCA = 560;
const FICHA_FECHA = { x: 230, ancho: 250, alto: 100, yFinal: Y_LINEA - 50 };

export const E02Mezcla = (_: PropsEscena) => {
  const frame = useCurrentFrame();

  const tVarios = ancla('Varios');
  const tReales = ancla('reales.');
  const golpe = ancla('exageraciones.');
  const tEstos = ancla('estos');
  const tReportado = ancla('reportado');
  const tAntes = ancla('antes.');

  const kGolpe = rebote(frame, golpe, FPS);
  const kFecha = rebote(frame, tReportado, FPS);
  const atenuada = 1 - 0.75 * entrada(frame, tEstos, 10);

  const estado = (i: number): EstadoFicha => {
    const aparece = entrada(frame, tVarios + i, 8);
    const clase = claseFicha(i);
    const interior = i % 5 >= 1 && i % 5 <= 3;
    const tReal = tReales + Math.floor(i / 2);
    const real = clase === 'real' ? entrada(frame, tReal, 6) : 0;
    const exagerada = clase === 'exagerada' ? entrada(frame, golpe, 4) : 0;
    const base: EstadoFicha = {
      borde: WARN,
      fondo: 'transparent',
      opacidad: aparece * 0.4 * atenuada,
      brillo: 0,
      brilloColor: WARN_GLOW,
    };
    if (real > 0.01) {
      return {
        ...base,
        borde: COLORS.accent,
        fondo: COLORS.accentWash,
        opacidad: aparece * (0.4 + 0.6 * real) * atenuada,
        brillo: interior ? real : 0,
        brilloColor: COLORS.accentGlow,
        escala: interior ? 1 + 0.04 * real : 1,
        etiqueta: 'REAL',
        etiquetaColor: COLORS.accent,
      };
    }
    if (exagerada > 0.01) {
      return {
        ...base,
        fondo: WARN_WASH,
        opacidad: aparece * (0.4 + 0.6 * exagerada) * atenuada,
        brillo: interior ? exagerada : 0,
        escala: 1 + 0.12 * kGolpe,
        etiqueta: 'EXAGERADO',
        etiquetaColor: WARN,
      };
    }
    return base;
  };

  const marca = entrada(frame, tEstos, 10);
  const yFicha = FICHA_FECHA.yFinal - (1 - Math.min(1.15, kFecha)) * 260;

  return (
    <AbsoluteFill>
      <GrupoFichas x0={MARGEN_LATERAL_FICHAS} y0={Y_GRID} estado={estado} />

      <div
        style={{
          position: 'absolute',
          left: MARGEN_LATERAL,
          top: Y_LINEA,
          width: X_MARCA - MARGEN_LATERAL,
          height: 3,
          background: COLORS.line,
          opacity: marca,
        }}
      />
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
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          fontWeight: 700,
          color: WARN,
          opacity: marca,
          transform: `translateX(${(1 - marca) * 30}px)`,
        }}
      >
        ESTOS DOS DÍAS
      </div>

      <div
        style={{
          position: 'absolute',
          left: FICHA_FECHA.x,
          top: yFicha,
          width: FICHA_FECHA.ancho,
          height: FICHA_FECHA.alto,
          boxSizing: 'border-box',
          borderRadius: SPACING.radius,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.bg,
          boxShadow: `0 0 28px ${COLORS.accentGlow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.mono,
          fontSize: 52,
          fontWeight: 800,
          color: COLORS.accent,
          opacity: entrada(frame, tReportado, 4),
        }}
      >
        19 OCT
      </div>
      <div
        style={{
          position: 'absolute',
          left: FICHA_FECHA.x,
          top: Y_LINEA + 70,
          width: FICHA_FECHA.ancho,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          letterSpacing: '0.1em',
          color: COLORS.text,
          opacity: entrada(frame, tAntes, 8),
        }}
      >
        ANTES
      </div>
    </AbsoluteFill>
  );
};
