# ADR-0008 — Contrato VideoSpec v0.2.0: capas de enriquecimiento opcionales

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** deriva de ADR-0001 (schema fuente de verdad), ADR-0003 (pipe-and-filter) y ADR-0007 (CV mide / visión entiende).

## Contexto

Dos frentes paralelos (motion vía RANSAC; cut-detection multi-señal) evolucionaron la forma del `VideoSpec` y **divergieron**: cada agente optimizó su capa y dejó caer la del otro. El output de cut-detection (v0.3.0) traía `transitionIn` etiquetado por shot y un `knownGap`, pero **perdió `color` y `keyframeUri`**, no bumpeó `specVersion`, y dejó la honestidad (ambiguous, knownGap) en prosa. La divergencia obligó a consolidar bajo un solo dueño del contrato (el embudo) y reveló un error del contrato M0 original: exigía TODAS las capas presentes, cuando el pipeline las produce **incrementalmente** (M1 = solo shots).

## Decisión

Consolidar en **`specVersion: "0.2.0"`** con un modelo de **capas opcionales**:

- **Requerido (esqueleto):** `specVersion`, `source`, `meta`, `shots[id, startMs, endMs, durationMs]`.
- **Opcional (capas de enriquecimiento):** por shot `camera`, `object`, `color`, `keyframeUri`, `transitionIn`; y top-level `captions`, `textOverlays`, `audio`, `style`, `confidence`, `transitions` (resumen), `knownGaps`.
- **Gate duro en FORMA, suave en PRESENCIA:** si una capa está, se valida estricta (`additionalProperties:false`, enums, rangos); si no está, el spec es válido igual.

Cambios de forma respecto a v0.1.0:
- `shot.motion` (plano) → `shot.camera` (modelo global RANSAC) + `shot.object` (movimiento independiente). `easing` sale del campo estructurado (direccional, vive en `confidence`).
- `shot.transitionIn` etiquetado (`cut|flash_cut|dissolve|open|...`) como objeto autoritativo por-frontera; `transitions` top-level pasa a resumen opcional.
- `camera.ambiguous` (boolean) y `knownGaps[]` (estructurado) como **primitivos de honestidad de primera clase** — un consumidor puede ramificar, no leer prosa.
- `specVersion` (forma del contrato) se distingue de `meta.analyzerVersion` (iteración del pipeline). El bug recurrente fue confundirlos.

## Consecuencias

- **Positivas:** specs parciales (M1) y con skew de versión entre agentes validan. El pipeline puede enriquecer sin romper. `knownGaps` deja que el contrato sostenga lo no resuelto (p.ej. el corte suave que necesita embeddings) sin otro breaking change. Frena la divergencia: un solo schema, un dueño.
- **Negativas / costos:** "valida" ya no implica "completo" — la completitud es un chequeo aparte (perfil), no el gate estructural. El golden actual (v0.2.0) NO trae `color` (los boundaries cambiaron 64→65; recomputar es trabajo del analyzer, no de la migración). El analyzer todavía emite forma pre-contrato → existe `schema/migrate_v01_to_v02.py` como deuda hasta que emita v0.2.0 nativo.
- **Trigger de re-evaluación:** cuando se necesite garantizar "spec completo" (p.ej. gate de M4), añadir un perfil de validación que SÍ exija las capas. Cuando entren embeddings semánticos a rellenar `knownGaps`, será un cambio minor (capa nueva), no breaking.
