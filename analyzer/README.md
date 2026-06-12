# plato-analyzer

El crew (Python) que lee un video y escribe el `VideoSpec` canónico.
En M0 solo expone el **validador** contra `schema/videospec.schema.json` (gate duro, ADR-0004).

```bash
uv sync
uv run plato validate ../fixtures/olyasuharska/videospec-olyasuharska.json
```

Los pasos de análisis (probe, shots, motion, OCR, audio, visión) llegan en M1–M4.
