import { z } from 'zod';

/** Zócalo (lower third) opcional: quién o qué se muestra, p. ej. «El Mercurio» + «Fuente». */
const zocalo = z.object({ nombre: z.string().min(1), detalle: z.string().optional() });

const idAsset = z.string().min(1);

/**
 * Toma de video real bajo los gráficos de la escena (cover, silenciada, con empuje lento y velo de
 * marca). `velo: 'fuerte'` oscurece más: úsalo en escenas con mucho texto. `desde` y `velocidad`
 * recortan el arranque de la toma y su ritmo.
 */
const fondoVideo = z.object({
  video: idAsset,
  desde: z.number().min(0).default(0),
  velo: z.enum(['suave', 'fuerte']).default('suave'),
  velocidad: z.number().min(0.25).max(2).default(1),
});

/** Props comunes a todas las escenas del tipo: subtítulos palabra por palabra (apagables) y zócalo. */
const comunes = {
  subtitulos: z.boolean().default(true),
  zocalo: zocalo.optional(),
  /** Texto de pantalla distinto al hablado («cincuenta mil» → «50.000»), como en el tipo anuncio. */
  reemplazos: z
    .array(z.object({ dice: z.string().min(1), muestra: z.string().min(1) }))
    .default([]),
  /** Toma de video como fondo de la escena; sin ella, la escena usa el fondo del tipo. */
  fondo: fondoVideo.optional(),
};

/** Las escenas que ya dibujan su propio fondo (foto, clip) no combinan con `fondo`. */
const sinFondoPropio = {
  message: 'esta escena ya trae su propio fondo: quita `fondo` o usa otra escena',
  path: ['fondo'],
};

/** Cuánto de la foto se mueve: acercar/alejar (zoom lento) o paneo horizontal. */
export const movimientos = ['acercar', 'alejar', 'paneo-izq', 'paneo-der'] as const;

export const esquemas = {
  /** Isotipo que entra con máscara y luego el wordmark. */
  firma: z.object({ ...comunes }),
  /** Foto real a pantalla completa con cámara lenta y paralaje; título serif opcional (*cursiva*). */
  foto: z
    .object({
      asset: idAsset,
      movimiento: z.enum(movimientos).default('acercar'),
      titulo: z.string().optional(),
      antetitulo: z.string().optional(),
      ...comunes,
    })
    .refine((p) => p.fondo === undefined, sinFondoPropio),
  /** Captura móvil dentro de un teléfono sobre fondo de marca. */
  pantalla: z.object({
    captura: idAsset,
    titulo: z.string().optional(),
    ...comunes,
  }),
  /** Cita grande sobre una foto de fondo opcional. */
  cita: z
    .object({
      texto: z.string().min(1),
      autor: z.string().min(1),
      fuente: z.string().optional(),
      asset: idAsset.optional(),
      ...comunes,
    })
    .refine((p) => p.fondo === undefined || p.asset === undefined, sinFondoPropio),
  /** Una cifra grande (con etiqueta) o una lista corta, nunca ambas. */
  dato: z
    .object({
      cifra: z.string().min(1).optional(),
      etiqueta: z.string().optional(),
      lista: z.array(z.string().min(1)).min(1).max(5).optional(),
      titulo: z.string().optional(),
      /** Foto de fondo (si no hay `fondo` de video). */
      asset: idAsset.optional(),
      ...comunes,
    })
    .refine((p) => (p.cifra === undefined) !== (p.lista === undefined), {
      message: 'indica exactamente una de `cifra` o `lista`',
      path: ['cifra'],
    }),
  /** Piezas ya terminadas (imágenes) en una grilla inclinada que deriva lento. */
  mosaico: z.object({
    piezas: z.array(idAsset).min(1).max(6),
    titulo: z.string().optional(),
    ...comunes,
  }),
  /** Video de fondo (silenciado, cover); su largo lo manda la duración de la escena. */
  clip: z
    .object({
      video: idAsset,
      /** Segundo del clip en que arranca. */
      desde: z.number().min(0).default(0),
      titulo: z.string().optional(),
      /** El clip suena (es una persona hablando): la escena dura lo que el clip y la música baja bajo él. */
      audio: z.boolean().default(false),
      /** Fracción del alto de la toma que se conserva (p. ej. {arriba: 0, abajo: 0,7} quita subtítulos quemados abajo). */
      recorte: z
        .object({
          arriba: z.number().min(0).max(1).default(0),
          abajo: z.number().min(0).max(1).default(1),
        })
        .refine((r) => r.arriba < r.abajo, { message: '`arriba` debe ser menor que `abajo`' })
        .optional(),
      /** `completa` cubre el lienzo; `tarjeta` la muestra como tarjeta 4:5 sobre una copia suya desenfocada. */
      presentacion: z.enum(['completa', 'tarjeta']).default('completa'),
      /** Lo que dice el clip, con tiempos en segundos de la toma: alimenta los subtítulos de marca. */
      palabras: z
        .array(
          z
            .object({
              texto: z.string().min(1),
              desde: z.number().min(0),
              hasta: z.number().min(0),
            })
            .refine((p) => p.hasta > p.desde, { message: '`hasta` debe ser mayor que `desde`' }),
        )
        .optional(),
      ...comunes,
    })
    .refine((p) => p.fondo === undefined, sinFondoPropio),
  /** Logo, llamado y url/handle; lo que no se indica sale de `marca.identidad`. */
  cierre: z.object({
    llamado: z.string().optional(),
    url: z.string().optional(),
    ...comunes,
    /** El llamado ya está en pantalla: sin subtítulos salvo que se pidan. */
    subtitulos: z.boolean().default(false),
  }),
};

export type NombreEscena = keyof typeof esquemas;
export type PropsDe<N extends NombreEscena> = z.infer<(typeof esquemas)[N]>;
