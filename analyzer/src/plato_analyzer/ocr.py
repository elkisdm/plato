"""OCR de texto gráfico sobre frames (Tesseract local).

Complementa a `asr.py`: el ASR mecaniza el texto HABLADO; el OCR mecaniza el texto GRÁFICO
(énfasis de collage, kickers que no se pronuncian) y confirma el render on-screen. Mapea a
`captions` / `textOverlays` del VideoSpec.

PRD §8.2: PaddleOCR > Tesseract para tipografía estilizada, con fallback a visión. Arrancamos
con Tesseract (ya instalado, cero fricción) para MEDIR honestamente dónde el OCR clásico sirve
y dónde necesita la capa de visión (ADR-0007).
"""

from __future__ import annotations

import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class OcrFrame:
    atMs: int
    text: str
    framePath: str | None = None


def extract_frame(video: Path | str, ms: int, dst: Path) -> Path:
    """Extrae un frame del video al milisegundo dado (seek rápido vía ffmpeg)."""
    seconds = ms / 1000.0
    cmd = [
        "ffmpeg", "-nostdin", "-y", "-v", "error",
        "-ss", f"{seconds:.3f}",
        "-i", str(video),
        "-frames:v", "1", "-q:v", "2",
        str(dst),
    ]
    subprocess.run(cmd, check=True)
    return dst


def ocr_image(image: Path | str, lang: str = "spa") -> str:
    """OCR sobre una imagen con Tesseract."""
    import pytesseract
    from PIL import Image

    with Image.open(image) as im:
        raw = pytesseract.image_to_string(im, lang=lang)
    # Tesseract devuelve mucho salto de línea/espacio; normalizamos a una línea legible.
    return " ".join(raw.split())


def ocr_at(video: Path | str, ms: int, lang: str = "spa", keep_frame: Path | None = None) -> OcrFrame:
    """Extrae el frame en `ms` y lo pasa por OCR."""
    if keep_frame is not None:
        frame = extract_frame(video, ms, keep_frame)
        text = ocr_image(frame, lang=lang)
        return OcrFrame(atMs=ms, text=text, framePath=str(frame))

    with tempfile.TemporaryDirectory() as tmp:
        frame = extract_frame(video, ms, Path(tmp) / "frame.png")
        text = ocr_image(frame, lang=lang)
        return OcrFrame(atMs=ms, text=text, framePath=None)
