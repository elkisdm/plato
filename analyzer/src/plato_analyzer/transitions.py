"""Transitions (M1+): re-etiqueta el TIPO de transición de entrada de cada shot.

Tercera capa de etiquetado del CV (ADR-0003/0007), POSTERIOR a shots.py. `detect_shots`
localiza los cortes y los marca todos como `cut` (salvo el primero, `open`). Aquí releemos
cada frontera y la RE-etiquetamos cuando es una firma de estilo:

- **flash_cut**: un destello casi blanco (luma ≥ 245) de 1-2 frames JUSTO en el corte.
  Firma del estilo de este video (verificado: escena A → 1-2 frames blancos → escena B,
  ~12 veces, p.ej. ~121.0s). Es el caso de mayor valor.
- **dissolve**: cross-fade — la diferencia de histograma se REPARTE de forma gradual en
  varios frames (ningún frame domina el cambio total), en vez de un único salto seco.
- si no es ninguno ⇒ queda `cut`.

La lógica PURA (`classify_transition`) decide a partir de estadísticas de la ventana del
corte y se testea con datos sintéticos. El shell-out (`relabel_shot_transitions` con su
`_boundary_stats` por defecto) muestrea frames reales con cv2 (escala de grises) y delega
en la lógica pura. El esqueleto temporal del shot NUNCA se toca: solo cambia `transitionIn`
(los `Shot` son frozen ⇒ `dataclasses.replace`).
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path
from typing import Callable, Sequence

from plato_analyzer.shots import Shot

# --------------------------------------------------------------------------- #
# Umbrales (documentados, en un solo lugar para calibración honesta).
# --------------------------------------------------------------------------- #
WHITE_LUMA = 245.0
"""Luma media (0-255) a partir de la cual un frame se considera 'casi blanco'.
El estilo del video usa ~252 (blanco puro). 245 deja margen sin tragar frames claros."""

WINDOW_FRAMES = 5
"""Frames muestreados alrededor de la frontera (centrados en el corte: ~±2 frames)."""

DISSOLVE_MIN_FRAMES = 3
"""Mínimo de frames con diferencia 'media' para considerar un cambio gradual (cross-fade)."""

DISSOLVE_DIFF_FLOOR = 0.12
"""Una diferencia de histograma (0-1) cuenta como 'activa' si supera este piso."""

CUT_DOMINANCE = 0.55
"""Si un único frame concentra ≥ esta fracción de la diferencia total, es un salto seco ⇒ cut.
Por debajo (y con varios frames activos) el cambio está repartido ⇒ candidato a dissolve."""


@dataclass(frozen=True)
class BoundaryStats:
    """Estadísticas de la ventana alrededor de un corte (entrada de la lógica pura).

    - `luma`: luminancia media (0-255) de cada frame muestreado en la ventana.
    - `hist_diffs`: distancia de histograma frame-a-frame (0-1) dentro de la ventana
      (longitud = len(luma) - 1). Mide cuánto cambia el contenido entre frames vecinos.
    """

    luma: Sequence[float]
    hist_diffs: Sequence[float]


def classify_transition(stats: BoundaryStats) -> str:
    """Clasifica una frontera como 'flash_cut' | 'dissolve' | 'cut' (puro, testeable).

    Orden de precedencia (el blanco manda, es la firma más fuerte y específica):

    1. **flash_cut** — existe ≥1 frame con luma media ≥ ``WHITE_LUMA`` (casi blanco) en la
       ventana del corte. Gana incluso si la diferencia parece repartida.
    2. **dissolve** — el cambio de histograma se REPARTE: hay ≥ ``DISSOLVE_MIN_FRAMES``
       frames con diferencia activa (> ``DISSOLVE_DIFF_FLOOR``) y NINGÚN frame domina
       (la fracción máxima sobre el total < ``CUT_DOMINANCE``). Es un cross-fade.
    3. **cut** — todo lo demás: un único salto seco dominante, o cambios despreciables.
       Default seguro: ante la duda NO inventamos una transición de estilo.
    """
    luma = list(stats.luma)
    diffs = list(stats.hist_diffs)

    # 1. flash_cut: destello casi blanco en la ventana.
    if luma and max(luma) >= WHITE_LUMA:
        return "flash_cut"

    # 2. dissolve: diferencia repartida en varios frames, sin un salto dominante.
    total = sum(diffs)
    if total > 0:
        active = sum(1 for d in diffs if d > DISSOLVE_DIFF_FLOOR)
        dominance = max(diffs) / total
        if active >= DISSOLVE_MIN_FRAMES and dominance < CUT_DOMINANCE:
            return "dissolve"

    # 3. cut: salto seco o nada relevante.
    return "cut"


# Firma de la función que produce stats para un shot (inyectable ⇒ testeable sin video).
StatsFn = Callable[[object, Shot], "BoundaryStats | None"]


def relabel_shot_transitions(
    shots: Sequence[Shot],
    video: Path | str,
    stats_fn: StatsFn | None = None,
) -> list[Shot]:
    """Re-etiqueta el `transitionIn` de cada frontera de `shots` (shell-out + lógica pura).

    El primer shot (`open`) NUNCA se toca: no hay corte que lo inicie. Para el resto, obtiene
    las estadísticas de su frontera (vía `stats_fn`, por defecto `_boundary_stats` con cv2),
    las clasifica con `classify_transition` y emite un `Shot` nuevo con el tipo re-etiquetado
    (los `Shot` son frozen ⇒ `dataclasses.replace`). El esqueleto temporal queda intacto.

    `stats_fn` se inyecta para testear el re-etiquetado sin decodificar video.
    """
    fn = stats_fn or _boundary_stats
    out: list[Shot] = []
    for shot in shots:
        if shot.transitionIn == "open":
            out.append(shot)
            continue
        stats = fn(video, shot)
        label = "cut" if stats is None else classify_transition(stats)
        out.append(replace(shot, transitionIn=label))
    return out


def _boundary_stats(video: Path | str, shot: Shot, fps: float = 24.0) -> BoundaryStats | None:
    """Muestrea ``WINDOW_FRAMES`` frames centrados en el inicio del shot y calcula sus stats.

    Lee la luminancia media (gris) de cada frame y la distancia de histograma (correlación
    invertida, 0-1) entre frames vecinos. El corte de entrada del shot está en ``startMs``,
    así que centramos la ventana ahí para captar el destello/cross-fade. Devuelve ``None`` si
    no se pudo leer ningún frame (⇒ `relabel_shot_transitions` deja `cut`).
    """
    import cv2
    import numpy as np

    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        return None
    real_fps = cap.get(cv2.CAP_PROP_FPS) or fps
    frame_dur_ms = 1000.0 / real_fps if real_fps else 1000.0 / fps

    half = WINDOW_FRAMES // 2
    luma: list[float] = []
    grays: list[object] = []
    try:
        for offset in range(-half, WINDOW_FRAMES - half):
            ms = shot.startMs + offset * frame_dur_ms
            if ms < 0:
                continue
            cap.set(cv2.CAP_PROP_POS_MSEC, ms)
            ok, frame = cap.read()
            if not ok or frame is None:
                continue
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            luma.append(float(gray.mean()))
            grays.append(gray)
    finally:
        cap.release()

    if not luma:
        return None

    hist_diffs: list[float] = []
    for prev, nxt in zip(grays, grays[1:]):
        hp = cv2.calcHist([prev], [0], None, [64], [0, 256])
        hn = cv2.calcHist([nxt], [0], None, [64], [0, 256])
        cv2.normalize(hp, hp)
        cv2.normalize(hn, hn)
        # Correlación (1 = idénticos) → distancia (0 = idénticos, 1 = totalmente distintos).
        corr = float(cv2.compareHist(hp, hn, cv2.HISTCMP_CORREL))
        hist_diffs.append(max(0.0, min(1.0, 1.0 - corr)))

    return BoundaryStats(luma=luma, hist_diffs=hist_diffs)
