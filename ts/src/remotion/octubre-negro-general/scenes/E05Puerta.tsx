import { AbsoluteFill } from 'remotion';

import { COLORS, FONTS } from '../constants/theme';
import { MARGEN_LATERAL, YINI_V } from '../lib/layout';
import type { PropsEscena } from './tipos';

/** STUB: titular provisional; la escena real se implementa aparte. */
export const E05Puerta = (_props: PropsEscena) => (
  <AbsoluteFill
    style={{
      paddingTop: YINI_V,
      paddingLeft: MARGEN_LATERAL,
      paddingRight: MARGEN_LATERAL,
      fontFamily: FONTS.sans,
      fontSize: 72,
      fontWeight: 800,
      color: COLORS.text,
    }}
  >
    Cierra la puerta
  </AbsoluteFill>
);
