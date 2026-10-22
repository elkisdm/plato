import type { CSSProperties } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

import { COLORS, FONTS, FPS } from '../../constants/theme';
import { dibujo, estadoLetra } from '../../lib/fx/efectos';

type Props = {
  texto: string;
  /** Frame global en que cae la primera unidad. */
  inicio: number;
  /** 'letras': letra por letra (LetrasCaen); 'palabras': palabra por palabra. Por defecto 'palabras'. */
  modo?: 'letras' | 'palabras';
  /** Frames entre una unidad y la siguiente. Por defecto 2 (letras) o 5 (palabras). */
  escalon?: number;
  /** Tamaño en px (≥ 28). */
  fontSize: number;
  color?: string;
  /** Color del subrayado que se dibuja bajo el texto al terminar de caer; false o ausente = sin subrayado. */
  subrayado?: string | false;
  /** Brillo blanco que barre el texto una vez asentado. Por defecto false. */
  brillo?: boolean;
  fontWeight?: number;
  style?: CSSProperties;
};

/** Frames que tarda en asentarse la última unidad (spring con overshoot). */
const ASENTAR = 24;

type Unidad = { texto: string; palabra: number };

const unidades = (texto: string, modo: 'letras' | 'palabras'): Unidad[][] =>
  texto.split(' ').map((p, k) => (modo === 'letras' ? [...p].map((c) => ({ texto: c, palabra: k })) : [{ texto: p, palabra: k }]));

/**
 * Texto cinético: cada letra o palabra cae con spring y overshoot (giro alterno y desenfoque que se asientan),
 * luego se dibuja un subrayado (opcional) y un brillo barre el texto (opcional). Centrado; varias palabras envuelven.
 */
export const TextoCinetico = ({
  texto,
  inicio,
  modo = 'palabras',
  escalon,
  fontSize,
  color = COLORS.text,
  subrayado = false,
  brillo = false,
  fontWeight = 900,
  style,
}: Props) => {
  const frame = useCurrentFrame();
  const paso = escalon ?? (modo === 'letras' ? 2 : 5);
  const palabras = unidades(texto, modo);
  const total = palabras.flat().length;
  const asentado = inicio + (total - 1) * paso + ASENTAR;

  let n = 0;
  const base: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: '0.28em',
    fontFamily: FONTS.sans,
    fontWeight,
    fontSize,
    lineHeight: 1.1,
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div style={{ ...base, color }}>
        {palabras.map((p, k) => (
          <span key={k} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
            {p.map((u, j) => {
              const s = estadoLetra(frame, inicio, n++, paso, FPS);
              return (
                <span
                  key={j}
                  style={{
                    display: 'inline-block',
                    opacity: s.opacity,
                    transform: `translateY(${s.y}px) rotate(${s.rot}deg) scale(${s.scale})`,
                    filter: s.blur > 0 ? `blur(${s.blur}px)` : undefined,
                    textShadow: `0 0 ${fontSize * 0.4}px ${color}44`,
                  }}
                >
                  {u.texto}
                </span>
              );
            })}
          </span>
        ))}
      </div>
      {brillo && frame >= asentado ? (
        <div
          aria-hidden
          style={{
            ...base,
            position: 'absolute',
            inset: 0,
            color: 'transparent',
            backgroundImage: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%)',
            backgroundSize: '300% 100%',
            backgroundPosition: `${interpolate(dibujo(frame, asentado, 18), [0, 1], [100, 0])}% 0`,
            backgroundRepeat: 'no-repeat',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {texto.split(' ').map((p, k) => (
            <span key={k} style={{ whiteSpace: 'nowrap' }}>
              {p}
            </span>
          ))}
        </div>
      ) : null}
      {subrayado ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -fontSize * 0.08,
            height: Math.max(6, fontSize * 0.07),
            borderRadius: 6,
            background: subrayado,
            boxShadow: `0 0 18px ${subrayado}`,
            transformOrigin: 'left center',
            transform: `scaleX(${dibujo(frame, asentado - 10, 14)})`,
          }}
        />
      ) : null}
    </div>
  );
};

/** Atajo de `TextoCinetico` que cae letra por letra (escalón de 2 frames). */
export const LetrasCaen = (props: Omit<Props, 'modo'>) => <TextoCinetico {...props} modo="letras" />;
