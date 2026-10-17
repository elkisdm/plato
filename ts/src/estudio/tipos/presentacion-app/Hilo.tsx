import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { centro } from '../../assets';
import { avance, porTramos } from '../../kit/animacion';
import { Captura } from '../../kit/Captura';
import { useVertical } from '../../kit/formato';
import { TelefonoCaptura } from '../../kit/TelefonoCaptura';
import { useMarca } from '../../marca';
import { servir, useProyecto, type AssetServido, type Escena } from '../../proyecto';
import { radios, sombraTarjeta } from '../../tema';
import type { PropsDe } from './esquemas';
import { zonaRef } from './zonas';

type Estacion = PropsDe<'hilo'>['estaciones'][number];

/** Una estación: teléfono si la captura es móvil, tarjeta si es apaisada o un correo. */
const Pieza: React.FC<{
  e: Estacion;
  captura: AssetServido;
  vertical: boolean;
  activa: boolean;
}> = ({ e, captura, vertical, activa }) => {
  const proporcion = captura.alto / captura.ancho;
  const resaltados =
    activa && e.zona ? [{ zona: zonaRef(captura, e.zona), inicio: e.en + 10 }] : [];
  if (proporcion > 1.8) {
    return (
      <TelefonoCaptura captura={captura} ancho={vertical ? 420 : 430} resaltados={resaltados} />
    );
  }
  const ancho = proporcion < 1 ? (vertical ? 700 : 760) : vertical ? 540 : 600;
  const altoNatural = (ancho * captura.alto) / captura.ancho;
  const altoVisible = Math.min(altoNatural, vertical ? 820 : 800);
  const foco = e.zona ? centro(zonaRef(captura, e.zona)).y : 0;
  return (
    <div style={{ borderRadius: radios.tarjeta, overflow: 'hidden', boxShadow: sombraTarjeta }}>
      <Captura
        captura={captura}
        ancho={ancho}
        altoVisible={altoVisible}
        desplazamiento={[{ frame: 0, foco }]}
        resaltados={resaltados}
      />
    </div>
  );
};

/**
 * El recorrido como viaje: las estaciones van en fila, un hilo cian las une y la cámara lo sigue.
 * Cada estación se activa en su frame `en`: se acerca, se ilumina y resalta su zona.
 */
export const Hilo: React.FC<{ escena: Escena; props: PropsDe<'hilo'> }> = ({ props }) => {
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const { colores, fuentes } = useMarca();
  const { indice } = useProyecto();
  const paso = vertical ? 700 : 880;
  const { estaciones } = props;
  // La cámara viaja de estación en estación, llegando a cada una en su `en`.
  const foco = porTramos(
    frame,
    estaciones.map((e) => e.en),
    estaciones.map((_, i) => i * paso),
  );
  const primera = estaciones[0]?.en ?? 0;
  const ultima = estaciones[estaciones.length - 1]?.en ?? 0;
  const hilo = avance(frame, primera - 10, ultima - primera + 20);
  const largo = (estaciones.length - 1) * paso;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: vertical ? '48%' : '46%',
          transform: `translateX(${-foco}px)`,
        }}
      >
        {/* El hilo: una línea cian que se dibuja al ritmo del viaje. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: 2,
            width: largo * hilo,
            background: colores.cian,
            boxShadow: `0 0 10px ${colores.cian}`,
            borderRadius: 2,
          }}
        />
        {estaciones.map((e, i) => {
          const distancia = Math.min(1, Math.abs(foco - i * paso) / paso);
          const activa = distancia < 0.5;
          const captura = servir(indice, e.captura);
          return (
            <div
              key={e.etiqueta}
              style={{
                position: 'absolute',
                left: i * paso,
                top: 0,
                transform: `translate(-50%, -50%) scale(${1 - 0.14 * distancia})`,
                opacity: 1 - 0.55 * distancia,
                filter: `blur(${distancia * 3}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 28,
              }}
            >
              <Pieza e={e} captura={captura} vertical={vertical} activa={activa} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: activa ? colores.cian : 'transparent',
                    border: `2px solid ${colores.cian}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: fuentes.ui,
                    fontSize: vertical ? 30 : 26,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: colores.noche,
                  }}
                >
                  {e.etiqueta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
