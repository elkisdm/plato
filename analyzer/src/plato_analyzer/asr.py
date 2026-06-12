"""Transcripción de audio con Whisper local (faster-whisper, ADR-0006).

Es el primer paso REAL del pipeline (M3): mecaniza la capa de texto hablado. El output
mapea a `captions` / `audio.transcriptRef` del VideoSpec. Local por defecto: sin red, sin
costo, privado. La primera corrida descarga los pesos del modelo.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class Word:
    startMs: int
    endMs: int
    text: str
    prob: float


@dataclass(frozen=True)
class Segment:
    startMs: int
    endMs: int
    text: str
    words: tuple[Word, ...] = ()


@dataclass(frozen=True)
class Transcript:
    language: str
    durationMs: int
    segments: tuple[Segment, ...]

    @property
    def full_text(self) -> str:
        return " ".join(s.text.strip() for s in self.segments).strip()


def transcribe(
    media: Path | str,
    model_size: str = "small",
    language: str | None = "es",
    word_timestamps: bool = True,
    vad_filter: bool = True,
) -> Transcript:
    """Transcribe el audio de un archivo (acepta el mp4 directo; decodifica vía PyAV).

    model_size: tiny|base|small|medium|large-v3. `small` es buen balance es/velocidad en CPU.
    """
    # Import perezoso: faster-whisper carga ctranslate2/onnx; no penalizar `plato validate`.
    from faster_whisper import WhisperModel

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    seg_iter, info = model.transcribe(
        str(media),
        language=language,
        word_timestamps=word_timestamps,
        vad_filter=vad_filter,
    )

    segments = tuple(_to_segment(s) for s in seg_iter)
    return Transcript(
        language=info.language,
        durationMs=int(round(info.duration * 1000)),
        segments=segments,
    )


def _to_segment(s: object) -> Segment:
    words: tuple[Word, ...] = ()
    raw_words = getattr(s, "words", None)
    if raw_words:
        words = tuple(
            Word(
                startMs=int(round(w.start * 1000)),
                endMs=int(round(w.end * 1000)),
                text=w.word.strip(),
                prob=round(float(w.probability), 3),
            )
            for w in raw_words
        )
    return Segment(
        startMs=int(round(s.start * 1000)),
        endMs=int(round(s.end * 1000)),
        text=s.text.strip(),
        words=words,
    )
