import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Loop,
  OffthreadVideo,
  random,
  Sequence,
  useVideoConfig,
} from 'remotion';
import { useCuadro, aReales } from '../../kit/tiempo';
import { logoDe, useMarca } from '../../marca';
import {
  framesDe,
  inicioVoz,
  iniciosEscenas,
  useAsset,
  useProyecto,
  type Escena,
} from '../../proyecto';
import { FPS, tiempos } from '../../tema';
import { fijar } from './Base';
import { Boton, estiloDisplay, estiloTarjeta, Monto, PALETA, tipos } from './Sistema';
import {
  alfaFranja,
  clipDe,
  cortesPorPalabras,
  expoOut,
  impactoCorte,
  layoutFranja,
  posicionFondo,
} from './calculos';
import { esquemas, type NombreEscena } from './esquemas';

const CHISPAS = 26;
type Foco = { x: number; y: number };
type Paneo = { desde: number; hasta: number };
type DatosFranja = { texto: string; detalle?: string; precio?: string; boton?: string };

// Grilla de la franja (unidades de diseño de 1080): relleno 34, tile 124, hueco 20, texto 320.
const RELLENO = 34;
const TILE = 124;
const HUECO = 20;
const TEXTO_ANCHO = 320;
type Montaje = { clips: string[]; desfase: number };

/** Un tramo del fondo de una escena: un medio (imagen o video) entre dos cortes (cuadros base 30). */
type Tramo = { id: string; inicio: number; fin: number; desde: number };

/**
 * Un medio (imagen o video silenciado) a pantalla completa con Ken Burns y paneo según `foco`/`paneo`.
 * Va dentro de una `Sequence`: su cuadro local empieza en 0 con cada tramo.
 */
const MedioFondo: React.FC<{
  id: string;
  foco: Foco;
  paneo?: Paneo;
  desde: number;
  desenfoque: number;
  duracion: number;
}> = ({ id, foco, paneo, desde, desenfoque, duracion }) => {
  const frame = useCuadro();
  const { fps } = useVideoConfig();
  const medio = useAsset(id);
  const pos = posicionFondo(foco, paneo, frame / Math.max(1, duracion - 6));
  const zoom = (desenfoque > 0 ? 1.14 : 1.05) + frame * 0.0016;
  const estilo: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${pos.x * 100}% ${pos.y * 100}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${pos.x * 100}% ${pos.y * 100}%`,
    filter: desenfoque > 0 ? `blur(${desenfoque}px)` : undefined,
  };
  if (medio.tipo !== 'video') return <Img src={medio.src} style={estilo} />;
  const inicio = desde % Math.max(0.5, (medio.segundos ?? 1) - 1);
  const largo = Math.max(1, Math.floor(((medio.segundos ?? 1) - inicio) * fps));
  return (
    <Loop durationInFrames={largo}>
      <OffthreadVideo src={medio.src} muted trimBefore={Math.round(inicio * fps)} style={estilo} />
    </Loop>
  );
};

/**
 * Fondo de UNA escena a pantalla completa: un medio o un montaje de clips con corte en cada palabra
 * clave (zoom-punch, desenfoque direccional de 5 cuadros y destello blanco de 2), con un velo liviano
 * y escrims en degradado solo donde van los textos y la franja.
 */
const FondoEscena: React.FC<{
  tramos: Tramo[];
  foco: Foco;
  paneo?: Paneo;
  velo: number;
  desenfoque: number;
  entra: boolean;
  sale: boolean;
}> = ({ tramos, foco, paneo, velo, desenfoque, entra, sale }) => {
  const frame = useCuadro();
  const { durationInFrames, fps } = useVideoConfig();
  const total = (durationInFrames * FPS) / fps;
  const T = tiempos.transicion;
  const opacidad =
    (entra ? interpolate(frame, [0, T], [0, 1], fijar) : 1) *
    (sale ? interpolate(frame, [total - T, total], [1, 0], fijar) : 1);
  const impacto = impactoCorte(
    tramos.map((t) => t.inicio),
    frame,
  );
  const a = (v: number) => Math.min(1, v * velo).toFixed(3);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: opacidad }}>
      <AbsoluteFill
        style={{
          transform: impacto.fuerza > 0 ? `scale(${1 + 0.16 * impacto.fuerza ** 1.5})` : undefined,
          filter: impacto.fuerza > 0 ? 'url(#whip-anuncio)' : undefined,
        }}
      >
        {impacto.fuerza > 0 ? (
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <filter id="whip-anuncio" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation={`${(impacto.fuerza * 26).toFixed(1)} 0`} />
            </filter>
          </svg>
        ) : null}
        {tramos.map((t, i) => (
          <Sequence
            key={i}
            from={aReales(t.inicio, fps)}
            durationInFrames={aReales(t.fin - t.inicio, fps)}
            name={`Tramo ${i + 1}`}
          >
            <MedioFondo
              id={t.id}
              foco={foco}
              paneo={paneo}
              desde={t.desde}
              desenfoque={desenfoque}
              duracion={t.fin - t.inicio}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(9,11,15,${a(0.4)}) 0%, rgba(9,11,15,${a(0.52)}) 18%, rgba(9,11,15,${a(0.66)}) 36%, rgba(9,11,15,${a(0.66)}) 60%, rgba(9,11,15,${a(0.8)}) 74%, rgba(9,11,15,${a(0.94)}) 100%)`,
        }}
      />
      {velo < 0.8 ? (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(80% 26% at 50% 40%, rgba(9,11,15,0.52), transparent 82%), linear-gradient(0deg, rgba(9,11,15,0.78) 0%, rgba(9,11,15,0.5) 22%, transparent 38%), linear-gradient(180deg, rgba(9,11,15,0.55) 0%, transparent 20%)',
          }}
        />
      ) : null}
      {impacto.destello ? (
        <AbsoluteFill style={{ background: '#FFFFFF', opacity: 0.5, mixBlendMode: 'screen' }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Tramos de fondo de una escena: un montaje cortado en las palabras de la voz, un medio o nada. */
const tramosDe = (
  e: Escena,
  props: Record<string, unknown>,
  voz: ReturnType<typeof useProyecto>['voz'],
): Tramo[] | null => {
  const total = framesDe(e, voz);
  const montaje = props.montaje as Montaje | undefined;
  if (montaje) {
    const cortes = cortesPorPalabras(voz[e.id]?.palabras ?? [], inicioVoz(e), total);
    return cortes.map((inicio, k) => ({
      id: montaje.clips[clipDe(cortes, montaje.clips.length, inicio, montaje.desfase)]!,
      inicio,
      fin: cortes[k + 1] ?? total,
      // Si un clip vuelve a salir dentro de la escena, arranca más adelante para no repetir cuadros.
      desde: Math.floor((k + montaje.desfase) / montaje.clips.length) * 2,
    }));
  }
  const id = props.fondo as string | undefined;
  return id ? [{ id, inicio: 0, fin: total, desde: props.fondoDesde as number }] : null;
};

/** Textura de grano: ruido fractal que se repite y se corre de sitio en cada cuadro. */
const GRANO = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.2"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

/**
 * Acabado global sobre los fondos: gradación cálida de atardecer de Vice City (rosas y naranjas en
 * suave, sin lavar el gameplay), un light leak que cruza despacio y grano animado.
 */
const Acabado: React.FC = () => {
  const frame = useCuadro();
  const x = 140 - ((frame * 1.1) % 230);
  const sacudida = (n: number) => Math.floor(random(`gr${frame}${n}`) * 320);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(255,90,170,0.34) 0%, rgba(255,140,70,0.26) 55%, rgba(110,60,200,0.22) 100%)',
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(38% 22% at ${x}% 30%, rgba(255,160,90,0.34), transparent 70%)`,
          mixBlendMode: 'screen',
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: GRANO,
          backgroundPosition: `${sacudida(1)}px ${sacudida(2)}px`,
          mixBlendMode: 'overlay',
          opacity: 0.2,
        }}
      />
    </>
  );
};

/**
 * Franja de marca (zona segura baja, y≈1420–1734 de 1920), en una grilla de 34 px: fila 1 = tiburón
 * en un tile, bloque de texto y precio a la derecha (su tamaño sale de `layoutFranja`, así que nunca
 * pisa al texto); fila 2 = botón a todo el ancho.
 */
const FranjaMarca: React.FC<{ datos: DatosFranja; alfa: number }> = ({ datos, alfa }) => {
  const frame = useCuadro();
  const { height, width } = useVideoConfig();
  const marca = useMarca();
  const { colores } = marca;
  const logo = useAsset(marca.logos.original ?? logoDe(marca, 'blanco'));
  const u = width / 1080;
  const t = expoOut((frame - 24) / 22);
  const T = tipos();
  const { tam } = layoutFranja(960, RELLENO, TILE, HUECO, TEXTO_ANCHO, datos.precio ?? '');
  const latido = 1 + 0.025 * Math.max(0, Math.sin(frame / 10));
  if (alfa <= 0.001) return null;
  return (
    <div
      style={{
        ...estiloTarjeta(u, 36),
        position: 'absolute',
        left: 60 * u,
        right: 60 * u,
        top: (1420 / 1920) * height,
        boxSizing: 'border-box',
        padding: RELLENO * u,
        display: 'flex',
        flexDirection: 'column',
        gap: 22 * u,
        opacity: alfa * Math.min(1, t * 1.5),
        transform: `translateY(${(1 - t) * 420 * u}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: HUECO * u, height: TILE * u }}>
        <div
          style={{
            flex: 'none',
            width: TILE * u,
            height: TILE * u,
            borderRadius: 30 * u,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, rgba(79,107,255,0.28), rgba(8,10,16,0.9))',
            border: `${Math.max(1, u)}px solid rgba(255,255,255,0.14)`,
          }}
        >
          <Img src={logo.src} style={{ width: 100 * u }} />
        </div>
        <div style={{ flex: 'none', width: TEXTO_ANCHO * u }}>
          <div
            style={{ ...estiloDisplay(u, 58), color: colores.blanco, textTransform: 'uppercase' }}
          >
            {datos.texto}
          </div>
          {datos.detalle ? (
            <div
              style={{
                fontFamily: T.ui,
                fontWeight: 600,
                fontSize: 26 * u,
                marginTop: 8 * u,
                color: PALETA.suave,
                whiteSpace: 'nowrap',
              }}
            >
              {datos.detalle}
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
        {datos.precio ? (
          <div style={{ flex: 'none', transform: `scale(${latido})`, transformOrigin: '100% 50%' }}>
            <Monto texto={datos.precio} tam={tam} u={u} />
          </div>
        ) : null}
      </div>
      {datos.boton ? <Boton texto={datos.boton} u={u} ancho="100%" alto={96} tam={42} /> : null}
    </div>
  );
};

/**
 * Fondo del tipo «anuncio». Por detrás de las escenas pinta: la noche con luces y chispas, el fondo
 * a pantalla completa de cada escena (prop `fondo`, con cruce entre escenas) y la franja de marca.
 * Todo vive aquí (y no en cada escena) para que el fondo y la franja no salten con las transiciones.
 */
export const FondoAnuncio: React.FC = () => {
  const frame = useCuadro();
  const { fps } = useVideoConfig();
  const { colores } = useMarca();
  const { guion, voz } = useProyecto();
  const escenas = React.useMemo(
    () =>
      guion.escenas.map((e) => {
        const esquema = esquemas[e.escena as NombreEscena];
        const r = esquema?.safeParse(e.props);
        return { e, props: (r?.success ? r.data : {}) as Record<string, unknown> };
      }),
    [guion],
  );
  const inicios = React.useMemo(() => iniciosEscenas(guion, voz), [guion, voz]);
  const datosFranja = escenas
    .map((x) => x.props.franja)
    .find((f): f is DatosFranja => typeof f === 'object' && f !== null);
  const encendidas = escenas.map(
    (x) =>
      datosFranja !== undefined &&
      x.props.franja !== false &&
      !(x.props.franja === undefined && x.e.escena === 'cierre'),
  );
  const alfa = alfaFranja(encendidas, inicios, frame, tiempos.transicion);
  const luz = (color: string, alfaLuz: string, fase: number, w: number) =>
    `radial-gradient(${w}% ${w * 0.7}% at ${50 + Math.sin(frame / 120 + fase) * 30}% ${46 + Math.cos(frame / 150 + fase * 1.6) * 24}%, ${color}${alfaLuz}, transparent 70%)`;
  const avance = (frame * 0.9) % 120;
  return (
    <AbsoluteFill style={{ background: colores.noche }}>
      <AbsoluteFill
        style={{ background: `linear-gradient(180deg, ${colores.navy} 0%, ${colores.noche} 70%)` }}
      />
      <AbsoluteFill
        style={{
          background: `${luz(colores.indigo, '38', 0, 70)}, ${luz(colores.antetitulo, '16', 3, 46)}`,
        }}
      />
      <AbsoluteFill style={{ perspective: 700, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: '-50%',
            right: '-50%',
            bottom: '-8%',
            height: '55%',
            transform: 'rotateX(68deg)',
            transformOrigin: '50% 100%',
            backgroundImage: `linear-gradient(${colores.cian}22 2px, transparent 2px), linear-gradient(90deg, ${colores.cian}22 2px, transparent 2px)`,
            backgroundSize: '120px 120px',
            backgroundPosition: `0 ${avance}px`,
            maskImage: 'linear-gradient(0deg, black, transparent 90%)',
          }}
        />
      </AbsoluteFill>
      {Array.from({ length: CHISPAS }, (_, i) => {
        const x = random(`cx${i}`) * 100;
        const vel = 0.25 + random(`cv${i}`) * 0.5;
        const y = 110 - ((frame * vel + random(`cy${i}`) * 140) % 125);
        const tam = 3 + random(`ct${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: tam,
              height: tam,
              borderRadius: '50%',
              background: i % 4 === 0 ? colores.antetitulo : colores.cian,
              opacity: 0.35 + random(`co${i}`) * 0.4,
              filter: 'blur(0.6px)',
            }}
          />
        );
      })}
      {escenas.map(({ e, props }, i) => {
        const tramos = tramosDe(e, props, voz);
        if (!tramos) return null;
        const siguiente = escenas[i + 1];
        return (
          <Sequence
            key={e.id}
            from={aReales(inicios[i] ?? 0, fps)}
            durationInFrames={aReales(framesDe(e, voz), fps)}
            name={`Fondo: ${e.id}`}
          >
            <FondoEscena
              tramos={tramos}
              foco={props.foco as Foco}
              paneo={props.paneo as Paneo | undefined}
              velo={props.velo as number}
              desenfoque={props.desenfoque as number}
              entra={i > 0}
              sale={!(siguiente && (siguiente.props.fondo || siguiente.props.montaje))}
            />
          </Sequence>
        );
      })}
      <Acabado />
      <AbsoluteFill
        style={{ background: 'radial-gradient(90% 70% at 50% 50%, transparent 55%, #000000AA)' }}
      />
      {datosFranja ? <FranjaMarca datos={datosFranja} alfa={alfa} /> : null}
    </AbsoluteFill>
  );
};
