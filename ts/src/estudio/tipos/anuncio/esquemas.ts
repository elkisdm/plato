import { z } from 'zod';

const iso = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'debe ser una fecha ISO válida' });

/** Zona de una captura en proporción a la imagen completa (0–1), igual que en el resto del kit. */
const zona = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

/** Subtítulos palabra por palabra de la escena (a partir de los tiempos de voz.json). */
const subtitulos = (porDefecto = true) => z.boolean().default(porDefecto);

/** Texto de pantalla distinto al hablado: la secuencia hablada `dice` se muestra como `muestra`. */
const reemplazos = z
  .array(z.object({ dice: z.string().min(1), muestra: z.string().min(1) }))
  .default([]);

/** Datos de la franja de marca (y≈1330–1700): se leen de la primera escena que los declara. */
const franja = z
  .union([
    z.literal(false),
    z.object({
      texto: z.string().default(''),
      /** Segunda línea del bloque de texto (p. ej. «Envío gratis · 24 h»). */
      detalle: z.string().optional(),
      precio: z.string().optional(),
      boton: z.string().optional(),
    }),
  ])
  .optional();

/**
 * Props comunes a todas las escenas: fondo a pantalla completa (asset de imagen o de VIDEO, con
 * `foco`/`paneo` y, en video, `fondoDesde` en segundos), el velo oscuro que lo acompaña, la franja de
 * marca y los subtítulos.
 */
const comunes = {
  fondo: z.string().min(1).optional(),
  /** Encuadre del fondo (object-position, 0–1): útil para una imagen horizontal en vertical. */
  foco: z
    .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
    .default({ x: 0.5, y: 0.5 }),
  /** Paneo horizontal lento del fondo, de `desde` a `hasta` (0–1) a lo largo de la escena. */
  paneo: z.object({ desde: z.number().min(0).max(1), hasta: z.number().min(0).max(1) }).optional(),
  /** Segundo del video de fondo en que arranca (se ignora en imágenes). */
  fondoDesde: z.number().min(0).default(0),
  /**
   * Montaje de gameplay a pantalla completa en lugar de un solo `fondo`: los clips rotan con un
   * corte en cada arranque de palabra (a lo más cada 2 s), cada corte con zoom-punch y destello.
   */
  montaje: z
    .object({
      clips: z.array(z.string().min(1)).min(1).max(8),
      /** Desplaza con cuál clip parte la rotación (para no repetir el arranque de otra escena). */
      desfase: z.number().int().min(0).default(0),
    })
    .optional(),
  /** Intensidad del velo oscuro sobre el fondo (1 = normal). */
  velo: z.number().min(0).max(1.6).default(1),
  /** Desenfoque del fondo en px (la portada del cierre va desenfocada). */
  desenfoque: z.number().min(0).max(60).default(0),
  /** `false` apaga la franja de marca en esta escena; un objeto declara sus datos. */
  franja,
  subtitulos: subtitulos(),
  reemplazos,
};

const tarjetaPrecio = z.object({
  etiqueta: z.string().min(1),
  monto: z.string().min(1),
  nota: z.string().optional(),
});

export const iconosSello = ['cuenta', 'escudo', 'rayo', 'reloj'] as const;

/**
 * Esquemas de props del tipo «anuncio»: anuncios verticales de Meta (Reels/Stories 9:16 y 4:5).
 * Las imágenes (fondos, capturas, portadas, logos) llegan SIEMPRE como ids de asset raster: el
 * código no dibuja personajes ni logos de terceros.
 */
export const esquemas = {
  /** Frases grandes cinéticas, palabra por palabra o línea por línea; `acento` va en ámbar. */
  gancho: z.object({
    lineas: z.array(z.string().min(1)).min(1).max(4),
    acento: z.array(z.string().min(1)).default([]),
    modo: z.enum(['palabra', 'linea']).default('palabra'),
    /** Cuadros (base 30) entre una entrada y la siguiente. */
    paso: z.number().int().min(2).max(30).default(9),
    ...comunes,
  }),
  /** Tarjeta de referencia que se tacha y, luego, nuestro precio con impacto. */
  'precio-tachado': z.object({
    referencia: tarjetaPrecio,
    precio: z.object({
      etiqueta: z.string().default(''),
      monto: z.string().min(1),
      nota: z.string().optional(),
    }),
    tachaEn: z.number().int().min(0).default(34),
    precioEn: z.number().int().min(0).default(62),
    ...comunes,
  }),
  /** Contador de ahorro de 0 al monto, en pesos chilenos. */
  ahorro: z.object({
    monto: z.number().int().positive(),
    antes: z.string().default('Te ahorras'),
    despues: z.string().default(''),
    inicioEn: z.number().int().min(0).default(10),
    duracion: z.number().int().min(10).default(48),
    ...comunes,
  }),
  /** Teléfono con perspectiva que muestra una captura, un resalte que se dibuja y un puntero que toca. */
  'telefono-3d': z.object({
    /** Desactivados por defecto: el teléfono ocupa la franja donde van los subtítulos. */
    ...comunes,
    subtitulos: subtitulos(false),
    captura: z.string().min(1),
    texto: z.string().optional(),
    resalte: z
      .object({
        forma: z.enum(['circulo', 'recuadro']).default('circulo'),
        en: z.number().int().min(0).default(50),
        zona,
      })
      .optional(),
    toque: z
      .object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        en: z.number().int().min(0).default(70),
        /** Botón que se presiona con el toque (opcional). */
        zona: zona.optional(),
      })
      .optional(),
  }),
  /** Sellos de confianza que entran escalonados. */
  sellos: z.object({
    ...comunes,
    titulo: z.string().optional(),
    sellos: z
      .array(
        z.object({
          icono: z.enum(iconosSello),
          texto: z.string().min(1),
          detalle: z.string().optional(),
        }),
      )
      .min(2)
      .max(4),
  }),
  /** Portada oficial (raster, sin tocar) dentro de un monitor con perspectiva, reflejo y halo. */
  'portada-monitor': z.object({
    portada: z.string().min(1),
    /** `false`: sin monitor (el fondo, p. ej. el video de la portada, hace de protagonista). */
    monitor: z.boolean().default(true),
    logo: z.string().min(1).optional(),
    logoEn: z.number().int().min(0).default(40),
    etiqueta: z.string().optional(),
    ...comunes,
  }),
  /** Días, horas y minutos entre `desde` y `hasta` (ISO), con dígitos que giran. */
  'cuenta-regresiva': z
    .object({
      desde: iso,
      hasta: iso,
      etiqueta: z.string().default('Faltan'),
      /** Texto bajo la cuenta (p. ej. el día del lanzamiento). */
      nota: z.string().optional(),
      ...comunes,
    })
    .refine((p) => Date.parse(p.hasta) >= Date.parse(p.desde), {
      message: '`hasta` no puede ser anterior a `desde`',
      path: ['hasta'],
    }),
  /** Fecha grande sobre el fondo: antetítulo, día enorme, mes y, opcional, el año. */
  fecha: z.object({
    antetitulo: z.string().default('Sale el'),
    dia: z.string().min(1),
    mes: z.string().min(1),
    anio: z.string().optional(),
    ...comunes,
  }),
  /** Logo de la marca, botón de llamado y, opcional, el precio. */
  cierre: z.object({
    mensaje: z.string().optional(),
    boton: z.string().min(1),
    precio: z.string().optional(),
    logo: z.boolean().default(true),
    /** Portada oficial (asset raster, tal cual) como tarjeta de producto inclinada con brillo. */
    imagen: z.string().min(1).optional(),
    ...comunes,
  }),
};

export type NombreEscena = keyof typeof esquemas;
export type PropsDe<N extends NombreEscena> = z.infer<(typeof esquemas)[N]>;
