# Principios de dirección y montaje

1. **Cortar en la idea, no en el silencio.** En explainers tipo Vox y documentales de datos el corte llega cuando entra información nueva, no cuando termina la frase — la imagen adelanta o sostiene el dato mientras la voz sigue. Por qué: mantiene la sensación de "siempre está pasando algo" sin que se note el montaje.
2. **L-cut como default en narración con b-roll.** El audio (VO) es la columna continua; la imagen corta libremente debajo. Por qué: es el patrón dominante en explainers con narración ininterrumpida — separa el ritmo visual del ritmo verbal y evita que cada corte de imagen se sienta como un corte de "escena".
3. **Textura y quiebre analógico como firma, no decoración.** Grain, light leaks, film burns sobre fotos fijas dan tangibilidad a b-roll generado (aplica directo a paper-cutout y FLUX+Ken Burns). Por qué: compensa la "limpieza" de lo sintético.
4. **El dato clave se ancla con un beat antes, no después.** Un instante de aire (pausa, música que baja, plano que se sostiene) justo antes del número/afirmación fuerte, y el gráfico/texto entra en ese silencio. Por qué: el silencio funciona como señal de "esto importa", entrena al espectador a prestar atención en esos huecos.
5. **Texto en pantalla ancla, no transcribe.** 2-5 palabras que refuerzan la idea de la voz, nunca subtítulo literal salvo el karaoke dedicado. Por qué: redundancia literal reduce la carga cognitiva útil y se siente a "PowerPoint leído en voz alta".
6. **Ken Burns con intención direccional.** Zoom-in hacia el sujeto en tensión/pregunta, zoom-out o movimiento lateral en resolución/contexto. Por qué: el movimiento de cámara es lenguaje, no relleno — un zoom sin motivo narrativo se lee como plantilla genérica.
7. **Transición como puntuación, no como "wow".** Reservar transiciones con significado (cambio de tema, salto temporal, cambio de escala del dato) y usar corte directo/L-cut para todo lo demás. Por qué: transición sobreusada pierde su función de señal.
8. **La pantalla "respira" en los cambios de sección.** Tras un bloque denso de datos, un plano más largo (3-5 s) sin texto nuevo, música que sube un poco. Por qué: da al espectador un punto de descanso cognitivo antes del siguiente bloque, evita fatiga informativa.
9. **Cortar en 10 cortes en 10 segundos sin que se note (invisible cutting).** El objetivo no es la velocidad del corte sino que el corte nunca se sienta como corte — sensación de movimiento constante hacia adelante. Por qué: retención en minuto 5-10 depende de que el video nunca se sienta "estático".
10. **Leitmotiv sonoro y motivo visual recurrente entre episodios.** Un tema musical corto, una transición firma, una paleta por tipo de sección (dato duro / testimonio / contexto). Por qué: construye identidad de serie reconocible sin depender del logo.
11. **El pacing documental es más lento que el explainer viral — y eso es una decisión, no un defecto.** Con datos y evidencia el espectador necesita tiempo de procesamiento; forzar el ritmo de Vox/Cleo Abram sobre contenido denso en cifras sanitarias puede sacrificar comprensión por dinamismo.
12. **Revisar por pasadas separadas, nunca todo a la vez.** Estructura, luego ritmo, luego sonido — mezclar los tres criterios en una sola revisión hace que se corrija lo visible y se ignore lo estructural.

# Reglas numéricas

- **Texto en pantalla — velocidad de lectura mínima:** 13 caracteres/segundo como mínimo (dwell time), zona cómoda 15-17 CPS, techo duro ~20 CPS. Una línea de 30 caracteres necesita ≥2.3 s en pantalla; +1 s por cada 13 caracteres adicionales. Máx. 30 caracteres por línea, máx. 3 líneas simultáneas. (subtitling.net, legibility.info)
- **Subtítulos karaoke — duración mínima:** no menos de 20 frames (~0.8 s) por segmento; 3 s para una línea, 6 s para dos líneas si el bloque es de lectura libre.
- **Narración documental:** 110-140 palabras por minuto (pace relajado, reflexivo); 120 wpm como número central razonable para tono documental serio. Evitar el rango 150-170 wpm típico de explainer dinámico tipo Vox si el tono buscado es más "informe" que "video viral".
- **Pausas dramáticas:** 1-3 segundos entre frases/ideas cuando se busca dar peso a un dato; recortar pausas de respiración normales en la edición fina.
- **Beat antes de dato clave:** 0.3-0.8 s de aire visual/sonoro (música baja, plano se sostiene) inmediatamente antes de revelar cifra o afirmación fuerte.
- **Plano de "respiro" tras bloque denso:** 3-5 s sin texto nuevo entrando.
- **Niveles de mezcla (YouTube, target final -14 LUFS integrado):**
  - VO: -16 a -12 LUFS short-term (o -12 a -6 dBFS peak como referencia rápida de picos).
  - Música bajo voz: -22 a -28 LUFS / uso de ducking o sidechain de -6 a -10 dB cuando entra la VO.
  - True peak: por debajo de -1 dBTP para evitar artefactos de recodificación.
  - Loudness integrado final del máster: -14 LUFS (YouTube normaliza hacia abajo contenido más alto, no sube contenido más bajo — mejor entregar cerca del target que por debajo).
- **Cold open:** 15-30 s, sin logo de serie todavía.
- **Intro/título de serie:** ≤5 s, entra después del cold open, nunca antes.
- **CTA + end screen:** últimos 20 s del video reservados para elementos de fin de pantalla de YouTube (suscripción, video siguiente).

# Dirección de VO y marcado del guion

- **Marcado del guion para narrador/TTS:** usar notación explícita de pausas (`...` corto de 0.3-0.5s, `//` o línea en blanco para pausa larga de 1-3s), MAYÚSCULA o `*palabra*` para marcar la palabra de énfasis en la frase (evita que el TTS enfatice la palabra equivocada), y quiebres de párrafo para cambios de ritmo/sección (permite variar exaggeration/cfg_weight por bloque si se genera por segmentos).
- **Chatterbox — parámetros y su efecto (documentado en el repo/API):**
  - `exaggeration` (rango 0.25-2.0, default 0.5 estándar / 0.0 Turbo): controla expresividad y prosodia emocional. Valores altos → habla más dramática pero también acelera el ritmo de forma audible (efecto secundario no deseado si se busca tono documental sobrio).
  - `cfg_weight` (rango 0.0-1.0): guía de classifier-free guidance; controla cuánto se adhiere el modelo a la condición de voz de referencia. Valores altos + exaggeration alto = riesgo de audio inestable o sobre-exagerado; conviene bajar cfg_weight cuando se sube exaggeration.
  - `temperature` (rango 0.05-5.0): aleatoriedad del muestreo de tokens; más alto = más variación/naturalidad pero también más riesgo de artefactos; más bajo = más determinista y plano.
  - Recomendación práctica para tono documental: exaggeration bajo-medio (0.4-0.6), cfg_weight medio (0.4-0.6) para estabilidad, temperature moderada (0.6-0.9) — y subir exaggeration puntualmente solo en frases de revelación/tensión, no en todo el guion.
- **Evaluación de tomas (QC):** naturalidad (¿suena a alguien leyendo o a alguien contando?), prosodia (¿la entonación sube/baja donde debería?), énfasis en la palabra correcta de cada frase, ausencia de artefactos (clicks, saltos), y verificación objetiva con WER (word error rate) vía transcripción automática (faster-whisper) contra el guion — ya usado en el pipeline TTS local del proyecto (ver memoria `tts-local-voz-natural`).

# Diseño sonoro: capas, niveles, fuentes libres

- **Capas del mix, de arriba hacia abajo en prioridad:** VO (siempre más alto) → SFX de motion graphics (whoosh de transición, pop de aparición de texto/dato, tick de contador) → música (cama emocional, sube solo en pausas de VO) → ambiente de b-roll (muy bajo, solo textura, casi subliminal).
- **Regla de ducking:** cuando entra VO, música baja 6-10 dB automáticamente (sidechain o automatización manual por clip); cuando VO calla más de ~1.5 s, música puede recuperar nivel gradualmente (no de golpe).
- **Elección de música por sección:** tensión/pregunta abierta → cama en menor, ritmo lento, sin percusión definida; revelación de dato → swell corto o cambio de textura (no necesariamente más volumen); esperanza/resolución → mayor, más luminoso, con más aire armónico. Evitar que la música "cuente la historia" por el espectador — debe apoyar, no anticipar el giro.
- **Fuentes libres verificadas:** Pixabay Music/SFX (licencia propia, uso comercial sin atribución), YouTube Audio Library (histórico, licencias claras por pista, verificar caso a caso), Freesound (filtrar por CC0 específicamente, evitar CC-BY si se quiere evitar atribución), Free Music Archive (verificar licencia por track, mezcla CC0/CC-BY/CC-NC). Epidemic Sound explícitamente descartado por el usuario (no libre).

# Anatomía de apertura y cierre

- **Cold open (15-30 s):** entra con una pregunta, imagen o dato de alto impacto antes de cualquier logo/título — sin explicar el contexto completo todavía, crea el gancho que se resuelve en el cuerpo del video.
- **Título/intro de serie:** entra inmediatamente después del cold open, dura ≤5 s, es el único momento "de marca" explícito del video — leitmotiv musical corto + motivo visual (transición firma).
- **Cierre:** resolución del arco narrativo del episodio (no del arco de la serie completa) en tono coherente con el resto — evitar CTA agresivo que rompa el registro documental ("suscríbete YA") a favor de una invitación breve integrada al cierre narrativo.
- **End screen:** últimos 20 s reservados visualmente para los elementos nativos de YouTube (video siguiente, suscripción) — el corte final debe dejar espacio de composición limpio en esa zona, no texto ni gráficos compitiendo.

# Checklist de revisión de cortes (rough → fine → lock)

**Rough cut (estructura):**

- ¿El arco narrativo del episodio se sostiene sin música ni gráficos, solo con VO + placeholders?
- ¿Cada sección tiene un propósito claro (contexto / tensión / dato / resolución)?
- ¿Hay redundancia de información entre secciones que se puede cortar?
- Duración total dentro del rango objetivo (5-15 min).

**Fine cut (ritmo y visual):**

- ¿Los cortes caen en la idea nueva, no en el silencio muerto?
- ¿Hay al menos un "respiro" (plano largo, sin texto nuevo) después de cada bloque denso de datos?
- ¿El texto en pantalla cumple el mínimo de dwell time (13-17 CPS) y no repite literal la VO?
- ¿Los Ken Burns/zooms tienen dirección intencional (hacia tensión, alejando en resolución)?
- ¿Las transiciones usadas tienen significado narrativo, no son solo decorativas?

**Picture lock (sonido y entrega):**

- ¿VO se mantiene -16 a -12 LUFS short-term de forma consistente en todo el episodio?
- ¿Música duckea correctamente bajo cada línea de VO (sin choques ni "peleas" de volumen)?
- ¿SFX de motion graphics están presentes en cada transición/aparición de dato, sin saturar?
- ¿True peak <-1 dBTP y loudness integrado ≈-14 LUFS en el máster final?
- ¿Cold open, intro de serie (≤5s) y end screen (últimos 20s) están en su lugar y con la duración correcta?
- ¿Se mantiene coherencia de leitmotiv musical y motivo visual con episodios anteriores de la serie?

# Anti-patrones

- Texto en pantalla que transcribe literalmente lo que dice la voz (redundancia, no anclaje).
- Zoom/Ken Burns sin dirección narrativa (movimiento por movimiento, no por intención).
- Transición decorativa usada en cada corte — pierde su valor de señal cuando se vuelve wallpaper.
- Música al mismo nivel que la VO sin ducking — la causa más común de "no se entiende lo que dice".
- Ritmo de explainer viral (150-170 wpm, corte cada 1-2 s) forzado sobre contenido con datos que requieren procesamiento — sacrifica comprensión por dinamismo.
- Exaggeration alto en Chatterbox aplicado uniformemente a todo el guion — resulta en narración "sobreactuada" y ritmo acelerado sin control.
- CTA agresivo o genérico de "suscríbete" que rompe el tono documental justo en el cierre.
- Loudness final por debajo de -14 LUFS "por seguridad" — YouTube no sube el volumen, solo lo baja, así que quedar bajo suena más débil que el resto de la plataforma.
- Reutilizar el mismo tipo de corte/transición en todos los episodios sin variación dentro del motivo recurrente — la coherencia de serie no es repetición idéntica, es familia de variaciones sobre un mismo lenguaje.

# Fuentes

- [Advanced retention editing: cutting strategies past minute 8 — AIR Media-Tech](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8)
- [J Cut and L Cut Explained (2026) — CutFast Blog](https://cutfa.st/en/blog/j-cut-l-cut-audio-transition-editing-cutfast-method-2026)
- [What is an L-Cut in video editing? — Clipchamp Blog](https://clipchamp.com/en/blog/l-cut-video-editing/)
- [Subtitle Reading Speed — Subtitling.net](https://subtitling.net/standards/subtitle-reading-speed)
- [Rules for text in videos — legibility.info](https://legibility.info/rules-for-text-in-videos)
- [Timed Text Style Guide: Subtitle Timing Guidelines — Netflix Partner Help Center](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines)
- [Script Timer Voiceover Calculator for Perfect Pacing — lanceblairvo.com](https://lanceblairvo.com/voiceover-script-timer/)
- [Free Words to Minutes Audio Calculator — Narration Box](https://narrationbox.com/tools/words-to-minutes-audio-calculator)
- [YouTube Loudness Normalization — Target LUFS for Video — Critical Listening Lab](https://www.criticallisteninglab.com/en/learn/loudness/youtube)
- [Music Is Too Loud in Video — How to Fix Your Audio Mix — vidpros.com](https://vidpros.com/fix-background-music-too-loud-video/)
- [YouTube Voiceover = ? LUFS — Gearspace forum](https://gearspace.com/threads/youtube-voiceover-lufs.1172760/)
- [YouTube Loudness Standards 2026 — AudioLab](https://audio.rswaver.com/blog/youtube-loudness-standards)
- [Configuration Options — Chatterbox TTS (Mintlify docs)](https://yocxy2-chatterboxyocxy.mintlify.app/guides/configuration)
- [TTS Parameters Guide — ComfyUI_Fill-ChatterBox (DeepWiki)](https://deepwiki.com/filliptm/ComfyUI_Fill-ChatterBox/6.1-tts-parameters-guide)
- [GitHub — wildminder/ComfyUI-Chatterbox](https://github.com/wildminder/ComfyUI-Chatterbox)
- [Chatterbox TTS API Documentation — Segmind](https://www.segmind.com/models/chatterbox-tts/api)
