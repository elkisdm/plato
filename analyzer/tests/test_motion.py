"""Tests de la capa motion (CV): movimiento de CÁMARA vs OBJETO por shot.

Separa la función PURA (`classify_motion`, testeable con flow_stats sintéticas) del
shell-out (`motion_for_shot`, integración: muestrea frames del mp4 real y ajusta el
modelo global vía RANSAC). El test de integración se salta si el mp4 no está.

ADR-0007: cámara (modelo global) separada de objeto (outliers del modelo). Cuando el
sujeto llena el cuadro y cámara/objeto son indistinguibles, se FLAGEA `ambiguous`, no se
adivina.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from plato_analyzer.motion import FlowStats, classify_motion, motion_for_shot
from plato_analyzer.schema import validate_spec

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"


# --- Función PURA: clasificación a partir de flow_stats ---

def test_static_when_global_magnitude_near_zero() -> None:
    """Sin desplazamiento global ni divergencia → cámara estática, ajuste limpio."""
    stats = FlowStats(dx=0.001, dy=0.0008, divergence=0.0006, magnitude=0.003,
                      outlierRatio=0.18, inlierRatio=0.82, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "static"
    assert res.camera.magnitude >= 0
    assert res.camera.ambiguous is False
    assert 0.0 <= res.camera.confidence <= 1.0
    assert res.camera.confidence > 0.6  # ajuste limpio → alta confianza


def test_pan_when_horizontal_dominates() -> None:
    """Desplazamiento lateral dominante → pan; panFrac cerca de 1 si es casi puro horizontal."""
    stats = FlowStats(dx=0.09, dy=0.004, divergence=0.001, magnitude=0.09,
                      outlierRatio=0.15, inlierRatio=0.85, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "pan"
    assert res.camera.panFrac is not None
    assert res.camera.panFrac > 0.9  # casi todo el desplazamiento es horizontal
    assert res.camera.magnitude > 0


def test_punch_in_when_divergence_positive() -> None:
    """Escala creciente (divergencia positiva) sin pan → punch_in (acercamiento)."""
    stats = FlowStats(dx=0.005, dy=0.004, divergence=0.05, magnitude=0.05,
                      outlierRatio=0.30, inlierRatio=0.70, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "punch_in"
    assert res.camera.magnitude > 0


def test_zoom_out_when_divergence_negative() -> None:
    """Escala decreciente (divergencia negativa) → zoom_out (alejamiento)."""
    stats = FlowStats(dx=0.004, dy=0.003, divergence=-0.05, magnitude=0.05,
                      outlierRatio=0.20, inlierRatio=0.80, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "zoom_out"


def test_drift_subtle_when_small_nondirectional() -> None:
    """Movimiento pequeño, no claramente lateral ni de escala → drift sutil."""
    stats = FlowStats(dx=0.012, dy=0.011, divergence=0.002, magnitude=0.017,
                      outlierRatio=0.20, inlierRatio=0.80, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "drift_subtle"


def test_handheld_when_high_magnitude_low_inliers() -> None:
    """Magnitud alta sin modelo global estable (pocos inliers) → handheld."""
    stats = FlowStats(dx=0.02, dy=0.02, divergence=0.005, magnitude=0.08,
                      outlierRatio=0.45, inlierRatio=0.48, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "handheld"


def test_ambiguous_when_subject_fills_frame() -> None:
    """outlierRatio muy alto + modelo poco confiable → ambiguous=True, no se adivina."""
    stats = FlowStats(dx=0.04, dy=0.03, divergence=0.01, magnitude=0.06,
                      outlierRatio=0.72, inlierRatio=0.28, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.ambiguous is True
    assert res.camera.confidence < 0.5  # honesto: no confiamos en el tipo


def test_object_activity_scales_with_outlier_ratio() -> None:
    """outlierRatio bajo→low, medio→medium, alto→high."""
    low = classify_motion(FlowStats(0.001, 0.001, 0.0, 0.003, 0.10, 0.90, 12))
    med = classify_motion(FlowStats(0.001, 0.001, 0.0, 0.003, 0.30, 0.70, 12))
    high = classify_motion(FlowStats(0.001, 0.001, 0.0, 0.003, 0.55, 0.45, 12))
    assert low.object.activity == "low"
    assert med.object.activity == "medium"
    assert high.object.activity == "high"
    assert low.object.outlierRatio == pytest.approx(0.10)


def test_unknown_when_not_enough_frames() -> None:
    """Sin frames suficientes para un modelo, no se inventa: type unknown, baja confianza."""
    stats = FlowStats(dx=0.0, dy=0.0, divergence=0.0, magnitude=0.0,
                      outlierRatio=0.0, inlierRatio=0.0, nFrames=1)
    res = classify_motion(stats)
    assert res.camera.type == "unknown"
    assert res.object.activity == "unknown"
    assert res.camera.confidence < 0.4


def test_pan_horizontal_then_vertical_panfrac() -> None:
    """Pan vertical puro: sigue siendo pan pero panFrac bajo (la fracción es horizontal)."""
    stats = FlowStats(dx=0.003, dy=0.09, divergence=0.001, magnitude=0.09,
                      outlierRatio=0.15, inlierRatio=0.85, nFrames=12)
    res = classify_motion(stats)
    assert res.camera.type == "pan"
    assert res.camera.panFrac < 0.1  # casi nada horizontal


# --- Contrato: el to_dict() valida contra el schema ---

def _skeleton() -> dict:
    return {
        "specVersion": "0.2.0",
        "source": {
            "id": "x", "filename": "x.mp4", "durationMs": 1000, "fps": 24,
            "width": 720, "height": 1280, "codec": "h264",
        },
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.0.1"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 1000, "durationMs": 1000}],
    }


def test_camera_and_object_dicts_validate_in_spec() -> None:
    """camera.to_dict()/object.to_dict() anexados a un shot validan contra el schema."""
    res = classify_motion(
        FlowStats(dx=0.005, dy=0.004, divergence=0.05, magnitude=0.05,
                  outlierRatio=0.30, inlierRatio=0.70, nFrames=12)
    )
    spec = _skeleton()
    spec["shots"][0]["camera"] = res.camera.to_dict()
    spec["shots"][0]["object"] = res.object.to_dict()
    result = validate_spec(spec)
    assert result.ok, result.errors


def test_ambiguous_dict_validates_in_spec() -> None:
    """El caso ambiguo también produce un camera dict válido (ambiguous boolean)."""
    res = classify_motion(
        FlowStats(dx=0.04, dy=0.03, divergence=0.01, magnitude=0.06,
                  outlierRatio=0.72, inlierRatio=0.28, nFrames=12)
    )
    spec = _skeleton()
    spec["shots"][0]["camera"] = res.camera.to_dict()
    spec["shots"][0]["object"] = res.object.to_dict()
    assert validate_spec(spec).ok, validate_spec(spec).errors


def test_camera_dict_has_no_none_optionals() -> None:
    """to_dict() no debe emitir claves opcionales en None (additionalProperties=false las tolera,
    pero panFrac=None violaría el tipo number). Static no tiene panFrac."""
    res = classify_motion(
        FlowStats(0.001, 0.001, 0.0006, 0.003, 0.18, 0.82, 12)
    )
    d = res.camera.to_dict()
    assert "panFrac" not in d  # static no reporta panFrac
    assert all(v is not None for v in d.values())


# --- Integración: shot real (laxo, NO clava el golden) ---

@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_motion_for_shot_real_video_produces_valid_layer() -> None:
    """Sobre un shot real produce camera+object que validan contra el schema."""
    # shot_003 del golden (~4.4s a ~5.8s); ventana corta para que el test sea rápido.
    res = motion_for_shot(REAL_VIDEO, start_ms=4417, end_ms=5833, sample_fps=6)
    spec = _skeleton()
    spec["shots"][0]["camera"] = res.camera.to_dict()
    spec["shots"][0]["object"] = res.object.to_dict()
    result = validate_spec(spec)
    assert result.ok, result.errors
    assert res.camera.type in {
        "static", "pan", "punch_in", "zoom_out", "drift_subtle", "handheld", "unknown",
    }
    assert res.object.activity in {"low", "medium", "high", "unknown"}
