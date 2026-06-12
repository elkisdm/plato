"""Tests del validador del VideoSpec (contrato v0.2.0).

Cubren la semántica del contrato:
- el golden valida 100%,
- gate duro en FORMA (campos faltantes, tipos, enums, additionalProperties),
- gate SUAVE en PRESENCIA (capas opcionales: un spec esqueleto valida),
- strict-when-present (una capa malformada SÍ se rechaza).
"""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from plato_analyzer.schema import load_schema, validate_file, validate_spec

REPO_ROOT = Path(__file__).resolve().parents[2]
GOLDEN = REPO_ROOT / "fixtures" / "olyasuharska" / "videospec-olyasuharska.json"


@pytest.fixture
def golden_spec() -> dict:
    with GOLDEN.open(encoding="utf-8") as fh:
        return json.load(fh)


def _skeleton() -> dict:
    """Spec mínimo válido: solo el esqueleto requerido, sin ninguna capa de análisis."""
    return {
        "specVersion": "0.2.0",
        "source": {
            "id": "x",
            "filename": "x.mp4",
            "durationMs": 1000,
            "fps": 24,
            "width": 720,
            "height": 1280,
            "codec": "h264",
        },
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.0.1"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 1000, "durationMs": 1000}],
    }


def test_schema_loads() -> None:
    schema = load_schema()
    assert schema["title"] == "VideoSpec"


def test_golden_fixture_is_valid() -> None:
    """El golden real (v0.2.0, cut-detection) valida 100%."""
    result = validate_file(GOLDEN)
    assert result.ok, f"El golden no validó: {result.errors}"
    assert result.errors == []


# --- Gate SUAVE en presencia: capas opcionales ---

def test_skeleton_only_spec_is_valid() -> None:
    """Pipe-and-filter: un spec parcial (solo shots, sin camera/color/captions) valida."""
    result = validate_spec(_skeleton())
    assert result.ok, f"El esqueleto debería validar: {result.errors}"


def test_shot_without_analysis_layers_is_valid(golden_spec: dict) -> None:
    """Un shot con solo identidad temporal (sin camera/object/color/transitionIn) valida."""
    spec = copy.deepcopy(golden_spec)
    spec["shots"][0] = {"id": "shot_001", "startMs": 0, "endMs": 1458, "durationMs": 1458}
    result = validate_spec(spec)
    assert result.ok, f"Shot esqueleto debería validar: {result.errors}"


# --- Gate DURO en forma ---

def test_missing_required_skeleton_field_is_rejected() -> None:
    broken = _skeleton()
    del broken["specVersion"]
    result = validate_spec(broken)
    assert not result.ok
    assert any("specVersion" in e for e in result.errors)


def test_wrong_type_is_rejected(golden_spec: dict) -> None:
    broken = copy.deepcopy(golden_spec)
    broken["shots"][0]["startMs"] = "no-soy-un-entero"
    assert not validate_spec(broken).ok


def test_unknown_field_in_strict_object_is_rejected(golden_spec: dict) -> None:
    broken = copy.deepcopy(golden_spec)
    broken["source"]["fpsTypo"] = 24
    assert not validate_spec(broken).ok


def test_bad_camera_enum_is_rejected(golden_spec: dict) -> None:
    broken = copy.deepcopy(golden_spec)
    broken["shots"][1]["camera"]["type"] = "teleport"
    assert not validate_spec(broken).ok


def test_bad_transition_type_is_rejected(golden_spec: dict) -> None:
    broken = copy.deepcopy(golden_spec)
    broken["shots"][1]["transitionIn"]["type"] = "morph"
    assert not validate_spec(broken).ok


def test_confidence_out_of_range_is_rejected(golden_spec: dict) -> None:
    broken = copy.deepcopy(golden_spec)
    broken["confidence"]["overall"] = 1.5
    assert not validate_spec(broken).ok


# --- Strict-when-present: una capa OPCIONAL, si está, se valida estricta ---

def test_optional_color_when_present_is_validated() -> None:
    """color es opcional, pero si aparece malformado (enum inválido) se rechaza."""
    spec = _skeleton()
    spec["shots"][0]["color"] = {"temperature": "tibio", "saturation": "high", "contrast": "low"}
    assert not validate_spec(spec).ok


def test_optional_color_well_formed_is_accepted() -> None:
    spec = _skeleton()
    spec["shots"][0]["color"] = {
        "meanLab": [28.1, 5.5, 7.8],
        "palette": ["#1D1410"],
        "temperature": "warm",
        "saturation": "high",
        "contrast": "medium",
    }
    assert validate_spec(spec).ok


def test_camera_ambiguous_flag_is_accepted() -> None:
    """El primitivo de honestidad camera.ambiguous es un boolean de primera clase."""
    spec = _skeleton()
    spec["shots"][0]["camera"] = {"type": "unknown", "ambiguous": True, "confidence": 0.3}
    assert validate_spec(spec).ok


def test_known_gap_requires_reason() -> None:
    spec = _skeleton()
    spec["knownGaps"] = [{"kind": "missed_cut", "approxMs": 23000}]  # falta 'reason'
    assert not validate_spec(spec).ok


def test_qualitative_style_accepts_extra_keys(golden_spec: dict) -> None:
    ok_spec = copy.deepcopy(golden_spec)
    ok_spec["style"].setdefault("typography", {})["nuevoDescriptor"] = "x"
    assert validate_spec(ok_spec).ok
