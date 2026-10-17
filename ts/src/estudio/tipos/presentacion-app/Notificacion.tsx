import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { corteDe } from '../../assets';
import { entrada } from '../../kit/animacion';
import { Aparicion } from '../../kit/Aparicion';
import { Camara } from '../../kit/Camara';
import { useVertical } from '../../kit/formato';
import { MarcoTelefono } from '../../kit/MarcoTelefono';
import { useMarca } from '../../marca';
import { framesDe, useAsset, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';

const VERDE_WHATSAPP = '#075E54';
const FONDO_CHAT = '#EFEAE2';

/** Apertura: un teléfono en luz suave; llega un mensaje con una imagen real y la cámara empuja hacia él. */
export const Notificacion: React.FC<{ escena: Escena; props: PropsDe<'notificacion'> }> = ({
  escena,
  props,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const { fuentes } = useMarca();
  const { voz } = useProyecto();
  const encabezado = useAsset(props.encabezado);
  const imagen = useAsset(props.imagen);
  const ancho = vertical ? 560 : 440;
  const altoEncabezado = (ancho * encabezado.alto) / encabezado.ancho;
  const t = entrada(frame, fps, props.llegaEn);
  // El teléfono flota: una respiración mínima, sin rebote.
  const flote = Math.sin(frame / 38) * 4;
  return (
    <AbsoluteFill>
      {/* La cámara empuja hacia el mensaje, que está en el tercio superior de la pantalla. */}
      <Camara hasta={props.empujeHasta} origen={{ x: 50, y: 34 }} fin={framesDe(escena, voz)}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Aparicion enfoque desdeY={60}>
            {/* Aparicion maneja su propio transform: la flotación y el giro van en una capa aparte. */}
            <div style={{ transform: `translateY(${flote}px) rotate(-2deg)` }}>
              <MarcoTelefono
                ancho={ancho}
                alto={ancho * 1.9}
                colorBarra={VERDE_WHATSAPP}
                fondoPantalla={FONDO_CHAT}
              >
                <div
                  style={{
                    height: altoEncabezado * corteDe(encabezado, 'encabezado'),
                    overflow: 'hidden',
                  }}
                >
                  <Img
                    src={encabezado.src}
                    style={{ width: ancho, height: altoEncabezado, display: 'block' }}
                  />
                </div>
                <div
                  style={{
                    margin: `${ancho * 0.05}px ${ancho * 0.04}px`,
                    width: ancho * 0.84,
                    borderRadius: 14,
                    background: '#FFFFFF',
                    padding: 5,
                    boxShadow: '0 1px 1px rgba(0,0,0,0.12)',
                    opacity: t,
                    transform: `translateY(${(1 - t) * 40}px) scale(${0.94 + 0.06 * t})`,
                    transformOrigin: '10% 0%',
                  }}
                >
                  <Img
                    src={imagen.src}
                    style={{ width: '100%', borderRadius: 10, display: 'block' }}
                  />
                  <div
                    style={{
                      fontFamily: fuentes.ui,
                      fontSize: ancho * 0.03,
                      color: '#667781',
                      textAlign: 'right',
                      padding: '6px 6px 2px',
                    }}
                  >
                    {props.hora}
                  </div>
                </div>
              </MarcoTelefono>
            </div>
          </Aparicion>
        </AbsoluteFill>
      </Camara>
    </AbsoluteFill>
  );
};
