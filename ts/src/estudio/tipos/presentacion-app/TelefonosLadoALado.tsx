import React from 'react';
import { corteDe } from '../../assets';
import { Aparicion } from '../../kit/Aparicion';
import { ChatWhatsapp } from '../../kit/ChatWhatsapp';
import { useVertical } from '../../kit/formato';
import { Lupa } from '../../kit/Lupa';
import { Plano } from '../../kit/Plano';
import { useMarca } from '../../marca';
import { servir, useProyecto, type Escena } from '../../proyecto';
import type { PropsDe } from './esquemas';
import { mensajeDe, punteroDe, resaltadosDe, zonaRef } from './zonas';

/** Chats lado a lado (p. ej. lo que recibe el cliente y lo que recibe el equipo), cada uno con su lupa. */
export const TelefonosLadoALado: React.FC<{
  escena: Escena;
  props: PropsDe<'telefonosLadoALado'>;
}> = ({ escena, props }) => {
  const vertical = useVertical();
  const { colores, fuentes } = useMarca();
  const { indice } = useProyecto();
  const s = (id: string) => servir(indice, id);
  const ancho = vertical ? 420 : 380;
  return (
    <Plano escena={escena}>
      <div style={{ display: 'flex', gap: vertical ? 40 : 56 }}>
        {props.lados.map((lado) => {
          const encabezado = s(lado.encabezado);
          const primero = lado.mensajes[0]?.inicio ?? 0;
          const lupa = lado.lupa ? s(lado.lupa.captura) : undefined;
          return (
            <div key={lado.etiqueta} style={{ position: 'relative' }}>
              <Aparicion inicio={primero - 8}>
                <div
                  style={{
                    fontFamily: fuentes.ui,
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: colores.cian,
                    textAlign: 'center',
                    marginBottom: 20,
                  }}
                >
                  {lado.etiqueta}
                </div>
                <ChatWhatsapp
                  ancho={ancho}
                  encabezado={{ captura: encabezado, hasta: corteDe(encabezado, 'encabezado') }}
                  mensajes={lado.mensajes.map((m) => mensajeDe(s, m))}
                />
              </Aparicion>
              {lado.lupa && lupa ? (
                <Lupa
                  captura={lupa}
                  zona={zonaRef(lupa, lado.lupa.zona)}
                  ancho={ancho + 60}
                  inicio={lado.lupa.inicio}
                  resaltados={resaltadosDe(lupa, lado.lupa.resaltados)}
                  puntero={punteroDe(lupa, lado.lupa.puntero)}
                  style={{ position: 'absolute', left: -18, bottom: 60 }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </Plano>
  );
};
