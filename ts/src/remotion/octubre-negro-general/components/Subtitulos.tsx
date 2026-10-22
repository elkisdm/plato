import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS } from '../constants/theme';
import { aFrame } from '../lib/alineacion';
import { FRASES } from '../lib/subtitulos';
import { entre } from '../lib/motion';

/** Banda de subtítulos: y 1480–1640. */
const Y_BANDA = 1480;
const ALTO_BANDA = 160;
const ANCHO_MAX = 840;
const FUNDIDO = 4;
/** Frames que la frase se sostiene tras su última palabra. */
const RETENCION = 5;
/** Contorno oscuro para legibilidad sobre cualquier fondo. */
const CONTORNO =
  '0 0 6px rgba(9,13,15,0.95), 0 3px 10px rgba(9,13,15,0.9), 3px 0 0 #090D0F, -3px 0 0 #090D0F, 0 3px 0 #090D0F, 0 -3px 0 #090D0F';

/**
 * Muestra la frase activa según el frame global (`aFrame` de la alineación), centrada en la banda 1480–1640.
 * La palabra que se está diciendo va en turquesa; el resto en blanco. Fundido corto de entrada y salida.
 */
export const Subtitulos = () => {
  const frame = useCurrentFrame();
  const frase = FRASES.findLast((f) => frame >= aFrame(f.inicio));
  if (!frase || frame > aFrame(frase.fin) + RETENCION) return null;

  const ini = aFrame(frase.inicio);
  const fin = aFrame(frase.fin);
  const opacity = Math.min(entre(frame, ini, ini + FUNDIDO), 1 - entre(frame, fin + RETENCION - FUNDIDO, fin + RETENCION));
  const activa = frase.palabras.findLastIndex((w) => frame >= aFrame(w.inicio));

  return (
    <div
      style={{
        position: 'absolute',
        top: Y_BANDA,
        left: (1080 - ANCHO_MAX) / 2,
        width: ANCHO_MAX,
        height: ALTO_BANDA,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.1,
        opacity,
      }}
    >
      <span>
        {frase.palabras.map((w, i) => (
          <span
            key={i}
            style={{
              color: i === activa ? COLORS.accent : COLORS.text,
              textShadow: CONTORNO,
            }}
          >
            {w.texto}
            {i < frase.palabras.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
};
