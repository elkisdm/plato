import React from 'react';
import { useMarca } from '../marca';
import { radios } from '../tema';
import { avance, porTramos } from './animacion';
import { useCuadro } from './tiempo';

const BARRAS = 44;

/** Onda de voz viva: cada barra combina dos senos desfasados, sin azar, para que el render sea estable. */
export const Onda: React.FC<{ ancho: number; alto: number }> = ({ ancho, alto }) => {
  const frame = useCuadro();
  const { colores } = useMarca();
  const paso = ancho / BARRAS;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: paso * 0.35,
        height: alto,
        width: ancho,
      }}
    >
      {Array.from({ length: BARRAS }, (_, i) => {
        const envolvente = Math.sin((i / (BARRAS - 1)) * Math.PI);
        const vivo =
          0.35 + 0.65 * Math.abs(Math.sin(frame / 6 + i * 0.7) * Math.cos(frame / 11 + i * 0.3));
        return (
          <div
            key={i}
            style={{
              width: paso * 0.65,
              height: Math.max(6, alto * envolvente * vivo),
              borderRadius: paso,
              background: `linear-gradient(180deg, ${colores.cian}, ${colores.indigo})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Globo de diálogo con líneas de relleno: muestra el largo de un mensaje, no un texto inventado. */
const Globo: React.FC<{ etiqueta: string; lineas: number; activo: boolean; ancho: number }> = ({
  etiqueta,
  lineas,
  activo,
  ancho,
}) => {
  const { colores, fuentes } = useMarca();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: ancho,
        opacity: activo ? 1 : 0.5,
      }}
    >
      <span
        style={{
          fontFamily: fuentes.ui,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: activo ? colores.cian : 'rgba(233, 237, 255, 0.7)',
        }}
      >
        {etiqueta.toUpperCase()}
      </span>
      <div
        style={{
          borderRadius: `${radios.tarjeta}px ${radios.tarjeta}px ${radios.tarjeta}px 6px`,
          background: activo ? colores.blanco : 'rgba(233, 237, 255, 0.1)',
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {Array.from({ length: Math.ceil(lineas) }, (_, i) => {
          const resto = Math.min(1, lineas - i);
          return (
            <div
              key={i}
              style={{
                height: 12,
                borderRadius: 6,
                width: `${(i === Math.ceil(lineas) - 1 ? 60 : 100) * resto}%`,
                background: activo ? '#D5DBEE' : 'rgba(233, 237, 255, 0.28)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

type Props = {
  ancho: number;
  vertical: boolean;
  /** Mejoras concretas que aparecen como chips al final. */
  mejoras: string[];
  lineasAntes: number;
  lineasAhora: number;
};

/** La onda de voz y un globo que se acorta de «antes» a «ahora» (p. ej. cierres de llamada más cortos). */
export const OndaVoz: React.FC<Props> = ({
  ancho,
  vertical,
  mejoras,
  lineasAntes,
  lineasAhora,
}) => {
  const frame = useCuadro();
  const { colores, fuentes } = useMarca();
  const lineasActuales = porTramos(frame, [30, 70], [lineasAntes, lineasAhora]);
  const anchoGlobo = vertical ? ancho : (ancho - 40) / 2;
  return (
    <div style={{ width: ancho, display: 'flex', flexDirection: 'column', gap: 44 }}>
      <Onda ancho={ancho} alto={130} />
      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: 40,
          alignItems: 'flex-start',
        }}
      >
        <Globo etiqueta="Antes" lineas={lineasAntes} activo={false} ancho={anchoGlobo} />
        <Globo etiqueta="Ahora" lineas={lineasActuales} activo ancho={anchoGlobo} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {mejoras.map((m, i) => {
          const t = avance(frame, 78 + i * 12, 20);
          return (
            <span
              key={m}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                background: 'rgba(82, 113, 255, 0.2)',
                border: `1px solid ${colores.indigo}`,
                fontFamily: fuentes.ui,
                fontSize: 24,
                fontWeight: 500,
                color: colores.blanco,
                opacity: t,
                transform: `translateY(${(1 - t) * 14}px)`,
              }}
            >
              {m}
            </span>
          );
        })}
      </div>
    </div>
  );
};
