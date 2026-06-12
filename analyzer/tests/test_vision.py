"""Tests de la capa de visión in-session (ADR-0007, rama humano-en-el-loop).

Mecanismo (validado empíricamente por files.zip: sheets + strips, no frames sueltos):
- `build_sheets` → contact sheets: un keyframe por shot, etiquetado, en bloques.
- `build_strips` → strips densas a 24fps para knownGaps + ventanas marcadas (micro-animación).
- `build_manifest` → contrato analyzer→agente (referencia sheets/strips).
- `render_grid` → mosaico Pillow (probado con imágenes sintéticas, sin ffmpeg).
- `merge_vision` → injerta el fragmento agente→analyzer: ordena, asigna id, re-valida (gate duro).
"""

from __future__ import annotations

import copy

import pytest

from plato_analyzer.vision import (
    STRIP_FPS,
    VisionMergeError,
    build_manifest,
    build_sheets,
    build_strips,
    merge_vision,
    render_grid,
)


def _skeleton(n_shots: int = 2) -> dict:
    """Spec CV-only: `n_shots` shots contiguos de 2000ms, sin captions/textOverlays."""
    shots = [
        {
            "id": f"shot_{i + 1:03d}",
            "startMs": i * 2000,
            "endMs": (i + 1) * 2000,
            "durationMs": 2000,
            "transitionIn": {"type": "cut" if i else "open"},
            "camera": {"type": "static", "confidence": 0.8},
        }
        for i in range(n_shots)
    ]
    return {
        "specVersion": "0.2.0",
        "source": {"id": "x", "filename": "x.mp4", "durationMs": n_shots * 2000,
                   "fps": 24, "width": 720, "height": 1280, "codec": "h264"},
        "meta": {"analyzedAt": "2026-06-12", "analyzerVersion": "0.0.1"},
        "shots": shots,
    }


def _valid_caption(start: int, end: int) -> dict:
    return {
        "text": "¿vamos a ver una", "startMs": start, "endMs": end,
        "positionNorm": {"x": 0.62, "y": 0.32},
        "style": {"fontFamilyGuess": "rounded-sans", "color": "#FFFFFF",
                  "casing": "lowercase", "animation": "fade_in_word"},
        "source": "vision", "confidence": 0.85,
    }


def _valid_overlay(start: int, end: int) -> dict:
    return {"role": "kicker", "text": "POR ESO", "startMs": start, "endMs": end,
            "style": {"casing": "uppercase"}, "source": "vision", "confidence": 0.9}


# --- build_sheets (contact sheets) ---

def test_one_keyframe_per_shot_chunked_into_sheets() -> None:
    sheets = build_sheets(_skeleton(40), per_sheet=16)
    assert [s.id for s in sheets] == ["sheet_001", "sheet_002", "sheet_003"]
    assert sum(len(s.keyframes) for s in sheets) == 40


def test_keyframe_is_shot_midpoint_with_label() -> None:
    kf = build_sheets(_skeleton(1))[0].keyframes[0]
    assert kf.shotId == "shot_001"
    assert kf.ms == 1000  # midpoint de 0..2000
    assert "shot_001" in kf.label and "1.0s" in kf.label


# --- build_strips (ventanas densas) ---

def test_known_gap_becomes_a_dense_strip() -> None:
    spec = _skeleton(2)
    spec["knownGaps"] = [{"kind": "missed_cut", "approxMs": 3000,
                          "reason": "corte suave", "needs": "semantic_embedding"}]
    strips = build_strips(spec)
    assert len(strips) == 1
    st = strips[0]
    assert st.startMs <= 3000 < st.endMs
    assert all(st.startMs <= ms < st.endMs for ms in st.frameMs)
    assert list(st.frameMs) == sorted(st.frameMs)


def test_strip_is_sampled_near_24fps() -> None:
    spec = _skeleton(2)
    spec["knownGaps"] = [{"kind": "missed_cut", "approxMs": 3000, "reason": "x"}]
    st = build_strips(spec)[0]
    # ventana de 1000ms a ~24fps ≈ 24 frames (±1)
    assert 22 <= len(st.frameMs) <= 25


def test_extra_windows_become_strips() -> None:
    # las 2 ventanas densas reales (caption 83.96–85.30s, collage 120.95–122.30s) no son knownGaps
    strips = build_strips(_skeleton(2), extra_windows=[(83960, 85300), (120950, 122300)])
    assert len(strips) == 2


def test_no_gaps_no_extra_means_no_strips() -> None:
    assert build_strips(_skeleton(2)) == []


# --- build_manifest ---

def test_manifest_references_sheets_and_strips() -> None:
    spec = _skeleton(20)
    spec["knownGaps"] = [{"kind": "missed_cut", "approxMs": 3000, "reason": "x"}]
    manifest = build_manifest(spec, extra_windows=[(40000, 41000)])
    assert manifest["video"] == "x.mp4"
    assert manifest["fps"] == 24
    assert len(manifest["sheets"]) == 2  # 20 shots / 16
    assert set(manifest["sheets"][0]) == {"id", "file", "shots"}
    assert manifest["sheets"][0]["file"].endswith(".jpg")
    assert len(manifest["strips"]) == 2  # 1 gap + 1 extra
    assert set(manifest["strips"][0]) >= {"id", "file", "startMs", "endMs", "fps"}
    assert manifest["strips"][0]["fps"] == STRIP_FPS


# --- render_grid (Pillow, sin ffmpeg) ---

def test_render_grid_tiles_synthetic_images(tmp_path) -> None:
    from PIL import Image

    cells = []
    for i in range(5):
        p = tmp_path / f"f{i}.png"
        Image.new("RGB", (64, 36), (200, 0, 0)).save(p)
        cells.append((p, f"shot_{i:03d} 1.0s"))

    out = tmp_path / "sheet.jpg"
    render_grid(cells, out, cols=2, cell_w=100, cell_h=60, label_h=14, pad=4)
    assert out.exists()
    with Image.open(out) as im:
        assert im.width == 2 * (100 + 4) + 4  # cols * (cell_w + pad) + pad


# --- merge_vision (sin cambios respecto al contrato anterior) ---

def test_merge_inserts_valid_caption_and_revalidates() -> None:
    merged = merge_vision(_skeleton(), {"captions": [_valid_caption(300, 1400)]})
    assert merged["captions"][0]["id"] == "cap_001"
    assert merged["captions"][0]["source"] == "vision"


def test_merge_inserts_text_overlay() -> None:
    merged = merge_vision(_skeleton(), {"textOverlays": [_valid_overlay(1000, 1500)]})
    assert merged["textOverlays"][0]["id"] == "ovl_001"
    assert merged["textOverlays"][0]["role"] == "kicker"


def test_merge_sorts_by_start_ms_and_assigns_ids_in_order() -> None:
    fragment = {"captions": [_valid_caption(1200, 1400), _valid_caption(300, 1100)]}
    merged = merge_vision(_skeleton(), fragment)
    assert [c["startMs"] for c in merged["captions"]] == [300, 1200]
    assert [c["id"] for c in merged["captions"]] == ["cap_001", "cap_002"]


def test_merge_rejects_invalid_entry_and_leaves_spec_untouched() -> None:
    spec = _skeleton()
    before = copy.deepcopy(spec)
    bad = _valid_caption(300, 1400)
    del bad["endMs"]
    with pytest.raises(VisionMergeError):
        merge_vision(spec, {"captions": [bad]})
    assert spec == before


def test_merge_empty_fragment_is_noop() -> None:
    merged = merge_vision(_skeleton(), {})
    assert "captions" not in merged or merged["captions"] == []
