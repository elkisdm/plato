import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { logoDe, useMarca } from '../../marca';
import { useAsset } from '../../proyecto';
import { avance } from '../animacion';
import { useCuadro } from '../tiempo';
import { useUnidad } from './unidad';

type Props = {
  /** Id del isotipo; por defecto `marca.identidad.isotipo`. Sin ninguno, solo entra el logo. */
  isotipo?: string;
  /** Id del logo completo; por defecto el logo blanco de la marca. */
  logo?: string;
};

/**
 * Firma de la marca (~45 cuadros): el isotipo entra con escala y una máscara circular que se abre
 * y se funde en el logo completo (que ya lo lleva). Sin isotipo, entra solo el logo.
 */
export const FirmaLogo: React.FC<Props> = ({ isotipo, logo }) => {
  const marca = useMarca();
  const { colores } = marca;
  const frame = useCuadro();
  const { u } = useUnidad();
  const idLogo = logo ?? logoDe(marca, 'blanco');
  const idIsotipo = isotipo ?? marca.identidad?.isotipo;
  const wordmark = useAsset(idLogo);
  const iso = useAsset(idIsotipo ?? idLogo);

  const reveal = avance(frame, 0, 22);
  const texto = avance(frame, 18, 22);
  const anchoWordmark = 560 * u;
  const tamIso = 260 * u;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 30% at 50% 50%, ${colores.indigo}55, transparent 70%)`,
          opacity: reveal,
        }}
      />
      {idIsotipo ? (
        <Img
          src={iso.src}
          style={{
            position: 'absolute',
            width: tamIso,
            height: tamIso,
            objectFit: 'contain',
            opacity: 1 - texto,
            transform: `scale(${(0.6 + 0.4 * reveal) * (1 + 0.1 * texto)})`,
            clipPath: `circle(${reveal * 75}% at 50% 50%)`,
          }}
        />
      ) : null}
      <Img
        src={wordmark.src}
        style={{
          position: 'absolute',
          width: anchoWordmark,
          opacity: texto,
          transform: `scale(${0.94 + 0.06 * texto})`,
          filter: `blur(${(1 - texto) * 8}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
