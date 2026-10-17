import { z } from 'zod';

/** Rectángulo en proporción a la imagen (0 a 1): x e y son la esquina superior izquierda. */
export const zonaSchema = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });
export type Zona = z.infer<typeof zonaSchema>;

/**
 * Un asset del estudio. El binario vive fuera de git en `ts/public/estudio/<archivo>`; en git
 * solo va esta ficha (ADR-0011). Es inmutable: retomarlo crea un asset nuevo con `deriva`.
 */
export const assetSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+\/[a-zA-Z0-9-/]+(@\d+)?$/, 'id con forma <espacio>/<nombre>[@n]'),
  archivo: z.string(),
  tipo: z.enum(['imagen', 'audio', 'video', 'fuente', 'datos']),
  sha256: z.string().length(64),
  ancho: z.number().optional(),
  alto: z.number().optional(),
  /** Duración en segundos (audio y video). */
  segundos: z.number().optional(),
  /** De dónde salió: script o URL, fecha, deviceScaleFactor, licencia… */
  origen: z.record(z.union([z.string(), z.number(), z.boolean()])),
  /** Id del asset del que deriva (p. ej. una captura retomada a 4×). */
  deriva: z.string().optional(),
  /** Elementos clave de la imagen, en proporción a ella. */
  zonas: z.record(z.union([zonaSchema, z.array(zonaSchema)])).default({}),
  /** Cortes horizontales en proporción al alto (p. ej. dónde termina el encabezado de un chat). */
  cortes: z.record(z.number()).default({}),
});
export type Asset = z.infer<typeof assetSchema>;

export const manifiestoSchema = z.object({ assets: z.array(assetSchema) });
export type Manifiesto = z.infer<typeof manifiestoSchema>;

export type IndiceAssets = ReadonlyMap<string, Asset>;

/** Junta varios manifiestos (marca, proyectos) en un índice por id. Un id repetido es un error. */
export const crearIndice = (manifiestos: unknown[]): IndiceAssets => {
  const indice = new Map<string, Asset>();
  for (const m of manifiestos) {
    for (const asset of manifiestoSchema.parse(m).assets) {
      if (indice.has(asset.id)) throw new Error(`Asset duplicado en los manifiestos: ${asset.id}`);
      indice.set(asset.id, asset);
    }
  }
  return indice;
};

/** Busca un asset por id; si no está en ningún manifiesto, falla con el id. */
export const asset = (indice: IndiceAssets, id: string): Asset => {
  const encontrado = indice.get(id);
  if (!encontrado) throw new Error(`Asset no encontrado en ningún manifiesto: ${id}`);
  return encontrado;
};

/** Una zona con nombre de un asset (o la n-ésima si es una lista). */
export const zonaDe = (a: Asset, nombre: string, n = 0): Zona => {
  const z = a.zonas[nombre];
  const zona = Array.isArray(z) ? z[n] : z;
  if (!zona)
    throw new Error(`Zona «${nombre}»${Array.isArray(z) ? `[${n}]` : ''} no existe en ${a.id}`);
  return zona;
};

/** Todas las zonas con ese nombre (lista, aunque sea una sola). */
export const zonasDe = (a: Asset, nombre: string): Zona[] => {
  const z = a.zonas[nombre];
  if (!z) throw new Error(`Zona «${nombre}» no existe en ${a.id}`);
  return Array.isArray(z) ? z : [z];
};

export const corteDe = (a: Asset, nombre: string): number => {
  const c = a.cortes[nombre];
  if (c === undefined) throw new Error(`Corte «${nombre}» no existe en ${a.id}`);
  return c;
};

export const centro = (z: Zona) => ({ x: z.x + z.w / 2, y: z.y + z.h / 2 });
