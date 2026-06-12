"""Capa de visión semántica ejecutada por una sesión de Claude Code (ADR-0007, rama in-session).

NO llama a la Anthropic API. El empaquetado de frames replica el mecanismo validado
empíricamente (files.zip / reporte §8): NO frames sueltos, sino

- **contact sheets**: un keyframe por shot, etiquetado (`id + s`), en mosaico → barrido amplio
  (estilo, texto por shot, los "dos mundos"). El agente lee ~4 imágenes en vez de ~64.
- **strips densas a 24fps**: las ventanas de micro-animación (knownGaps + ventanas marcadas),
  para descifrar el timing palabra-a-palabra de captions/overlays.

Flujo: `build_manifest(spec)` (contrato analyzer→agente) → el CLI vuelca sheets/strips con
ffmpeg+Pillow → una sesión de Claude Code los LEE con `Read` y escribe `vision.json`
(`{captions[], textOverlays[]}`, `source:"vision"`) → `merge_vision` lo injerta y re-valida
(gate duro). El schema NO cambia: `TextSource` ya admite `"vision"`.
"""

from __future__ import annotations

import copy
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

from plato_analyzer.schema import validate_spec

SHOTS_PER_SHEET = 16
STRIP_FPS = 24  # paso temporal de las strips densas (1 frame ≈ 41.7ms)
GAP_HALF_WINDOW_MS = 500  # ventana ±0.5s alrededor del approxMs de un knownGap

_MERGE_KEYS = ("captions", "textOverlays")
_ID_PREFIX = {"captions": "cap", "textOverlays": "ovl"}


class VisionMergeError(ValueError):
    """El fragmento de visión es inválido o produce un spec que no valida (gate duro)."""


# --------------------------------------------------------------------------- #
# Planificación (pura, testeable sin ffmpeg/Pillow)
# --------------------------------------------------------------------------- #

@dataclass(frozen=True)
class Keyframe:
    shotId: str
    ms: int
    label: str


@dataclass(frozen=True)
class Sheet:
    """Un bloque de keyframes (un shot cada uno) que se renderiza como una contact sheet."""

    id: str
    keyframes: tuple[Keyframe, ...]


@dataclass(frozen=True)
class Strip:
    """Una ventana densa muestreada a `STRIP_FPS` para descifrar micro-animación."""

    id: str
    startMs: int
    endMs: int
    reason: str
    frameMs: tuple[int, ...]


def _keyframe(shot: dict[str, Any]) -> Keyframe:
    start, end = shot["startMs"], shot["endMs"]
    mid = (start + end) // 2
    dur = shot.get("durationMs", end - start)
    return Keyframe(shotId=shot["id"], ms=mid, label=f"{shot['id']} {mid / 1000:.1f}s ({dur / 1000:.1f}s)")


def build_sheets(spec: dict[str, Any], per_sheet: int = SHOTS_PER_SHEET) -> list[Sheet]:
    """Un keyframe (punto medio) por shot, agrupados en contact sheets de `per_sheet`."""
    keyframes = [_keyframe(shot) for shot in spec.get("shots", [])]
    sheets: list[Sheet] = []
    for i in range(0, len(keyframes), per_sheet):
        sheets.append(Sheet(id=f"sheet_{i // per_sheet + 1:03d}", keyframes=tuple(keyframes[i:i + per_sheet])))
    return sheets


def _strip_frame_ms(startMs: int, endMs: int, fps: int = STRIP_FPS) -> tuple[int, ...]:
    """ms muestreados a `fps` dentro de [startMs, endMs)."""
    step = 1000.0 / fps
    n = max(1, int((endMs - startMs) / step) + 1)
    return tuple(int(round(startMs + step * i)) for i in range(n) if startMs + step * i < endMs)


def build_strips(
    spec: dict[str, Any],
    extra_windows: Sequence[tuple[int, int]] = (),
    fps: int = STRIP_FPS,
) -> list[Strip]:
    """Strips densas: una por knownGap con `approxMs`, más las `extra_windows` marcadas a mano.

    Las ventanas de micro-animación reales (caption/collage) NO son knownGaps estructurales;
    se pasan como `extra_windows` (las elige quien analiza, igual que en la pasada sandbox).
    """
    windows: list[tuple[int, int, str]] = []
    for gap in spec.get("knownGaps", []):
        approx = gap.get("approxMs")
        if approx is not None:
            windows.append((max(0, approx - GAP_HALF_WINDOW_MS), approx + GAP_HALF_WINDOW_MS,
                            f"knownGap {gap.get('kind', '?')}: {gap.get('reason', '')[:60]}"))
    for start, end in extra_windows:
        windows.append((start, end, "ventana de micro-animación"))

    return [
        Strip(id=f"strip_{i:03d}", startMs=s, endMs=e, reason=reason, frameMs=_strip_frame_ms(s, e, fps))
        for i, (s, e, reason) in enumerate(windows, start=1)
    ]


def build_manifest(
    spec: dict[str, Any],
    extra_windows: Sequence[tuple[int, int]] = (),
) -> dict[str, Any]:
    """Contrato analyzer→agente: qué sheets y strips leer."""
    source = spec.get("source", {})
    sheets = build_sheets(spec)
    strips = build_strips(spec, extra_windows)
    return {
        "video": source.get("filename"),
        "fps": source.get("fps"),
        "width": source.get("width"),
        "height": source.get("height"),
        "sheets": [
            {"id": sh.id, "file": f"{sh.id}.jpg", "shots": [kf.shotId for kf in sh.keyframes]}
            for sh in sheets
        ],
        "strips": [
            {"id": st.id, "file": f"{st.id}.jpg", "startMs": st.startMs, "endMs": st.endMs,
             "reason": st.reason, "fps": STRIP_FPS, "frameCount": len(st.frameMs)}
            for st in strips
        ],
    }


# --------------------------------------------------------------------------- #
# Render (Pillow)
# --------------------------------------------------------------------------- #

def render_grid(
    cells: Sequence[tuple[Path, str]],
    out: Path,
    cols: int,
    cell_w: int = 320,
    cell_h: int = 180,
    label_h: int = 18,
    pad: int = 6,
    bg: tuple[int, int, int] = (0, 0, 0),
) -> Path:
    """Renderiza `cells` (imagen, etiqueta) en un mosaico de `cols` columnas con la etiqueta debajo."""
    from PIL import Image, ImageDraw, ImageFont

    rows = max(1, math.ceil(len(cells) / cols))
    full_w = cols * (cell_w + pad) + pad
    full_h = rows * (cell_h + label_h + pad) + pad
    canvas = Image.new("RGB", (full_w, full_h), bg)
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    for idx, (img_path, label) in enumerate(cells):
        row, col = divmod(idx, cols)
        x = pad + col * (cell_w + pad)
        y = pad + row * (cell_h + label_h + pad)
        with Image.open(img_path) as im:
            thumb = im.convert("RGB")
            thumb.thumbnail((cell_w, cell_h))
            canvas.paste(thumb, (x, y))
        draw.text((x, y + cell_h + 2), label, fill=(255, 255, 255), font=font)

    canvas.save(out, quality=90)
    return out


# --------------------------------------------------------------------------- #
# Merge (agente → analyzer)
# --------------------------------------------------------------------------- #

def _merge_style(base: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    """Funde el `style` semántico del agente sobre el numérico del CV.

    El CV aporta `pacing`/`motionVocabulary`/`transitionVocabulary`/`colorGrade.macroDistribution`;
    el agente aporta `qualitativeSummary` rico + `typography`/`captionStyle`/`structure` y la prosa
    de `colorGrade` (talkingHead/collage). `colorGrade` se funde en profundidad para no perder la
    `macroDistribution` del CV; el resto reemplaza.
    """
    merged = dict(base)
    for key, value in incoming.items():
        if key == "colorGrade" and isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = {**merged[key], **value}
        else:
            merged[key] = value
    return merged


def merge_vision(spec: dict[str, Any], fragment: dict[str, Any]) -> dict[str, Any]:
    """Injerta `captions`/`textOverlays` y, opcionalmente, `style` del fragmento en una COPIA del spec.

    - captions/textOverlays: concatena con lo existente, ordena por `startMs`, reasigna `id`
      determinístico (`cap_NNN`/`ovl_NNN`) por posición → unicidad garantizada,
    - style: funde el bloque semántico del agente sobre el numérico del CV (ver `_merge_style`),
    - re-valida el spec completo. Si no valida, lanza `VisionMergeError` y el spec original
      queda intacto (trabajamos sobre una copia).
    """
    merged = copy.deepcopy(spec)

    for key in _MERGE_KEYS:
        incoming = fragment.get(key) or []
        if not incoming:
            continue
        combined = list(merged.get(key, [])) + [dict(entry) for entry in incoming]
        combined.sort(key=lambda entry: entry.get("startMs", 0))
        prefix = _ID_PREFIX[key]
        for i, entry in enumerate(combined, start=1):
            entry["id"] = f"{prefix}_{i:03d}"
        merged[key] = combined

    frag_style = fragment.get("style")
    if frag_style:
        merged["style"] = _merge_style(merged.get("style") or {}, frag_style)

    # La capa conceptual es 100% del agente (no hay base del CV): se setea entera.
    frag_narrative = fragment.get("narrative")
    if frag_narrative:
        merged["narrative"] = frag_narrative

    result = validate_spec(merged)
    if not result.ok:
        raise VisionMergeError("; ".join(result.errors))
    return merged
