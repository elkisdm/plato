import React from 'react';
import { useMarca } from '../marca';
import { tintas, useTono } from '../tono';
import { interpolate } from 'remotion';
import { suave, tiempos } from '../tema';
import { avance } from './animacion';
import { useCuadro } from './tiempo';

/** El título espera a que el cruce con la escena anterior vaya por la mitad, para no encimarse. */
const INICIO_TRAS_CRUCE = Math.round(tiempos.transicion * 0.55);

type Palabra = { texto: string; cursiva: boolean; pegada?: boolean };

/** Separa el título en palabras; lo que va entre *asteriscos* queda en cursiva. */
const separar = (titulo: string): Palabra[] =>
  titulo
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((trozo): Palabra[] => {
      // La frase en cursiva entra como un bloque para que no se parta entre líneas.
      if (trozo.startsWith('*'))
        return [{ texto: trozo.replaceAll('*', '').replaceAll(' ', '\u00A0'), cursiva: true }];
      // Un signo que sigue a la cursiva («*tu portal*, lo…») va pegado a ella, sin espacio antes.
      return trozo
        .split(' ')
        .map((texto, i) => ({ texto, cursiva: false, pegada: i === 0 && /^[,.;:!?]/.test(trozo) }))
        .filter((p) => p.texto);
    });

type Props = {
  titulo: string;
  antetitulo?: string;
  texto?: string;
  inicio?: number;
  tamano: number;
  alineacion?: 'left' | 'center';
  anchoMaximo?: number;
};

type PropsAntetitulo = {
  texto: string;
  avance: number;
  tamano: number;
  alineacion: 'left' | 'center';
};

/** Etiqueta en mayúsculas con la regla cian que crece, igual que en los correos. */
const Antetitulo: React.FC<PropsAntetitulo> = ({ texto, avance: t, tamano, alineacion }) => {
  const { colores, fuentes } = useMarca();
  const tinta = tintas(colores, useTono());
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: alineacion === 'center' ? 'center' : 'flex-start',
        gap: 16,
        marginBottom: tamano * 0.32,
        opacity: t,
      }}
    >
      <div style={{ width: 44 * t, height: 2, background: tinta.regla, borderRadius: 2 }} />
      <span
        style={{
          fontFamily: fuentes.ui,
          fontWeight: 600,
          fontSize: Math.max(20, tamano * 0.22),
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: tinta.antetitulo,
        }}
      >
        {texto}
      </span>
    </div>
  );
};

/** Título serif con entrada palabra por palabra, antetítulo con regla cian y texto de apoyo. */
export const TituloSerif: React.FC<Props> = ({
  titulo,
  antetitulo,
  texto,
  inicio = INICIO_TRAS_CRUCE,
  tamano,
  alineacion = 'left',
  anchoMaximo,
}) => {
  const { colores, fuentes } = useMarca();
  const tinta = tintas(colores, useTono());
  const frame = useCuadro();
  const palabras = separar(titulo);
  const regla = avance(frame, inicio, tiempos.entrada);
  const inicioTexto = inicio + palabras.length * 3 + 10;
  const pTexto = avance(frame, inicioTexto);

  return (
    <div style={{ textAlign: alineacion, maxWidth: anchoMaximo }}>
      {antetitulo ? (
        <Antetitulo texto={antetitulo} avance={regla} tamano={tamano} alineacion={alineacion} />
      ) : null}
      <h1
        style={{
          margin: 0,
          fontFamily: fuentes.serif,
          fontWeight: 400,
          fontSize: tamano,
          lineHeight: 1.04,
          letterSpacing: '-0.01em',
          color: tinta.titulo,
        }}
      >
        {palabras.map((p, i) => {
          const t = interpolate(frame, [inicio + i * 3, inicio + i * 3 + tiempos.entrada], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: suave,
          });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.24em',
                marginLeft: p.pegada ? '-0.24em' : undefined,
                fontStyle: p.cursiva ? 'italic' : 'normal',
                color: p.cursiva ? tinta.cursiva : undefined,
                opacity: t,
                transform: `translateY(${(1 - t) * tamano * 0.35}px)`,
                filter: `blur(${(1 - t) * 8}px)`,
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </h1>
      {texto ? (
        <p
          style={{
            margin: `${tamano * 0.38}px 0 0`,
            fontFamily: fuentes.ui,
            fontSize: Math.max(26, tamano * 0.31),
            lineHeight: 1.45,
            color: tinta.texto,
            opacity: pTexto,
            transform: `translateY(${(1 - pTexto) * 16}px)`,
          }}
        >
          {texto}
        </p>
      ) : null}
    </div>
  );
};
