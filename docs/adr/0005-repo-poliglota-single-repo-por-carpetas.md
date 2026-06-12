# ADR-0005 — Repo poliglota single-repo por carpetas, sin workspace tooling

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** `knowledge/adr/0004-monolito-vs-microservicios.md` (espíritu anti-fragmentación prematura). Decisión por criterio general para layout poliglota.

## Contexto

Python (analyzer) y TypeScript (schema generado + futuro Remotion) conviven en un repo. La tentación es montar un monorepo con herramientas de workspace (pnpm-workspace, Turborepo) como en `devground-1`. Pero hoy existe **un solo** paquete TS (los tipos Zod generados), y el de Remotion ni siquiera está. Montar tooling de monorepo para un único paquete futuro es sobre-ingeniería.

## Decisión

**Un solo repo organizado por carpetas, cada lenguaje con su propio gestor. SIN pnpm-workspace / Turborepo.**

```
plato/
├─ schema/                         # fuente de verdad + generados
│  ├─ videospec.schema.json
│  └─ generated/{pydantic_models.py, zod.ts}
├─ analyzer/                       # Python (uv) — el crew
│  ├─ pyproject.toml
│  └─ src/plato_analyzer/{probe,shots,motion,transitions,ocr,color,audio,vision,assemble}.py
├─ ts/                             # TypeScript (pnpm) — schema consumer + futuro Remotion
├─ .claude/skills/                 # workflows Claude Code (wrappers del CLI)
│  └─ analyze/SKILL.md
├─ projects/                       # OUTPUT (gitignored): carpeta por video
├─ fixtures/                       # videos de prueba + specs etiquetados a mano
├─ docs/adr/                       # estas decisiones
└─ AGENTS.md / CLAUDE.md           # devground
```

Ajustes sobre la propuesta del PRD §10: el analyzer es un **paquete Python instalable** (`analyzer/src/plato_analyzer/`) gestionado por **uv**, no scripts sueltos en `tools/` — esto lo hace importable y testeable (M0 necesita validador + tests). Las skills van en `.claude/skills/` (convención de Claude Code para auto-carga), no en `skills/` a la raíz.

## Consecuencias

- **Positivas:** límites claros por lenguaje, cada lado con su toolchain nativo (uv / pnpm), cero overhead de orquestación de monorepo. Fixtures y schema versionados juntos.
- **Negativas / costos:** no hay build/test orquestado cross-lenguaje de fábrica (correr Python y TS son comandos separados). Aceptable para un solo dev.
- **Trigger de re-evaluación → monorepo tooling:** cuando aparezca un SEGUNDO paquete TS real (ej. cuando Remotion entre y haya `components/` + `render/` con dependencias entre sí), evaluar pnpm-workspace o Turborepo.
