export type IntensidadVelo = 'suave' | 'fuerte' | 'foto';

type Paleta = { noche: string; indigo: string };

/**
 * Capas del velo de marca. `suave` (por defecto sobre video real) no tiñe la toma: solo degradados
 * donde va texto (título arriba, subtítulos abajo) y 10 % de oscurecimiento. `fuerte` es igual con
 * 25 % de oscurecimiento, para escenas con mucho texto. `foto` es el velo largo de siempre (tinte
 * índigo y degradados más extensos) que usan las fotos y el clip sin fondo.
 */
export const capasVelo = (
  intensidad: IntensidadVelo,
  { noche, indigo }: Paleta,
): { tinte: string | null; global: string | null; degradados: string } => {
  if (intensidad === 'foto')
    return {
      tinte: `${indigo}22`,
      global: null,
      degradados: `linear-gradient(to top, ${noche}F2 0%, ${noche}AA 32%, transparent 62%), linear-gradient(to bottom, ${noche}E6 0%, ${noche}99 22%, transparent 46%)`,
    };
  return {
    tinte: null,
    global: `${noche}${intensidad === 'fuerte' ? '40' : '1A'}`,
    degradados: `linear-gradient(to top, ${noche}D9 0%, ${noche}80 18%, transparent 35%), linear-gradient(to bottom, ${noche}CC 0%, ${noche}66 18%, transparent 35%)`,
  };
};
