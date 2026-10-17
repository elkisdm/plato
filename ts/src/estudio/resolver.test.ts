import { describe, expect, it, vi } from 'vitest';
import { resolverProyecto } from './resolver';

// Índice de prueba: la marca y el guion del ejemplo, con una voz cuya ficha vive en un manifiesto
// (el ejemplo público no trae voz ni binarios).
vi.mock('./datos.generated', async () => {
  const marca = (await import('../../../estudio/marcas/ejemplo/marca.json')).default;
  const proyecto = (await import('../../../estudio/proyectos/ejemplo/proyecto.json')).default;
  const guion = (await import('../../../estudio/proyectos/ejemplo/guion.json')).default;
  const ficha = (id: string, segundos?: number) => ({
    id,
    archivo: `${id}.mp3`,
    tipo: 'audio',
    sha256: '0'.repeat(64),
    origen: {},
    ...(segundos ? { segundos } : {}),
  });
  const conVoz = (id: string, asset: string) => ({
    proyecto: { ...proyecto, id },
    guion,
    // La copia de la duración en voz.json está desactualizada a propósito (99 s).
    voz: { saludo: { asset, segundos: 99 } },
  });
  return {
    manifiestos: [
      { assets: [ficha('ejemplo/voz-saludo', 2.5), ficha('ejemplo/voz-sin-duracion')] },
    ],
    marcas: { ejemplo: marca },
    proyectos: {
      'con-voz': conVoz('con-voz', 'ejemplo/voz-saludo'),
      'voz-sin-duracion': conVoz('voz-sin-duracion', 'ejemplo/voz-sin-duracion'),
    },
  };
});

describe('resolverProyecto', () => {
  it('la duración de cada voz sale del manifiesto, no de la copia en voz.json', () => {
    expect(resolverProyecto('con-voz').voz.saludo?.segundos).toBe(2.5);
  });

  it('una voz sin duración en el manifiesto falla con la escena y el asset', () => {
    expect(() => resolverProyecto('voz-sin-duracion')).toThrow(
      /voz de «saludo» \(ejemplo\/voz-sin-duracion\) no tiene duración/,
    );
  });

  it('un proyecto que no está en el índice falla con su id', () => {
    expect(() => resolverProyecto('no-existe')).toThrow(/Proyecto desconocido: no-existe/);
  });
});
