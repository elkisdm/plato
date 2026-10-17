import React from 'react';
import { loadFont as cargarArchivo } from '@remotion/google-fonts/Archivo';
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { useCuadro } from '../../kit/tiempo';
import { expoOut } from './calculos';

/**
 * Sistema visual del tipo «anuncio»: una display pesada y apretada (Archivo 800–900), Inter para la
 * interfaz con cifras tabulares, tarjetas de vidrio oscuro, el degradado cálido de los precios y la
 * entrada moderna (expo-out con desenfoque) que usan todos los elementos.
 */
export const PALETA = {
  rojo: '#FF3B5C',
  indigo: '#4F6BFF',
  violeta: '#8A5CFF',
  ambar: '#FFB347',
  coral: '#FF7A59',
  blanco: '#FFFFFF',
  /** Texto secundario sobre vidrio oscuro. */
  suave: 'rgba(255,255,255,0.65)',
} as const;

let cache: { display: string; ui: string } | null = null;
/** Carga (una vez) las fuentes del sistema y devuelve sus familias. */
export const tipos = (): { display: string; ui: string } => {
  cache ??= {
    display: cargarArchivo('normal', {
      weights: ['700', '800', '900'],
      subsets: ['latin', 'latin-ext'],
    }).fontFamily,
    ui: cargarInter('normal', {
      weights: ['500', '600', '700', '800'],
      subsets: ['latin', 'latin-ext'],
    }).fontFamily,
  };
  return cache;
};

/** Etiqueta en versalitas: Inter 700, tracking 0.16em, blanco al 65 %. */
export const estiloEtiqueta = (u: number, tam = 30): React.CSSProperties => ({
  fontFamily: tipos().ui,
  fontWeight: 700,
  fontSize: tam * u,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: PALETA.suave,
  fontVariantNumeric: 'tabular-nums',
});

/** Tarjeta de vidrio oscuro: fondo 62 %, desenfoque de fondo, borde fino, brillo arriba y sombra amplia. */
export const estiloTarjeta = (u: number, radio = 36): React.CSSProperties => ({
  borderRadius: radio * u,
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 42%), rgba(8,10,16,0.62)',
  backdropFilter: `blur(${24 * u}px)`,
  border: `${Math.max(1, u)}px solid rgba(255,255,255,0.10)`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 ${40 * u}px ${90 * u}px -${24 * u}px rgba(0,0,0,0.65)`,
});

/** Relleno cálido de los precios (blanco → ámbar → coral): hay que ponerlo en cada elemento con texto que recorte (overflow/transform lo rompen en el padre). */
export const rellenoPrecio: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FFE9C2 28%, #FFB347 66%, #FF7A59 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

/** Relleno cálido más la sombra que separa el precio del fondo. */
export const estiloPrecio = (u: number): React.CSSProperties => ({
  ...rellenoPrecio,
  filter: `drop-shadow(0 ${2 * u}px 0 rgba(140,50,0,0.5)) drop-shadow(0 0 ${26 * u}px rgba(255,140,70,0.35)) drop-shadow(0 ${12 * u}px ${30 * u}px rgba(0,0,0,0.55))`,
});

/** Display pesada para titulares y precios. */
export const estiloDisplay = (u: number, tam: number): React.CSSProperties => ({
  fontFamily: tipos().display,
  fontWeight: 900,
  fontSize: tam * u,
  lineHeight: 0.95,
  letterSpacing: '-0.025em',
  fontVariantNumeric: 'tabular-nums',
});

/**
 * Entrada moderna: sube `y` px, se desenfoca `blur` px → 0 y aparece con expo-out; `escala` (p. ej.
 * 0.96) crece a 1. `dur` y `inicio` en cuadros base 30.
 */
export const entrada = (
  frame: number,
  inicio: number,
  u: number,
  opciones: { dur?: number; y?: number; x?: number; blur?: number; escala?: number } = {},
): React.CSSProperties => {
  const { dur = 16, y = 30, x = 0, blur = 10, escala = 1 } = opciones;
  const t = expoOut((frame - inicio) / dur);
  return {
    opacity: Math.min(1, t * 1.6),
    transform: `translate(${(1 - t) * x * u}px, ${(1 - t) * y * u}px) scale(${escala + (1 - escala) * t})`,
    filter: t < 1 ? `blur(${((1 - t) * blur).toFixed(2)}px)` : undefined,
  };
};

/** Flecha de llamado a la acción (trazo uniforme). */
export const Flecha: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M5 12h13M13 6l6 6-6 6"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Botón de llamado: degradado indigo → violeta, brillo interno, flecha y un barrido sutil cada 3 s. */
export const Boton: React.FC<{
  texto: string;
  u: number;
  tam?: number;
  ancho?: number | string;
  alto?: number;
  inicio?: number;
}> = ({ texto, u, tam = 44, ancho, alto = 100, inicio = 30 }) => {
  const frame = useCuadro();
  const ciclo = (frame - inicio) % 90;
  const barrido = ciclo >= 20 && ciclo <= 46 ? (ciclo - 20) / 26 : -1;
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: ancho,
        height: alto * u,
        padding: `0 ${44 * u}px`,
        borderRadius: 30 * u,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16 * u,
        background: `linear-gradient(135deg, ${PALETA.indigo} 0%, ${PALETA.violeta} 100%)`,
        boxShadow: `inset 0 ${Math.max(1, 2 * u)}px 0 rgba(255,255,255,0.35), inset 0 -${4 * u}px 0 rgba(0,0,0,0.12), 0 ${14 * u}px ${34 * u}px -${12 * u}px rgba(79,107,255,0.55)`,
        fontFamily: tipos().ui,
        fontWeight: 800,
        fontSize: tam * u,
        letterSpacing: '-0.01em',
        color: PALETA.blanco,
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
      <Flecha tam={tam * 0.85 * u} />
      {barrido >= 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${barrido * 140 - 30}%, rgba(255,255,255,0.28) ${barrido * 140 - 15}%, transparent ${barrido * 140}%)`,
          }}
        />
      ) : null}
    </div>
  );
};

/** Monto con `$` chico en superíndice y relleno cálido; cada carácter en una caja de ancho fijo. */
export const Monto: React.FC<{ texto: string; tam: number; u: number }> = ({ texto, tam, u }) => (
  <div
    style={{
      ...estiloDisplay(u, tam),
      ...estiloPrecio(u),
      display: 'inline-flex',
      alignItems: 'flex-start',
      whiteSpace: 'nowrap',
    }}
  >
    {texto.split('').map((c, i) =>
      c === '$' ? (
        <span key={i} style={{ fontSize: '0.5em', marginTop: '0.1em', marginRight: '0.04em' }}>
          {c}
        </span>
      ) : /\d/.test(c) ? (
        <span key={i} style={{ display: 'inline-block', width: '0.62em', textAlign: 'center' }}>
          {c}
        </span>
      ) : (
        <span key={i} style={{ display: 'inline-block', width: '0.28em', textAlign: 'center' }}>
          {c}
        </span>
      ),
    )}
  </div>
);
