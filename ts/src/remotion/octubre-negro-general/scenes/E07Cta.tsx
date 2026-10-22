import { AbsoluteFill } from 'remotion';

import { CtaSigueme } from '../components/CtaSigueme';
import { GOLPES_E07 } from '../lib/golpesFinales';
import { ANCHO_V, MARGEN_LATERAL, YFIN_ESCENA, YINI_V } from '../lib/layout';
import type { PropsEscena } from './tipos';

/**
 * E07 (línea 6): CTA de la serie. Golpe: «PARCHE» entra letra por letra; en «sígueme» pasa a
 * SÍGUEME + @elkis.dev, que se sostiene hasta el último frame.
 */
export const E07Cta = (_props: PropsEscena) => (
  <AbsoluteFill
    style={{
      top: YINI_V,
      left: MARGEN_LATERAL,
      width: ANCHO_V,
      height: YFIN_ESCENA - YINI_V,
    }}
  >
    <CtaSigueme {...GOLPES_E07} />
  </AbsoluteFill>
);
