# ADR-0003 — Arquitectura pipe-and-filter con el VideoSpec como contrato

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** `knowledge/adr/0004-monolito-vs-microservicios.md`, `knowledge/adr/0005-cuando-aplicar-clean-hexagonal.md`, `knowledge/adr/0006-cuando-aplicar-cqrs.md`, `knowledge/adr/0007-serverless-vs-servidor-dedicado.md` (consultados). **0004/0007 no aplican**: Plató no es un servicio, es un CLI batch local — no hay nada que desplegar ni escalar horizontalmente. **0005 aplica como "separación proporcional".** **0006 (CQRS): NO.**

## Contexto

El pipeline `analizar → spec` tiene 11 pasos (PRD §8) donde cada uno **enriquece el mismo objeto**: probe → shots → keyframes → motion → transiciones → OCR → color → audio → visión → ensamblado → validación. La tentación sería sobre-estructurar esto con capas hexagonales completas o separarlo en servicios.

## Decisión

**Arquitectura pipe-and-filter: cada paso es una función pura-ish `(entrada) → partial VideoSpec`, y el schema ES el contrato entre pasos.** Un orquestador delgado (`assemble`) compone los pasos y hace merge sobre un único spec.

- **Sin hexagonal pesado.** El seam natural ya existe sin imponer puertos/adaptadores formales: cada tool depende solo del schema, no de las otras tools. Separación proporcional al tamaño (ADR-0005 de la KB).
- **Sin CQRS, sin microservicios, sin servidor.** Es un proceso batch local.
- **Validación como gate duro:** el último paso valida contra `videospec.schema.json`. Spec inválido = falla, no se emite.

## Consecuencias

- **Positivas:** cada paso es testeable en aislamiento (entra fixture, sale partial spec). Agregar una tool nueva = respetar el schema, sin tocar las demás. El acoplamiento es solo al contrato.
- **Negativas / costos:** el orden de enriquecimiento importa (algunos pasos dependen de outputs previos, ej. motion necesita los boundaries de shots). Hay que documentar las dependencias entre pasos.
- **Trigger de re-evaluación:** si el grafo de dependencias entre pasos se vuelve no-lineal y difícil de razonar, considerar un orquestador explícito de DAG (ej. una lib de pipelines) en vez del compose manual.
