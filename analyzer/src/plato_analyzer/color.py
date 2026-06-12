"""Color (M1): estadísticas de color por shot → bloque `color` del VideoSpec.

Tercer filtro determinístico del CV (ADR-0003): sin Claude, sin red. La clasificación PURA
(`classify_color`, sobre arrays de píxeles RGB) se separa del shell-out (`color_for_shot`, que
decodifica unos frames del shot) para testear sin video.

Dominio: el video alterna dos mundos que el color separa. El talking-head es CÁLIDO y SATURADO;
el collage de papel crema es NEUTRO y DESATURADO. La señal vive en tres ejes:

- temperature: el eje `b*` de CIELAB (amarillo↔azul). `b*` medio positivo → cálido; negativo → frío.
- saturation: la media del canal S de HSV, normalizada a [0, 1].
- contrast: la desviación estándar de `L*` (luminancia CIELAB) sobre los píxeles del shot.

CIELAB estándar: convertimos desde el LAB de OpenCV (uint8: L∈[0,255], a,b∈[0,255] con offset 128)
al rango canónico L∈[0,100], a,b∈[-128,127] que es lo que documenta el contrato (meanLab).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np

# --- Umbrales (calibrados para 8-bit; documentados en el docstring del módulo) ---
# temperature: sobre b* CIELAB medio (rango ~[-128, 127]). Banda neutra ±6 alrededor de 0.
# Calibrado contra @olyasuharska: con ±8 el campo colapsaba a "neutral" para todos los shots
# (el mundo talking-head cálido tiene b*~7-8, justo bajo el corte); ±6 lo vuelve informativo.
_WARM_B = 6.0
_COOL_B = -6.0
# saturation: sobre media de S/255 ∈ [0, 1]. Talking-head saturado vs collage desaturado.
_SAT_HIGH = 0.45
_SAT_MEDIUM = 0.18
# contrast: sobre desviación estándar de L* ∈ [0, 100]. Bloque plano ~0; blanco/negro ~50.
_CON_HIGH = 28.0
_CON_MEDIUM = 14.0


@dataclass(frozen=True)
class Color:
    """El bloque `color` del VideoSpec (schema $defs.Color).

    `meanLab` en CIELAB estándar [L*, a*, b*]; `palette` colores dominantes en hex `#RRGGBB`.
    Los tres enums (temperature/saturation/contrast) son los campos requeridos por el contrato.
    """

    meanLab: tuple[float, float, float]
    palette: tuple[str, ...]
    temperature: str  # "warm" | "neutral" | "cool"
    saturation: str   # "high" | "medium" | "low"
    contrast: str     # "high" | "medium" | "low"

    def to_dict(self) -> dict[str, Any]:
        return {
            "meanLab": list(self.meanLab),
            "palette": list(self.palette),
            "temperature": self.temperature,
            "saturation": self.saturation,
            "contrast": self.contrast,
        }


def _as_pixels(rgb_pixels: np.ndarray) -> np.ndarray:
    """Normaliza la entrada a un array (N, 1, 3) uint8 de RGB que cv2 sabe convertir.

    Acepta (H, W, 3) o (N, 3). cv2.cvtColor exige un array tipo imagen, así que reshape a (N, 1, 3).
    """
    arr = np.asarray(rgb_pixels)
    if arr.ndim == 3 and arr.shape[-1] == 3:
        arr = arr.reshape(-1, 3)
    elif not (arr.ndim == 2 and arr.shape[-1] == 3):
        raise ValueError(f"Se esperaba (H,W,3) o (N,3) RGB, se recibió shape {arr.shape}")
    return arr.astype(np.uint8).reshape(-1, 1, 3)


def _to_hex(rgb: np.ndarray) -> str:
    """RGB (3,) → '#RRGGBB' en mayúsculas."""
    r, g, b = (int(round(float(c))) for c in rgb)
    return f"#{r:02X}{g:02X}{b:02X}"


def _dominant_palette(pixels: np.ndarray, k: int) -> tuple[str, ...]:
    """Colores dominantes vía k-means (cv2.kmeans). Devuelve hex ordenados por tamaño de clúster.

    `pixels` es (N, 1, 3) uint8 RGB. Con menos píxeles únicos que `k`, k-means colapsa centros;
    los deduplicamos para no repetir hex.
    """
    samples = pixels.reshape(-1, 3).astype(np.float32)
    k = max(1, min(k, samples.shape[0]))
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(
        samples, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS
    )
    counts = np.bincount(labels.flatten(), minlength=k)
    order = np.argsort(counts)[::-1]  # clúster más poblado primero

    palette: list[str] = []
    seen: set[str] = set()
    for idx in order:
        hex_color = _to_hex(centers[idx])
        if hex_color not in seen:
            seen.add(hex_color)
            palette.append(hex_color)
    return tuple(palette)


def classify_color(rgb_pixels: np.ndarray, *, palette_size: int = 3) -> Color:
    """Clasifica el color de un conjunto de píxeles RGB (puro, testeable sin video).

    `rgb_pixels`: array uint8 (H, W, 3) o (N, 3) en orden RGB.
    `palette_size`: cuántos colores dominantes extraer (1–5 efectivos por el contrato).

    Devuelve un `Color` con meanLab (CIELAB estándar), palette (hex) y los tres enums.
    """
    pixels = _as_pixels(rgb_pixels)

    # CIELAB: cv2 entrega uint8 escalado; lo llevamos al rango canónico.
    lab = cv2.cvtColor(pixels, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float64)
    L = lab[:, 0] * 100.0 / 255.0
    a = lab[:, 1] - 128.0
    b = lab[:, 2] - 128.0
    mean_L, mean_a, mean_b = float(L.mean()), float(a.mean()), float(b.mean())

    # HSV: media de saturación en [0, 1].
    hsv = cv2.cvtColor(pixels, cv2.COLOR_RGB2HSV).reshape(-1, 3).astype(np.float64)
    mean_s = float(hsv[:, 1].mean()) / 255.0

    # contrast: dispersión de la luminancia.
    contrast_std = float(L.std())

    temperature = "warm" if mean_b > _WARM_B else "cool" if mean_b < _COOL_B else "neutral"
    saturation = "high" if mean_s > _SAT_HIGH else "medium" if mean_s > _SAT_MEDIUM else "low"
    contrast = "high" if contrast_std > _CON_HIGH else "medium" if contrast_std > _CON_MEDIUM else "low"

    return Color(
        meanLab=(round(mean_L, 1), round(mean_a, 1), round(mean_b, 1)),
        palette=_dominant_palette(pixels, k=palette_size),
        temperature=temperature,
        saturation=saturation,
        contrast=contrast,
    )


def _sample_frames_rgb(
    video: Path | str, start_ms: int, end_ms: int, samples: int
) -> np.ndarray:
    """Decodifica `samples` frames repartidos en [start_ms, end_ms) y los apila en RGB.

    Usa cv2.VideoCapture con seek por milisegundo. Los frames se concatenan como (N*H, W, 3)
    para que `classify_color` trate al shot completo como una sola nube de píxeles.
    """
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        raise RuntimeError(f"No se pudo abrir el video: {video}")

    n = max(1, samples)
    span = max(0, end_ms - start_ms)
    # puntos de muestreo centrados en cada subtramo, evitando justo el corte de entrada/salida.
    positions = [start_ms + int(span * (i + 0.5) / n) for i in range(n)]

    frames: list[np.ndarray] = []
    try:
        for ms in positions:
            cap.set(cv2.CAP_PROP_POS_MSEC, float(ms))
            ok, frame_bgr = cap.read()
            if ok and frame_bgr is not None:
                frames.append(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
    finally:
        cap.release()

    if not frames:
        raise RuntimeError(f"No se decodificó ningún frame en [{start_ms}, {end_ms}) de {video}")
    return np.concatenate(frames, axis=0)


def color_for_shot(
    video: Path | str,
    start_ms: int,
    end_ms: int,
    samples: int = 3,
    *,
    palette_size: int = 3,
) -> Color:
    """Extrae unos frames del shot [start_ms, end_ms) y devuelve su `Color`."""
    pixels = _sample_frames_rgb(video, start_ms, end_ms, samples)
    return classify_color(pixels, palette_size=palette_size)
