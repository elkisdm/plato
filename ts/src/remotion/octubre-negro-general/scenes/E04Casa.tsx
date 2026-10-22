/**
 * E04 · Casa (línea 3). Casa ajena con tres cajas fuertes: TUS CUENTAS, TUS CONTRASEÑAS, TUS ARCHIVOS.
 * «pasa algo» → pulso ámbar en la casa; «arreglarla» → herramienta tachada. Golpe: «cambiar tus llaves» →
 * las llaves viejas se deshacen (en «cambiar») y entran llaves nuevas turquesa con check (desde «tus»:
 * la escena se apaga al cerrar la línea, así que el golpe no puede esperar a «llaves»).
 */

import { AbsoluteFill, interpolateColors, useCurrentFrame } from 'remotion';

import { CheckInsignia, Casa, Herramienta, Llave } from '../components/CasaLlaves';
import { COLORS, FONTS, FPS, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, normalizar, PALABRAS, palabra } from '../lib/alineacion';
import { LLAVES_X, Y_LLAVES } from '../lib/casaLlaves';
import { fsMinimo } from '../lib/layout';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 3;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
/** Segunda aparición de «tus» en la línea: la de «cambiar tus llaves». */
const tTusLlaves = aFrame(
  PALABRAS.filter((w) => w.linea === LINEA && normalizar(w.texto) === 'tus')[2]!.inicio,
);

const Y_HERRAMIENTA = 1075;
const Y_CAPTION = 868;

export const E04Casa = (_: PropsEscena) => {
  const frame = useCurrentFrame();

  const tSencillo = ancla('sencillo.');
  const tCuentas = ancla('cuentas');
  const tContrasenas = ancla('contraseñas');
  const tViven = ancla('viven');
  const tCasas = ancla('casas');
  const tPasa = ancla('pasa');
  const tPuedes = ancla('puedes');
  const tArreglarla = ancla('arreglarla.');
  const tPero = ancla('Pero');
  const tCambiar = ancla('cambiar');

  const casa = entrada(frame, tSencillo, 10);
  const pulso = entre(frame, tPasa, tPasa + 8) * (1 - entre(frame, tPasa + 8, tPasa + 40));
  const borde = interpolateColors(pulso, [0, 1], [COLORS.borderStrong, WARN]);

  const herramienta = entrada(frame, tPuedes, 8) * (1 - entre(frame, tPero, tPero + 10));
  const tachado = entre(frame, tArreglarla, tArreglarla + 10);

  const viejas = entrada(frame, tPero, 10);
  const rotura = entre(frame, tCambiar, tCambiar + 10);

  return (
    <AbsoluteFill>
      <Casa
        borde={borde}
        pulso={pulso}
        glow={WARN_GLOW}
        wash={WARN_WASH}
        casa={casa}
        cajas={[
          entrada(frame, tCuentas, 10),
          entrada(frame, tContrasenas, 10),
          entrada(frame, tViven, 10),
        ]}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_CAPTION,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(34),
          letterSpacing: '0.08em',
          color: COLORS.textMuted,
          opacity: entrada(frame, tCasas, 8),
        }}
      >
        UNA CASA QUE NO ES TUYA
      </div>

      <Herramienta
        x={W / 2}
        y={Y_HERRAMIENTA}
        color={COLORS.textMuted}
        raya={WARN}
        tachado={tachado}
        opacidad={herramienta}
      />

      {LLAVES_X.map((x, i) => {
        const p = rotura;
        const mitad = (signo: 1 | -1) => ({
          opacity: viejas * (1 - p),
          transformOrigin: '50% 50%',
          transform: `translate(${signo * 60 * p}px, ${90 * p * p}px) rotate(${signo * 28 * p}deg)`,
          clipPath: signo === -1 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
        });
        const tNueva = tTusLlaves + i * 3;
        const k = rebote(frame, tNueva, FPS);
        return (
          <div key={x}>
            <Llave x={x} y={Y_LLAVES} color={WARN} estilo={mitad(-1)} />
            <Llave x={x} y={Y_LLAVES} color={WARN} estilo={mitad(1)} />
            <Llave
              x={x}
              y={Y_LLAVES}
              color={COLORS.accent}
              estilo={{
                opacity: entrada(frame, tNueva, 4),
                transform: `scale(${0.4 + 0.6 * k})`,
                filter: `drop-shadow(0 0 12px ${COLORS.accentGlow})`,
              }}
            />
            <CheckInsignia
              x={x + 60}
              y={Y_LLAVES - 52}
              escala={rebote(frame, tNueva + 5, FPS)}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
