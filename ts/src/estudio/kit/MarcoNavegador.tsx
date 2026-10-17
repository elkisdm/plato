import React from 'react';
import { useMarca } from '../marca';
import { radios, sombraTarjeta } from '../tema';

export const ALTO_BARRA_NAVEGADOR = 46;

type Props = { url: string; ancho: number; children: React.ReactNode };

/** Ventana de navegador minimalista dibujada en código. */
export const MarcoNavegador: React.FC<Props> = ({ url, ancho, children }) => {
  const { colores, fuentes } = useMarca();
  return (
    <div
      style={{
        width: ancho,
        borderRadius: radios.tarjeta,
        overflow: 'hidden',
        background: colores.blanco,
        boxShadow: `${sombraTarjeta}, 0 0 0 1px rgba(255, 255, 255, 0.08)`,
      }}
    >
      <div
        style={{
          height: ALTO_BARRA_NAVEGADOR,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          background: '#F1F2F6',
          borderBottom: '1px solid #E3E6EE',
        }}
      >
        <div style={{ display: 'flex', gap: 8, width: 80 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 12, height: 12, borderRadius: 6, background: '#D3D7E2' }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 28,
              padding: '0 18px',
              borderRadius: 14,
              background: colores.blanco,
              border: '1px solid #E3E6EE',
              fontFamily: fuentes.ui,
              fontSize: 14,
              color: colores.textoSecundario,
              whiteSpace: 'nowrap',
            }}
          >
            <svg width={11} height={13} viewBox="0 0 11 13">
              <rect x={1} y={5.5} width={9} height={6.5} rx={1.5} fill="#94A3B8" />
              <path
                d="M3 5.5 V4 a2.5 2.5 0 0 1 5 0 V5.5"
                stroke="#94A3B8"
                strokeWidth={1.4}
                fill="none"
              />
            </svg>
            {url}
          </div>
        </div>
        <div style={{ width: 80 }} />
      </div>
      {children}
    </div>
  );
};
