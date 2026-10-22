# Reel "Octubre Negro, para todos" v2 — más movimiento, más sonido

Mejora de `OctubreNegroGeneral` (brief original: `reel-octubre-negro-general.md`, que sigue mandando para guion, reglas de contenido, márgenes y subtítulos). Pedido de Elkis (2026-10-22): «faltan efectos de sonido, animaciones, todo está muy básico; mantén la voz y mejora mucho más lo demás». **La voz, la alineación y el guion NO cambian.** Cambia todo lo visual y se agrega sonido. Duración y frames de cada línea quedan igual (1834 frames).

**Clasificación:** feat · medium-high · low risk · known · todo dentro de `ts/src/remotion/octubre-negro-general/` (+ assets en `ts/public/octubre-negro-general/`). **Tier 3** (4 agentes, 2 fases). Referencias de estilo: `arquitectura-ia/` y `octubre-negro/` (solo lectura).

## Qué significa «básico» y qué lo reemplaza

Hoy: fondo plano con cuadrícula, cada escena entra con un fundido y los elementos aparecen con un simple fade/slide, sin cámara, sin transiciones, sin partículas, sin sonido. Referencia de lo que sí queremos: reel de motion de alto nivel — cámara que respira, profundidad, golpes de impacto con shake y destello, transiciones que atraviesan, tipografía cinética, todo cayendo con resortes (springs con overshoot), cada golpe de imagen con su golpe de sonido.

### A. Sistema visual global (fase 1)

Todo en `components/fx/` y `lib/fx/`, **100 % determinista** (sin `Math.random`; usa `random(seed)` de Remotion), con lógica pura testeada (vitest) y exportando exactamente estos nombres para que las escenas los usen:

- `FondoVivo`: reemplaza el fondo. Cuadrícula con paralaje lento (2 capas a distinta velocidad), 30–60 partículas/ascuas deterministas flotando (ámbar o turquesa según el «ánimo» de la escena), viñeta, grano sutil, y un halo de color grande que cambia de ánimo entre escenas (ámbar = alerta, turquesa = calma/hábito, neutro). Prop `animo(frame): 'alerta'|'calma'|'neutro'` o un mapa por escena en `lib/fx/animo.ts`.
- `Camara`: envuelve todas las escenas. Empuje lento continuo (zoom 1.00→1.06 por escena con ease), deriva mínima, y **shake de impacto** configurable por lista de golpes (`GOLPES_CAMARA` en `lib/fx/golpes.ts`: `{ frame, fuerza }`, decaimiento exponencial de 8–10 frames). Debe respetar los márgenes seguros: el zoom máximo no puede sacar contenido de x 120–960 → el contenido de escena se dibuja a escala 1 y la cámara lo escala hacia el centro (nunca >1.06).
- `TransicionEscena`: entre escenas consecutivas (hoy fundido de 10 frames en `Escena`) una transición de 12–14 frames: la escena saliente se escala ligeramente (1→1.08), se desenfoca (blur hasta 10 px) y se desplaza con separación cromática (offset RGB ≤ 6 px) mientras la entrante entra desde 0.94 con blur 0 →; más un barrido de luz diagonal. Elige la variante por escena (zoom-through, whip lateral, flash) para que no se repita siempre.
- `Destello` (flash blanco/ámbar corto, ≤ 6 frames) y `OndaChoque` (anillo que se expande y se desvanece desde un punto) — los dos se disparan en los golpes fuertes.
- `LetrasCaen` / `TextoCinetico`: texto que entra letra por letra o palabra por palabra con spring y overshoot, con subrayado que se dibuja y brillo que barre.
- `Sello` (stamp): elemento que entra grande y gira ligeramente, golpea en su sitio con rebote y onda de choque (para REVISAR, ALCANZA, etc.).
- `TarjetaProfunda`: contenedor con inclinación 3D (CSS `perspective`/`rotateX/Y` ≤ 8°) que reacciona a la cámara, sombra y borde luminoso.
- `Subtitulos` (mejora de los actuales): la frase entra con spring (escala 0.92→1 + subida 12 px), cada palabra activa se destaca con «píldora» de fondo turquesa translúcida y un leve scale 1.06; salida con fundido rápido. Sigue en la banda y 1480–1640, ≥ 56 px, contorno oscuro. Nunca debe tapar contenido de escena (≤ 1450).
- Lo integra todo `OctubreNegroGeneral.tsx` (orden: `FondoVivo` → `Camara`(escenas con `TransicionEscena`) → destellos/ondas globales → `Subtitulos` → `Sonido`).

### B. Sonido (fase 1, en paralelo con A)

Assets ya copiados a `ts/public/octubre-negro-general/`: `voz.mp3` (NO tocar), `musica.mp3` (64 s, ya con fade), y `sfx/` con 26 efectos: de la biblioteca de la serie (`glitch_1-2, impacto_fuerte_1-2, impacto_suave_1-3, pop_1-2, riser_1-2, shimmer_1-2, tick_1-3, tipeo_1, whoosh_corto_1-3, whoosh_largo_1-2`) y 4 nuevos (`llaves_1, cerrojo_1, check_1, alerta_1`).

- `lib/sfx.ts`: **plan de eventos tipado** `{ frame: number; archivo: string; volumen: number; desfase?: number }[]`, con los frames calculados desde `aFrame(palabra(...).inicio)` (nunca números a mano). Un efecto por golpe visual, anclado al cuadro exacto del golpe (un whoosh entra ~3 frames antes del corte/transición; un riser **termina** en el golpe).
- `components/Sonido.tsx`: monta `<Audio>` (de `@remotion/media` o `remotion`, lo que ya use el repo) de la voz, la música y cada efecto con `<Sequence from>`; la música a volumen base ≈ 0,20 (la voz está a −18,9 dB de media y la música ya viene normalizada a −20 LUFS), con **ducking**: baja a 0,14 mientras habla y sube a 0,35 en el arranque (primer 0,6 s) y en el último segundo tras la voz; efectos entre 0,25 y 0,6 según su peso (impactos fuertes arriba, ticks abajo). Ningún efecto debe tapar la voz ni superar −8 dB bajo su pico.
- Mapa de eventos (guía; ajusta con criterio y justifícalo):
  - Línea 0: entrada lista `whoosh_corto_1`; conteo del 27 con `tick_1` cada 2–3 frames y `impacto_fuerte_1` al aterrizar el 27; «cuarenta y ocho» `pop_1`; «agente» `shimmer_1`; sello REVISAR `impacto_suave_1`.
  - Línea 1: cada ficha REAL que se enciende `pop_2`/`tick_2` (máx. 4 sonidos, escalonados) + `shimmer_2`; «exageraciones» `glitch_1` + `alerta_1`; ficha 19 OCT cae con `impacto_suave_2` + `whoosh_corto_2`.
  - Línea 2: cada tachado `whoosh_corto_3` + `tick_2`; interruptor COMPARTIR se apaga `tick_3`; «de dónde viene» `whoosh_largo_1` + `check_1` + `shimmer_1`.
  - Línea 3: entrada de la casa `whoosh_corto_1`; «le pasa algo» `alerta_1`; herramienta tachada `glitch_2`; «cambiar tus llaves» `llaves_1` + `check_1`.
  - Línea 4: `riser_1` que termina en «cierra»; cierre de puerta `cerrojo_1` + `shimmer_2`.
  - Línea 5: «Verifica» `pop_1`, «cambia» `pop_2`, «actualiza» `pop_1`; «alcanza» tres `check_1` escalonados + `shimmer_1` + sello `impacto_suave_3`.
  - Línea 6: `riser_2` que termina en «PARCHE»; `impacto_fuerte_2` en PARCHE; «sígueme» `whoosh_largo_2` + `pop_1` + `shimmer_2`.
  - Cada transición de escena: un `whoosh_corto_*` (rotar variantes).
- Test de la lib: todos los archivos referenciados existen en `public/octubre-negro-general/sfx/`, los frames están ordenados y dentro de `DURACION`, volúmenes entre 0 y 1.
- Verificación de mezcla (en la tarea final): `ffmpeg … volumedetect`/`ebur128` sobre el mp4 renderizado; la mezcla total debe quedar alrededor de −16 a −14 LUFS integrados, sin clipping (pico < −1 dBTP).

### C. Rediseño de las escenas (fase 2)

Mismas 7 escenas, mismo contenido y mismos anclajes a palabras del brief original, **pero** cada una con: entrada de cámara/transición propia, elementos que caen con springs escalonados (stagger), al menos **dos capas de profundidad** (primer plano nítido + fondo desenfocado/tenue), un **golpe fuerte** con shake + destello/onda de choque y su sonido, y microanimación continua en lo que queda en pantalla (los elementos «respiran», brillan, pulsan; nada se queda congelado más de ~0,5 s). Ideas concretas por escena (mejora estas, no las copies sin criterio):

1. **E01 Gancho:** la lista detrás se desplaza rápido (parpadeo de 27 renglones) y el `27` cuenta con dígitos que giran tipo marcador (rodillo) con ticks, aterriza con impacto + onda de choque; `48 h` con un anillo de reloj que barre; Mi agente con un haz de escaneo que baja por la lista; el sello `REVISAR` golpea girado con onda.
2. **E02 Mezcla:** las 27 fichas entran en ola 3D (flip escalonado) hasta formar la cuadrícula; las REAL se voltean a turquesa con un check que se dibuja; las EXAGERADO se hinchan con rebote, tiemblan y sueltan un glitch ámbar; la ficha `19 OCT` cruza con estela hasta quedar antes del marcador, con la línea de tiempo dibujándose.
3. **E03 Fuente:** la balanza/eje se inclina físicamente de un extremo al otro hasta equilibrarse en el centro; los tachados se dibujan como trazos con movimiento; el interruptor COMPARTIR se desliza con rebote; la lupa barre la pantalla con un haz de luz que revela la ficha `¿FUENTE?`, que se verifica con anillo y check.
4. **E04 Casa:** la casa se construye (trazos/paredes) y sus ventanas se encienden una a una; las cajas fuertes se abren y cierran; «le pasa algo» → onda ámbar que recorre la casa y parpadeo de luces; las llaves viejas se rompen en fragmentos que caen y las nuevas encajan con destello metálico.
5. **E05 Puerta:** puerta con perspectiva 3D que oscila, rayos de luz por la rendija y polvo flotando; la pastilla ACTUALIZAR baja con un anillo de progreso que se completa; al cerrar, portazo con shake, la luz ámbar se apaga y el candado hace click con destello turquesa.
6. **E06 TresPasos:** tarjetas que entran en abanico con spring; cada check se dibuja como trazo con chispas; el sello `ALCANZA` golpea con onda y un barrido de brillo recorre las tres filas.
7. **E07 Cta:** `comenta` aparece con texto cinético; PARCHE cae letra por letra con rebote y un barrido de luz; chispas/partículas turquesa; al «sígueme» el bloque sube y entra SÍGUEME con subrayado que se dibuja, el pill `@elkis.dev` pulsando, y un botón de «seguir» dibujado con formas (no logo): `+` que gira a `✓` con onda.

Restricciones de contenido y seguridad iguales al brief original: lenguaje llano, sin logos, ámbar = alerta / turquesa = hábito (nunca rojo), contenido entre y 200 y `YFIN_ESCENA` (1450), márgenes laterales x 120–960 (también para glow y sombras fuertes; las partículas y el fondo sí pueden ocupar todo el lienzo), texto de escena ≥ 28 px.

## Ejecución

| #   | Tarea                                                                                                                                                | Agente     | Archivos                                                                                          | Entrega                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Sistema visual global (A) + integración en `OctubreNegroGeneral.tsx` + `Subtitulos` mejorado                                                         | `ejecutor` | `components/fx/*`, `lib/fx/*`, `components/Subtitulos.tsx`, `components/Escena.tsx`, `OctubreNegroGeneral.tsx` | tests verdes + secuencia de cuadros de una transición |
| 2   | Sonido (B): `lib/sfx.ts`, `components/Sonido.tsx`, integración, test                                                                                  | `ejecutor` | `lib/sfx.ts` (+test), `components/Sonido.tsx`                                                      | tests verdes                                        |
| 3   | Escenas 1–4 rediseñadas (C)                                                                                                                          | `ejecutor` | `scenes/E01–E04` y sus componentes/libs propios                                                    | secuencias de cuadros por golpe                     |
| 4   | Escenas 5–7 rediseñadas (C)                                                                                                                          | `ejecutor` | `scenes/E05–E07` y sus componentes/libs propios                                                    | secuencias de cuadros por golpe                     |

1 y 2 en paralelo; 3 y 4 en paralelo cuando termina 1 (usan sus primitivas) y los golpes de cámara de 3 y 4 se agregan a `lib/fx/golpes.ts` por cada escena en su propio bloque. Mezcla final, render y revisión: main loop.
