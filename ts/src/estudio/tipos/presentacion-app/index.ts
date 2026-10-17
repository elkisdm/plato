import type React from 'react';
import type { Escena } from '../../proyecto';
import { ChatConLupa } from './ChatConLupa';
import { CambioMundo } from './CambioMundo';
import { Cierre } from './Cierre';
import { Convergencia } from './Convergencia';
import { CorreoYWhatsapp } from './CorreoYWhatsapp';
import { Cuadricula } from './Cuadricula';
import { Diagrama } from './Diagrama';
import { Frases } from './Frases';
import { Hilo } from './Hilo';
import { esquemas, type NombreEscena } from './esquemas';
import { Gancho } from './Gancho';
import { Llamado } from './Llamado';
import { NavegadorYTelefono } from './NavegadorYTelefono';
import { Notificacion } from './Notificacion';
import { OndaVoz } from './OndaVoz';
import { Pasos } from './Pasos';
import { Portada } from './Portada';
import { Recorrido } from './Recorrido';
import { Regreso } from './Regreso';
import { Revelacion } from './Revelacion';
import { TelefonosLadoALado } from './TelefonosLadoALado';
import { Titulo } from './Titulo';
import { Videollamada } from './Videollamada';

type ComponenteEscena = React.FC<{ escena: Escena; props: never }>;

/** Catálogo del tipo «presentación de apps»: esquema de props + componente de cada escena. */
export const presentacionApp = {
  id: 'presentacion-app',
  esquemas,
  componentes: {
    gancho: Gancho,
    pasos: Pasos,
    recorrido: Recorrido,
    correoYWhatsapp: CorreoYWhatsapp,
    cuadricula: Cuadricula,
    llamado: Llamado,
    portada: Portada,
    cierre: Cierre,
    chatConLupa: ChatConLupa,
    telefonosLadoALado: TelefonosLadoALado,
    navegadorYTelefono: NavegadorYTelefono,
    videollamada: Videollamada,
    ondaVoz: OndaVoz,
    diagrama: Diagrama,
    notificacion: Notificacion,
    revelacion: Revelacion,
    titulo: Titulo,
    hilo: Hilo,
    cambioMundo: CambioMundo,
    frases: Frases,
    convergencia: Convergencia,
    regreso: Regreso,
  } satisfies Record<NombreEscena, unknown> as unknown as Record<NombreEscena, ComponenteEscena>,
};
