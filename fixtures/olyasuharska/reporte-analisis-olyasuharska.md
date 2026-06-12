# Análisis de edición — "Vemos una película" (@olyasuharska)

> Generado por el pipeline `analizar → spec` (v0.1.0-sandbox). Spec completo: `videospec-olyasuharska.json`.
> 176.4s · 720×1280 (9:16) · 24fps · h264 · 64 shots

---

## 1. El sistema visual: dos mundos que alternan

Toda la edición se sostiene sobre **dos lenguajes visuales que se turnan**, y el contraste entre ambos ES el estilo:

**Mundo A — Talking head cinematográfico.** Persona al escritorio, iluminación low-key cálida (fondo oscuro, piel cálida saturada — los 15 shots "warm/high-sat" del análisis de color son casi todos estos). Captions estilo karaoke: lowercase, sans redondeada, palabra activa en **dorado con glow (~#E8B84B)**, las anteriores asientan a blanco cálido.

**Mundo B — Collage editorial sobre papel.** Fondo crema texturizado (papel), recortes B/N y sepia con sombra proyectada (fotos de archivo, ilustraciones a lápiz, cerebros, siluetas de tinta), frames de entrevista con tratamiento halftone/imprenta. Tipografía cinética a **dos niveles**: conectores en gris fino ("por", "eso", "cuando") y palabras de énfasis en **negro extra-bold** ("llega", "ocupados", "cambiando"), esparcidas espacialmente por el lienzo. Anotaciones a mano (círculos). Los 49 shots "neutral/low-sat" son este mundo.

La estructura narrativa en 4 actos: hook/sketch de pareja (0–28s) → storytelling del caso con archivo (28–80s) → reflexión cerebro/ocupación (80–145s) → resolución "llega la calma" (145s–fin).

## 2. Ritmo (datos duros)

| Métrica | Valor |
|---|---|
| Cortes por minuto | **21.8** |
| Duración media de shot | 2755 ms |
| Mediana | **2021 ms** |
| Distribución | 9 shots <1s · 34 de 1–3s · 17 de 3–6s · 4 de >6s |
| Extremos | mín 292 ms (flashes de montaje) · máx 11.1 s (escena del sofá) |

Lectura: la mediana de ~2s es el "pulso" base, pero el ritmo **respira**: ráfagas de <1s en el montaje de archivo (shots 25–27, 58, 60) y planos largos de >6s reservados para los momentos de peso (el sofá a los 14.6s, los cierres). El contraste de duraciones es deliberado — acelera para información, frena para emoción.

## 3. Movimiento: nada está quieto

De 64 shots, solo 1 clasificó como estático-puro. El desglose: **37 paneos/derivas** (Ken Burns sobre los collages — los recortes y pájaros flotan constantemente), **21 punch-ins** y 4 zoom-outs (talking head y collage), 1 handheld. La cámara "respira" siempre, aunque sea sutil.

Easing de los punch-ins (aprox., flow sobre frames muestreados): mezcla de linear y ease-in, con magnitudes típicas de 20–60% de escala acumulada. ⚠️ Confianza media: cuando el sujeto se mueve hacia cámara, el flow lo lee como zoom e infla la magnitud.

## 4. Transiciones

- **49 cortes duros** de 63 boundaries — el corte seco es la norma.
- **Flash blanco de ~2 frames (~80ms)** como puntuación al saltar de talking head → collage (verificado frame a frame a los 121.0s: 1 frame blanco puro + 1 lavado). Este flash es una *firma* del estilo.
- 14 boundaries marcados como "gradual o motion rápida" — una parte son estos flashes, otra es movimiento veloz en el corte.

## 5. Micro-animaciones (descifradas a 24fps)

**Caption talking-head** (ventana 83.96–85.30s, cuadro a cuadro):
1. Las palabras se *anexan* una a una a la línea, sincronizadas a la voz.
2. Cada palabra nueva entra con **fade de ~2 frames (~80ms)** — primero tenue, luego plena.
3. La palabra que se está diciendo brilla **dorado con glow**; las anteriores pasan a blanco cálido.
4. Páginas de 2–3 palabras: la línea se limpia y reinicia ("porque cuando" → clear → "no estamos ocupados").

**Texto collage** (ventana 120.95–122.30s):
1. Entrada al collage vía **flash blanco**.
2. Las palabras aparecen una a una al ritmo de la voz (~1–2 frames cada una), *esparcidas* por el lienzo, sin moverse una vez colocadas.
3. Dos jerarquías tipográficas simultáneas: "por eso cuando" (gris fino) vs "**llega la calma**" (negro bold).
4. Elementos recortados animados (pájaros) derivan por el encuadre mientras el texto aparece — por eso el detector de motion ve "pan" en casi todos los collages.

## 6. Audio

- **Cero silencios ≥0.5s** en todo el video (umbral -35dB): VO + música forman una cama continua, sin huecos. El ritmo lo dicta la voz, no el beat.
- **Loudness integrado: -14.2 LUFS** — clavado en el target de normalización de Instagram/TikTok. Mezcla profesional.
- Transcripción Whisper: no disponible en este sandbox (descarga de modelos bloqueada); en el pipeline local corre sin problema y alimentaría `captions` automáticamente.

## 7. Receta replicable (el spec en una frase)

> Alterna talking-head low-key cálido con collage de papel crema; corta a mediana 2s con ráfagas <1s y respiros >6s; nunca dejes el frame quieto (deriva o punch-in); puntúa los saltos de mundo con flash blanco de 2 frames; captions karaoke dorado-glow palabra a palabra (~80ms/palabra, páginas de 2-3); en collage, texto esparcido a dos pesos sincronizado a la voz; audio continuo a -14 LUFS.

Cada elemento de esa receta ya está como dato estructurado en el spec → directamente accionable por componentes Remotion (el caption karaoke y el sistema two-tier son los dos primeros componentes obvios a construir).

## 8. Límites honestos de esta pasada

- **Captions/overlays muestreados**, no exhaustivos (lectura por visión de keyframes + 2 ventanas densas; con Whisper local + OCR se completa el 100%).
- **Easing aproximado**: flow sobre frames muestreados; el movimiento del sujeto contamina la señal de zoom.
- **Timing fino**: precisión ±1 frame (24fps). Suficiente para replicar el estilo; no para clonar al milisegundo (techo conocido del PRD).
- Beats musicales no extraídos (irrelevante aquí: el corte sigue a la voz, no al beat).
