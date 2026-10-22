/**
 * E04 · Casa (línea 3). La casa ajena se construye a trazos, sus ventanas se encienden una a una y las tres cajas
 * fuertes (TUS CUENTAS, TUS CONTRASEÑAS, TUS ARCHIVOS) abren y cierran su puerta. «pasa algo» → una onda ámbar
 * recorre la casa y las luces parpadean; «arreglarla» → la herramienta se tacha a trazo. «cambiar»: las llaves viejas
 * tiemblan, se agrietan y se rompen en fragmentos; en «tus» (golpe) entran las nuevas, encajan con destello metálico
 * y la casa pasa a turquesa.
 */

import { AbsoluteFill, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { CheckInsignia, Casa, Herramienta, Llave, type EstadoCaja } from '../components/CasaLlaves';
import { Fragmentos } from '../components/Fragmentos';
import { COLORS, FONTS, W, WARN, WARN_GLOW, WARN_WASH } from '../constants/theme';
import { aFrame, normalizar, PALABRAS, palabra } from '../lib/alineacion';
import { anguloPuerta, CAJAS, CASA, LLAVES_X, luzVentana, Y_LLAVES } from '../lib/casaLlaves';
import { fsMinimo } from '../lib/layout';
import { entrada, entre } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 3;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);
/** Tercera aparición de «tus» en la línea: la de «cambiar tus llaves». */
const tTusLlaves = aFrame(PALABRAS.filter((w) => w.linea === LINEA && normalizar(w.texto) === 'tus')[2]!.inicio);

const Y_HERRAMIENTA = 1075;
const Y_CAPTION = 905;
const BASE_CASA = CASA.yCuerpo + CASA.altoCuerpo;
/** Frames desde el aviso hasta que la llave vieja se parte. */
const TREMOR = 5;

export const E04Casa = ({ desde }: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
  const tRompe = tTusLlaves - 3;

  const nuevas = frame >= tTusLlaves;
  const pulso = entre(frame, tPasa, tPasa + 8) * (1 - entre(frame, tPasa + 8, tPasa + 40));
  const alertaBorde = interpolateColors(pulso, [0, 1], [COLORS.textMuted, WARN]);
  const borde = nuevas ? interpolateColors(entre(frame, tTusLlaves, tTusLlaves + 8), [0, 1], [alertaBorde, COLORS.accent]) : alertaBorde;

  const enAlerta = frame >= tPasa && frame < tPasa + 45;
  const ventanas = [0, 1, 2].map((i) => {
    let luz = luzVentana(frame, tSencillo + 4 + i * 7, i);
    if (frame >= tPasa && frame < tPasa + 24) luz *= random(`vent-${i}-${frame}`) > 0.4 ? 1 : 0.2;
    else if (enAlerta) luz *= random(`vent-lento-${i}-${Math.floor(frame / 3)}`) > 0.2 ? 1 : 0.45;
    luz *= 0.93 + 0.07 * Math.sin(frame / 6 + i);
    const color = nuevas ? COLORS.accent : enAlerta ? WARN : COLORS.text;
    return { luz, color };
  });

  const banda = frame >= tPasa && frame < tPasa + 22 ? CASA.yTecho + (BASE_CASA - CASA.yTecho) * entre(frame, tPasa, tPasa + 22) : null;
  const cajas: EstadoCaja[] = [tCuentas, tContrasenas, tViven].map((t, i) => {
    const c = CAJAS[i]!;
    const tocada = banda !== null && Math.abs(banda - (c.y + c.alto / 2)) < 70;
    return {
      aparece: spring({ frame: frame - t, fps, config: { damping: 11, stiffness: 120 } }),
      puerta: anguloPuerta(frame, t),
      borde: nuevas ? COLORS.accent : tocada ? WARN : COLORS.borderStrong,
    };
  });

  const herramienta = spring({ frame: frame - tPuedes, fps, config: { damping: 9, stiffness: 130 } }) * (1 - entre(frame, tPero, tPero + 10));
  const tachado = entre(frame, tArreglarla, tArreglarla + 8);
  const sacude = frame >= tArreglarla && frame < tArreglarla + 8 ? Math.sin(frame * 4) * 6 : 0;

  const viejas = spring({ frame: frame - tPero, fps, config: { damping: 10, stiffness: 120 } });
  const rotura = entre(frame, tRompe, tRompe + 16);

  return (
    <AbsoluteFill>
      <Casa
        construye={entre(frame, desde + 2, desde + 30)}
        relleno={entre(frame, desde + 24, desde + 40)}
        borde={borde}
        pulso={pulso}
        glow={WARN_GLOW}
        wash={WARN_WASH}
        ventanas={ventanas}
        cajas={cajas}
        banda={banda}
        colorBanda={WARN}
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
          transform: `translateY(${(1 - entrada(frame, tCasas, 8)) * 14}px)`,
        }}
      >
        UNA CASA QUE NO ES TUYA
      </div>

      <div style={{ transform: `translateX(${sacude}px) scale(${0.6 + 0.4 * Math.min(1.1, herramienta)})`, transformOrigin: `${W / 2}px ${Y_HERRAMIENTA}px` }}>
        <Herramienta x={W / 2} y={Y_HERRAMIENTA} color={COLORS.textMuted} raya={WARN} tachado={tachado} opacidad={Math.min(1, herramienta * 2)} giro={(1 - Math.min(1, herramienta)) * -60 + Math.sin(frame / 8) * 3} />
      </div>
      <Fragmentos inicio={tArreglarla + 8} x={W / 2 + 62} y={Y_HERRAMIENTA - 62} color={WARN} semilla="e04-tacha" cantidad={9} velocidad={11} gravedad={0.4} vida={14} tamano={11} />

      {LLAVES_X.map((x, i) => {
        const tNueva = tTusLlaves + i * 3;
        const k = spring({ frame: frame - tNueva, fps, config: { damping: 8, stiffness: 170, mass: 0.7 } });
        const tiembla = frame >= tCambiar && frame < tRompe ? Math.sin(frame * 3.3 + i) * 3 * entre(frame, tCambiar, tRompe) : 0;
        const sway = Math.sin(frame / 12 + i * 1.4) * 4;
        const mitad = (signo: 1 | -1) => ({
          opacity: (frame < tRompe ? 1 : 1 - Math.pow(rotura, 1.5)) * Math.min(1, viejas * 2),
          transformOrigin: '50% 50%',
          transform: `translate(${signo * 80 * rotura + tiembla}px, ${(1 - Math.min(1.1, viejas)) * -160 + 190 * rotura * rotura}px) rotate(${signo * 48 * rotura + sway * (1 - rotura)}deg)`,
          clipPath: signo === -1 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
        });
        const brillo = entre(frame, tNueva + 4, tNueva + 16);
        const aterriza = Math.max(0, Math.min(1, k));
        return (
          <div key={x}>
            {frame >= tPero ? (
              <>
                <Llave x={x} y={Y_LLAVES} color={WARN} estilo={mitad(-1)} />
                <Llave x={x} y={Y_LLAVES} color={WARN} estilo={mitad(1)} />
                {frame >= tCambiar + 3 && frame < tRompe ? (
                  <div style={{ position: 'absolute', left: x - 1, top: Y_LLAVES - 40, width: 3, height: 80, background: '#FFFFFF', opacity: 0.8, transform: `translateX(${tiembla}px) rotate(${(i - 1) * 8}deg)` }} />
                ) : null}
              </>
            ) : null}
            <Fragmentos inicio={tRompe} x={x} y={Y_LLAVES} color={WARN} semilla={`e04-rompe-${i}`} cantidad={9} velocidad={13} gravedad={1.1} vida={22} tamano={13} />
            {frame >= tNueva ? (
              <>
                <Llave
                  x={x}
                  y={Y_LLAVES}
                  color={COLORS.accent}
                  estilo={{
                    opacity: entrada(frame, tNueva, 3),
                    transform: `translateY(${(1 - aterriza) * -170 + Math.sin(frame / 10 + i) * 3}px) scale(${0.7 + 0.3 * k}) rotate(${(1 - aterriza) * -25 + Math.sin(frame / 14 + i) * 3}deg)`,
                    filter: `drop-shadow(0 0 ${10 + 10 * Math.max(0, 1 - brillo)}px ${COLORS.accentGlow})`,
                  }}
                />
                {/* Destello metálico: una banda blanca recorre la llave al encajar */}
                {brillo > 0 && brillo < 1 ? (
                  <Llave
                    x={x}
                    y={Y_LLAVES}
                    color="#FFFFFF"
                    estilo={{
                      WebkitMaskImage: `linear-gradient(105deg, transparent ${brillo * 140 - 40}%, #000 ${brillo * 140 - 20}%, transparent ${brillo * 140}%)`,
                      maskImage: `linear-gradient(105deg, transparent ${brillo * 140 - 40}%, #000 ${brillo * 140 - 20}%, transparent ${brillo * 140}%)`,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: x - 140,
                    top: Y_LLAVES - 140,
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    border: `5px solid ${COLORS.accent}`,
                    opacity: Math.max(0, 1 - entre(frame, tNueva + 4, tNueva + 16)) * 0.7 * (frame >= tNueva + 4 ? 1 : 0),
                    transform: `scale(${0.3 + 0.7 * entre(frame, tNueva + 4, tNueva + 16)})`,
                  }}
                />
                <CheckInsignia x={x + 85} y={Y_LLAVES - 72} escala={spring({ frame: frame - (tNueva + 6), fps, config: { damping: 9, stiffness: 160 } })} />
                <Fragmentos inicio={tNueva + 4} x={x} y={Y_LLAVES} color={COLORS.accent} semilla={`e04-encaja-${i}`} cantidad={8} velocidad={14} gravedad={0.4} vida={16} tamano={11} />
              </>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
