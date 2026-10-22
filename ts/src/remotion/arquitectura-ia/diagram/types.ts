/**
 * Contrato del sistema de diagramas. Las posiciones son del MUNDO (coordenadas
 * del canvas cuando la cámara está en reposo) y x,y es el centro del nodo.
 * Las conexiones no guardan coordenadas: se calculan desde los nodos.
 */

import type { Side } from '../lib/geometry';

export type NodeType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'agent'
  | 'service'
  | 'user'
  | 'server'
  | 'source';

export interface ArchitectureNodeSpec {
  id: string;
  label: string;
  subtitle?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: NodeType;
  /** Frame local en que empieza a construirse. Sin valor: ya construido. */
  at?: number;
}

export interface ConnectionSpec {
  from: string;
  to: string;
  direction?: 'one-way' | 'two-way';
  /** false: la línea ya está trazada (sin animación de dibujo). */
  animated?: boolean;
  fromSide?: Side;
  toSide?: Side;
  /** Frame local en que empieza a dibujarse. */
  at?: number;
}

/** Señales de microinteracción por nodo, en frames locales. */
export interface NodeSignals {
  /** Llegadas de datos: la DB late un 3 %. */
  hits?: number[];
  /** Llegadas a un agente: procesa (tres puntos) un rato. */
  busy?: number[];
  /** El servidor pasa de gris a verde. */
  onlineAt?: number;
  /** Auth valida: check pequeño. */
  checkAt?: number;
}

export const NODE_DEFAULTS = { width: 240, height: 88 } as const;
