# Plató

Ingeniería inversa de video: analiza un video existente y produce un **`VideoSpec`**, un JSON validado que describe su forma (cortes, movimiento, color, transiciones, audio, texto en pantalla, ritmo y narrativa). Ese spec después alimenta el render con Remotion.

## Piezas

| Carpeta     | Qué hace                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| `schema/`   | Contrato `VideoSpec` (JSON Schema 2020-12) y codegen a Pydantic y Zod. Es la fuente de verdad.             |
| `analyzer/` | CLI en Python (`plato`): probe, shots, motion, color, transiciones, audio, ASR y OCR locales, y validador. |
| `ts/`       | Render con Remotion 4 y React 19: presets extraídos del spec y sistema "paper" (papel recortado animado).  |
| `fixtures/` | Spec de referencia que fija la _forma_ del schema. No es un ground-truth de exactitud.                     |
| `docs/`     | ADRs (`docs/adr/`) y mapa del código (`docs/codemap.md`).                                                  |

## Uso

```bash
make test        # suite del analyzer
make validate    # valida el spec de referencia contra el schema
make codegen     # regenera Pydantic y Zod desde el schema

cd analyzer && uv sync && uv run plato --help
pnpm install                 # raíz: hooks y el zod que usa schema/generated
cd ts && pnpm install && pnpm test && pnpm studio
```

Requisitos: Python 3.11+, [uv](https://docs.astral.sh/uv/), Node 22+, pnpm, ffmpeg y Tesseract. Los tests que necesitan el video original se omiten si el archivo no está.

## Diseño

Las decisiones están en `docs/adr/`. Empieza por el 0001 (schema como fuente de verdad) y el 0003 (arquitectura pipe-and-filter sobre el `VideoSpec`).

## Licencia

MIT. Ver [LICENSE](LICENSE).
