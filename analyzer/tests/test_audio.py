"""Tests de la capa audio (M3): ffmpeg loudnorm + silencedetect → bloque `audio`.

Parsers PUROS (texto de ffmpeg → datos) testeados con muestras; el shell-out
(`analyze_audio`) es integración sobre el mp4 real (skip si no está).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from plato_analyzer.audio import analyze_audio, parse_loudness, parse_silences
from plato_analyzer.schema import validate_spec

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"

LOUDNORM_SAMPLE = """\
[Parsed_loudnorm_0 @ 0x]
Input Integrated:    -14.2 LUFS
Input True Peak:      -0.9 dBTP
Input LRA:             5.3 LU
Input Threshold:     -26.9 LUFS
"""

SILENCE_SAMPLE = """\
[silencedetect @ 0x] silence_start: 12.345
[silencedetect @ 0x] silence_end: 13.145 | silence_duration: 0.8
[silencedetect @ 0x] silence_start: 40.0
[silencedetect @ 0x] silence_end: 40.6 | silence_duration: 0.6
"""


def test_parse_loudness_reads_integrated_lufs() -> None:
    assert parse_loudness(LOUDNORM_SAMPLE) == -14.2


def test_parse_silences_pairs_start_end_to_ms() -> None:
    silences = parse_silences(SILENCE_SAMPLE)
    assert silences == [
        {"startMs": 12345, "endMs": 13145},
        {"startMs": 40000, "endMs": 40600},
    ]


def test_parse_silences_empty_when_none() -> None:
    assert parse_silences("[silencedetect @ 0x] nada relevante aquí") == []


def test_parse_silences_ignores_unclosed_start() -> None:
    # un silence_start sin su silence_end (corte al final) no debe romper ni emitir par
    txt = "silence_start: 5.0\nsilence_end: 5.5 | silence_duration: 0.5\nsilence_start: 99.0"
    assert parse_silences(txt) == [{"startMs": 5000, "endMs": 5500}]


def test_audio_dict_validates_in_spec() -> None:
    from plato_analyzer.audio import Audio

    audio = Audio(loudnessLufs=-14.2, silences=[{"startMs": 100, "endMs": 600}])
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 2000, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 2000, "durationMs": 2000}],
        "audio": audio.to_dict(),
    }
    result = validate_spec(spec)
    assert result.ok, result.errors


@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_analyze_audio_real_video() -> None:
    audio = analyze_audio(REAL_VIDEO)
    # golden: ~-14.2 LUFS, sin silencios >=0.5s. Banda laxa.
    assert -20.0 <= audio.loudnessLufs <= -8.0
    assert isinstance(audio.silences, list)
