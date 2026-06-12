# ADR-0001 — Stack poliglota con JSON Schema como única fuente de verdad

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — la KB de devground (`knowledge/adr/`) cubre servicios web/datos, no herramientas CLI poliglotas de análisis. Decisión por criterio general.

## Contexto

Plató analiza video y produce un `VideoSpec` JSON canónico (ver `PRD-plato-fundaciones.md` §6.3). El ecosistema maduro de visión por computador y audio (ffmpeg, PySceneDetect, OpenCV, PaddleOCR, librosa, Whisper) vive en **Python**. La futura capa de edición/render (Remotion) y la validación de tipos del lado cliente viven en **TypeScript**. El riesgo central de un proyecto poliglota es que los dos lados se desincronicen sobre la forma del dato.

## Decisión

**`videospec.schema.json` (JSON Schema) es la ÚNICA fuente de verdad.** De ahí se generan los tipos en ambos lenguajes, nunca al revés ni en paralelo:

- **Python 3.11+** para el analyzer → modelos Pydantic vía `datamodel-code-generator`.
- **TypeScript / Node 20+** para schema y futuro Remotion → schemas Zod vía `json-schema-to-zod`.

Ningún tipo se escribe a mano en Python ni en TS. Si el contrato cambia, cambia el schema y se regeneran ambos lados. El schema es la columna del proyecto: toda tool lee/escribe contra él.

## Consecuencias

- **Positivas:** Python y TS no pueden divergir sobre la forma del `VideoSpec`. El contrato es versionado (`specVersion`), validable y único. Una tool nueva solo debe respetar el schema.
- **Negativas / costos:** Hay un paso de codegen que mantener (script + CI gate). Los tipos generados no se editan a mano; toda extensión pasa por el schema.
- **Trigger de re-evaluación:** si la generación de Pydantic o Zod pierde fidelidad sobre construcciones avanzadas de JSON Schema (uniones discriminadas, `$ref` profundos), evaluar escribir un generador propio o anotar el schema con `x-` hints.
