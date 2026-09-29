/**
 * Carga de Geist y Geist Mono (variables, OFL) desde public/fonts/geist/.
 * El render espera a que ambas estén listas: delayRender hasta que las
 * FontFace resuelven, así ningún frame sale con la fuente de sistema.
 */

import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

const FACES = [
  { family: 'Geist', file: 'fonts/geist/geist-latin-wght-normal.woff2' },
  { family: 'Geist Mono', file: 'fonts/geist/geist-mono-latin-wght-normal.woff2' },
];

let loaded: Promise<void> | null = null;

export function loadFonts(): Promise<void> {
  if (loaded) return loaded;
  const handle = delayRender('Fuentes Geist', { timeoutInMilliseconds: 60_000 });
  loaded = Promise.all(
    FACES.map(async ({ family, file }) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {
        weight: '100 900',
      });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((e: unknown) => cancelRender(e));
  return loaded;
}
