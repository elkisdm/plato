"""Shots (M1): detección de cortes con PySceneDetect → `shots[]` del VideoSpec.

Segundo filtro determinístico del CV (ADR-0003/0007: el CV localiza, hace lo geométrico).
`AdaptiveDetector` capta los cortes duros (validado: 63 escenas vs 65 del golden curado, con
los boundaries iniciales idénticos). Dissolves/flashes son una capa de etiquetado posterior.

El converter puro (`scenes_to_shots`) se separa del shell-out (`detect_shots`) para testear
sin decodificar video.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence


@dataclass(frozen=True)
class Shot:
    """Un shot: identidad temporal + tipo de transición de entrada (lo geométrico)."""

    id: str
    startMs: int
    endMs: int
    durationMs: int
    transitionIn: str  # "open" (primer shot) | "cut" (default de AdaptiveDetector)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "startMs": self.startMs,
            "endMs": self.endMs,
            "durationMs": self.durationMs,
            "transitionIn": {"type": self.transitionIn},
        }


def scenes_to_shots(scenes: Sequence[tuple[float, float]]) -> list[Shot]:
    """Convierte escenas (start, end) en segundos a `shots[]` con ids y transitionIn.

    El primer shot es `open` (no hay corte que lo inicie); el resto, `cut`.
    """
    shots: list[Shot] = []
    for i, (start_s, end_s) in enumerate(scenes, start=1):
        start_ms = int(round(start_s * 1000))
        end_ms = int(round(end_s * 1000))
        shots.append(
            Shot(
                id=f"shot_{i:03d}",
                startMs=start_ms,
                endMs=end_ms,
                durationMs=end_ms - start_ms,
                transitionIn="open" if i == 1 else "cut",
            )
        )
    return shots


def detect_shots(video: Path | str, detector: Any = None) -> list[Shot]:
    """Corre PySceneDetect (AdaptiveDetector por defecto) y devuelve los shots."""
    from scenedetect import AdaptiveDetector, detect

    scene_list = detect(str(video), detector or AdaptiveDetector())
    # frame_num/framerate evita get_seconds()/get_frames() (deprecados en scenedetect 0.7).
    scenes = [
        (start.frame_num / start.framerate, end.frame_num / end.framerate)
        for start, end in scene_list
    ]
    return scenes_to_shots(scenes)
