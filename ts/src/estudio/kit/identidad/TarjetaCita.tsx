import React from 'react';
import { useMarca } from '../../marca';
import { avance } from '../animacion';
import { useCuadro } from '../tiempo';
import { useUnidad } from './unidad';

type Props = {
  texto: string;
  autor: string;
  /** Medio o cargo, bajo el autor («El Mercurio», «Ministra de Vivienda»). */
  fuente?: string;
  /** Texto de firma al pie (p. ej. el nombre de la marca). */
  firma?: string;
  inicio?: number;
};

/** Tamaño de la cita según su largo: las frases cortas respiran, las largas caben. */
const tamanoCita = (texto: string): number =>
  texto.length <= 60 ? 112 : texto.length <= 110 ? 92 : texto.length <= 170 ? 76 : 62;

/** Cita grande en la serif de la marca, con atribución; pensada para ir sobre una foto con velo. */
export const TarjetaCita: React.FC<Props> = ({ texto, autor, fuente, firma, inicio = 8 }) => {
  const { colores, fuentes } = useMarca();
  const frame = useCuadro();
  const { u } = useUnidad();
  const palabras = texto.split(' ').filter(Boolean);
  const tam = tamanoCita(texto) * u;
  const atribucion = avance(frame, inicio + palabras.length * 2 + 8, 20);
  const sombra = `0 ${2 * u}px ${24 * u}px ${colores.noche}CC`;

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <div
        style={{
          fontFamily: fuentes.serif,
          fontSize: 230 * u,
          lineHeight: 0.7,
          height: 110 * u,
          color: colores.cursiva,
          opacity: avance(frame, inicio, 16),
        }}
      >
        “
      </div>
      <div
        style={{
          fontFamily: fuentes.serif,
          fontSize: tam,
          lineHeight: 1.08,
          color: colores.blanco,
          textShadow: sombra,
        }}
      >
        {palabras.map((p, i) => {
          const t = avance(frame, inicio + i * 2, 16);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.24em',
                opacity: t,
                transform: `translateY(${(1 - t) * tam * 0.3}px)`,
                filter: `blur(${(1 - t) * 6}px)`,
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 44 * u,
          display: 'flex',
          alignItems: 'center',
          gap: 22 * u,
          opacity: atribucion,
          transform: `translateY(${(1 - atribucion) * 16 * u}px)`,
          fontFamily: fuentes.ui,
        }}
      >
        <div style={{ width: 64 * u * atribucion, height: 3 * u, background: colores.cian }} />
        <div style={{ textShadow: sombra }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 36 * u,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: colores.antetitulo,
            }}
          >
            {autor}
          </div>
          {fuente ? (
            <div
              style={{ fontWeight: 500, fontSize: 30 * u, color: colores.blanco, opacity: 0.85 }}
            >
              {fuente}
            </div>
          ) : null}
        </div>
      </div>
      {firma ? (
        <div
          style={{
            marginTop: 40 * u,
            fontFamily: fuentes.ui,
            fontWeight: 600,
            fontSize: 28 * u,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colores.blanco,
            opacity: 0.6 * atribucion,
          }}
        >
          {firma}
        </div>
      ) : null}
    </div>
  );
};
