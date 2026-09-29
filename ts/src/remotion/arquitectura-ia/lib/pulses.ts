/**
 * Programación de pulsos de datos sobre las conexiones.
 *
 * Un pulso recorre una conexión (índice en la lista de edges) en `duration`
 * frames. Las cadenas encadenan tramos para que un dato "viaje" por el sistema
 * (lead → CRM → agente → VPS → DB). `arrivals` deriva cuándo llega cada pulso
 * a su nodo: de ahí salen las microinteracciones (pulse de la DB, puntos del
 * agente) sin estado, solo con el frame.
 */

export interface PulseSpec {
  edge: number;
  start: number;
  duration: number;
  /** Recorre la conexión de destino a origen (respuesta de ida y vuelta). */
  reverse?: boolean;
  /** Paquete con etiqueta (SELECT, INSERT…) en vez de punto. */
  label?: string;
}

export function chainPulses(
  chains: number[][],
  opts: { from: number; until: number; period: number; hop: number; offsets: number[] },
): PulseSpec[] {
  const out: PulseSpec[] = [];
  for (const [ci, chain] of chains.entries()) {
    for (let s = opts.from + (opts.offsets[ci] ?? 0); s < opts.until; s += opts.period) {
      for (const [j, edge] of chain.entries()) {
        out.push({ edge, start: s + j * opts.hop, duration: opts.hop });
      }
    }
  }
  return out;
}

export function arrivals(
  pulses: PulseSpec[],
  edges: { from: string; to: string }[],
): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const p of pulses) {
    const e = edges[p.edge];
    if (!e) throw new Error(`Pulso sobre una conexión inexistente: ${p.edge}`);
    const node = p.reverse ? e.from : e.to;
    (out[node] ??= []).push(p.start + p.duration);
  }
  for (const frames of Object.values(out)) frames.sort((a, b) => a - b);
  return out;
}
