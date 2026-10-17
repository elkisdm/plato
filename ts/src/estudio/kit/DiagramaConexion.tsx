import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useMarca } from '../marca';
import { radios, tiempos } from '../tema';
import { avance, entrada } from './animacion';

type Punto = { x: number; y: number };
export type Lado = 'izquierda' | 'derecha';
/** Un nodo del diagrama: su nombre y su ícono (un navegador dibujado o una inicial). */
export type NodoDiagrama = { nombre: string; icono: 'navegador' | { inicial: string } };
/** Lo que viaja de un nodo al otro: «origen → destino», sobre la flecha de ese sentido. */
export type Conexion = { desde: Lado; origen: string; destino: string };

/** Punto de una curva cuadrática de Bézier en `t` (0 a 1). */
const bezier = (a: Punto, c: Punto, b: Punto, t: number): Punto => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
});

/** Frames de la coreografía: nodos, flecha de ida, etiquetas, flecha de vuelta. */
const RITMO = { nodoDerecho: 8, flechaIda: 22, flechaVuelta: 70, duracionFlecha: 26 } as const;

const IconoNodo: React.FC<{ icono: NodoDiagrama['icono'] }> = ({ icono }) => {
  const { colores, fuentes } = useMarca();
  if (icono === 'navegador') {
    return (
      <svg width={56} height={56} viewBox="0 0 56 56">
        <rect x={3} y={8} width={50} height={40} rx={9} fill={colores.indigoSuave} />
        <rect x={3} y={8} width={50} height={11} rx={5} fill={colores.navy} />
        <rect x={9} y={25} width={14} height={17} rx={3} fill={colores.indigo} />
        <rect x={27} y={25} width={20} height={4} rx={2} fill="#AEBBFF" />
        <rect x={27} y={33} width={14} height={4} rx={2} fill="#AEBBFF" />
      </svg>
    );
  }
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: colores.indigo,
        color: colores.blanco,
        fontFamily: fuentes.ui,
        fontWeight: 600,
        fontSize: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icono.inicial}
    </div>
  );
};

const TarjetaNodo: React.FC<{
  nodo: NodoDiagrama;
  centro: Punto;
  ancho: number;
  inicio: number;
}> = ({ nodo, centro, ancho, inicio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colores, fuentes } = useMarca();
  const t = entrada(frame, fps, inicio);
  return (
    <div
      style={{
        position: 'absolute',
        left: centro.x - ancho / 2,
        top: centro.y - 70,
        width: ancho,
        height: 140,
        borderRadius: radios.tarjeta,
        background: colores.blanco,
        boxShadow: '0 30px 70px -30px rgba(3, 6, 25, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: t,
        transform: `translateY(${(1 - t) * 30}px) scale(${0.94 + 0.06 * t})`,
      }}
    >
      <IconoNodo icono={nodo.icono} />
      <span
        style={{ fontFamily: fuentes.serif, fontSize: 40, lineHeight: 1, color: colores.texto }}
      >
        {nodo.nombre}
      </span>
    </div>
  );
};

type Curva = { a: Punto; c: Punto; b: Punto };

/** Flecha curva que se dibuja, con punta al final y un pulso que la recorre una y otra vez. */
const Flecha: React.FC<{ curva: Curva; inicio: number }> = ({ curva, inicio }) => {
  const frame = useCurrentFrame();
  const { colores } = useMarca();
  const trazo = avance(frame, inicio, RITMO.duracionFlecha);
  const { a, c, b } = curva;
  const angulo = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI;
  const pulso = bezier(a, c, b, ((frame - inicio - RITMO.duracionFlecha) / 40) % 1);
  const hayPulso = frame > inicio + RITMO.duracionFlecha;
  return (
    <g>
      <path
        d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`}
        fill="none"
        stroke={colores.indigo}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - trazo}
      />
      <polygon
        points="0,0 -16,-8 -16,8"
        fill={colores.indigo}
        opacity={trazo > 0.96 ? 1 : 0}
        transform={`translate(${b.x} ${b.y}) rotate(${angulo})`}
      />
      {hayPulso ? <circle cx={pulso.x} cy={pulso.y} r={6} fill={colores.cian} /> : null}
    </g>
  );
};

const Etiqueta: React.FC<{ origen: string; destino: string; inicio: number; tamano: number }> = ({
  origen,
  destino,
  inicio,
  tamano,
}) => {
  const frame = useCurrentFrame();
  const { colores, fuentes } = useMarca();
  const t = avance(frame, inicio, tiempos.entrada);
  return (
    <div
      style={{
        padding: '10px 22px',
        borderRadius: 999,
        background: 'rgba(233, 237, 255, 0.08)',
        border: '1px solid rgba(233, 237, 255, 0.16)',
        fontFamily: fuentes.ui,
        fontSize: tamano,
        color: 'rgba(233, 237, 255, 0.85)',
        whiteSpace: 'nowrap',
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      <b style={{ color: colores.blanco, fontWeight: 600 }}>{origen}</b>
      <span style={{ color: colores.cian, margin: '0 12px' }}>→</span>
      {destino}
    </div>
  );
};

type Props = {
  ancho: number;
  alto: number;
  nodos: Record<Lado, NodoDiagrama>;
  conexiones: Conexion[];
};

/** Dos nodos unidos por flechas en ambos sentidos, con lo que viaja por cada una. */
export const DiagramaConexion: React.FC<Props> = ({ ancho, alto, nodos, conexiones }) => {
  const anchoNodo = Math.min(300, ancho * 0.27);
  // Altura de las curvas y separación de las etiquetas, proporcionales al alto disponible.
  const arco = alto * 0.3;
  const cresta = (36 + arco) / 2;
  const medio = alto / 2;
  const izquierda: Punto = { x: anchoNodo / 2, y: medio };
  const derecha: Punto = { x: ancho - anchoNodo / 2, y: medio };
  const ida: Curva = {
    a: { x: anchoNodo + 16, y: medio - 36 },
    c: { x: ancho / 2, y: medio - arco },
    b: { x: ancho - anchoNodo - 16, y: medio - 36 },
  };
  const vuelta: Curva = {
    a: { x: ancho - anchoNodo - 16, y: medio + 36 },
    c: { x: ancho / 2, y: medio + arco },
    b: { x: anchoNodo + 16, y: medio + 36 },
  };
  const tamanoEtiqueta = ancho < 1000 ? 24 : 28;
  const inicioEtiqueta = (i: number) =>
    conexiones[i]?.desde === 'izquierda'
      ? RITMO.flechaIda + RITMO.duracionFlecha - 6 + i * 14
      : RITMO.flechaVuelta + RITMO.duracionFlecha - 6;
  const grupo = (desde: Lado) =>
    conexiones
      .map((c, i) => ({ ...c, i }))
      .filter((c) => c.desde === desde)
      .map((c) => (
        <Etiqueta
          key={c.i}
          origen={c.origen}
          destino={c.destino}
          inicio={inicioEtiqueta(c.i)}
          tamano={tamanoEtiqueta}
        />
      ));
  const columna: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  };

  return (
    <div style={{ position: 'relative', width: ancho, height: alto }}>
      <svg
        width={ancho}
        height={alto}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <Flecha curva={ida} inicio={RITMO.flechaIda} />
        <Flecha curva={vuelta} inicio={RITMO.flechaVuelta} />
      </svg>
      <div style={{ ...columna, bottom: alto - (medio - cresta - 24) }}>{grupo('izquierda')}</div>
      <div style={{ ...columna, top: medio + cresta + 24 }}>{grupo('derecha')}</div>
      <TarjetaNodo nodo={nodos.izquierda} centro={izquierda} ancho={anchoNodo} inicio={0} />
      <TarjetaNodo
        nodo={nodos.derecha}
        centro={derecha}
        ancho={anchoNodo}
        inicio={RITMO.nodoDerecho}
      />
    </div>
  );
};
