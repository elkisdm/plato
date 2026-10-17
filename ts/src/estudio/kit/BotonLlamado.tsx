import React from 'react';
import { useMarca } from '../marca';

/** El botón del correo, «Completa tu perfil», dibujado igual que en la marca. */
export const BotonLlamado: React.FC<{ texto: string; tamano?: number }> = ({
  texto,
  tamano = 34,
}) => {
  const { colores, fuentes } = useMarca();
  return (
    <div
      style={{
        padding: `${tamano * 0.6}px ${tamano * 1.4}px`,
        borderRadius: 999,
        background: colores.indigo,
        color: colores.blanco,
        fontFamily: fuentes.ui,
        fontWeight: 600,
        fontSize: tamano,
        boxShadow: '0 24px 60px -18px rgba(82, 113, 255, 0.75)',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
};
