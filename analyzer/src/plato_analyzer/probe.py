"""Probe (M1): metadata real del video vía `ffprobe` → bloque `source` del VideoSpec.

Primer filtro determinístico del pipeline CV (ADR-0003/0004): sin Claude, sin red. El parseo
puro (`parse_probe`) se separa del shell-out (`probe`) para testear sin depender de ffprobe.
"""

from __future__ import annotations

import json
import subprocess
import unicodedata
from dataclasses import asdict, dataclass
from fractions import Fraction
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Source:
    """El bloque `source` del VideoSpec (ADR-0001). `fps` entero por contrato."""

    id: str
    filename: str
    durationMs: int
    fps: int
    width: int
    height: int
    codec: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def slug(text: str) -> str:
    """Slug ASCII estable: minúsculas, sin acentos, no-alfanumérico → '-'."""
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    out = []
    for ch in normalized.lower():
        out.append(ch if ch.isalnum() else "-")
    return "-".join(part for part in "".join(out).split("-") if part)


def _video_stream(data: dict[str, Any]) -> dict[str, Any]:
    for stream in data.get("streams", []):
        if stream.get("codec_type") == "video":
            return stream
    raise ValueError("ffprobe no encontró ningún stream de video")


def _fps(stream: dict[str, Any]) -> int:
    """Convierte 'r_frame_rate'/'avg_frame_rate' ('24/1', '30000/1001') a entero (round)."""
    raw = stream.get("avg_frame_rate") or stream.get("r_frame_rate") or "0/1"
    if raw in ("0/0", "0/1", "0"):
        raw = stream.get("r_frame_rate", "0/1")
    value = float(Fraction(raw)) if "/" in raw else float(raw)
    return int(round(value))


def parse_probe(data: dict[str, Any], filename: str, video_id: str) -> Source:
    """Parsea la salida JSON de ffprobe al bloque `source` (puro, testeable)."""
    stream = _video_stream(data)
    duration_s = float(data.get("format", {}).get("duration") or stream.get("duration") or 0.0)
    return Source(
        id=video_id,
        filename=filename,
        durationMs=int(round(duration_s * 1000)),
        fps=_fps(stream),
        width=int(stream["width"]),
        height=int(stream["height"]),
        codec=str(stream["codec_name"]),
    )


def probe(video: Path | str, video_id: str | None = None) -> Source:
    """Corre ffprobe sobre `video` y devuelve su bloque `source`."""
    path = Path(video)
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", "-show_streams", str(path),
    ]
    raw = subprocess.run(cmd, check=True, capture_output=True, text=True).stdout
    data = json.loads(raw)
    return parse_probe(data, filename=path.name, video_id=video_id or slug(path.stem))
