# ADR-0011 — Estudio de video: proyectos versionables por marca y tipo

- **Estado:** Aceptado
- **Fecha:** 2026-09-24
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB.

## Contexto

En un día se produjeron tres videos de producto para una misma empresa (dos versiones de novedades y
un onboarding), cada uno como un proyecto Remotion independiente copiado del anterior. Los
componentes (marcos de navegador y teléfono, captura con resaltado y puntero, chats de WhatsApp,
mezcla con ducking) se duplicaron tres veces y los assets quedaron repartidos entre carpetas. El
usuario pide consolidarlo en un sistema versionable donde cada proyecto tenga assets, kit de marca y
tipo de video, y donde lo construido se reutilice, transforme, duplique y clone.

## Decisión

Una capa de **estudio** dentro de Plató, con cuatro conceptos:

1. **Kit** (`ts/src/estudio/kit/`): componentes genéricos que leen los tokens de la marca por contexto.
   Continúa la idea de «legos» del ADR-0009, pero para video de producto dirigido, no derivado de un spec.
2. **Marca** (`estudio/marcas/<marca>/marca.json`): colores, tipografías, logos, íconos y reglas de
   redacción. El kit no tiene colores fijos.
3. **Tipo de video** (`ts/src/estudio/tipos/<tipo>/`): catálogo de escenas con esquema de props (zod).
   Primero `presentacion-app`.
4. **Proyecto** (`estudio/proyectos/<proyecto>/`): `proyecto.json` (marca, tipo, versión, formatos),
   `guion.json` (escenas como datos), `assets.json` (manifiesto), `voz.json` y `CHANGELOG.md`.
   Una escena puede declarar `componente` para usar código propio (escape).

**Assets fuera de git con manifiesto.** Los binarios viven en `ts/public/estudio/` (ignorado); en git
va el manifiesto de cada marca o proyecto: id, ruta, sha256, dimensiones, procedencia (script, URL,
fecha, deviceScaleFactor) y `deriva` (de qué asset sale). Un asset es inmutable: retomarlo crea uno
nuevo. Clonar un proyecto copia referencias, nunca binarios.

**Versionado.** semver en `proyecto.json`, tag `estudio/<proyecto>@<versión>` por entrega y renders en
`ts/out/estudio/<proyecto>/<versión>/`.

**CLI en Node** (`ts/tools/estudio.mjs`): es dominio Remotion/TS, así que no pasa por la CLI Python
del analyzer (ADR-0004), que sigue siendo el núcleo del análisis.

## Consecuencias

- Un video nuevo parte de clonar un proyecto o de un guion con escenas del catálogo, no de copiar código.
- Reproducir una versión vieja exige tener sus binarios en la máquina; `estudio verificar` lo detecta,
  pero no los recupera. Si se vuelve un problema, el manifiesto permite sumar un almacenamiento remoto
  sin cambiar los proyectos.
- El catálogo de escenas crece con cada tipo; escenas únicas usan el escape a código.

## Alternativas consideradas

- **Repo aparte en `~/Developer/trabajo`**: duplicaba Remotion, voz y skills de Plató.
- **Git LFS**: versionaba binarios, pero sumaba una dependencia y cuota; se prefirió manifiesto + hash.
- **Proyectos como código (TSX por video)**: más libertad, pero clonar implica copiar código, que es
  justo el problema de hoy.
