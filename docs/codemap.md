# Code map — Plató

Índice de DÓNDE vive cada cosa. El *por qué* está en `docs/adr/`; el *qué* en el código.
Se mantiene en cada cambio (spec-flow Step 5). Entradas tersas: ruta + responsabilidad.

| Subsistema | Rutas | Responsabilidad | ADRs |
|---|---|---|---|
| **Schema (fuente de verdad)** | `schema/videospec.schema.json` | El contrato `VideoSpec` v0.2.0 (JSON Schema 2020-12). Capas opcionales: gate duro en forma, suave en presencia. | 0001, 0008 |
| **Codegen** | `schema/bundle.py`, `schema/migrate_v01_to_v02.py`, `Makefile` (`make codegen`) | `bundle.py` dereferencia $refs (json-schema-to-zod no resuelve $ref); `migrate_*` normaliza output crudo del analyzer al contrato (deuda hasta emisión nativa). | 0001, 0005, 0008 |
| **Tipos generados** | `schema/generated/{pydantic_models.py, zod.ts, videospec.bundled.json}` | Salida del codegen. NO editar a mano. | 0001 |
| **Analyzer (Python)** | `analyzer/src/plato_analyzer/` | Crew + validador. `schema.py` valida; `asr.py` transcribe (faster-whisper); `ocr.py` lee texto gráfico (Tesseract); `vision.py` capa de visión in-session (sheets/strips+manifest+merge, Pillow); `cli.py` expone `plato validate`/`transcribe`/`ocr`/`dump-frames`/`merge-vision` (Typer). uv para deps. | 0003, 0004, 0006, 0007 |
| **Visión in-session** | `analyzer/src/plato_analyzer/vision.py` | La visión semántica la ejecuta una sesión de Claude Code (Read), NO la Anthropic API. `dump-frames` emite **contact sheets** (un keyframe/shot, etiquetado) + **strips densas a 24fps** (knownGaps + `--strip START:END`) vía ffmpeg+Pillow; el agente las lee y escribe `vision.json`; `merge-vision` lo injerta y re-valida (gate duro). Schema sin cambios (`source:"vision"`). | 0007 |
| **Tests analyzer** | `analyzer/tests/{test_schema.py, test_vision.py}` | Golden valida 100%; gate duro rechaza inválidos; visión: ventanas/manifest/merge puros (sin ffmpeg). | — |
| **TS (consumidor schema)** | `ts/` | Re-exporta el Zod generado (`src/index.ts`). pnpm. Futuro hogar de Remotion. | 0005 |
| **Fixtures** | `fixtures/olyasuharska/` | Golden spec real (@olyasuharska) + reporte. Semilla del schema y dato de prueba. | — |
| **Output (runtime)** | `projects/<video_id>/` (gitignored) | Una carpeta por video: spec.json, frames/, transcript.json, report.md. | 0002 |
| **Convenciones / IA** | `AGENTS.md` (+ symlinks), `knowledge/` | Reglas devground + knowledge base de arquitectura (referencia). | — |

## Entrypoints
- `make codegen` — regenera Pydantic + Zod desde el schema.
- `make validate` / `make test` — gate duro y suite.
- `uv run plato validate <spec.json>` — validador autónomo (desde `analyzer/`).

## Estado por milestone (PRD §11)
- **M0 ✅** schema + validador + codegen bilingüe + golden fixture (contrato v0.1.0).
- **M1–M4** pipeline real (probe/shots/motion/transiciones/OCR/audio/visión) — pendiente.

## Contrato
- **v0.2.0 aplicado** (ADR-0008): motion→camera+object, transitionIn etiquetado, knownGaps/ambiguous
  estructurados, capas opcionales. Consolidó los dos frentes (motion + cut-detection) que habían
  divergido. Staging: `docs/specs/videospec-v0.2.0.md`. Cambios de contrato siguen pasando por el
  embudo (un dueño) para no divergir.
- Material de corridas sandbox: `material/olyasuharska/` (v1 full+color), `material/olyasuharska-v2/`
  (motion RANSAC), `material/olyasuharska-v3-cutdetect/` (cut-detection, raw del golden actual).
- **knownGap abierto:** corte suave boy→mujer ~23s — necesita embedding semántico (CLIP), no thresholding.
