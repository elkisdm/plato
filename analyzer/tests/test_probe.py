"""Tests de la capa probe (M1): ffprobe → bloque `source` del VideoSpec.

Separa el parseo PURO (`parse_probe`, testeable con un dict sintético) del shell-out
(`probe`, integración sobre el mp4 real, se salta si no está).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from plato_analyzer.probe import parse_probe, probe, slug
from plato_analyzer.schema import validate_spec

# Salida típica de `ffprobe -print_format json -show_format -show_streams`
FFPROBE_SAMPLE = {
    "streams": [
        {"codec_type": "audio", "codec_name": "aac"},
        {"codec_type": "video", "codec_name": "h264", "width": 720, "height": 1280,
         "r_frame_rate": "24/1", "avg_frame_rate": "24/1"},
    ],
    "format": {"duration": "176.375918"},
}

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"


def test_parse_probe_extracts_source() -> None:
    src = parse_probe(FFPROBE_SAMPLE, filename="x.mp4", video_id="vid")
    assert src.codec == "h264"
    assert src.width == 720 and src.height == 1280
    assert src.fps == 24
    assert src.durationMs == 176376  # 176.375918s redondeado
    assert src.filename == "x.mp4"
    assert src.id == "vid"


def test_fps_from_rational_is_integer() -> None:
    sample = {**FFPROBE_SAMPLE, "streams": [
        {"codec_type": "video", "codec_name": "h264", "width": 1080, "height": 1920,
         "r_frame_rate": "30000/1001", "avg_frame_rate": "30000/1001"}]}
    src = parse_probe(sample, filename="x.mp4", video_id="x")
    assert src.fps == 30  # 29.97 → 30


def test_parse_probe_picks_video_stream_not_audio() -> None:
    src = parse_probe(FFPROBE_SAMPLE, filename="x.mp4", video_id="x")
    assert src.codec == "h264"  # no "aac"


def test_source_dict_validates_as_skeleton() -> None:
    src = parse_probe(FFPROBE_SAMPLE, filename="x.mp4", video_id="x")
    spec = {
        "specVersion": "0.2.0",
        "source": src.to_dict(),
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 1000, "durationMs": 1000}],
    }
    assert validate_spec(spec).ok, validate_spec(spec).errors


def test_slug_normalizes_accents_and_spaces() -> None:
    assert slug("Vemos una película @olyasuharska") == "vemos-una-pelicula-olyasuharska"


@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_probe_real_video_matches_golden() -> None:
    src = probe(REAL_VIDEO)
    assert src.fps == 24
    assert src.width == 720 and src.height == 1280
    assert src.codec == "h264"
    assert src.durationMs == 176376
