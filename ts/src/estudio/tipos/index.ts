import type React from 'react';
import { escenasPropias } from '../propias';
import type { Escena, Formato, Guion } from '../proyecto';
import { anuncio } from './anuncio';
import { comercial } from './comercial';
import { presentacionApp } from './presentacion-app';
import { redes } from './redes';

export type Catalogo = {
  id: string;
  esquemas: Record<
    string,
    { safeParse: (v: unknown) => { success: boolean; data?: unknown; error?: { message: string } } }
  >;
  componentes: Record<string, React.FC<{ escena: Escena; props: never }>>;
  /** Fondo propio del tipo (si no, el `Fondo` del kit). */
  fondo?: React.FC;
  /** Sus escenas miden el tiempo con `useCuadro` (base de 30), así que puede renderizarse a 60 fps. */
  admite60?: boolean;
  /** Formatos que admite (por defecto horizontal y vertical): `retrato` solo lo declaran los tipos que lo componen. */
  formatos?: Formato[];
};

/** Tipos de video disponibles. Un tipo nuevo (capacitación, explicativo) se suma aquí. */
export const tipos: Record<string, Catalogo> = {
  'presentacion-app': presentacionApp,
  comercial,
  anuncio,
  redes,
};

/**
 * Un tipo con escenas que cuentan cuadros reales (`useCurrentFrame`) iría al doble de velocidad a
 * 60 fps: solo los tipos marcados `admite60` pueden subir la tasa.
 */
export const validarFps = (tipo: string, fps: number): void => {
  if (fps !== 30 && !tipos[tipo]?.admite60) {
    throw new Error(
      `El tipo ${tipo} no admite ${fps} fps: sus escenas cuentan cuadros de 30 (usa 30 o migra sus escenas a useCuadro)`,
    );
  }
};

const FORMATOS_POR_DEFECTO: Formato[] = ['horizontal', 'vertical'];

/** Un formato que el tipo no declara (p. ej. `retrato` en `comercial`) falla antes de renderizar. */
export const validarFormatos = (
  tipo: string,
  formatos: Formato[],
  catalogo: Record<string, Catalogo> = tipos,
): void => {
  const admitidos = catalogo[tipo]?.formatos ?? FORMATOS_POR_DEFECTO;
  for (const f of formatos) {
    if (!admitidos.includes(f)) throw new Error(`El tipo ${tipo} no admite el formato ${f}`);
  }
};

export type EscenaResuelta = {
  escena: Escena;
  props: unknown;
  Componente: React.FC<{ escena: Escena; props: never }>;
};

/**
 * Valida cada escena del guion contra el catálogo de su tipo y devuelve su componente y sus
 * props ya parseadas. Un tipo o una escena desconocida, o props inválidas, fallan con el id.
 */
export const resolverGuion = (guion: Guion, tipo: string): EscenaResuelta[] => {
  const catalogo = tipos[tipo];
  if (!catalogo) throw new Error(`Tipo de video desconocido: ${tipo}`);
  return guion.escenas.map((escena) => {
    if (escena.escena.startsWith('propia:')) {
      const Componente = escenasPropias[escena.escena.slice('propia:'.length)];
      if (!Componente)
        throw new Error(`Escena ${escena.id}: no existe la escena propia «${escena.escena}»`);
      return {
        escena,
        props: escena.props,
        Componente: Componente as React.FC<{ escena: Escena; props: never }>,
      };
    }
    const esquema = catalogo.esquemas[escena.escena];
    const Componente = catalogo.componentes[escena.escena];
    if (!esquema || !Componente) {
      throw new Error(`Escena ${escena.id}: «${escena.escena}» no está en el catálogo de ${tipo}`);
    }
    const r = esquema.safeParse(escena.props);
    if (!r.success)
      throw new Error(
        `Escena ${escena.id} (${escena.escena}): props inválidas — ${r.error?.message}`,
      );
    return { escena, props: r.data, Componente };
  });
};
