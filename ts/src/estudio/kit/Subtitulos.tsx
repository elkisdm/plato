import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { useMarca } from '../marca';
import {
  framesDe,
  iniciosEscenas,
  inicioVoz,
  useProyecto,
  type Guion,
  type Voz,
} from '../proyecto';
import { FPS, tiempos } from '../tema';
import { useVertical } from './formato';

const PALABRAS_POR_LINEA = 8;

/** Parte la locución en frases cortas, cortando primero en la puntuación. */
export const trozosDe = (locucion: string): string[] =>
  locucion
    .split(/(?<=[.:,])\s+/)
    .flatMap((frase) => {
      const palabras = frase.split(' ');
      const trozos: string[] = [];
      for (let i = 0; i < palabras.length; i += PALABRAS_POR_LINEA) {
        trozos.push(palabras.slice(i, i + PALABRAS_POR_LINEA).join(' '));
      }
      return trozos;
    })
    .filter(Boolean);

type Linea = { texto: string; desde: number; hasta: number };

/** Reparte cada escena entre sus frases según su largo, para que el ritmo siga a la locución. */
export const lineasDe = (guion: Guion, voz: Voz): Linea[] => {
  const inicios = iniciosEscenas(guion, voz);
  return guion.escenas.flatMap((escena, i) => {
    const inicio = inicios[i] ?? 0;
    // Con voz, las frases se reparten en el tramo en que suena; sin voz, en la escena.
    const segundos = voz[escena.id]?.segundos;
    const desde = inicio + (segundos ? inicioVoz(escena) : 8);
    const hasta = segundos
      ? desde + Math.ceil(segundos * FPS)
      : inicio + framesDe(escena, voz) - tiempos.transicion;
    const trozos = trozosDe(escena.locucion);
    const total = trozos.reduce((n, t) => n + t.length, 0);
    let cursor = desde;
    return trozos.map((texto) => {
      const largo = ((hasta - desde) * texto.length) / total;
      const linea = { texto, desde: cursor, hasta: cursor + largo };
      cursor += largo;
      return linea;
    });
  });
};

/** Subtítulos quemados, opcionales (prop `subtitulos`). */
export const Subtitulos: React.FC = () => {
  const { fuentes } = useMarca();
  const { guion, voz } = useProyecto();
  const lineas = React.useMemo(() => lineasDe(guion, voz), [guion, voz]);
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const linea = lineas.find((l) => frame >= l.desde && frame < l.hasta);
  if (!linea) return null;
  const opacidad = interpolate(
    frame,
    [linea.desde, linea.desde + 5, linea.hasta - 4, linea.hasta],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: vertical ? 70 : 44,
        display: 'flex',
        justifyContent: 'center',
        opacity: opacidad,
      }}
    >
      <span
        style={{
          maxWidth: vertical ? 900 : 1400,
          padding: '12px 26px',
          borderRadius: 14,
          background: 'rgba(8, 11, 32, 0.78)',
          fontFamily: fuentes.ui,
          fontWeight: 500,
          fontSize: vertical ? 38 : 34,
          lineHeight: 1.35,
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        {linea.texto}
      </span>
    </div>
  );
};
