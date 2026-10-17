// GENERADO por `node tools/estudio.mjs indexar`. No editar a mano.
/* eslint-disable */
const biblioteca = { assets: [] };
import marca_ejemplo from '../../../estudio/marcas/ejemplo/marca.json';
import assetsMarca_ejemplo from '../../../estudio/marcas/ejemplo/assets.json';
import proyecto_ejemplo from '../../../estudio/proyectos/ejemplo/proyecto.json';
import guion_ejemplo from '../../../estudio/proyectos/ejemplo/guion.json';
import assets_ejemplo from '../../../estudio/proyectos/ejemplo/assets.json';
import voz_ejemplo from '../../../estudio/proyectos/ejemplo/voz.json';

export const manifiestos: unknown[] = [biblioteca, assetsMarca_ejemplo, assets_ejemplo];

export const marcas: Record<string, unknown> = {
  ejemplo: marca_ejemplo,
};

export const proyectos: Record<string, { proyecto: unknown; guion: unknown; voz: unknown }> = {
  ejemplo: { proyecto: proyecto_ejemplo, guion: guion_ejemplo, voz: voz_ejemplo },
};
