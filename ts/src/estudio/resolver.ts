import { asset, crearIndice } from './assets';
import { manifiestos, marcas, proyectos } from './datos.generated';
import { resolverMarca } from './marca';
import { guionSchema, proyectoSchema, vozSchema, type ProyectoResuelto } from './proyecto';
import { errorLocucion, esClipConAudio, vozDeClip } from './tipos/redes/clipAudio';
import { resolverGuion, validarFormatos, validarFps, type EscenaResuelta } from './tipos';

const cache = new Map<string, ProyectoResuelto & { escenas: EscenaResuelta[] }>();

/** Carga y valida un proyecto del estudio (marca, guion, voz, assets). Falla con mensajes claros. */
export const resolverProyecto = (id: string): ProyectoResuelto & { escenas: EscenaResuelta[] } => {
  const enCache = cache.get(id);
  if (enCache) return enCache;
  const datos = proyectos[id];
  if (!datos) throw new Error(`Proyecto desconocido: ${id} (¿corriste «estudio indexar»?)`);
  const proyecto = proyectoSchema.parse(datos.proyecto);
  const marcaDatos = marcas[proyecto.marca];
  if (!marcaDatos) throw new Error(`${id}: la marca «${proyecto.marca}» no existe`);
  validarFps(proyecto.tipo, proyecto.fps);
  validarFormatos(proyecto.tipo, proyecto.formatos);
  const guion = guionSchema.parse(datos.guion);
  const indice = crearIndice(manifiestos);
  // La duración de cada toma sale de su ficha en el manifiesto, no de la copia en voz.json.
  const voz = Object.fromEntries(
    Object.entries(vozSchema.parse(datos.voz)).map(([escena, v]) => {
      const segundos = asset(indice, v.asset).segundos;
      if (!segundos)
        throw new Error(
          `${id}: la voz de «${escena}» (${v.asset}) no tiene duración en el manifiesto`,
        );
      return [escena, { ...v, segundos }];
    }),
  );
  // El audio de un clip de «redes» hace de voz: duración, ducking y subtítulos salen de ahí.
  if (proyecto.tipo === 'redes') {
    for (const escena of guion.escenas) {
      const error = errorLocucion(escena);
      if (error) throw new Error(`${id}: ${error}`);
      if (esClipConAudio(escena)) {
        const video = asset(indice, escena.props.video as string);
        if (!video.segundos)
          throw new Error(
            `${id}: el clip de «${escena.id}» (${video.id}) no tiene duración en el manifiesto`,
          );
        voz[escena.id] = vozDeClip(escena, video.segundos);
      }
    }
  }
  const resuelto = {
    proyecto,
    guion,
    voz,
    marca: resolverMarca(marcaDatos),
    indice,
    escenas: resolverGuion(guion, proyecto.tipo),
  };
  cache.set(id, resuelto);
  return resuelto;
};

export const idsProyectos = (): string[] => Object.keys(proyectos);
