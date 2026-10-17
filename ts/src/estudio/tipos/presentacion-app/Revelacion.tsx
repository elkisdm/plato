import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { centro } from '../../assets';
import { avance } from '../../kit/animacion';
import { Aparicion } from '../../kit/Aparicion';
import { Camara } from '../../kit/Camara';
import { Captura } from '../../kit/Captura';
import { useVertical } from '../../kit/formato';
import { ALTO_BARRA_ESTADO, MarcoTelefono } from '../../kit/MarcoTelefono';
import { useMarca } from '../../marca';
import { framesDe, useAsset, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';
import { zonaRef } from './zonas';

const BISEL = 12;

/** La cámara empuja hacia una zona de la captura (p. ej. la foto de un perfil) y un anillo la rodea. */
export const Revelacion: React.FC<{ escena: Escena; props: PropsDe<'revelacion'> }> = ({
  escena,
  props,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = useVertical();
  const { colores } = useMarca();
  const { voz } = useProyecto();
  const captura = useAsset(props.captura);
  const zona = zonaRef(captura, props.zona);
  const ancho = vertical ? 600 : 460;
  const altoPantalla = (ancho * captura.alto) / captura.ancho;
  const altoTelefono = altoPantalla + ALTO_BARRA_ESTADO + BISEL * 2;
  const c = centro(zona);
  // Punto de la zona en el cuadro, para que la cámara empuje exactamente hacia ella.
  const x = width / 2 - (ancho + BISEL * 2) / 2 + BISEL + c.x * ancho;
  const y = height / 2 - altoTelefono / 2 + BISEL + ALTO_BARRA_ESTADO + c.y * altoPantalla;
  const radio = (Math.max(zona.w * ancho, zona.h * altoPantalla) / 2) * 1.12;
  const trazo = avance(frame, props.anilloEn, 26);
  return (
    <AbsoluteFill>
      <Camara
        hasta={props.empujeHasta}
        origen={{ x: (x / width) * 100, y: (y / height) * 100 }}
        fin={framesDe(escena, voz)}
      >
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Aparicion enfoque desdeY={40}>
            <MarcoTelefono ancho={ancho} alto={altoPantalla} colorBarra="#101341">
              <Captura captura={captura} ancho={ancho} />
              <svg
                width={radio * 2 + 20}
                height={radio * 2 + 20}
                style={{
                  position: 'absolute',
                  left: c.x * ancho - radio - 10,
                  top: c.y * altoPantalla - radio - 10,
                  overflow: 'visible',
                }}
              >
                <circle
                  cx={radio + 10}
                  cy={radio + 10}
                  r={radio}
                  fill="none"
                  stroke={colores.indigo}
                  strokeWidth={4}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - trazo}
                  transform={`rotate(-90 ${radio + 10} ${radio + 10})`}
                  style={{ filter: `drop-shadow(0 0 ${14 * trazo}px rgba(82, 113, 255, 0.6))` }}
                />
              </svg>
            </MarcoTelefono>
          </Aparicion>
        </AbsoluteFill>
      </Camara>
    </AbsoluteFill>
  );
};
