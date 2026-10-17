import React from 'react';
import { ChatWhatsapp } from '../../kit/ChatWhatsapp';
import { Lupa } from '../../kit/Lupa';
import { Plano } from '../../kit/Plano';
import { TelefonoConLupa } from '../../kit/TelefonoConLupa';
import { corteDe } from '../../assets';
import { servir, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';
import { mensajeDe, punteroDe, resaltadosDe, zonaRef } from './zonas';

/** Un chat en el teléfono y el detalle ampliado de lo importante sobre su parte libre. */
export const ChatConLupa: React.FC<{ escena: Escena; props: PropsDe<'chatConLupa'> }> = ({
  escena,
  props,
}) => {
  const { indice } = useProyecto();
  const s = (id: string) => servir(indice, id);
  const encabezado = s(props.encabezado);
  const lupa = s(props.lupa.captura);
  return (
    <Plano escena={escena}>
      <TelefonoConLupa
        telefono={(ancho) => (
          <ChatWhatsapp
            ancho={ancho}
            encabezado={{ captura: encabezado, hasta: corteDe(encabezado, 'encabezado') }}
            mensajes={props.mensajes.map((m) => mensajeDe(s, m))}
          />
        )}
        lupa={(ancho) => (
          <Lupa
            captura={lupa}
            zona={zonaRef(lupa, props.lupa.zona)}
            ancho={ancho}
            inicio={props.lupa.inicio}
            resaltados={resaltadosDe(lupa, props.lupa.resaltados)}
            puntero={punteroDe(lupa, props.lupa.puntero)}
          />
        )}
      />
    </Plano>
  );
};
