/**
 * E04 · Mezcla (línea 3). Dos columnas, HECHOS (turquesa) y TITULARES (ámbar). Golpe: "mezcla"
 * (la segunda, «esa mezcla te lleva a…») → las columnas colapsan en una sola lista. En "ciegas" la lista
 * se desenfoca; en "rotar todo" y "no tocar nada" salen dos flechas ámbar.
 */

import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS, H, SPACING, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, normalizar, palabra, PALABRAS } from '../lib/alineacion';
import { ITEMS_POR_COLUMNA, slotDeItem } from '../lib/mezcla';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 3;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

const COLUMNA = { ancho: 390, xHechos: 120, xTitulares: 570 };
const UNIDA = { x: 330, ancho: 420 };
const Y_ITEMS = 420;
const ALTO_ITEM = 80;
const GAP_ITEM = 24;
const ALTO_UNIDO = 44;
const GAP_UNIDO = 14;
const Y_FLECHAS_DESDE = 1010;
const Y_CHIPS = 1300;
const CHIP = { ancho: 380, alto: 100 };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Curva de una flecha desde la lista hasta su chip. */
const flecha = (xFin: number) =>
  `M 540 ${Y_FLECHAS_DESDE} C 540 ${Y_FLECHAS_DESDE + 120}, ${xFin} ${Y_CHIPS - 160}, ${xFin} ${Y_CHIPS - 12}`;

export const E04Mezcla = (_: PropsEscena) => {
  const frame = useCurrentFrame();

  const tHechos = ancla('hechos');
  const tTitulares = ancla('titulares');
  const golpe = aFrame(
    PALABRAS.filter((w) => w.linea === LINEA && normalizar(w.texto) === 'mezcla')[1]!.inicio,
  );
  const tRotar = ancla('rotar');
  const tTodo = ancla('todo');
  const tCiegas = ancla('ciegas,');
  const tTocar = ancla('tocar');
  const tNada = ancla('nada.');

  const p = rebote(frame, golpe, FPS);
  const unida = entre(frame, golpe, golpe + 12);
  const desenfoque = 9 * entre(frame, tCiegas, tCiegas + 10);
  const flechaTodo = entre(frame, tRotar, tRotar + 14);
  const flechaNada = entre(frame, tTocar, tTocar + 12);

  const items = Array.from({ length: ITEMS_POR_COLUMNA * 2 }, (_, i) => {
    const hecho = i < ITEMS_POR_COLUMNA;
    const k = hecho ? i : i - ITEMS_POR_COLUMNA;
    const aparece = entrada(frame, (hecho ? tHechos : tTitulares) + 3 + k * 4, 8);
    const slot = slotDeItem(i);
    const x0 = hecho ? COLUMNA.xHechos : COLUMNA.xTitulares;
    const y0 = Y_ITEMS + k * (ALTO_ITEM + GAP_ITEM);
    const yUnido = Y_ITEMS + slot * (ALTO_UNIDO + GAP_UNIDO);
    return {
      i,
      hecho,
      aparece,
      x: lerp(x0, UNIDA.x, p),
      y: lerp(y0, yUnido, p),
      ancho: lerp(COLUMNA.ancho, UNIDA.ancho, p),
      alto: lerp(ALTO_ITEM, ALTO_UNIDO, p),
    };
  });

  return (
    <AbsoluteFill>
      <div style={{ filter: `blur(${desenfoque}px)` }}>
        {items.map((it) => (
          <div
            key={it.i}
            style={{
              position: 'absolute',
              left: it.x,
              top: it.y,
              width: it.ancho,
              height: it.alto,
              boxSizing: 'border-box',
              borderRadius: SPACING.radiusSmall + 2,
              border: `2px solid ${it.hecho ? COLORS.accent : WARN}`,
              background: it.hecho ? COLORS.accentWash : WARN_WASH,
              opacity: it.aparece,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                flexShrink: 0,
                background: it.hecho ? COLORS.accent : WARN,
              }}
            />
            <div
              style={{
                height: 10,
                width: `${50 + ((it.i * 17) % 40)}%`,
                borderRadius: 5,
                background: COLORS.idle,
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: COLUMNA.xHechos,
          top: 330,
          width: COLUMNA.ancho,
          fontFamily: FONTS.mono,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: COLORS.accent,
          opacity: entrada(frame, tHechos, 8) * (1 - Math.min(1, unida * 3)),
        }}
      >
        HECHOS
      </div>
      <div
        style={{
          position: 'absolute',
          left: COLUMNA.xTitulares,
          top: 330,
          width: COLUMNA.ancho,
          fontFamily: FONTS.mono,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: WARN,
          opacity: entrada(frame, tTitulares, 8) * (1 - Math.min(1, unida * 3)),
        }}
      >
        TITULARES
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 330,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: COLORS.textMuted,
          opacity: Math.max(0, unida * 2 - 1),
          textShadow: `0 0 40px ${WARN_GLOW}`,
        }}
      >
        UNA SOLA LISTA
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[
          { xFin: 310, progreso: flechaTodo },
          { xFin: 770, progreso: flechaNada },
        ].map(({ xFin, progreso }) => (
          <g key={xFin} opacity={progreso > 0 ? 1 : 0}>
            <path
              d={flecha(xFin)}
              fill="none"
              stroke={WARN}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progreso}
            />
            <path
              d={`M ${xFin - 22} ${Y_CHIPS - 36} L ${xFin} ${Y_CHIPS - 8} L ${xFin + 22} ${Y_CHIPS - 36}`}
              fill="none"
              stroke={WARN}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={entre(progreso, 0.85, 1)}
            />
          </g>
        ))}
      </svg>

      {[
        { texto: 'ROTAR TODO', x: 120, t: tTodo },
        { texto: 'NO TOCAR NADA', x: 580, t: tNada },
      ].map(({ texto, x, t }) => (
        <div
          key={texto}
          style={{
            position: 'absolute',
            left: x,
            top: Y_CHIPS,
            width: CHIP.ancho,
            height: CHIP.alto,
            boxSizing: 'border-box',
            borderRadius: SPACING.radius,
            border: `3px solid ${WARN}`,
            background: WARN_WASH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.mono,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: WARN,
            opacity: entrada(frame, t, 6),
            transform: `translateY(${(1 - entrada(frame, t, 6)) * 14}px)`,
          }}
        >
          {texto}
        </div>
      ))}
    </AbsoluteFill>
  );
};
