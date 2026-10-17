import React from 'react';
import { useMarca } from '../../marca';
import { avance } from '../animacion';
import { useCuadro } from '../tiempo';
import { analizarCifra, formatearCifra } from './cifra';
import { useUnidad } from './unidad';

type Props = {
  /** Cifra grande (si es numérica, cuenta de 0 al valor). Excluyente con `lista`. */
  cifra?: string;
  etiqueta?: string;
  /** Hasta 5 ítems que aparecen de a uno. Excluyente con `cifra`. */
  lista?: string[];
  inicio?: number;
};

/** Una cifra grande con su etiqueta, o una lista corta que se arma ítem por ítem. */
export const TarjetaDato: React.FC<Props> = ({ cifra, etiqueta, lista, inicio = 6 }) => {
  const { colores, fuentes } = useMarca();
  const frame = useCuadro();
  const { u } = useUnidad();

  if (lista) {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 18 * u,
          fontFamily: fuentes.ui,
        }}
      >
        {lista.map((item, i) => {
          const t = avance(frame, inicio + i * 12, 18);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28 * u,
                padding: `${22 * u}px ${36 * u}px`,
                borderRadius: 22 * u,
                background: `${colores.noche}CC`,
                border: `${Math.max(1, 2 * u)}px solid ${colores.indigo}88`,
                opacity: t,
                transform: `translateX(${(1 - t) * -80 * u}px)`,
              }}
            >
              <div
                style={{
                  flex: 'none',
                  width: 18 * u,
                  height: 18 * u,
                  borderRadius: '50%',
                  background: colores.cian,
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 60 * u,
                  lineHeight: 1.1,
                  color: colores.blanco,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const analizada = cifra ? analizarCifra(cifra) : null;
  const progreso = avance(frame, inicio, 40);
  const mostrada =
    cifra && analizada ? formatearCifra(analizada, analizada.valor * progreso) : (cifra ?? '');
  const aparece = avance(frame, inicio, 14);
  const tam = (mostrada.length > 8 ? 210 : mostrada.length > 5 ? 270 : 330) * u;
  const rotulo = avance(frame, inicio + 24, 20);
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div
        style={{
          fontFamily: fuentes.serif,
          fontSize: tam,
          lineHeight: 1,
          color: colores.blanco,
          fontVariantNumeric: 'tabular-nums',
          opacity: aparece,
          textShadow: `0 ${4 * u}px ${40 * u}px ${colores.indigo}88`,
        }}
      >
        {mostrada}
      </div>
      {etiqueta ? (
        <div
          style={{
            marginTop: 30 * u,
            fontFamily: fuentes.ui,
            fontWeight: 700,
            fontSize: 40 * u,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colores.antetitulo,
            opacity: rotulo,
            transform: `translateY(${(1 - rotulo) * 20 * u}px)`,
          }}
        >
          {etiqueta}
        </div>
      ) : null}
    </div>
  );
};
