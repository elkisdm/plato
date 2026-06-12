"""Style (M3): agrega los shots ya analizados → bloque `style` del VideoSpec.

Lo numérico del estilo (pacing, vocabulario de cámara/transiciones, distribución de color) es
DERIVABLE de los shots — pura agregación, sin tocar el video. Lo semántico (typography,
captionStyle, structure, y un qualitativeSummary rico) es de la capa de visión (ADR-0007); acá
emitimos un `qualitativeSummary` FACTUAL templado para que el spec valide standalone — la visión
puede sobrescribirlo.
"""

from __future__ import annotations

from collections import Counter
from statistics import mean, median
from typing import Any, Sequence


def _pacing(shots: Sequence[dict[str, Any]], duration_ms: int) -> dict[str, Any]:
    durations = [int(s["durationMs"]) for s in shots]
    cuts = sum(1 for s in shots if (s.get("transitionIn") or {}).get("type") != "open")
    minutes = duration_ms / 60000 if duration_ms else 0
    return {
        "shots": len(shots),
        "cutsPerMin": round(cuts / minutes, 1) if minutes else 0,
        "avgShotMs": round(mean(durations)) if durations else 0,
        "medianShotMs": round(median(durations)) if durations else 0,
        "minShotMs": min(durations) if durations else 0,
        "maxShotMs": max(durations) if durations else 0,
    }


def _summary(pacing: dict[str, Any], transitions: dict[str, int], colors: dict[str, int] | None) -> str:
    parts = [
        f"{pacing['shots']} shots a {pacing['cutsPerMin']} cortes/min "
        f"(mediana {pacing['medianShotMs'] / 1000:.1f}s)."
    ]
    flashes = transitions.get("flash_cut", 0)
    dissolves = transitions.get("dissolve", 0)
    if flashes or dissolves:
        parts.append(f"Transiciones: {flashes} flash_cut, {dissolves} dissolve.")
    if colors:
        warm, neutral = colors.get("warm", 0), colors.get("neutral", 0)
        parts.append(f"Color: {warm} cálidos / {neutral} neutros.")
    parts.append("(resumen factual del CV; la capa de visión puede enriquecerlo.)")
    return " ".join(parts)


def aggregate_style(shots: Sequence[dict[str, Any]], duration_ms: int) -> dict[str, Any]:
    """Agrega los shot-dicts en el bloque `style`. Incluye pacing + qualitativeSummary (requeridos);
    motionVocabulary/colorGrade solo si los shots traen esas capas."""
    pacing = _pacing(shots, duration_ms)

    transitions = dict(Counter(
        (s.get("transitionIn") or {}).get("type", "cut")
        for s in shots if (s.get("transitionIn") or {}).get("type") != "open"
    ))

    style: dict[str, Any] = {"pacing": pacing, "transitionVocabulary": transitions}

    if any("camera" in s for s in shots):
        style["motionVocabulary"] = {
            "camera": dict(Counter(s["camera"]["type"] for s in shots if "camera" in s)),
            "objectActivity": dict(Counter(s["object"]["activity"] for s in shots if "object" in s)),
        }

    colors = None
    if any("color" in s for s in shots):
        colors = dict(Counter(s["color"]["temperature"] for s in shots if "color" in s))
        style["colorGrade"] = {"macroDistribution": colors}

    style["qualitativeSummary"] = _summary(pacing, transitions, colors)
    return style
