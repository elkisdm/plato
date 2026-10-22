import { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

import { COLORS } from '../../constants/theme';
import { colorAnimo, pesosAnimo, type PesosAnimo } from '../../lib/fx/animo';
import { transformCamara } from '../../lib/fx/camara';
import { crearParticulas, posicionParticula } from '../../lib/fx/particulas';

type Props = {
  /** Mezcla de ánimos por frame (suma 1). Por defecto `pesosAnimo` de `lib/fx/animo`. */
  pesos?: (frame: number) => PesosAnimo;
  /** Cantidad de ascuas (30–60). Por defecto 44. */
  cantidad?: number;
};

/** Textura de grano: ruido fractal rasterizado una sola vez (data URI), se desplaza por frame para vivir. */
const GRANO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")";

const rgba = (c: [number, number, number], a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/**
 * Fondo vivo del reel (debajo de `Camara`): halo de color por ánimo, cuadrícula de líneas y de puntos con
 * paralaje a dos velocidades (y contrapeso leve del shake de cámara), ascuas deterministas, grano y viñeta.
 * Nunca compite con el texto: halo ≤ 0.22 de opacidad, cuadrícula ≤ 0.075.
 */
export const FondoVivo = ({ pesos = pesosAnimo, cantidad = 44 }: Props) => {
  const frame = useCurrentFrame();
  const particulas = useMemo(() => crearParticulas(cantidad, 'fondo-vivo'), [cantidad]);
  const color = colorAnimo(pesos(frame));
  const cam = transformCamara(frame);
  const respira = 0.85 + 0.15 * Math.sin(frame / 40);
  const grano = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: 'hidden' }}>
      {/* Halo grande: se mueve despacio y cambia de color con el ánimo */}
      <div
        style={{
          position: 'absolute',
          left: 540 + 140 * Math.sin(frame / 130) - 900,
          top: 780 + 120 * Math.cos(frame / 170) - 900,
          width: 1800,
          height: 1800,
          background: `radial-gradient(circle, ${rgba(color, 0.22 * respira)} 0%, ${rgba(color, 0.07)} 38%, transparent 66%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 220 + 80 * Math.cos(frame / 110) - 700,
          top: 1700 + 60 * Math.sin(frame / 90) - 700,
          width: 1400,
          height: 1400,
          background: `radial-gradient(circle, ${rgba(color, 0.1)} 0%, transparent 62%)`,
        }}
      />
      {/* Capa lejana: líneas, avanza lento */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${rgba([255, 255, 255], 0.035)} 1px, transparent 1px), linear-gradient(90deg, ${rgba([255, 255, 255], 0.035)} 1px, transparent 1px)`,
          backgroundSize: '176px 176px',
          backgroundPosition: `${-cam.x * 0.3 + frame * 0.05}px ${-cam.y * 0.3 - frame * 0.1}px`,
        }}
      />
      {/* Capa cercana: puntos, avanza más rápido */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.3px, transparent 1.3px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `${-cam.x * 0.6}px ${-cam.y * 0.6 - frame * 0.3}px`,
        }}
      />
      {/* Ascuas */}
      {particulas.map((p, i) => {
        const pos = posicionParticula(p, frame);
        const d = p.radio * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x - p.radio,
              top: pos.y - p.radio,
              width: d,
              height: d,
              borderRadius: '50%',
              background: rgba(color, 0.9),
              boxShadow: `0 0 ${d * 3}px ${rgba(color, 0.7)}`,
              opacity: pos.alfa * (0.35 + 0.4 * p.radio / 5),
            }}
          />
        );
      })}
      {/* Grano sutil */}
      <AbsoluteFill
        style={{
          backgroundImage: GRANO,
          backgroundSize: '240px 240px',
          backgroundPosition: `${random(`gx${grano}`) * 240}px ${random(`gy${grano}`) * 240}px`,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
      {/* Viñeta */}
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 42%, ${COLORS.bg} 100%)` }}
      />
    </AbsoluteFill>
  );
};
