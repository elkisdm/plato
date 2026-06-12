# ADR-0009 — Render con Remotion: librería de presets + composición data-driven

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB.

## Contexto

El pipeline produce un `VideoSpec` completo (ADR-0001/0003): shots, motion, color, transiciones,
audio, captions/textOverlays, style. Faltaba cerrar el loop del PRD: que el spec **deje de ser
solo análisis y se vuelva input de un render**. `ts/` ya estaba designado como hogar de Remotion
(re-exporta el Zod del contrato).

El usuario no quiere "un render del video X", sino un **sistema de bloques tipo lego**: componentes
de diseño reutilizables + presets que se acumulan con cada video que pasa por el workflow, para
componer cualquier video futuro a partir de esa base.

## Decisión

Remotion (React 19) en `ts/`, con tres piezas:

1. **Librería de componentes (`src/remotion/components/`)** — "legos" genéricos y parametrizados:
   `KaraokeCaption` (palabra-a-palabra, activa dorado-glow), `TwoTierOverlay` (conectores gris +
   énfasis negro, esparcido), `ColorWorldBackground` (tratamiento por mundo cálido/neutro),
   transiciones (`FlashCut`/`Dissolve`). No saben de ningún video concreto: reciben props.
2. **Extracción de presets (`src/remotion/presets.ts`)** — `extractPresets(spec)` deriva del
   `VideoSpec` un bundle de tokens reutilizables (estilo de caption, de overlay, mundos de color,
   vocabulario de transición). Pura y testeable. Es lo que "genera los legos" por cada video; se
   acumulan en `src/presets/<videoId>.json` (librería versionada).
3. **Composición data-driven (`SpecComposition.tsx`)** — recibe `(spec, presets, videoSrc)` y
   renderiza captions/overlays sobre el video fuente con los componentes de la librería, regida por
   el timing/posición/estilo del spec. Registrada en `Root.tsx` con el spec de @olyasuharska como
   defaultProps: **queda lista, solo falta pasarle el mp4**.

El contrato `VideoSpec` (ADR-0001) sigue siendo la fuente de verdad; Remotion lo consume vía el
tipo Zod generado (`@plato/schema`), no redefine nada.

## Consecuencias

- **Positivas:** los presets se acumulan → biblioteca componible para cualquier video; los
  componentes son genéricos y testeables por separado; el spec es el único acoplamiento.
- **Negativas / costos:** el render fiel completo (reconstruir cada shot con su fuente, motion y
  grade) queda fuera de esta primera rebanada — arrancamos por el track de captions/overlays sobre
  el video. React/Remotion añaden peso de dependencias y un runner de tests nuevo (vitest) al lado TS.
- **TDD:** la lógica (`extractPresets`) va con tests (vitest); los componentes visuales se rigen por
  la excepción de cambios visuales del estándar TDD, pero deben typechear.
