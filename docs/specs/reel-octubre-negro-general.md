# Reel "Octubre Negro, para todos" — composición `OctubreNegroGeneral`

Reel vertical **1080×1920, 30 fps, ≈61 s** para @elkis.dev. Versión para público **no técnico** del reel `OctubreNegro` (que queda como versión técnica, en la carpeta `octubre-negro/`). Un solo aprendizaje: ante una noticia alarmante, verifica; y dos hábitos simples (cambia tus claves cuando una plataforma avise; actualiza tus programas). Voz: Eleven v4 con la voz de Elkis, ya generada. Mismo motor visual que `octubre-negro/` (copiar y adaptar). Objetivo: alcance + CTA PARCHE + «sígueme».

**Clasificación:** feat · medium · low risk · known · `ts/src/remotion/octubre-negro-general/` (carpeta nueva) + 1 registro en `Root.tsx`. **Tier 2.**

## Insumos (ya existen)

- `ts/public/octubre-negro-general/voz.mp3` — 58,64 s de voz, 128 kbps.
- `ts/src/remotion/octubre-negro-general/data/alineacion.json` (alineación por carácter, un `\n` entre las 7 líneas, índices 0–6), `data/onda.json` (1757 valores 0–1, RMS por cuadro a 30 fps) y `data/guion.txt`. NO regenerar ni modificar.

## Guion (verificado con whisper contra el audio)

| Línea | Seg.        | Texto                                                                                                                                                 |
| ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | 0,00–6,80   | Esta semana circuló una lista de veintisiete hackeos en cuarenta y ocho horas. Le pedí a mi agente que la revisara.                                   |
| 1     | 7,04–16,64  | Varios son reales. Pero la lista mezcla hechos con exageraciones. Un ataque que aparecía como de estos dos días, por ejemplo, se había reportado antes. |
| 2     | 16,80–26,32 | O sea, ni todo es el fin del mundo, ni todo es mentira. Con una noticia así, lo primero es no asustarte y no compartirla sin mirar de dónde viene.    |
| 3     | 26,80–37,40 | Lo segundo es más sencillo. Tus cuentas y tus contraseñas viven en casas ajenas. Si a una le pasa algo, tú no puedes arreglarla. Pero sí puedes cambiar tus llaves. |
| 4     | 37,60–44,08 | Y lo tercero es mantener tus programas al día. Cada actualización cierra una puerta que alguien encontró abierta.                                      |
| 5     | 44,56–51,68 | Verifica antes de creer, cambia tus claves cuando una plataforma te avise, y actualiza. Eso casi siempre alcanza.                                      |
| 6     | 52,16–58,64 | Comenta PARCHE y te paso una guía para revisarlo con Claude, paso a paso. Y sígueme para ver más como esto.                                           |

## Reglas de contenido (no negociables)

- **Lenguaje llano.** En pantalla y voz: nada de siglas ni nombres de herramientas o tecnologías (PHP, NGINX, Node, hash, «variables de entorno», LiteLLM, CVE…). Las ideas se muestran con imágenes cotidianas: una casa con cajas fuertes, llaves, una puerta que se cierra.
- **Hechos respaldados solamente.** Lo único «factual» es: la lista decía 27 hackeos en 48 h, el agente la revisó, un ataque se había reportado el 19 de octubre (antes de la ventana). Nada de cifras de impacto ni de afirmar conexión entre incidentes. Sin la captura del hilo, sin handle ni avatar. Sin logos.
- **Dial ámbar, nunca rojo.** Alerta = `WARN`; verificado/hábito = turquesa. Sin sirenas ni calaveras.
- **Subtítulos siempre** (decisión de Elkis 2026-10-22; supera el criterio «sin subtítulos corridos» para reels de alcance): componente `Subtitulos` sincronizado con la voz; frases cortas de 3–5 palabras, texto ≥ 56 px, palabra activa en turquesa, contorno oscuro para legibilidad. Banda de subtítulos: `y` entre 1480 y 1640 (sobre la zona tapada de abajo). **El contenido de las escenas vive entre `YINI_V` (200) y 1450** para no chocar con los subtítulos.
- **Márgenes seguros fijos:** 120 px arriba, 260 abajo, **120 px a cada lado** (usa 120 en todo; no el `MARGEN_V = 60` heredado de `layout.ts`: en la copia de este reel fíjalo en 120 y ajusta su test). Texto de escena ≥ 28 px.
- **Cierre fijo de la serie:** CTA y después «sígueme» (línea 6).

## Contratos

Copiar y adaptar de `octubre-negro/` (no importar de ahí): `constants/theme.ts`, `lib/{alineacion,lineaTiempo,motion,layout}.ts` con tests, `components/{Escena,Onda}.tsx`, `OctubreNegroGeneral.tsx`, `README.md`, `scenes/tipos.ts` y 7 escenas `E01Gancho`, `E02Mezcla`, `E03Fuente`, `E04Casa`, `E05Puerta`, `E06TresPasos`, `E07Cta`. Registro `<Composition id="OctubreNegroGeneral" …>` en `Root.tsx`. Nuevo: `lib/subtitulos.ts` (+ test: agrupa las palabras de `PALABRAS` en frases de 3–5 palabras que respetan puntuación y se mantienen dentro de su línea; devuelve `{ texto, palabras[], inicio, fin }`) y `components/Subtitulos.tsx` (monta la frase activa según el frame global, ancho máx. 840, centrada, palabra activa turquesa, fundido corto). `DURACION = aFrame(fin de la última palabra) + 75`. Escenas sin `<Sequence>`: frame global + `aFrame(palabra('x', linea).inicio)`; sin `Math.random`.

## Escenas (línea → visual y golpe)

| #   | Archivo      | Línea | Visual                                                                                                                                                                                                                                                                                                |
| --- | ------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | E01Gancho    | 0     | Tarjeta-lista propia (rayas sin texto). **Golpe:** «veintisiete» → **27** gigante ámbar cuenta 0→27, rótulo `HACKEOS`; «cuarenta y ocho» → chip `48 h`; «agente» → nodo **Mi agente** con una lupa que lo conecta a la lista; «revisara» → sello turquesa `REVISAR`.                                |
| 2   | E02Mezcla    | 1     | Cuadrícula de 27 fichas. «Varios son reales» → algunas pasan a turquesa con etiqueta `REAL`. **Golpe:** «exageraciones» → otras se hinchan en ámbar con etiqueta `EXAGERADO`. En «se había reportado antes» una ficha `19 OCT` cae a la izquierda de un marcador `ESTOS DOS DÍAS`.                     |
| 3   | E03Fuente    | 2     | Dos extremos tachados: `TODO ES EL FIN DEL MUNDO` y `TODO ES MENTIRA` (en «ni»); entre ambos, una balanza o línea con el punto en el centro. «no compartirla» → un botón `COMPARTIR` que se apaga. **Golpe:** «de dónde viene» → una lupa sobre una ficha rotulada `¿FUENTE?` que pasa a turquesa.      |
| 4   | E04Casa      | 3     | Una casa de formas simples (ajena) con tres cajas fuertes rotuladas `TUS CUENTAS`, `TUS CONTRASEÑAS`, `TUS ARCHIVOS`. «le pasa algo» → pulso ámbar en la casa; «no puedes arreglarla» → ícono de herramienta tachado. **Golpe:** «cambiar tus llaves» → llaves viejas se deshacen y entran llaves nuevas turquesa con check. |
| 5   | E05Puerta    | 4     | Una puerta entreabierta en ámbar con un hueco de luz. «actualización» → una flecha de `ACTUALIZAR` baja sobre ella. **Golpe:** «cierra» → la puerta se cierra y pasa a turquesa con candado.                                                                                                          |
| 6   | E06TresPasos | 5     | Checklist de 3 filas que entran con cada verbo: `1 Verifica antes de creer` (lupa), `2 Cambia tus claves si te avisan` (llave), `3 Actualiza` (flecha). **Golpe:** «alcanza» → las tres filas se marcan con check turquesa y un `ALCANZA` pequeño.                                                  |
| 7   | E07Cta       | 6     | `comenta` + **PARCHE** gigante turquesa (letra por letra, rebote) en «PARCHE»; bajo él, «te paso una guía paso a paso». En «sígueme» el PARCHE sube/se reduce y entra **SÍGUEME** + `@elkis.dev` (texto, sin logo de Instagram) con un pulso. Se sostiene 2,5 s tras la voz.                          |

## Ejecución

| #   | Tarea                                                                                                                                | Agente      | Archivos                                                                                                  | Entrega                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | Base: theme, libs con TDD (incl. `subtitulos`), `Escena`, `Onda`, `Subtitulos`, composición con 7 stubs, registro en `Root.tsx`, README | `ejecutor`  | `constants/`, `lib/`, `components/`, `OctubreNegroGeneral.tsx`, `scenes/E*.tsx` (stubs), `Root.tsx`, `README.md` | tests verdes + still con subtítulos        |
| 2   | Escenas 1–4                                                                                                                          | `ejecutor`  | `scenes/E01–E04`                                                                                          | stills de cada golpe                       |
| 3   | Escenas 5–7                                                                                                                          | `ejecutor`  | `scenes/E05–E07`                                                                                          | stills de cada golpe                       |

2 y 3 en paralelo cuando termina 1. Integración, render final y revisión de cuadros: main loop.
