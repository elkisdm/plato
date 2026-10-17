# Principios

1. **La shot list es el contrato entre guion y assets, no una lista de tareas.** StudioBinder y Boords insisten en que cada fila mapea escena→shot→estado, para que nada se produzca dos veces ni se olvide (studiobinder.com, boords.com).
2. **Numerar por escena, no por asset.** `scene_id` (SC01, SC02…) es la clave primaria; cada asset (keyframe, clip, VO) referencia su `scene_id`. Así el picture lock de una escena no rompe la numeración global.
3. **Un manifest JSON por corrida es la unidad de reproducibilidad, no el archivo de imagen suelto.** El flujo documentado como "reproducible AI video workflow" trata cada generación como Model+Prompt+Seed+Resolución+Params+WorkflowVersion=Output, y guarda ese manifest junto al output (viblo.asia).
4. **Seed + prompt van pegados al archivo, no en la cabeza del operador.** Sin seed registrado no hay manera de regenerar una imagen que casi sirve; con seed, iterar es determinista (ltx.io, prompt-architects.com).
5. **Encolar todo en ComfyUI de una vez es correcto y es la práctica estándar de batch**: `/prompt` valida y encola, `/history/{id}` se puede pollear (o WebSocket) sin bloquear el proceso que lo lanzó — así sobrevive a que el harness mate procesos de fondo a la hora (docs.comfy.org, medium.com/@yushantripleseven).
6. **El costo caro (LTX) se reserva para donde el movimiento aporta narrativa; todo lo demás es Ken Burns.** Es la misma lógica de "coverage" en documental: primero se cubre con planos baratos, el plano caro se gasta donde el guion lo pide explícitamente.
7. **QC cuantitativo, no "se ve bien".** WER contra guion para voz, LUFS medido para loudness, hash/frame-diff para duplicados: son los mismos ejes que usa la industria (voz: WhisperX/faster-whisper; audio: ffmpeg loudnorm en dos pasadas) (dev.to/masonwritescode).
8. **-14 LUFS integrado es el target porque YouTube normaliza ahí** — subir más alto no gana volumen, solo arriesga clipping tras la normalización de la plataforma (ffmpeg-cookbook.com, techearl.com).
9. **Picture lock se declara por escena cuando el keyframe + timing de VO están aprobados**, no cuando todo el episodio está terminado — permite paralelizar animación/motion graphics de escenas ya cerradas mientras otras siguen en iteración.
10. **Frases ≥60 caracteres para TTS no es capricho: Chatterbox es más estable con más contexto por frase**, y el `cfg_weight`/`exaggeration` correctos dependen de la referencia usada — hay que fijarlos una vez y no tocarlos entre tomas para no cambiar de voz a mitad de episodio (replicate.com/resemble-ai).
11. **Forced alignment (WhisperX) es el puente entre voz y subtítulos karaoke/timeline**, porque da timestamp por palabra con <100ms de error, algo que Whisper plano no ofrece (whipscribe.com, forasoft.com).
12. **El naming de carpetas debe ser predecible por máquina, no memorizable por humano** — así un script puede recorrer `sc01/keyframe/`, `sc01/vo/`, `sc01/render/` sin mapeos ad hoc.

# Plantilla de shot list / asset manifest

Campos mínimos (inspirados en StudioBinder + Boords + necesidades de pipeline IA):

| Campo         | Ejemplo                                                  | Nota                            |
| ------------- | -------------------------------------------------------- | ------------------------------- |
| `scene_id`    | `SC03`                                                   | clave primaria, orden narrativo |
| `beat`        | "revelación del dato clave"                              | qué cuenta la escena, 1 línea   |
| `duración_s`  | 12                                                       | del guion/VO estimado           |
| `asset_type`  | `keyframe` / `ltx_clip` / `kenburns` / `motion_graphic`  | decide el pipeline              |
| `prompt`      | texto completo del prompt FLUX                           | reproducibilidad                |
| `seed`        | 482913                                                   | reproducibilidad                |
| `params`      | steps=24, res=768x1344, cfg=1.0                          | reproducibilidad                |
| `estado`      | `pendiente`/`encolado`/`generado`/`aprobado`/`rechazado` | pipeline status                 |
| `intentos`    | 2                                                        | cuántas tomas se generaron      |
| `archivo`     | `sc03/keyframe/sc03_k01_s482913.png`                     | ruta real                       |
| `vo_wer`      | 0.06                                                     | solo si asset_type incluye VO   |
| `notas_qc`    | "manos en toma 1, usar toma 2"                           | libre                           |
| `responsable` | n/a (pipeline solo, sin equipo)                          | opcional en 1 persona           |

Esto vive como **manifest.json por episodio** (lista de objetos, uno por escena/asset) — es el mismo patrón que documenta el flujo "reproducible AI video workflow" con manifest.json junto a cada output (viblo.asia, hackernoon.com).

# Estructura de carpetas y naming

```
episodio-01/
  guion/guion.md
  manifest.json                 # shot list + asset manifest, fuente de verdad
  sc01/
    keyframe/sc01_k01_s482913.png
    keyframe/sc01_k01_s482913.json   # prompt+params+seed espejo del PNG
    ltx/sc01_ltx01.mp4                # si aplica
    kenburns/sc01_kb01.mp4            # si aplica (alternativa barata)
    vo/sc01_vo_take1.wav
    vo/sc01_vo_take2.wav
    vo/sc01_vo_final.wav              # la toma elegida, symlink o copia
  sc02/ ...
  motion/                       # composiciones Remotion (spec TS), no por escena si son globales
  render/
    episodio01_v1.mp4
    episodio01_final.mp4
  qc/
    wer_report.json
    loudness_report.json
```

Naming: `{scene_id}_{asset_short}_{n:02d}` y, cuando hay seed, sufijo `_s{seed}`. Evita timestamps en el nombre (rompen reproducibilidad visual del orden); el timestamp vive en el manifest, no en el filename.

# Fórmula de presupuesto de render

Con tus tiempos medidos:

- FLUX keyframe: ~150 s/imagen (consistente con benchmarks públicos de 50–90 s para Q6 a 1024², más lento porque tu resolución es mayor 768×1344 y Q8; ver heyuan110.com, apatero.com).
- LTX-Video i2v: ~600 s / 4 s de clip (consistente con reportes de 3.5–5 min por clip en M3/M4 con 48 GB; jocheojeda.com, smeltcore.com).
- Ken Burns ffmpeg zoompan: segundos (CPU, no cuenta para el presupuesto de GPU).
- Voz Chatterbox: ~2.5–3 palabras/s de generación (no de habla) más overhead de frases cortas.

**Fórmula por episodio de N escenas, con `k` = fracción de escenas que llevan LTX:**

```
T_keyframes = N_escenas_con_keyframe × 150 s
T_ltx       = N_escenas_ltx × (duración_clip_s / 4) × 600 s
T_voz       = palabras_guion / 2.75 palabras/s  (+ ~10% por reintentos de QC)
T_render_final = minutos_episodio × factor_ffmpeg (≈ tiempo real, orden de minutos)

T_total ≈ T_keyframes + T_ltx + T_voz + T_render_final
```

Para un episodio de 10 min con ~40 escenas: 40 keyframes = 6000 s (~100 min); si el 20% (8 escenas) lleva LTX de 4 s, son 8×600 s = 4800 s (80 min); voz ~1400 palabras / 2.75 ≈ 510 s (~8.5 min) más reintentos. Total generativo ronda 3 horas — cabe cómodo en la ventana de 8 h, dejando margen para QC, regeneraciones y el render Remotion+ffmpeg.

**Heurística de mix (dónde vale el LTX caro):**

- LTX solo donde el guion pide movimiento con intención narrativa (un objeto que se abre, una transición emocional) — nunca como "porque se puede".
- Nunca LTX en rostros o planos oscuros: falla documentado, se descarta antes de encolar.
- Ken Burns por defecto para todo plano informativo/expositivo (la mayoría de un documental de datos).
- Motion graphics (Remotion) para todo lo que sea texto, gráfico, dato — no vale la pena generarlo con difusión.
- Regla de bolsillo: si el costo GPU de una escena (150 s keyframe + 600 s LTX = 750 s) no se traduce en un beat que el espectador recordaría, bájala a Ken Burns.

# Checklist de QC por tipo de asset

**Imágenes (FLUX):**

- Manos: dedos de más/menos, deformación
- Texto en la imagen: ilegible o inventado (FLUX inventa texto)
- Artefactos: bordes fantasma, blending raro entre elementos
- Composición: sujeto no cortado en mal punto, foco correcto

**Voz (Chatterbox):**

- WER contra guion con faster-whisper, umbral ≤0.12 (tu propio criterio, consistente con uso de WhisperX/faster-whisper para QC de TTS)
- Respiraciones/artefactos audibles entre frases concatenadas
- Clipping (true peak > -1 dBTP)
- Loudness integrado ≈ -14 LUFS (target YouTube) (ffmpeg-cookbook.com, techearl.com)
- Consistencia de voz entre tomas (misma referencia, mismo cfg_weight/exaggeration)

**Video (LTX / Ken Burns / Remotion):**

- Frames duplicados o congelados (fallo típico de i2v con planos oscuros)
- Banding en gradientes o cielos
- Sincronía audio-video en el corte final
- Transiciones sin salto de continuidad brusco

# Pipeline de voz (pasos concretos)

1. **Preparar guion en frases ≥60 caracteres** (Chatterbox es más estable con más contexto; frases cortas cambian de tono).
2. **Generar por frase** con referencia fija (mismo WAV en todo el episodio) y parámetros fijos: `exaggeration=0.5, cfg_weight=0.5` como base; si la referencia habla rápido, bajar `cfg_weight` a ~0.3 (replicate.com/resemble-ai/chatterbox-multilingual).
3. **4 tomas por bloque**, elegir la mejor por WER (faster-whisper) + duración esperada vs. real.
4. **Concatenar con ~0.28 s de silencio** entre frases (tu valor medido, respétalo).
5. **QC de loudness en dos pasadas con ffmpeg**:
   ```bash
   # Pass 1 — medir
   ffmpeg -i vo_final.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
   # Pass 2 — aplicar con los valores medidos
   ffmpeg -i vo_final.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<th>:linear=true -ar 48000 vo_final_norm.wav
   ```
   (dev.to/masonwritescode, ffmpeg-cookbook.com)
6. **Forced alignment con WhisperX** sobre el WAV final para timestamps por palabra → export SRT karaoke (`--highlight_words true`) y timeline para Remotion (whipscribe.com, forasoft.com).
7. **De-esser / limpieza** si hace falta: `ffmpeg -af "deesser"` antes del loudnorm, no después (el loudnorm re-normaliza y puede resaltar sibilancia si se aplica antes).

# Specs de entrega YouTube

- Contenedor/códec: MP4, H.264, AAC-LC 48 kHz (ffmpeg-cookbook.com, pixel8production.com).
- Bitrate: 1080p30 ≈ 8 Mbps, 1080p60 ≈ 12 Mbps, 4K ≈ 35–68 Mbps; audio 384 kbps estéreo.
- Resolución: exportar en la resolución nativa del render (no hacer upscale artificial); 1080p es el mínimo razonable para un documental de 10-15 min.
- Loudness: -14 LUFS integrado, true peak ≤ -1 dBTP.
- Subtítulos: SRT (o WebVTT) generados desde WhisperX; capítulos como timestamps en la descripción (`00:00 Intro`).
- Miniatura: 1280×720, preparada aparte del render.
- Metadatos a preparar en producción (no en post): título, descripción con capítulos, tags, miniatura — mismo manifest.json puede llevar un campo `metadata` al final del episodio.

# Fuentes

- [Documentary Shot List Template & Guide | StudioBinder](https://www.studiobinder.com/templates/shot-list/documentary-shot-list-template/)
- [Free Shot List Template (2026 Guide) | Boords](https://boords.com/shot-list-template)
- [Shot List Template Guide: Fields, Formats & Examples (2026) | Seikan](https://seikan.app/blog/shot-list-template-guide)
- [ComfyUI Server Routes (HTTP and WebSocket API) - docs.comfy.org](https://docs.comfy.org/development/comfyui-server/comms_routes)
- [ComfyUI : WebSockets API : Part 1 | Medium](https://medium.com/@yushantripleseven/comfyui-websockets-api-part-1-618175802d5a)
- [ComfyUI Batch Processing: Automate 1000+ Images | Apatero](https://apatero.com/blog/comfyui-batch-processing-1000-images-automation-2026)
- [LTX-Video discussion: does it work on M3/M4 | Hugging Face](https://huggingface.co/Lightricks/LTX-Video/discussions/26)
- [LTX Video 2.3 on Apple M2 Max | smeltcore.com](https://smeltcore.com/recipes/ltx-video-2-3-m2-max/)
- [Local AI Studio Part 3: FLUX, SDXL, fp8-vs-GGUF | jocheojeda.com](https://www.jocheojeda.com/2026/06/02/local-ai-studio-part-3-flux-sdxl-and-the-fp8-gguf-myth/)
- [Mac Mini M4 AI Image Generation 2026 benchmark | heyuan110.com](https://www.heyuan110.com/posts/ai/2026-02-15-mac-mini-local-image-generation/)
- [Flux on Apple Silicon: M1/M2/M3/M4 Complete Guide | Apatero](https://www.apatero.com/blog/flux-apple-silicon-m1-m2-m3-m4-complete-performance-guide-2025)
- [WhisperX GitHub](https://github.com/m-bain/whisperx)
- [WhisperX Deep-Dive — Diarization and Word-Level Timestamps | forasoft.com](https://www.forasoft.com/learn/ai-for-video-engineering/articles-ai/whisperx-diarization-word-level-timestamps)
- [whisperX setup, word timestamps, diarization | whipscribe.com](https://whipscribe.com/tools/whisperx)
- [Two-pass loudness normalization with FFmpeg loudnorm | dev.to](https://dev.to/masonwritescode/two-pass-loudness-normalization-with-ffmpeg-loudnorm-the-right-way-1nm3)
- [FFmpeg YouTube Encoding Settings — 2026 Guide | ffmpeg-cookbook.com](https://ffmpeg-cookbook.com/en/articles/youtube-ffmpeg-settings/)
- [YouTube Video Specs: Resolution and Bitrate | pixel8production.com](https://www.pixel8production.com/blog/youtube-video-specs-resolution-bitrate)
- [How I Structure a Reproducible Local AI Video Workflow with ComfyUI | viblo.asia](https://viblo.asia/p/how-i-structure-a-reproducible-local-ai-video-workflow-with-comfyui-wd43ElOwLX9)
- [How to Organize AI-Generated Video Clips | HackerNoon](https://hackernoon.com/how-to-organize-ai-generated-video-clips-before-you-lose-track-of-200-files)
- [How To Use Seeds In AI Video | LTX Blog](https://ltx.io/blog/how-to-use-seeds-in-ai-video)
- [Chatterbox Multilingual Readme | Replicate](https://replicate.com/resemble-ai/chatterbox-multilingual/readme)
- [ResembleAI/chatterbox | Hugging Face](https://huggingface.co/ResembleAI/chatterbox)
