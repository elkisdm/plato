# ADR-0002 — Persistencia en filesystem, sin base de datos

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** `knowledge/adr/0001-elegir-tipo-de-base-de-datos.md` (consultado) — **no aplica directamente**: ese ADR decide entre motores para servicios con estado relacional/consultable. Plató es single-user, batch, sin necesidad de consulta cross-registro. Decisión por criterio general.

## Contexto

Las fundaciones de Plató son para un solo usuario, corriendo análisis batch sobre archivos de video locales (confirmado: multi-usuario/producto es no-objetivo de M0–M4). El output de cada análisis es un conjunto de artefactos: el spec, los keyframes, el transcript y el reporte. No hay consultas relacionales, ni concurrencia, ni multi-tenancy.

## Decisión

**Sin base de datos. Persistencia en filesystem, una carpeta por video:**

```
projects/<video_id>/
├─ spec.json          # el VideoSpec canónico
├─ frames/            # keyframes extraídos
├─ transcript.json    # Caption-shape (compatible Remotion)
└─ report.md          # lectura humana
```

`projects/` se ignora en git (es output, no fuente). Meter Postgres o Supabase hoy sería resolver problemas que no existen (consulta, concurrencia, usuarios).

## Consecuencias

- **Positivas:** cero infraestructura, cero latencia de red, todo inspeccionable con `cat`/`ls`, trivial de versionar fixtures. Reproducible y portable.
- **Negativas / costos:** no hay consulta cross-video ("dame todos los specs con cutsPerMin > 25") sin escanear carpetas. Sin sharing ni acceso remoto.
- **Trigger de re-evaluación → Supabase/Postgres:** cuando aparezca CUALQUIERA de: (a) necesidad de consultar/filtrar a través de muchos specs, (b) multi-usuario o acceso compartido, (c) una UI que liste/busque análisis. Hasta entonces, NO.
