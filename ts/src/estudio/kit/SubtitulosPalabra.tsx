import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { useMarca } from '../marca';
import { inicioVoz, useProyecto, type Escena } from '../proyecto';
import { FPS } from '../tema';
import { BANDA_SUBTITULOS, useU } from '../tipos/anuncio/Base';
import { entrada, estiloDisplay } from '../tipos/anuncio/Sistema';
import { useCuadro } from './tiempo';
import {
  aplicarReemplazos,
  grupoActivo,
  gruposDe,
  palabraActiva,
  punchDe,
  type Reemplazo,
} from '../tipos/anuncio/calculos';

/** Los grupos de palabras de la locución de la escena (vacío si la voz no trae tiempos por palabra). */
export const useGrupos = (escena: Escena, reemplazos: Reemplazo[] = []) => {
  const { voz } = useProyecto();
  const palabras = voz[escena.id]?.palabras;
  return React.useMemo(
    () => gruposDe(aplicarReemplazos(palabras ?? [], reemplazos)),
    [palabras, reemplazos],
  );
};

/** Segundo de la locución en el que va la escena (negativo antes de que entre la voz). */
export const useSegundoVoz = (escena: Escena): number => (useCuadro() - inicioVoz(escena)) / FPS;

/**
 * Subtítulos estilo Reels: tres palabras como máximo, blancas, gruesas y con borde; la palabra que se
 * está diciendo se enciende en el color de antetítulo de la marca (o `colorViva`) y da un pequeño
 * golpe de escala. Usa la tipografía display y la banda de subtítulos del sistema del tipo «anuncio».
 */
export const SubtitulosPalabra: React.FC<{
  escena: Escena;
  reemplazos?: Reemplazo[];
  colorViva?: string;
  /** Centro de la banda como fracción del alto; sin valor, la banda de anuncio (≈64 %). */
  centro?: number;
}> = ({ escena, reemplazos, colorViva, centro }) => {
  const frame = useCuadro();
  const u = useU();
  const { height } = useVideoConfig();
  const { colores } = useMarca();
  const grupos = useGrupos(escena, reemplazos);
  const t = useSegundoVoz(escena);
  const i = grupoActivo(grupos, t);
  const grupo = grupos[i];
  if (!grupo) return null;
  const activa = palabraActiva(grupo, t);
  const inicioGrupo = Math.round(grupo.inicio * FPS) + inicioVoz(escena);
  const aparece = entrada(frame, inicioGrupo, u, { dur: 8, y: 22, blur: 6 });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 40 * u,
          right: 40 * u,
          top: (centro ?? BANDA_SUBTITULOS.centro / BANDA_SUBTITULOS.referencia) * height,
          marginTop: -50 * u,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `0 ${24 * u}px`,
          ...aparece,
        }}
      >
        {grupo.palabras.map((p, pi) => {
          const viva = pi === activa;
          const desde = Math.round(p.inicio * FPS) + inicioVoz(escena);
          const golpe = viva ? 1 + 0.07 * Math.exp(-(frame - desde) / 6) : 1;
          return (
            <span
              key={pi}
              style={{
                ...estiloDisplay(u, 84),
                textTransform: 'uppercase',
                color: viva ? (colorViva ?? colores.antetitulo) : colores.blanco,
                textShadow: `0 ${2 * u}px ${18 * u}px rgba(0,0,0,0.7), 0 0 ${3 * u}px rgba(0,0,0,0.55)`,
                transform: `scale(${golpe})`,
                display: 'inline-block',
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Escala de «golpe» de cámara en los arranques de frase (cercana a 1). */
export const usePunch = (escena: Escena, reemplazos?: Reemplazo[]): number => {
  const grupos = useGrupos(escena, reemplazos);
  return 1 + punchDe(useSegundoVoz(escena), grupos);
};
