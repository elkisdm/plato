import { AbsoluteFill } from 'remotion';

import { COLORS, FONTS, TYPE } from '../constants/theme';
import type { PropsEscena } from './tipos';

/** STUB de la línea 6: solo un titular provisional; la escena real la implementa otra tarea. */
export const E07Cta = (_props: PropsEscena) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: COLORS.text, fontFamily: FONTS.sans, fontSize: TYPE.title, textAlign: 'center' }}>
      PARCHE
    </div>
  </AbsoluteFill>
);
