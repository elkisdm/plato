import React from 'react';
import { Img } from 'remotion';
import type { AssetServido as Captura } from '../proyecto';
import { BurbujaEntrando, type Mensaje } from './BurbujaEntrando';
import { MarcoTelefono } from './MarcoTelefono';

export const VERDE_WHATSAPP = '#075E54';
const FONDO_CHAT = '#EFEAE2';
/** Pantalla algo más baja que la de las capturas móviles: el chat ocupa el teléfono sin tanto fondo vacío. */
const PROPORCION_PANTALLA = 1.9;

type Props = {
  /** Ancho de la pantalla del teléfono, en px. */
  ancho: number;
  /** De qué captura sale la barra verde del chat, y dónde termina. */
  encabezado: { captura: Captura; hasta: number };
  mensajes: Mensaje[];
  /** Pantalla que aparece encima del chat (por ejemplo, al tocar un botón). */
  pantallaSiguiente?: React.ReactNode;
};

/** Un chat de WhatsApp dentro del teléfono: encabezado fijo y globos reales que van llegando. */
export const ChatWhatsapp: React.FC<Props> = ({
  ancho,
  encabezado,
  mensajes,
  pantallaSiguiente,
}) => {
  const { captura, hasta } = encabezado;
  const alto = (ancho * captura.alto) / captura.ancho;
  return (
    <MarcoTelefono
      ancho={ancho}
      alto={ancho * PROPORCION_PANTALLA}
      colorBarra={VERDE_WHATSAPP}
      fondoPantalla={FONDO_CHAT}
    >
      <div style={{ position: 'relative', width: ancho, height: hasta * alto, overflow: 'hidden' }}>
        <Img src={captura.src} style={{ width: ancho, height: alto, display: 'block' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {mensajes.map((m, i) => (
          <BurbujaEntrando key={i} {...m} ancho={ancho} />
        ))}
      </div>
      {pantallaSiguiente}
    </MarcoTelefono>
  );
};
