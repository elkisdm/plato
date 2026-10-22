# OctubreNegro

Reel vertical 1080×1920 a 30 fps, 2182 frames (72,7 s): "Octubre Negro, verificado" (el hilo de «27 hackeos en 48 horas», contrastado con avisos oficiales), sincronizado con una voz de ElevenLabs. Spec y contratos: `docs/specs/reel-octubre-negro.md`. Misma base que `incidente-claves/` (copiada y adaptada, no importada).

## Qué hay

- `OctubreNegro.tsx`: `<Audio>` (`public/octubre-negro/voz.mp3`), `GridBackground` de ArquitecturaIA y las 7 escenas montadas por ventana. Exporta `DURACION_OCTUBRE_NEGRO` y `W_/H_/FPS_OCTUBRE_NEGRO`.
- `constants/theme.ts`: tema de ArquitecturaIA más `WARN`, `WARN_GLOW`, `WARN_WASH` (alerta ámbar, nunca rojo) y el spring `golpe`.
- `lib/`: `alineacion` (palabras y tiempos), `lineaTiempo` (`ESCENAS`, `DURACION`), `motion`, `layout` (zona segura: 120 px arriba, 260 abajo; texto mínimo 28 px). Con tests.
- `components/`: `Escena` (monta hijos en `[desde, hasta)` con fundido de 10 frames) y `Onda` (barras de `data/onda.json`).
- `scenes/E01Gancho … E07Cta`: una escena por línea del guion (escena n ↔ línea n−1), firma `PropsEscena = { desde, hasta }` en `scenes/tipos.ts`. Sin `<Sequence>`: leen el frame global y anclan con `aFrame(palabra('x', linea).inicio)`.
- `data/`: `alineacion.json`, `onda.json`, `guion.txt`.

## Previsualizar y renderizar

```bash
cd ts
npx remotion studio src/remotion/index.ts          # elegir OctubreNegro
npx remotion still src/remotion/index.ts OctubreNegro out/frame.png --frame=60
npx remotion render src/remotion/index.ts OctubreNegro out/octubre-negro.mp4
npx vitest run src/remotion/octubre-negro          # tests de lib/
```

## Cómo se generó la voz

- Endpoint ElevenLabs `POST /v1/text-to-speech/{voice_id}/with-timestamps`, modelo `eleven_v4`, formato `mp3_44100_128`, voz clon de Elkis `jX85YQk1KQ9lkcPOmqGG`.
- La respuesta trae el audio y la alineación por carácter, guardada tal cual en `data/alineacion.json` (un `\n` entre líneas: 7 líneas, índices 0–6).
- `data/onda.json` es el RMS por cuadro a 30 fps, normalizado 0–1.
- El script de generación vive fuera del repo. Si cambia el guion hay que regenerar voz, alineación y onda: `palabra()` lanza si una palabra usada por una escena ya no existe.
