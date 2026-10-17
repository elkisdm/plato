import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { Captura } from '../../kit/Captura';
import { useVertical } from '../../kit/formato';
import { MarcoTelefono } from '../../kit/MarcoTelefono';
import { Plano } from '../../kit/Plano';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { FPS } from '../../tema';
import type { PropsDe } from './esquemas';

/** Color de la barra de estado sobre capturas móviles oscuras. */
const BARRA_OSCURA = '#101341';

/** Lo que ve el cliente, en un teléfono, con el logo de la marca arriba. */
export const Gancho: React.FC<{ escena: Escena; props: PropsDe<'gancho'> }> = ({
  escena,
  props,
}) => {
  const vertical = useVertical();
  const marca = useMarca();
  const captura = useAsset(props.captura);
  const logo = useAsset(logoDe(marca, 'blanco'));
  const ancho = vertical ? 470 : 390;
  return (
    <AbsoluteFill>
      <Plano escena={escena}>
        <Aparicion inicio={20} desdeX={200} desdeY={0}>
          <MarcoTelefono
            ancho={ancho}
            alto={(ancho * captura.alto) / captura.ancho}
            colorBarra={BARRA_OSCURA}
          >
            {/* El zoom dura el mínimo de la escena, como en la v2 entregada (paridad). */}
            <Captura
              captura={captura}
              ancho={ancho}
              kenBurnsFrames={Math.round(escena.segundos * FPS)}
            />
          </MarcoTelefono>
        </Aparicion>
      </Plano>
      {props.logo ? (
        <Aparicion
          desdeY={-20}
          style={{ position: 'absolute', top: vertical ? 70 : 64, left: vertical ? 70 : 120 }}
        >
          {/* El logo mide 300 px: a 150 px CSS queda 1:1 en el render 4K. */}
          <Img src={logo.src} style={{ width: 150, display: 'block' }} />
        </Aparicion>
      ) : null}
    </AbsoluteFill>
  );
};
