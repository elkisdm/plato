import React from 'react';
import { AbsoluteFill, Img, interpolate, spring } from 'remotion';
import { avance } from '../../kit/animacion';
import { Aparicion } from '../../kit/Aparicion';
import { useVertical } from '../../kit/formato';
import { Onda } from '../../kit/OndaVoz';
import { Plano } from '../../kit/Plano';
import { useCuadro } from '../../kit/tiempo';
import { TituloSerif } from '../../kit/TituloSerif';
import { logoDe, useMarca } from '../../marca';
import { useAsset, type Escena } from '../../proyecto';
import { FPS, radios, sombraTarjeta } from '../../tema';
import { curvaSuave, enOrbita, puntosDeSerie, type NombreEscena, type PropsDe } from './esquemas';

type PropsEscena<N extends NombreEscena> = { escena: Escena; props: PropsDe<N> };

/** Lado del lienzo de las gráficas: cabe junto al título (horizontal) o debajo (vertical). */
const useLado = (): number => (useVertical() ? 820 : 800);

const fijar = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Entrada con un leve sobrepaso (≈6 %): la pieza llega, se pasa apenas y se asienta. */
const pop = (frame: number, inicio: number): number =>
  spring({ frame: frame - inicio, fps: FPS, config: { damping: 13, mass: 0.7, stiffness: 150 } });

/**
 * Cámara viva: la gráfica se acerca muy lento y flota apenas, así ningún plano queda congelado.
 * El acercamiento es asintótico: no depende de cuánto dure la escena.
 */
const Camara: React.FC<{ children: React.ReactNode; fuerza?: number }> = ({
  children,
  fuerza = 1,
}) => {
  const frame = useCuadro();
  const escala = 1 + 0.05 * fuerza * (1 - Math.exp(-frame / 220));
  const dy = Math.sin(frame / 55) * 7 * fuerza;
  const giro = Math.sin(frame / 90) * 0.35 * fuerza;
  return (
    <div style={{ transform: `translateY(${dy}px) scale(${escala}) rotate(${giro}deg)` }}>
      {children}
    </div>
  );
};

/** Onda de choque: un anillo que sale rápido desde el centro y se apaga (acento de un evento). */
const Choque: React.FC<{ en: number; tam: number; color: string }> = ({ en, tam, color }) => {
  const frame = useCuadro();
  const t = interpolate(frame, [en, en + 26], [0, 1], fijar);
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
        border: `${3 * (1 - t) + 1}px solid ${color}`,
        opacity: 1 - t,
        transform: `scale(${1 + t * 1.6})`,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Orbe que respira, con anillos que se expanden como si la voz saliera de él. */
const Orbe: React.FC<{ tam: number }> = ({ tam }) => {
  const frame = useCuadro();
  const { colores } = useMarca();
  const respira = 1 + 0.035 * Math.sin(frame / 14);
  return (
    <div style={{ position: 'relative', width: tam, height: tam }}>
      {[0, 1, 2].map((i) => {
        const t = ((((frame + i * 26) % 78) + 78) % 78) / 78;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${colores.cian}`,
              opacity: (1 - t) * 0.55,
              transform: `scale(${1 + t * 0.9})`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          transform: `scale(${respira}) rotate(${frame * 0.8}deg)`,
          background: `conic-gradient(from 0deg, ${colores.indigo}, ${colores.cian}, ${colores.cursiva}, ${colores.indigo})`,
          filter: 'blur(1px)',
          boxShadow: `0 0 ${tam * 0.45}px ${colores.indigo}88`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: tam * 0.1,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #FFFFFFCC, ${colores.indigo}00 55%)`,
        }}
      />
      <Choque en={8} tam={tam} color={colores.cian} />
    </div>
  );
};

const Logo: React.FC = () => {
  const vertical = useVertical();
  const marca = useMarca();
  const logo = useAsset(logoDe(marca, 'blanco'));
  return (
    <Aparicion
      desdeY={-20}
      style={{ position: 'absolute', top: vertical ? 70 : 64, left: vertical ? 70 : 120 }}
    >
      <Img src={logo.src} style={{ width: 150, display: 'block' }} />
    </Aparicion>
  );
};

/** La presentación: el orbe nace con una onda de choque, la onda habla y el nombre entra palabra por palabra. */
export const Saludo: React.FC<PropsEscena<'saludo'>> = ({ escena, props }) => {
  const vertical = useVertical();
  const frame = useCuadro();
  const t = pop(frame, 4);
  const foco = interpolate(frame, [4, 30], [14, 0], fijar);
  return (
    <AbsoluteFill
      style={{ alignItems: 'center', justifyContent: 'center', gap: vertical ? 80 : 56 }}
    >
      <Camara fuerza={0.6}>
        <div
          style={{
            transform: `scale(${0.5 + 0.5 * t})`,
            opacity: Math.min(1, t),
            filter: foco > 0.05 ? `blur(${foco}px)` : undefined,
          }}
        >
          <Orbe tam={vertical ? 360 : 280} />
        </div>
      </Camara>
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        texto={escena.texto}
        tamano={vertical ? 120 : 112}
        alineacion="center"
        anchoMaximo={vertical ? 940 : 1400}
      />
      <div style={{ opacity: avance(frame, 30), transform: `scaleY(${avance(frame, 30, 30)})` }}>
        <Onda ancho={vertical ? 620 : 520} alto={80} />
      </div>
      {props.logo ? <Logo /> : null}
    </AbsoluteFill>
  );
};

/** Auricular del teléfono (trazo de Material, 24×24). */
const Auricular: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"
    />
  </svg>
);

/** El teléfono suena con ondas; debajo, la línea que va de un hito al otro con su cabeza de luz. */
export const Llamada: React.FC<PropsEscena<'llamada'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const { colores, fuentes } = useMarca();
  const lado = useLado();
  const tam = lado * 0.36;
  const aparece = pop(frame, 8);
  // Vibra en ráfagas cortas, como un teléfono que timbra; cada ráfaga suelta una onda de choque.
  const fase = ((frame % 36) + 36) % 36;
  const timbre = fase < 14 ? Math.sin(frame * 2.2) * 9 * Math.sin((fase / 14) * Math.PI) : 0;
  const linea = avance(frame, 34, 40);
  const largo = lado * 0.8;
  const hito = (etiqueta: string, en: number, x: number) => {
    const p = pop(frame, en);
    const texto = avance(frame, en + 4, 18);
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            margin: '0 auto',
            borderRadius: '50%',
            background: colores.cian,
            boxShadow: `0 0 24px ${colores.cian}`,
            transform: `scale(${p})`,
          }}
        />
        <div
          style={{
            marginTop: 18,
            fontFamily: fuentes.ui,
            fontSize: 26,
            fontWeight: 600,
            color: colores.blanco,
            whiteSpace: 'nowrap',
            opacity: texto,
            transform: `translateY(${(1 - texto) * 14}px)`,
          }}
        >
          {etiqueta}
        </div>
      </div>
    );
  };
  return (
    <Plano escena={escena}>
      <Camara>
        <div
          style={{
            width: lado,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: lado * 0.12,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: tam,
              height: tam,
              opacity: Math.min(1, aparece),
              transform: `scale(${0.6 + 0.4 * aparece})`,
            }}
          >
            {[0, 1, 2].map((i) => {
              const t = ((((frame + i * 16) % 48) + 48) % 48) / 48;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `3px solid ${colores.cian}`,
                    opacity: (1 - t) * 0.7,
                    transform: `scale(${1 + t * 0.8})`,
                  }}
                />
              );
            })}
            {[0, 36, 72, 108, 144, 180, 216].map((en) => (
              <Choque key={en} en={en + 8} tam={tam} color={colores.cursiva} />
            ))}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `linear-gradient(145deg, ${colores.indigo}, ${colores.navy})`,
                boxShadow: `${sombraTarjeta}, inset 0 2px 0 rgba(255,255,255,0.18)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${timbre}deg)`,
              }}
            >
              <Auricular tam={tam * 0.46} color={colores.blanco} />
            </div>
          </div>
          <div style={{ position: 'relative', width: largo, height: 90 }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 12,
                height: 3,
                width: '100%',
                background: 'rgba(233, 237, 255, 0.14)',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 12,
                height: 3,
                width: `${linea * 100}%`,
                background: `linear-gradient(90deg, ${colores.cian}, ${colores.indigo})`,
                borderRadius: 2,
                boxShadow: `0 0 12px ${colores.cian}`,
              }}
            />
            {linea > 0 && linea < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: linea * largo - 9,
                  top: 4.5,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: colores.blanco,
                  boxShadow: `0 0 18px 4px ${colores.cian}`,
                }}
              />
            ) : null}
            {hito(props.desde, 30, 0)}
            {hito(props.hasta, 72, largo)}
          </div>
        </div>
      </Camara>
    </Plano>
  );
};

/** Un nodo al centro y sus canales en órbita, con pulsos que dejan estela entre ellos. */
export const Canales: React.FC<PropsEscena<'canales'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const { colores, fuentes } = useMarca();
  const lado = useLado();
  const c = lado / 2;
  const radio = lado * 0.34;
  const giro = frame * 0.0025;
  const centro = pop(frame, 6);
  const posPulso = (i: number, retraso: number) => {
    const f = frame - 30 - i * 11 - retraso;
    const vuelta = Math.floor(f / 34);
    const t = (((f / 34) % 1) + 1) % 1;
    return vuelta % 2 === 0 ? t : 1 - t;
  };
  return (
    <Plano escena={escena}>
      <Camara>
        <div style={{ position: 'relative', width: lado, height: lado }}>
          <svg
            width={lado}
            height={lado}
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="rayo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colores.indigo} />
                <stop offset="100%" stopColor={colores.cian} />
              </linearGradient>
            </defs>
            <circle
              cx={c}
              cy={c}
              r={radio}
              fill="none"
              stroke="rgba(233, 237, 255, 0.1)"
              strokeWidth={2}
              strokeDasharray="4 10"
              strokeDashoffset={-frame * 0.6}
              opacity={avance(frame, 0, 30)}
            />
            {props.canales.map((_, i) => {
              const [x, y] = enOrbita(i, props.canales.length, radio, giro);
              const traza = avance(frame, 20 + i * 8, 24);
              return (
                <g key={i}>
                  <line
                    x1={c}
                    y1={c}
                    x2={c + x * traza}
                    y2={c + y * traza}
                    stroke="url(#rayo)"
                    strokeWidth={3}
                    strokeOpacity={0.85}
                    style={{ filter: `drop-shadow(0 0 6px ${colores.indigo})` }}
                  />
                  {frame > 30 + i * 11
                    ? [0, 3, 6].map((retraso, j) => {
                        const k = posPulso(i, retraso);
                        return (
                          <circle
                            key={j}
                            cx={c + x * k}
                            cy={c + y * k}
                            r={9 - j * 2.5}
                            fill={colores.cian}
                            opacity={1 - j * 0.3}
                            style={{
                              filter: j === 0 ? `drop-shadow(0 0 10px ${colores.cian})` : undefined,
                            }}
                          />
                        );
                      })
                    : null}
                </g>
              );
            })}
          </svg>
          <div
            style={{
              position: 'absolute',
              left: c,
              top: c,
              transform: `translate(-50%, -50%) scale(${centro * (1 + 0.025 * Math.sin(frame / 12))})`,
              width: lado * 0.3,
              height: lado * 0.3,
              borderRadius: '50%',
              background: `conic-gradient(from ${frame}deg, ${colores.indigo}, ${colores.cian}, ${colores.indigo})`,
              boxShadow: `0 0 80px ${colores.indigo}AA`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: fuentes.serif,
                fontStyle: 'italic',
                fontSize: lado * 0.065,
                color: colores.blanco,
              }}
            >
              {props.centro}
            </span>
          </div>
          {props.canales.map((canal, i) => {
            const [x, y] = enOrbita(i, props.canales.length, radio, giro);
            const p = pop(frame, 26 + i * 8);
            return (
              <div
                key={canal}
                style={{
                  position: 'absolute',
                  left: c + x,
                  top: c + y,
                  transform: `translate(-50%, -50%) scale(${p})`,
                  opacity: Math.min(1, p * 1.5),
                  padding: '18px 30px',
                  borderRadius: 999,
                  background: colores.blanco,
                  boxShadow: sombraTarjeta,
                  fontFamily: fuentes.ui,
                  fontWeight: 600,
                  fontSize: 28,
                  color: colores.noche,
                  whiteSpace: 'nowrap',
                }}
              >
                {canal}
              </div>
            );
          })}
        </div>
      </Camara>
    </Plano>
  );
};

/** Globos de chat que llegan uno tras otro, el «escribiendo…» y un reloj que da la vuelta. */
export const Conversacion: React.FC<PropsEscena<'conversacion'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const { colores, fuentes } = useMarca();
  const lado = useLado();
  const reloj = lado * 0.3;
  const r = reloj / 2 - 10;
  const vuelta = avance(frame, 10, 90);
  const largo = 2 * Math.PI * r;
  const angulo = vuelta * Math.PI * 2 - Math.PI / 2;
  const aparece = pop(frame, 6);
  return (
    <Plano escena={escena}>
      <Camara>
        <div
          style={{
            width: lado,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: lado * 0.6 }}>
            {Array.from({ length: props.mensajes }, (_, i) => {
              const suyo = i % 2 === 0;
              const p = pop(frame, 14 + i * 16);
              const lineas = [1, 0.6, 0.8][i % 3] ?? 1;
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: suyo ? 'flex-start' : 'flex-end',
                    opacity: Math.min(1, p * 1.6),
                    transform: `translate(${(1 - p) * (suyo ? -40 : 40)}px, ${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`,
                    transformOrigin: suyo ? 'left bottom' : 'right bottom',
                    width: `${55 + lineas * 25}%`,
                    padding: '22px 26px',
                    borderRadius: suyo
                      ? `${radios.tarjeta}px ${radios.tarjeta}px ${radios.tarjeta}px 6px`
                      : `${radios.tarjeta}px ${radios.tarjeta}px 6px ${radios.tarjeta}px`,
                    background: suyo
                      ? 'rgba(233, 237, 255, 0.12)'
                      : `linear-gradient(135deg, ${colores.indigo}, ${colores.cian})`,
                    boxShadow: suyo ? undefined : `0 18px 40px -18px ${colores.indigo}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      height: 12,
                      borderRadius: 6,
                      width: `${100 * avance(frame, 20 + i * 16, 16)}%`,
                      background: suyo ? 'rgba(233, 237, 255, 0.35)' : '#FFFFFFCC',
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      borderRadius: 6,
                      width: `${lineas * 70 * avance(frame, 24 + i * 16, 16)}%`,
                      background: suyo ? 'rgba(233, 237, 255, 0.35)' : '#FFFFFFCC',
                    }}
                  />
                </div>
              );
            })}
            <div
              style={{
                alignSelf: 'flex-end',
                display: 'flex',
                gap: 10,
                padding: '18px 24px',
                borderRadius: 999,
                background: 'rgba(233, 237, 255, 0.12)',
                opacity: avance(frame, 14 + props.mensajes * 16, 12),
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: colores.cian,
                    transform: `translateY(${Math.sin(frame / 4 - i) * 5}px)`,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              width: reloj,
              height: reloj,
              transform: `scale(${aparece})`,
            }}
          >
            <svg width={reloj} height={reloj} style={{ overflow: 'visible' }}>
              <circle
                cx={reloj / 2}
                cy={reloj / 2}
                r={r}
                fill="none"
                stroke="rgba(233, 237, 255, 0.12)"
                strokeWidth={10}
              />
              <circle
                cx={reloj / 2}
                cy={reloj / 2}
                r={r}
                fill="none"
                stroke={colores.cian}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={largo}
                strokeDashoffset={largo * (1 - vuelta)}
                transform={`rotate(-90 ${reloj / 2} ${reloj / 2})`}
                style={{ filter: `drop-shadow(0 0 8px ${colores.cian})` }}
              />
              {vuelta > 0 && vuelta < 1 ? (
                <circle
                  cx={reloj / 2 + Math.cos(angulo) * r}
                  cy={reloj / 2 + Math.sin(angulo) * r}
                  r={9}
                  fill={colores.blanco}
                  style={{ filter: `drop-shadow(0 0 10px ${colores.cian})` }}
                />
              ) : null}
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: fuentes.ui,
                fontWeight: 700,
                fontSize: reloj * 0.13,
                lineHeight: 1.1,
                padding: reloj * 0.14,
                color: colores.blanco,
              }}
            >
              {props.reloj}
            </div>
            <Choque en={100} tam={reloj} color={colores.cian} />
          </div>
        </div>
      </Camara>
    </Plano>
  );
};

/** Un calendario que entra en ola, se recorre y una hora queda tomada con su confirmación. */
export const Agenda: React.FC<PropsEscena<'agenda'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const { colores, fuentes } = useMarca();
  const lado = useLado();
  const columnas = 5;
  const filas = 3;
  const hueco = 14;
  const celda = (lado * 0.9 - hueco * (columnas - 1)) / columnas;
  // El foco recorre las celdas hasta la elegida y se queda ahí.
  const recorrido = interpolate(frame, [22, 60], [0, props.celda], {
    ...fijar,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const elegida = frame >= 60;
  const marca = pop(frame, 60);
  const tarjeta = pop(frame, 78);
  const check = avance(frame, 86, 18);
  return (
    <Plano escena={escena}>
      <Camara>
        <div style={{ position: 'relative', width: lado * 0.9 }}>
          <div style={{ display: 'flex', gap: hueco, marginBottom: 18 }}>
            {['L', 'M', 'M', 'J', 'V'].map((d, i) => (
              <div
                key={i}
                style={{
                  width: celda,
                  textAlign: 'center',
                  fontFamily: fuentes.ui,
                  fontWeight: 600,
                  fontSize: 24,
                  color: colores.antetitulo,
                  opacity: avance(frame, i * 3, 14),
                  transform: `translateY(${(1 - avance(frame, i * 3, 14)) * -10}px)`,
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columnas}, ${celda}px)`,
              gap: hueco,
            }}
          >
            {Array.from({ length: columnas * filas }, (_, i) => {
              // Entrada en ola diagonal: cada celda espera según su columna + fila.
              const p = pop(frame, 4 + ((i % columnas) + Math.floor(i / columnas)) * 3);
              const cercania = Math.max(0, 1 - Math.abs(recorrido - i));
              const foco = elegida ? 0 : cercania;
              const esElegida = elegida && i === props.celda;
              return (
                <div key={i} style={{ position: 'relative' }}>
                  <div
                    style={{
                      height: celda * 0.72,
                      borderRadius: 18,
                      opacity: Math.min(1, p * 1.4),
                      transform: `scale(${(0.7 + 0.3 * p) * (esElegida ? 1 + 0.08 * marca : 1 + 0.04 * foco)})`,
                      background: esElegida
                        ? `linear-gradient(135deg, ${colores.indigo}, ${colores.cian})`
                        : `rgba(56, 189, 248, ${0.08 + 0.3 * foco})`,
                      border: `1px solid ${esElegida ? 'transparent' : `rgba(233, 237, 255, ${0.12 + 0.3 * foco})`}`,
                      boxShadow: esElegida
                        ? `0 0 50px ${colores.cian}88`
                        : foco > 0.3
                          ? `0 0 30px ${colores.cian}44`
                          : undefined,
                    }}
                  />
                  {i === props.celda ? (
                    <Choque en={60} tam={celda * 0.72} color={colores.cian} />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -celda * 1.1,
              transform: `translate(-50%, ${(1 - tarjeta) * 60}px) scale(${0.9 + 0.1 * tarjeta})`,
              opacity: Math.min(1, tarjeta * 1.5),
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '22px 34px',
              borderRadius: radios.tarjeta,
              background: colores.blanco,
              boxShadow: sombraTarjeta,
              whiteSpace: 'nowrap',
            }}
          >
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle cx={22} cy={22} r={22} fill={colores.indigo} />
              <path
                d="M12 23 L19 30 L32 15"
                fill="none"
                stroke={colores.blanco}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={32}
                strokeDashoffset={32 * (1 - check)}
              />
            </svg>
            <span
              style={{
                fontFamily: fuentes.ui,
                fontWeight: 600,
                fontSize: 30,
                color: colores.noche,
              }}
            >
              {props.confirmacion}
            </span>
          </div>
        </div>
      </Camara>
    </Plano>
  );
};

/** Barras que crecen con rebote, una curva que se dibuja encima y un punto de luz que la recorre. Sin cifras. */
export const Grafica: React.FC<PropsEscena<'grafica'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const { colores } = useMarca();
  const lado = useLado();
  const ancho = lado;
  const alto = lado * 0.7;
  const n = props.serie.length;
  const paso = ancho / n;
  const puntos = puntosDeSerie(props.serie, ancho - paso, alto * 0.9).map(
    ([x, y]) => [x + paso / 2, y + alto * 0.1] as [number, number],
  );
  const trazo = avance(frame, 34, 50);
  const d = curvaSuave(puntos);
  // El punto que recorre la curva: se ubica entre los dos puntos de la serie que le tocan.
  const pos = trazo * (n - 1);
  const i0 = Math.min(n - 2, Math.floor(pos));
  const k = pos - i0;
  const [ax, ay] = puntos[i0]!;
  const [bx, by] = puntos[i0 + 1]!;
  const px = ax + (bx - ax) * k;
  const py = ay + (by - ay) * (0.5 - Math.cos(k * Math.PI) / 2);
  const [x0] = puntos[0]!;
  const [xn] = puntos[n - 1]!;
  return (
    <Plano escena={escena}>
      <Camara>
        <svg width={ancho} height={alto + 20} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="barra" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colores.indigo} stopOpacity={0.95} />
              <stop offset="100%" stopColor={colores.indigo} stopOpacity={0.12} />
            </linearGradient>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colores.cian} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colores.cian} stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((g, i) => (
            <line
              key={g}
              x1={0}
              x2={ancho * avance(frame, i * 3, 30)}
              y1={alto * (1 - g * 0.9)}
              y2={alto * (1 - g * 0.9)}
              stroke="rgba(233, 237, 255, 0.08)"
              strokeWidth={2}
            />
          ))}
          {props.serie.map((v, i) => {
            const crece = spring({
              frame: frame - 8 - i * 4,
              fps: FPS,
              config: { damping: 11, mass: 0.8, stiffness: 110 },
            });
            const h = alto * 0.9 * v * crece;
            return (
              <rect
                key={i}
                x={i * paso + paso * 0.2}
                y={alto - h}
                width={paso * 0.6}
                height={Math.max(0, h)}
                rx={12}
                fill="url(#barra)"
              />
            );
          })}
          <path
            d={`${d} L ${xn} ${alto} L ${x0} ${alto} Z`}
            fill="url(#area)"
            opacity={avance(frame, 60, 30)}
          />
          <path
            d={d}
            fill="none"
            stroke={colores.cian}
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - trazo}
            style={{ filter: `drop-shadow(0 0 12px ${colores.cian})` }}
          />
          {trazo > 0 ? (
            <>
              <circle
                cx={px}
                cy={py}
                r={20 + 6 * Math.sin(frame / 5)}
                fill={colores.cian}
                opacity={0.25}
              />
              <circle cx={px} cy={py} r={11} fill={colores.blanco} />
            </>
          ) : null}
        </svg>
      </Camara>
    </Plano>
  );
};

/** El cierre: orbe, nombre grande con su onda y el logo. */
export const Cierre: React.FC<PropsEscena<'cierre'>> = ({ escena, props }) => {
  const vertical = useVertical();
  const frame = useCuadro();
  const marca = useMarca();
  const logo = useAsset(logoDe(marca, 'blanco'));
  const orbe = pop(frame, 4);
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 70 : 50,
        padding: 80,
      }}
    >
      <Camara fuerza={0.5}>
        <div style={{ transform: `scale(${orbe})`, opacity: Math.min(1, orbe) }}>
          <Orbe tam={vertical ? 200 : 150} />
        </div>
      </Camara>
      <TituloSerif
        antetitulo={escena.antetitulo}
        titulo={escena.titulo}
        texto={escena.texto}
        tamano={vertical ? 130 : 140}
        alineacion="center"
        anchoMaximo={vertical ? 940 : 1500}
      />
      <div style={{ opacity: avance(frame, 30), transform: `scaleY(${avance(frame, 30, 30)})` }}>
        <Onda ancho={vertical ? 560 : 480} alto={60} />
      </div>
      {props.logo ? (
        <Aparicion inicio={40} desdeY={20} enfoque>
          <Img src={logo.src} style={{ width: 170, display: 'block' }} />
        </Aparicion>
      ) : null}
    </AbsoluteFill>
  );
};
