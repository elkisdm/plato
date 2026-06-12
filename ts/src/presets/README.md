# Librería de presets (legos)

Tokens de diseño reutilizables extraídos de cada `VideoSpec` que pasa por el workflow
(ADR-0009). Cada video aporta su bundle (`<videoId>.json`) y la librería se va acumulando
como base componible para cualquier video futuro.

- **Generador:** `extractPresets(spec)` en `../remotion/presets.ts` (probado, fuente única).
- **Forma:** `DesignPresets` en `../remotion/types.ts` (caption, overlay, mundos de color,
  vocabulario de transición).
- Hoy `Root.tsx` los computa en vivo desde el spec de @olyasuharska. Persistir un JSON por
  video acá (vía un step del workflow) es el siguiente paso para acumular la librería.
