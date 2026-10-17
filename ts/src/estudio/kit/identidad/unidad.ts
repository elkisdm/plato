import { useVideoConfig } from 'remotion';

/**
 * Unidad de diseño del kit de identidad: todo se dibuja para un lienzo de 1080 px de ancho (vertical
 * 9:16 o retrato 4:5) y escala con la composición. En horizontal manda el alto, así el contenido no
 * se desborda.
 */
export const useUnidad = (): { u: number; ancho: number; alto: number } => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width / 1080, height / 1350), ancho: width, alto: height };
};
