import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, useVideoConfig } from 'remotion';
import { Aparicion } from '../../kit/Aparicion';
import { Captura } from '../../kit/Captura';
import { CierreMarca } from '../../kit/identidad/CierreMarca';
import { FirmaLogo } from '../../kit/identidad/FirmaLogo';
import { FotoViva, VeloMarca } from '../../kit/identidad/FotoViva';
import { TarjetaCita } from '../../kit/identidad/TarjetaCita';
import { TarjetaDato } from '../../kit/identidad/TarjetaDato';
import { useUnidad } from '../../kit/identidad/unidad';
import { MarcoTelefono } from '../../kit/MarcoTelefono';
import { aReales, useCuadro } from '../../kit/tiempo';
import { cuadrosDesde } from '../../kit/identidad/video';
import { TituloSerif } from '../../kit/TituloSerif';
import { useMarca } from '../../marca';
import { inicioVoz, servir, useAsset, useProyecto, type Escena } from '../../proyecto';
import type { NombreEscena, PropsDe } from './esquemas';
import { encuadreRecorte } from './clipAudio';
import { alturaTitulo, areaContenido, escalaTelefono, medidasMosaico } from './layout';
import { PrimerPlano } from './PrimerPlano';

type Escenas<N extends NombreEscena> = React.FC<{ escena: Escena; props: PropsDe<N> }>;

/** Ancho de la columna de contenido (en unidades de diseño de 1080). */
const COLUMNA = 936;
/** Tamaños de título (unidad de 1080): se leen a tamaño de teléfono; el principal y el de apoyo. */
const TITULO = 124;
const TITULO_APOYO = 108;
/** Separación entre el título y el contenido. */
const SEPARACION = 44;

/** Franja de contenido de la escena: el espacio sobre la banda de subtítulos, en px del lienzo. */
const useArea = (subtitulos: boolean) => {
  const { u, alto, ancho } = useUnidad();
  const area = areaContenido(alto, subtitulos);
  return { u, ancho, ...area };
};

/**
 * Composición centrada: título (opcional) y contenido apilados y centrados en vertical en el espacio
 * libre sobre los subtítulos. `alinear="arriba"` pega el bloque al inicio (títulos sobre una foto).
 */
const Disposicion: React.FC<{
  subtitulos: boolean;
  titulo?: string;
  antetitulo?: string;
  tamano?: number;
  alinear?: 'centro' | 'arriba';
  children?: React.ReactNode;
}> = ({ subtitulos, titulo, antetitulo, tamano = TITULO, alinear = 'centro', children }) => {
  const { u, top, alto } = useArea(subtitulos);
  return (
    <PrimerPlano>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          width: COLUMNA * u,
          marginLeft: (-COLUMNA * u) / 2,
          top,
          height: alto,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: alinear === 'centro' ? 'center' : 'flex-start',
          gap: SEPARACION * u,
        }}
      >
        {titulo ? (
          <TituloSerif
            titulo={titulo}
            antetitulo={antetitulo}
            tamano={tamano * u}
            anchoMaximo={COLUMNA * u}
          />
        ) : null}
        {children}
      </div>
    </PrimerPlano>
  );
};

/**
 * Panel de marca semitransparente (noche al 55 %, desenfoque de fondo) tras el texto cuando hay una
 * toma de video debajo: la legibilidad no depende de lo que muestre la toma.
 */
const Panel: React.FC<{ activo: boolean; children: React.ReactNode }> = ({ activo, children }) => {
  const { colores } = useMarca();
  const { u } = useUnidad();
  if (!activo) return <>{children}</>;
  return (
    <div
      style={{
        padding: 44 * u,
        borderRadius: 36 * u,
        background: `${colores.noche}8C`,
        backdropFilter: `blur(${12 * u}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Firma: Escenas<'firma'> = () => (
  <PrimerPlano>
    <FirmaLogo />
  </PrimerPlano>
);

export const Foto: Escenas<'foto'> = ({ props }) => (
  <FotoViva asset={props.asset} movimiento={props.movimiento}>
    <Disposicion
      subtitulos={props.subtitulos}
      titulo={props.titulo}
      antetitulo={props.antetitulo}
      alinear="arriba"
    />
  </FotoViva>
);

/** Teléfono con una captura móvil: llena el espacio libre bajo el título (≥ 55 % del alto del lienzo). */
export const Pantalla: Escenas<'pantalla'> = ({ props }) => {
  const captura = useAsset(props.captura);
  const { colores } = useMarca();
  const frame = useCuadro();
  const { u, alto, ancho } = useUnidad();
  const natural = 420;
  const ratio = captura.alto / captura.ancho;
  const area = areaContenido(alto, props.subtitulos);
  const titulo = props.titulo
    ? alturaTitulo(props.titulo, TITULO_APOYO * u, COLUMNA * u) + SEPARACION * u
    : 0;
  const t = escalaTelefono(ratio, area.alto - titulo, Math.min(ancho * 0.86, COLUMNA * u));
  // El teléfono flota apenas, como si lo sostuviera una mano.
  const flota = Math.sin(frame / 22) * 8 * u;
  return (
    <Disposicion subtitulos={props.subtitulos} titulo={props.titulo} tamano={TITULO_APOYO}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Aparicion desdeY={120 * u}>
          <div
            style={{
              width: t.ancho,
              height: t.alto,
              filter: props.fondo
                ? `drop-shadow(0 ${40 * u}px ${60 * u}px ${colores.noche}CC)`
                : undefined,
            }}
          >
            <div
              style={{
                width: natural + 24,
                transformOrigin: 'top left',
                transform: `translateY(${flota}px) scale(${t.escala})`,
              }}
            >
              <MarcoTelefono ancho={natural} alto={natural * ratio} colorBarra={colores.navy}>
                <Captura captura={captura} ancho={natural} />
              </MarcoTelefono>
            </div>
          </div>
        </Aparicion>
      </div>
    </Disposicion>
  );
};

export const Cita: Escenas<'cita'> = ({ props }) => {
  const contenido = (
    <Disposicion subtitulos={props.subtitulos}>
      <Panel activo={!!props.fondo}>
        <TarjetaCita texto={props.texto} autor={props.autor} fuente={props.fuente} />
      </Panel>
    </Disposicion>
  );
  return props.asset ? (
    <FotoViva asset={props.asset} movimiento="acercar">
      {contenido}
    </FotoViva>
  ) : (
    contenido
  );
};

export const Dato: Escenas<'dato'> = ({ props }) => {
  const { u } = useUnidad();
  const conFondo = !!props.fondo;
  // Sobre una toma de video el título entra al panel, para que se lea sin importar lo que muestre.
  const titulo =
    conFondo && props.titulo ? (
      <div style={{ marginBottom: SEPARACION * u }}>
        <TituloSerif titulo={props.titulo} tamano={TITULO_APOYO * u} anchoMaximo={COLUMNA * u} />
      </div>
    ) : null;
  const contenido = (
    <Disposicion
      subtitulos={props.subtitulos}
      titulo={conFondo ? undefined : props.titulo}
      tamano={TITULO_APOYO}
    >
      <Panel activo={conFondo}>
        {titulo}
        <TarjetaDato cifra={props.cifra} etiqueta={props.etiqueta} lista={props.lista} />
      </Panel>
    </Disposicion>
  );
  return props.asset && !props.fondo ? (
    <FotoViva asset={props.asset} movimiento="acercar">
      {contenido}
    </FotoViva>
  ) : (
    contenido
  );
};

/** Una pieza terminada del mosaico: tarjeta con esquinas redondeadas y sombra. */
const Pieza: React.FC<{ id: string; ancho: number; indice: number }> = ({ id, ancho, indice }) => {
  const imagen = useAsset(id);
  const { u } = useUnidad();
  const alto = (ancho * (imagen.alto || 1)) / (imagen.ancho || 1);
  return (
    <Aparicion inicio={4 + indice * 5} desdeY={80 * u}>
      <Img
        src={imagen.src}
        style={{
          display: 'block',
          width: ancho,
          height: alto,
          borderRadius: 26,
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6)',
        }}
      />
    </Aparicion>
  );
};

/**
 * Piezas en columnas inclinadas que derivan lento, escaladas para caber enteras en el espacio libre
 * sobre los subtítulos; las columnas impares van desfasadas hacia abajo.
 */
export const Mosaico: Escenas<'mosaico'> = ({ props }) => {
  const frame = useCuadro();
  const { durationInFrames, fps } = useVideoConfig();
  const { indice } = useProyecto();
  const { u, alto, ancho } = useUnidad();
  const area = areaContenido(alto, props.subtitulos);
  const titulo = props.titulo
    ? alturaTitulo(props.titulo, TITULO_APOYO * u, COLUMNA * u) + SEPARACION * u
    : 0;
  const ratios = props.piezas.map((id) => {
    const a = servir(indice, id);
    return (a.alto || 1) / (a.ancho || 1);
  });
  const m = medidasMosaico(ratios, ancho, area.alto - titulo);
  const p = Math.min(1, frame / ((durationInFrames * 30) / fps));
  const porColumna = Array.from({ length: m.cols }, (_, c) =>
    props.piezas.map((id, i) => ({ id, i })).filter(({ i }) => i % m.cols === c),
  );
  return (
    <Disposicion subtitulos={props.subtitulos} titulo={props.titulo} tamano={TITULO_APOYO}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            flex: 'none',
            width: m.cajaAncho * m.escala,
            height: m.cajaAlto * m.escala,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: (m.cajaAncho * m.escala - m.ancho) / 2,
              top: (m.cajaAlto * m.escala - m.alto) / 2,
              width: m.ancho,
              height: m.alto,
              transformOrigin: 'center center',
              transform: `translate(${-p * 14}px, ${-p * 22}px) rotate(-7deg) scale(${m.escala})`,
              display: 'flex',
              gap: 28,
              alignItems: 'flex-start',
            }}
          >
            {porColumna.map((col, c) => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 28,
                  marginTop: c % 2 === 1 ? 130 : 0,
                }}
              >
                {col.map(({ id, i }) => (
                  <Pieza key={id + i} id={id} ancho={m.anchoPieza} indice={i} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Disposicion>
  );
};

/** La toma dibujada en una caja (px) con el recorte aplicado: cubre la caja y oculta lo que desborda. */
const Toma: React.FC<{
  video: string;
  desde: number;
  recorte: { arriba: number; abajo: number };
  ancho: number;
  alto: number;
  sonido: boolean;
}> = ({ video, desde, recorte, ancho, alto, sonido }) => {
  const toma = useAsset(video);
  const { fps } = useVideoConfig();
  const e = encuadreRecorte(toma.ancho || 1080, toma.alto || 1920, recorte, ancho, alto);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <OffthreadVideo
        src={toma.src}
        muted={!sonido}
        trimBefore={cuadrosDesde(desde, fps)}
        style={{ position: 'absolute', left: e.left, top: e.top, width: e.ancho, height: e.alto }}
      />
    </div>
  );
};

/**
 * Clip con audio propio (alguien hablando): la toma arranca junto con su sonido en `vozDesde`, igual
 * que una locución, para que imagen y voz queden sincronizadas. `tarjeta` la muestra en una tarjeta
 * 4:5 sobre una copia suya desenfocada y oscurecida que llena el lienzo.
 */
const ClipConAudio: Escenas<'clip'> = ({ escena, props }) => {
  const { u, ancho, alto } = useUnidad();
  const { fps } = useVideoConfig();
  const { colores } = useMarca();
  const recorte = props.recorte ?? { arriba: 0, abajo: 1 };
  const area = areaContenido(alto, props.subtitulos);
  const altoTarjeta = Math.min(ancho * 0.78 * 1.25, area.alto);
  const anchoTarjeta = altoTarjeta / 1.25;
  const tarjeta = props.presentacion === 'tarjeta';
  const toma = { video: props.video, desde: props.desde, recorte, sonido: props.audio };
  return (
    <Sequence from={aReales(inicioVoz(escena), fps)} layout="none" name="Clip con audio">
      <AbsoluteFill>
        {tarjeta ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                transform: 'scale(1.2)',
                filter: `blur(${36 * u}px) brightness(0.5)`,
              }}
            >
              <Toma {...toma} sonido={false} ancho={ancho} alto={alto} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: (ancho - anchoTarjeta) / 2,
                top: area.top + (area.alto - altoTarjeta) / 2,
                width: anchoTarjeta,
                height: altoTarjeta,
                borderRadius: 36 * u,
                overflow: 'hidden',
                boxShadow: `0 ${40 * u}px ${80 * u}px -${20 * u}px ${colores.noche}`,
              }}
            >
              <Toma {...toma} ancho={anchoTarjeta} alto={altoTarjeta} />
            </div>
          </>
        ) : (
          <>
            <Toma {...toma} ancho={ancho} alto={alto} />
            <VeloMarca intensidad="suave" />
          </>
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

/** Video a pantalla completa, sin sonido, con el velo de marca; su largo lo manda la escena. */
export const Clip: Escenas<'clip'> = (p) => {
  const { props } = p;
  const video = useAsset(props.video);
  const { fps } = useVideoConfig();
  if (props.audio || props.recorte || props.presentacion === 'tarjeta')
    return (
      <>
        <ClipConAudio {...p} />
        <Disposicion subtitulos={props.subtitulos} titulo={props.titulo} alinear="arriba" />
      </>
    );
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={video.src}
        muted
        trimBefore={Math.round(props.desde * fps)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <VeloMarca />
      <Disposicion subtitulos={props.subtitulos} titulo={props.titulo} alinear="arriba" />
    </AbsoluteFill>
  );
};

export const Cierre: Escenas<'cierre'> = ({ props }) => (
  <PrimerPlano>
    <CierreMarca llamado={props.llamado} url={props.url} sobreVideo={!!props.fondo} />
  </PrimerPlano>
);
