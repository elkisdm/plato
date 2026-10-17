import { z } from 'zod';

/**
 * Esquemas de props del tipo «comercial»: motion graphics sin capturas, para contar qué hace un
 * producto a grandes rasgos. Las gráficas son ilustrativas: sus valores van de 0 a 1 y nunca se
 * rotulan con cifras.
 */
export const esquemas = {
  /** La presentación: orbe que respira, onda de voz y el logo de la marca. */
  saludo: z.object({ logo: z.boolean().default(true) }),
  /** Un teléfono que suena con ondas y una línea de tiempo corta entre dos hitos. */
  llamada: z.object({ desde: z.string(), hasta: z.string() }),
  /** Un nodo central con sus canales en órbita, unidos por pulsos que viajan. */
  canales: z.object({
    centro: z.string().default('Tu marca'),
    canales: z.array(z.string()).min(2).max(4),
  }),
  /** Globos de chat que llegan uno tras otro y un reloj que da la vuelta completa. */
  conversacion: z.object({
    mensajes: z.number().int().min(2).max(6).default(4),
    reloj: z.string().default('24/7'),
  }),
  /** Un calendario que se recorre y una hora que queda marcada con su confirmación. */
  agenda: z.object({ confirmacion: z.string(), celda: z.number().int().min(0).max(14).default(8) }),
  /** Barras que crecen y una curva que se dibuja encima. */
  grafica: z.object({ serie: z.array(z.number().min(0).max(1)).min(3).max(10) }),
  /** El cierre: nombre grande, onda y logo. */
  cierre: z.object({ logo: z.boolean().default(true) }),
};

export type NombreEscena = keyof typeof esquemas;
export type PropsDe<N extends NombreEscena> = z.infer<(typeof esquemas)[N]>;

type Punto = [number, number];

/** Trazo SVG que pasa por todos los puntos con curvas suaves (tangentes horizontales en cada punto). */
export const curvaSuave = (puntos: Punto[]): string => {
  const [primero, ...resto] = puntos;
  if (!primero) return '';
  let d = `M ${primero[0]} ${primero[1]}`;
  let previo = primero;
  for (const p of resto) {
    const medio = (previo[0] + p[0]) / 2;
    d += ` C ${medio} ${previo[1]} ${medio} ${p[1]} ${p[0]} ${p[1]}`;
    previo = p;
  }
  return d;
};

/** Coloca una serie 0–1 en un lienzo de `ancho` × `alto` (1 queda arriba). */
export const puntosDeSerie = (serie: number[], ancho: number, alto: number): Punto[] =>
  serie.map((v, i) => [(i / (serie.length - 1)) * ancho, (1 - v) * alto]);

/** Posición del nodo `i` de `n` en un círculo de `radio`, empezando arriba y en sentido horario. */
export const enOrbita = (i: number, n: number, radio: number, giro = 0): Punto => {
  const angulo = (i / n) * Math.PI * 2 - Math.PI / 2 + giro;
  return [Math.cos(angulo) * radio, Math.sin(angulo) * radio];
};
