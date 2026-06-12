# GENERADO desde schema/videospec.schema.json — NO editar a mano (ADR-0001). Regenerar: make codegen

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, RootModel


class Source(BaseModel):
    """
    Metadatos del archivo de origen (de ffprobe).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    filename: str
    durationMs: int = Field(..., ge=0)
    fps: float = Field(..., gt=0.0)
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)
    codec: str


class Meta(BaseModel):
    """
    Metadatos de la corrida. Permisivo: el analyzer puede anexar parámetros.
    """
    model_config = ConfigDict(
        extra='allow',
    )
    analyzedAt: str = Field(..., description='Fecha o timestamp ISO-8601.')
    analyzerVersion: str = Field(..., description='Iteración del PIPELINE (eje distinto de specVersion).')
    samplingFps: float | None = Field(None, gt=0.0)
    microWindowsFps: float | None = Field(None, gt=0.0)
    notes: str | None = None


class Type(StrEnum):
    static = 'static'
    pan = 'pan'
    punch_in = 'punch_in'
    zoom_out = 'zoom_out'
    drift_subtle = 'drift_subtle'
    handheld = 'handheld'
    unknown = 'unknown'


class Activity(StrEnum):
    low = 'low'
    medium = 'medium'
    high = 'high'
    unknown = 'unknown'


class Object(BaseModel):
    """
    Movimiento de OBJETO independiente (outliers del modelo de cámara). activity es feature de estilo dependiente del mundo (talking-head alto vs collage bajo).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    activity: Activity
    outlierRatio: float | None = Field(None, ge=0.0, le=1.0)


class Temperature(StrEnum):
    warm = 'warm'
    neutral = 'neutral'
    cool = 'cool'


class Saturation(StrEnum):
    high = 'high'
    medium = 'medium'
    low = 'low'


class Contrast(StrEnum):
    high = 'high'
    medium = 'medium'
    low = 'low'


class Type1(StrEnum):
    open = 'open'
    cut = 'cut'
    flash_cut = 'flash_cut'
    dissolve = 'dissolve'
    wipe = 'wipe'
    whip_pan = 'whip_pan'
    white_flash = 'white_flash'
    dissolve_or_fast_motion = 'dissolve_or_fast_motion'


class Role(StrEnum):
    lower_third = 'lower_third'
    title = 'title'
    emphasis = 'emphasis'
    kicker = 'kicker'
    emphasis_scatter = 'emphasis_scatter'


class Casing(StrEnum):
    lowercase = 'lowercase'
    uppercase = 'uppercase'
    title = 'title'
    mixed = 'mixed'


class BeatsM(RootModel[int]):
    root: int = Field(..., ge=0)


class Silence(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    startMs: int = Field(..., ge=0)
    endMs: int = Field(..., ge=0)


class Audio(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    transcriptRef: str | None = Field(None, description='Ruta al transcript en Caption-shape. null si no se transcribió.')
    beatsMs: list[BeatsM] | None = None
    silences: list[Silence]
    loudnessLufs: float
    notes: str | None = None


class Pacing(BaseModel):
    model_config = ConfigDict(
        extra='allow',
    )
    cutsPerMin: float = Field(..., ge=0.0)
    avgShotMs: float = Field(..., ge=0.0)
    medianShotMs: float = Field(..., ge=0.0)
    minShotMs: float | None = Field(None, ge=0.0)
    maxShotMs: float | None = Field(None, ge=0.0)
    buckets: dict[str, int] | None = None


class StructureItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    act: str
    fromMs: int = Field(..., ge=0)
    toMs: int = Field(..., ge=0)


class Style(BaseModel):
    """
    Lectura cualitativa+agregada. Permisivo (prosa y agregados que evolucionan). Solo pacing y qualitativeSummary requeridos.
    """
    model_config = ConfigDict(
        extra='allow',
    )
    pacing: Pacing
    motionVocabulary: dict[str, Any] | None = None
    typography: dict[str, Any] | None = None
    colorGrade: dict[str, Any] | None = None
    transitionVocabulary: Any | None = None
    captionStyle: str | None = None
    structure: list[StructureItem] | None = None
    qualitativeSummary: str


class Kind(StrEnum):
    """
    Tipo de gap.
    """
    missed_cut = 'missed_cut'
    ambiguous_motion = 'ambiguous_motion'
    uncertain_caption = 'uncertain_caption'
    missing_transcript = 'missing_transcript'
    other = 'other'


class KnownGap(BaseModel):
    """
    Un límite conocido y estructurado del análisis.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    kind: Kind = Field(..., description='Tipo de gap.')
    approxMs: int | None = Field(None, description='Ubicación aproximada, si aplica.', ge=0)
    reason: str
    needs: str | None = Field(None, description="Qué herramienta/step lo resolvería (p.ej. 'semantic_embedding').")


class Hook(BaseModel):
    """
    Qué captura la atención en los primeros segundos y por qué.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    atMs: int | None = Field(None, ge=0)
    text: str | None = None
    device: str = Field(..., description='Mecanismo del hook (abierto, con valores conocidos).', examples=['relatable_scene', 'bold_claim', 'question', 'pattern_interrupt', 'in_media_res', 'visual_shock', 'curiosity_gap'])
    why: str = Field(..., description='Por qué funciona.')


class OpenLoop(BaseModel):
    """
    Una pregunta/curiosity gap abierto que arrastra al espectador.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    atMs: int | None = Field(None, ge=0)
    text: str
    resolvedAtMs: int | None = Field(None, description='Cuándo se cierra el loop, si se cierra.', ge=0)


class EmotionalBeat(BaseModel):
    """
    Un tramo del arco emocional.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    fromMs: int | None = Field(None, ge=0)
    toMs: int | None = Field(None, ge=0)
    emotion: str
    note: str | None = None


class FormMeaning(BaseModel):
    """
    Cómo un recurso visual ARGUMENTA: forma como significado.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    device: str = Field(..., description="El tratamiento visual (p.ej. 'talking-head cálido').")
    meaning: str = Field(..., description="Qué significa/aporta narrativamente (p.ej. 'confesión íntima').")


class RetentionDevice(BaseModel):
    """
    Un mecanismo de retención conceptual (no sensorial).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    kind: str = Field(..., description='Tipo de mecanismo (abierto, con valores conocidos).', examples=['open_loop', 'pattern_interrupt', 'payoff', 'callback', 'escalation', 'relatability', 'contrast_worlds', 'cliffhanger'])
    atMs: int | None = Field(None, ge=0)
    note: str


class Payoff(BaseModel):
    """
    Qué se lleva el espectador: el cierre del arco.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    atMs: int | None = Field(None, ge=0)
    text: str
    type: str | None = Field(None, description='Tipo de cierre (abierto, con valores conocidos).', examples=['resolution', 'twist', 'lesson', 'call_to_action', 'catharsis'])


class PositionNorm(BaseModel):
    """
    Posición normalizada 0–1 (resolución-independiente).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    x: float = Field(..., ge=0.0, le=1.0)
    y: float = Field(..., ge=0.0, le=1.0)


class ConfidenceScore(RootModel[float]):
    root: float = Field(..., description='Confianza por campo en [0,1].', ge=0.0, le=1.0)


class HexColor(RootModel[str]):
    root: str = Field(..., pattern='^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')


class TextSource(RootModel[str]):
    root: str = Field(..., description='Provenance del texto. Abierto pero con valores conocidos.', examples=['ocr', 'vision', 'ocr+vision', 'vision+24fps_strip'])


class Camera(BaseModel):
    """
    Movimiento de CÁMARA (modelo global vía RANSAC, ADR-0007). Separado del movimiento de objeto. magnitude/panFrac aproximados — confidence honesto. easing NO es campo estructurado (es direccional, vive en confidence).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type
    magnitude: float | None = Field(None, ge=0.0)
    panFrac: float | None = Field(None, ge=0.0, le=1.0)
    ambiguous: bool | None = Field(None, description='Cámara vs objeto indistinguible (el sujeto llena el cuadro). Flag estructurado, no prosa.')
    confidence: ConfidenceScore


class Color(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    meanLab: list[float] | None = Field(None, description='Color medio en CIELAB [L, a, b].', max_length=3, min_length=3)
    palette: list[HexColor] | None = None
    temperature: Temperature
    saturation: Saturation
    contrast: Contrast


class TransitionIn(BaseModel):
    """
    Transición de ENTRADA al shot (por-frontera, autoritativa). Etiquetada, no solo contada. 'open' = primer shot, sin transición previa.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    type: Type1
    durationMs: int | None = Field(None, ge=0)
    confidence: ConfidenceScore | None = None


class TextStyle(BaseModel):
    """
    Descriptor tipográfico. Abierto a propósito (tratamiento cualitativo que evoluciona).
    """
    model_config = ConfigDict(
        extra='allow',
    )
    fontFamilyGuess: str | None = None
    color: HexColor | None = None
    highlightColor: HexColor | None = None
    casing: Casing | None = None
    animation: str | None = None


class Confidence(BaseModel):
    """
    Confianza global + por capa (motionLayer, cutDetection, ...). Permisivo: cada capa documenta su trustworthy/flagged.
    """
    model_config = ConfigDict(
        extra='allow',
    )
    overall: ConfidenceScore
    notes: str | None = None


class Narrative(BaseModel):
    """
    OPCIONAL. La capa CONCEPTUAL: por qué el video engancha (la historia y la retención cognitiva/emocional, no la mecánica). La escribe la sesión de visión (ADR-0007), no el CV. Permisivo a propósito (lectura interpretativa que evoluciona); solo hook y thesis requeridos.
    """
    model_config = ConfigDict(
        extra='allow',
    )
    hook: Hook
    thesis: str = Field(..., description='El mensaje central / throughline en una frase.')
    throughline: str | None = Field(None, description='La pregunta o tensión que sostiene todo el video.')
    openLoops: list[OpenLoop] | None = None
    emotionalArc: list[EmotionalBeat] | None = None
    formAsMeaning: list[FormMeaning] | None = None
    retentionDevices: list[RetentionDevice] | None = None
    payoff: Payoff | None = None
    targetEmotion: str | None = Field(None, description='La emoción con la que queda el espectador.')
    confidence: ConfidenceScore | None = None


class Shot(BaseModel):
    """
    Un plano. Requerido: la identidad temporal (esqueleto). Las capas de análisis (camera, object, color, transitionIn, keyframeUri) son OPCIONALES — se anexan por enriquecimiento.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    startMs: int = Field(..., ge=0)
    endMs: int = Field(..., ge=0)
    durationMs: int = Field(..., ge=0)
    keyframeUri: str | None = Field(None, description='Ruta al keyframe representativo. Opcional (lo escribe el step de keyframes; lo necesita la capa de visión).')
    camera: Camera | None = None
    object: Object | None = None
    color: Color | None = None
    transitionIn: TransitionIn | None = None


class Caption(BaseModel):
    """
    Texto hablado/karaoke. positionNorm opcional. style abierto (el tratamiento varía).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    text: str
    startMs: int = Field(..., ge=0)
    endMs: int = Field(..., ge=0)
    positionNorm: PositionNorm | None = None
    style: TextStyle
    source: TextSource
    confidence: ConfidenceScore


class TextOverlay(BaseModel):
    """
    Texto gráfico (no transcripción): kickers, títulos, énfasis esparcido.
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    id: str
    role: Role
    text: str
    startMs: int = Field(..., ge=0)
    endMs: int = Field(..., ge=0)
    positionNorm: PositionNorm | None = None
    style: TextStyle
    source: TextSource
    confidence: ConfidenceScore


class VideoSpec(BaseModel):
    """
    Spec canónico de Plató (v0.3.0). Fuente de verdad única (ADR-0001). El pipeline ENRIQUECE el spec por capas (pipe-and-filter, ADR-0003), así que solo el esqueleto es requerido y cada capa de análisis es OPCIONAL. Gate duro en FORMA (cuando una capa está, se valida estricta), suave en PRESENCIA (un spec parcial M1 valida igual). v0.3.0: + capa narrative (conceptual, ADR-0010).
    """
    model_config = ConfigDict(
        extra='forbid',
    )
    specVersion: str = Field(..., description='Versión del CONTRATO (forma). Distinta de meta.analyzerVersion (iteración del pipeline). Una capa nueva-opcional es minor; un cambio de forma de un campo existente es breaking.', pattern='^\\d+\\.\\d+\\.\\d+$')
    source: Source
    meta: Meta
    shots: list[Shot]
    transitions: dict[str, Any] | None = Field(None, description='OPCIONAL. Resumen agregado de transiciones (conteos, dispositivos de estilo). El dato por-frontera autoritativo vive en shots[].transitionIn.')
    captions: list[Caption] | None = None
    textOverlays: list[TextOverlay] | None = None
    audio: Audio | None = None
    style: Style | None = None
    confidence: Confidence | None = None
    knownGaps: list[KnownGap] | None = Field(None, description='OPCIONAL. Límites conocidos del análisis, estructurados (no en prosa). Honestidad-como-feature: un consumidor puede ramificar sobre esto. Lo que un step posterior (p.ej. embeddings) debe rellenar.')
    narrative: Narrative | None = None
