/**
 * E02 · Lista (línea 1). Cuadrícula de 27 fichas ámbar tenue bajo OCTUBRE NEGRO. En cada nombre
 * (PHP, Railway, NGINX, Signal, banco de la India) una ficha se enciende con su etiqueta mono.
 * Golpe: "grave" → las 27 se encienden a la vez.
 */

import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { FichasLista, type EstadoFicha } from '../components/FichasLista';
import { COLORS, FONTS, FPS, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { MARGEN_LATERAL_FICHAS } from '../lib/fichas27';
import { entrada, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 1;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const Y_TITULO = 230;
const Y_GRID = 470;
const Y_JUNTO = 1385;
const Y_GRAVE = 1450;

export const E02Lista = (_: PropsEscena) => {
  const frame = useCurrentFrame();

  const tLlaman = ancla('llaman');
  const tOctubre = ancla('Octubre');
  const tNegro = ancla('Negro.');
  const tTodo = ancla('Todo');
  const golpe = ancla('grave.');

  /** Ficha → palabra que la enciende y etiqueta (líneas de texto con su propia ancla). */
  const NOMBRADAS: Record<number, { lineas: [string, number][] }> = {
    2: { lineas: [['PHP', ancla('PHP,')]] },
    8: { lineas: [['Railway', ancla('Railway,')]] },
    5: { lineas: [['NGINX', ancla('NGINX,')]] },
    17: { lineas: [['Signal', ancla('Signal,')]] },
    24: {
      lineas: [
        ['Banco', ancla('banco')],
        ['India', ancla('India.')],
      ],
    },
  };

  const kGolpe = rebote(frame, golpe, FPS);
  const pulso = Math.max(0, kGolpe - 1);

  const estado = (i: number): EstadoFicha => {
    const aparece = entrada(frame, tLlaman + i * 2, 8);
    const nombrada = NOMBRADAS[i];
    const tEnciende = nombrada ? nombrada.lineas[0]![1] : Infinity;
    const encendida = Math.max(entrada(frame, tEnciende, 6), entrada(frame, golpe, 4));
    const lineasVisibles = (nombrada?.lineas ?? [])
      .filter(([, t]) => frame >= t)
      .map(([texto]) => texto);
    return {
      borde: WARN,
      fondo: encendida > 0.01 ? WARN_WASH : 'transparent',
      opacidad: aparece * (0.3 + 0.7 * encendida),
      brillo: encendida,
      brilloColor: WARN_GLOW,
      escala: 1 + 0.5 * pulso + (nombrada && frame < golpe ? 0.06 * entrada(frame, tEnciende, 6) : 0),
      etiqueta: lineasVisibles,
    };
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_TITULO,
          textAlign: 'center',
          fontFamily: FONTS.sans,
          fontSize: 100,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: COLORS.text,
        }}
      >
        <span style={{ opacity: entrada(frame, tOctubre, 8) }}>OCTUBRE</span>{' '}
        <span
          style={{
            opacity: entrada(frame, tNegro, 8),
            color: WARN,
            textShadow: `0 0 50px ${WARN_GLOW}`,
          }}
        >
          NEGRO
        </span>
      </div>

      <FichasLista variante="grande" x0={MARGEN_LATERAL_FICHAS} y0={Y_GRID} estado={estado} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_JUNTO,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 40,
          letterSpacing: '0.08em',
          color: COLORS.textMuted,
          opacity: entrada(frame, tTodo, 8),
        }}
      >
        TODO JUNTO
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_GRAVE,
          textAlign: 'center',
          fontFamily: FONTS.sans,
          fontSize: 150,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: WARN,
          textShadow: `0 0 70px ${WARN_GLOW}`,
          opacity: entrada(frame, golpe, 4),
          transform: `scale(${0.6 + 0.4 * kGolpe})`,
        }}
      >
        GRAVE
      </div>
    </AbsoluteFill>
  );
};
