"""Motion (CV): movimiento de CÁMARA vs OBJETO por shot → bloques `camera`/`object`.

Capa de análisis opcional del VideoSpec (ADR-0001, enriquecimiento pipe-and-filter
ADR-0003). La decisión clave es ADR-0007: el movimiento de CÁMARA se estima como un
MODELO GLOBAL (ajustado vía RANSAC sobre correspondencias de features), y el movimiento
de OBJETO es lo que el modelo global NO explica (los outliers). Cuando el sujeto llena el
cuadro, cámara y objeto son indistinguibles: se FLAGEA `ambiguous=True`, no se adivina.

La función PURA (`classify_motion`) recibe estadísticas YA computadas (`FlowStats`) y es
testeable sin video. El shell-out (`motion_for_shot`) muestrea frames, ajusta la homografía
global con RANSAC, deriva las `FlowStats` y delega en la función pura.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

# --- Umbrales de clasificación (documentados; coordenadas NORMALIZADAS por el lado del frame).
# Todas las magnitudes son fracciones del tamaño del cuadro por frame muestreado, así que son
# resolución-independientes. Calibrados contra el rango del golden (static ~0.02, punch_in ~0.12).
STATIC_MAG = 0.010        # magnitud global por debajo → cámara quieta
DRIFT_MAG = 0.030         # entre STATIC y DRIFT, movimiento pequeño no direccional → drift_subtle
PAN_RATIO = 1.8           # |desplazamiento dominante| / (divergencia·escala) → traslación manda → pan
DIVERGENCE_MIN = 0.010    # |divergencia| por encima → cambio de escala real (punch_in/zoom_out)
INLIER_OK = 0.55          # fracción de inliers RANSAC mínima para confiar en el modelo global
OUTLIER_HIGH = 0.45       # outlierRatio por encima → object.activity = high
OUTLIER_MED = 0.25        # entre MED y HIGH → medium; por debajo → low
AMBIGUOUS_OUTLIERS = 0.60  # outlierRatio por encima + modelo flojo → ambiguous (sujeto llena cuadro)
MIN_FRAMES = 3            # pares de frames mínimos para intentar un modelo; menos → unknown


@dataclass(frozen=True)
class FlowStats:
    """Estadísticas del flujo global ya agregadas sobre el shot (entrada de la función pura).

    Todo en coordenadas normalizadas (fracción del lado del cuadro), promediadas por frame.

    - `dx`, `dy`: traslación media del modelo global (lateral/vertical).
    - `divergence`: cambio de escala medio (>0 acercándose/punch_in, <0 alejándose/zoom_out).
    - `magnitude`: magnitud media del movimiento global (norma del vector dominante + escala).
    - `outlierRatio`: fracción de correspondencias que el modelo global NO explica (→ objeto).
    - `inlierRatio`: fracción de correspondencias que SÍ explica (calidad del ajuste RANSAC).
    - `nFrames`: pares de frames efectivamente usados para estimar el modelo.
    """

    dx: float
    dy: float
    divergence: float
    magnitude: float
    outlierRatio: float
    inlierRatio: float
    nFrames: int


@dataclass(frozen=True)
class Camera:
    """Bloque `camera` del VideoSpec (movimiento de CÁMARA, modelo global). `to_dict()` omite
    los opcionales no aplicables (p.ej. static no reporta `panFrac`)."""

    type: str
    confidence: float
    magnitude: float | None = None
    panFrac: float | None = None
    ambiguous: bool = False

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"type": self.type, "confidence": round(self.confidence, 3)}
        if self.magnitude is not None:
            out["magnitude"] = round(self.magnitude, 4)
        if self.panFrac is not None:
            out["panFrac"] = round(self.panFrac, 3)
        if self.ambiguous:
            out["ambiguous"] = True
        return out


@dataclass(frozen=True)
class Object:
    """Bloque `object` del VideoSpec (movimiento de OBJETO independiente, los outliers)."""

    activity: str
    outlierRatio: float | None = None

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"activity": self.activity}
        if self.outlierRatio is not None:
            out["outlierRatio"] = round(self.outlierRatio, 3)
        return out


@dataclass(frozen=True)
class MotionResult:
    """Resultado de la clasificación: las dos capas separadas (ADR-0007)."""

    camera: Camera
    object: Object


def _activity(outlier_ratio: float) -> str:
    """Mapea outlierRatio → nivel de actividad de objeto (umbrales documentados arriba)."""
    if outlier_ratio >= OUTLIER_HIGH:
        return "high"
    if outlier_ratio >= OUTLIER_MED:
        return "medium"
    return "low"


def classify_motion(stats: FlowStats) -> MotionResult:
    """Clasifica movimiento de cámara y objeto a partir de `FlowStats` (PURA, testeable).

    Lógica (ADR-0007):
    - Sin frames suficientes para un modelo → `unknown` en ambas capas, baja confianza.
    - outlierRatio muy alto + modelo flojo (pocos inliers) → `ambiguous=True`: el sujeto
      llena el cuadro, cámara y objeto son indistinguibles, NO se adivina el tipo.
    - magnitud global ~0 → `static`.
    - traslación lateral/vertical dominante sobre la escala → `pan` (panFrac = fracción
      horizontal del desplazamiento).
    - divergencia positiva (escala creciente) → `punch_in`; negativa → `zoom_out`.
    - movimiento pequeño no direccional → `drift_subtle`.
    - magnitud alta sin modelo estable (pocos inliers) → `handheld`.
    """
    obj_activity = _activity(stats.outlierRatio)

    # Sin material suficiente: no se inventa un modelo.
    if stats.nFrames < MIN_FRAMES:
        return MotionResult(
            camera=Camera(type="unknown", confidence=0.2, ambiguous=False),
            object=Object(activity="unknown", outlierRatio=None),
        )

    obj = Object(activity=obj_activity, outlierRatio=stats.outlierRatio)
    model_trustworthy = stats.inlierRatio >= INLIER_OK

    # Sujeto domina el cuadro → cámara/objeto indistinguibles: flag honesto, sin adivinar tipo.
    if stats.outlierRatio >= AMBIGUOUS_OUTLIERS and not model_trustworthy:
        return MotionResult(
            camera=Camera(
                type="unknown",
                magnitude=stats.magnitude,
                ambiguous=True,
                confidence=round(0.25 * stats.inlierRatio, 3),
            ),
            object=obj,
        )

    translation = (stats.dx**2 + stats.dy**2) ** 0.5
    abs_div = abs(stats.divergence)

    # La confianza base nace de la calidad del ajuste y baja con la dispersión (outliers).
    confidence = max(0.0, min(1.0, stats.inlierRatio * (1.0 - 0.5 * stats.outlierRatio)))

    # Cámara estática: nada se mueve globalmente.
    if stats.magnitude < STATIC_MAG and abs_div < DIVERGENCE_MIN:
        cam = Camera(type="static", magnitude=stats.magnitude,
                     ambiguous=False, confidence=confidence)
        return MotionResult(camera=cam, object=obj)

    # Modelo global poco fiable con harto movimiento → cámara en mano.
    if not model_trustworthy:
        cam = Camera(type="handheld", magnitude=stats.magnitude,
                     ambiguous=False, confidence=round(0.4 * confidence, 3))
        return MotionResult(camera=cam, object=obj)

    # Traslación domina claramente sobre el cambio de escala → paneo.
    if translation >= DRIFT_MAG and translation >= PAN_RATIO * abs_div:
        pan_frac = abs(stats.dx) / translation if translation > 0 else 0.0
        cam = Camera(type="pan", magnitude=stats.magnitude, panFrac=pan_frac,
                     ambiguous=False, confidence=confidence)
        return MotionResult(camera=cam, object=obj)

    # Cambio de escala real → punch_in (acercamiento) o zoom_out (alejamiento).
    if abs_div >= DIVERGENCE_MIN:
        cam_type = "punch_in" if stats.divergence > 0 else "zoom_out"
        cam = Camera(type=cam_type, magnitude=stats.magnitude,
                     ambiguous=False, confidence=confidence)
        return MotionResult(camera=cam, object=obj)

    # Movimiento pequeño, no claramente lateral ni de escala → deriva sutil.
    if stats.magnitude < DRIFT_MAG:
        cam = Camera(type="drift_subtle", magnitude=stats.magnitude,
                     ambiguous=False, confidence=confidence)
        return MotionResult(camera=cam, object=obj)

    # Movimiento medible pero no atribuible limpiamente a una familia → handheld.
    cam = Camera(type="handheld", magnitude=stats.magnitude,
                 ambiguous=False, confidence=round(0.5 * confidence, 3))
    return MotionResult(camera=cam, object=obj)


def _sample_frames(video: Path | str, start_ms: int, end_ms: int, sample_fps: int) -> list[Any]:
    """Muestrea frames en escala de grises del rango [start_ms, end_ms) a `sample_fps`."""
    import cv2

    cap = cv2.VideoCapture(str(video))
    try:
        step_ms = 1000.0 / max(1, sample_fps)
        frames = []
        t = float(start_ms)
        while t < end_ms:
            cap.set(cv2.CAP_PROP_POS_MSEC, t)
            ok, frame = cap.read()
            if not ok:
                break
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))
            t += step_ms
        return frames
    finally:
        cap.release()


def _flow_stats_from_frames(frames: list[Any]) -> FlowStats:
    """Estima el modelo global (homografía vía RANSAC, ADR-0007) entre frames consecutivos y
    agrega las estadísticas normalizadas. Outliers del modelo → movimiento de objeto."""
    import cv2
    import numpy as np

    if len(frames) < 2:
        return FlowStats(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, len(frames))

    h, w = frames[0].shape[:2]
    scale = float(max(h, w))
    feature_params = dict(maxCorners=400, qualityLevel=0.01, minDistance=7, blockSize=7)

    dxs, dys, divs, mags, inliers, outliers, pairs = [], [], [], [], [], [], 0
    for prev, nxt in zip(frames, frames[1:]):
        p0 = cv2.goodFeaturesToTrack(prev, mask=None, **feature_params)
        if p0 is None or len(p0) < 8:
            continue
        p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, nxt, p0, None)
        if p1 is None or st is None:
            continue
        good = st.reshape(-1) == 1
        src = p0[good].reshape(-1, 2)
        dst = p1[good].reshape(-1, 2)
        if len(src) < 8:
            continue

        H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)
        if H is None or mask is None:
            continue
        mask = mask.reshape(-1).astype(bool)
        n = len(mask)
        n_in = int(mask.sum())
        if n_in < 4:
            continue

        inlier_src = src[mask]
        inlier_dst = dst[mask]
        # Traslación media del modelo global sobre sus inliers, normalizada por el lado del cuadro.
        disp = (inlier_dst - inlier_src).mean(axis=0)
        dxs.append(float(disp[0]) / scale)
        dys.append(float(disp[1]) / scale)
        # Divergencia: cambio relativo en la dispersión radial de los inliers (escala → punch/zoom).
        c_src = inlier_src.mean(axis=0)
        c_dst = inlier_dst.mean(axis=0)
        r_src = np.linalg.norm(inlier_src - c_src, axis=1).mean() + 1e-6
        r_dst = np.linalg.norm(inlier_dst - c_dst, axis=1).mean() + 1e-6
        divs.append(float((r_dst - r_src) / r_src))
        mags.append(float(np.hypot(disp[0], disp[1])) / scale)
        inliers.append(n_in / n)
        outliers.append((n - n_in) / n)
        pairs += 1

    if pairs == 0:
        return FlowStats(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, len(frames))

    mean = lambda xs: float(sum(xs) / len(xs))  # noqa: E731
    return FlowStats(
        dx=mean(dxs),
        dy=mean(dys),
        divergence=mean(divs),
        magnitude=mean(mags),
        outlierRatio=mean(outliers),
        inlierRatio=mean(inliers),
        nFrames=pairs + 1,
    )


def motion_for_shot(
    video: Path | str,
    start_ms: int,
    end_ms: int,
    sample_fps: int = 6,
) -> MotionResult:
    """Muestrea el shot [start_ms, end_ms), estima el modelo global (RANSAC) y clasifica.

    Shell-out alrededor de la función pura `classify_motion`: aquí solo se decodifican frames
    y se computan las `FlowStats`; la decisión vive en la función testeable.
    """
    frames = _sample_frames(video, start_ms, end_ms, sample_fps)
    stats = _flow_stats_from_frames(frames)
    return classify_motion(stats)
