import { random, useCurrentFrame } from 'remotion';

import { COLORS, WARN, WARN_WASH } from '../constants/theme';

type Props = {
  /** Esquina superior izquierda y tamaño de la ventana de la lista. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Frame global del golpe: hasta ahí la lista corre rápido; después baja a un deslizamiento lento. */
  golpe: number;
  /** Frame global en que empieza el haz de escaneo (cada `periodoHaz` frames se repite). */
  inicioHaz: number;
  periodoHaz?: number;
  duracionHaz?: number;
  opacidad?: number;
};

const PASO = 40;
const FILAS = 27;
const ANCHOS = [0.85, 0.62, 0.78, 0.5, 0.7, 0.9, 0.58, 0.74, 0.46];

/** Desplazamiento acumulado (px): rápido hasta el golpe y lento después, sin pararse nunca. */
const desplazamiento = (frame: number, golpe: number): number => {
  if (frame <= golpe) return frame * 26;
  const k = frame - golpe;
  return golpe * 26 + k * 3 + 150 * (1 - Math.exp(-k / 6));
};

/**
 * La «lista» de 27 renglones sin texto: se desplaza deprisa y parpadea; tras el golpe se desliza despacio.
 * El haz de escaneo (banda turquesa que baja) pinta de turquesa los renglones que va revisando.
 */
export const ListaParpadeo = ({
  x,
  y,
  ancho,
  alto,
  golpe,
  inicioHaz,
  periodoHaz = 40,
  duracionHaz = 16,
  opacidad = 1,
}: Props) => {
  const frame = useCurrentFrame();
  const scroll = desplazamiento(frame, golpe);
  const rapido = frame < golpe;
  const bloque = Math.floor(frame / (rapido ? 2 : 6));
  const largo = FILAS * PASO;

  const hazT = frame >= inicioHaz ? ((frame - inicioHaz) % periodoHaz) / duracionHaz : -1;
  const hazY = hazT >= 0 && hazT <= 1 ? hazT * (alto + 80) - 40 : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: ancho,
        height: alto,
        borderRadius: 26,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${COLORS.surface}, ${COLORS.bg})`,
        border: `1.5px solid ${COLORS.borderStrong}`,
        opacity: opacidad,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
      }}
    >
      {Array.from({ length: FILAS }, (_, k) => {
        const yy = (((k * PASO - scroll) % largo) + largo) % largo - PASO;
        const enciende = random(`fila-${k}-${bloque}`) > (rapido ? 0.45 : 0.7);
        const revisada = hazY !== null && yy + 17 < hazY;
        const col = revisada ? COLORS.accent : WARN;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 44,
              right: 44,
              top: yy,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: enciende ? 1 : 0.3,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `2.5px solid ${col}`,
                background: revisada ? COLORS.accentWash : WARN_WASH,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: 14,
                borderRadius: 7,
                background: revisada ? COLORS.accent : COLORS.textMuted,
                opacity: revisada ? 0.75 : 0.55,
                width: `${ANCHOS[k % ANCHOS.length]! * 100}%`,
              }}
            />
          </div>
        );
      })}
      {hazY !== null ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: hazY - 38,
            height: 76,
            background: `linear-gradient(180deg, transparent, ${COLORS.accentGlow} 60%, ${COLORS.accent}CC 96%, transparent)`,
            boxShadow: `0 0 30px ${COLORS.accentGlow}`,
          }}
        />
      ) : null}
    </div>
  );
};
