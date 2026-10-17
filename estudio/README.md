# Estudio de video

Sistema para producir videos de producto como **proyectos versionables** (ADR-0011): cada
proyecto declara su **marca**, su **tipo de video** y sus **assets**, y reutiliza el kit de
componentes de Plató. Spec: `docs/specs/estudio-video.md`.

```
estudio/
  marcas/<marca>/       marca.json (colores, tipografías, logos, íconos, reglas de redacción) + assets.json
                        + contexto.md opcional (la organización: sistemas, campañas, reglas creativas, inventario)
  biblioteca/           assets.json de lo compartido entre proyectos (música, etc.)
  proyectos/<proyecto>/ proyecto.json · guion.json · assets.json · voz.json · CHANGELOG.md
  fuentes/<fuente>/     inventarios de bibliotecas externas (p. ej. un banco de stock) para elegir material
ts/public/estudio/      los binarios (FUERA de git; los describen los assets.json)
ts/src/estudio/         kit, tipos de video, esquemas y composiciones (código)
ts/tools/estudio.mjs    la CLI
ts/out/estudio/<proyecto>/<versión>/   renders
```

## Conceptos

- **Marca**: todo lo visual y de redacción de un cliente. El kit no tiene colores fijos: los
  toma de la marca. Las reglas de `redaccion` (regex) se prueban en cada proyecto de la marca.
  `identidad` (llamado, url, handle, isotipo) alimenta los componentes de `kit/identidad/`
  (firma, cierre, zócalo, tarjetas, foto viva). `restricciones` (`siAsset` + `prohibido` + `motivo`)
  prohíbe texto junto a un asset, p. ej. precios junto a un embajador; se prueba en cada proyecto.
- **Tipo de video**: un catálogo de escenas con su esquema de props (`ts/src/estudio/tipos/`).
  Hoy: `presentacion-app` (película de producto: 22 escenas). Un tipo puede traer su `fondo`.
  `comercial` (motion graphics sin capturas: saludo, llamada, canales, conversación, agenda,
  gráfica ilustrativa 0–1 sin cifras, cierre). `redes` (piezas sociales: firma, foto, pantalla, cita,
  dato, mosaico, clip, cierre; formatos vertical/retrato/horizontal; 60 fps). Próximos: capacitación
  dentro de apps.
- **Formatos**: `formatos` del tipo (por defecto horizontal y vertical). `retrato` (1080×1350) solo
  para los tipos que lo declaran (hoy `redes`); `validarFormatos` rechaza el resto. Para `useVertical`,
  `retrato` cuenta como vertical.
- **Kit de identidad** (`ts/src/estudio/kit/identidad/`): componentes agnósticos de marca que leen
  colores, tipografías, logos e `identidad` de `marca.json`.
- **Música**: por defecto su final natural coincide con el del video; con `musicaInicio` (segundos)
  entra desde ese punto (p. ej. para que un drop caiga en una escena) y se corta con un fundido largo.
  `ritmo` (`bpm`, `golpe`) deja que el tipo anime al pulso.
- **Proyecto**: `guion.json` son escenas como datos (`escena` del catálogo + `props`). Una escena
  única puede ser `"escena": "propia:<nombre>"`, registrada en `ts/src/estudio/propias/`.
- **Asset**: una ficha en un `assets.json` con id (`<espacio>/<nombre>`), sha256, dimensiones o
  duración, **procedencia** (`origen`), `deriva` (de qué sale) y, en capturas, sus **zonas** (lo que
  se resalta) y **cortes** (p. ej. dónde termina el encabezado de un chat). Las escenas nombran
  zonas, no coordenadas: las coordenadas viven una sola vez, junto a la imagen.

## Comandos (desde `ts/`)

```bash
node tools/estudio.mjs nuevo <proyecto> --marca ejemplo --tipo presentacion-app
node tools/estudio.mjs clonar onboarding <proyecto>     # copia datos; reutiliza assets y voz
node tools/estudio.mjs registrar <espacio> <archivo> <nombre> --origen fuente=... --origen dpr=4 [--deriva <id>]
node tools/estudio.mjs verificar [proyecto]                    # binarios presentes y con su sha256
node tools/estudio.mjs indexar                                 # regenera src/estudio/datos.generated.ts
node tools/estudio.mjs render <proyecto> [--4k] [--correo] [--solo horizontal|vertical|poster]
pnpm studio                                                    # composiciones <proyecto>-horizontal/-vertical/-poster
```

**60 fps**: `"fps": 60` en proyecto.json, solo para tipos con `admite60` (hoy `comercial` y `redes`), cuyas
escenas cuentan el tiempo con `useCuadro` (base de 30). Los demás tipos siguen a 30.

**Voz** (OpenAI o ElevenLabs según `voz.proveedor` en `proyecto.json`; las claves viven en variables de entorno). Con ElevenLabs, `voz.voz` es el `voice_id` y `voz.ajustes` los `voice_settings` (entran en la firma: cambiarlos regenera). ElevenLabs genera **una sola toma** de toda la narración (la entonación no arranca en frío en cada escena) y la corta por escena; guarda en voz.json las palabras con tiempos y la energía por cuadro. `direccion` en una escena antepone etiquetas de v4 (`[warm]`) sin mostrarlas. Ejemplo de ejecución con las claves cargadas en el entorno:

```bash
cd ts && node tools/estudio.mjs voz <proyecto>
```

Solo regenera las escenas cuyo texto cambió o cuya voz es heredada de un clon. Registra cada audio
y escribe `voz.json`; la duración de cada escena sale de ahí.

## Flujo de una versión nueva

1. Edita `guion.json` (o clona un proyecto parecido).
2. Si cambió la locución: `estudio voz`. Si hay capturas nuevas: `estudio registrar` (una captura
   retomada es un asset nuevo con `--deriva` apuntando al anterior).
3. `pnpm test` (esquemas, duraciones, mezcla, redacción) y revisa en `pnpm studio`.
4. Sube `version` en `proyecto.json`, anota el `CHANGELOG.md`, `estudio render`, y marca el commit
   con `git tag estudio/<proyecto>@<versión>`.

## Límites conocidos

- Las escenas con three.js renderizan con WebGL por GPU (`angle`, en `remotion.config.ts`). El
  postprocesado de `@react-three/postprocessing` (bloom) no llega a la captura con canvas transparente;
  el halo de lo 3D se aplica con CSS sobre el canvas.

- Los binarios no están en git: re-renderizar una versión vieja exige tenerlos en esta máquina.
  `verificar` lo detecta; no los recupera.
- `render` normaliza a -16 LUFS / -1,5 dBTP; `--correo` produce 1080p < 20 MB con faststart.
