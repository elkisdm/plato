"""Audio (M3): loudness integrado (LUFS) + silencios vía ffmpeg → bloque `audio`.

Filtro determinístico del CV (números honestos, ADR-0007). Usa los filtros nativos de ffmpeg
(`loudnorm`, `silencedetect`) en vez de librosa: cero dependencias nuevas, ya que ffmpeg es
requisito del proyecto. Los parsers (`parse_loudness`/`parse_silences`) son puros y testeables;
`analyze_audio` corre ffmpeg.
"""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

_LUFS_RE = re.compile(r"Input Integrated:\s*(-?\d+(?:\.\d+)?)\s*LUFS")
_SIL_START_RE = re.compile(r"silence_start:\s*(-?\d+(?:\.\d+)?)")
_SIL_END_RE = re.compile(r"silence_end:\s*(-?\d+(?:\.\d+)?)")


@dataclass(frozen=True)
class Audio:
    """El bloque `audio` del VideoSpec. `silences`/`loudnessLufs` requeridos por contrato."""

    loudnessLufs: float
    silences: list[dict[str, int]] = field(default_factory=list)
    transcriptRef: str | None = None
    beatsMs: list[int] | None = None
    notes: str | None = None

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {
            "silences": self.silences,
            "loudnessLufs": self.loudnessLufs,
            "transcriptRef": self.transcriptRef,
            "beatsMs": self.beatsMs,
        }
        if self.notes is not None:
            out["notes"] = self.notes
        return out


def parse_loudness(loudnorm_output: str) -> float:
    """Extrae 'Input Integrated: -14.2 LUFS' del resumen de loudnorm."""
    match = _LUFS_RE.search(loudnorm_output)
    if not match:
        raise ValueError("ffmpeg loudnorm no reportó 'Input Integrated' LUFS")
    return float(match.group(1))


def parse_silences(silencedetect_output: str) -> list[dict[str, int]]:
    """Empareja silence_start/silence_end (segundos) → [{startMs, endMs}].

    Un `silence_start` sin su `silence_end` (silencio abierto al cortar) se descarta.
    """
    starts = [float(m) for m in _SIL_START_RE.findall(silencedetect_output)]
    ends = [float(m) for m in _SIL_END_RE.findall(silencedetect_output)]
    pairs = []
    for start, end in zip(starts, ends):
        pairs.append({"startMs": int(round(start * 1000)), "endMs": int(round(end * 1000))})
    return pairs


def _run_ffmpeg_filter(video: Path | str, audio_filter: str) -> str:
    """Corre ffmpeg con un filtro de audio sin salida (-f null) y devuelve su stderr."""
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-i", str(video), "-af", audio_filter, "-f", "null", "-"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stderr


def analyze_audio(
    video: Path | str,
    silence_db: int = -35,
    min_silence_s: float = 0.5,
) -> Audio:
    """Mide loudness integrado (LUFS) y silencios (≥ `min_silence_s` bajo `silence_db`)."""
    loudness = parse_loudness(_run_ffmpeg_filter(video, "loudnorm=print_format=summary"))
    silences = parse_silences(
        _run_ffmpeg_filter(video, f"silencedetect=noise={silence_db}dB:d={min_silence_s}")
    )
    return Audio(loudnessLufs=loudness, silences=silences)
