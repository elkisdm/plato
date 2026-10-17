# manifest.json — esquema

Archivo por episodio en `material/produccion/<serie>/ep<NN>/manifest.json`. Lista de assets; varios assets pueden compartir `scene_id`.

| Campo         | Tipo                                                                 | Obligatorio         | Nota                                                                            |
| ------------- | -------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `scene_id`    | `"E07"`                                                              | sí                  | clave de la escena en `guion.md`                                                |
| `beat`        | string                                                               | sí                  | qué cuenta la escena, una línea                                                 |
| `duracion_s`  | number                                                               | sí                  | presupuesto del guion; se actualiza con la `voDur` real                         |
| `asset_type`  | `keyframe` · `kenburns` · `ltx` · `vo` · `motion` · `sfx` · `musica` | sí                  |                                                                                 |
| `pipeline`    | `flux` · `ffmpeg` · `ltx` · `chatterbox` · `remotion` · `libreria`   | sí                  |                                                                                 |
| `prompt`      | string                                                               | flux/ltx            | prompt completo, con el anclaje de serie incluido                               |
| `seed`        | int                                                                  | flux/ltx            |                                                                                 |
| `params`      | objeto                                                               | flux/ltx/chatterbox | steps, res, guidance / strength, frames / exaggeration, cfg_weight, temperature |
| `workflow`    | string                                                               | flux/ltx            | archivo JSON del workflow de ComfyUI usado                                      |
| `estado`      | `pendiente` · `encolado` · `generado` · `aprobado` · `rechazado`     | sí                  |                                                                                 |
| `intentos`    | int                                                                  | sí                  | tomas generadas                                                                 |
| `archivo`     | ruta relativa                                                        | generado+           |                                                                                 |
| `qc`          | objeto                                                               | aprobado/rechazado  | `wer`, `lufs`, `tp`, `notas`                                                    |
| `fuente`      | string                                                               | musica/sfx          | URL y licencia (CC0, Pixabay, etc.)                                             |
| `actualizado` | ISO 8601                                                             | sí                  | el timestamp vive aquí, no en el nombre                                         |

Ejemplo:

```json
[
  {
    "scene_id": "E01",
    "beat": "ancla: cama vacía en pasillo",
    "duracion_s": 12,
    "asset_type": "keyframe",
    "pipeline": "flux",
    "prompt": "empty hospital bed in a worn public hospital hallway, … documentary photography, …",
    "seed": 482913,
    "params": { "steps": 24, "res": "1344x768", "guidance": 3.5 },
    "workflow": "flux-dev-q8.json",
    "estado": "aprobado",
    "intentos": 2,
    "archivo": "E01/keyframe/E01_k02_s482913.png",
    "qc": { "notas": "toma 1 con texto en cartel; toma 2 limpia" },
    "actualizado": "2026-09-18T02:14:00-03:00"
  },
  {
    "scene_id": "E01",
    "beat": "ancla: cama vacía en pasillo",
    "duracion_s": 12,
    "asset_type": "vo",
    "pipeline": "chatterbox",
    "params": { "exaggeration": 0.45, "cfg_weight": 0.5, "temperature": 0.7 },
    "estado": "aprobado",
    "intentos": 4,
    "archivo": "E01/vo/E01_final.wav",
    "qc": { "wer": 0.05, "dur_s": 11.4 },
    "actualizado": "2026-09-18T01:50:00-03:00"
  }
]
```
