"""Tests de la capa shots (M1): PySceneDetect → `shots[]` del VideoSpec.

Separa el converter PURO (`scenes_to_shots`, escenas en segundos → shots) del shell-out
(`detect_shots`, integración con AdaptiveDetector sobre el mp4 real, se salta si no está).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from plato_analyzer.schema import validate_spec
from plato_analyzer.shots import detect_shots, scenes_to_shots

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"


def test_scenes_to_shots_ids_and_transitions() -> None:
    shots = scenes_to_shots([(0.0, 1.458), (1.458, 4.417), (4.417, 5.833)])
    assert [s.id for s in shots] == ["shot_001", "shot_002", "shot_003"]
    assert shots[0].transitionIn == "open"  # el primero abre, no corta
    assert all(s.transitionIn == "cut" for s in shots[1:])


def test_scenes_to_shots_ms_and_duration() -> None:
    shots = scenes_to_shots([(0.0, 1.458), (1.458, 4.417)])
    assert shots[0].startMs == 0 and shots[0].endMs == 1458
    assert shots[0].durationMs == 1458
    assert shots[1].startMs == 1458 and shots[1].durationMs == 2959


def test_shots_are_contiguous() -> None:
    shots = scenes_to_shots([(0.0, 1.0), (1.0, 2.5), (2.5, 3.0)])
    for prev, nxt in zip(shots, shots[1:]):
        assert prev.endMs == nxt.startMs


def test_shot_to_dict_validates_in_spec() -> None:
    shots = scenes_to_shots([(0.0, 1.0), (1.0, 2.0)])
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 2000, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [s.to_dict() for s in shots],
    }
    result = validate_spec(spec)
    assert result.ok, result.errors
    assert spec["shots"][1]["transitionIn"] == {"type": "cut"}


def test_empty_scene_list_yields_no_shots() -> None:
    assert scenes_to_shots([]) == []


@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_detect_real_video_near_golden() -> None:
    shots = detect_shots(REAL_VIDEO)
    # AdaptiveDetector da ~63 (golden curado: 65). Banda de calibración honesta.
    assert 55 <= len(shots) <= 72, f"shots inesperados: {len(shots)}"
    assert shots[0].startMs == 0
    assert shots[0].transitionIn == "open"
    # primer corte coincide con el golden (shot_001 termina ~1458ms)
    assert abs(shots[0].endMs - 1458) <= 80
    # cobertura: el último shot llega cerca del fin (176376ms)
    assert shots[-1].endMs >= 170000
