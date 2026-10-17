---
name: director-arte
description: Define y aplica el sistema visual de una serie de video documental con datos producida en Remotion (paper-cutout, texto cinético, mapas, fichas, gráficos) y b-roll generado con FLUX + Ken Burns. Úsala SIEMPRE que haya que crear la biblia visual de una serie, decidir paleta/tipografía/motion tokens, diseñar escena por escena un guion (qué se ve, cómo se anima, qué gráfico, qué mapa), escribir prompts de FLUX para b-roll coherente, o revisar por qué un render "se ve hecho con IA" o barato. Dispara con "dirección de arte", "look", "estilo visual", "paleta", "cómo se ve esta escena", "prompts de las imágenes", "biblia visual", "diseña los gráficos", aunque el usuario no nombre el rol.
---

# Director de arte

Traduce el guion (columna VISUAL de cada escena) en decisiones dibujables: sistema visual de la serie, tratamiento de cada escena, especificación de gráficos y mapas, y prompts de b-roll. Todo lo que produce debe poder ejecutarse sin preguntar: por `productor` (genera assets) y por quien programa las composiciones en Remotion.

## Qué existe ya en el repo

Antes de proponer nada, lee y reutiliza:

- `ts/src/remotion/paperTokens.ts` — tokens del sistema "papel que cobra vida": papel crema (`#f3eede→#ded5bf`), tinta `#141109`, dorado `#E8B84B`, grano `multiply` 0.55 estático, viñeta, tipografía a dos pesos (800 énfasis / 300 conector). Defaults de motion: lift 27 frames `out-cubic`, vida (bob 0,33 Hz, tilt 2°), enter fade 8 frames.
- `ts/src/remotion/components/` — legos: `PaperCutout`, `PaperBackground`, `TwoTierText`, `KaraokeCaption`, `TwoTierOverlay`, `transitions`.
- `ts/src/remotion/paperMotion.ts` — matemática probada de lift/sombra/micro-movimiento. Las curvas viven ahí; no inventes easings en cada escena.
- `material/produccion/002-bola-de-nieve/fonts/` — Barlow Condensed y JetBrains Mono ya descargadas.
- `.agents/skills/remotion-best-practices/` — router a las skills `remotion-*` (sin CSS animations, `interpolate` + `Easing`); escenas y efectos en `remotion-markup`, subtítulos en `remotion-captions`.
- `references/remotion-text-animations/` — typewriter, word-highlight y bar chart (rescatados de la versión anterior de las skills de Remotion, que ya no los trae).

La biblia visual **extiende** estos tokens con roles semánticos; no los reemplaza salvo decisión explícita registrada.

## Principios (y por qué)

1. **La sombra vende el papel, no el contorno.** Un recorte con solo borde se lee como clip-art. Lo que convence es una sombra suave con **una sola dirección de luz** para todas las capas de la escena y de la serie. Regla: luz arriba-izquierda, offset proporcional a la "altura" de la capa (`paperMotion` ya lo calcula).
2. **Imperfección deliberada.** El director de arte de Vox corta papel a mano para que no quede "demasiado perfecto", porque perfecto se lee como anuncio, no como editorial. En Remotion: rotaciones de ±0,5-2°, offsets no milimétricos, grano real, bordes con textura.
3. **Un pop de entrada consistente es la firma.** Cada elemento nuevo entra con el mismo gesto físico (lift + leve overshoot, nunca solo fade). Esa repetición, más que la paleta, es lo que hace reconocible la serie.
4. **Un dato por pantalla.** El espectador ve el gráfico una vez, sin pausar. Dos ideas en el frame = ninguna retenida. Si el guion mete dos, pide al guionista dividir la escena.
5. **Animar el valor, fijar la estructura.** Eje, grilla y etiquetas aparecen de inmediato; lo único que se mueve es la barra, la línea o el contador. Así el ojo lee "cambio", no "reconstrucción del gráfico".
6. **Etiqueta sobre el elemento, nunca leyenda aparte.** En video no se puede ir y volver entre leyenda y dato.
7. **Color semántico fijo en toda la serie.** Si terracota significa "déficit" en el episodio 1, significa déficit en el 6. La tabla vive en la biblia visual y se consume como tokens.
8. **Nada de pie/donut con más de 2 categorías.** Ángulos en movimiento no se comparan. Barras horizontales o pictogramas proporcionales.
9. **Legible en un teléfono.** Texto de dato ≥ 32 px equivalentes en 1080p; texto ancla ≥ 48 px. Verifica renderizando un frame y mirándolo en un celular, no en el monitor.
10. **Cámara de mapa como dron, no como corte.** Entre "país" y "estado" la cámara viaja (zoom + pan continuo, pitch leve); el corte duro rompe la sensación de recorrido.
11. **El b-roll se integra al sistema, no compite con él.** Cada imagen FLUX se trata igual: misma curva de color, grano de papel encima, marco o sombra de "foto pegada sobre el papel". Ese post-proceso unifica más que cualquier prompt.
12. **La biblia existe para que el episodio 5 se vea como el 1** sin recordar cada decisión. Es documentación ejecutable (valores literales), no inspiración.

## Entregables

### 1. Biblia visual de la serie — `docs/series/<serie>/biblia-visual.md`

Se escribe una vez y se versiona. Secciones obligatorias (esquema en `references/biblia-visual-esquema.md`):

1. **Paleta con roles semánticos**: `papel-base`, `tinta`, `tinta-muted`, `acento` (dorado), `dato-deficit`, `dato-ok`, `agua`, `energia`, `neutral-mapa`. Cada rol: hex, uso permitido, uso prohibido.
2. **Tipografía y escala**: familia display (títulos, fichas), familia dato/mono (cifras, IDs), tamaños mínimos en px a 1080p, jerarquía de 4 niveles máximo.
3. **Grid y zonas**: safe area 16:9, margen, zona de subtítulos karaoke (reservada, nada encima), posición de fichas y de anclas de texto.
4. **Motion tokens**: duraciones en frames a 30 fps y easings literales (entrada 27 f `out-cubic`, salida 14 f `in-cubic`, cámara continua `in-out-sine`, contador de cifras 40-60 f `out-quart`). Qué nunca es lineal (todo salvo loops).
5. **Iconografía**: set propio en lenguaje paper-cutout (hospital, cama, gota, rayo, antena, persona), nunca mezclado con íconos vectoriales genéricos.
6. **Tratamiento del b-roll**: marco, recorte, grano, sombra de foto pegada, curva de color única.
7. **Componentes recurrentes**: ficha de entidad (por ejemplo hospital con ID `VEN-MIR-CHA-HOSP-00142`), barra comparativa, contador, mapa coroplético ADM1, mapa de puntos con stagger, tarjeta de cita/fuente. Cada uno con sus props y su animación fija.
8. **Do / Don't** con ejemplos concretos.
9. **Anclaje FLUX de la serie**: el bloque de prompt fijo que se repite en todas las imágenes (ver §Prompting).

### 2. Arte por episodio — `docs/series/<serie>/ep<NN>/arte.md`

Una entrada por escena del guion (`E01`, `E02`…), con exactamente estos campos para que `productor` los lea sin interpretar:

```markdown
### E07 · dato · camas registradas vs operativas

**COMPONENTE:** barra-comparativa
**DATOS:** registradas 320 · instaladas 271 · operativas 186 (F3)
**COLOR:** registradas=neutral-mapa · instaladas=tinta-muted · operativas=dato-deficit
**ANCLA:** "320 camas… 186 reales"
**MOTION:** estructura instantánea; barras crecen 45 f out-quart en secuencia (stagger 10 f); ancla entra al terminar la última barra; sostener ≥ 3,5 s legible.
**CAMARA:** estática
**NOTAS:** el número "186" es la revelación: entra con beat (ver director-cine).
```

Para escenas `broll`:

```markdown
### E01 · broll · cama vacía

**PROMPT:** <bloque de sujeto> + <anclaje FLUX de la serie>
**FORMATO:** 1344x768 · 24 steps · guidance 3.5
**COMPOSICION:** sujeto centrado-izquierda, espacio negativo a la derecha para push-in
**KEN BURNS:** push-in 1.00→1.12 hacia la cama, 8 s
**TRATAMIENTO:** curva serie + grano papel + sombra foto pegada
**RIESGOS:** sin rostros frontales, sin texto en carteles
```

## Reglas de data-viz para video (verificables)

- Un insight por composición: los props de cada gráfico admiten un solo mensaje.
- Estructura instantánea, valor animado.
- Etiqueta directa en el elemento.
- Colores solo desde los roles de la biblia.
- Nada de pie/donut > 2 categorías.
- Texto de dato ≥ 32 px, ancla ≥ 48 px a 1080p; máximo 30 caracteres por línea, 3 líneas.
- Legible ≥ 3,5 s después de terminar su animación de entrada.
- Si aparece la misma métrica dos veces en el episodio, misma escala y mismos colores.

## Reglas de mapas

- Geometría: geoBoundaries o COD-AB del país vía HDX (CC BY 4.0), niveles ADM0-ADM3. Guardar el GeoJSON en `ts/public/geo/` con su licencia.
- ADM1 (estados) para tomas nacionales; ADM2 (municipios) solo en zoom regional. 335 municipios en toma país es ruido.
- Proyección: Mercator recortado basta a esta escala.
- Cada estado es una pieza de papel con su propia sombra sobre la capa inferior; el coroplético varía luminosidad/saturación del papel, no el matiz, para no romper la paleta semántica.
- Puntos (hospitales) entran con stagger por lotes, tamaño = magnitud, color = rol semántico.
- Cámara continua entre escalas (zoom + pan + pitch leve), nunca corte duro.
- Escala de color idéntica cada vez que reaparece la misma métrica.

## Prompting FLUX para b-roll coherente

FLUX.1-dev **no acepta negative prompts**. Se describe lo que sí se quiere, incluidas las imperfecciones reales.

Plantilla:

```
[sujeto/escena concreta], [entorno físico específico],
[luz: dirección, calidad, hora], [lente/encuadre, altura de cámara],
[detalle documental: desgaste, texturas, objetos reales],
<ANCLAJE DE SERIE>
```

Anclaje de serie (se fija en la biblia y se repite idéntico en todas las imágenes; ejemplo de partida):

```
documentary photography, photojournalism, editorial, natural imperfect lighting,
shot on 35mm, subtle film grain, muted warm palette, no visible text or signage,
people seen from behind or at a distance so faces are not identifiable
```

Reglas:

- Formato 1344×768 para 16:9; sujeto con margen a los bordes para que el Ken Burns tenga recorrido.
- Personas de espaldas, en silueta o a media distancia. Rostros frontales generados son el mayor delator de IA; no se arreglan en post, se evitan en el encuadre.
- Sin superficies de rotulado (carteles, pantallas, uniformes con logo): FLUX inventa texto.
- Detalle de imperfección en positivo (paredes descascaradas, ropa arrugada, luz desigual) contra la piel plástica.
- Consistencia entre 30-60 imágenes: anclaje fijo + parámetros fijos (24 steps, guidance 3.5, resolución). **No** fijar la misma seed en todas (produce composiciones clonadas); la seed se registra por imagen en el manifest.
- Si hay deriva de look entre lotes: LoRA de realismo fotográfico ligera (0,5-0,8) constante en todo el episodio, nunca a mitad de sesión.
- El post-proceso unificador en Remotion (curva + grano + marco) es lo que más iguala; confía en él.

## Anti-patrones (lo que delata IA o bajo presupuesto)

- Sombra dura o ausente en capas de papel.
- Composición milimétrica sin imperfección.
- Rostros generados en primer plano.
- Texto renderizado por FLUX dentro de la imagen.
- Lotes FLUX de estilos distintos sin post-proceso unificador.
- Animación lineal en entradas/salidas.
- Leyendas separadas; pie charts con 5 categorías.
- Mapa país → estado con corte duro.
- Rojo que significa "déficit" en un gráfico y "total" en otro.

## Flujo de trabajo

1. Lee `guion.md` completo antes de diseñar una sola escena: detecta métricas repetidas (misma escala), motivos recurrentes (el ancla del cold open vuelve en el cierre) y qué escenas comparten componente.
2. Si no existe `biblia-visual.md`, escríbela primero (con el usuario: la paleta y la tipografía son decisiones suyas; propón dos opciones con razones, no diez).
3. Escribe `arte.md` escena por escena. Cada escena de dato nombra su componente de la biblia; si necesita uno nuevo, agrégalo a la biblia, no lo improvises en la escena.
4. Entrega a `productor` (prompts, formatos, componentes) y a `director-cine` (qué escenas piden beat, respiro o cámara).
5. Al revisar un render: mira un frame en un teléfono; verifica sombra única, legibilidad, color semántico, ausencia de rostros/texto en b-roll.

## Referencias

- `references/investigacion.md` — hallazgos con fuentes: Kurzgesagt, Vox, explainers de mapas, Datawrapper, guías FLUX, geoBoundaries/HDX, style guides de motion.
- `references/biblia-visual-esquema.md` — esqueleto de la biblia visual para rellenar.
