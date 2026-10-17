import type { PropsDe } from './esquemas';

export type FondoVideo = NonNullable<PropsDe<'firma'>['fondo']>;

/** El fondo de video de una escena, o null si usa el fondo del tipo (`FondoRedes`). */
export const fondoDeEscena = (props: { fondo?: FondoVideo }): FondoVideo | null =>
  props.fondo ?? null;
