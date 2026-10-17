import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { useCuadro } from '../../kit/tiempo';
import { useMarca } from '../../marca';
import { FPS } from '../../tema';
import { estiloDisplay } from './Sistema';

export const fijar = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Rojo de «precio de referencia tachado»: no es de la marca, es el color universal de «caro». */
export const ROJO = '#FF4D5E';

/** Unidad de diseño: todo se dibuja para 1080 px de ancho y escala con la composición (9:16 o 4:5). */
export const useU = (): number => {
  const { width } = useVideoConfig();
  return width / 1080;
};

/** Resorte con carácter. `rebote` bajo = más sobrepaso. */
export const resorte = (
  frame: number,
  inicio: number,
  config: { damping?: number; mass?: number; stiffness?: number } = {},
): number =>
  spring({
    frame: frame - inicio,
    fps: FPS,
    config: { damping: 12, mass: 0.7, stiffness: 150, ...config },
  });

/** Tipografía de titulares: la display pesada del sistema (Archivo 900), en mayúsculas y apretada. */
export const useTitular = (u: number, tamano: number, color?: string): React.CSSProperties => {
  const { colores } = useMarca();
  return {
    ...estiloDisplay(u, tamano),
    textTransform: 'uppercase',
    color: color ?? colores.blanco,
  };
};

/** Destello: un fogonazo radial que sube de golpe y se apaga. */
export const Destello: React.FC<{ en: number; color?: string; duracion?: number }> = ({
  en,
  color = '#FFFFFF',
  duracion = 16,
}) => {
  const frame = useCuadro();
  const t = interpolate(frame, [en, en + duracion], [0, 1], fijar);
  if (t <= 0 || t >= 1) return null;
  const a = (1 - t) ** 2;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(55% 40% at 50% 50%, ${color}, transparent 70%)`,
        opacity: a * 0.9,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Anillo que se expande desde el centro (onda de choque). */
export const Onda: React.FC<{ en: number; tam: number; color: string }> = ({ en, tam, color }) => {
  const frame = useCuadro();
  const t = interpolate(frame, [en, en + 24], [0, 1], fijar);
  if (t <= 0 || t >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: tam,
        height: tam,
        marginLeft: -tam / 2,
        marginTop: -tam / 2,
        borderRadius: '50%',
        border: `${6 * (1 - t) + 1}px solid ${color}`,
        opacity: 1 - t,
        transform: `scale(${0.3 + t * 1.8})`,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Barrido de brillo diagonal que cruza una pieza (usar dentro de un contenedor `overflow: hidden`). */
export const Brillo: React.FC<{ en: number; duracion?: number; alfa?: number }> = ({
  en,
  duracion = 26,
  alfa = 0.5,
}) => {
  const frame = useCuadro();
  const t = interpolate(frame, [en, en + duracion], [-0.4, 1.4], fijar);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(105deg, transparent ${t * 100 - 18}%, rgba(255,255,255,${alfa}) ${t * 100}%, transparent ${t * 100 + 18}%)`,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Desenfoque de movimiento aproximado: proporcional a lo que se movió la pieza entre dos cuadros. */
export const desenfoqueDe = (velocidad: number, maximo = 14): string =>
  `blur(${Math.min(maximo, Math.abs(velocidad)).toFixed(2)}px)`;

/** Alto, en px de un lienzo 9:16 de 1080×1920, de la zona segura de Reels con el contenido clave. */
const ZONA = { desde: 280, hasta: 1120, referencia: 1920 } as const;

/**
 * Caja de diseño de 1080 × `alto` px centrada en la zona segura de Reels/Stories (contenido clave
 * entre y≈280 e y≈1120 de 1920; abajo queda la franja de subtítulos y la interfaz de la app). En 4:5
 * u otros formatos la caja se escala para caber. `desde`/`hasta` cambian la franja (px sobre 1920).
 */
export const ZonaSegura: React.FC<{
  children: React.ReactNode;
  desde?: number;
  hasta?: number;
}> = ({ children, desde = ZONA.desde, hasta = ZONA.hasta }) => {
  const { height } = useVideoConfig();
  const u = useU();
  const alto = hasta - desde;
  const franja = (alto / ZONA.referencia) * height;
  const k = Math.min(1, franja / (alto * u));
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: (desde / ZONA.referencia) * height,
          height: franja,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: 'none',
            width: 1080 * u,
            height: alto * u,
            transform: `scale(${k})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Banda de subtítulos: centrada en y≈1225 de 1920 (franja 1150–1300). */
export const BANDA_SUBTITULOS = { centro: 1225, referencia: 1920 } as const;
