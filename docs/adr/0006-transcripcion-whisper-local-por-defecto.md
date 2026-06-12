# ADR-0006 — Transcripción con Whisper local por defecto

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB. Resuelve la pregunta abierta §14.4 del PRD.

## Contexto

El paso de audio (M3) necesita transcripción para alimentar `captions` y `transcriptRef`. Dos caminos: Whisper local (`faster-whisper` o `whisper.cpp`) vs la API de OpenAI. El proyecto es single-user, local y privado por diseño; el costo por minuto y mandar audio a un tercero choca con ese ethos. (Nota: el sandbox que generó el spec de `@olyasuharska` no pudo bajar los pesos — limitación del sandbox, no del pipeline local.)

## Decisión

**Whisper local (`faster-whisper`) por defecto.** Flag opcional `--asr-api` para usar la API de OpenAI como fallback cuando no haya recursos locales o se priorice velocidad.

## Consecuencias

- **Positivas:** gratis, privado, sin dependencia de red ni de credenciales para el flujo base. Coherente con persistencia local (ADR-0002).
- **Negativas / costos:** primera corrida descarga pesos del modelo (cientos de MB) y la inferencia sin GPU es más lenta que la API. Hay que documentar el setup de pesos.
- **Trigger de re-evaluación:** si la latencia de transcripción local se vuelve el cuello de botella del loop de desarrollo, cambiar el default a la API (el flag ya existe; sería invertir el default).
