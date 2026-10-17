import React, { createContext, useContext } from 'react';
import { staticFile } from 'remotion';
import { z } from 'zod';
import { asset as buscarAsset, type Asset, type IndiceAssets } from './assets';
import type { MarcaResuelta } from './marca';
import { FPS, tiempos } from './tema';

/** La voz entra, por defecto, cuando el cruce con la escena anterior ya va por la mitad. */
export const INICIO_VOZ = Math.round(tiempos.transicion * 0.55);
const INICIO_VOZ_SEG = INICIO_VOZ / FPS;
/** Respiro por defecto después de la voz, antes de que empiece el cruce a la siguiente escena. */
const RESPIRO_VOZ_SEG = 0.45;

/** Una escena del guion: textos comunes + props del tipo de escena del catálogo. */
export const escenaSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9]+$/),
  /** Tipo de escena del catálogo del tipo de video (p. ej. «gancho», «pasos»). */
  escena: z.string(),
  /** Mínimo que pide la animación; la duración real también depende de la locución. */
  /** Al menos 1 s: una escena más corta que la transición (0,6 s) no se puede cruzar. */
  segundos: z.number().min(1),
  antetitulo: z.string().default(''),
  titulo: z.string(),
  texto: z.string().default(''),
  locucion: z.string().default(''),
  /** Dirección de actuación para el TTS (etiquetas de ElevenLabs v4, p. ej. «[warm]»): se dice, no se muestra. */
  direccion: z.string().optional(),
  /**
   * Cómo entra la escena: fundido, deslizándose (cambio de capítulo, contenido ya armado) o
   * «zoom» (la cámara entra en la pantalla anterior: corte por coincidencia), «vhs» (glitch de cinta) o
   * «desenfoque» (la cámara sale hacia adelante y la nueva escena entra desde atrás, ajustando el foco).
   */
  entrada: z.enum(['funde', 'desliza', 'zoom', 'vhs', 'desenfoque']).default('funde'),
  /** Mundo visual de la escena: «noche» (el del equipo) o «dia» (el del cliente, papel cálido). */
  tono: z.enum(['noche', 'dia']).default('noche'),
  /** Segundos antes de que entre la voz (1 s en la apertura; 0,3–0,6 s típico). */
  vozDesde: z.number().min(0).default(INICIO_VOZ_SEG),
  /** Segundos de aire después de la voz, antes del cruce (2,4 s en revelaciones y cierre). */
  colchon: z.number().min(0).default(RESPIRO_VOZ_SEG),
  /** Efectos de sonido de la escena: asset de audio, frame local y volumen. */
  sonidos: z
    .array(
      z.object({
        asset: z.string(),
        en: z.number().min(0),
        volumen: z.number().min(0).max(1).default(0.5),
      }),
    )
    .default([]),
  props: z.record(z.unknown()).default({}),
});
export type Escena = z.infer<typeof escenaSchema>;

export const guionSchema = z.object({
  escenas: z
    .array(escenaSchema)
    .min(1)
    .refine((es) => new Set(es.map((e) => e.id)).size === es.length, {
      message: 'los ids de escena deben ser únicos (voz.json y los subtítulos se indexan por id)',
    }),
});
export type Guion = z.infer<typeof guionSchema>;

const formatoSchema = z.enum(['horizontal', 'vertical', 'retrato']);
/** horizontal 1920×1080, vertical 1080×1920, retrato 1080×1350 (4:5, feed de Instagram). */
export type Formato = z.infer<typeof formatoSchema>;

export const proyectoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'versión semver'),
  marca: z.string(),
  tipo: z.string(),
  descripcion: z.string().default(''),
  formatos: z.array(formatoSchema).min(1),
  /** Cuadros por segundo del render. 60 solo en tipos con escenas medidas en tiempo (ver `validarFps`). */
  fps: z.union([z.literal(30), z.literal(60)]).default(30),
  /** Id del asset de música (opcional). */
  musica: z.string().optional(),
  /** Segundo de la pista desde el que entra la música (sin él, se alinea su final con el del video). */
  musicaInicio: z.number().min(0).optional(),
  /** Pulso de la música para animar al ritmo: tempo y segundo del video en que cae un golpe. */
  ritmo: z.object({ bpm: z.number().positive(), golpe: z.number().min(0) }).optional(),
  voz: z
    .object({
      proveedor: z.string(),
      modelo: z.string(),
      voz: z.string(),
      instruccion: z.string(),
      /** Ajuste de ritmo en post: velocidad (atempo, ≤ 1,07 suena natural) y pausa interna máxima en segundos. */
      tempo: z.number().min(0.9).max(1.1).optional(),
      pausaMaxima: z.number().min(0.15).max(2).optional(),
      /** Ajustes propios del proveedor (ElevenLabs: stability, similarity_boost…); entran en la firma. */
      ajustes: z.record(z.union([z.number(), z.boolean()])).optional(),
      /** Semilla del TTS (ElevenLabs): con la misma semilla y el mismo texto, la toma se repite. */
      semilla: z.number().int().min(0).optional(),
    })
    .optional(),
  /** Miniatura clicable (opcional: una invitación, por ejemplo, no la necesita). */
  poster: z
    .object({ antetitulo: z.string(), titulo: z.string(), captura: z.string().min(1) })
    .optional(),
  /** De qué proyecto y versión se clonó (si aplica). */
  clonadoDe: z.string().optional(),
});
export type Proyecto = z.infer<typeof proyectoSchema>;

/**
 * Locución por escena: el asset de audio y su duración (los escribe `estudio voz`).
 * Un clon apunta a la voz del original hasta que se regenera.
 */
/** Una palabra dicha, con sus tiempos en segundos relativos al inicio de la toma de la escena. */
const palabraSchema = z.object({ texto: z.string(), inicio: z.number(), fin: z.number() });

export const vozSchema = z.record(
  z.object({
    asset: z.string(),
    segundos: z.number().positive(),
    /** Solo en tomas con alineación (ElevenLabs): las palabras dichas, con sus tiempos. */
    palabras: z.array(palabraSchema).optional(),
  }),
);
export type Voz = z.infer<typeof vozSchema>;

/** Frame (local) en que entra la voz de la escena. */
export const inicioVoz = (escena: Escena): number => Math.round(escena.vozDesde * FPS);

/** Frames de la escena: lo que pide la animación o lo que dura la voz, lo que sea mayor. */
export const framesDe = (escena: Escena, voz: Voz): number => {
  const segundosVoz = voz[escena.id]?.segundos ?? 0;
  const conVoz =
    inicioVoz(escena) + Math.ceil((segundosVoz + escena.colchon) * FPS) + tiempos.transicion;
  return Math.max(Math.round(escena.segundos * FPS), segundosVoz > 0 ? conVoz : 0);
};

/** Frame global en el que empieza cada escena, descontando el cruce de las transiciones. */
export const iniciosEscenas = (guion: Guion, voz: Voz): number[] => {
  const inicios: number[] = [];
  let cursor = 0;
  for (const escena of guion.escenas) {
    inicios.push(cursor);
    cursor += framesDe(escena, voz) - tiempos.transicion;
  }
  return inicios;
};

export const duracionTotal = (guion: Guion, voz: Voz): number =>
  guion.escenas.reduce((total, e) => total + framesDe(e, voz), 0) -
  tiempos.transicion * (guion.escenas.length - 1);

/** Todo lo que una escena necesita para renderizarse, resuelto una vez por composición. */
export type ProyectoResuelto = {
  proyecto: Proyecto;
  guion: Guion;
  voz: Voz;
  marca: MarcaResuelta;
  indice: IndiceAssets;
};

const ProyectoContexto = createContext<ProyectoResuelto | null>(null);

export const ProyectoProvider: React.FC<{ valor: ProyectoResuelto; children: React.ReactNode }> = ({
  valor,
  children,
}) => React.createElement(ProyectoContexto.Provider, { value: valor }, children);

export const useProyecto = (): ProyectoResuelto => {
  const p = useContext(ProyectoContexto);
  if (!p) throw new Error('useProyecto fuera de un ProyectoProvider');
  return p;
};

export type AssetServido = Asset & { src: string; ancho: number; alto: number };

/** Ruta pública de un asset del estudio (ts/public/estudio/<archivo>). */
export const rutaPublica = (a: Asset): string => `estudio/${a.archivo}`;

/** Resuelve un asset por id, listo para <Img>/<Audio>. */
export const servir = (indice: IndiceAssets, id: string): AssetServido => {
  const a = buscarAsset(indice, id);
  return { ...a, src: staticFile(rutaPublica(a)), ancho: a.ancho ?? 0, alto: a.alto ?? 0 };
};

export const useAsset = (id: string): AssetServido => servir(useProyecto().indice, id);
