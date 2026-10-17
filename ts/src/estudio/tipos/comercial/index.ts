import type React from 'react';
import type { Escena } from '../../proyecto';
import { Agenda, Canales, Cierre, Conversacion, Grafica, Llamada, Saludo } from './Escenas';
import { esquemas, type NombreEscena } from './esquemas';
import { FondoComercial } from './FondoComercial';

type ComponenteEscena = React.FC<{ escena: Escena; props: never }>;

/** Catálogo del tipo «comercial»: motion graphics que cuentan qué hace un producto, sin capturas. */
export const comercial = {
  id: 'comercial',
  esquemas,
  fondo: FondoComercial,
  admite60: true,
  componentes: {
    saludo: Saludo,
    llamada: Llamada,
    canales: Canales,
    conversacion: Conversacion,
    agenda: Agenda,
    grafica: Grafica,
    cierre: Cierre,
  } satisfies Record<NombreEscena, unknown> as unknown as Record<NombreEscena, ComponenteEscena>,
};
