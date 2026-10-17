import React from 'react';
import { useMarca } from '../marca';
import { radios, sombraTarjeta } from '../tema';

const BISEL = 12;
export const ALTO_BARRA_ESTADO = 44;

type Props = {
  /** Ancho de la pantalla en px (sin bisel). */
  ancho: number;
  /** Alto de la pantalla en px, sin contar la barra de estado. */
  alto: number;
  /** Color de la barra de estado, igual al encabezado de la captura. */
  colorBarra: string;
  fondoPantalla?: string;
  children: React.ReactNode;
};

/** Teléfono minimalista dibujado en código: bisel, isla y barra de estado. */
export const MarcoTelefono: React.FC<Props> = ({
  ancho,
  alto,
  colorBarra,
  fondoPantalla,
  children,
}) => {
  const { colores, fuentes } = useMarca();
  return (
    <div
      style={{
        width: ancho + BISEL * 2,
        padding: BISEL,
        borderRadius: radios.telefono,
        background: '#0A0D22',
        boxShadow: `${sombraTarjeta}, inset 0 0 0 1.5px rgba(255, 255, 255, 0.14)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: radios.telefono - BISEL,
          overflow: 'hidden',
          background: fondoPantalla ?? colores.blanco,
        }}
      >
        <div
          style={{
            height: ALTO_BARRA_ESTADO,
            background: colorBarra,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            fontFamily: fuentes.ui,
            fontWeight: 600,
            fontSize: 15,
            color: colores.blanco,
          }}
        >
          <span>9:41</span>
          <div
            style={{
              width: ancho * 0.3,
              height: 26,
              borderRadius: 13,
              background: '#05060F',
            }}
          />
          <span style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {[6, 9, 12].map((h) => (
              <span
                key={h}
                style={{ width: 4, height: h, borderRadius: 1, background: colores.blanco }}
              />
            ))}
          </span>
        </div>
        <div style={{ position: 'relative', height: alto, overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
};
