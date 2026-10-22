/**
 * El sistema multi-superficie de la escena central, compartido por las
 * escenas 5 (se construye), 6 (se separa por regiones), 7 (criterio) y 8
 * (cierre). Una sola fuente: si cambia una posición, cambia en todo el video.
 *
 * Los `at` son frames locales de MultiStackScene (el orden de construcción).
 */

import type { CameraPose } from '../lib/motion';
import { chainPulses, type PulseSpec } from '../lib/pulses';
import type { ArchitectureNodeSpec, ConnectionSpec } from './types';

const SOURCE = { width: 230, height: 64, type: 'source' as const };

export const SYSTEM_NODES: ArchitectureNodeSpec[] = [
  {
    id: 'web',
    label: 'Web + Blog',
    subtitle: 'ASTRO',
    x: 780,
    y: 360,
    width: 330,
    height: 96,
    type: 'frontend',
    at: 95,
  },
  {
    id: 'crm',
    label: 'CRM',
    subtitle: 'NEXT.JS · TANSTACK',
    x: 780,
    y: 600,
    width: 360,
    height: 104,
    type: 'service',
    at: 110,
  },
  { id: 'fb', label: 'Facebook Ads', x: 145, y: 400, ...SOURCE, at: 135 },
  { id: 'form', label: 'Formulario', x: 145, y: 490, ...SOURCE, at: 141 },
  { id: 'ref', label: 'Referidos', x: 145, y: 580, ...SOURCE, at: 147 },
  {
    id: 'leads',
    label: 'Leads',
    subtitle: 'ENTRADA',
    x: 440,
    y: 490,
    width: 200,
    height: 88,
    type: 'service',
    at: 152,
  },
  {
    id: 'agentIA',
    label: 'Agente IA',
    subtitle: 'ATIENDE · CALIFICA',
    x: 560,
    y: 850,
    width: 320,
    height: 96,
    type: 'agent',
    at: 195,
  },
  {
    id: 'agentBrowser',
    label: 'Agente browser',
    subtitle: 'INGRESA VENTAS',
    x: 930,
    y: 850,
    width: 300,
    height: 96,
    type: 'agent',
    at: 203,
  },
  {
    id: 'vps',
    label: 'Node.js',
    subtitle: 'VPS',
    x: 745,
    y: 1070,
    width: 300,
    height: 96,
    type: 'server',
    at: 226,
  },
  {
    id: 'supa',
    label: 'Supabase',
    subtitle: 'POSTGRES + AUTH',
    x: 745,
    y: 1250,
    width: 340,
    height: 100,
    type: 'database',
    at: 248,
  },
];

export const SYSTEM_EDGES: ConnectionSpec[] = [
  { from: 'fb', to: 'leads', at: 160 },
  { from: 'form', to: 'leads', at: 165 },
  { from: 'ref', to: 'leads', at: 170 },
  { from: 'leads', to: 'crm', at: 180 },
  { from: 'web', to: 'crm', at: 120 },
  { from: 'crm', to: 'agentIA', at: 206 },
  { from: 'crm', to: 'agentBrowser', at: 213 },
  { from: 'agentIA', to: 'vps', at: 234 },
  { from: 'agentBrowser', to: 'vps', at: 240 },
  { from: 'vps', to: 'supa', direction: 'two-way', at: 256 },
];

/** Recorridos de un dato: fuente → leads → CRM → agente → VPS → DB. */
const CHAINS = [[0, 3, 5, 7, 9], [1, 3, 6, 8, 9], [4], [2, 3, 5, 7, 9]];

/** Pulsos ambientales del sistema funcionando, desde `from` hasta `until`. */
export function systemPulses(from: number, until: number): PulseSpec[] {
  return chainPulses(CHAINS, { from, until, period: 110, hop: 16, offsets: [0, 38, 18, 70] });
}

/** Frame local (MultiStack) en que Auth valida por primera vez. */
export const AUTH_CHECK_AT = 270;

/** El mismo sistema ya construido (para las escenas que lo reutilizan). */
export const BUILT_NODES: ArchitectureNodeSpec[] = SYSTEM_NODES.map(({ at: _at, ...n }) => n);
export const BUILT_EDGES: ConnectionSpec[] = SYSTEM_EDGES.map(({ at: _at, ...e }) => e);

/** Encuadres de cámara del sistema. */
export const SYSTEM_POSES = {
  /** Sistema completo con aire para titular arriba y texto abajo. */
  full: { x: 555, y: 814, zoom: 0.82 },
  /** "Alejar ligeramente la cámara" al terminar de construir. */
  wide: { x: 555, y: 824, zoom: 0.76 },
} satisfies Record<string, CameraPose>;
