import React from 'react';
import { Aparicion } from './Aparicion';
import { useVertical } from './formato';

type Props = {
  /** Recibe el ancho de pantalla del teléfono según el formato. */
  telefono: (_ancho: number) => React.ReactNode;
  /** Recibe el ancho de la lupa según el formato. */
  lupa: (_ancho: number) => React.ReactNode;
};

/** Teléfono a la izquierda y el detalle ampliado encima de su mitad inferior, que en un chat queda libre. */
export const TelefonoConLupa: React.FC<Props> = ({ telefono, lupa }) => {
  const vertical = useVertical();
  return (
    <div
      style={{ position: 'relative', width: vertical ? 940 : 1070, height: vertical ? 1140 : 1000 }}
    >
      <Aparicion
        inicio={4}
        style={{ position: 'absolute', left: vertical ? 0 : 60, top: vertical ? 0 : 48 }}
      >
        {telefono(vertical ? 560 : 440)}
      </Aparicion>
      <div style={{ position: 'absolute', right: 0, bottom: vertical ? 60 : 90 }}>
        {lupa(vertical ? 620 : 560)}
      </div>
    </div>
  );
};
