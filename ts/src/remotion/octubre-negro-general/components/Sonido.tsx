import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';

import { FPS } from '../constants/theme';
import { DIR_SFX, DURACION_SFX, EFECTOS, VOLUMEN_VOZ, volumenMusica } from '../lib/sfx';

/** Música con ducking: el volumen depende del frame global (este componente cuelga de la raíz). */
const Musica = () => {
  const frame = useCurrentFrame();
  return <Audio src={staticFile('octubre-negro-general/musica.mp3')} volume={volumenMusica(frame)} />;
};

/** Voz + música con ducking + efectos del plan `EFECTOS`, cada uno en su `<Sequence>`. */
export const Sonido = () => (
  <>
    <Audio src={staticFile('octubre-negro-general/voz.mp3')} volume={VOLUMEN_VOZ} />
    <Musica />
    {EFECTOS.map((e, i) => (
      <Sequence
        key={`${e.archivo}-${e.frame}-${i}`}
        from={e.frame}
        durationInFrames={Math.ceil(DURACION_SFX[e.archivo]! * FPS)}
        layout="none"
      >
        <Audio src={staticFile(`${DIR_SFX}/${e.archivo}`)} volume={e.volumen} />
      </Sequence>
    ))}
  </>
);
