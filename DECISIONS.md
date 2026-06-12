# DECISIONS — Cimientos de Plató

> Resumen ejecutivo de las decisiones de arquitectura de las fundaciones (M0–M4).
> Cada decisión tiene su ADR completo en [`docs/adr/`](docs/adr/). Estado: **Propuesto**.
> Calibrado a la escala REAL: **single-user, batch, local**. Multi-usuario/producto es no-objetivo.

## Decisiones tomadas

| # | Decisión | Resumen | ADR |
|---|----------|---------|-----|
| 1 | **Stack + fuente de verdad** | `videospec.schema.json` (JSON Schema) es la ÚNICA verdad → genera Pydantic (Python, analyzer) y Zod (TS, Remotion). Python 3.11+ / Node 20+. | [0001](docs/adr/0001-stack-y-schema-como-fuente-de-verdad.md) |
| 2 | **Persistencia** | Filesystem, una carpeta por video (`projects/<id>/`). Sin base de datos. | [0002](docs/adr/0002-persistencia-en-filesystem-sin-base-de-datos.md) |
| 3 | **Arquitectura** | Pipe-and-filter: cada paso enriquece el mismo `VideoSpec`; el schema es el contrato. Sin hexagonal pesado, sin CQRS, sin servicio. Validación = gate duro. | [0003](docs/adr/0003-arquitectura-pipe-and-filter-sobre-videospec.md) |
| 4 | **Superficie de comando** | CLI Python autónomo (`plato analyze <file>`, Typer) como core; skills de Claude Code lo envuelven. | [0004](docs/adr/0004-cli-python-como-core-skills-como-wrappers.md) |
| 5 | **Layout del repo** | Single-repo poliglota por carpetas (`schema/` + `analyzer/` uv + `ts/` pnpm + `.claude/skills/`). Sin pnpm-workspace/Turborepo. | [0005](docs/adr/0005-repo-poliglota-single-repo-por-carpetas.md) |
| 6 | **Transcripción** | `faster-whisper` local por defecto; flag `--asr-api` para OpenAI como fallback. | [0006](docs/adr/0006-transcripcion-whisper-local-por-defecto.md) |

### Tooling fijado
- **Python:** [uv](https://docs.astral.sh/uv/) (gestión de deps + venv + lockfile).
- **TS:** pnpm + presets de devground (eslint 9, tsconfig strict, prettier, husky, commitlint).
- **Visión:** Anthropic API (Claude multimodal) sobre frames muestreados.
- **Convenciones de repo:** devground ya instalado (AGENTS.md, git hooks, conventional commits, knowledge base).

## Lo que explícitamente NO hacemos hoy (YAGNI) — y el trigger que lo cambiaría

| Decisión diferida | Default hoy | Trigger de re-evaluación |
|-------------------|-------------|--------------------------|
| **Base de datos (Supabase/Postgres)** | Filesystem | Consulta cross-video, multi-usuario, o una UI que liste/busque análisis |
| **Caché / memoización de pasos** | Nada en M0 | M1: re-correr el pipeline re-extrae frames / re-llama visión → memoización en filesystem por `hash(video)+paso` (NO Redis) |
| **Colas / workers** | Loop batch directo | Procesar lotes grandes de videos donde el batch secuencial sea inaceptable |
| **Circuit breakers** | Solo timeout + retry/backoff en llamadas de visión | Si las llamadas externas (visión/ASR API) fallan en cascada y necesitan aislamiento formal |
| **Monorepo tooling (pnpm-workspace/Turborepo)** | Carpetas planas | Aparece un SEGUNDO paquete TS real (ej. Remotion `components/` + `render/` con deps entre sí) |
| **Descarga por URL (yt-dlp)** | Solo archivos locales (resuelve §14.1) | Necesidad recurrente de traer refs por URL → pre-paso opcional, no parte del core |

## Preguntas que quedan abiertas (no son decisión de cimientos)

- **§14.5 — Umbrales de éxito de M1** (tolerancia de boundary de shot, precision/recall de cortes, exactitud OCR): se definen al entrar a M1, con datos reales del set de fixtures etiquetados a mano. No se fijan hoy.

## Próximo paso

**M0** (ver PRD §11): `videospec.schema.json` + validador + generación Pydantic/Zod + fixtures.
El material de `material/olyasuharska/` (un `VideoSpec` real y validado) es la semilla para derivar el schema y el primer golden fixture.
