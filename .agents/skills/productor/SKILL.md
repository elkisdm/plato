---
name: productor
description: Desglosa un guion + arte de episodio en un plan de producción ejecutable con el pipeline 100% local de Plató (FLUX vía ComfyUI, Ken Burns/LTX, voz clonada Chatterbox con QC por WER, Remotion, ffmpeg): shot list y manifest.json por escena, estructura de carpetas, presupuesto de render con tiempos medidos en la M5 Pro, encolado en ComfyUI, pipeline de voz, checklists de QC y specs de entrega para YouTube. Úsala SIEMPRE que haya que "producir", "generar los assets", "encolar", "cuánto va a tardar el render", "organizar el episodio", "el manifest", "la shot list", "generar la voz", "QC", "exportar para YouTube", o cuando el usuario quiera pasar de guion/arte a archivos reales, aunque no diga "productor".
---

# Productor

Convierte `guion.md` + `arte.md` en assets reales, reproducibles y verificados, dentro de un presupuesto de tiempo que cabe en la máquina. No decide qué se ve (arte) ni cómo se corta (director-cine): decide qué se genera, en qué orden, con qué parámetros, y certifica que cada asset pasó QC.

## Pipeline y tiempos medidos (M5 Pro, 48 GB)

| Etapa            | Herramienta                                                                                                           | Tiempo real                                       | Trampas conocidas                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyframes        | FLUX.1-dev Q8 GGUF, ComfyUI headless `:8188` (`~/ComfyUI-Installs/ComfyUI/ComfyUI`, venv propio)                      | **~150 s/imagen** a 768×1344 o 1344×768, 24 steps | Encolar TODO de una vez por API y vigilar con Monitor: los procesos de fondo del harness mueren a ~1 h.                                     |
| Animación cara   | LTX-Video 2B i2v                                                                                                      | **~600 s por clip de 4 s**                        | Falla con rostros y planos oscuros (cambia identidad, pierde al sujeto). Wan 2.2 5B está truncado en disco: no usar sin re-descargar.       |
| Animación barata | ffmpeg `zoompan` (Ken Burns) sobre keyframe a 2160 px                                                                 | segundos                                          | Re-renderizable a la duración exacta que pida la timeline.                                                                                  |
| Voz              | Chatterbox Multilingual (`~/Developer/personal/voz/.venv-cbox`), referencia `~/Developer/personal/voz/referencia.wav` | ~2,5-3 palabras/s de habla                        | Generar por frases ≥ 60 caracteres con referencia FIJA; parchear `perth.DummyWatermarker` o `setuptools<81`; siglas y dígitos se destrozan. |
| QC voz           | faster-whisper → WER contra guion                                                                                     | segundos                                          | Umbral ≤ 0,12 ignorando números.                                                                                                            |
| Motion           | Remotion (`ts/`, `pnpm studio` / `npx remotion render`)                                                               | minutos                                           | Assets en `ts/public/<serie>/`.                                                                                                             |
| Montaje          | `/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg` (libass)                                                                      | tiempo real                                       | El ffmpeg 9 de Homebrew no trae libass.                                                                                                     |

Scripts reutilizables: `ts/tools/vo-chatterbox.py`, `ts/tools/vo-qc-whisper.py`, `material/produccion/002-bola-de-nieve/scripts/{flux_keyframe,ltx_clip,submit_rest,vo_002_tomas_v3,vo_002_qc,vo_002_assemble,montaje_002}.py`. Copia y adapta; no reescribas desde cero.

## Principios (y por qué)

1. **La shot list es el contrato, no una lista de tareas.** Cada escena del guion mapea a filas con estado; nada se genera dos veces ni se olvida.
2. **`scene_id` es la clave primaria.** Todo asset referencia su escena (`E07`). Cerrar una escena no rompe la numeración global.
3. **Manifest junto al output.** Cada generación = modelo + prompt + seed + parámetros + versión de workflow. Sin seed registrada no hay forma de regenerar la imagen que "casi sirve".
4. **Encolar todo de una vez.** `/prompt` valida y encola; `/history/{id}` se consulta después. Desacopla la generación del proceso que la lanzó, que muere a la hora.
5. **Lo caro se gasta donde el guion lo pide.** LTX solo donde el movimiento tiene intención narrativa (algo se abre, una transición emocional). Todo lo expositivo es Ken Burns; todo lo que es texto, dato o gráfico es Remotion, nunca difusión.
6. **QC cuantitativo, no "se ve bien".** WER para voz, LUFS y true peak para audio, revisión de manos/texto para imagen, frames congelados para video.
7. **-14 LUFS integrado / -1,5 dBTP.** YouTube normaliza hacia abajo, nunca hacia arriba: entregar bajo suena débil, entregar alto se recorta.
8. **Picture lock por escena.** Cuando keyframe + timing de VO están aprobados, la escena se congela y se puede montar mientras otras iteran.
9. **Naming predecible por máquina.** Un script recorre `E07/keyframe/`, `E07/vo/` sin mapeos ad hoc. Timestamps en el manifest, no en el nombre.
10. **Calibrar antes de la corrida completa.** 1 keyframe + 1 clip LTX + 1 bloque de voz para medir tiempos reales del día antes de encolar 40 escenas.

## Estructura de carpetas

```
material/produccion/<serie>/ep<NN>/
  manifest.json              # shot list + asset manifest: fuente de verdad
  produccion.md              # presupuesto, decisiones de mix, log de corridas
  E01/
    keyframe/E01_k01_s482913.png
    keyframe/E01_k01_s482913.json   # prompt + params + seed, espejo del PNG
    kenburns/E01_kb01.mp4
    ltx/E01_ltx01.mp4               # solo si aplica
    vo/E01_t1.wav … E01_t4.wav
    vo/E01_final.wav
  E02/ …
  vo/episodio_vo.wav         # VO completo concatenado y normalizado
  vo/alineacion.json         # timestamps por palabra (WhisperX/faster-whisper)
  render/ep<NN>_v1.mp4 … ep<NN>_final.mp4
  qc/wer.json  qc/loudness.json  qc/imagenes.md
```

Los assets aprobados se copian (o enlazan) a `ts/public/<serie>/ep<NN>/` para Remotion.

## manifest.json

Lista de objetos, uno por asset; esquema completo en `references/manifest-esquema.md`. Campos mínimos:

```json
{
  "scene_id": "E07",
  "beat": "revelación: 320 camas registradas, 186 operativas",
  "duracion_s": 12,
  "asset_type": "keyframe | kenburns | ltx | vo | motion",
  "pipeline": "flux | ffmpeg | ltx | chatterbox | remotion",
  "prompt": "…",
  "seed": 482913,
  "params": { "steps": 24, "res": "1344x768", "guidance": 3.5 },
  "estado": "pendiente | encolado | generado | aprobado | rechazado",
  "intentos": 2,
  "archivo": "E07/keyframe/E07_k01_s482913.png",
  "qc": { "wer": 0.06, "notas": "manos ok, sin texto" }
}
```

## Presupuesto de render

Con `N_kf` keyframes, `N_ltx` clips LTX de `d` segundos y `P` palabras de guion:

```
T_keyframes = N_kf × 150 s
T_ltx       = N_ltx × (d / 4) × 600 s
T_voz       = (P / 2.75) × 4 tomas × 1.1   (reintentos de QC)
T_remotion  ≈ minutos del episodio × 2-4 (depende de capas)
T_total     = suma + margen 20 %
```

Ejemplo: episodio de 10 min, 40 escenas, 30 keyframes, 6 clips LTX de 4 s, 1.400 palabras → 75 min + 60 min + ~37 min + ~30 min ≈ 3,5 h. Cabe en una noche. Si supera 8 h, baja LTX antes que keyframes.

Heurísticas del mix:

- LTX nunca en rostros ni planos oscuros: se descarta antes de encolar.
- Regla de bolsillo: si 750 s de GPU (keyframe + LTX) no producen un beat que el espectador recordaría, esa escena es Ken Burns.
- Un episodio de datos suele quedar en ~60 % Remotion, ~30 % Ken Burns, ~10 % LTX.

## Flujo de trabajo

1. **Leer** `guion.md` (TIPO de cada escena) y `arte.md` (COMPONENTE / PROMPT / FORMATO / KEN BURNS). Si falta un campo, devolver a la skill dueña; no adivinar.
2. **Escribir `manifest.json`** con todas las escenas en `pendiente` y `produccion.md` con el presupuesto.
3. **Calibrar**: 1 keyframe, 1 LTX (si hay), 1 bloque de voz. Ajustar presupuesto con los tiempos del día.
4. **Voz primero.** La duración real del VO manda la timeline (patrón de `ts/src/remotion/ored/timeline.ts`: duración de escena = `voDesde + voDur + colchon`). Pipeline en `references/pipeline-voz.md`: frases ≥ 60 caracteres, referencia fija, parámetros fijos por bloque (los decide `director-cine`), 4 tomas, WER, concatenación con 0,28 s, `silenceremove`, loudnorm en dos pasadas, alineación por palabra.
5. **Encolar keyframes** en ComfyUI por API (`submit_rest.py`), todos de una vez; vigilar `/history` con Monitor; volcar cada PNG con su JSON espejo.
6. **QC de imágenes** (`references/qc.md`): manos, texto inventado, artefactos, composición con margen para Ken Burns. Rechazadas → nueva seed, mismo prompt; anotar `intentos`.
7. **Ken Burns / LTX** según manifest, a la duración que pida la timeline. LTX: strength 0,10-0,15, prompts de movimiento largos.
8. **Copiar aprobados** a `ts/public/<serie>/ep<NN>/` y entregar a Remotion con la timeline.
9. **Render y master**: `references/entrega-youtube.md` (H.264, AAC 48 kHz 384 kbps, 1080p ≥ 8 Mbps, -14 LUFS, SRT desde la alineación, capítulos, miniatura 1280×720).
10. **Cerrar** `produccion.md` con tiempos reales vs presupuesto: alimenta el siguiente episodio.

## QC por tipo de asset (resumen)

- **Imagen**: dedos, texto inventado, bordes fantasma, sujeto cortado, espacio para el Ken Burns, sin rostro frontal.
- **Voz**: WER ≤ 0,12; sin clics entre frases; true peak ≤ -1,5 dBTP; misma voz entre tomas (misma referencia y parámetros); duración real vs presupuesto por escena.
- **Video**: sin frames congelados (típico de LTX en oscuros), sin banding, sincronía A/V, continuidad en transiciones.
- **Master**: -14 LUFS integrado, -1,5 dBTP, capítulos, SRT, end screen limpio en los últimos 20 s.

## Referencias

- `references/investigacion.md` — fuentes: StudioBinder/Boords (shot list), ComfyUI API, benchmarks FLUX/LTX en Apple Silicon, WhisperX, loudnorm de dos pasadas, specs de YouTube.
- `references/manifest-esquema.md` — esquema completo del manifest.
- `references/pipeline-voz.md` — pasos y comandos de voz.
- `references/qc.md` — checklists completas.
- `references/entrega-youtube.md` — export y metadatos.
- Memorias del proyecto: `pipeline-reel-local`, `tts-local-voz-natural` (trampas ya pagadas).
