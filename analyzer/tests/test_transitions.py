"""Tests de la capa transitions (M1+): re-etiquetado del tipo de transición de entrada.

Separa la lógica PURA (`classify_transition`, decide flash_cut/dissolve/cut a partir de
estadísticas sintéticas de la ventana del corte) del shell-out (`relabel_shot_transitions`,
integración con cv2 sobre el mp4 real, se salta si no está).

Patrón calcado de test_shots.py / test_probe.py.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from plato_analyzer.schema import validate_spec
from plato_analyzer.shots import scenes_to_shots
from plato_analyzer.transitions import (
    BoundaryStats,
    classify_transition,
    relabel_shot_transitions,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"


# --------------------------------------------------------------------------- #
# Lógica pura: classify_transition
# --------------------------------------------------------------------------- #
def test_flash_cut_detected_by_near_white_frame() -> None:
    """Un frame casi blanco (luma ≥ 245) en la ventana del corte ⇒ flash_cut."""
    stats = BoundaryStats(
        luma=[30.0, 28.0, 252.0, 26.0, 31.0],  # destello blanco al centro
        hist_diffs=[0.10, 0.90, 0.88, 0.12],
    )
    assert classify_transition(stats) == "flash_cut"


def test_flash_cut_takes_priority_over_dissolve() -> None:
    """El blanco manda: aunque la diferencia se reparta, un frame ~blanco ⇒ flash_cut."""
    stats = BoundaryStats(
        luma=[40.0, 120.0, 248.0, 130.0, 45.0],
        hist_diffs=[0.30, 0.35, 0.33, 0.31],  # repartido (parecería dissolve)
    )
    assert classify_transition(stats) == "flash_cut"


def test_dissolve_detected_by_gradual_histogram_change() -> None:
    """Cambio gradual repartido en varios frames, sin un salto dominante ⇒ dissolve."""
    stats = BoundaryStats(
        luma=[80.0, 85.0, 90.0, 95.0, 100.0],  # sin blancos
        hist_diffs=[0.28, 0.31, 0.30, 0.29],  # ninguno domina, todos medios
    )
    assert classify_transition(stats) == "dissolve"


def test_cut_detected_by_single_hard_jump() -> None:
    """Un único salto seco que domina la diferencia total ⇒ cut."""
    stats = BoundaryStats(
        luma=[60.0, 62.0, 61.0, 180.0, 178.0],  # sin blancos (180 < 245)
        hist_diffs=[0.04, 0.05, 0.95, 0.03],  # un salto domina
    )
    assert classify_transition(stats) == "cut"


def test_cut_when_nothing_changes_much() -> None:
    """Diferencias bajas y sin blancos ⇒ cut (default seguro)."""
    stats = BoundaryStats(
        luma=[100.0, 101.0, 99.0, 100.0, 102.0],
        hist_diffs=[0.02, 0.03, 0.01, 0.02],
    )
    assert classify_transition(stats) == "cut"


def test_white_threshold_boundary_is_inclusive() -> None:
    """El umbral de blanco es ≥ 245 (inclusivo); 244 NO dispara flash_cut."""
    below = BoundaryStats(luma=[20.0, 244.0, 22.0], hist_diffs=[0.5, 0.5])
    assert classify_transition(below) != "flash_cut"
    at = BoundaryStats(luma=[20.0, 245.0, 22.0], hist_diffs=[0.5, 0.5])
    assert classify_transition(at) == "flash_cut"


def test_empty_stats_falls_back_to_cut() -> None:
    """Sin datos suficientes ⇒ cut (no inventamos transición)."""
    assert classify_transition(BoundaryStats(luma=[], hist_diffs=[])) == "cut"


# --------------------------------------------------------------------------- #
# Re-etiquetado puro sobre shots (sin video): relabel con stats inyectadas
# --------------------------------------------------------------------------- #
def test_relabel_preserves_open_and_skeleton() -> None:
    """El primer shot sigue 'open'; ids/tiempos intactos; solo cambia transitionIn."""
    shots = scenes_to_shots([(0.0, 1.0), (1.0, 2.0), (2.0, 3.0)])

    def fake_stats(_video: object, _shot: object) -> BoundaryStats:
        # Boundary del shot_002 = flash; shot_003 = cut.
        return BoundaryStats(luma=[10.0, 250.0, 10.0], hist_diffs=[0.5, 0.5])

    # Inyectamos un stats_fn distinto por shot vía closure con contador.
    seen: list[int] = []

    def stats_fn(_video: object, shot: object) -> BoundaryStats:
        seen.append(1)
        if len(seen) == 1:
            return BoundaryStats(luma=[10.0, 250.0, 10.0], hist_diffs=[0.5, 0.5])
        return BoundaryStats(luma=[60.0, 61.0, 180.0, 179.0], hist_diffs=[0.03, 0.95, 0.02])

    out = relabel_shot_transitions(shots, video="ignored.mp4", stats_fn=stats_fn)

    assert out[0].transitionIn == "open"  # intacto, ni se mira
    assert out[1].transitionIn == "flash_cut"
    assert out[2].transitionIn == "cut"
    # esqueleto intacto
    assert [s.id for s in out] == ["shot_001", "shot_002", "shot_003"]
    assert [(s.startMs, s.endMs) for s in out] == [(0, 1000), (1000, 2000), (2000, 3000)]


def test_relabeled_shots_validate_in_spec() -> None:
    shots = scenes_to_shots([(0.0, 1.0), (1.0, 2.0)])

    def stats_fn(_video: object, _shot: object) -> BoundaryStats:
        return BoundaryStats(luma=[10.0, 251.0, 10.0], hist_diffs=[0.5, 0.5])

    out = relabel_shot_transitions(shots, video="ignored.mp4", stats_fn=stats_fn)
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 2000, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [s.to_dict() for s in out],
    }
    result = validate_spec(spec)
    assert result.ok, result.errors
    assert spec["shots"][1]["transitionIn"] == {"type": "flash_cut"}


def test_relabel_empty_shots() -> None:
    assert relabel_shot_transitions([], video="x.mp4", stats_fn=lambda v, s: None) == []


# --------------------------------------------------------------------------- #
# Integración real (cv2 sobre el mp4). Laxa: ≥1 flash_cut (el video tiene ~12).
# --------------------------------------------------------------------------- #
@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_relabel_real_video_finds_flash_cuts() -> None:
    from plato_analyzer.shots import detect_shots

    shots = detect_shots(REAL_VIDEO)
    out = relabel_shot_transitions(shots, video=REAL_VIDEO)

    assert out[0].transitionIn == "open"
    # esqueleto intacto: mismos ids y tiempos
    assert [s.id for s in out] == [s.id for s in shots]
    assert [(s.startMs, s.endMs) for s in out] == [(s.startMs, s.endMs) for s in shots]

    flash = [s for s in out if s.transitionIn == "flash_cut"]
    # El estilo del video tiene ~12 destellos blancos; pedimos al menos 1 (banda honesta).
    assert len(flash) >= 1, f"se esperaba ≥1 flash_cut, hubo {len(flash)}"

    # Todo lo demás queda en el enum válido del schema.
    assert all(s.transitionIn in {"open", "cut", "flash_cut", "dissolve"} for s in out)
