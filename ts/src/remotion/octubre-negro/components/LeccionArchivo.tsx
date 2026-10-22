import type { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';

import { EqualityGlyph } from '../../arquitectura-ia/components/typography/EqualityGlyph';
import { COLORS, FONTS, SPACING, TYPE, WARN, WARN_WASH } from '../constants/theme';
import { fsMinimo } from '../lib/layout';
import { entrada, rebote } from '../lib/motion';

const ANCHO = 340;
const ALTO = 270;
/** Barras de "contenido" de cada archivo (porcentaje del ancho); distintas para que se note el cambio. */
const ORIGINAL = [78, 56, 90, 48];
const REEMPLAZO = [46, 88, 38, 70];

const Archivo = ({ barras, alerta }: { barras: number[]; alerta: boolean }) => {
  const color = alerta ? WARN : COLORS.accent;
  return (
    <div
      style={{
        width: ANCHO,
        height: ALTO,
        boxSizing: 'border-box',
        padding: 34,
        borderRadius: SPACING.radius,
        border: `2px ${alerta ? 'dashed' : 'solid'} ${color}`,
        background: alerta ? WARN_WASH : COLORS.accentWash,
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        justifyContent: 'center',
      }}
    >
      {barras.map((w, i) => (
        <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 7, background: color, opacity: 0.55 }} />
      ))}
    </div>
  );
};

/**
 * Una etiqueta de versión (genérica) sobre un archivo. En `golpe` el archivo se cambia por otro
 * y la etiqueta queda igual; debajo aparece `versión ≠ archivo`.
 */
export const LeccionArchivo = ({ golpe }: { golpe: number }) => {
  const frame = useCurrentFrame();
  const sale = entrada(frame, golpe, 10);
  const k = rebote(frame, golpe, 30);
  const cambio = frame >= golpe;
  const pos = (px: number): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    transform: `translateX(${px}px)`,
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
      <div
        style={{
          padding: '10px 34px',
          borderRadius: 999,
          border: `1px solid ${COLORS.borderStrong}`,
          background: COLORS.surfaceRaised,
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(TYPE.title),
          color: COLORS.text,
          letterSpacing: '0.06em',
        }}
      >
        v1.2.3
      </div>
      <div style={{ position: 'relative', width: ANCHO, height: ALTO }}>
        <div style={{ ...pos(-110 * sale), opacity: 1 - sale }}>
          <Archivo barras={ORIGINAL} alerta={false} />
        </div>
        {cambio && (
          <div style={{ ...pos((1 - k) * 110), opacity: Math.min(1, k * 2.5) }}>
            <Archivo barras={REEMPLAZO} alerta />
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          fontFamily: FONTS.sans,
          fontSize: TYPE.headline - 10,
          fontWeight: 650,
          letterSpacing: '-0.03em',
          color: COLORS.text,
          opacity: Math.min(1, k * 2.5),
          transform: `translateY(${(1 - Math.min(1, k)) * 24}px)`,
        }}
      >
        versión
        <EqualityGlyph resolve={0} size={84} />
        archivo
      </div>
    </div>
  );
};
