import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import { centro, corteDe } from '../../assets';
import { avance } from '../../kit/animacion';
import { ChatWhatsapp } from '../../kit/ChatWhatsapp';
import { Correo } from '../../kit/Correo';
import { CorreoYWhatsapp as Encuadre } from '../../kit/CorreoYWhatsapp';
import { Plano } from '../../kit/Plano';
import {
  framesDe,
  servir,
  useAsset,
  useProyecto,
  type AssetServido,
  type Escena,
} from '../../proyecto';
import { PREVIA_SCROLL, type PropsDe } from './esquemas';
import { mensajeDe, punteroDe, zonaRef } from './zonas';

/** Pantalla que entra sobre el chat desde la derecha (p. ej. el perfil tras tocar «Conoce a tu ejecutivo»). */
const PantallaSiguiente: React.FC<{ captura: AssetServido; ancho: number; inicio: number }> = ({
  captura,
  ancho,
  inicio,
}) => {
  const frame = useCurrentFrame();
  const t = avance(frame, inicio, 20);
  if (t <= 0) return null;
  return (
    <Img
      src={captura.src}
      style={{
        position: 'absolute',
        inset: 0,
        width: ancho,
        height: (ancho * captura.alto) / captura.ancho,
        transform: `translateX(${(1 - t) * ancho}px)`,
      }}
    />
  );
};

/** Un correo en tarjeta y un chat de WhatsApp cuyos globos (franjas de capturas reales) van llegando. */
export const CorreoYWhatsapp: React.FC<{ escena: Escena; props: PropsDe<'correoYWhatsapp'> }> = ({
  escena,
  props,
}) => {
  const { voz, indice } = useProyecto();
  const s = (id: string) => servir(indice, id);
  const correo = useAsset(props.correo.captura);
  const encabezado = useAsset(props.encabezado);
  const zonaCorreo = zonaRef(correo, props.correo.zona);
  const siguiente = props.pantallaSiguiente ? s(props.pantallaSiguiente.captura) : undefined;
  return (
    <Plano escena={escena}>
      <Encuadre
        inicioTelefono={props.inicioTelefono}
        correo={(ancho, altoVisible) => (
          <Correo
            captura={correo}
            ancho={ancho}
            altoVisible={altoVisible}
            duracion={framesDe(escena, voz)}
            desplazamiento={[
              { frame: 0, foco: 0 },
              { frame: props.correo.enfocarEn - PREVIA_SCROLL, foco: 0 },
              { frame: props.correo.enfocarEn, foco: centro(zonaCorreo).y },
            ]}
            resaltados={[{ zona: zonaCorreo, inicio: props.correo.resaltarEn }]}
            puntero={punteroDe(correo, props.correo.puntero)}
          />
        )}
        telefono={(ancho) => (
          <ChatWhatsapp
            ancho={ancho}
            encabezado={{ captura: encabezado, hasta: corteDe(encabezado, 'encabezado') }}
            mensajes={props.mensajes.map((m) => mensajeDe(s, m))}
            pantallaSiguiente={
              siguiente && props.pantallaSiguiente ? (
                <PantallaSiguiente
                  captura={siguiente}
                  ancho={ancho}
                  inicio={props.pantallaSiguiente.inicio}
                />
              ) : undefined
            }
          />
        )}
      />
    </Plano>
  );
};
