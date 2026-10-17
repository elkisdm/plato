import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { SubtitulosPalabra, usePunch } from '../../kit/SubtitulosPalabra';
import { useCuadro } from '../../kit/tiempo';
import { useProyecto, type Escena } from '../../proyecto';
import { tiempos } from '../../tema';
import { Ahorro, Cierre, Gancho, PrecioTachado, Sellos } from './Escenas';
import type { Reemplazo } from './calculos';
import { esquemas, type NombreEscena } from './esquemas';
import { FondoAnuncio } from './FondoAnuncio';
import { CuentaRegresiva, Fecha, PortadaMonitor, Telefono3d } from './Pantallas';

type ComponenteEscena = React.FC<{ escena: Escena; props: never }>;

/**
 * Toda escena del tipo lleva, además de su contenido: un golpe de entrada (la escena llega un poco
 * grande y desenfocada y se asienta), un «punch» de cámara en cada arranque de frase de la voz y los
 * subtítulos palabra por palabra (se apagan con `subtitulos: false` en las props de la escena).
 */
const conExtras = (Escena_: React.FC<{ escena: Escena; props: never }>): ComponenteEscena => {
  const Envuelta: ComponenteEscena = ({ escena, props }) => {
    const frame = useCuadro();
    const { durationInFrames, fps } = useVideoConfig();
    const reemplazos = (props as { reemplazos?: Reemplazo[] }).reemplazos;
    const punch = usePunch(escena, reemplazos);
    // El fondo (video) se cruza entre escenas pero el primer plano NO: cada escena oculta el suyo
    // durante la mitad de la transición que le toca (N cuadros), así nunca se ven textos de dos
    // escenas a la vez. La primera escena no tiene cruce de entrada ni la última de salida.
    const { guion } = useProyecto();
    const N = Math.round(tiempos.transicion / 2);
    const conCruceEntra = guion.escenas[0]?.id !== escena.id;
    const conCruceSale = guion.escenas[guion.escenas.length - 1]?.id !== escena.id;
    const total = (durationInFrames * 30) / fps;
    const inicio = conCruceEntra ? N : 0;
    const entrada = interpolate(frame, [inicio, inicio + 12], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    // Aberración cromática solo en el golpe de entrada (6 cuadros); sin destello blanco: se leía como glitch.
    const croma = interpolate(frame, [inicio, inicio + 6], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    // Salida: con cruce, termina (opacidad 0) justo en la mitad de la transición; sin cruce, 7 cuadros.
    const finSalida = conCruceSale ? total - N : total;
    const sale = interpolate(frame, [finSalida - (conCruceSale ? N : 7), finSalida], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const oculta = frame < inicio || (conCruceSale && frame >= finSalida);
    const conSubtitulos = (props as { subtitulos?: boolean }).subtitulos ?? true;
    return React.createElement(
      AbsoluteFill,
      { style: { visibility: oculta ? 'hidden' : 'visible' } },
      React.createElement(
        AbsoluteFill,
        {
          style: {
            transform: `translateX(${(entrada ** 2 * 70).toFixed(1)}px) translateY(${(-sale * 24).toFixed(1)}px) scale(${punch * (1 + 0.07 * entrada ** 2)})`,
            opacity: conCruceSale ? 1 - sale : 1 - 0.6 * sale,
            filter:
              sale > 0.02
                ? `blur(${(sale * 8).toFixed(1)}px)`
                : entrada > 0.02
                  ? `blur(${(entrada ** 2 * 10).toFixed(2)}px) drop-shadow(${(croma * 7).toFixed(1)}px 0 0 rgba(255,0,70,0.75)) drop-shadow(${(croma * -7).toFixed(1)}px 0 0 rgba(0,210,255,0.75))`
                  : undefined,
          },
        },
        React.createElement(Escena_, { escena, props }),
      ),
      conSubtitulos ? React.createElement(SubtitulosPalabra, { escena, reemplazos }) : null,
    );
  };
  return Envuelta;
};

/** Catálogo del tipo «anuncio»: anuncios verticales de Meta (9:16 y 4:5) con motion graphics. */
export const anuncio = {
  id: 'anuncio',
  esquemas,
  fondo: FondoAnuncio,
  admite60: true,
  componentes: {
    gancho: conExtras(Gancho as unknown as ComponenteEscena),
    'precio-tachado': conExtras(PrecioTachado as unknown as ComponenteEscena),
    ahorro: conExtras(Ahorro as unknown as ComponenteEscena),
    'telefono-3d': conExtras(Telefono3d as unknown as ComponenteEscena),
    sellos: conExtras(Sellos as unknown as ComponenteEscena),
    'portada-monitor': conExtras(PortadaMonitor as unknown as ComponenteEscena),
    'cuenta-regresiva': conExtras(CuentaRegresiva as unknown as ComponenteEscena),
    fecha: conExtras(Fecha as unknown as ComponenteEscena),
    cierre: conExtras(Cierre as unknown as ComponenteEscena),
  } satisfies Record<NombreEscena, unknown> as unknown as Record<NombreEscena, ComponenteEscena>,
};
