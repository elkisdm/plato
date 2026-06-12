# Staging — VideoSpec v0.2.0 (bump consolidado)

> **Embudo del contrato (ADR-0001).** Aquí convergieron los DOS frentes (motion-split +
> cut-detection) antes de tocar el schema. Un solo dueño consolidó.

Estado: ✅ **APLICADO** (2026-06-12). Schema en `specVersion: "0.2.0"`, codegen regenerado,
golden migrado y validado por Pydantic y Zod, decisión registrada en **ADR-0008**.

> ⚠️ Las dos ramas **divergieron** (cut-detection perdió `color` y `keyframeUri`, no bumpeó
> `specVersion`, dejó honestidad en prosa). La consolidación restauró `color`/`keyframeUri`
> AL CONTRATO (como opcionales) y subió `ambiguous`/`knownGaps` a campos. Ver ADR-0008.

---

## Frente 1 — Motion split (cerrado, shape estable)

Reemplaza `shot.motion` (plano) por dos capas independientes. Evidencia: corrida RANSAC v2 (`material/olyasuharska-v2/`).

```jsonc
// Shot.required pierde "motion", gana "camera" + "object"
"Camera": {
  "required": ["type", "confidence"], "additionalProperties": false,
  "properties": {
    "type":       { "enum": ["static","pan","punch_in","zoom_out","drift_subtle","handheld","unknown"] },
    "magnitude":  { "type": "number", "minimum": 0 },          // opcional
    "panFrac":    { "type": "number", "minimum": 0, "maximum": 1 }, // opcional
    "ambiguous":  { "type": "boolean" },                        // opcional — NUEVO primitivo de honestidad
    "confidence": { "$ref": "#/$defs/ConfidenceScore" }
  }
},
"Object": {
  "required": ["activity"], "additionalProperties": false,
  "properties": {
    "activity":     { "enum": ["low","medium","high","unknown"] },
    "outlierRatio": { "type": "number", "minimum": 0, "maximum": 1 } // opcional
  }
}
```

Cambios asociados:
- **`easing` se elimina como campo estructurado** → baja a `confidence` (tratado como direccional, no medición).
- **`style.motionVocabulary`** pasa a `{ camera: {...conteos}, objectActivity: {...conteos}, method, notes }`.
- **`confidence.motionLayer`** se formaliza: `{ level, trustworthy: [...], flagged: [...] }`.

### Deuda de honestidad a saldar en el bump (bugs del v2 narrado)
1. **`specVersion` DEBE subir a `"0.2.0"`** — el v2 sandbox dejó `0.1.0` con forma rota. Inadmisible en el contrato.
2. **`camera.ambiguous` debe poblarse por shot**, no narrarse en prosa. El v2 dice "8 ambiguous" en `confidence.motionLayer.flagged` pero ningún shot lo marca. El flag es campo, no comentario — si Remotion no puede ramificar sobre él, no está flageado.

## Frente 2 — Cut-detection (EN CURSO, otro agente)

Reservado. Se espera que reescriba:
- `shots[]` (boundaries más precisos; cortes hoy perdidos, p.ej. `shot_009` que cruza un corte y envenena su motion).
- `transitions[].type` — desarmar el cajón de sastre `dissolve_or_fast_motion` (14/63) en disolvencias reales vs cortes-sobre-movimiento, posiblemente con `durationMs`.

> Entregar como **propuesta de delta** sobre este documento, no editando el schema.

## Checklist del bump (cuando ambos frentes cierren)
- [ ] Consolidar Frente 1 + Frente 2 en `schema/videospec.schema.json`.
- [ ] `specVersion` → `"0.2.0"`.
- [ ] `make codegen` (Pydantic + Zod).
- [ ] Actualizar golden a la instancia v0.2.0 + re-validar (`make validate`, `make test`).
- [ ] ADR de data-model para el contrato v0.2.0 consolidado.
- [ ] Actualizar `docs/codemap.md`.
