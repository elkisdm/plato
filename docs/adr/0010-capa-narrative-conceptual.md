# ADR-0010 — Capa `narrative`: lo conceptual (por qué engancha), no solo lo técnico

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB.

## Contexto

El pipeline extrae bien la capa **técnica/mecánica** (cortes, motion, color, transiciones,
captions, LUFS, pacing): el "qué hicieron". Eso es **retención sensorial** — mantiene el ojo.
Pero lo que mantiene enganchado de verdad es el **"por qué funciona"**: la historia que se
cuenta, los loops de curiosidad, el arco emocional, y cómo el tratamiento visual _argumenta_
(la forma como significado). Eso es **retención cognitiva/emocional** y no se mide con CV.

Observación del usuario que origina la decisión: a nivel técnico ya extraemos cómo un video se
mantiene dinámico con efectos; falta la dimensión conceptual —la historia y el "cómo se ve" como
sentido— que también impacta enormemente. Sin ella, replicar un video exitoso produce una copia
mecánica sin alma: puedes clonar el pacing y los flashes y aburrir.

## Decisión

Añadir al contrato (ADR-0001) una capa **opcional** `narrative` (v0.3.0, minor — capa nueva no
rompe nada). Es **semántica pura**, así que la escribe la **sesión de visión** (ADR-0007), no el
CV. Forma (solo `hook` y `thesis` requeridos; el resto opcional, strict-when-present):

- `hook` — qué captura en los primeros segundos y **por qué** (`device` + `why`).
- `thesis` / `throughline` — el mensaje central y la tensión que sostiene.
- `openLoops[]` — los curiosity gaps que arrastran (con `resolvedAtMs` opcional).
- `emotionalArc[]` — la progresión de sentimiento por tramos.
- `formAsMeaning[]` — cómo cada recurso visual **argumenta** (p.ej. talking-head cálido =
  confesión íntima; collage de papel = evidencia/archivo).
- `retentionDevices[]` — mecanismos de retención conceptual (open_loop, contrast_worlds,
  escalation, payoff…).
- `payoff` / `targetEmotion` — qué se lleva el espectador.

`merge-vision` la injerta entera (no hay base del CV que fundir) y re-valida (gate duro).

## Consecuencias

- **Positivas:** el spec pasa de "huella técnica" a **receta creativa replicable** — el motor
  narrativo, no solo la mecánica. Habilita que el render (ADR-0009) un día lea de acá (p.ej.
  tratar un momento marcado como `open_loop` con un énfasis distinto). Lo conceptual y lo visual
  dejan de estar separados: `formAsMeaning` los une.
- **Negativas / costos:** es interpretación (lleva `confidence`); dos analistas pueden diferir.
  No es automatizable por CV — depende de una sesión de visión. Taxonomías (`device`, `kind`,
  `type`) abiertas a propósito: evolucionarán con más videos.
- **Versión:** v0.2.0 → v0.3.0 (capa nueva-opcional = minor, regla del propio contrato). Specs
  0.2.0 existentes siguen validando (la validación es por patrón, no por igualdad de versión).
