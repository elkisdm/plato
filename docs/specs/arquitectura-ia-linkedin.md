## Video LinkedIn "Arquitectura > Código" (Remotion, 4:5)

**Classification**: feat · large · low risk · known (Remotion ya instalado) · touches `ts/src/remotion/arquitectura-ia/**`, `ts/public/fonts/geist/`, `ts/src/remotion/Root.tsx`
**Tier**: 2 — Standard

### Goal

Una pieza de motion design editorial de 60 s (1080×1350, 30 fps) donde las arquitecturas se construyen, conectan y reorganizan delante del espectador. Mensaje: la IA escribe código; la arquitectura decide qué construir. Se entiende sin audio.

### Assumptions made (correct me if wrong)

- Todo vive en un módulo nuevo `arquitectura-ia/`, separado de las series existentes; composición `ArquitecturaIA`.
- 8 escenas, 1800 frames exactos (60 s). Los tiempos del brief se reajustan ligeramente para que el texto se alcance a leer en móvil (hook 6 s, escena central 12 s, latencia 9 s).
- Las escenas se solapan 15 frames para dar continuidad (la palabra ARQUITECTURA se convierte en el nodo Astro, Astro se transforma en APP, el sistema de la escena 5 se reusa en 6, 7 y 8).
- Tipografía Geist + Geist Mono (OFL, de `@fontsource-variable`), servidas desde `public/fonts/geist/` y cargadas con `FontFace` + `delayRender`.
- Los glifos `→`, `≠` y `=` se dibujan en SVG: el subset latin de Geist no los trae y además así pueden animarse (el `≠` pierde la barra y queda `=`).
- Las conexiones se calculan desde los nodos (bezier cúbica entre anclas de lado automático); la longitud y la posición de los pulsos salen de un muestreo analítico, sin `getTotalLength()`, para que todo dependa solo del frame.
- Sonido y voz: solo markers exportados (`soundCues`, `voMarkers`); sin audio en este cambio.

### Acceptance criteria

- [ ] `pnpm typecheck` y `pnpm test` en verde.
- [ ] La timeline suma 1800 frames; cada escena empieza donde termina la anterior (test).
- [ ] Geometría: anclas, elección de lados, longitud y punto por fracción de arco (tests).
- [ ] Los cues de sonido están ordenados y dentro del video (test).
- [ ] Stills de cada escena revisados a 1080×1350: sin texto fuera de los márgenes seguros (80 px laterales).
- [ ] `remotion render ... ArquitecturaIA out/arquitectura-ia.mp4` produce 60 s.

### Files & routes to touch

- `ts/public/fonts/geist/` — new — Geist y Geist Mono variables (latin) + licencia OFL.
- `ts/src/remotion/arquitectura-ia/constants/` — new — `theme.ts` (colores, spacing, tipografía, springs), `timings.ts`, `soundCues.ts`.
- `ts/src/remotion/arquitectura-ia/lib/` — new — `geometry.ts` (conexiones), `motion.ts` (progresos, cámara), `fonts.ts`.
- `ts/src/remotion/arquitectura-ia/diagram/` — new — tipos y el grafo del sistema multi-superficie compartido.
- `ts/src/remotion/arquitectura-ia/components/{architecture,typography,motion,ui}/` — new — los componentes del brief.
- `ts/src/remotion/arquitectura-ia/scenes/` — new — Intro, AstroScene, NextScene, TanStackScene, MultiStackScene, LatencyScene, CriteriaScene, Outro.
- `ts/src/remotion/Root.tsx` — modify — registrar `ArquitecturaIA`.

### Out of scope

- Música, SFX y voz en off reales.
- Subtítulos (todo el mensaje ya está en pantalla).
