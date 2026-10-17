import React from 'react';
import { Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { zonaDe, zonasDe } from '../assets';
import { useMarca } from '../marca';
import type { AssetServido } from '../proyecto';
import { radios, sombraTarjeta } from '../tema';
import { avance } from './animacion';
import { Resaltado } from './Resaltado';

type Tiempos = {
  resaltado: number;
  transcripcion: number;
  pasoLinea: number;
  duracionLinea: number;
};

/** Onda que late sobre un punto de la imagen (p. ej. el «Grabando» de una videollamada). */
const Latido: React.FC<{ x: number; y: number; radio: number }> = ({ x, y, radio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fase = (frame % fps) / fps;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - radio * 3,
        top: y - radio * 3,
        width: radio * 6,
        height: radio * 6,
        borderRadius: '50%',
        border: `${Math.max(2, radio * 0.3)}px solid #EF4444`,
        transform: `scale(${0.35 + 0.65 * fase})`,
        opacity: 1 - fase,
      }}
    />
  );
};

type Props = { captura: AssetServido; ancho: number; tiempos: Tiempos };

/**
 * Una ilustración de videollamada animada encima: late el punto de «Grabando» (zona `puntoGrabando`),
 * se resalta al asistente (zona `asistente`) y la transcripción se escribe línea por línea (zonas
 * `lineasTranscripcion`, tapadas con el color del panel hasta que les toca).
 */
export const IlustracionScribe: React.FC<Props> = ({ captura, ancho, tiempos }) => {
  const frame = useCurrentFrame();
  const { colores } = useMarca();
  const alto = (ancho * captura.alto) / captura.ancho;
  const punto = zonaDe(captura, 'puntoGrabando');
  return (
    <div
      style={{
        position: 'relative',
        width: ancho,
        height: alto,
        borderRadius: radios.tarjeta,
        overflow: 'hidden',
        boxShadow: sombraTarjeta,
      }}
    >
      <Img src={captura.src} style={{ display: 'block', width: ancho, height: alto }} />
      {zonasDe(captura, 'lineasTranscripcion').map((linea, i) => {
        // Una cortina del color del panel se retira hacia la derecha: la línea se «escribe».
        const t = avance(
          frame,
          tiempos.transcripcion + i * tiempos.pasoLinea,
          tiempos.duracionLinea,
        );
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (linea.x + linea.w * t) * ancho,
              top: linea.y * alto,
              width: linea.w * (1 - t) * ancho + 2,
              height: linea.h * alto,
              background: colores.hueso,
            }}
          />
        );
      })}
      <Latido
        x={(punto.x + punto.w / 2) * ancho}
        y={(punto.y + punto.h / 2) * alto}
        radio={(punto.w / 2) * ancho}
      />
      <Resaltado
        zona={zonaDe(captura, 'asistente')}
        inicio={tiempos.resaltado}
        ancho={ancho}
        alto={alto}
        margen={4}
      />
    </div>
  );
};
