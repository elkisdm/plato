import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Escena } from '../proyecto';
import { useVertical } from './formato';
import { TituloSerif } from './TituloSerif';

type Props = {
  escena: Escena;
  /** Reemplaza el texto de apoyo de la escena (por ejemplo, en el scroll de Mi perfil). */
  texto?: React.ReactNode;
  children: React.ReactNode;
};

export const ANCHO_TEXTO_H = 540;

/**
 * Encuadre común de las escenas con captura.
 * Horizontal: texto a la izquierda y captura a la derecha. Vertical: texto arriba y captura abajo.
 */
export const Plano: React.FC<Props> = ({ escena, texto, children }) => {
  const vertical = useVertical();
  const titulo = (
    <TituloSerif
      antetitulo={escena.antetitulo}
      titulo={escena.titulo}
      // Las escenas que llegan deslizándose entran con el título ya armado.
      inicio={escena.entrada === 'desliza' ? 0 : undefined}
      texto={texto === undefined ? escena.texto : undefined}
      tamano={vertical ? 92 : 84}
      anchoMaximo={vertical ? 940 : ANCHO_TEXTO_H}
    />
  );

  return (
    <AbsoluteFill
      style={
        vertical
          ? { padding: '120px 70px', flexDirection: 'column', justifyContent: 'center', gap: 70 }
          : { padding: '0 110px 0 120px', flexDirection: 'row', alignItems: 'center', gap: 80 }
      }
    >
      <div style={{ flexShrink: 0, width: vertical ? undefined : ANCHO_TEXTO_H }}>
        {titulo}
        {texto}
      </div>
      <div
        style={{
          flex: vertical ? undefined : 1,
          position: 'relative',
          display: 'flex',
          alignItems: vertical ? 'flex-start' : 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
