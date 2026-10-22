# Reel "Octubre Negro, verificado" — composición `OctubreNegro`

Reel vertical **1080×1920, 30 fps, ≈72,8 s** para @elkis.dev. Elkis recibió el hilo viral de «27 hackeos en 48 horas» y le pidió a su agente que lo verificara: el reel muestra qué se sostiene, qué no y cuáles 3 le tocan a quien construye con IA. Misma gramática visual y mismo motor que `IncidenteClaves` (rama `feat/reel-incidente-claves`, de la que sale esta). Voz: Eleven v4 con la voz de Elkis, ya generada. Objetivo: autoridad / captar con una novedad. CTA: **PARCHE** (ya existe en `content/instagram.json` de elkisdev, `origin/main`).

**Clasificación:** feat · medium · low risk · known · `ts/src/remotion/octubre-negro/` (carpeta nueva) + 1 registro en `Root.tsx`. **Tier 2.**

## Insumos (ya existen)

- `ts/public/octubre-negro/voz.mp3` — 70,24 s, 128 kbps.
- `ts/src/remotion/octubre-negro/data/alineacion.json` — alineación por carácter de ElevenLabs. El texto tiene un `\n` entre líneas (7 líneas, índices 0–6). Última letra termina en 70,24 s. Los números van escritos con letras ("veintisiete", "cuarenta y ocho", "diecinueve", "tres"): `palabra()` busca esas formas.
- `data/onda.json` — `number[]` de 2105 valores 0–1 (RMS por cuadro).
- `data/guion.txt` — guion v2 (pasa `pnpm guion:lint`).

## Guion (verificado con whisper contra el audio)

| Línea | Seg.        | Texto                                                                                                                                                                                                                                        |
| ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | 0,00–5,92   | Me pasaron una lista de veintisiete hackeos en cuarenta y ocho horas. Le pedí a mi agente que la verificara.                                                                                                                                 |
| 1     | 6,32–15,20  | La llaman Octubre Negro. PHP, Railway, NGINX, Signal, hasta un banco de la India. Todo junto, todo grave.                                                                                                                                    |
| 2     | 15,68–33,12 | Mi agente fue a los avisos oficiales. Varios son reales. Pero lo de las cuarenta y ocho horas no se sostiene. El ataque a OVHcloud se reportó el día diecinueve, antes de que empezara esa cuenta. Y usar PHP o NGINX no significa que estés afectado: depende de tu versión. |
| 3     | 33,60–40,64 | O sea, la lista mezcla hechos con titulares. Y esa mezcla te lleva a rotar todo a ciegas, o a no tocar nada.                                                                                                                                 |
| 4     | 41,20–52,88 | De los veintisiete, a quien construye con IA le tocan tres. Las variables de entorno de Railway. Los parches de Node y de PHP. Y las herramientas que ejecutas sin saber de dónde salió el archivo.                                           |
| 5     | 53,52–64,64 | Ahí va lo que me quedó. Fijar una versión no basta si alguien puede reemplazar lo que se publicó. Revisa de dónde viene lo que ejecutas, y no le des tus claves a cualquier herramienta.                                                     |
| 6     | 65,20–70,24 | Comenta PARCHE y te paso el prompt para que Claude revise tus claves y tus versiones contigo.                                                                                                                                                |

## Reglas de contenido (no negociables)

- **Solo hechos respaldados.** Railway: actividad anómala en el sistema de variables de entorno, un tercero _pudo_ acceder, recomienda cambiarlas. Node y PHP: parches de seguridad el 21 de octubre. OVHcloud: el compromiso de su CLI se reportó el 19 de octubre (The Stack). **Prohibido** en pantalla y voz: LiteLLM, «7 de 10» de HTTP/3, «70 % de los sitios», «PHP2Shell», cualquier cifra de impacto o conexión entre incidentes. No se afirma nada de los otros puntos de la lista.
- **Sin captura del hilo ni del autor.** No se muestra la imagen original, ni el handle, ni el avatar. La «lista» se dibuja con formas propias (cuadrícula de 27 fichas).
- **Dial ámbar, nunca rojo.** Alerta = `WARN`; verificado = turquesa; sin sirenas, calaveras ni «HACKEADO».
- **Sin logos oficiales** y sin secretos ni valores reales en pantalla.
- **Se entiende sin audio:** la palabra clave de cada línea aparece en pantalla; sin subtítulos corridos.
- **Márgenes seguros fijos (criterios de la serie):** 120 px arriba, 260 abajo, 120 a cada lado; texto mínimo 28 px.

## Contratos

Igual que `incidente-claves` (copiar y adaptar, no importar de ahí): `constants/theme.ts`, `lib/{alineacion,lineaTiempo,motion,layout}.ts` con tests, `components/{Escena,Onda}.tsx`, `scenes/E01…E07`, `OctubreNegro.tsx`, `README.md`, registro `<Composition id="OctubreNegro" …>` en `Root.tsx`. Se importa (no se edita) de `arquitectura-ia/` y `tips-ia-local/lib/layout.ts` como hace `incidente-claves`.

- `DURACION = aFrame(fin de la última palabra) + 75` ≈ 2184 frames (72,8 s).
- Escenas sin `<Sequence>`: frame global + `aFrame(palabra('x', linea).inicio)`. Determinismo: sin `Math.random`.
- Tema: ArquitecturaIA + `WARN`, `WARN_GLOW`, `WARN_WASH`.

## Escenas (línea → visual y golpe)

| #   | Archivo      | Línea | Visual                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | E01Gancho    | 0     | Fondo casi vacío. En "lista" aparece una tarjeta-lista propia (rayas, sin texto legible). **Golpe:** "veintisiete" → el número **27** gigante en ámbar cuenta 0→27. "cuarenta y ocho horas" → chip mono `48 h`. En "verificara" entra el nodo **Mi agente** y un sello turquesa `VERIFICAR`.                                          |
| 2   | E02Lista     | 1     | Cuadrícula de 27 fichas (todas ámbar tenue) bajo el título **OCTUBRE NEGRO**. En cada palabra nombrada (PHP, Railway, NGINX, Signal, banco de la India) una ficha distinta se enciende con su etiqueta mono (solo texto). **Golpe:** "grave" → las 27 se encienden en ámbar a la vez.                                                  |
| 3   | E03Verifica  | 2     | El nodo Mi agente consulta una pila **AVISOS OFICIALES** (en "avisos oficiales"); algunas fichas de la cuadrícula pasan a turquesa (`VERIFICADO`), el resto queda gris. En "no se sostiene" el chip `48 h` se tacha. En "diecinueve" cae la ficha `19 OCT · OVHcloud` **antes** de un marcador `INICIO DE LA CUENTA`. En "estés afectado" una tarjeta `usar ≠ estar afectado` y bajo ella `depende de tu versión` (`EqualityGlyph` sin resolver). **Golpe:** "diecinueve". |
| 4   | E04Mezcla    | 3     | Dos columnas **HECHOS** (turquesa) y **TITULARES** (ámbar) que se funden en una sola lista confusa. En "a ciegas" la lista se desenfoca; en "rotar todo" y "no tocar nada" dos flechas ámbar (todo / nada). **Golpe:** "mezcla" → las columnas colapsan en una.                                                                         |
| 5   | E05Tres      | 4     | La cuadrícula de 27 se reduce a 3 fichas grandes. **Golpe:** "tres" → **3** gigante turquesa. En cada frase: `Railway · variables de entorno`, `Node y PHP · parches`, `Lo que ejecutas · ¿de dónde salió?`.                                                                                                                              |
| 6   | E06Leccion   | 5     | Una etiqueta `v1.2.3` (genérica) sobre una caja-archivo. **Golpe:** "reemplazar" → el archivo se cambia por otro con la etiqueta igual: `versión ≠ archivo`. En "revisa" → chip `¿DE DÓNDE VIENE?`; en "claves" → llaves genéricas (`API_KEY`) que no entran a una herramienta (candado).                                              |
| 7   | E07Cta       | 6     | Igual que `IncidenteClaves/E07Cta`: `comenta`, **PARCHE** gigante turquesa con glow que entra letra por letra en "PARCHE", la frase "te paso el prompt para que Claude revise tus claves y tus versiones", recuerdo de la tesis `≠` → `=` en "Claude". Se sostiene 2,5 s tras la voz.                                                  |

## Ejecución

| #   | Tarea                                                                                                                       | Agente (modelo)  | Archivos                                                                                              | Entrega                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | Base: copiar y adaptar theme/libs con TDD, `Escena`, `Onda`, composición con 7 escenas stub, registro en `Root.tsx`, README | `ejecutor` (sonnet) | `constants/`, `lib/`, `components/`, `OctubreNegro.tsx`, `scenes/E*.tsx` (stubs), `Root.tsx`, `README.md` | tests verdes + still de un frame de la E01 |
| 2   | Escenas 1–4                                                                                                                 | `ejecutor`       | `scenes/E01–E04`                                                                                      | stills de cada golpe                       |
| 3   | Escenas 5–7                                                                                                                 | `ejecutor`       | `scenes/E05–E07`                                                                                      | stills de cada golpe                       |

2 y 3 corren en paralelo cuando termina 1. Integración, render final y revisión de cuadros: main loop.
