import { useVideoConfig } from 'remotion';

/** Las escenas se reencuadran según la composición: 16:9, 9:16 o retrato 4:5 (más alto que ancho, así que cuenta como vertical). */
export const useVertical = (): boolean => {
  const { width, height } = useVideoConfig();
  return height > width;
};
