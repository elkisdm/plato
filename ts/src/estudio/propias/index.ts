import type React from 'react';
import type { Escena } from '../proyecto';

/**
 * Escape a código (ADR-0011): escenas únicas que no justifican entrar al catálogo de un tipo.
 * En el guion se usan con `"escena": "propia:<nombre>"`; sus props llegan sin validar.
 */
export const escenasPropias: Record<
  string,
  React.FC<{ escena: Escena; props: Record<string, unknown> }>
> = {};
