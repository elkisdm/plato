"""Tests de la capa style (M3): agrega los shots → `style` (pacing/vocabularios/colorGrade).

Función PURA sobre shot-dicts (los que emite `analyze --full`). El `qualitativeSummary` es un
resumen FACTUAL templado desde las métricas (la capa de visión puede sobrescribirlo).
"""

from __future__ import annotations

from plato_analyzer.schema import validate_spec
from plato_analyzer.style import aggregate_style


def _shot(i: int, start: int, end: int, *, cam: str, act: str, temp: str, trans: str) -> dict:
    return {
        "id": f"shot_{i:03d}", "startMs": start, "endMs": end, "durationMs": end - start,
        "transitionIn": {"type": trans},
        "camera": {"type": cam, "confidence": 0.7},
        "object": {"activity": act},
        "color": {"temperature": temp, "saturation": "high", "contrast": "medium"},
    }


def _shots() -> list[dict]:
    return [
        _shot(1, 0, 2000, cam="static", act="low", temp="warm", trans="open"),
        _shot(2, 2000, 3000, cam="punch_in", act="high", temp="neutral", trans="cut"),
        _shot(3, 3000, 9000, cam="static", act="low", temp="warm", trans="flash_cut"),
    ]


def test_pacing_metrics() -> None:
    style = aggregate_style(_shots(), duration_ms=9000)
    p = style["pacing"]
    assert p["shots"] == 3
    assert p["avgShotMs"] == 3000  # (2000+1000+6000)/3
    assert p["medianShotMs"] == 2000
    assert p["minShotMs"] == 1000 and p["maxShotMs"] == 6000
    # 2 cortes (no-open) sobre 0.15 min → ~13.3
    assert round(p["cutsPerMin"], 1) == 13.3


def test_transition_vocabulary_excludes_open() -> None:
    style = aggregate_style(_shots(), duration_ms=9000)
    assert style["transitionVocabulary"] == {"cut": 1, "flash_cut": 1}


def test_motion_and_color_vocabularies() -> None:
    style = aggregate_style(_shots(), duration_ms=9000)
    assert style["motionVocabulary"]["camera"] == {"static": 2, "punch_in": 1}
    assert style["motionVocabulary"]["objectActivity"] == {"low": 2, "high": 1}
    assert style["colorGrade"]["macroDistribution"] == {"warm": 2, "neutral": 1}


def test_qualitative_summary_is_present_string() -> None:
    style = aggregate_style(_shots(), duration_ms=9000)
    assert isinstance(style["qualitativeSummary"], str) and style["qualitativeSummary"]


def test_style_omits_motion_color_when_shots_are_bare() -> None:
    bare = [{"id": "shot_001", "startMs": 0, "endMs": 1000, "durationMs": 1000,
             "transitionIn": {"type": "open"}}]
    style = aggregate_style(bare, duration_ms=1000)
    assert "motionVocabulary" not in style
    assert "colorGrade" not in style
    assert "pacing" in style and "qualitativeSummary" in style


def test_aggregated_style_validates_in_spec() -> None:
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 9000, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [{"id": s["id"], "startMs": s["startMs"], "endMs": s["endMs"],
                   "durationMs": s["durationMs"]} for s in _shots()],
        "style": aggregate_style(_shots(), duration_ms=9000),
    }
    result = validate_spec(spec)
    assert result.ok, result.errors
