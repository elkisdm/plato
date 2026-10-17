import React, { createContext, useContext } from 'react';
import { z } from 'zod';
import { loadFont as cargarInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { loadFont as cargarBarlowCondensed } from '@remotion/google-fonts/BarlowCondensed';
import { loadFont as cargarPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as cargarBungee } from '@remotion/google-fonts/Bungee';
import { loadFont as cargarMrDafoe } from '@remotion/google-fonts/MrDafoe';
import { loadFont as cargarNeonderthaw } from '@remotion/google-fonts/Neonderthaw';
import { loadFont as cargarOrbitron } from '@remotion/google-fonts/Orbitron';

/** Colores semánticos que usa el kit. Cada marca los define todos. */
const coloresSchema = z.object({
  noche: z.string(),
  navy: z.string(),
  indigo: z.string(),
  indigoSuave: z.string(),
  hueso: z.string(),
  texto: z.string(),
  textoSecundario: z.string(),
  cian: z.string(),
  blanco: z.string(),
  /** Palabra en cursiva de los títulos sobre fondo oscuro. */
  cursiva: z.string(),
  /** Antetítulo sobre fondo oscuro. */
  antetitulo: z.string(),
});

/**
 * Tipografías con cargador registrado. Remotion solo puede cargar fuentes importadas
 * explícitamente, así que una marca nueva con otra fuente suma su cargador aquí.
 */
const CARGADORES = {
  'Instrument Serif': () => {
    cargarInstrumentSerif('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
    return cargarInstrumentSerif('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] })
      .fontFamily;
  },
  Inter: () =>
    cargarInter('normal', {
      weights: ['400', '500', '600', '700'],
      subsets: ['latin', 'latin-ext'],
    }).fontFamily,
  // Display condensada para títulos y Jakarta para la interfaz.
  'Barlow Condensed': () => {
    cargarBarlowCondensed('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
    return cargarBarlowCondensed('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] })
      .fontFamily;
  },
  'Plus Jakarta Sans': () =>
    cargarPlusJakartaSans('normal', {
      weights: ['400', '500', '600', '700'],
      subsets: ['latin', 'latin-ext'],
    }).fontFamily,
  // Ochenteras: cromado, neón, pincel y retro-tecnológica.
  Bungee: () =>
    cargarBungee('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily,
  'Mr Dafoe': () =>
    cargarMrDafoe('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily,
  Neonderthaw: () =>
    cargarNeonderthaw('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily,
  Orbitron: () =>
    cargarOrbitron('normal', { weights: ['500', '700', '900'], subsets: ['latin'] }).fontFamily,
} as const;

type NombreFuente = keyof typeof CARGADORES;
const nombresFuente = Object.keys(CARGADORES) as [NombreFuente, ...NombreFuente[]];

export const marcaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  colores: coloresSchema,
  tipografias: z.object({
    titulos: z.enum(nombresFuente),
    interfaz: z.enum(nombresFuente),
    /** Tipografías con rol propio de la marca (p. ej. «neon», «pincel»), por nombre de rol. */
    extras: z.record(z.enum(nombresFuente)).default({}),
  }),
  /** Ids de assets de la marca (ver assets.json de la marca). */
  /** `blanco` para fondos oscuros; `color` (opcional) para fondos claros. */
  logos: z.object({
    blanco: z.string().optional(),
    color: z.string().optional(),
    /** Logo original de la marca (p. ej. el isotipo a color), para fondos de video o foto. */
    original: z.string().optional(),
  }),
  iconos: z.record(z.string()),
  /** Reglas de redacción que se verifican en los textos de cada proyecto de la marca. */
  redaccion: z.array(z.object({ patron: z.string(), motivo: z.string() })),
  /** Identidad para cierres y firmas de redes: llamado a la acción, url, handle e isotipo (id de asset). */
  identidad: z
    .object({
      llamado: z.string(),
      url: z.string(),
      handle: z.string().optional(),
      isotipo: z.string().optional(),
    })
    .optional(),
  /**
   * Si un guion usa un asset cuyo id coincide con `siAsset` (regex), ningún texto suyo puede
   * coincidir con `prohibido` (regex, sin distinguir mayúsculas). Se verifica en cada proyecto.
   */
  restricciones: z
    .array(z.object({ siAsset: z.string(), prohibido: z.string(), motivo: z.string() }))
    .default([]),
});

export type Marca = z.infer<typeof marcaSchema>;

/** Un id de asset tiene forma `marca/carpeta/nombre` (sin espacios); un texto corrido no. */
const esIdAsset = (v: string): boolean => /^[a-z0-9-]+(\/[^\s/]+)+$/i.test(v);

const cadenas = (valor: unknown): string[] =>
  typeof valor === 'string'
    ? [valor]
    : valor && typeof valor === 'object'
      ? Object.values(valor).flatMap(cadenas)
      : [];

/**
 * Escenas cuyo texto choca con una restricción de la marca: el guion usa un asset que activa la
 * restricción (en cualquier escena) y el texto de la escena contiene lo prohibido.
 */
export const violacionesRestricciones = (
  guion: { escenas: { id: string }[] },
  restricciones: Marca['restricciones'],
): { escena: string; motivo: string }[] => {
  const ids = cadenas(guion).filter(esIdAsset);
  return restricciones.flatMap((r) => {
    if (!ids.some((id) => new RegExp(r.siAsset, 'i').test(id))) return [];
    const prohibido = new RegExp(r.prohibido, 'i');
    return guion.escenas
      .filter((e) => cadenas(e).some((t) => !esIdAsset(t) && prohibido.test(t)))
      .map((e) => ({ escena: e.id, motivo: r.motivo }));
  });
};

/**
 * Id del logo de la marca (una invitación personal, por ejemplo, no tiene). `color` cae a `blanco`.
 * Las escenas que muestran logo lo piden aquí y fallan con el id de la marca si no existe.
 */
export const logoDe = (
  marca: Pick<Marca, 'id' | 'logos'>,
  variante: 'blanco' | 'color',
): string => {
  const id = variante === 'color' ? (marca.logos.color ?? marca.logos.blanco) : marca.logos.blanco;
  if (!id) throw new Error(`La marca ${marca.id} no tiene logo`);
  return id;
};
export type Colores = Marca['colores'];

export type MarcaResuelta = Marca & {
  fuentes: { serif: string; ui: string; extras: Record<string, string> };
};

const cache = new Map<NombreFuente, string>();
const cargar = (nombre: NombreFuente): string => {
  const cargada = cache.get(nombre);
  if (cargada) return cargada;
  const familia = CARGADORES[nombre]();
  cache.set(nombre, familia);
  return familia;
};

/** Valida la marca y carga sus tipografías. */
export const resolverMarca = (datos: unknown): MarcaResuelta => {
  const marca = marcaSchema.parse(datos);
  return {
    ...marca,
    fuentes: {
      serif: cargar(marca.tipografias.titulos),
      ui: cargar(marca.tipografias.interfaz),
      extras: Object.fromEntries(
        Object.entries(marca.tipografias.extras).map(([rol, n]) => [rol, cargar(n)]),
      ),
    },
  };
};

const MarcaContexto = createContext<MarcaResuelta | null>(null);

export const MarcaProvider: React.FC<{ marca: MarcaResuelta; children: React.ReactNode }> = ({
  marca,
  children,
}) => React.createElement(MarcaContexto.Provider, { value: marca }, children);

/** Colores, tipografías e íconos de la marca del proyecto que se está renderizando. */
export const useMarca = (): MarcaResuelta => {
  const marca = useContext(MarcaContexto);
  if (!marca) throw new Error('useMarca fuera de un MarcaProvider');
  return marca;
};
