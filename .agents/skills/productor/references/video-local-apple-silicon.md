# Investigación: video local i2v + paralaje 2.5D para documental (Mac M5 Pro 48GB)

## Tabla comparativa de modelos

| Modelo                             | Tamaño/cuant MPS                                                                                      | i2v                     | Res/dur                      | s/clip en Mac (fuente)                                                                                                                                                                    | Rostros                                                                                                                                                                        | Licencia                                                                           | ComfyUI                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Wan 2.2 (14B)**                  | FP8 no corre en MPS (error Float8_e4m3fn); GGUF Q4_K_S/Q5_K_M ~9-14 GB, ~24 GB total con encoders/VAE | Sí                      | 1280×720, 81 frames (~5.4 s) | **82 min por clip de 2 s** en M1 Max 64GB, GGUF Q4 (lilting.ch, mar-abr 2026). Sin ruta Metal estable confirmada abr-2026 (localaimaster)                                                 | El mejor del grupo: "sujetos humanos estables en 5 s completos" (localaimaster)                                                                                                | Apache 2.0 (uso comercial OK)                                                      | Custom node ComfyUI-WanVideoWrapper (no nativo)                      |
| **LTX-2 / 2.3 (Lightricks, ~22B)** | FP8 no corre en Metal; GGUF Q3_K_M a Q4_K_M (~11-16 GB), total ~30-42 GB con text encoder             | Sí                      | hasta 1080p, clips de 4-10 s | **T2V 512×288: ~7 min; I2V 768×512: ~13.7 min** por clip en M1 Max 64GB GGUF (lilting.ch). Otra fuente: 4-6 min por clip de 10 s a 1080p en M3 Max (cifra no verificada de forma cruzada) | Débil: "rostro irreconocible", "esencialmente una imagen fija" en pruebas Mac (lilting.ch); en general "rostros fotorrealistas aguantan 2-3 s y luego derivan" (localaimaster) | Licencia custom "LTX-2 Community License" — revisar condiciones antes de monetizar | Nativo en ComfyUI (nodos oficiales Lightricks)                       |
| **HunyuanVideo 1.5 (8.3B)**        | GGUF Q4-Q8 vía ComfyUI-GGUF (City96); ~14 GB mínimo con offload                                       | Sí (I2V 480p)           | 720×1280 o 1280×720, ~5 s    | **~16 min (1580 s) por clip** en M3 Pro 36GB, 6 pasos (fuente: gist GitHub)                                                                                                               | Cinematográfico pero "menos control de prompt"; mejor que LTX, peor que Wan en estabilidad                                                                                     | Abierto (licencia tipo Tencent, permisiva)                                         | Kijai's HunyuanVideoWrapper — el mejor mantenido según localaimaster |
| **CogVideoX-5B**                   | Sin reportes de Mac fiables encontrados                                                               | Limitado (mejor T2V)    | 480p, ~6 s                   | Sin dato de Mac confiable                                                                                                                                                                 | Medio                                                                                                                                                                          | Apache 2.0                                                                         | Soportado, menos activo en 2026                                      |
| **Mochi 1 (Genmo)**                | Sin GGUF/MPS confirmado                                                                               | No soporta imagen→video | 480p T2V                     | Sin dato                                                                                                                                                                                  | No aplica (sin i2v)                                                                                                                                                            | Apache 2.0                                                                         | Soportado pero limitado (sin audio, sin i2v)                         |

**Nota de fuente crítica**: el dato más confiable y específico para Apple Silicon es lilting.ch (marzo–abril 2026, M1 Max 64 GB, pruebas directas con timestamps). Es hardware más lento que un M5 Pro, pero la brecha entre LTX-2 y Wan 2.2 (≈6x en tiempo) probablemente se mantiene proporcional. No encontré benchmarks publicados específicos de M5 (chip muy reciente, poca cobertura aún).

## Recomendación y plan B

**Recomendación: LTX-2 (GGUF Q4_K_M) como motor principal, pero NO para primeros planos de rostro.**

Con los tiempos de lilting.ch (I2V 768×512 ≈ 13.7 min/clip en hardware más débil que tu M5 Pro), 30 clips de 4-6 s en LTX-2 dan un estimado de **~5-7 horas de cómputo total** (asumiendo mejora moderada por M5 Pro vs M1 Max, sin garantía — podría ser más rápido o similar si el cuello de botella es memoria/arquitectura más que núcleos). Con Wan 2.2 (82 min/clip de 2 s ⇒ >160 min/clip de 4 s), 30 clips serían **>80 horas**, inviable para este proyecto.

Plan concreto:

- **LTX-2 GGUF** para planos amplios, paisajes, manos, texturas, movimiento de cámara sin rostro protagonista — donde la degradación de identidad a los 2-3 s no se nota.
- **Evitar LTX-2/Wan i2v para rostros hablando o en primer plano** — ya confirmaste que LTX 0.9.5 falla con rostros y planos oscuros; LTX-2 mejora pero sigue derivando.
- **Plan B para planos con personas/rostros**: no generar el movimiento vía i2v puro. Usar **paralaje 2.5D desde foto fija con Depth Anything V2 + Depthflow** (ver sección siguiente) para esos planos — controlas la cámara, el rostro de FLUX se mantiene nítido porque nunca se re-difunde, solo se desplaza en capas. Esto es más barato en tiempo (segundos, no minutos) y evita el drift.
- Si necesitas sí o sí video generativo con persona moviéndose (no solo cámara), reserva HunyuanVideo 1.5 GGUF Q4-Q5 como opción intermedia (~16 min/clip en hardware más débil; en M5 Pro probablemente 8-12 min) para 3-5 tomas críticas, no las 30.

**Estimado total realista para el documental**: mezcla de ~20 clips LTX-2 (paisajes/b-roll sin rostro protagonista, ~5-7 h) + 10 planos de paralaje 2.5D (minutos, no horas) es el camino más rápido para terminar en 1-2 días de cómputo en vez de una semana.

## Paralaje 2.5D: flujo recomendado y trampas

**Flujo recomendado**: `Depth Anything V2 (ComfyUI, DownloadAndLoadDepthAnythingV2Model)` → mapa de profundidad → `ComfyUI-Depthflow-Nodes` (akatz-ai) aplica movimiento de cámara (orbital, dolly, zoom) combinando imagen original + depth map → exporta clip directamente desde ComfyUI, sin necesidad de re-difundir nada.

Alternativa para integrarlo en tu pipeline Remotion: exportar imagen + depth map (PNG de 16 bits) y animar el desplazamiento por capas con displacement/parallax en WebGL o CSS transform por profundidad — te da control de keyframes que Remotion ya maneja, en vez de depender del preset de Depthflow.

**Qué se ve creíble**:

- Movimientos de cámara sutiles y lentos (dolly/orbital pequeño, no giros grandes) — el ojo perdona poco desplazamiento.
- Fondos con profundidad gradual (paisajes, calles, interiores con capas claras).
- Duración corta (2-4 s) antes de que los artefactos se acumulen.

**Qué delata (trampas)**:

- **Bordes**: al mover la cámara se revelan áreas sin información (oclusión) detrás de objetos en primer plano — aparecen como "estiramiento" o relleno borroso/repetido. Depthflow tiene poco control de inpainting de esas zonas.
- **Rostros en primer plano con movimiento fuerte**: el mapa de profundidad no captura micro-relieve facial, así que un dolly agresivo hace que la cara se vea "pegada" (efecto cartón cortado / cutout), no 3D real.
- **Objetos delgados** (postes, ramas, rejas de hospital) generan bordes con halo o desgarro al desplazarse.
- Mitigación: mantener el movimiento de cámara mínimo, usar planos con composición donde el sujeto principal esté cerca del centro (menos paralaje relativo), y probar con Vignette/Depth of Field del propio Depthflow para disimular bordes en la periferia.

## Metraje de archivo: fuentes y licencias

| Fuente                                                                                                  | Licencia                                                                                                  | Uso en YouTube monetizado                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Pexels Video**                                                                                        | CC0 (dominio público equivalente)                                                                         | Sí, sin atribución requerida                                                                                               |
| **Pixabay Video**                                                                                       | Pixabay Content License (permisiva)                                                                       | Sí, sin atribución requerida, permite comercial                                                                            |
| **Wikimedia Commons**                                                                                   | Mixta: dominio público, CC0, CC-BY, CC-BY-SA por archivo — **verificar licencia individual de cada clip** | Depende: CC-BY-SA exige compartir bajo la misma licencia (complicado en YouTube monetizado); CC0/dominio público es seguro |
| **Internet Archive**                                                                                    | Mixta por colección: dominio público, CC, "no known copyright" — **verificar por ítem, no asumir**        | Sólo los marcados dominio público/CC0/CC-BY sin restricción son seguros para monetizar                                     |
| **YouTube CC-BY search**                                                                                | CC-BY (filtro "Creative Commons" en resultados)                                                           | Sí, requiere atribución en descripción                                                                                     |
| **NASA / archivos gubernamentales US** (no verificado en esta sesión, pero es fuente estándar conocida) | Dominio público por defecto                                                                               | Sí, sin restricción — verificar caso a caso                                                                                |

**Nota**: no encontré en esta búsqueda un banco específico de metraje de un tema de nicho (p. ej. "hospitales" de un país concreto) con licencia clara — es contenido de nicho poco cubierto en bancos genéricos gratuitos. Recomendación práctica: buscar directamente en Wikimedia Commons y Internet Archive con términos como "hospital" más el nombre del país o de la ciudad y revisar la licencia de cada ítem individualmente (no hay garantía de volumen ni calidad). Para cobertura confiable de personas/rostros en contexto hospitalario concreto, es más realista depender de tu propio material (paralaje 2.5D desde fotos con permiso, o footage genérico de hospitales de Pexels/Pixabay sin especificidad geográfica) que de encontrar b-roll de archivo específico y gratuito.

## Consistencia de personajes

Para mantener al mismo médico reconocible en 3 escenas, generado con FLUX localmente:

- **PuLID (PuLID Flux II)**: mejor opción para preservar identidad facial entre generaciones — "supera a IP-Adapter en la mayoría de pruebas de consistencia facial en Flux" (aiofm.info). Costo: una imagen de referencia, inferencia rápida, sin entrenamiento. Requiere fijar bloques de prompt o conditioning regional para mantener también vestuario/contexto.
- **IP-Adapter FaceID / IP-Adapter-Flux**: más rápido para variaciones visuales, pero pierde estabilidad en cambios grandes de pose o estilo — úsalo si los 3 planos son ángulos/poses similares.
- **LoRA rápida del personaje**: más costoso (requiere entrenamiento, aunque sea rápido con pocas imágenes), pero da la consistencia más robusta a través de poses y estilos muy distintos — vale la pena solo si el "médico" aparece en más de 3-4 escenas o en planos muy variados.
- **ControlNet** (pose/estructura): complementario, no sustituto — se usa junto con PuLID/IP-Adapter para fijar composición, no identidad.

**Recomendación concreta para 3 escenas**: PuLID Flux II con una imagen de referencia fija del "médico", sin LoRA (no justifica el tiempo de entrenamiento para solo 3 tomas). Si el resultado no es lo bastante estable en la tercera escena, escalar a LoRA rápida (few-shot, ~15-20 min de entrenamiento local típico, no verificado específicamente en M5 Pro en esta investigación).

## Fuentes

- [LTX-2 vs Wan 2.2 on M1 Max 64GB: FP8 fails on Metal, GGUF Wan 2.2 takes 82 min per 2-sec clip](https://lilting.ch/en/articles/ltx2-wan22-mac-local-video-gen) — mar/abr 2026, benchmark directo en Apple Silicon
- [Best Open-Source AI Video Generation Models (2026) — localaimaster.com comparison](https://localaimaster.com/blog/local-ai-video-generation)
- [LTX-2 on Apple Silicon (ComfyUI Desktop) — GitHub issue](https://github.com/Lightricks/ComfyUI-LTXVideo/issues/386)
- [Detailed Guide for Running Hunyuan Video T2V on M4 MacBook — GitHub gist](https://gist.github.com/mdbecker/be0c1730e4a9a8830e46c72812f18a6e)
- [HunyuanVideo 1.5 GGUF/FP16/BF16 in ComfyUI](https://www.stablediffusiontutorials.com/2025/12/hunyuan-video-1.5.html)
- [Wan 2.5: Free Open-Source AI Video Generator — Ropewalk](https://ropewalk.ai/blog/wan-25-free-ai-video-generator-guide-2026)
- [ComfyUI-Depthflow-Nodes — GitHub (akatz-ai)](https://github.com/akatz-ai/ComfyUI-Depthflow-Nodes)
- [Depthflow Nodes detailed guide — RunComfy](https://www.runcomfy.com/comfyui-nodes/ComfyUI-Depthflow-Nodes)
- [Commons:Free media resources/Video — Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:Free_media_resources/Video)
- [Pixabay — Wikipedia (licencia)](https://en.wikipedia.org/wiki/Pixabay)
- [Pexels — Wikipedia (licencia CC0)](https://en.wikipedia.org/wiki/Pexels)
- [PuLID vs InstantID vs IP-Adapter FaceID: 2026 Face-Consistency Showdown](https://aiofm.info/en/guides/pulid-vs-instantid-vs-faceid)
- [PuLID Flux II in ComfyUI — RunComfy](https://www.runcomfy.com/comfyui-workflows/pulid-flux-ii-in-comfyui-consistent-character-ai-generation)
- [ComfyUI-IPAdapter-Flux — GitHub (Shakker-Labs)](https://github.com/Shakker-Labs/ComfyUI-IPAdapter-Flux)
