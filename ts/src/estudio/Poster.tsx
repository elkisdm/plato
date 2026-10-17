import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Captura } from './kit/Captura';
import { Fondo } from './kit/Fondo';
import { MarcoTelefono } from './kit/MarcoTelefono';
import { TituloSerif } from './kit/TituloSerif';
import { MarcaProvider, logoDe, useMarca } from './marca';
import { duracionTotal, ProyectoProvider, useAsset, useProyecto } from './proyecto';
import { resolverProyecto } from './resolver';
import { FPS } from './tema';

/** Frame en que el título ya terminó de entrar; la miniatura se exporta ahí. */
export const FRAME_POSTER = 60;

/** Botón de play: círculo blanco con triángulo de la marca y, si se pide, la duración del video. */
const Play: React.FC<{ conDuracion: boolean }> = ({ conDuracion }) => {
  const { colores, fuentes } = useMarca();
  const { guion, voz } = useProyecto();
  const s = Math.round(duracionTotal(guion, voz) / FPS);
  const duracion = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          background: colores.blanco,
          boxShadow: '0 20px 50px -12px rgba(3, 6, 25, 0.8), 0 0 0 10px rgba(255, 255, 255, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={40} height={44} viewBox="0 0 40 44">
          <path d="M6 4 L36 22 L6 40 Z" fill={colores.indigo} strokeLinejoin="round" />
        </svg>
      </div>
      <span
        style={{ fontFamily: fuentes.ui, fontSize: 24, fontWeight: 600, color: colores.blanco }}
      >
        {conDuracion ? `Ver video · ${duracion}` : 'Ver video'}
      </span>
    </div>
  );
};

const Contenido: React.FC<{ conDuracion: boolean }> = ({ conDuracion }) => {
  const { proyecto } = useProyecto();
  const marca = useMarca();
  const logo = useAsset(logoDe(marca, 'blanco'));
  if (!proyecto.poster) throw new Error(`${proyecto.id} no define poster`);
  const poster = proyecto.poster;
  const captura = useAsset(poster.captura);
  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill
        style={{ padding: '56px 64px', flexDirection: 'row', alignItems: 'center', gap: 40 }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <Img src={logo.src} style={{ width: 130 }} />
          <TituloSerif
            antetitulo={poster.antetitulo}
            titulo={poster.titulo}
            inicio={0}
            tamano={62}
          />
          <Play conDuracion={conDuracion} />
        </div>
        <div style={{ transform: 'rotate(4deg)', marginRight: 10 }}>
          <MarcoTelefono
            ancho={250}
            alto={(250 * captura.alto) / captura.ancho}
            colorBarra="#101341"
          >
            <Captura captura={captura} ancho={250} />
          </MarcoTelefono>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export type PropsPoster = { proyecto: string; conDuracion: boolean };

/**
 * Miniatura clicable (1200×675). Para un correo se exporta a 1104×621 (`--scale=0.92`) y sin
 * la duración, que puede cambiar si se ajusta el video.
 */
export const Poster: React.FC<PropsPoster> = ({ proyecto, conDuracion }) => {
  const r = resolverProyecto(proyecto);
  return (
    <ProyectoProvider valor={r}>
      <MarcaProvider marca={r.marca}>
        <Contenido conDuracion={conDuracion} />
      </MarcaProvider>
    </ProyectoProvider>
  );
};
