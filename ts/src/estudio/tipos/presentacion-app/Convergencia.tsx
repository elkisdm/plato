import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Captura } from '../../kit/Captura';
import { FondoDia } from '../../kit/FondoDia';
import { useVertical } from '../../kit/formato';
import { MarcoNavegador } from '../../kit/MarcoNavegador';
import { TelefonoCaptura } from '../../kit/TelefonoCaptura';
import { avance } from '../../kit/animacion';
import { useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { suave } from '../../tema';
import type { PropsDe } from './esquemas';

/**
 * Los dos mundos se encuentran: el cliente (de día) y el equipo (de noche), lado a lado; el día se
 * repliega, los dos dispositivos se juntan en una sola imagen y aparecen los beneficios.
 */
export const Convergencia: React.FC<{ escena: Escena; props: PropsDe<'convergencia'> }> = ({
  props,
}) => {
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const { colores, fuentes } = useMarca();
  const cliente = useAsset(props.cliente);
  const equipo = useAsset(props.equipo);
  const une = interpolate(frame, [props.uneEn, props.uneEn + 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: suave,
  });
  // El día ocupa media pantalla y se repliega hasta desaparecer cuando los mundos se unen.
  const dia = 50 * (1 - une);
  const recorteDia = vertical ? `inset(0 0 ${100 - dia}% 0)` : `inset(0 ${100 - dia}% 0 0)`;
  const anchoNavegador = vertical ? 860 : 900;
  const separacion = vertical ? 520 * (1 - une) : 520 * (1 - une);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: recorteDia }}>
        <FondoDia />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          background: colores.cian,
          boxShadow: `0 0 16px ${colores.cian}`,
          opacity: 1 - une,
          ...(vertical
            ? { left: 0, right: 0, top: `${dia}%`, height: 2 }
            : { top: 0, bottom: 0, left: `${dia}%`, width: 2 }),
        }}
      />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            transform: vertical
              ? `translateY(${separacion * 0.9 + 60 * une}px)`
              : `translateX(${separacion * 0.55 + 90 * une}px) translateY(${-40 * une}px)`,
          }}
        >
          <MarcoNavegador url={props.url} ancho={anchoNavegador}>
            <Captura captura={equipo} ancho={anchoNavegador} />
          </MarcoNavegador>
        </div>
        <div
          style={{
            position: 'absolute',
            transform: vertical
              ? `translateY(${-separacion * 1.1 - 160 * une}px) translateX(${-220 * une}px)`
              : `translateX(${-separacion * 1.05 - 330 * une}px) translateY(${30 * une}px)`,
          }}
        >
          <TelefonoCaptura captura={cliente} ancho={vertical ? 300 : 300} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: vertical ? 150 : 70,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: vertical ? 18 : 40,
            alignItems: 'center',
          }}
        >
          {props.beneficios.map((b, i) => {
            const en = Array.isArray(props.beneficiosEn)
              ? (props.beneficiosEn[i] ?? 0)
              : props.beneficiosEn + i * 14;
            const t = avance(frame, en, 20);
            return (
              <span
                key={b}
                style={{
                  fontFamily: fuentes.serif,
                  fontStyle: 'italic',
                  fontSize: vertical ? 56 : 48,
                  color: colores.blanco,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 16}px)`,
                  filter: `blur(${(1 - t) * 8}px)`,
                  padding: '6px 26px',
                  borderRadius: 999,
                  background: 'rgba(18, 24, 58, 0.72)',
                }}
              >
                {b}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
