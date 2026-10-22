# OctubreNegroGeneral

Reel vertical 1080×1920 a 30 fps, 1834 frames (61,1 s): "Octubre Negro, para todos", versión para público no técnico de `octubre-negro/` (que queda como versión técnica). Spec y contratos: `docs/specs/reel-octubre-negro-general.md`. Misma base que `octubre-negro/` (copiada y adaptada, no importada).

## Qué hay

- `OctubreNegroGeneral.tsx`: `<Audio>` (`public/octubre-negro-general/voz.mp3`), `GridBackground` de ArquitecturaIA, las 7 escenas montadas por ventana y `Subtitulos` por encima durante toda la composición. Exporta `DURACION_/W_/H_/FPS_OCTUBRE_NEGRO_GENERAL`.
- `constants/theme.ts`: tema de ArquitecturaIA más `WARN`, `WARN_GLOW`, `WARN_WASH` (alerta ámbar, nunca rojo) y el spring `golpe`.
- `lib/`: `alineacion` (palabras y tiempos), `lineaTiempo` (`ESCENAS`, `DURACION`), `motion`, `layout` (márgenes fijos de la serie: 120 px arriba, 260 abajo, 120 a cada lado; contenido de escenas entre `YINI_V` 200 y `YFIN_ESCENA` 1450; texto mínimo 28 px) y `subtitulos` (frases de 3–5 palabras sin cruzar líneas del guion). Con tests.
- `components/`: `Escena` (monta hijos en `[desde, hasta)` con fundido de 10 frames), `Onda` (barras de `data/onda.json`) y `Subtitulos` (frase activa, banda y 1480–1640, ancho máx. 840, palabra activa en turquesa, contorno oscuro).
- `scenes/E01Gancho … E07Cta`: una escena por línea del guion (escena n ↔ línea n−1), firma `PropsEscena = { desde, hasta }` en `scenes/tipos.ts`. Sin `<Sequence>`: leen el frame global y anclan con `aFrame(palabra('x', linea).inicio)`.
- `data/`: `alineacion.json`, `onda.json`, `guion.txt`.

## Previsualizar y renderizar

```bash
cd ts
npx remotion studio src/remotion/index.ts          # elegir OctubreNegroGeneral
npx remotion still src/remotion/index.ts OctubreNegroGeneral out/frame.png --frame=120
npx remotion render src/remotion/index.ts OctubreNegroGeneral out/octubre-negro-general.mp4
npx vitest run src/remotion/octubre-negro-general  # tests de lib/
```

## Cómo se generó la voz

- Endpoint ElevenLabs `POST /v1/text-to-speech/{voice_id}/with-timestamps`, modelo `eleven_v4`, formato `mp3_44100_128`, voz clon de Elkis `jX85YQk1KQ9lkcPOmqGG`.
- La respuesta trae el audio y la alineación por carácter, guardada tal cual en `data/alineacion.json` (un `\n` entre líneas: 7 líneas, índices 0–6).
- `data/onda.json` es el RMS por cuadro a 30 fps, normalizado 0–1.
- El script de generación vive fuera del repo. Si cambia el guion hay que regenerar voz, alineación y onda: `palabra()` lanza si una palabra usada por una escena ya no existe.
