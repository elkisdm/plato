import React from 'react';
import { Aparicion } from './Aparicion';
import { useVertical } from './formato';

type Props = {
  /** Recibe el ancho y el alto visibles del correo según el formato. */
  correo: (_ancho: number, _altoVisible: number) => React.ReactNode;
  /** Recibe el ancho de la pantalla del teléfono según el formato. */
  telefono: (_ancho: number) => React.ReactNode;
  inicioTelefono: number;
};

/** Correo a la izquierda (o arriba) y el WhatsApp en un teléfono que llega por la derecha. */
export const CorreoYWhatsapp: React.FC<Props> = ({ correo, telefono, inicioTelefono }) => {
  const vertical = useVertical();
  return (
    <div
      style={{ position: 'relative', width: vertical ? 940 : 1070, height: vertical ? 1000 : 900 }}
    >
      <Aparicion inicio={6} style={{ position: 'absolute', left: 0, top: vertical ? 0 : 40 }}>
        {vertical ? correo(580, 900) : correo(560, 820)}
      </Aparicion>
      <Aparicion
        inicio={inicioTelefono}
        desdeX={320}
        desdeY={0}
        style={{ position: 'absolute', right: 0, top: vertical ? 150 : 60 }}
      >
        {telefono(330)}
      </Aparicion>
    </div>
  );
};
