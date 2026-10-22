import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { Reveal } from '../../arquitectura-ia/components/motion/Reveal';
import { LeccionArchivo } from '../components/LeccionArchivo';
import { LeccionBloqueo } from '../components/LeccionBloqueo';
import { COLORS, FONTS, SPACING, TYPE } from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { W_V, YFIN_V, YINI_V, fsMinimo } from '../lib/layout';
import { entrada } from '../lib/motion';
import type { PropsEscena } from './tipos';

/** Margen lateral seguro del brief (120 px). */
const LADO = 120;
const LINEA = 5;
const en = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
const FIJAR = en('fijar');
/** Golpe: "reemplazar" cambia el archivo y deja la etiqueta igual. */
const REEMPLAZAR = en('reemplazar');
const REVISA = en('revisa');
const CLAVES = en('claves');

/** E06 (línea 5): versión ≠ archivo; revisa de dónde viene; las claves no entran a cualquier herramienta. */
export const E06Leccion = (_props: PropsEscena) => {
  const frame = useCurrentFrame();
  const atenua = 0.35 * entrada(frame, REVISA, 12);
  return (
    <AbsoluteFill
      style={{
        top: YINI_V,
        left: LADO,
        width: W_V - LADO * 2,
        height: YFIN_V - YINI_V,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ opacity: 1 - atenua }}>
        <Reveal at={FIJAR}>
          <LeccionArchivo golpe={REEMPLAZAR} />
        </Reveal>
      </div>

      <div style={{ marginTop: 130 }}>
        <Reveal at={REVISA}>
          <div
            style={{
              padding: '18px 40px',
              borderRadius: SPACING.radius,
              border: `2px solid ${COLORS.accent}`,
              background: COLORS.accentWash,
              boxShadow: `0 0 36px ${COLORS.accentGlow}`,
              fontFamily: FONTS.mono,
              fontSize: fsMinimo(TYPE.title),
              color: COLORS.accent,
              letterSpacing: '0.08em',
            }}
          >
            ¿DE DÓNDE VIENE?
          </div>
        </Reveal>
      </div>

      <div style={{ marginTop: 110 }}>
        <Reveal at={CLAVES - 18}>
          <LeccionBloqueo golpe={CLAVES} />
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
