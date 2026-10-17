# Plató

Ingeniería inversa de video: analiza un video existente y produce un **`VideoSpec`**, un JSON validado que describe su forma (cortes, movimiento, color, transiciones, audio, texto en pantalla, ritmo y narrativa). Ese spec después alimenta el render con Remotion.

## Piezas

| Carpeta        | Qué hace                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `schema/`      | Contrato `VideoSpec` (JSON Schema 2020-12) y codegen a Pydantic y Zod. Es la fuente de verdad.             |
| `analyzer/`    | CLI en Python (`plato`): probe, shots, motion, color, transiciones, audio, ASR y OCR locales, y validador. |
| `ts/`          | Render con Remotion 4 y React 19: presets extraídos del spec y sistema "paper" (papel recortado animado).  |
| `fixtures/`    | Spec de referencia que fija la _forma_ del schema. No es un ground-truth de exactitud.                     |
| `estudio/`     | Estudio de video: marcas, proyectos y tipos de video sobre Remotion. Ver `estudio/README.md`.              |
| `hyperframes/` | Piezas HTML animadas (HyperFrames) que el estudio incorpora como assets. Ver `hyperframes/README.md`.      |
| `docs/`        | ADRs (`docs/adr/`) y mapa del código (`docs/codemap.md`).                                                  |

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

## Estudio de video

Sistema versionable para producir videos con Remotion: un **proyecto** reúne guion, assets y voz, una **marca** aporta colores, tipografías e identidad, y un **tipo de video** define el catálogo de escenas. La marca de muestra es `ejemplo`.

```bash
cd ts
node tools/estudio.mjs nuevo mi-video --marca ejemplo --tipo presentacion-app
node tools/estudio.mjs indexar   # regenera src/estudio/datos.generated.ts
pnpm studio
```

Los binarios (música, voces, fuentes) viven fuera de git, en `ts/public/estudio/`. Detalle en `estudio/README.md` y en los ADR 0011 y 0012.

## Piezas con HyperFrames

Remotion compone la línea de tiempo; [HyperFrames](https://github.com/heygen-com/hyperframes) renderiza piezas HTML sueltas (gráficos animados, transiciones) que entran al estudio como assets de video. Para crear una pieza desde el catálogo con los colores de la marca:

```bash
cd ts
node tools/pieza.mjs biblioteca bar-chart-race graficos/carrera --marca ejemplo
```

Detalle en `hyperframes/README.md`, `docs/specs/hyperframes-piezas.md` y el ADR 0013.

## Diseño

Las decisiones están en `docs/adr/`. Empieza por el 0001 (schema como fuente de verdad) y el 0003 (arquitectura pipe-and-filter sobre el `VideoSpec`).

## Licencia

MIT. Ver [LICENSE](LICENSE).
