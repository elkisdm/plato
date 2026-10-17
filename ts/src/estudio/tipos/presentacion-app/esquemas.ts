import { z } from 'zod';

/**
 * Esquemas de props de cada escena del tipo «presentación de apps». Los assets se referencian
 * por id; las zonas, por nombre del manifiesto del asset (`"menu#2"` = la tercera de una lista).
 */
const id = z.string().min(1);
/** Frames que el scroll del correo arranca antes de `enfocarEn` (lo usa el componente). */
export const PREVIA_SCROLL = 46;

const refZona = z.string().regex(/^[a-zA-Z0-9]+(#\d+)?$/, 'zona «nombre» o «nombre#n»');

const nodoSchema = z.object({
  nombre: z.string(),
  icono: z.union([z.literal('navegador'), z.object({ inicial: z.string().length(1) })]),
});

export const puntoSchema = z.object({
  titulo: z.string(),
  texto: z.string(),
  icono: z.string().optional(),
});

/** Un resaltado sobre una zona del asset, desde el frame `inicio` (y hasta `fin`, si se da). */
export const resaltadoSchema = z.object({
  zona: refZona,
  inicio: z.number(),
  fin: z.number().optional(),
});

/**
 * Un toque del puntero: parte en `origen` (proporción del asset) en el frame `desde` y llega a la
 * zona en el frame `en`, desplazado `dx`/`dy` desde su centro (para no tapar el texto del botón).
 */
export const punteroSchema = z
  .object({
    zona: refZona,
    desde: z.number(),
    en: z.number(),
    origen: z.object({ x: z.number(), y: z.number() }),
    dx: z.number().default(0),
    dy: z.number().default(0),
    clic: z.boolean().default(true),
  })
  .refine((p) => p.en > p.desde, {
    message: 'el puntero debe llegar («en») después de partir («desde»)',
  });

/** Un globo de chat: la franja de la captura entre dos cortes con nombre. */
export const mensajeSchema = z.object({
  captura: id,
  inicio: z.number(),
  desde: z.string().default('encabezado'),
  hasta: z.string().default('fin'),
  saliente: z.boolean().default(false),
  resaltados: z.array(resaltadoSchema).default([]),
  puntero: punteroSchema.optional(),
});

/** Detalle ampliado de una zona de una captura, que entra sobre la parte libre del teléfono. */
export const lupaSchema = z.object({
  captura: id,
  zona: refZona,
  inicio: z.number(),
  resaltados: z.array(resaltadoSchema).default([]),
  puntero: punteroSchema.optional(),
});

export const esquemas = {
  /** El teléfono con lo que ve el cliente y el logo arriba. */
  gancho: z.object({ captura: id, logo: z.boolean().default(true) }),
  /** Pasos numerados que entran a medida que la locución llega a cada uno. */
  pasos: z.object({
    pasos: z.array(puntoSchema).min(1),
    primerPaso: z.number().default(24),
    entrePasos: z.number().default(72),
  }),
  /** Recorrido por secciones de una pantalla en un navegador, con puntero y resaltados. */
  recorrido: z.object({
    captura: id,
    url: z.string(),
    /** El navegador entra en leve perspectiva y se endereza durante la escena. */
    perspectiva: z.boolean().default(false),
    secciones: z
      .array(
        z.object({
          titulo: z.string(),
          texto: z.string(),
          /** Frame en que empieza la sección. */
          inicio: z.number(),
          resaltar: z.array(refZona).default([]),
          clic: refZona.optional(),
        }),
      )
      .min(1)
      .refine((ss) => ss.every((x, i) => i === 0 || x.inicio > (ss[i - 1]?.inicio ?? -1)), {
        message: 'las secciones deben ir en orden, con «inicio» estrictamente creciente',
      }),
  }),
  /** Un correo en tarjeta y, al lado, un chat de WhatsApp cuyos globos van llegando. */
  correoYWhatsapp: z.object({
    correo: z.object({
      captura: id,
      zona: refZona,
      resaltarEn: z.number().default(64),
      /** El scroll parte PREVIA_SCROLL frames antes: debe ser mayor para que los fotogramas crezcan. */
      enfocarEn: z.number().gt(PREVIA_SCROLL).default(70),
      puntero: punteroSchema.optional(),
    }),
    inicioTelefono: z.number().default(150),
    /** Asset del que sale el encabezado verde del chat (su corte «encabezado»). */
    encabezado: id,
    mensajes: z.array(mensajeSchema).min(1),
    /** Pantalla que entra sobre el chat (p. ej. al tocar un botón). */
    pantallaSiguiente: z.object({ captura: id, inicio: z.number() }).optional(),
  }),
  /** Título centrado y tarjetas con ícono en cascada. */
  cuadricula: z.object({
    puntos: z.array(puntoSchema).min(1),
    columnas: z.number().int().min(1).max(4).default(2),
  }),
  /** Portada: logo, título y subtítulo (texto de la escena), centrados. */
  portada: z.object({ logo: z.boolean().default(true) }),
  /** Cierre simple: el título y el logo. */
  cierre: z.object({ logoEn: z.number().default(60) }),
  /** Un chat en el teléfono y, encima de su parte libre, el detalle ampliado de lo importante. */
  chatConLupa: z.object({
    encabezado: id,
    mensajes: z.array(mensajeSchema).min(1),
    lupa: lupaSchema,
  }),
  /** Dos o más chats lado a lado, cada uno con su etiqueta y su lupa. */
  telefonosLadoALado: z.object({
    lados: z
      .array(
        z.object({
          etiqueta: z.string(),
          encabezado: id,
          mensajes: z.array(mensajeSchema).min(1),
          lupa: lupaSchema.optional(),
        }),
      )
      .min(2)
      .max(3),
  }),
  /** Escritorio en un navegador (opcionalmente recortado a una zona) y la versión móvil que entra por la derecha. */
  navegadorYTelefono: z.object({
    url: z.string(),
    escritorio: id,
    /** Zona del escritorio a la que se recorta (p. ej. para no mostrar funciones fuera de alcance). */
    recorte: refZona.optional(),
    movil: id,
    colorBarraMovil: z.string().default('#101341'),
    resaltados: z.array(resaltadoSchema).default([]),
    resaltadosMovil: z.array(resaltadoSchema).default([]),
    puntero: punteroSchema.optional(),
    inicioTelefono: z.number().default(150),
    topTelefono: z
      .object({ horizontal: z.number(), vertical: z.number() })
      .default({ horizontal: 250, vertical: 420 }),
  }),
  /** Ilustración de una videollamada: late «Grabando», se resalta el asistente y se escribe la transcripción. */
  videollamada: z.object({
    captura: id,
    tiempos: z
      .object({
        resaltado: z.number(),
        transcripcion: z.number(),
        pasoLinea: z.number(),
        duracionLinea: z.number(),
      })
      .default({ resaltado: 16, transcripcion: 40, pasoLinea: 42, duracionLinea: 34 }),
  }),
  /** Onda de voz y un mensaje que se acorta de «antes» a «ahora», con chips de mejoras. */
  ondaVoz: z.object({
    mejoras: z.array(z.string()).default([]),
    lineasAntes: z.number().min(1).default(6),
    lineasAhora: z.number().min(1).default(2),
  }),
  /** Dos nodos unidos por flechas en ambos sentidos, con etiquetas de lo que viaja por cada una. */
  diagrama: z.object({
    nodos: z.object({ izquierda: nodoSchema, derecha: nodoSchema }),
    conexiones: z
      .array(
        z.object({
          desde: z.enum(['izquierda', 'derecha']),
          origen: z.string(),
          destino: z.string(),
        }),
      )
      .min(1),
  }),
  /** Apertura: un teléfono en luz suave y un mensaje (imagen real) que llega; la cámara empuja hacia él. */
  notificacion: z.object({
    encabezado: id,
    imagen: id,
    hora: z.string().default('16:02'),
    llegaEn: z.number().default(20),
    empujeHasta: z.number().min(1).default(1.12),
  }),
  /** La cámara empuja hacia una zona de una captura móvil (p. ej. la foto de un perfil) y la rodea un anillo. */
  revelacion: z.object({
    captura: id,
    zona: refZona,
    empujeHasta: z.number().min(1).default(1.5),
    anilloEn: z.number().default(30),
  }),
  /** Título editorial grande, solo, con aire; opcionalmente arranca el hilo cian que sigue en la próxima escena. */
  titulo: z.object({ hilo: z.boolean().default(true) }),
  /** El recorrido como viaje: estaciones unidas por un hilo cian que la cámara sigue. */
  hilo: z.object({
    estaciones: z
      .array(
        z.object({ captura: id, etiqueta: z.string(), en: z.number(), zona: refZona.optional() }),
      )
      .min(2)
      .refine((es) => es.every((e, i) => i === 0 || e.en > (es[i - 1]?.en ?? -1)), {
        message: 'las estaciones deben ir en orden, con «en» estrictamente creciente',
      }),
  }),
  /** Giro de la historia: el día se vuelve noche en un barrido circular desde el centro. */
  cambioMundo: z.object({
    url: z.string(),
    barridoEn: z.number().default(6),
    barridoDura: z.number().min(1).default(30),
  }),
  /** Frases cinéticas, una por pantalla, cada una con su ícono opcional. */
  frases: z.object({
    frases: z.array(z.object({ texto: z.string(), icono: z.string().optional() })).min(1),
  }),
  /** Pantalla dividida (cliente de día / equipo de noche) que se une en una sola imagen, con los beneficios. */
  convergencia: z.object({
    cliente: id,
    equipo: id,
    /** Dirección que muestra la barra del navegador del lado del equipo. */
    url: z.string(),
    uneEn: z.number().default(50),
    beneficios: z.array(z.string()).min(1).max(4),
    /** Un frame (escalonado fijo) o uno por beneficio, para que cada uno entre cuando la voz lo nombra. */
    beneficiosEn: z.union([z.number(), z.array(z.number())]).default(80),
  }),
  /** Cierre que vuelve al teléfono del inicio: pasos para activarse, botón, URL (texto de la escena) y logo. */
  regreso: z.object({
    captura: id,
    pasos: z.array(puntoSchema).min(1).max(4),
    boton: z.string(),
    /** Frame de cada paso (uno por paso); sin él, entran escalonados desde el frame 24. */
    pasosEn: z.array(z.number()).optional(),
    botonEn: z.number().default(70),
    logoEn: z.number().default(140),
  }),
  /** Cierre: pasos para activarse, botón de llamado a la acción y logo. */
  llamado: z.object({
    pasos: z.array(puntoSchema).min(1),
    boton: z.string(),
    inicioPasos: z.number().default(18),
    inicioBoton: z.number().default(120),
    inicioLogo: z.number().default(170),
  }),
} as const;

export type NombreEscena = keyof typeof esquemas;
export type PropsDe<N extends NombreEscena> = z.infer<(typeof esquemas)[N]>;
