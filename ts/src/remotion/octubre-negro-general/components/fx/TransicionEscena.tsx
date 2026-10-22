import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { estadoTransicion, type VarianteTransicion } from '../../lib/fx/transicion';
import { SOLAPE } from '../../lib/lineaTiempo';

type Props = {
  /** Ventana de la escena en frames globales. */
  desde: number;
  hasta: number;
  /** false en la primera escena (el cuadro 0 es la miniatura): sin transición de entrada. */
  entra: boolean;
  /** false en la última escena: el cierre se sostiene completo. */
  sale: boolean;
  /** Variante de la frontera anterior (entrada) y de la siguiente (salida). */
  varianteEntra: VarianteTransicion;
  varianteSale: VarianteTransicion;
  children: ReactNode;
};

/**
 * Transición de una escena contra sus vecinas: la saliente crece (1→1.08), se desenfoca (≤10 px) y separa
 * canales RGB (≤6 px); la entrante llega desde 0.94 con barrido de luz diagonal. Variantes: zoom, whip, flash.
 * Desenfoque y cromática son un único filtro SVG que solo se monta mientras hay transición.
 */
export const TransicionEscena = ({ desde, hasta, entra, sale, varianteEntra, varianteSale, children }: Props) => {
  const frame = useCurrentFrame();
  const enEntrada = entra && frame < desde + SOLAPE;
  const e = estadoTransicion({
    frame,
    desde,
    hasta,
    solape: SOLAPE,
    variante: enEntrada ? varianteEntra : varianteSale,
    entra: enEntrada,
    sale: !enEntrada && sale,
  });
  const filtrada = e.blurX > 0.3 || e.blurY > 0.3 || e.cromatica > 0.3;
  const id = `ton-${desde}`;

  return (
    <AbsoluteFill>
      {filtrada ? (
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${e.blurX} ${e.blurY}`} result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bl" />
            <feOffset in="r" dx={-e.cromatica} dy={0} result="r2" />
            <feOffset in="bl" dx={e.cromatica} dy={0} result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          opacity: e.opacity,
          transform: `translateX(${e.x}px) scale(${e.scale})`,
          transformOrigin: '50% 50%',
          filter: filtrada ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {enEntrada && e.barrido < 1 ? <BarridoLuz progreso={e.barrido} flash={e.flash} /> : null}
    </AbsoluteFill>
  );
};

/** Banda de luz diagonal que cruza el lienzo (progreso 0→1) y, en la variante flash, un destello blanco. */
const BarridoLuz = ({ progreso, flash }: { progreso: number; flash: number }) => {
  const x = -700 + progreso * 2500;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: -300,
          width: 420,
          height: 2600,
          transform: 'rotate(18deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.10) 70%, transparent)',
          mixBlendMode: 'screen',
        }}
      />
      {flash > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.45 }} /> : null}
    </AbsoluteFill>
  );
};
