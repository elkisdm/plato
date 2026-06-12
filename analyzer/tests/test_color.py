"""Tests de la capa color (M1): píxeles RGB de un shot → bloque `color` del VideoSpec.

Separa la clasificación PURA (`classify_color`, testeable con arrays sintéticos de RGB) del
shell-out (`color_for_shot`, integración: decodifica frames del mp4 real, se salta si no está).

Los umbrales viven en `color.py` y se documentan ahí; estos tests fijan el CONTRATO
(forma del dataclass, formato de hex, rangos de meanLab, enums) y casos límite de dominio:
el video alterna talking-head cálido saturado vs collage papel crema neutro desaturado.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from plato_analyzer.color import Color, classify_color, color_for_shot
from plato_analyzer.schema import validate_spec

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_VIDEO = REPO_ROOT / "Vemos una película @olyasuharska.mp4"

WARM = (200, 120, 40)    # naranja cálido saturado
COOL = (40, 90, 200)     # azul frío saturado
CREAM = (235, 228, 210)  # papel crema, casi neutro y muy claro
GRAY = (128, 128, 128)   # gris perfecto: a=b=0, S=0


def _solid(rgb: tuple[int, int, int], n: int = 64) -> np.ndarray:
    """Bloque sólido (n, n, 3) de un color RGB. Sin varianza → contrast 'low'."""
    return np.full((n, n, 3), rgb, dtype=np.uint8)


def test_classify_returns_color_dataclass() -> None:
    color = classify_color(_solid(WARM))
    assert isinstance(color, Color)
    assert color.temperature in {"warm", "neutral", "cool"}
    assert color.saturation in {"high", "medium", "low"}
    assert color.contrast in {"high", "medium", "low"}


def test_mean_lab_has_three_numbers_in_cielab_range() -> None:
    color = classify_color(_solid(CREAM))
    assert len(color.meanLab) == 3
    L, a, b = color.meanLab
    assert 0.0 <= L <= 100.0  # L* en rango CIELAB estándar, no 0-255 de cv2
    assert -128.0 <= a <= 127.0
    assert -128.0 <= b <= 127.0


def test_palette_is_uppercase_rrggbb_hex() -> None:
    color = classify_color(_solid(WARM))
    assert 1 <= len(color.palette) <= 5
    for hex_color in color.palette:
        assert hex_color.startswith("#")
        assert len(hex_color) == 7  # #RRGGBB
        assert hex_color == hex_color.upper()
        int(hex_color[1:], 16)  # parseable como hex


def test_warm_orange_is_warm() -> None:
    # b* CIELAB claramente positivo → warm
    assert classify_color(_solid(WARM)).temperature == "warm"


def test_cool_blue_is_cool() -> None:
    # b* CIELAB claramente negativo → cool
    assert classify_color(_solid(COOL)).temperature == "cool"


def test_perfect_gray_is_neutral_and_low_saturation() -> None:
    color = classify_color(_solid(GRAY))
    assert color.temperature == "neutral"
    assert color.saturation == "low"


def test_saturated_color_is_high_saturation() -> None:
    assert classify_color(_solid(WARM)).saturation == "high"


def test_solid_block_is_low_contrast() -> None:
    # un bloque de un solo color no tiene varianza de luminancia
    assert classify_color(_solid(GRAY)).contrast == "low"


def test_black_and_white_split_is_high_contrast() -> None:
    # mitad negra, mitad blanca: máxima desviación de L* → high contrast
    px = np.zeros((64, 64, 3), dtype=np.uint8)
    px[:32] = 255
    assert classify_color(px).contrast == "high"


def test_accepts_flat_pixel_array() -> None:
    # (N, 3) además de (H, W, 3)
    flat = np.full((100, 3), CREAM, dtype=np.uint8)
    color = classify_color(flat)
    assert isinstance(color, Color)


def test_palette_size_is_respected() -> None:
    # dos colores distintos → palette de 2 cuando pedimos 2
    px = np.zeros((64, 64, 3), dtype=np.uint8)
    px[:32] = WARM
    px[32:] = COOL
    color = classify_color(px, palette_size=2)
    assert len(color.palette) == 2


def test_to_dict_keys_match_schema() -> None:
    d = classify_color(_solid(WARM)).to_dict()
    assert set(d.keys()) == {"meanLab", "palette", "temperature", "saturation", "contrast"}


def test_color_dict_validates_in_spec() -> None:
    color = classify_color(_solid(WARM))
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 2000, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 2000, "durationMs": 2000,
                   "color": color.to_dict()}],
    }
    result = validate_spec(spec)
    assert result.ok, result.errors


@pytest.mark.skipif(not REAL_VIDEO.exists(), reason="mp4 real no disponible")
def test_color_for_shot_real_video_is_valid() -> None:
    # Shot temprano del talking-head (primeros segundos). Laxo: solo exige un Color válido
    # con enums correctos, NO valores golden.
    color = color_for_shot(REAL_VIDEO, start_ms=0, end_ms=1458, samples=3)
    assert isinstance(color, Color)
    assert color.temperature in {"warm", "neutral", "cool"}
    assert color.saturation in {"high", "medium", "low"}
    assert color.contrast in {"high", "medium", "low"}
    assert len(color.meanLab) == 3
    assert 1 <= len(color.palette) <= 5
    # se valida contra el schema embebido en un spec esqueleto
    spec = {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": 176376, "fps": 24,
                   "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.1.0"},
        "shots": [{"id": "shot_001", "startMs": 0, "endMs": 1458, "durationMs": 1458,
                   "color": color.to_dict()}],
    }
    result = validate_spec(spec)
    assert result.ok, result.errors
