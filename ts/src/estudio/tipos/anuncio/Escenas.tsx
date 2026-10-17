import React from 'react';
import { AbsoluteFill, Img, interpolate, useVideoConfig } from 'remotion';
import { useCuadro } from '../../kit/tiempo';
import { logoDe, useMarca } from '../../marca';
import { inicioVoz, useAsset, useProyecto, type Escena } from '../../proyecto';
import {
  Brillo,
  Destello,
  desenfoqueDe,
  fijar,
  Onda,
  resorte,
  useTitular,
  useU,
  ZonaSegura,
} from './Base';
import {
  ajustarTam,
  anchoPrecioEm,
  entradasPorVoz,
  expoOut,
  esAcento,
  formatoCLP,
  frenaRueda,
  particulas,
  ruedaPrecio,
  temblor,
  valorContador,
} from './calculos';
import type { NombreEscena, PropsDe } from './esquemas';
import { iconos } from './Iconos';
import {
  Boton,
  entrada,
  Monto,
  estiloDisplay,
  estiloEtiqueta,
  estiloPrecio,
  estiloTarjeta,
  PALETA,
  rellenoPrecio,
  tipos,
} from './Sistema';

type PropsEscena<N extends NombreEscena> = { escena: Escena; props: PropsDe<N> };

/**
 * Frases enormes y cinéticas: cada línea se ajusta a su ancho; cada palabra sube desde una máscara
 * con resorte y leve sobrepaso, en el cuadro en que la voz la dice (si hay tiempos por palabra).
 * Las palabras de acento llegan con un pop de escala y un brillo que cede.
 */
export const Gancho: React.FC<PropsEscena<'gancho'>> = ({ escena, props }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const { voz } = useProyecto();
  const titular = useTitular(u, 100);
  const total = props.lineas.reduce((n, l) => n + l.split(' ').filter(Boolean).length, 0);
  const palabrasVoz = voz[escena.id]?.palabras ?? [];
  const entradas = entradasPorVoz(total, palabrasVoz, inicioVoz(escena));
  let indice = 0;
  return (
    <AbsoluteFill>
      <ZonaSegura>
        {props.lineas.map((linea, li) => {
          const palabras = linea.split(' ').filter(Boolean);
          const tam = Math.min(300, ajustarTam(linea, 920, 0.74));
          const inicioLinea = 4 + indice * props.paso;
          const entradaLinea = entradas[indice] ?? inicioLinea;
          if (props.modo === 'linea') indice += 2;
          return (
            <div
              key={li}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: `0 ${tam * 0.22 * u}px`,
                textAlign: 'center',
                marginBottom: 6 * u,
              }}
            >
              {palabras.map((palabra, pi) => {
                const k = indice++;
                const sincronizada = palabrasVoz.length > 0;
                const inicio =
                  props.modo === 'linea'
                    ? sincronizada
                      ? entradaLinea
                      : inicioLinea
                    : sincronizada
                      ? (entradas[k] ?? 4 + k * props.paso)
                      : 4 + k * props.paso;
                const t = expoOut((frame - inicio) / 14);
                const acento = esAcento(palabra, props.acento);
                const color = acento ? PALETA.ambar : colores.blanco;
                const brillo = acento
                  ? Math.exp(-(frame - inicio) / 16) * (frame >= inicio ? 1 : 0)
                  : 0;
                return (
                  <span
                    key={pi}
                    style={{
                      display: 'inline-block',
                      overflow: 'hidden',
                      padding: `${tam * 0.1 * u}px ${tam * 0.05 * u}px`,
                      margin: `${-tam * 0.1 * u}px ${-tam * 0.05 * u}px`,
                    }}
                  >
                    <span
                      style={{
                        ...titular,
                        fontSize: tam * u,
                        display: 'inline-block',
                        color,
                        opacity: t > 0.02 ? 1 : 0,
                        transform: `translateY(${(1 - t) * 112}%)`,
                        filter: t < 1 ? `blur(${((1 - t) * 10).toFixed(1)}px)` : undefined,
                        textShadow: acento
                          ? `0 0 ${(24 + 40 * brillo) * u}px rgba(255,179,71,${(0.35 + 0.4 * brillo).toFixed(2)}), 0 ${6 * u}px ${24 * u}px rgba(0,0,0,0.6)`
                          : `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.65)`,
                      }}
                    >
                      {palabra}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </ZonaSegura>
    </AbsoluteFill>
  );
};

/**
 * Un dígito de tragamonedas: una tira 0–9 repetida que sube hasta frenar en `caracter`. La celda
 * mide lo mismo que el dígito final (se pinta invisible) y recorta la tira; `velocidad` borra el giro.
 * Cada cifra lleva el relleno cálido de los precios.
 */
const DigitoRueda: React.FC<{
  posicion: number;
  velocidad: number;
  tam: number;
  caracter: string;
}> = ({ posicion, velocidad, tam, caracter }) => {
  const alto = tam * 0.95;
  const cifra: React.CSSProperties = {
    display: 'block',
    height: alto,
    width: '0.62em',
    textAlign: 'center',
    lineHeight: 0.95,
    ...rellenoPrecio,
  };
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        height: alto,
        width: '0.62em',
      }}
    >
      <span style={{ ...cifra, visibility: 'hidden' }}>{caracter}</span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          transform: `translateY(${-posicion * alto}px)`,
          filter: `blur(${Math.min(7, Math.abs(velocidad)).toFixed(1)}px)`,
        }}
      >
        {Array.from({ length: 40 }, (_, n) => (
          <span key={n} style={cifra}>
            {n % 10}
          </span>
        ))}
      </span>
    </span>
  );
};

/**
 * El precio de referencia se tacha con UNA línea continua que se dibuja de izquierda a derecha y
 * queda al 55 %; el nuestro rueda como tragamonedas y frena con un impacto sutil.
 */
export const PrecioTachado: React.FC<PropsEscena<'precio-tachado'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const T = tipos();
  const { referencia, precio, tachaEn, precioEn } = props;
  const traza = expoOut((frame - tachaEn) / 10);
  const apaga = interpolate(frame, [tachaEn + 10, tachaEn + 18], [0, 1], fijar);
  const subeCentro = interpolate(frame, [precioEn - 4, precioEn + 14], [0, 1], fijar);
  // Los dígitos ruedan y frenan uno tras otro; el impacto (sacudida breve, onda, chispas) llega al último.
  const llega = frenaRueda(precioEn, precio.monto);
  const tiembla = temblor(frame, llega, 7 * u, 6);
  const chispas = particulas(18, (frame - llega) / 22, 360 * u);
  const impacto = Math.exp(-Math.max(0, frame - llega) / 5) * (frame >= llega ? 1 : 0);
  const rueda = ruedaPrecio(frame, precioEn, precio.monto);
  const tamPrecio = Math.min(250, 930 / anchoPrecioEm(precio.monto));
  const tamRef = Math.min(190, 780 / (referencia.monto.length * 0.6));
  return (
    <ZonaSegura>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `translate(${tiembla.x}px, ${tiembla.y}px)`,
        }}
      >
        <div
          style={{
            ...estiloTarjeta(u, 40),
            position: 'absolute',
            top: 0,
            left: 90 * u,
            width: 900 * u,
            boxSizing: 'border-box',
            padding: `${34 * u}px ${30 * u}px ${30 * u}px`,
            textAlign: 'center',
            transformOrigin: '50% 0%',
            ...entrada(frame, 3, u, { dur: 18, y: 40, escala: 0.96 }),
            transform: `translateY(${(1 - subeCentro) * 235 * u}px) scale(${(1 + 0.15 * (1 - subeCentro)) * (1 - 0.28 * subeCentro)})`,
            opacity: 1,
          }}
        >
          <div style={{ ...estiloEtiqueta(u, 32), opacity: Math.min(1, (frame - 3) / 8) }}>
            {referencia.etiqueta}
          </div>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 12 * u }}>
            <div
              style={{
                ...estiloDisplay(u, tamRef),
                color: PALETA.blanco,
                opacity: 1 - 0.45 * apaga,
                textTransform: 'uppercase',
              }}
            >
              {referencia.monto}
            </div>
            <div
              style={{
                position: 'absolute',
                left: '-4%',
                top: '51%',
                width: '108%',
                height: 13 * u,
                marginTop: -6.5 * u,
                borderRadius: 99,
                background: PALETA.rojo,
                boxShadow: `0 0 ${18 * u}px rgba(255,59,92,0.45)`,
                transformOrigin: '0% 50%',
                transform: `rotate(-4deg) scaleX(${traza})`,
              }}
            />
          </div>
          {referencia.nota ? (
            <div
              style={{
                fontFamily: T.ui,
                fontWeight: 600,
                fontSize: 36 * u,
                marginTop: 10 * u,
                color: PALETA.suave,
                opacity: 1 - 0.3 * apaga,
              }}
            >
              {referencia.nota}
            </div>
          ) : null}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center' }}>
          <Onda en={llega} tam={760 * u} color={PALETA.ambar} />
          {chispas.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '55%',
                width: c.tam * 0.7,
                height: c.tam * 0.7,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#FFFFFF' : PALETA.ambar,
                opacity: c.alfa,
                transform: `translate(${c.x}px, ${c.y}px)`,
              }}
            />
          ))}
          {precio.etiqueta ? (
            <div
              style={{
                ...estiloEtiqueta(u, 38),
                color: PALETA.blanco,
                opacity: 0.8,
                marginBottom: 14 * u,
                ...entrada(frame, precioEn - 2, u, { dur: 14, y: 18, blur: 6 }),
              }}
            >
              {precio.etiqueta}
            </div>
          ) : null}
          <div
            style={{
              ...estiloDisplay(u, tamPrecio),
              ...estiloPrecio(u),
              display: 'inline-flex',
              alignItems: 'flex-start',
              opacity: expoOut((frame - precioEn) / 6),
              transform: `scale(${1 + 0.06 * impacto})`,
            }}
          >
            {rueda.map((r, i) =>
              r.posicion === null ? (
                r.caracter === '$' ? (
                  <span
                    key={i}
                    style={{ fontSize: '0.5em', marginTop: '0.1em', marginRight: '0.04em' }}
                  >
                    $
                  </span>
                ) : (
                  <span
                    key={i}
                    style={{ display: 'inline-block', width: '0.28em', textAlign: 'center' }}
                  >
                    {r.caracter}
                  </span>
                )
              ) : (
                <DigitoRueda
                  key={i}
                  posicion={r.posicion}
                  velocidad={
                    (r.posicion -
                      (ruedaPrecio(frame - 1, precioEn, precio.monto)[i]?.posicion ?? 0)) *
                    4
                  }
                  tam={tamPrecio * u}
                  caracter={r.caracter}
                />
              ),
            )}
          </div>
          {precio.nota ? (
            <div
              style={{
                fontFamily: T.ui,
                fontWeight: 600,
                fontSize: 40 * u,
                marginTop: 14 * u,
                color: PALETA.blanco,
                opacity: 0.85 * expoOut((frame - llega - 4) / 12),
              }}
            >
              {precio.nota}
            </div>
          ) : null}
        </div>
      </div>
      <Destello en={llega} color={colores.antetitulo} duracion={10} />
    </ZonaSegura>
  );
};

/** Contador de ahorro: sube de $0 al monto con salida suave y una barra que se llena. */
export const Ahorro: React.FC<PropsEscena<'ahorro'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const T = tipos();
  const { monto, inicioEn, duracion } = props;
  const valor = valorContador(frame, inicioEn, duracion, monto);
  const t = expoOut((frame - inicioEn) / duracion);
  const llegada = inicioEn + duracion;
  const tamNumero = Math.min(300, 940 / anchoPrecioEm(formatoCLP(monto)));
  const impacto = Math.exp(-Math.max(0, frame - llegada) / 5) * (frame >= llegada ? 1 : 0);
  const chico: React.CSSProperties = {
    fontFamily: T.ui,
    fontWeight: 700,
    textAlign: 'center',
    color: PALETA.suave,
  };
  return (
    <ZonaSegura>
      <div
        style={{
          ...estiloEtiqueta(u, 42),
          color: PALETA.blanco,
          opacity: 0.85,
          ...entrada(frame, 2, u, { dur: 16, y: 26 }),
        }}
      >
        {props.antes}
      </div>
      <div
        style={{
          margin: `${18 * u}px 0 ${34 * u}px`,
          transform: `scale(${1 + 0.06 * impacto})`,
          ...entrada(frame, 4, u, { dur: 16, y: 30, escala: 0.96 }),
        }}
      >
        <Monto texto={formatoCLP(valor)} tam={tamNumero} u={u} />
      </div>
      <div
        style={{
          width: 760 * u,
          height: 12 * u,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.14)',
          overflow: 'hidden',
          ...entrada(frame, 6, u, { dur: 14, y: 12, blur: 4 }),
        }}
      >
        <div
          style={{
            width: `${t * 100}%`,
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${PALETA.indigo}, ${PALETA.violeta}, ${PALETA.ambar})`,
          }}
        />
      </div>
      {props.despues ? (
        <div
          style={{
            ...chico,
            fontSize: 44 * u,
            marginTop: 36 * u,
            ...entrada(frame, llegada, u, { dur: 14, y: 18, blur: 6 }),
          }}
        >
          {props.despues}
        </div>
      ) : null}
    </ZonaSegura>
  );
};

/** Sellos de confianza: tarjetas grandes con ícono que entran escalonadas, alternando de lado. */
export const Sellos: React.FC<PropsEscena<'sellos'>> = ({ props }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const T = tipos();
  return (
    <ZonaSegura>
      {props.titulo ? (
        <div
          style={{
            ...estiloDisplay(u, 96),
            textTransform: 'uppercase',
            color: PALETA.blanco,
            textAlign: 'center',
            marginBottom: 30 * u,
            textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.65)`,
            ...entrada(frame, 2, u, { dur: 16, y: 30 }),
          }}
        >
          {props.titulo}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * u }}>
        {props.sellos.map((sello, i) => {
          const Icono = iconos[sello.icono];
          const inicio = 8 + i * 6;
          return (
            <div
              key={i}
              style={{
                ...estiloTarjeta(u, 36),
                position: 'relative',
                width: 960 * u,
                height: 190 * u,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 32 * u,
                padding: `0 ${36 * u}px`,
                overflow: 'hidden',
                ...entrada(frame, inicio, u, { dur: 16, y: 34, escala: 0.96 }),
              }}
            >
              <div
                style={{
                  flex: 'none',
                  width: 112 * u,
                  height: 112 * u,
                  borderRadius: 30 * u,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(160deg, rgba(79,107,255,0.30), rgba(138,92,255,0.12))',
                  border: `${Math.max(1, u)}px solid rgba(255,255,255,0.14)`,
                }}
              >
                <Icono tam={64 * u} color={colores.blanco} acento={PALETA.ambar} />
              </div>
              <div>
                <div
                  style={{
                    ...estiloDisplay(u, 56),
                    textTransform: 'uppercase',
                    color: PALETA.blanco,
                    lineHeight: 1,
                  }}
                >
                  {sello.texto}
                </div>
                {sello.detalle ? (
                  <div
                    style={{
                      fontFamily: T.ui,
                      fontWeight: 600,
                      fontSize: 32 * u,
                      color: PALETA.suave,
                      marginTop: 10 * u,
                    }}
                  >
                    {sello.detalle}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </ZonaSegura>
  );
};

/** Tarjeta de producto inclinada (la portada oficial, tal cual) con un brillo que la recorre. */
const TarjetaProducto: React.FC<{
  id: string;
  alto: number;
  precio?: string;
  children?: React.ReactNode;
}> = ({ id, alto, precio, children }) => {
  const frame = useCuadro();
  const u = useU();
  const { colores } = useMarca();
  const img = useAsset(id);
  const t = resorte(frame, 4, { damping: 13, stiffness: 120 });
  const ancho = (alto * img.ancho) / img.alto;
  return (
    <div style={{ position: 'relative', perspective: 2000 * u, flex: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: -90 * u,
          background: `radial-gradient(closest-side, ${colores.indigo}AA, transparent)`,
          filter: 'blur(36px)',
          opacity: t,
        }}
      />
      <div
        style={{
          position: 'relative',
          width: ancho * u,
          height: alto * u,
          borderRadius: 26 * u,
          overflow: 'hidden',
          opacity: Math.min(1, t * 2),
          transform: `translateY(${Math.sin(frame / 24) * 8 * u + (1 - Math.min(t, 1)) * 120 * u}px) rotateY(${-16 + Math.sin(frame / 40) * 4}deg) rotateX(5deg) rotateZ(-3deg) scale(${0.8 + 0.2 * t})`,
          boxShadow: '0 60px 110px -20px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.28)',
        }}
      >
        <Img
          src={img.src}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'fill' }}
        />
        <Brillo en={30 + (frame - (frame % 100))} duracion={34} alfa={0.55} />
      </div>
      {precio ? (
        <div
          style={{
            ...estiloTarjeta(u, 26),
            position: 'absolute',
            // Fuera del arte oficial: solo pisa el borde derecho de la portada, cerca de su base.
            left: (ancho - 90) * u,
            top: alto * 0.7 * u,
            padding: `${12 * u}px ${28 * u}px ${16 * u}px`,
            transform: `rotate(5deg)`,
            ...entrada(frame, 24, u, { dur: 14, y: 20, escala: 0.9 }),
          }}
        >
          <Monto texto={precio} tam={92} u={u} />
        </div>
      ) : null}
      {children}
    </div>
  );
};

/** Cierre: logo, producto, mensaje y un botón enorme que respira con un brillo que lo cruza. */
export const Cierre: React.FC<PropsEscena<'cierre'>> = ({ props }) => {
  const { height } = useVideoConfig();
  const frame = useCuadro();
  const u = useU();
  const marca = useMarca();
  const { colores } = marca;
  const logo = useAsset(marca.logos.original ?? logoDe(marca, 'blanco'));
  const tLogo = expoOut((frame - 2) / 22);
  const ancloLogo = Math.min(1, Math.max(0, (frame - 6) / 24));
  const tMensaje = expoOut((frame - 14) / 18);
  const conImagen = props.imagen !== undefined;
  const mensaje = useTitular(
    u,
    props.mensaje ? Math.min(conImagen ? 120 : 170, ajustarTam(props.mensaje, 980, 0.68)) : 100,
  );
  return (
    <>
      <ZonaSegura desde={conImagen ? 260 : undefined} hasta={conImagen ? 1210 : undefined}>
        {props.logo ? (
          <div
            style={{
              position: 'relative',
              flex: 'none',
              width: 330 * u,
              height: 280 * u,
              margin: `${(conImagen ? 0 : 10) * u}px 0 ${(conImagen ? 10 : 30) * u}px`,
            }}
          >
            {ancloLogo > 0 && ancloLogo < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 330 * u,
                  height: 330 * u,
                  marginLeft: -165 * u,
                  marginTop: -165 * u,
                  borderRadius: '50%',
                  border: `${8 * (1 - ancloLogo) * u + 2}px solid ${colores.antetitulo}`,
                  opacity: 1 - ancloLogo,
                  transform: `scale(${0.5 + ancloLogo * 2.6})`,
                }}
              />
            ) : null}
            <Img
              src={logo.src}
              style={{
                width: '100%',
                height: '100%',
                opacity: Math.min(1, tLogo * 2),
                transform: `scale(${0.4 + 0.6 * tLogo}) translateY(${(1 - tLogo) * -60 * u}px)`,
                filter: `drop-shadow(0 0 ${(30 + 30 * Math.sin(frame / 12) ** 2) * u}px ${colores.indigo}DD)`,
              }}
            />
          </div>
        ) : null}
        {props.imagen ? (
          <div style={{ marginBottom: 60 * u, flex: 'none' }}>
            <TarjetaProducto id={props.imagen} alto={560} precio={props.precio}>
              {props.mensaje ? (
                <div
                  style={{
                    ...mensaje,
                    position: 'absolute',
                    left: '50%',
                    bottom: -60 * u,
                    width: 1000 * u,
                    marginLeft: -500 * u,
                    textAlign: 'center',
                    opacity: Math.min(1, tMensaje * 2),
                    transform: `translateY(${(1 - Math.min(tMensaje, 1)) * 80 * u}px)`,
                    filter: desenfoqueDe((1 - Math.min(tMensaje, 1)) * 18),
                    textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.95), 0 0 ${40 * u}px rgba(0,0,0,0.9)`,
                  }}
                >
                  {props.mensaje}
                </div>
              ) : null}
            </TarjetaProducto>
          </div>
        ) : null}
        {props.mensaje && !conImagen ? (
          <div
            style={{
              ...mensaje,
              textAlign: 'center',
              marginBottom: 24 * u,
              opacity: Math.min(1, tMensaje * 2),
              transform: `translateY(${(1 - Math.min(tMensaje, 1)) * 80 * u}px)`,
              filter: desenfoqueDe((1 - Math.min(tMensaje, 1)) * 18),
            }}
          >
            {props.mensaje}
          </div>
        ) : null}
        {props.precio && !conImagen ? (
          <div style={{ marginBottom: 36 * u, ...entrada(frame, 24, u, { dur: 16, y: 24 }) }}>
            <Monto
              texto={props.precio}
              tam={Math.min(300, 900 / anchoPrecioEm(props.precio))}
              u={u}
            />
          </div>
        ) : null}
        <Destello en={34} color={colores.indigo} duracion={14} />
      </ZonaSegura>
      <div
        style={{
          position: 'absolute',
          left: 90 * u,
          right: 90 * u,
          top: (1430 / 1920) * height,
          ...entrada(frame, 30, u, { dur: 18, y: 60, escala: 0.96 }),
        }}
      >
        <Boton texto={props.boton} u={u} ancho="100%" alto={124} tam={54} inicio={46} />
      </div>
    </>
  );
};
