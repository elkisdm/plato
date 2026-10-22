import { AbsoluteFill } from 'remotion';

import { PasosHabitos } from '../components/PasosHabitos';
import { GOLPES_E06 } from '../lib/golpesFinales';
import { ANCHO_V, MARGEN_LATERAL, YFIN_ESCENA, YINI_V } from '../lib/layout';
import type { PropsEscena } from './tipos';

/** E06 (línea 5): tres hábitos. Golpe: «alcanza» → las tres filas se marcan con check turquesa. */
export const E06TresPasos = (_props: PropsEscena) => (
  <AbsoluteFill
    style={{
      top: YINI_V,
      left: MARGEN_LATERAL,
      width: ANCHO_V,
      height: YFIN_ESCENA - YINI_V,
    }}
  >
    <PasosHabitos
      alcanza={GOLPES_E06.alcanza}
      pasos={[
        { icono: 'lupa', entra: GOLPES_E06.verifica, texto: 'Verifica antes de creer' },
        { icono: 'llave', entra: GOLPES_E06.cambia, texto: 'Cambia tus claves si te avisan' },
        { icono: 'flecha', entra: GOLPES_E06.actualiza, texto: 'Actualiza' },
      ]}
    />
  </AbsoluteFill>
);
