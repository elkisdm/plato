import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { avance } from '../../kit/animacion';
import { Fondo } from '../../kit/Fondo';
import { FondoDia } from '../../kit/FondoDia';
import { useVertical } from '../../kit/formato';
import { TituloSerif } from '../../kit/TituloSerif';
import { useMarca } from '../../marca';
import type { Escena } from '../../proyecto';
import { suave } from '../../tema';
import type { PropsDe } from './esquemas';

/** Giro de la historia: la noche se abre desde el centro y se come el día; aparece el mundo del equipo. */
export const CambioMundo: React.FC<{ escena: Escena; props: PropsDe<'cambioMundo'> }> = ({
  escena,
  props,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = useVertical();
  const { colores, fuentes } = useMarca();
  const maximo = Math.hypot(width, height) / 2 + 40;
  const radio = interpolate(
    frame,
    [props.barridoEn, props.barridoEn + props.barridoDura],
    [0, maximo],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: suave,
    },
  );
  const url = avance(frame, props.barridoEn + props.barridoDura * 0.6 + 16, 22);
  const mascara = `radial-gradient(circle at 50% 50%, transparent ${radio}px, black ${radio + 2}px)`;
  return (
    <AbsoluteFill>
      {/* Noche propia: sin ella, el círculo dejaría ver la escena anterior mientras termina el fundido. */}
      <Fondo />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
          padding: vertical ? '0 70px' : '0 160px',
        }}
      >
        <TituloSerif
          antetitulo={escena.antetitulo}
          titulo={escena.titulo}
          inicio={props.barridoEn + Math.round(props.barridoDura * 0.6)}
          tamano={vertical ? 100 : 104}
          alineacion="center"
          anchoMaximo={vertical ? 940 : 1400}
        />
        <div
          style={{
            fontFamily: fuentes.ui,
            fontSize: vertical ? 34 : 32,
            fontWeight: 500,
            color: colores.indigoSuave,
            padding: '14px 28px',
            borderRadius: 999,
            border: '1px solid rgba(233, 237, 255, 0.25)',
            opacity: url,
            transform: `translateY(${(1 - url) * 16}px)`,
          }}
        >
          {props.url}
        </div>
      </AbsoluteFill>
      {radio < maximo ? (
        <AbsoluteFill style={{ WebkitMaskImage: mascara, maskImage: mascara }}>
          <FondoDia />
        </AbsoluteFill>
      ) : null}
      {radio > 0 && radio < maximo ? (
        <div
          style={{
            position: 'absolute',
            left: width / 2 - radio,
            top: height / 2 - radio,
            width: radio * 2,
            height: radio * 2,
            borderRadius: '50%',
            border: `2px solid ${colores.cian}`,
            boxShadow: `0 0 24px ${colores.cian}`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
