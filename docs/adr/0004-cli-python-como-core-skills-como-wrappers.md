# ADR-0004 — CLI Python como core; skills de Claude Code como wrappers

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB. Resuelve la pregunta abierta §14.3 del PRD.

## Contexto

El analyzer puede exponerse de dos formas: (a) como scripts que SOLO Claude Code orquesta vía skills, o (b) como un CLI autónomo que las skills invocan. El riesgo de (a) es atar la lógica de análisis al runtime de Claude: no corre sin él, es difícil de testear en aislamiento y de scriptear en CI.

## Decisión

**El pipeline es un CLI Python autónomo (`plato analyze <file>`, con Typer) como núcleo. Las skills de Claude Code son wrappers delgados que invocan ese CLI.**

- La lógica de análisis no sabe que Claude existe; es un programa de línea de comandos normal.
- Las skills (`.claude/skills/`) traducen la intención del director (Claude) a invocaciones del CLI y leen el spec/reporte resultante.
- El CLI es testeable, scriptable en CI, y corre solo.

## Consecuencias

- **Positivas:** desacople total del runtime de Claude. Testeable y reproducible sin IA. Una sola superficie de comando para humano, script y agente.
- **Negativas / costos:** una capa de indirección (skill → CLI) en vez de que la skill ejecute lógica directa. Hay que mantener el contrato CLI (flags, exit codes, formato de salida) estable para las skills.
- **Trigger de re-evaluación:** si los pasos de visión (que SÍ dependen del modelo) terminan dominando el pipeline, evaluar exponerlos como subcomando propio (`plato vision`) en vez de embeberlos en `analyze`.
