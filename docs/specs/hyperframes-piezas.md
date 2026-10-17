# Piezas de HyperFrames dentro del estudio (Remotion compone, HyperFrames renderiza piezas)

**Classification**: feat · medium · med risk · unknown (render local con variables y alfa sin probar) · toca `hyperframes/`, `ts/tools/`, `ts/src/estudio/kit/`, `docs/adr/`
**Tier**: 3 — Full (por `unknown`: el spike va primero)
**Fecha**: 2026-10-17

## Goal

Usar los 455 bloques, componentes y ejemplos del catálogo de HyperFrames (transiciones, overlays,
gráficos, fondos con shaders, intros) en los videos del estudio sin reescribir nada de Remotion.
HyperFrames renderiza una pieza con los colores de la marca, la pieza queda registrada como un asset
de video más (con sha256 y procedencia, ADR-0011) y una escena de Remotion la usa como clip, con
o sin transparencia.

## Assumptions made (correct me if wrong)

- Remotion sigue siendo el único compositor; HyperFrames nunca arma un video completo del estudio.
- ✅ Spike T1: la CLI local (`hyperframes@0.8.169`) renderiza una carpeta con `index.html` sin `init`/`add`:
  `hyperframes render <dir> --variables-file f.json --strict-variables -q draft|looks|delivery --format mp4|webm|mov -o out`.
  No hay flag de alfa: sale de `--format webm|mov` + fondo transparente del bloque. Render determinista (mismo sha256).
  Se corre con `HYPERFRAMES_NO_TELEMETRY=1`.
- La CLI se fija por versión en `hyperframes/package.json` (carpeta propia, ADR-0005), no con `npx` suelto.
  pnpm 11 crea `hyperframes/pnpm-workspace.yaml` (`allowBuilds`), igual que `ts/`: se versiona.
- Los colores de la marca se pasan a las variables `color` del bloque: `accent` ← `indigo`,
  `background` ← `noche`; un `--var clave=valor` explícito gana siempre.
- La pieza se registra llamando a `node tools/estudio.mjs registrar …` como subproceso: no se
  toca `estudio.mjs` (tiene trabajo sin commitear en `completo`).
- Los assets de terceros dentro de un bloque (fuentes, imágenes, audio, modelos 3D) pueden tener
  licencia propia distinta de Apache 2.0: se guarda en `origen.licencia` lo que declare el bloque.

## Acceptance criteria

- [ ] `node tools/pieza.mjs <espacio> <bloque> <nombre> --marca <marca>` renderiza el bloque del
      catálogo y deja un asset `tipo: video` en el manifiesto del espacio, con `origen.motor=hyperframes`,
      `origen.bloque`, `origen.upstream` (commit del catálogo), `origen.variables` y `origen.licencia`.
- [ ] `--alfa` produce un webm con canal alfa que Remotion compone sobre otra capa sin fondo negro.
- [ ] Un bloque inexistente, una variable que el bloque no declara o un render fallido terminan con
      error claro y **no** dejan asset ni binario a medias.
- [ ] Repetir el mismo comando con los mismos datos no duplica el asset (inmutabilidad del manifiesto).
- [ ] Un componente del kit (`PiezaHF`) muestra la pieza en una escena, respetando la transparencia.
- [ ] ADR-0013 registra la decisión de dos motores y cuándo se usa cada uno.

## Files & routes to touch

- `hyperframes/package.json` — nuevo — fija `hyperframes` (CLI) como dependencia; scripts `render`.
- `hyperframes/README.md` — nuevo — qué es la carpeta, cómo actualizar `upstream/` (`git pull`), cómo buscar en el catálogo.
- `hyperframes/upstream/` — ya existe (clon parcial, gitignored) — solo lectura.
- `hyperframes/piezas/<espacio>/<nombre>/` — nuevo (gitignored, generado) — copia de trabajo del bloque con sus variables.
- `ts/tools/pieza.mjs` — nuevo — CLI: resolver bloque → variables (marca + `--var`) → validar contra `registry-item.json` → render → `estudio.mjs registrar`.
- `ts/tools/pieza.test.mjs` — nuevo — tests de las funciones puras.
- `ts/src/estudio/kit/PiezaHF.tsx` — nuevo — `OffthreadVideo` del asset con `transparent` cuando es alfa.
- `docs/adr/0013-dos-motores-remotion-compone-hyperframes-piezas.md` — nuevo.
- `.gitignore` — ya ignora `hyperframes/upstream/`; agregar `hyperframes/piezas/` y `hyperframes/node_modules/`.
- `docs/codemap.md` — fila nueva **después del merge** (el archivo tiene cambios sin commitear en `completo`).
- verified against code: yes — `registrar`, `tipoDeArchivo` (acepta webm/mov), `assetSchema.origen`
  (record de string/number/boolean → `variables` va serializado como string JSON), `OffthreadVideo` en `kit/identidad/VideoViva.tsx`.

## Tests

- `ts/tools/pieza.test.mjs`:
  - `variablesDeMarca(marca, declaradas)` mapea solo las variables `color` que el bloque declara (accent/background) y nada más.
  - `--var` explícito gana sobre la marca.
  - `validarVariables` rechaza una variable no declarada y lista las válidas (tipos: los valida la CLI con `--strict-variables`).
  - `resolverBloque` encuentra bloques, componentes y ejemplos; falla con mensaje claro si no existe.
  - `origenDePieza` arma `origen` con motor, bloque, upstream, variables (string JSON) y licencia.
  - `argsRender` arma `--format webm` con `--alfa`, `mp4` sin él, siempre `--strict-variables`, y nunca `--resolution` 4k con alfa.
- Render real: verificado en el spike (T1) y en el closing check con 2 bloques (uno opaco, uno alfa), no en la suite (lento, depende de Chrome).
- Cobertura: no baja; archivo nuevo con tests.

## Pre-mortem

- **Caminos**: CLI `pieza.mjs` (único). Registro manual con `estudio.mjs registrar` de un mp4 de HyperFrames: cubierto, es el mismo flujo. Render desde la app web de HyperFrames: out, no entra al estudio.
- **Fallas**: bloque con assets propios → se copia la carpeta entera (hallazgo T1). CLI de HyperFrames ausente → error con la instrucción `pnpm -C hyperframes install`. Chrome/ffmpeg ausentes → se propaga `hyperframes doctor`. Render cae a mitad → se borra la salida temporal y no se llama a `registrar` (falla cerrado). Catálogo desactualizado o bloque renombrado → error de `resolverBloque`.
- **Invariantes**: (1) no hay asset sin binario ni binario sin asset → test de que `registrar` solo corre con render exitoso; (2) un asset no cambia de contenido → lo garantiza `registrar` (sha256); (3) el bloque solo recibe variables que declara → test de `validarVariables`; (4) alfa nunca con 4k → test de `argsRender`.
- **Simetrías**: lo que se registra se puede verificar con `estudio.mjs verificar` (mismo manifiesto, mismo schema).
- **Reutilización**: `registrar`, `medir`, `tipoDeArchivo` de `estudio.mjs` (por subproceso); `OffthreadVideo` como en `VideoViva`.
- **Consumidores**: `assetSchema` (`ts/src/estudio/assets.ts`) lee `origen` → unchanged (los valores siguen siendo strings); `estudio.mjs verificar` lee el manifiesto → unchanged; `resolver.ts`/`useAsset` → unchanged (tipo `video` ya existe).
- **Datos reales**: los manifiestos ya tienen `origen` con strings y `registrado`; ningún asset trae `motor` → campo nuevo, opcional, sin migración.
- **Variantes**: `--alfa` on/off; `--calidad draft|looks|delivery`; espacio = biblioteca | marca | proyecto → los tres por `manifiestoDe`.
- **Afirmaciones**: `estudio/README.md` no se toca (cambios sin commitear); la documentación vive en `hyperframes/README.md` y ADR-0013.

## Out of scope

- Generar piezas desde un `VideoSpec` analizado (ADR-0009). Primero el estudio; el pipeline de análisis después si hace falta.
- Render en la nube de HeyGen o Lambda.
- Portar composiciones de Remotion a HyperFrames.
- Las skills de HyperFrames para agentes (se evalúan aparte).

## Technical

`pieza.mjs` es un CLI Node como `estudio.mjs`, en ESM, con funciones puras exportadas y el `switch`
solo cuando corre como CLI (mismo patrón `esCli`). Flujo:

1. `resolverBloque(nombre)` busca `hyperframes/upstream/registry/{blocks,components,examples}/<nombre>/registry-item.json`.
2. Lee la marca (`estudio/marcas/<marca>/marca.json`), calcula `variablesDeMarca` y mezcla `--var`.
3. `validarVariables` solo comprueba que cada id esté declarado (error que lista los válidos); los tipos
   (`string`, `number`, `color`, `enum`, `image`, `variant`, `toggle`…) los valida la propia CLI con `--strict-variables`, que aborta sin dejar salida.
4. Copia la **carpeta completa** del bloque (los que declaran `files` de tipo `hyperframes:asset` fallan con solo el html; el `.html` se renombra a `index.html`) a `hyperframes/piezas/<espacio>/<nombre>/` y corre la CLI fijada de HyperFrames
   con `--variables-file`, `--format`, `--quality`, `--output` a un temporal.
5. Si el render sale bien: `node tools/estudio.mjs registrar <espacio> <tmp> <nombre> --origen …`.
   Si falla: borra el temporal y sale con código ≠ 0.

`PiezaHF` recibe `asset` y opcionalmente `desde`/`velocidad`; usa `OffthreadVideo` con `transparent`
si el archivo es webm o mov.

## Spec

**Scenario: pieza opaca con colores de marca**

- GIVEN el bloque `bar-chart-race` en el catálogo y la marca `ejemplo`
- WHEN corro `pieza.mjs biblioteca bar-chart-race graficos/carrera --marca ejemplo`
- THEN queda `biblioteca/graficos/carrera` tipo `video` con `origen.motor=hyperframes` y `accent` tomado de la marca

**Scenario: pieza con alfa**

- GIVEN un bloque overlay que soporta transparencia
- WHEN agrego `--alfa`
- THEN el asset es webm y `PiezaHF` lo compone sin fondo negro

**Scenario: variable no declarada**

- GIVEN un bloque sin variable `foo`
- WHEN paso `--var foo=1`
- THEN sale con error que lista las variables válidas y no registra nada

**Scenario: render fallido**

- GIVEN la CLI de HyperFrames devuelve error
- WHEN corre `pieza.mjs`
- THEN no hay binario en `ts/public/estudio/` ni entrada nueva en el manifiesto

**Scenario: idempotencia**

- GIVEN una pieza ya registrada
- WHEN repito el comando con los mismos datos
- THEN el manifiesto queda igual (render determinista → mismo sha256)

## Exploration findings

- Catálogo: 455 items; 231 con variables; 57 variables de tipo `color` (las más comunes: `accent`, `background`); 48 items mencionan licencia.
- La CLI de nube documenta `--format mp4|webm|mov` (webm/mov con alfa) y `--variables-file`; la local está por confirmar.
- `estudio.mjs` no exporta `registrar`, y al importarlo no ejecuta comandos (`esCli`); por eso se llama como subproceso.
- `completo` tiene trabajo sin commitear en `estudio.mjs`, `proyecto.ts`, `kit/`, `marca.ts` y `codemap.md`: este cambio solo crea archivos nuevos.

## Design

Dos motores con roles fijos (ADR-0013): Remotion compone y es dueño del tiempo, la marca y el
audio; HyperFrames es un proveedor de clips. El acoplamiento es el manifiesto de assets: HyperFrames
no conoce el estudio y Remotion no conoce HyperFrames (solo ve un video). Rollback: borrar
`hyperframes/`, `pieza.mjs` y `PiezaHF.tsx`; los assets ya registrados siguen siendo videos válidos.

## Tasks

1. Spike: instalar la CLI fijada, renderizar 2 bloques en local (mp4 y webm alfa con variables) y
   confirmar en Remotion Studio que el alfa compone. Si la CLI local no acepta variables o alfa → el brief se corrige antes de seguir.
2. `pieza.mjs` + tests (TDD).
3. `PiezaHF.tsx` + escena de prueba en un proyecto descartable.
4. ADR-0013 + `hyperframes/README.md` + `.gitignore`.

## Ejecución

| #   | Tarea                     | Agente            | Modelo · esfuerzo | Archivos                                                     | Entrega                                           |
| --- | ------------------------- | ----------------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| 1   | Spike render local + alfa | ejecutor          | sonnet · medium   | `hyperframes/package.json`, `hyperframes/piezas/` (temporal) | comandos reales y su resultado, flags confirmados |
| 2   | `pieza.mjs` + tests       | ejecutor          | sonnet · medium   | `ts/tools/pieza.mjs`, `ts/tools/pieza.test.mjs`              | diff + tests verdes                               |
| 3   | `PiezaHF.tsx`             | ejecutor          | sonnet · medium   | `ts/src/estudio/kit/PiezaHF.tsx`                             | diff + typecheck verde                            |
| 4   | ADR-0013                  | orquestador       | sesión            | `docs/adr/0013-*.md`                                         | archivo                                           |
| 5   | README + gitignore        | ejecutor-mecanico | haiku · low       | `hyperframes/README.md`, `.gitignore`                        | diff                                              |

Orden: 1 → 2 → 3; 4 y 5 en paralelo con 2.

## Closing check

- Pieza opaca con marca → render real `bar-chart-race` (12 s, 1920x1080, `accent` tomado de la marca en `origen.variables`) + tests `variablesDeMarca`/`origenDePieza`.
- Pieza con alfa → render real `lt-clean-bar --alfa`: webm vp9 `ALPHA_MODE=1`, cuadro decodificado yuva420p; `PiezaHF` pasa `transparent` (prop verificada en `remotion/dist/cjs/video/props.d.ts`, 4.0.475) + test `esAlfa`.
- Variable no declarada → test `validarVariables` + real: `--var foo=1` sale con exit 1 listando las válidas.
- Render fallido → test "no registra y borra el temporal si el render falla" (`ts/tools/pieza.mjs:149-155`). **Verificado en los dos sentidos**: tragando el error y quitando el chequeo de salida, el test falla; restaurado, pasa. Igual con `esAlfa` (quitando `mov`).
- Idempotencia → render repetido da el mismo sha256 (spike) y el manifiesto no duplica (real).
- Pre-mortem: carpeta completa del bloque (`pieza.mjs:142`); falla cerrado (`:149-155`); consumidores `assetSchema`/`verificar`/`useAsset` sin cambios (origen sigue siendo strings).
- Suite: 282 pasan; 2 fallan en un test de tipo por un binario fuera de git (una fuente en `ts/public/estudio/`) que no existe en el worktree: preexistente, ajeno al cambio. `tsc --noEmit` limpio. ESLint: 0 errores, 1 warning `no-console` en el comando `buscar` (mismo patrón que `estudio.mjs`).
- Desvíos que no estaban en el brief: `--var` se tipa (number/boolean/toggle) antes de escribir el JSON; los ejemplos que ya traen `index.html` no se renombran; T5 (README + gitignore) lo hizo el orquestador en vez de un agente (dos archivos chicos).
- No verificado: la composición del alfa dentro de un render de Remotion (requiere registrar una escena en archivos con cambios sin commitear en `completo`). Pendiente para el primer uso real.
- Pendiente después del merge: fila en `docs/codemap.md`.
