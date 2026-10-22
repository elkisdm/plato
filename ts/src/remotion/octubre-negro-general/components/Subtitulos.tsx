import { useCurrentFrame } from 'remotion';

import { COLORS, FONTS } from '../constants/theme';
import { aFrame } from '../lib/alineacion';
import { estadoFrase, estadoPalabra, SALIDA_FRASE } from '../lib/fx/subtitulosFx';
import { FRASES } from '../lib/subtitulos';

/** Banda de subtítulos: y 1480–1640. */
const Y_BANDA = 1480;
const ALTO_BANDA = 160;
const ANCHO_MAX = 840;
/** Contorno oscuro para legibilidad sobre cualquier fondo. */
const CONTORNO =
  '0 0 6px rgba(9,13,15,0.95), 0 3px 10px rgba(9,13,15,0.9), 3px 0 0 #090D0F, -3px 0 0 #090D0F, 0 3px 0 #090D0F, 0 -3px 0 #090D0F';

/**
 * Muestra la frase activa según el frame global (`aFrame` de la alineación), centrada en la banda 1480–1640.
 * La frase entra con spring (escala 0.92→1, sube 12 px) y sale con fundido rápido; la palabra que se dice
 * va en turquesa sobre una píldora translúcida con escala 1.06. Contorno oscuro para legibilidad.
 */
export const Subtitulos = () => {
  const frame = useCurrentFrame();
  const frase = FRASES.findLast((f) => frame >= aFrame(f.inicio));
  if (!frase || frame > aFrame(frase.fin) + SALIDA_FRASE) return null;

  const f = estadoFrase(frame, aFrame(frase.inicio), aFrame(frase.fin));
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
        lineHeight: 1.15,
        opacity: f.opacity,
        transform: `translateY(${f.y}px) scale(${f.scale})`,
      }}
    >
      <span>
        {frase.palabras.map((w, i) => {
          const p = estadoPalabra(frame, aFrame(w.inicio), i === activa);
          return (
            <span key={i}>
              <span
                style={{
                  display: 'inline-block',
                  color: i === activa ? COLORS.accent : COLORS.text,
                  textShadow: CONTORNO,
                  background: `rgba(56,230,193,${0.2 * p.pildora})`,
                  borderRadius: 16,
                  padding: '0 10px',
                  margin: '0 -6px',
                  transform: `scale(${p.scale})`,
                }}
              >
                {w.texto}
              </span>
              {i < frase.palabras.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </span>
    </div>
  );
};
