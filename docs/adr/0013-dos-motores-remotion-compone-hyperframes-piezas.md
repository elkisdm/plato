# ADR-0013 — Dos motores: Remotion compone, HyperFrames renderiza piezas

- **Estado:** Propuesto
- **Fecha:** 2026-10-17
- **Decisor:** edaza
- **Respalda (KB):** criterio general, no cubierto por la KB.

## Contexto

El estudio (ADR-0011) arma todos sus videos en Remotion: el kit, la marca, los tipos de video y el
render versionado. Cada transición, gráfico o fondo animado se escribe a mano en React.

HyperFrames (heygen-com/hyperframes, Apache 2.0) convierte HTML, CSS y animaciones (GSAP, Lottie,
Three.js, shaders WebGPU) en video determinista, y publica un catálogo de 455 piezas: 210 bloques,
238 componentes y ejemplos (transiciones, overlays, gráficos de datos, fondos, intros, subtítulos).
Muchas declaran variables, entre ellas colores (`accent`, `background`). Puede renderizar con canal
alfa (webm/mov).

Reescribir esas piezas en React no tiene sentido, y migrar el estudio a HyperFrames tampoco: el kit,
`marca.json`, el contrato `VideoSpec` (ADR-0001) y los presets (ADR-0009) están en Remotion y funcionan.

## Decisión

Usar los dos motores con roles fijos:

- **Remotion compone.** Es dueño de la línea de tiempo, la marca, el audio, los subtítulos y el render
  final. Ningún video del estudio se entrega desde HyperFrames.
- **HyperFrames renderiza piezas.** Un bloque del catálogo, con las variables de color tomadas de la
  marca, se renderiza a mp4 (o webm/mov con alfa) y se registra como **un asset de video más** en el
  manifiesto del espacio (ADR-0011), con `origen.motor=hyperframes`, el bloque, el commit del catálogo,
  las variables y la licencia que declare.
- **El acoplamiento es el manifiesto.** HyperFrames no conoce el estudio; Remotion no conoce
  HyperFrames, solo ve un video (`PiezaHF` en el kit, con transparencia cuando aplica).

Piezas de layout:

- `hyperframes/` es una carpeta propia del repo políglota (ADR-0005): `package.json` con la CLI fijada
  por versión, `upstream/` (clon parcial del repo oficial, ignorado por git, se actualiza con `git pull`)
  y `piezas/` (copias de trabajo generadas, ignoradas).
- `ts/tools/pieza.mjs` es la entrada: resuelve el bloque, valida las variables contra su
  `registry-item.json`, renderiza y llama a `estudio.mjs registrar`. Si el render falla no registra nada.

## Consecuencias

- **Positivas:** el estudio gana cientos de piezas listas sin escribir React; la marca sigue mandando
  porque los colores salen de `marca.json`; los assets quedan trazables (sha256, bloque, commit) y son
  inmutables como cualquier otro; quitar HyperFrames no rompe ningún video ya registrado.
- **Negativas / costos:** una segunda cadena de render (Chrome headless vía la CLI de HyperFrames) con
  sus propias dependencias; las piezas son clips cerrados, así que su ritmo no se ajusta cuadro a cuadro
  desde Remotion (se recorta o se cambia la velocidad); los assets de terceros dentro de un bloque
  (fuentes, imágenes, audio, modelos 3D) pueden tener licencias propias que hay que revisar antes de
  un uso comercial.
- **Licencias:** Remotion es gratis para personas y empresas de hasta 3 empleados; sobre eso exige
  Company License (US$25/mes por persona que escribe código Remotion, a octubre de 2026). Lo paga quien
  es dueño del proyecto Remotion, no quien solo recibe un MP4. HyperFrames no tiene esa restricción.
- **Trigger de re-evaluación:** si más de la mitad de las escenas nuevas terminan siendo piezas de
  HyperFrames, o si la licencia de Remotion pasa a aplicar a un proyecto de empresa, evaluar que
  HyperFrames componga también.

## Alternativas consideradas

- **Migrar el estudio a HyperFrames:** descartado; reescribe el kit, la marca y los tipos sin ganancia
  para lo que ya funciona.
- **Portar bloques a React a mano:** descartado; caro y se desactualiza con cada versión del catálogo.
- **Incrustar el HTML de HyperFrames dentro de Remotion (iframe/`<HTML>`):** descartado; los dos motores
  controlan el tiempo de forma distinta y se pierde el determinismo de ambos.
