import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';

import type { EscenaOred, TramoOred } from './timeline';
import { compilarLinea, ESCENAS_ORED, FPS_ORED, subtitulosDeEscena } from './timeline';

/**
 * "El registro que sabe decir no" — video concepto de la demo ORED-ADI.
 * Corte v1 (animatic): metraje real de Playwright + VO scratch. Los tokens
 * son los del producto (canvas lavanda, acento teal, tinta para lo suprimido);
 * el video debe verse como ORED, no como una plantilla.
 */

const TOKENS = {
  fondo: '#F5F4FB',
  tinta: '#1B1A26',
  tintaSuave: '#6B677F',
  teal: '#0E9384',
  tealClaro: '#3AD6BE',
  carbon: '#14131D',
  papel: '#FFFFFF',
};

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", Menlo, monospace';

/** Empuje de cámara de la escena: escala con easing suave hacia su origen. */
function Metraje({ tramo }: { tramo: TramoOred }) {
  const frame = useCurrentFrame();
  const { escena } = tramo;
  const escala = interpolate(
    frame,
    [0, tramo.duracionFrames],
    [escena.zoom.desde, escena.zoom.hasta],
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateRight: 'clamp',
    },
  );
  const entrada = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.fondo }}>
      <OffthreadVideo
        muted
        src={staticFile(escena.clip!)}
        startFrom={Math.round(escena.recorte * FPS_ORED)}
        playbackRate={tramo.rate}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: entrada,
          transform: `scale(${escala})`,
          transformOrigin: `${escena.zoom.origenX * 100}% ${escena.zoom.origenY * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
}

/** Claqueta de escena: ruta + tesis, arriba a la izquierda. */
function Claqueta({ texto }: { texto: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const [ruta, ...resto] = texto.split(' — ');
  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        left: 44,
        display: 'flex',
        alignItems: 'baseline',
        gap: 14,
        opacity,
        fontFamily: MONO,
        fontSize: 21,
        letterSpacing: '0.04em',
      }}
    >
      <span
        style={{
          background: TOKENS.carbon,
          color: TOKENS.tealClaro,
          padding: '6px 14px',
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        {ruta}
      </span>
      {resto.length > 0 && (
        <span
          style={{
            color: TOKENS.carbon,
            background: 'rgba(245,244,251,0.88)',
            padding: '6px 12px',
            borderRadius: 8,
          }}
        >
          {resto.join(' — ')}
        </span>
      )}
    </div>
  );
}

/** Cold open: tres golpes de texto sobre carbón; el metraje asoma al final. */
function ColdOpen({ tramo }: { tramo: TramoOred }) {
  const frame = useCurrentFrame();
  const golpes: Array<{ texto: string; desde: number }> = [
    { texto: 'Tu data de mercado ya se vende.', desde: 18 },
    { texto: 'A tu competencia.', desde: 120 },
    { texto: 'Y a ti.', desde: 205 },
  ];
  const velo = interpolate(frame, [250, tramo.duracionFrames], [1, 0.62], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.carbon }}>
      {frame > 235 && <Metraje tramo={tramo} />}
      <AbsoluteFill style={{ backgroundColor: TOKENS.carbon, opacity: velo }} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 160px',
          gap: 26,
        }}
      >
        {golpes.map((g) => {
          const op = interpolate(frame, [g.desde, g.desde + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={g.texto}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 84,
                letterSpacing: '-0.02em',
                color: '#F5F4FB',
                opacity: op,
              }}
            >
              {g.texto}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Cierre: el motivo de la matriz suprimida + marca y tagline. */
function Cierre({ tramo }: { tramo: TramoOred }) {
  const frame = useCurrentFrame();
  const celdas = [
    '3.307',
    'n<5',
    '2.980',
    '4.120',
    'dom',
    '3.640',
    'n<5',
    '2.815',
    'dom',
    '3.150',
    '3.980',
    'n<5',
    '3.560',
    '3.210',
    'n<5',
    '4.480',
  ];
  const op = (desde: number) =>
    interpolate(frame, [desde, desde + 14], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const holdFinal = interpolate(
    frame,
    [tramo.duracionFrames - 20, tramo.duracionFrames - 4],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.fondo,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 34,
        opacity: holdFinal,
      }}
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 96px)', gap: 8, opacity: op(4) }}
      >
        {celdas.map((c, i) => {
          const suprimida = c === 'n<5' || c === 'dom';
          return (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: 17,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 6,
                background: suprimida ? TOKENS.carbon : TOKENS.papel,
                color: suprimida ? TOKENS.fondo : TOKENS.tintaSuave,
                border: `1px solid ${suprimida ? TOKENS.carbon : '#E3E1F0'}`,
                fontWeight: suprimida ? 600 : 400,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: '-0.02em',
          color: TOKENS.tinta,
          opacity: op(30),
        }}
      >
        ORED
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 34,
          color: TOKENS.tintaSuave,
          opacity: op(52),
          textAlign: 'center',
          maxWidth: 980,
          lineHeight: 1.4,
        }}
      >
        El registro que sabe decir <span style={{ color: TOKENS.teal, fontWeight: 700 }}>no</span>.
        <br />
        Las reglas a la vista, el dato con su dueño.
      </div>
      <div style={{ fontFamily: MONO, fontSize: 19, color: TOKENS.tintaSuave, opacity: op(70) }}>
        demo con datos sintéticos · reunión ADI · agosto 2026
      </div>
    </AbsoluteFill>
  );
}

/** Un subtítulo del VO, en chip carbón al pie. */
function Subtitulo({ texto }: { texto: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 52,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 33,
          lineHeight: 1.35,
          color: '#F5F4FB',
          background: 'rgba(20,19,29,0.86)',
          padding: '10px 26px',
          borderRadius: 12,
          maxWidth: 1240,
        }}
      >
        {texto}
      </div>
    </div>
  );
}

function contenidoDeEscena(tramo: TramoOred): React.ReactNode {
  const { escena } = tramo;
  if (escena.id === 'cold') return <ColdOpen tramo={tramo} />;
  if (escena.id === 'cierre') return <Cierre tramo={tramo} />;
  return (
    <AbsoluteFill>
      <Metraje tramo={tramo} />
      {escena.claqueta && <Claqueta texto={escena.claqueta} />}
    </AbsoluteFill>
  );
}

export const OredConcepto = () => {
  const linea = compilarLinea(ESCENAS_ORED);
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.fondo }}>
      {linea.map((tramo) => (
        <Sequence
          key={tramo.escena.id}
          from={tramo.desdeFrame}
          durationInFrames={tramo.duracionFrames}
          name={tramo.escena.id}
        >
          {contenidoDeEscena(tramo)}
        </Sequence>
      ))}

      {/* Pista de VO: absoluta, cruza escenas (mercado → payload). */}
      {linea.map((tramo) =>
        tramo.escena.vo === null ? null : (
          <Sequence
            key={`vo-${tramo.escena.id}`}
            from={tramo.desdeFrame + Math.round(tramo.escena.voDesde * FPS_ORED)}
            durationInFrames={Math.round(tramo.escena.voDur * FPS_ORED) + 10}
            name={`vo-${tramo.escena.id}`}
          >
            <Audio src={staticFile(tramo.escena.vo)} />
          </Sequence>
        ),
      )}

      {/* Subtítulos: absolutos por la misma razón. */}
      {linea.flatMap((tramo) => {
        if (tramo.escena.vo === null) return [];
        return subtitulosDeEscena(tramo.escena).map((s, i) => (
          <Sequence
            key={`sub-${tramo.escena.id}-${i}`}
            from={tramo.desdeFrame + s.desdeFrame}
            durationInFrames={s.hastaFrame - s.desdeFrame}
            name={`sub-${tramo.escena.id}-${i}`}
          >
            <Subtitulo texto={s.texto} />
          </Sequence>
        ));
      })}
    </AbsoluteFill>
  );
};
