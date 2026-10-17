import React from 'react';
import { AbsoluteFill, Img, interpolate } from 'remotion';
import { useCuadro } from '../../kit/tiempo';
import { useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { Destello, desenfoqueDe, fijar, resorte, useTitular, useU, ZonaSegura } from './Base';
import {
  ajustarTam,
  cuentaRegresiva,
  cuentaViva,
  expoOut,
  partesDeSegundos,
  posicionRodillo,
} from './calculos';
import type { NombreEscena, PropsDe } from './esquemas';
import {
  entrada,
  estiloDisplay,
  estiloEtiqueta,
  estiloPrecio,
  estiloTarjeta,
  PALETA,
  tipos,
} from './Sistema';

type PropsEscena<N extends NombreEscena> = { escena: Escena; props: PropsDe<N> };

/** Texto superior opcional de las escenas con dispositivo. */
const Rotulo: React.FC<{ texto: string; tam: number }> = ({ texto, tam }) => {
  const frame = useCuadro();
  const u = useU();
  const estilo = useTitular(u, tam);
  return (
    <div
      style={{
        ...estilo,
        textAlign: 'center',
        padding: `0 ${60 * u}px`,
        textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.65)`,
        ...entrada(frame, 2, u, { dur: 16, y: -30 }),
      }}
    >
      {texto}
    </div>
  );
};

/** Punto táctil propio (base de 30 cuadros): viaja al objetivo, toca con onda y presiona el botón. */
const Toque: React.FC<{
  x: number;
  y: number;
  en: number;
  ancho: number;
  alto: number;
  zona?: { x: number; y: number; w: number; h: number };
}> = ({ x, y, en, ancho, alto, zona }) => {
  const frame = useCuadro();
  const u = useU();
  const t = interpolate(frame, [en - 22, en], [0, 1], {
    ...fijar,
    easing: (v) => 1 - (1 - v) ** 3,
  });
  const px = (x + (1 - t) * 0.16) * ancho;
  const py = (y + (1 - t) * 0.1) * alto;
  const presion = interpolate(frame, [en, en + 4, en + 14], [0, 1, 0], fijar);
  const onda = interpolate(frame, [en, en + 24], [0, 1], fijar);
  const visible =
    interpolate(frame, [en - 22, en - 14], [0, 1], fijar) *
    interpolate(frame, [en + 16, en + 26], [1, 0], fijar);
  return (
    <>
      {zona ? (
        <div
          style={{
            position: 'absolute',
            left: zona.x * ancho,
            top: zona.y * alto,
            width: zona.w * ancho,
            height: zona.h * alto,
            borderRadius: 26 * u,
            background: `rgba(6,8,20,${0.34 * presion})`,
            boxShadow: `inset 0 0 ${26 * u}px rgba(255,255,255,${0.28 * presion})`,
            transform: `scale(${1 - 0.04 * presion})`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: px,
          top: py,
          opacity: visible,
          pointerEvents: 'none',
        }}
      >
        {onda > 0 && onda < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: -90 * u * onda,
              top: -90 * u * onda,
              width: 180 * u * onda,
              height: 180 * u * onda,
              borderRadius: '50%',
              border: `${5 * u}px solid rgba(255,255,255,0.9)`,
              boxShadow: `0 0 ${24 * u}px ${PALETA.indigo}`,
              opacity: 1 - onda,
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: -34 * u,
            top: -34 * u,
            width: 68 * u,
            height: 68 * u,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)',
            border: `${4 * u}px solid ${PALETA.indigo}`,
            boxShadow: `0 ${8 * u}px ${24 * u}px rgba(0,0,0,0.5), 0 0 ${30 * u}px ${PALETA.indigo}`,
            transform: `scale(${1 - 0.26 * presion})`,
          }}
        />
      </div>
    </>
  );
};

/** Contorno índigo limpio con brillo suave que se dibuja alrededor de la zona y luego respira. */
const Resalte: React.FC<{
  forma: 'circulo' | 'recuadro';
  zona: { x: number; y: number; w: number; h: number };
  en: number;
  ancho: number;
  alto: number;
}> = ({ forma, zona, en, ancho, alto }) => {
  const frame = useCuadro();
  const u = useU();
  const t = expoOut((frame - en) / 18);
  if (t <= 0) return null;
  const pad = 10 * u;
  const respira = 0.7 + 0.3 * Math.sin(frame / 6);
  return (
    <svg
      width={ancho}
      height={alto}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      <rect
        x={zona.x * ancho - pad}
        y={zona.y * alto - pad}
        width={zona.w * ancho + pad * 2}
        height={zona.h * alto + pad * 2}
        rx={forma === 'circulo' ? (zona.h * alto + pad * 2) / 2 : 34 * u}
        fill={`rgba(79,107,255,${0.12 * t})`}
        stroke="#8FA2FF"
        strokeWidth={5 * u}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - t}
        style={{
          filter: `drop-shadow(0 0 ${(10 + 12 * (t >= 1 ? respira : 0)) * u}px ${PALETA.indigo})`,
        }}
      />
    </svg>
  );
};

/**
 * Teléfono (iPhone, titanio oscuro) que entra con tilt 3D, hace un paneo suave por la captura,
 * resalta una zona con contorno índigo y termina tocando un botón. El teléfono nunca se acerca:
 * el encuadre se mantiene completo y el acercamiento ocurre dentro de la pantalla.
 */
export const Telefono3d: React.FC<PropsEscena<'telefono-3d'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const captura = useAsset(props.captura);
  const entra = expoOut((frame - 2) / 28);
  const proporcion = captura.alto / captura.ancho;
  const alto = 940 * u;
  const ancho = alto / proporcion;
  const BISEL = 12 * u;
  const altoImagen = (ancho * captura.alto) / captura.ancho;
  const anchoMarco = ancho + BISEL * 2;
  const altoMarco = alto + BISEL * 2;
  // Paneo suave dentro de la pantalla hacia la zona resaltada (el toque queda siempre visible).
  const inicioPaneo = Math.max(0, (props.resalte?.en ?? 36) - 22);
  const paneo = expoOut((frame - inicioPaneo) / 34);
  const escalaPantalla = 1 + 0.07 * paneo;
  const origenY =
    (props.resalte?.zona ? props.resalte.zona.y + props.resalte.zona.h / 2 : 0.5) * altoImagen;
  // Tilt de entrada y deriva leve; el reflejo diagonal barre el marco una sola vez.
  const giroY = -26 * (1 - entra) - 7 + Math.sin(frame / 40) * 1.6 * entra;
  const giroX = 12 * (1 - entra) + 3;
  const flota = Math.sin(frame / 26) * 7 * u * entra;
  const barrido = interpolate(frame, [28, 62], [-40, 140], fijar);
  const titanio =
    'linear-gradient(150deg, #5B5F68 0%, #22252B 22%, #0E1014 55%, #2C2F36 80%, #4A4E57 100%)';
  return (
    <AbsoluteFill>
      {props.texto ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 175 * u }}>
          <Rotulo texto={props.texto} tam={ajustarTam(props.texto, 900, 0.7, 104)} />
        </div>
      ) : null}
      <ZonaSegura desde={280} hasta={1330}>
        <div style={{ position: 'relative', perspective: 2600 * u }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: anchoMarco * 2.1,
              height: altoMarco * 0.8,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(closest-side, ${colores.indigo}88, transparent)`,
              filter: 'blur(30px)',
              opacity: entra,
            }}
          />
          <div
            style={{
              position: 'relative',
              opacity: Math.min(1, entra * 2.2),
              filter: desenfoqueDe((1 - entra) * 24),
              transform: `translateY(${flota + (1 - entra) * 90 * u}px) rotateY(${giroY}deg) rotateX(${giroX}deg) scale(${0.9 + 0.1 * entra})`,
            }}
          >
            {/* Botones laterales de titanio */}
            {[
              { lado: 'left', top: 0.17, alto: 0.04 },
              { lado: 'left', top: 0.25, alto: 0.07 },
              { lado: 'left', top: 0.34, alto: 0.07 },
              { lado: 'right', top: 0.27, alto: 0.11 },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  [b.lado]: -5 * u,
                  top: b.top * altoMarco,
                  width: 7 * u,
                  height: b.alto * altoMarco,
                  borderRadius: 4 * u,
                  background: 'linear-gradient(90deg, #3A3D44, #17191E)',
                }}
              />
            ))}
            <div
              style={{
                position: 'relative',
                padding: BISEL,
                borderRadius: 74 * u,
                background: titanio,
                overflow: 'hidden',
                boxShadow: `inset 0 0 0 ${2 * u}px rgba(255,255,255,0.22), inset 0 0 0 ${5 * u}px rgba(0,0,0,0.55), 0 ${90 * u}px ${150 * u}px -30px rgba(0,0,0,0.85), 0 ${30 * u}px ${60 * u}px -20px rgba(0,0,0,0.6)`,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: ancho,
                  height: alto,
                  borderRadius: 62 * u,
                  overflow: 'hidden',
                  background: colores.noche,
                  boxShadow: `0 0 0 ${4 * u}px #050608`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transformOrigin: `50% ${origenY}px`,
                    transform: `scale(${escalaPantalla})`,
                  }}
                >
                  <Img
                    src={captura.src}
                    style={{ display: 'block', width: ancho, height: altoImagen }}
                  />
                  {props.resalte ? (
                    <Resalte
                      forma={props.resalte.forma}
                      zona={props.resalte.zona}
                      en={props.resalte.en}
                      ancho={ancho}
                      alto={altoImagen}
                    />
                  ) : null}
                  {props.toque ? (
                    <Toque
                      x={props.toque.x}
                      y={props.toque.y}
                      en={props.toque.en}
                      zona={props.toque.zona}
                      ancho={ancho}
                      alto={altoImagen}
                    />
                  ) : null}
                </div>
                {/* Dynamic Island */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16 * u,
                    left: '50%',
                    width: ancho * 0.3,
                    height: 36 * u,
                    marginLeft: -ancho * 0.15,
                    borderRadius: 20 * u,
                    background: '#030304',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                />
              </div>
              {/* Reflejo diagonal que barre el marco una sola vez */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(115deg, transparent ${barrido - 14}%, rgba(255,255,255,0.22) ${barrido}%, transparent ${barrido + 14}%)`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </ZonaSegura>
    </AbsoluteFill>
  );
};

/** Pantalla del monitor: la portada tal cual (sin recortar) sobre una copia suya desenfocada que llena los lados. */
const ContenidoPantalla: React.FC<{ src: string }> = ({ src }) => (
  <>
    <Img
      src={src}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(28px) brightness(0.6)',
        transform: 'scale(1.3)',
      }}
    />
    <Img
      src={src}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  </>
);

/** Monitor estilizado con perspectiva: la portada oficial se muestra sin tocar, con reflejo y halo. */
export const PortadaMonitor: React.FC<PropsEscena<'portada-monitor'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const portada = useAsset(props.portada);
  const entra = resorte(frame, 0, { damping: 15, stiffness: 150 });
  // El monitor ocupa el ancho de la zona segura: una portada vertical queda centrada en su pantalla.
  const razon = Math.max(portada.ancho / portada.alto, 1.6);
  const ancho = 900;
  const alto = ancho / razon;
  const giroY = interpolate(entra, [0, 1], [-34, -9]) + Math.sin(frame / 40) * 3;
  const giroX = 4 + Math.cos(frame / 50) * 1.5;
  const flota = Math.sin(frame / 26) * 10;
  const halo = 0.75 + 0.25 * Math.sin(frame / 18);
  const brillo = 30 + ((frame * 1.1) % 140);
  const marco = 22;
  if (!props.monitor) {
    return (
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 330 * u,
            display: 'flex',
            justifyContent: 'center',
            ...entrada(frame, 4, u, { dur: 16, y: -30 }),
          }}
        >
          <div
            style={{
              ...estiloTarjeta(u, 99),
              ...estiloEtiqueta(u, 40),
              color: PALETA.blanco,
              padding: `${18 * u}px ${44 * u}px`,
            }}
          >
            {props.etiqueta}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <ZonaSegura>
      {props.etiqueta ? (
        <div
          style={{
            ...estiloEtiqueta(u, 38),
            color: PALETA.blanco,
            marginBottom: 22 * u,
            ...entrada(frame, 6, u, { dur: 14, y: 20, blur: 6 }),
          }}
        >
          {props.etiqueta}
        </div>
      ) : null}
      <div style={{ position: 'relative', perspective: 2200 * u }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: (ancho + 260) * u,
            height: (alto + 260) * u,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(closest-side, ${colores.indigo}AA, ${colores.antetitulo}22 60%, transparent)`,
            filter: 'blur(40px)',
            opacity: entra * halo,
          }}
        />
        <div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            opacity: Math.min(1, entra * 2),
            filter: desenfoqueDe((1 - Math.min(entra, 1)) * 28),
            transform: `translateY(${flota * u + (1 - entra) * 120 * u}px) rotateY(${giroY}deg) rotateX(${giroX}deg) scale(${0.9 + 0.1 * entra})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 34 * u,
              background: '#10141D',
              transform: `translateZ(${-30 * u}px)`,
            }}
          />
          <div
            style={{
              position: 'relative',
              padding: marco * u,
              borderRadius: 34 * u,
              background: 'linear-gradient(145deg, #2C3447, #080A10)',
              boxShadow:
                'inset 0 0 0 2px rgba(255,255,255,0.22), 0 70px 120px -30px rgba(0,0,0,0.9)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: ancho * u,
                height: alto * u,
                overflow: 'hidden',
                borderRadius: 14 * u,
              }}
            >
              <ContenidoPantalla src={portada.src} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(115deg, transparent ${brillo - 16}%, rgba(255,255,255,0.14) ${brillo}%, transparent ${brillo + 16}%)`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
          <div
            style={{
              margin: '0 auto',
              width: 120 * u,
              height: 70 * u,
              background: 'linear-gradient(90deg, #0C0F16, #2C3447, #0C0F16)',
              transform: `translateZ(${-12 * u}px)`,
            }}
          />
          <div
            style={{
              margin: '0 auto',
              width: Math.min(520, ancho * 0.6) * u,
              height: 22 * u,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #0C0F16, #3A4357, #0C0F16)',
              boxShadow: `0 ${30 * u}px ${60 * u}px rgba(0,0,0,0.7)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: marco * u,
              top: `calc(100% + ${6 * u}px)`,
              width: ancho * u,
              height: alto * 0.28 * u,
              overflow: 'hidden',
              opacity: 0.22,
              maskImage: 'linear-gradient(180deg, black, transparent)',
              WebkitMaskImage: 'linear-gradient(180deg, black, transparent)',
              transform: 'scaleY(-1)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: alto * u }}>
              <ContenidoPantalla src={portada.src} />
            </div>
          </div>
        </div>
        {props.logo ? <LogoSobre id={props.logo} en={props.logoEn} ancho={ancho} /> : null}
      </div>
    </ZonaSegura>
  );
};

/** Logo (asset raster) que cae sobre la escena con un destello. */
const LogoSobre: React.FC<{ id: string; en: number; ancho: number }> = ({ id, en, ancho }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const logo = useAsset(id);
  const t = resorte(frame, en, { damping: 10, stiffness: 180 });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '16%',
          width: Math.min(520, ancho * 0.58) * u,
          marginLeft: (-Math.min(520, ancho * 0.58) / 2) * u,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, t * 2.5),
          transform: `translateY(${(1 - Math.min(t, 1)) * -120 * u}px) scale(${0.5 + 0.5 * t})`,
          filter: `${desenfoqueDe((1 - Math.min(t, 1)) * 20)} drop-shadow(0 0 ${30 * u}px ${colores.indigo})`,
        }}
      >
        <Img src={logo.src} style={{ width: '100%', display: 'block' }} />
      </div>
      <Destello en={en + 3} color={colores.antetitulo} duracion={12} />
    </>
  );
};

/**
 * Una celda de dígito en tarjeta de vidrio oscuro, sin línea partida. Primero rueda hasta su valor
 * (`rodar` = posición de la tira) y, ya en vivo, el dígito que cambia baja y el nuevo entra desde arriba.
 */
const CeldaDigito: React.FC<{
  rodar: number | null;
  valor: number;
  anterior: number;
  progreso: number;
  ancho: number;
  alto: number;
  tam: number;
}> = ({ rodar, valor, anterior, progreso, ancho, alto, tam }) => {
  const u = useU();
  const e = expoOut(progreso);
  const cifra: React.CSSProperties = {
    ...estiloDisplay(u, tam),
    width: ancho * u,
    height: alto * u,
    lineHeight: `${alto * u}px`,
    textAlign: 'center',
    color: PALETA.blanco,
    textShadow: `0 ${4 * u}px ${18 * u}px rgba(0,0,0,0.5)`,
  };
  return (
    <div
      style={{
        ...estiloTarjeta(u, 30),
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 42%), rgba(8,10,16,0.76)',
        position: 'relative',
        overflow: 'hidden',
        width: ancho * u,
        height: alto * u,
        flex: 'none',
      }}
    >
      {rodar !== null ? (
        <div style={{ transform: `translateY(${-rodar * alto * u}px)` }}>
          {Array.from({ length: 30 }, (_, n) => (
            <div key={n} style={cifra}>
              {n % 10}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
            style={{
              ...cifra,
              position: 'absolute',
              top: 0,
              transform: `translateY(${-(1 - e) * alto * u}px)`,
            }}
          >
            {valor}
          </div>
          {valor !== anterior && progreso < 1 ? (
            <div
              style={{
                ...cifra,
                position: 'absolute',
                top: 0,
                transform: `translateY(${e * alto * u}px)`,
                opacity: 1 - e,
              }}
            >
              {anterior}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

/** Un grupo (días, horas, minutos o segundos): sus dos celdas y la etiqueta centrada debajo. */
const GrupoCeldas: React.FC<{
  etiqueta: string;
  valor: [number, number];
  anterior: [number, number];
  progreso: number;
  inicio: number;
  vivo: number;
  ancho: number;
  alto: number;
  tam: number;
}> = ({ etiqueta, valor, anterior, progreso, inicio, vivo, ancho, alto, tam }) => {
  const frame = useCuadro();
  const u = useU();
  const base = valor;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u }}>
      <div style={{ display: 'flex', gap: 12 * u }}>
        {valor.map((d, i) => (
          <CeldaDigito
            key={i}
            rodar={frame < vivo ? posicionRodillo(frame, inicio + i * 3, 26, base[i]!, 1) : null}
            valor={d}
            anterior={anterior[i]!}
            progreso={progreso}
            ancho={ancho}
            alto={alto}
            tam={tam}
          />
        ))}
      </div>
      <div
        style={{
          ...estiloEtiqueta(u, 28),
          textAlign: 'center',
          opacity: expoOut((frame - inicio) / 12),
        }}
      >
        {etiqueta}
      </div>
    </div>
  );
};

const par = (n: number): [number, number] => [Math.floor(n / 10) % 10, n % 10];

/**
 * Cuenta regresiva: días como pieza protagonista y horas : minutos : segundos debajo, en tarjetas de
 * vidrio oscuro. Los dígitos ruedan hasta su valor y luego el tiempo corre de verdad (un segundo cada
 * 6 cuadros), de modo que se ve vivo.
 */
export const CuentaRegresiva: React.FC<PropsEscena<'cuenta-regresiva'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const T = tipos();
  const cuenta = cuentaRegresiva(props.desde, props.hasta);
  const base = cuenta.dias * 86400 + cuenta.horas * 3600 + cuenta.minutos * 60;
  const vivo = 56;
  const v = cuentaViva(base, frame, vivo, 6);
  const ahora = partesDeSegundos(v.segundos);
  const antes = partesDeSegundos(v.anterior);
  const inicial = partesDeSegundos(base);
  // Mientras ruedan, cada tira apunta al valor inicial.
  const mostrar = frame < vivo ? inicial : ahora;
  const previo = frame < vivo ? inicial : antes;
  const dosPuntos = (
    <div
      style={{
        ...estiloDisplay(u, 96),
        color: PALETA.blanco,
        height: 168 * u,
        lineHeight: `${160 * u}px`,
        opacity: 0.35 + 0.35 * (Math.floor(frame / 15) % 2),
      }}
    >
      :
    </div>
  );
  return (
    <ZonaSegura>
      <div
        style={{
          ...estiloEtiqueta(u, 44),
          color: PALETA.blanco,
          opacity: 0.85,
          marginBottom: 28 * u,
          ...entrada(frame, 2, u, { dur: 16, y: 24 }),
        }}
      >
        {props.etiqueta}
      </div>
      <GrupoCeldas
        etiqueta="Días"
        valor={par(mostrar.dias)}
        anterior={par(previo.dias)}
        progreso={v.progreso}
        inicio={6}
        vivo={vivo}
        ancho={214}
        alto={284}
        tam={216}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 * u, marginTop: 46 * u }}>
        <GrupoCeldas
          etiqueta="Horas"
          valor={par(mostrar.horas)}
          anterior={par(previo.horas)}
          progreso={v.progreso}
          inicio={14}
          vivo={vivo}
          ancho={112}
          alto={156}
          tam={108}
        />
        {dosPuntos}
        <GrupoCeldas
          etiqueta="Min"
          valor={par(mostrar.minutos)}
          anterior={par(previo.minutos)}
          progreso={v.progreso}
          inicio={20}
          vivo={vivo}
          ancho={112}
          alto={156}
          tam={108}
        />
        {dosPuntos}
        <GrupoCeldas
          etiqueta="Seg"
          valor={par(mostrar.segundos)}
          anterior={par(previo.segundos)}
          progreso={v.progreso}
          inicio={26}
          vivo={vivo}
          ancho={112}
          alto={156}
          tam={108}
        />
      </div>
      {props.nota ? (
        <div
          style={{
            fontFamily: T.ui,
            fontWeight: 700,
            fontSize: 38 * u,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: PALETA.blanco,
            marginTop: 48 * u,
            textShadow: `0 ${3 * u}px ${18 * u}px rgba(0,0,0,0.7)`,
            ...entrada(frame, 44, u, { dur: 16, y: 20, blur: 6 }),
          }}
        >
          {props.nota}
        </div>
      ) : null}
    </ZonaSegura>
  );
};

/**
 * Fecha como pieza de diseño sobre el gameplay: antetítulo en versalitas, el día enorme con el
 * relleno cálido, el mes en blanco y el año en una píldora de vidrio. Entran escalonados con expo-out.
 */
export const Fecha: React.FC<PropsEscena<'fecha'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const T = tipos();
  const tamDia = Math.min(560, 900 / (props.dia.length * 0.62));
  const tamMes = ajustarTam(props.mes, 940, 0.74, 170);
  const entraDia = entrada(frame, 6, u, { dur: 20, y: 40, blur: 14, escala: 0.94 });
  return (
    <ZonaSegura>
      <div
        style={{
          ...estiloEtiqueta(u, 56),
          color: PALETA.blanco,
          opacity: 0.9,
          ...entrada(frame, 2, u, { dur: 16, y: 26 }),
        }}
      >
        {props.antetitulo}
      </div>
      <div
        style={{
          ...estiloDisplay(u, tamDia),
          ...estiloPrecio(u),
          lineHeight: 0.86,
          margin: `${10 * u}px 0 ${6 * u}px`,
          ...entraDia,
          filter: [entraDia.filter, estiloPrecio(u).filter].filter(Boolean).join(' '),
        }}
      >
        {props.dia}
      </div>
      <div
        style={{
          ...estiloDisplay(u, tamMes),
          textTransform: 'uppercase',
          color: PALETA.blanco,
          textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.65)`,
          ...entrada(frame, 12, u, { dur: 18, y: 34 }),
        }}
      >
        {props.mes}
      </div>
      {props.anio ? (
        <div
          style={{
            ...estiloTarjeta(u, 99),
            marginTop: 34 * u,
            padding: `${14 * u}px ${44 * u}px`,
            fontFamily: T.ui,
            fontWeight: 800,
            fontSize: 44 * u,
            letterSpacing: '0.3em',
            color: PALETA.blanco,
            ...entrada(frame, 20, u, { dur: 16, y: 20, blur: 6 }),
          }}
        >
          {props.anio}
        </div>
      ) : null}
    </ZonaSegura>
  );
};
