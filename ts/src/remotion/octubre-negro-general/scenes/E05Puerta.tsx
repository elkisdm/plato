import { AbsoluteFill } from 'remotion';

import { PuertaCierre } from '../components/PuertaCierre';
import { GOLPES_E05 } from '../lib/golpesFinales';
import { ANCHO_V, MARGEN_LATERAL, YFIN_ESCENA, YINI_V } from '../lib/layout';
import type { PropsEscena } from './tipos';

/** E05 (línea 4): una actualización cierra una puerta. Golpe: «cierra» → puerta ámbar a turquesa con candado. */
export const E05Puerta = (_props: PropsEscena) => (
  <AbsoluteFill
    style={{
      top: YINI_V,
      left: MARGEN_LATERAL,
      width: ANCHO_V,
      height: YFIN_ESCENA - YINI_V,
    }}
  >
    <PuertaCierre actualizacion={GOLPES_E05.actualizacion} cierra={GOLPES_E05.cierra} />
  </AbsoluteFill>
);
