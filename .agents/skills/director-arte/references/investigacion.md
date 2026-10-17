# Investigación: sistema visual para "director-de-arte" (serie documental)

# Principios (con el POR QUÉ)

1. **Un dato por pantalla.** Las visualizaciones para video (a diferencia de un dashboard estático) se ven una sola vez y sin control del espectador sobre el ritmo; si compiten dos ideas en el mismo frame, ninguna se retiene. (Datawrapper, _In defense of simple charts_)
2. **Animar el valor, no el eje.** Los ejes y la estructura del gráfico deben aparecer estables desde el principio; lo que se anima es la barra/línea/número creciendo, para que el ojo lea "cambio" y no "reconstrucción del gráfico". Coherente con la práctica de Datawrapper de fijar metadata/leyenda antes de animar series temporales. (Datawrapper, _How to make animated visualizations_)
3. **Etiqueta directa, no leyenda separada.** El espectador de YouTube no puede ir y volver los ojos entre leyenda y dato; poner el color/categoría directamente sobre el elemento reduce carga cognitiva. (Datawrapper, _Text in data visualizations_)
4. **La sombra —no el contorno— vende el "papel".** Un collage plano con solo trazo/borde se lee como clip-art; lo que convence al ojo de que hay capas físicas es una sombra suave con dirección de luz constante entre TODAS las capas de la escena. (Tutoriales de paper-cutout en After Effects / Skillshare)
5. **Imperfección deliberada evita el efecto "anuncio".** Los directores de arte de canales editoriales de explicación literalmente corta papel a mano y evita que quede "demasiado perfecto" porque eso lo hace ver publicitario, no editorial — el mismo principio aplica a Remotion: offsets ligeramente irregulares, grano sutil, texturas de papel reales en vez de vectores perfectos.
6. **Un "pop" de entrada consistente en TODO elemento nuevo en pantalla** (leve overshoot/bounce al aparecer, no solo fade) da la sensación física de que algo se coloca sobre la mesa, y esa firma repetida ES la identidad de marca del canal — más que cualquier color. (principios de motion; Material Design 3 motion / Carbon Design System)
7. **La paleta y jerarquía tipográfica deben sobrevivir a compresión de YouTube y pantallas pequeñas de celular.** Kurzgesagt usa paletas saturadas con alto contraste precisamente porque el video se ve en miniaturas y móviles antes que en 4K; el mismo criterio aplica a texto: tamaño mínimo generoso, nunca "se ve bien en el monitor de edición".
8. **Color semántico fijo y no decorativo.** Si un color representa "déficit" en un gráfico, debe representar "déficit" en TODOS los gráficos y mapas del episodio y la serie — la consistencia semántica es lo que permite al espectador leer sin releer la leyenda cada vez.
9. **Evitar pie charts y donas para comparar más de 2-3 categorías** — el ojo humano no compara ángulos con precisión en movimiento; barras o iconografía proporcional comunican mejor en video. (principio estándar de dataviz, reforzado por prácticas Datawrapper/Knaflic)
10. **Un "prompt anchor" fijo + seed controlado en FLUX** es lo que sostiene la coherencia de "universo visual" entre 30-60 imágenes generadas en sesiones distintas — sin esto, cada imagen se ve de una película distinta. (guías FLUX, ver sección 5)
11. **La cámara en mapas debe moverse como dron, no como corte.** Los explainers de mapas animan 5 propiedades (lat, lon, zoom, bearing, pitch) con bearing offset para simular una órbita descendente — el movimiento continuo de cámara reemplaza el corte duro y mantiene la sensación de "viaje" narrativo.
12. **La biblia visual existe para que el episodio 5 se vea como el episodio 1** sin que el creador recuerde de memoria cada decisión — es documentación, no burocracia; sin ella la deriva de estilo entre episodios es inevitable en producción unipersonal.

---

# Contenido obligatorio de una biblia visual de serie (esquema)

Basado en patrones de style guides de motion (Material 3 motion, Carbon Design System, Compass Motion Style Guide, guías de branding motion 2026):

1. **Paleta con roles semánticos** — no solo hex codes: `primary/fondo`, `acento-dato-positivo`, `acento-dato-negativo/déficit`, `neutral-texto`, `papel-base`, `papel-sombra`. Cada rol con su hex + uso permitido/prohibido.
2. **Tipografía y escala** — familia display (títulos/ficha), familia texto (subtítulos/datos), tamaños mínimos verificados a 1080p en móvil, jerarquía de 3-4 niveles máximo (H1 episodio, H2 sección, dato destacado, label).
3. **Grid y composición** — safe area 16:9, margen mínimo, posición de fichas/tarjetas de datos, zonas reservadas para subtítulos karaoke.
4. **Motion principles** — duraciones estándar (entrada de elemento, salida, transición de escena), tabla de easing (ease-out para entradas, ease-in-out para movimientos continuos de cámara), reglas de overshoot/bounce, qué NUNCA se anima con linear.
5. **Iconografía** — set de íconos propio (hospital, cama, gota de agua, enchufe) en el mismo lenguaje paper-cutout, no mezclado con íconos vectoriales genéricos.
6. **Tratamiento fotográfico** — cómo se integra el b-roll FLUX en el sistema (marco, recorte, grano superpuesto, si lleva sombra proyectada como si fuera una foto pegada sobre papel).
7. **Fichas de datos / templates recurrentes** — el formato ficha-hospital (ID tipo VEN-MIR-CHA-HOSP-00142), formato gráfico de barra, formato mapa coroplético — cada uno como componente reutilizable, no rediseñado por episodio.
8. **Do / Don't** — ejemplos concretos de qué rompe el sistema (ej: "no usar sombra dura", "no mezclar dos familias tipográficas", "no pie charts").
9. **Motion tokens exportables** — valores literales (ms, curvas cubic-bezier) que el código Remotion consume directamente, para que la biblia sea ejecutable y no solo referencia visual.

---

# Reglas de data-viz para video (verificables)

- **Un dato/mensaje por pantalla.** Verificable: cada composición de gráfico en Remotion debe tener un solo "insight" en su props; si necesitas dos, son dos escenas.
- **Texto mínimo legible:** en un master 1080p, ningún texto de dato baja de ~28-32px equivalentes (Datawrapper recomienda 12pt/16px para web; en video, dado el visionado en móvil pequeño y sin zoom, el mínimo debe ser notablemente mayor — verificar renderizando un frame y midiendo en una pantalla de teléfono real).
- **Animar el valor, fijar el eje/estructura:** el eje, la grilla y los labels aparecen primero (o instantáneo), y solo el valor (altura de barra, número contador) se anima.
- **Etiqueta en el elemento, no en leyenda aparte** (aplica sobre todo a mapas y barras).
- **Color semántico consistente en toda la serie:** definir una tabla fija (ej. rojo/terracota = déficit o alerta, verde/oliva = cobertura adecuada, azul = agua, amarillo = electricidad) y nunca reasignar significados.
- **Evitar pie/donut para >2-3 categorías**; preferir barras horizontales o pictogramas proporcionales (mejor lectura en movimiento).
- **Contraste alto siempre:** texto de dato sobre fondo con relación de contraste verificable (no depender de textura de papel sutil bajo texto pequeño).
- **Duración mínima en pantalla:** un gráfico o ficha debe permanecer legible al menos 3-4 segundos después de terminar su animación de entrada antes de cortar, para dar tiempo de lectura real (regla empírica de ritmo editorial en explainers, consistente con la práctica de Vox/Kurzgesagt de "un beat de pausa" tras cada reveal).

---

# Reglas de mapas

- **Fuente de geometría:** usar límites administrativos oficiales/abiertos — **geoBoundaries** vía HDX (ADM0/ADM1/ADM2, licencia CC BY 4.0) o el dataset **COD-AB** del país en HDX (niveles 0-3: país, estado, municipio, parroquia). Alternativa más simple: el GeoJSON de estados/municipios derivado de GADM, útil para prototipar rápido aunque conviene verificar su fecha/precisión contra HDX antes de usarlo en producción.
- **Proyección:** para un mapa nacional (extensión relativamente pequeña, forma alargada este-oeste), una proyección cónica conforme o simplemente Mercator recortado funciona sin distorsión perceptible a esta escala — no hace falta una proyección exótica.
- **Nivel de detalle según toma:** usar ADM1 (estados) para tomas generales del país y ADM2 (municipios) solo cuando la cámara hace zoom a una región específica — mostrar los ~335 municipios en la toma nacional es ruido visual.
- **Estilización coherente con paper-cutout:** cada estado/región es una "pieza de papel recortada" con su propia sombra proyectada sobre la capa de abajo (no un relleno plano tipo mapa GIS); el coroplético se logra variando el tono del papel (saturación/luminosidad), no el hue, para que la paleta semántica de la serie no se rompa color por color.
- **Cámara tipo dron/orbital, no corte:** animar zoom + pan continuo (y opcionalmente un pitch leve) en vez de cortes duros entre "mapa país" y "mapa estado" — técnica documentada como signature de los explainers de mapas con GEOlayers (5 propiedades: lat, lon, zoom, bearing, pitch).
- **Leyenda de color fija entre escenas:** si el mismo coroplético (ej. "camas por cada 1000 habitantes") aparece en distintos momentos del episodio, la escala de color debe ser idéntica cada vez — igual que la regla general de mantener significado de color constante entre años/estados en mapas animados.
- **Puntos por localización (hospitales) con animación escalonada (stagger), no simultánea:** aparecer un punto a la vez o por lotes agrupa la atención y evita "explosión" de 500 puntos a la vez; usar tamaño de punto para magnitud, no solo color.

---

# Guía de prompting FLUX para b-roll coherente

**Nota importante verificada:** FLUX.1-dev **no soporta negative prompts** de forma nativa (a diferencia de SD1.5/SDXL) — la estrategia correcta es describir explícitamente lo que SÍ quieres, incluyendo imperfecciones reales, en vez de listar lo que no quieres.

**Plantilla de prompt (positiva, estructura):**

```
[sujeto/escena concreta], [entorno/contexto físico específico],
[luz: dirección, calidad, hora del día], [lente/encuadre: angular/medio, altura de cámara],
[detalle documental: textura de superficies, desgaste, objetos reales del entorno],
[término de estilo: "documentary photography", "photojournalism", "editorial photography"],
[relación de aspecto y composición para Ken Burns: espacio negativo arriba/abajo o lados para permitir paneo/zoom]
```

Ejemplo aplicado (hospital venezolano, sin rostro identificable):

```
Interior of a public hospital hallway in a Latin American city, worn linoleum floor,
fluorescent light mixed with soft daylight from a window, wide-angle documentary
photograph, medical staff in scrubs seen from behind or at a distance so faces are
not identifiable, peeling paint on walls, IV pole and stretcher visible, photojournalism
style, natural imperfect lighting, shot on a 35mm lens, editorial documentary photography
```

**Sufijos de estilo recomendados** (documentales/fotoperiodismo, consistentes entre imágenes): `documentary photography style`, `photojournalism`, `editorial photography`, `natural lighting`, `shot on 35mm` — evitar términos de "render 3D" o "hyperrealistic CGI" que empujan hacia el look plástico.

**Evitar el "look de IA" (en positivo, no como negativo):** agregar detalle imperfecto real — textura de piel con poros, ropa arrugada, superficies con desgaste/manchas, iluminación desigual — reduce el efecto "piel de plástico" típico de FLUX. FLUX.1 Krea (variante) está específicamente afinado para corregir sobreexposición y piel plástica si se usa como base.

**Sin texto en imagen:** FLUX es bueno renderizando texto, lo cual es un riesgo aquí (letreros/carteles con texto falso e ilegible) — especificar explícitamente `no visible text or signage` o encuadrar composiciones sin superficies típicas de rotulado (evitar carteles, pantallas, uniformes con logos).

**Sin rostros identificables:** encuadrar personal médico de espaldas, en silueta, a media distancia, con foco en manos/instrumental/entorno — más seguro y más "documental" que rostros borrosos en post.

**Relación de aspecto para Ken Burns 16:9:** generar en vertical (768×1344) u horizontal (1344×768) según el encuadre, pero SIEMPRE dejar margen de composición (sujeto no pegado a los bordes) para que el crop/zoom de Ken Burns tenga recorrido sin cortar elementos clave — regla de composición, no de FLUX en sí.

**Estrategia de consistencia entre 30-60 imágenes:**

1. **Prompt anchor fijo** — un bloque de texto de estilo (paleta de luz, término "documentary photography editorial style", tratamiento de grano) que se repite en TODOS los prompts de la serie, y solo cambia el bloque de sujeto/escena.
2. **Seed:** no fijar el mismo seed para todas (produce composiciones demasiado similares); en cambio, fijar los parámetros técnicos (steps=24, CFG, resolución, sampler) y dejar que el seed varíe — la consistencia viene del prompt anchor y los parámetros, no del seed.
3. **LoRA opcional:** si se detecta deriva de estilo entre lotes, una LoRA de "realismo"/estilo fotográfico ligera (strength 0.5-0.8) ayuda a anclar look sin necesidad de reentrenar; usarla de forma constante en todo el episodio, nunca a mitad de sesión.
4. **Post-proceso unificador:** aplicar la MISMA curva de color/grano de papel en Remotion sobre todas las imágenes de b-roll — esto hace más por la coherencia final que cualquier ajuste de prompt, porque nivela diferencias de iluminación entre generaciones.

---

# Anti-patrones que hacen que se vea "hecho con IA" o barato

- **Sombra dura o ausente en capas de papel** → se lee como clip-art plano, no como recorte físico.
- **Composición demasiado limpia/perfecta** (bordes perfectos, alineación milimétrica) → según el art director de Vox, esto es precisamente lo que hace que una pieza editorial se vea como anuncio.
- **Rostros generados por IA en primer plano** → el riesgo más alto de "se ve IA"; mitigarlo evitando encuadres frontales de rostro por completo, no intentando "arreglarlo" en post.
- **Texto renderizado por FLUX dentro de la imagen** (carteles, pantallas, uniformes con logos ilegibles) → rompe inmediatamente la ilusión documental.
- **Mezclar seeds/estilos de sesiones FLUX muy distintas sin post-proceso unificador** → salta a la vista un cambio de "película" entre b-rolls.
- **Piel/superficies plásticas y sobreexpuestas** → síntoma clásico de FLUX sin corrección; se arregla con detalle de imperfección en el prompt, no con negative prompt (no existe en FLUX).
- **Gráficos con leyenda separada del dato, o con más de 3 categorías en pie chart** → ilegible en un solo visionado de video.
- **Animación linear en todo** (sin easing) → se ve mecánico/genérico; reservar linear solo para loops continuos, nunca para entradas/salidas de elementos.
- **Mapas con corte duro entre escalas** (país → estado sin transición de cámara) → rompe la sensación de "viaje" que sostiene mapas de explainers tipo Vox.
- **Colores de "dato" reasignados entre gráficos** (rojo = déficit en un gráfico, rojo = total en otro) → confunde y delata falta de sistema, no solo error de diseño.

---

# Fuentes

- [Kurzgesagt — Wikipedia](https://en.wikipedia.org/wiki/Kurzgesagt)
- [Kurzgesagt en Behance](https://www.behance.net/Kurzgesagt)
- [Create a Paper Cut-Out Animation with After Effects — Medium](https://medium.com/@MilesOfRoses/create-a-paper-cut-out-animation-with-after-effects-e4891f6aba95)
- [The Paper Cutout Look in Adobe After Effects — Skillshare](https://www.skillshare.com/en/classes/the-paper-cutout-look-in-adobe-after-effects/239727349)
- [Give me a (flashing) sign: How to make animated visualizations — Datawrapper Blog](https://www.datawrapper.de/blog/how-to-make-animated-charts)
- [In defense of simple charts — Datawrapper Blog](https://blog.datawrapper.de/in-defense-of-simple-charts/)
- [What to consider when using text in data visualizations — Datawrapper Blog](https://www.datawrapper.de/blog/text-in-data-visualizations)
- [geoBoundaries — Subnational Administrative Boundaries — HDX](https://data.humdata.org/dataset/geoboundaries-admin-boundaries)
- [COD-AB Subnational Administrative Boundaries — HDX](https://data.humdata.org/dataset)
- [Creating images with Flux: Your prompt guide — Nebius](https://nebius.com/blog/posts/creating-images-with-flux-prompt-guide)
- [FLUX Prompting Guide — Photorealism, Text Rendering, Cinematic Light — PixelDojo](https://pixeldojo.ai/guides/flux-prompting-guide)
- [How to Use LoRA with FLUX AI — Medium](https://medium.com/towards-agi/how-to-use-lora-with-flux-ai-a-comprehensive-guide-5adff95271b4)
- [Fix Flux Plastic Skin? — Stable Diffusion Art forum](https://stable-diffusion-art.com/forums/topic/fix-flux-plastic-skin/)
- [How to Remove That "AI Look" from AI-Generated Images — Flux Art Blog](https://flux-art.ai/blog/en/tutorials/ai-sheng-tu-zong-you-yi-gu-ai-wei-zen-me-qu-diao.html)
- [Motion — Carbon Design System](https://carbondesignsystem.com/elements/motion/overview/)
- [Easing and duration — Material Design 3](https://m3.material.io/styles/motion/easing-and-duration)
- [Motion Design Style Guides — Medium](https://medium.com/@marcusdburnette/animation-style-guides-9d6be1243f)
- [Animate a Choropleth Map — Azure Maps Web SDK Samples](https://samples.azuremaps.com/animations/animate-a-choropleth-map)
- [12 Techniques for Creating Animated Maps That Transform Data Stories — Map Library](https://www.maplibrary.org/1327/techniques-for-creating-animated-maps/)
