# PRD — Plató · Fundaciones (v0.1)

> **Codename:** `Plató` (placeholder — el set donde el crew trabaja bajo el director). Renómbralo cuando quieras.
> **Spec format:** `VideoSpec` (el guion/EDL canónico).
> **Scope de este PRD:** SOLO las fundaciones — la columna (spec canónico) + el primer slice (`analizar → spec`). NO incluye editar ni crear assets (eso son slices posteriores).

---

## 1. Problema

Hoy no existe forma sistemática de **leer la edición de un video ya terminado** — su ritmo, transiciones, tipografía, color, animaciones — y convertirla en algo replicable. ffmpeg extrae frames pero no *analiza*: te deja con imágenes sueltas, sin pacing, sin clasificación de movimiento, sin estilo. El resultado es que cada vez que quiero replicar un estilo (ej: el de un infoproductor de referencia), lo hago a ojo y a mano.

Falta el eslabón **video → entendimiento → spec replicable**, y un formato común que después alimente la edición y la creación de assets.

## 2. Visión (el loop completo, para contexto)

```
[video crudo o de referencia]
        │  analizar
        ▼
   VideoSpec (JSON canónico)  ◄── única fuente de verdad
        │                  │
   editar                crear assets
        ▼                  ▼
   [render final]     [componentes Remotion]
```

Una herramienta donde **cada acción es un workflow** que el director (Claude Code) invoca, y todos hablan el mismo idioma: el `VideoSpec`. El análisis lo **escribe**; editar y crear assets lo **leen**. Por eso el loop cierra: `analizar → spec → reconstruir`.

**Esta PRD construye solo la mitad izquierda: el spec + el análisis.**

## 3. Objetivos de las fundaciones

1. Definir el **schema canónico `VideoSpec`** versionado, validable, y con una sola fuente de verdad que genere tipos para Python (Pydantic) y TS (Zod).
2. Construir el pipeline `analizar → spec`: dado un video corto arbitrario, producir un `VideoSpec` válido que capture shots, pacing, transiciones, captions/overlays (texto + estilo), color y una lectura cualitativa de estilo — con confidence por campo.
3. Dejar la arquitectura de orquestación lista (Claude Code skills, una por acción) para colgar los slices futuros sin refactor.

## 4. No-objetivos (explícito — esto NO se hace ahora)

- ❌ Workflow de **edición** (keep/cut → render). Slice posterior.
- ❌ **Generación de assets** (componentes Remotion). Slice posterior.
- ❌ **Timing al milisegundo** de micro-animaciones. Techo técnico duro: el análisis trabaja sobre frames muestreados, no sobre el render continuo. Se captura estilo y curva *aproximada*, no clonación frame-exacta. Esto es límite físico, no de prompting.
- ❌ UI / dashboard. Primero CLI + JSON. La cara visual viene después.
- ❌ Tiempo real / streaming. Batch sobre archivos.
- ❌ Soportar todo formato/codec exótico. MP4/MOV H.264/H.265 primero.

## 5. Usuarios

- **Primario:** yo (solo dev), vía Claude Code, sobre videos de referencia y videos propios.
- **Secundario futuro:** la herramienta como producto, pero fuera de scope de fundaciones.

---

## 6. Arquitectura

### 6.1 Tres capas

| Capa | Qué es | Metáfora |
|---|---|---|
| **Orquestador** | Claude Code + skills/commands (markdown + scripts), una por acción | Director |
| **Spec canónico** | `VideoSpec` JSON versionado + validador | Guion / EDL |
| **Tools** | Analizadores que escriben el spec | Crew |

### 6.2 Principio rector

**El formato es el producto, no las features.** Toda tool lee/escribe `VideoSpec`. Una tool nueva solo tiene que respetar el contrato del schema. Nada se comunica fuera del spec.

### 6.3 Fuente de verdad del schema

`videospec.schema.json` (JSON Schema) es la verdad. De ahí se generan:
- **Pydantic models** (`datamodel-code-generator`) → tools en Python.
- **Zod schemas** (`json-schema-to-zod`) → futura capa TS / Remotion.

Así Python (donde vive el ecosistema CV/audio) y TS (donde vive Remotion/tu stack) nunca se desincronizan.

---

## 7. El `VideoSpec` (columna — el entregable más importante)

Borrador v0.1. Todo en milisegundos. Coordenadas normalizadas (0–1) para resolución-independencia.

```jsonc
{
  "specVersion": "0.1.0",
  "source": {
    "id": "uuid",
    "filename": "ref-alborna-01.mp4",
    "durationMs": 47200,
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "codec": "h264"
  },
  "meta": {
    "analyzedAt": "2026-06-12T00:00:00Z",
    "analyzerVersion": "0.1.0",
    "samplingFps": 10            // resolución temporal usada en el análisis
  },

  "shots": [
    {
      "id": "shot_001",
      "startMs": 0,
      "endMs": 2400,
      "durationMs": 2400,
      "keyframeUri": "frames/shot_001.jpg",
      "transitionIn":  { "type": "cut", "durationMs": 0 },
      "transitionOut": { "type": "dissolve", "durationMs": 300 },
      "motion": {
        "type": "punch_in",          // static | punch_in | pan | zoom_out | handheld
        "magnitude": 0.18,           // p.ej. 18% de scale
        "easing": "ease_out",        // linear | ease_in | ease_out | spring | unknown
        "confidence": 0.62
      },
      "color": {
        "dominantLab": [[62,12,30],[20,3,-5]],
        "temperature": "warm",
        "saturation": "high",
        "contrast": "high"
      }
    }
  ],

  "transitions": [
    { "atMs": 2400, "type": "dissolve", "durationMs": 300, "confidence": 0.7 }
  ],

  "captions": [
    {
      "id": "cap_001",
      "text": "esto cambia todo",
      "startMs": 1200, "endMs": 1900,
      "positionNorm": { "x": 0.5, "y": 0.78 },
      "style": {
        "fontFamilyGuess": "sans-bold",
        "color": "#FFFFFF",
        "highlightColor": "#FFD700",
        "casing": "lowercase",
        "animation": "word_by_word_bounce"   // none | fade | pop | word_by_word_* | typewriter
      },
      "source": "ocr+vision",
      "confidence": 0.74
    }
  ],

  "textOverlays": [
    {
      "id": "ovl_001",
      "role": "lower_third",        // lower_third | title | emphasis | kicker
      "text": "Capital Inteligente",
      "startMs": 800, "endMs": 3600,
      "positionNorm": { "x": 0.12, "y": 0.88 },
      "style": { "fontFamilyGuess": "sans-medium", "animation": "slide_in_left" },
      "confidence": 0.6
    }
  ],

  "audio": {
    "transcriptRef": "transcript.json",   // Caption-shape (compatible Remotion)
    "beatsMs": [480, 960, 1440],
    "silences": [ { "startMs": 4100, "endMs": 4600 } ],
    "loudnessLufs": -14.2
  },

  "style": {
    "pacing": { "cutsPerMin": 28, "avgShotMs": 2100, "medianShotMs": 1800 },
    "typography": { "families": ["sans-bold","sans-medium"], "casing": "mixed" },
    "colorGrade": { "paletteLab": [], "temperature": "warm", "look": "high-contrast punchy" },
    "transitionVocabulary": ["cut","dissolve","whip_pan"],
    "captionStyle": "tiktok word-by-word, gold highlight, bounce",
    "qualitativeSummary": "Ritmo rápido infoproductor. Punch-ins en énfasis, captions kinéticos, color cálido saturado, cortes al beat."
  },

  "confidence": {
    "overall": 0.68,
    "notes": "Easing y timing fino son aproximados (frames muestreados)."
  }
}
```

> Decisiones de diseño: ms en vez de frames (independiente de fps), posiciones normalizadas, `confidence` por campo (el análisis es probabilístico — no mentir con falsa precisión), `transcriptRef` en Caption-shape para que el slice de edición/captions ya enchufe a Remotion sin convertir.

---

## 8. Pipeline `analizar → spec`

Orden y herramienta por paso. Cada paso **enriquece** el mismo spec.

| # | Paso | Tool | Escribe en spec |
|---|---|---|---|
| 1 | Probe | `ffprobe` | `source`, `meta` |
| 2 | Detección de shots | **PySceneDetect** (content + adaptive) | `shots[].start/end`, `transitions` (cut vs disolvencia) |
| 3 | Keyframes | ffmpeg (1 frame representativo por shot) | `shots[].keyframeUri` |
| 4 | Movimiento | **OpenCV optical flow** | `shots[].motion` (tipo + magnitud + easing aprox.) |
| 5 | Transiciones finas | SSIM / diff en el borde | `transitions[].type/duration` (cut\|dissolve\|wipe) |
| 6 | Texto | **OCR** (PaddleOCR > Tesseract) en ventanas de interés | `captions`, `textOverlays` (texto + posición) |
| 7 | Color | paleta dominante + LAB por shot | `shots[].color`, `style.colorGrade` |
| 8 | Audio | **Whisper** (transcript) + **librosa** (beats, silencios, loudness) | `audio`, `transcriptRef` |
| 9 | Estilo cualitativo | **Claude visión** sobre keyframes muestreados | `captions[].animation`, `style.*`, `confidence` |
| 10 | Ensamblado | assembler | merge + `style.pacing` derivado |
| 11 | Validación | JSON Schema validator | gate: spec válido o falla |

### 8.1 Resolución temporal selectiva (clave — el por qué ffmpeg te sabía a poco)

No se analiza todo a 60fps. **Pasada barata** (~2–5 fps) para hallar regiones de interés (cortes, apariciones de texto, picos de movimiento) → y **solo ahí** se sube la resolución temporal y se extrae frame a frame. Esto resuelve tu queja de "no me da detalles tan exactos": el detalle se concentra donde importa, no se diluye en todo el video.

### 8.2 Reparto visión vs. números

- **Números** (determinístico, barato): cortes, duración, pacing, magnitud de zoom, paleta, beats, silencios, texto OCR.
- **Visión** (cualitativo, caro — usar con moderación): tipo de animación de caption, vocabulario de transición, "look" del grade, descripción de estilo. Se le mandan frames *muestreados* de ventanas de interés, nunca el video entero.

---

## 9. Stack técnico

- **Orquestación:** Claude Code — skills como markdown + scripts (patrón `AGENTS.md`/`CLAUDE.md` de devground; cada skill = un workflow).
- **Análisis:** Python (ecosistema CV/audio): `ffmpeg`/`ffprobe`, `scenedetect` (PySceneDetect), `opencv-python`, `paddleocr`, `librosa`, `openai-whisper` o `whisper.cpp`, `scikit-image` (SSIM), `Pillow`.
- **Schema:** JSON Schema (verdad) → Pydantic + Zod generados.
- **Storage:** filesystem primero. Carpeta por video: `spec.json` + `frames/` + `transcript.json` + `report.md`. Supabase solo si/cuando haga falta persistencia/multiusuario.
- **Visión:** Anthropic API (Claude multimodal) sobre frames muestreados.

---

## 10. Estructura de repo (propuesta)

```
plato/
├─ schema/
│  ├─ videospec.schema.json        # ← fuente de verdad
│  ├─ generated/pydantic_models.py
│  └─ generated/zod.ts
├─ tools/                          # crew (Python)
│  ├─ probe.py
│  ├─ shots.py                     # PySceneDetect
│  ├─ motion.py                    # optical flow
│  ├─ transitions.py               # SSIM/diff
│  ├─ ocr.py
│  ├─ color.py
│  ├─ audio.py                     # whisper + librosa
│  ├─ vision.py                    # Claude visión
│  └─ assemble.py                  # merge → spec
├─ skills/                         # workflows Claude Code
│  └─ analyze/SKILL.md
├─ projects/                       # output: carpeta por video
│  └─ <video_id>/{spec.json,frames/,transcript.json,report.md}
├─ fixtures/                       # videos de prueba + specs etiquetados a mano
└─ AGENTS.md / CLAUDE.md
```

---

## 11. Milestones (por slices — no todo junto)

| M | Entregable | "Done" cuando… |
|---|---|---|
| **M0** | Schema `VideoSpec` v0.1 + validador + generación Pydantic/Zod + fixtures | Un spec de ejemplo valida 100% y los tipos se generan en ambos lenguajes |
| **M1** | Probe + shots + keyframes → spec parcial (solo `shots`) | Sobre un video real, boundaries de shot dentro de tolerancia vs etiquetado manual |
| **M2** | Movimiento + transiciones + color → enriquece shots | Clasifica static/punch-in/pan y cut/dissolve correctamente en el set de prueba |
| **M3** | Audio (transcript, beats, silencios) + OCR (captions/overlays) | Texto de captions legible y transcript en Caption-shape válido |
| **M4** | Visión → sección `style` + confidence. **Cierra `analizar→spec`** | Genera spec completo + `report.md` legible para un video arbitrario |

> Fuera de fundaciones (backlog): slice `editar` (keep/cut → Remotion), slice `assets` (componentes Remotion), UI.

---

## 12. Criterios de éxito (fundaciones)

1. Dado un video corto arbitrario (30–60s), el pipeline produce un `VideoSpec` **válido contra el schema** (gate duro).
2. El spec captura, con confidence honesto: shot list con boundaries útiles, métricas de pacing, tipos de transición, texto + estilo de captions, paleta de color, y un `qualitativeSummary` que un humano (o Claude) puede usar para reconstruir el estilo.
3. **Métrica medible:** sobre un set de ~5 videos etiquetados a mano → precision/recall de detección de cortes, exactitud del texto OCR de captions, % de specs que validan. Definir umbrales en M1.
4. El output (`report.md`) responde tu pregunta original ("¿cómo está editado esto?") mejor que mirar frames sueltos de ffmpeg.

---

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Timing al ms de micro-animaciones (techo duro) | Asumido como no-objetivo. Capturar curva *aproximada* + confidence bajo. No prometer clonación frame-exacta. |
| OCR falla con tipografía estilizada / texto sobre fondo movido | PaddleOCR > Tesseract; fallback a visión para leer el texto en frames difíciles |
| Easing es difícil de medir | Optical flow → ajustar curva (linear/ease/spring) con confidence; no inventar precisión |
| Costo/latencia de visión | Solo frames muestreados de ventanas de interés; números primero, visión al final |
| Scope creep (querer editar/assets ya) | Enforced por milestones. M0–M4 NO tocan render. |

---

## 14. Preguntas abiertas (decidir antes de M0)

1. ¿Solo archivos locales en V0, o también URL/descarga (yt-dlp) para refs?
2. ¿Specs en filesystem siempre, o Supabase desde ya?
3. ¿Superficie de comando: skills Claude Code puras, o también un CLI (`plato analyze <file>`) para correr sin Claude?
4. ¿Whisper local (`whisper.cpp`, privado/gratis) u OpenAI API (más rápido) por defecto?
5. Umbrales concretos de éxito para M1 (¿qué tolerancia de boundary aceptas?).

---

## 15. Siguiente paso inmediato

**M0 + una prueba real:** definir `videospec.schema.json`, montar el validador, y correr el pipeline mejorado (PySceneDetect + optical flow + color + OCR) sobre un video de referencia tuyo para ver el spec real que sale — y calibrar desde ahí. Esa es "la otra prueba", pero hecha bien.
