/**
 * E01 · Gancho (línea 0). Capa de fondo: la «lista» de 27 renglones desenfocada que corre y parpadea.
 * Capa de frente: el marcador 27 tipo rodillo (gira desde el cuadro 0 y aterriza sobre «veintisiete» con
 * shake, destello, onda y chispas), HACKEOS cae letra por letra, un reloj barre las «48 h» y el agente
 * escanea la lista con un haz. «revisara» → el sello REVISAR golpea (la onda sale de la cámara).
 */

import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';

import { Fragmentos } from '../components/Fragmentos';
import { ListaParpadeo } from '../components/ListaParpadeo';
import { MarcadorRodillo } from '../components/MarcadorRodillo';
import { NodoAgente } from '../components/NodoAgente';
import { RelojAnillo } from '../components/RelojAnillo';
import { LetrasCaen } from '../components/fx/TextoCinetico';
import { Sello } from '../components/fx/Sello';
import {
  COLORS,
  FONTS,
  FPS,
  SPACING,
  SPRINGS,
  W,
  WARN,
  WARN_GLOW,
  WARN_WASH,
} from '../constants/theme';
import { aFrame, palabra } from '../lib/alineacion';
import { FRAME_IMPACTO_SELLO } from '../lib/fx/efectos';
import { fsMinimo } from '../lib/layout';
import { entrada, entre, rebote } from '../lib/motion';
import type { PropsEscena } from './tipos';

const LINEA = 0;
const ancla = (texto: string) => aFrame(palabra(texto, LINEA).inicio);

/** Centro del 27 y del sello: los golpes de `GOLPES_CAMARA` (E01) nacen en estos puntos. */
const Y_NUMERO = 520;
const TAM_NUMERO = 440;
const Y_HACKEOS = 810;
const Y_RELOJ = 985;
const Y_AGENTE = 1185;
const Y_SELLO = 1340;

export const E01Gancho = (_: PropsEscena) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const golpe = ancla('veintisiete');
  const tHackeos = ancla('hackeos');
  const tCuarenta = ancla('cuarenta');
  const tHoras = ancla('horas.');
  const tAgente = ancla('agente');
  const tRevisara = ancla('revisara.');

  // El 27 aterriza en `golpe`: anticipación (se contrae) y luego rebote con aplastamiento.
  const k = frame - golpe;
  const sacudida = k >= 0 ? Math.exp(-k / 4) * Math.cos(k * 0.75) : 0;
  const escalaNum = k >= 0 ? 1 + 0.13 * sacudida : 0.97 + 0.03 * entre(frame, golpe - 12, golpe);
  const respira = 1 + 0.008 * Math.sin(frame / 7);
  const brilloNum = 0.55 + 0.45 * Math.min(1, entre(frame, golpe - 6, golpe + 2)) + 0.1 * Math.sin(frame / 9);

  const kChip = rebote(frame, tCuarenta, FPS);
  const build = spring({ frame: frame - tAgente, fps, config: SPRINGS.build });
  const flotaAgente = 3 * Math.sin(frame / 14);
  const haz = frame >= tAgente + 4 ? ((frame - tAgente - 4) % 36) / 36 : 0;

  return (
    <AbsoluteFill>
      {/* Capa de fondo: eco gigante del 27 + lista que corre */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: Y_NUMERO - TAM_NUMERO * 0.74,
          textAlign: 'center',
          fontFamily: FONTS.sans,
          fontWeight: 900,
          fontSize: TAM_NUMERO * 1.5,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `3px ${WARN}`,
          opacity: 0.1 + 0.05 * Math.sin(frame / 12),
          transform: `translateX(${Math.sin(frame / 31) * 14}px) scale(${1 + 0.02 * sacudida})`,
          filter: 'blur(2px)',
        }}
      >
        27
      </div>

      <div style={{ filter: 'blur(1.5px)' }}>
        <ListaParpadeo
          x={190}
          y={262}
          ancho={700}
          alto={560}
          golpe={golpe}
          inicioHaz={tAgente + 4}
          opacidad={frame < golpe ? 0.9 : 0.6}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 200,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: fsMinimo(32),
          letterSpacing: '0.1em',
          color: COLORS.textMuted,
          opacity: entrada(frame, -6, 6),
          transform: `translateY(${(1 - entrada(frame, -6, 6)) * -10}px)`,
        }}
      >
        LISTA VIRAL · SIN REVISAR
      </div>

      {/* Resplandor detrás del 27 */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 330,
          top: Y_NUMERO - 330,
          width: 660,
          height: 660,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${WARN_GLOW} 0%, transparent 68%)`,
          opacity: brilloNum,
        }}
      />

      {/* Capa de frente: marcador rodillo */}
      <div style={{ transform: `scale(${escalaNum * respira})`, transformOrigin: `${W / 2}px ${Y_NUMERO}px` }}>
        <MarcadorRodillo
          x={W / 2}
          y={Y_NUMERO}
          tamano={TAM_NUMERO}
          valor={27}
          inicio={0}
          aterrizaDecenas={golpe - 6}
          aterrizaUnidades={golpe}
          color={WARN}
          glow={WARN_GLOW}
        />
      </div>
      <Fragmentos inicio={golpe} x={W / 2} y={Y_NUMERO} color={WARN} semilla="e01-27" cantidad={20} velocidad={24} gravedad={0.9} />

      <div style={{ position: 'absolute', left: 0, width: W, top: Y_HACKEOS, display: 'flex', justifyContent: 'center' }}>
        <LetrasCaen texto="HACKEOS" inicio={tHackeos} fontSize={56} subrayado={WARN} />
      </div>

      {/* Reloj de 48 horas */}
      <RelojAnillo x={W / 2 - 180} y={Y_RELOJ} diametro={150} color={WARN} inicio={tCuarenta} fin={tHoras + 6} />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 88,
          top: Y_RELOJ - 48,
          width: 300,
          height: 96,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: SPACING.radius,
          border: `3px solid ${WARN}`,
          background: WARN_WASH,
          boxShadow: `0 0 ${18 + 10 * Math.sin(frame / 8)}px ${WARN_GLOW}`,
          fontFamily: FONTS.mono,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1,
          color: WARN,
          opacity: entrada(frame, tCuarenta, 4),
          transform: `scale(${0.6 + 0.4 * kChip})`,
        }}
      >
        48 h
      </div>

      {/* Enlace de la lista al agente con pulsos que bajan */}
      {frame >= tAgente - 6 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: W / 2 - 1.5,
              top: Y_RELOJ + 70,
              width: 3,
              height: (Y_AGENTE - 58 - Y_RELOJ - 70) * entre(frame, tAgente - 6, tAgente + 6),
              background: `repeating-linear-gradient(180deg, ${COLORS.line} 0 10px, transparent 10px 20px)`,
            }}
          />
          {[0, 1, 2].map((i) => {
            const t = (((frame - tAgente) / 22 + i / 3) % 1 + 1) % 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: W / 2 - 7,
                  top: Y_RELOJ + 70 + t * (Y_AGENTE - 58 - Y_RELOJ - 70) - 7,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: COLORS.accent,
                  boxShadow: `0 0 14px ${COLORS.accent}`,
                  opacity: build * Math.sin(t * Math.PI),
                }}
              />
            );
          })}
        </>
      ) : null}

      <div style={{ transform: `translateY(${flotaAgente}px)` }}>
        <NodoAgente x={W / 2} y={Y_AGENTE} build={build} borde={build > 0.6 ? COLORS.accent : COLORS.borderStrong} />
        {/* Barrido de luz dentro del nodo */}
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 190,
            top: Y_AGENTE - 58,
            width: 380,
            height: 116,
            borderRadius: SPACING.radius,
            overflow: 'hidden',
            opacity: build,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${haz * 150 - 30}%`,
              width: '26%',
              background: `linear-gradient(100deg, transparent, ${COLORS.accentGlow}, transparent)`,
            }}
          />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, width: W, top: Y_SELLO - 50, textAlign: 'center' }}>
        <Sello inicio={tRevisara - FRAME_IMPACTO_SELLO} fontSize={60} rotacion={-5} onda={false}>
          REVISAR
        </Sello>
      </div>
    </AbsoluteFill>
  );
};
